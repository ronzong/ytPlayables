// Сердце игры: цикл, механики, связывание всех систем.
import { createContext } from './gl.js';
import { Renderer } from './renderer.js';
import { buildWorld, G, decor, inGate } from './world.js';
import { Forest, speciesColors, rainbowRgb } from './trees.js';
import { Player } from './player.js';
import { HelperCrew } from './helpers.js';
import { LogSwarm, LogPile } from './logs.js';
import { Chips, Coins, FloatText, project } from './fx.js';
import { Input } from './input.js';
import { audio } from './audio.js';
import { sdk } from './sdk.js';
import { ui } from './ui.js';
import { Tutorial } from './tutorial.js';
import {
  run, meta, state, val, mval, buy, buyMeta, buyBulk, canBuy, canBuyMeta, addMoney, addLog, takeLogs, bulkCost,
  bagCapacity, bagFull, maxRadius, gateRadius, atLastRing, ringSpecies, nextForestIndex,
  nextForestCost, openNextForest, deepestForest, deserialize, pushSave, priceMult,
  chopRadius, moveSpeed, chopPower, helperCount, helperIncomeMult, machineTier, treeDensity, pendingAcorns, canPrestige,
  doPrestige, resetRun, acornProgress, forestGateOk, ringChopTime, isStuck, retreatForest,
  playerAgeHours, axeLevelsToGate, grantAxeToGate, haulBonusActive, gateOfferCanDeliver,
  quietPeriodOver as quietPeriodOverState,
} from './state.js';
import { flags, initFlags } from './flags.js';
import { metrics } from './metrics.js';
import { debug } from './debug.js';
import { RINGS, RING_COUNT, WORLD, AD, GATE, PRESTIGE, MACHINE, UPGRADE_BY_ID, speciesName, speciesAt } from './config.js';
import { m4, clamp, damp, TAU } from './math.js';
import { resetPool } from './rig.js';
import { fmtMoney } from './format.js';
import { t } from './i18n.js';

const PILE = { x: 3.0, y: 0.6, z: 0 };
const SELL_R = 9.4;
const mat = m4.create();
const WHITE = [1, 1, 1, 0];

export class Game {
  constructor(canvas, sawmillModel = null, machineModels = {}) {
    this.canvas = canvas;
    this.gl = createContext(canvas);
    if (!this.gl) throw new Error('no-webgl2');

    this.rd = new Renderer(this.gl, { shadowSize: 2048 });
    buildWorld(this.gl, sawmillModel, machineModels);

    this.forest = new Forest(1, 0);
    this.player = new Player();
    this.crew = new HelperCrew();
    this.swarm = new LogSwarm();
    this.pile = new LogPile(PILE.x, PILE.z, 0.34);
    this.chips = new Chips();
    this.coins = new Coins();
    this.float = new FloatText(document.getElementById('world-layer'));
    this.input = new Input(canvas, document.getElementById('joy'));
    this.tutorial = new Tutorial();

    this.cam = { x: 0, z: 14.5, dist: 30 };
    this.tmp = [];
    this.sellAcc = 0;
    this.chopSfx = 0;
    this.saveT = 0;
    this.lbT = 0;
    this.paused = false;
    this.shake = 0;
    this.shakeCd = 0;
    this.lastDt = 0.016;
    this.treesChopped = 0;
    this.upgradesBought = 0;
    this.moved = 0;
    this.lastBonusAt = -1e9;
    this.lastFreeLevelAt = -1e9;
    this.forestFlash = 0;
    this.preRun = false;
    this.rush = null;
    this.rushOffer = null;
    this.nextRushOfferAt = AD.rainbowFirstDelay;
    this.dailyPending = false;
    this.gateBlockedFor = 0;     // сколько секунд стоим перед закрытыми воротами
    this.gateReported = false;   // застревание у ворот уже записали в метрику
    this.lastGateAdAt = -1e9;
    this.gateAdVariant = null;   // какой вариант оффера проверяем у этих ворот
    this.lastFullBagWarningAt = -1e9;
    this.pendingInterstitial = null;  // фулскрин разрешён, ждём естественную паузу
    this.lastHaulAt = -1e9;
    this.forestOpenedAt = -1e9;
    this.offer = null;           // текущий контекстный оффер на главной кнопке
    this.lastDailyPrompt = -1e9;
    this.income = [];        // окно последних поступлений: [время, сумма]
    this.helperIncome = [];
    this.fpsAcc = 0; this.fpsN = 0; this.qualityChecked = 0;

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.viewportObserver = new ResizeObserver(() => this.resize());
    this.viewportObserver.observe(canvas);
    document.addEventListener('fullscreenchange', () => this.resize());
    window.visualViewport?.addEventListener('resize', () => this.resize());
    window.addEventListener('orientationchange', () => window.__ytGameTimers.setTimeout(() => this.resize(), 250));

    sdk.onAdStart = () => {
      audio.mute(true);
      this.syncGameplayState();
    };
    sdk.onAdEnd = () => {
      this.last = performance.now();
      this.syncGameplayState();
    };

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { pushSave(true); audio.mute(true); this.syncGameplayState(); }
      else {
        this.last = performance.now();
        this.syncGameplayState();
      }
    });
    window.addEventListener('pagehide', () => { metrics.endSession('pagehide'); pushSave(true); });
    window.addEventListener('blur', () => { this.focusLost = true; pushSave(true); this.syncGameplayState(); });
    window.addEventListener('focus', () => { this.focusLost = false; this.last = performance.now(); this.syncGameplayState(); });
    sdk.ysdk?.on?.('game_api_pause', () => { this.platformPaused = true; this.syncGameplayState(); });
    sdk.ysdk?.on?.('game_api_resume', () => { this.platformPaused = false; this.last = performance.now(); this.syncGameplayState(); });
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, this.lowSpec ? 1.2 : 2);
    const rect = this.canvas.getBoundingClientRect();
    this.cssWidth = Math.max(1, rect.width);
    this.cssHeight = Math.max(1, rect.height);
    this.w = Math.max(1, Math.floor(this.cssWidth * dpr));
    this.h = Math.max(1, Math.floor(this.cssHeight * dpr));
    if (this.canvas.width !== this.w) this.canvas.width = this.w;
    if (this.canvas.height !== this.h) this.canvas.height = this.h;
    this.aspect = this.w / this.h;
  }

  applySave(data) {
    const res = deserialize(data);
    audio.setEnabled(meta.soundOn, meta.volume);
    ui.setSoundIcon(meta.soundOn);
    this.rebuildForest();
    this.crew.sync(helperCount());
    this.restoreRush();
    this.tutorial.restore(meta.tutorial);
    this.preRun = meta.preparingRun;
    this.paused = this.preRun;
    if (this.preRun) queueMicrotask(() => ui.showPreRun(0));
    this.dailyPending = this.dailyDue();
    return res;
  }

  rebuildForest() {
    this.forest.generate(treeDensity(), run.scroll);
    this.crew.list.forEach((h) => { h.target = null; h.mode = 'seek'; });
  }

  start() {
    this.last = performance.now();
    const loop = (now) => {
      requestAnimationFrame(loop);
      const raw = (now - this.last) / 1000;
      const dt = Math.min(raw, 0.05);
      this.last = now;
      this.checkQuality(raw);
      if (!this.paused) this.update(dt);
      // Магазин и модальные окна замораживают симуляцию, но обучение должно
      // продолжать проверять интерфейсные действия. Иначе шаг «открой
      // магазин» никогда не подтверждается: открытие магазина сразу ставит
      // игру на паузу, а Tutorial.update раньше вызывался только из update().
      else this.tutorial.update(0, this);
      this.render();
    };
    requestAnimationFrame(loop);
    this.syncGameplayState();
  }

  // Единая разметка активного геймплея для платформы. Магазин и любые
  // модальные окна действительно замораживают симуляцию, а не только ввод.
  syncGameplayState() {
    const blocked = this.preRun || this._startingRun || this._interstitialPending || sdk.adPaused ||
      document.hidden || this.focusLost || this.platformPaused || ui.shopOpen || ui.modalOpen();
    this.paused = blocked;
    this.input.enabled = !blocked;
    if (blocked) this.input.reset();
    audio.mute(!!(sdk.adPaused || document.hidden || this.focusLost || this.platformPaused));
    if (blocked) sdk.gameplayStop(); else sdk.gameplayStart();
  }

  checkQuality(raw) {
    if (this.qualityChecked > 1 || raw <= 0 || raw > 0.5) return;
    this.fpsAcc += raw; this.fpsN++;
    if (this.fpsAcc < 4) return;
    const fps = this.fpsN / this.fpsAcc;
    this.fpsAcc = 0; this.fpsN = 0;
    if (fps < 38) {
      this.qualityChecked++;
      if (this.qualityChecked === 1) this.rd.setQuality(1024);
      else { this.lowSpec = true; this.resize(); }
    } else this.qualityChecked = 2;
  }

  // ================= ЛОГИКА =================
  update(dt) {
    this.lastDt = dt;
    run.playTime += dt;
    state.sessionTime += dt;
    const p = this.player;

    const before = { x: p.x, z: p.z };
    const dir = this.input.read();
    p.update(dt, dir, this.activeMoveSpeed(), maxRadius());
    this.moved += Math.hypot(p.x - before.x, p.z - before.z);

    this.updateChopping(dt);
    this.updateSelling(dt);
    this.updateGate(dt);
    if (!this.rush) this.updateHelpers(dt);

    this.fellBudget = 90;      // столько летящих брёвен рисуем за кадр
    this.forest.update(dt, (tree) => this.onTreeFell(tree));
    this.swarm.update(dt);
    this.pile.update(dt);
    this.chips.update(dt);
    this.coins.update(dt);
    this.trimIncome();
    this.updateRainbowOffer();
    this.updateRainbowRush();
    this.maybeShowDaily();

    this.shakeCd -= dt;
    this.shake = Math.max(0, this.shake - dt * 1.1);
    if (this.forestFlash > 0) this.forestFlash -= dt;

    const lead = 0.14;
    this.cam.x = damp(this.cam.x, p.x + p.vx * lead, 6, dt);
    this.cam.z = damp(this.cam.z, p.z + p.vz * lead, 6, dt);

    this.saveT += dt;
    if (this.saveT > 12 && state.dirty) { this.saveT = 0; pushSave(); }
    this.lbT += dt;
    if (this.lbT > 45) { this.lbT = 0; sdk.submitScore(meta.lifetimeEarned + run.totalEarned); }

    this.checkStuck();
    debug.update(dt, this);
    this.tutorial.update(dt, this);
    ui.updateHud(this);
    ui.tickHint(dt);
    if (ui.shopOpen) ui.refreshShop();

    // Полоса у закрытых ворот: сначала показываем магазин, ролик появляется
    // только если игрок реально застрял, и только один раз на лес.
    const gateMode = this.gateOfferAvailable() ? this.effectiveGateMode() : null;
    const gateOfferId = gateMode ? 'gate:' + gateMode : null;
    ui.setGateBar(this.gateBlocked && this.gateBlockedFor > AD.gateOfferDelay, this.gateBlockedFor,
      gateMode ? this.gateOfferLabel(gateMode) : null,
      axeLevelsToGate(), this.gateAdCooldownSeconds());
    if (gateOfferId && gateOfferId !== this._shownGateOffer) metrics.offerShown(gateOfferId);
    this._shownGateOffer = gateOfferId;

    this.offer = this.resolveOffer();
    const oid = this.offer === 'rainbow' ? 'rainbow' : (this.offer ? this.offer.id : null);
    if (oid && oid !== this._shownOffer) metrics.offerShown(oid);
    this._shownOffer = oid;
    if (this.offer === 'rainbow') ui.setAdOffer(this.rushOffer, meta.rainbowTickets);
    else ui.setContextOffer(this.offer);
    ui.updateRush(this.rush);

    // Ролик у ворот отработал, а стена всё ещё стоит — это тот самый случай,
    // который игрок воспринимает как обман. Записываем как проигрыш варианта.
    if (this.gateAdVariant && state.sessionTime - this.lastGateAdAt > 120) {
      metrics.gateResolved(this.gateAdVariant, 120, false, deepestForest());
      this.gateAdVariant = null;
    }
  }

  // ---------- Доход ----------
  noteIncome(v, fromHelper) {
    this.income.push([run.playTime, v]);
    if (fromHelper) this.helperIncome.push([run.playTime, v]);
  }

  trimIncome() {
    const cut = run.playTime - 25;
    while (this.income.length && this.income[0][0] < cut) this.income.shift();
    while (this.helperIncome.length && this.helperIncome[0][0] < cut) this.helperIncome.shift();
  }

  // Считаем по окну заново — так не накапливается ошибка на больших числах
  _windowRate(arr) {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) sum += arr[i][1];
    return sum / Math.min(25, Math.max(5, run.playTime));
  }

  incomePerSec() {
    const w = this._windowRate(this.income);
    const avg = run.totalEarned / Math.max(60, run.playTime);
    return Math.max(w, avg * 0.6);
  }

  helperPerSec() { return this._windowRate(this.helperIncome); }

  sessionTime() { return state.sessionTime; }

  rushConfig(mult = 2) {
    if (mult >= 5) return { mult: 5, power: 12, radius: 34, speed: 2.15, systems: t('rushSystem5') };
    if (mult >= 3) return { mult: 3, power: 7, radius: 24, speed: 1.75, systems: t('rushSystem3') };
    return { mult: 2, power: 4, radius: 18, speed: 1.45, systems: t('rushSystem2') };
  }

  activeChopRadius() {
    if (!this.rush) return chopRadius();
    return Math.max(chopRadius(), this.rush.cfg.radius);
  }

  activeMoveSpeed() { return moveSpeed() * (this.rush ? this.rush.cfg.speed : 1); }
  activeChopPower() { return chopPower() * (this.rush ? this.rush.cfg.power : 1); }

  // ---------- Рубка ----------
  updateChopping(dt) {
    const p = this.player;
    const R = this.activeChopRadius();
    const maxRing = run.rings - 1;
    this.forest.query(p.x, p.z, R, this.tmp);
    let chopping = false;
    const full = !this.rush && bagFull();
    const power = this.activeChopPower();

    for (const tree of this.tmp) {
      if (tree.ring > maxRing || full) continue;
      chopping = true;
      tree.claimed = null;
      this.forest.chop(tree, power * dt, p.x, p.z);
    }

    p.chopping = chopping;
    if (chopping) {
      this.chopSfx -= dt;
      if (this.chopSfx <= 0) {
        this.chopSfx = 0.16;
        audio.chop();
        const tree = this.tmp[0];
        if (tree) {
          const c = speciesColors(tree.sp);
          this.chips.burst(tree.x, 1.1, tree.z, [c.log[0], c.log[1], c.log[2], 0], 4, 0.8);
        }
      }
    }
    if (full && this.tmp.length > 0 && run.playTime - this.lastFullBagWarningAt >= 2.8) {
      this.lastFullBagWarningAt = run.playTime;
      audio.full();
      if (this.tutorial.done) ui.showHint(t('bagFull') + ' ' + t('hint_sell'), 2.0);
    }
  }

  addShake(x, z) {
    if (this.shakeCd > 0) return;
    this.shakeCd = 0.22;
    const d = Math.hypot(x - this.player.x, z - this.player.z);
    const near = Math.max(0, 1 - d / 26);
    this.shake = Math.min(0.3, this.shake + 0.16 * near);
  }

  onTreeFell(tree) {
    const sp = tree.sp;
    const c = speciesColors(sp);
    const col = this.rush && !tree.claimed
      ? [...rainbowRgb(tree.x, tree.z, run.playTime, 0.25), 0.7]
      : c.logCol;
    const claimer = tree.claimed;
    audio.treeFall();
    this.chips.burst(tree.x, 0.9, tree.z, col, 9, 1.3);
    this.addShake(tree.x, tree.z);
    this.treesChopped++;

    if (claimer) {
      const nv = Math.max(0, Math.min(sp.logs, 8, this.fellBudget | 0));
      this.fellBudget -= nv;
      if (nv === 0) {
        claimer.carry += sp.logs;
        claimer.carryValue = (claimer.carryValue || 0) + sp.value * sp.logs;
        return;
      }
      claimer.pendingLogs = (claimer.pendingLogs || 0) + nv;
      for (let i = 0; i < nv; i++) {
        // Одно видимое бревно представляет пачку реальных брёвен позднего леса.
        const bundle = Math.floor(sp.logs / nv) + (i < sp.logs % nv ? 1 : 0);
        this.swarm.spawn(tree.x, 1.2, tree.z, col, claimer, () => {
          claimer.pendingLogs = Math.max(0, (claimer.pendingLogs || 0) - 1);
          claimer.carry += bundle;
          claimer.carryValue = (claimer.carryValue || 0) + sp.value * bundle;
        }, true, 0.85);
      }
      return;
    }

    // В радужном заезде мега-харвестер сразу продаёт древесину,
    // а каждое дерево выбрасывает часть заранее показанной награды.
    if (this.rush) {
      const baseGain = sp.value * sp.logs * priceMult();
      addMoney(baseGain);
      this.noteIncome(baseGain, false);
      const bonus = Math.min(this.rush.target - this.rush.paid, this.rush.target / 20);
      if (bonus > 0) { addMoney(bonus); this.rush.paid += bonus; if (run.rush) run.rush.paid = this.rush.paid; }
      this.coins.burst(tree.x, 1.2, tree.z, 8);
      this.float.spawn(tree.x, 2.3, tree.z, '+' + fmtMoney(baseGain + bonus), 'big');
      audio.coin();
      return;
    }

    const p = this.player;
    const visual = Math.max(0, Math.min(sp.logs, 14, this.fellBudget | 0));
    this.fellBudget -= visual;
    for (let i = 0; i < visual; i++) {
      this.swarm.spawn(tree.x, 1.2, tree.z, col, p, () => {
        if (addLog(sp.index, 1) > 0) audio.pickup();
      });
    }
    const rest = sp.logs - visual;
    if (rest > 0) addLog(sp.index, rest);
    // Каждое дерево показывает собственную добычу. Пул DOM-чисел достаточно
    // большой для позднего радиуса и не теряет пачку после долгой сессии.
    this.float.spawn(tree.x, 2.2, tree.z, '+' + sp.logs, 'wood log-count');
  }

  // ---------- Сдача ----------
  updateSelling(dt) {
    const p = this.player;
    if (Math.hypot(p.x, p.z) >= SELL_R || run.carryCount === 0) { this.sellAcc = 0; return; }

    this.sellAcc += val('unload') * dt;
    const n = Math.floor(this.sellAcc);
    if (n < 1) return;
    this.sellAcc -= n;

    const wasFull = run.carryCount >= bagCapacity() - 0.5;
    const groups = takeLogs(n);
    // Донёс полный рюкзак сам — только после этого имеет смысл предлагать
    // мгновенную сдачу за ролик. Иначе оффер обесценивает вместимость.
    if (wasFull && run.carryCount === 0 && meta.manualHauls < 99) { meta.manualHauls++; state.dirty = true; }
    let gain = 0;
    const mult = priceMult();
    let visuals = 0;
    for (const g of groups) {
      const sp = speciesAt(g.idx);
      gain += sp.value * g.n * mult;
      const col = speciesColors(sp).logCol;
      const show = Math.min(g.n, 5);
      for (let i = 0; i < show; i++) {
        if (visuals++ > 8) break;
        this.swarm.spawn(p.x, 1.4, p.z, col, PILE, () => {
          this.pile.add(col);
          this.coins.burst(PILE.x, 1.1, PILE.z, 2);
          audio.coin();
        }, false);
      }
    }
    if (gain > 0) {
      addMoney(gain);
      this.noteIncome(gain, false);
      this.pendingGain = (this.pendingGain || 0) + gain;
      this.gainT = (this.gainT || 0) + dt;
    }
    if ((this.pendingGain || 0) > 0 && (this.gainT || 0) > 0.28) {
      this.float.spawn(PILE.x, 2.0, PILE.z, '+' + fmtMoney(this.pendingGain), '');
      this.pendingGain = 0; this.gainT = 0;
    }
    // Рюкзак пуст, игрок стоит на пилораме — самая спокойная точка в цикле.
    if (run.carryCount === 0 && this.pendingInterstitial) this.flushInterstitial('base');
  }

  // ---------- Ворота нового леса ----------
  gatePos() {
    const r = gateRadius() - 2.4;
    return { x: Math.cos(WORLD.gateAngle) * r, z: Math.sin(WORLD.gateAngle) * r };
  }

  updateGate(dt) {
    const gp = this.gatePos();
    this.gateActive = false;
    this.gateBlocked = !forestGateOk();
    if (!this.gateBlocked) { this.gateBlockedFor = 0; this.gateReported = false; }
    const p = this.player;
    const near = Math.hypot(p.x - gp.x, p.z - gp.z) <= 12.0;
    // Считаем именно «стоит перед стеной», а не «где-то в лесу с плохим топором»:
    // это та доля игроков, которую надо мерить отдельно.
    if (this.gateBlocked && near) {
      this.gateBlockedFor += dt;
      if (!this.gateReported && this.gateBlockedFor > AD.gateStuckSeconds) {
        this.gateReported = true;
        metrics.gateStuck(this.gateBlockedFor, deepestForest());
      }
    }
    if (Math.hypot(p.x - gp.x, p.z - gp.z) > 3.0) return;
    this.gateActive = !this.gateBlocked;
    if (this.gateBlocked) {
      if (run.playTime - (this.gateWarnT || 0) > 6) {
        this.gateWarnT = run.playTime;
        ui.showHint(t('gateWeak'), 3.5);
        audio.deny();
      }
      return;
    }
    if (run.money <= 0) return;

    const cost = nextForestCost();
    const need = cost - run.gateProgress;
    const pay = Math.min(run.money, Math.max(cost / 2.2, 8) * dt, need);
    if (pay <= 0) return;
    run.money -= pay;
    run.gateProgress += pay;
    state.dirty = true;
    this.coins.burst(gp.x, 0.8, gp.z, 1);
    audio.coin();

    if (run.gateProgress >= cost - 0.5) this.openForest();
  }

  openForest() {
    const wasScroll = atLastRing();
    const idx = nextForestIndex();
    openNextForest();
    if (wasScroll) this.forest.rescroll(run.scroll);
    this.forestFlash = 1.4;
    audio.unlock();
    ui.showHint(t('forestOpened') + ' ' + speciesName(idx), 4);
    const gp = this.gatePos();
    for (let i = 0; i < 5; i++) this.coins.burst(gp.x, 1.2, gp.z, 6);
    pushSave(true);

    // Темп прохождения леса — отдельно для забегов с рекламой и без.
    // Если ветка с рекламой уезжает вперёд слишком сильно, значит ролик
    // стал сильнее обычной экономики и награду надо резать.
    metrics.forestUnlocked(run.playTime - run.forestStartedAt, run.adsThisForest > 0, deepestForest());
    run.forestStartedAt = run.playTime;
    run.adsThisForest = 0;
    this.forestOpenedAt = state.sessionTime;
    this.gateBlockedFor = 0;
    this.gateReported = false;
    // Ворота открыты в течение 120 секунд после ролика — главный показатель
    // того, что оффер у ворот честный, а не просто продал ролик.
    if (this.gateAdVariant) {
      metrics.gateResolved(this.gateAdVariant, state.sessionTime - this.lastGateAdAt,
        state.sessionTime - this.lastGateAdAt <= 120, deepestForest());
      this.gateAdVariant = null;
    }
    this.allowInterstitial('forest');
  }

  // Если лес всё-таки оказался не по зубам — предлагаем отступить, а не сидеть в софтлоке
  checkStuck() {
    if (this._stuckShown || !isStuck()) return;
    this._stuckShown = true;
    ui.modal(t('stuckTitle'),
      `<div style="opacity:.85;font-weight:800">${t('stuckText')}</div>` +
      `<div class="bigmoney">🪓 ${Math.round(ringChopTime(0))} ${t('unit_sec')}</div>`,
      [
        { label: t('retreat'), cls: 'gold', fn: () => { retreatForest(); this.forest.rescroll(run.scroll); this._stuckShown = false; ui.closeModal(); pushSave(true); } },
        { label: t('prestige'), fn: () => { ui.closeModal(); this.askPrestige(); } },
      ]);
  }

  // ---------- Помощники ----------
  updateHelpers(dt) {
    this.crew.sync(helperCount());
    if (!this.crew.list.length) return;
    const speedMult = val('helperSpeed');
    const foreman = mval('foreman');
    const machBonus = 1 + machineTier() * 0.03;
    const ctx = {
      speed: (6.4 + run.upg.speed * 0.22) * speedMult * machBonus * Math.sqrt(foreman),
      // «Прыть» теперь честно ускоряет маршрут, а не умножает и бег, и урон на ×9.8.
      // Поздний рост мощности возвращает только мета-бонус «Бригадир».
      power: chopPower() * 0.18 * Math.sqrt(foreman),
      // Помощник сдаёт примерно раз в четыре дерева. Его маршрут не раздувается
      // вместе с огромным поздним рюкзаком игрока.
      bag: Math.max(12, ringSpecies(run.rings - 1).logs * 4),
      findTree: (h) => this.findFreeTree(h),
      chop: (tree, dmg, h) => {
        tree.claimed = h;
        this.forest.chop(tree, dmg, h.x, h.z);
        if (Math.random() < dt * 6) {
          const c = speciesColors(tree.sp);
          this.chips.burst(tree.x, 1.0, tree.z, [c.log[0], c.log[1], c.log[2], 0], 2, 0.6);
        }
      },
      deliver: (h) => {
        const gain = (h.carryValue || 0) * priceMult() * helperIncomeMult();
        if (gain > 0) {
          addMoney(gain, true);
          this.noteIncome(gain, true);
          this.float.spawn(PILE.x, 2.4, PILE.z, '+' + fmtMoney(gain), '');
          const col = speciesColors(ringSpecies(Math.min(run.rings - 1, RING_COUNT - 1))).logCol;
          for (let i = 0; i < Math.min(h.carry, 5); i++) {
            this.swarm.spawn(h.x, 1.3, h.z, col, PILE, () => {
              this.pile.add(col); this.coins.burst(PILE.x, 1.1, PILE.z, 1);
            }, false, 0.85);
          }
          audio.coin();
        }
        h.carry = 0; h.carryValue = 0;
      },
    };
    this.crew.update(dt, ctx);
    run.helperTime += dt;
  }

  // Помощники не лезут туда, где рубит игрок — иначе их работы не видно
  findFreeTree(h) {
    const trees = this.forest.trees;
    const px = this.player.x, pz = this.player.z;
    const keepOut = this.activeChopRadius() + 7;
    for (let pass = 0; pass < 2; pass++) {
      for (let ring = run.rings - 1; ring >= 0; ring--) {
        let best = null, bd = Infinity;
        for (let i = 0; i < trees.length; i++) {
          const tr = trees[i];
          if (tr.ring !== ring || tr.state !== 'alive') continue;
          if (tr.claimed && tr.claimed !== h) continue;
          if (pass === 0 && Math.hypot(tr.x - px, tr.z - pz) < keepOut) continue;
          const d = (tr.x - h.x) ** 2 + (tr.z - h.z) ** 2;
          if (d < bd) { bd = d; best = tr; }
        }
        if (best) return best;
      }
    }
    return null;
  }

  // ================= РЕНДЕР =================
  render() {
    resetPool();
    const rd = this.rd;
    rd.begin();
    const p = this.player;

    const zoom = clamp(this.activeChopRadius() / 5.2, 1, 2.4);
    const halfW = 8.4 * zoom, halfH = 10.8 * zoom, fov = 44 * Math.PI / 180;
    const tf = Math.tan(fov / 2);
    const want = clamp(Math.max(halfH / tf, halfW / (tf * Math.max(this.aspect, 0.3))), 19, 100);
    this.cam.dist = damp(this.cam.dist, want, 3, this.lastDt);
    const pitch = 0.96;
    const ey = Math.sin(pitch) * this.cam.dist, ez = Math.cos(pitch) * this.cam.dist;

    // Тряска: медленные затухающие синусоиды, слабее по мере отдаления камеры
    const amp = this.shake * this.shake * 2.2 / Math.max(1, this.cam.dist / 30);
    const tt = run.playTime;
    const sx = Math.sin(tt * 21.0) * amp;
    const sy = Math.sin(tt * 14.7 + 1.3) * amp * 0.6;
    rd.setCamera([this.cam.x + sx, ey + sy, this.cam.z + ez], [this.cam.x + sx, 1.2, this.cam.z], fov, this.aspect, 1, 280);
    rd.setLight(p.x, p.z, clamp(this.cam.dist * 0.95, 26, 80));

    // Вода, площадь, берег
    m4.compose(mat, 0, -1.6, 0, 0, 0, 0, 1, 1, 1);
    rd.push(G.water, mat, [1, 1, 1, 0.25]);
    m4.identity(mat);
    rd.push(G.groundPlaza, mat, WHITE);
    rd.push(G.groundShore, mat, WHITE);
    rd.push(G.sawmill, mat, WHITE);

    // Кольца леса: цвет земли берётся из породы, закрытые — приглушены
    const flash = this.forestFlash > 0 ? 1 + this.forestFlash * 0.6 : 1;
    for (let i = 0; i < RING_COUNT; i++) {
      const sp = ringSpecies(i);
       const g = this.rush ? rainbowRgb(i + 1, i * 7, run.playTime, i * 0.13) : speciesColors(sp).ground;
      const k = i < run.rings ? flash : 0.74;
      m4.identity(mat);
      rd.push(G.ringGround[i], mat, [g[0] * k, g[1] * k, g[2] * k, 0]);
    }

    const vr = 78 + this.cam.dist, vr2 = vr * vr;
    for (const d of decor) {
      const dx = d.x - this.cam.x, dz = d.z - this.cam.z;
      if (dx * dx + dz * dz > vr2) continue;
      m4.compose(mat, d.x, d.y, d.z, 0, d.ry, 0, d.sx, d.sy, d.sz);
      rd.push(d.geo, mat, d.col);
    }

    this.drawFence(rd);
    this.drawRoad(rd);
    this.forest.draw(rd, this.cam.x, this.cam.z, vr, run.rings - 1, this.rush ? 1 : 0, run.playTime);

    // Кольцо радиуса рубки
    const R = this.activeChopRadius();
    m4.compose(mat, p.x, 0.16, p.z, 0, 0, 0, R, 1, R);
    rd.push(G.ring, mat, [0.55, 1.0, 0.45, 0.75]);

    const ratio = run.carryCount / Math.max(1, bagCapacity());
    const cv = run.carryCount > 0 ? clamp(Math.ceil(ratio * 21), 1, 21) : 0;
    p.draw(rd, cv, this.carryColor(), this.rush ? 4 : machineTier());
    this.crew.draw(rd, this.carryColor(), machineTier());

    this.pile.draw(rd);
    this.swarm.draw(rd);
    this.chips.draw(rd);
    this.coins.draw(rd);
    this.tutorial.draw(rd, this);

    rd.render(this.w, this.h);

    const vw = this.cssWidth, vh = this.cssHeight;
    this.float.update(this.lastDt, rd.viewProj, vw, vh);
    this.drawLabels(rd, vw, vh);
  }

  carryColor() {
    let best = -1;
    for (const k in run.carry) if (run.carry[k] > 0 && +k > best) best = +k;
    return speciesColors(speciesAt(best < 0 ? run.scroll : best)).logCol;
  }

  // Дорога до лесопилки: полоса + бегущие шевроны, ширина растёт с грузом
  drawRoad(rd) {
    const p = this.player;
    const d = Math.hypot(p.x, p.z);
    const ratio = run.carryCount / Math.max(1, bagCapacity());
    const want = run.carryCount > 0 ? clamp(0.35 + ratio * 0.85, 0.35, 1.2) : 0;
    this.roadW = damp(this.roadW || 0, want, 5, this.lastDt);
    if (this.roadW < 0.05 || d < SELL_R + 1.5) return;

    const ang = Math.atan2(-p.x, -p.z);          // направление на центр
    const from = 2.2, to = d - SELL_R + 1.0;
    if (to <= from) return;

    // Полоса
    const segLen = to - from;
    m4.compose(mat, p.x + (-p.x / d) * from, 0.09, p.z + (-p.z / d) * from,
      0, ang, 0, this.roadW * 2.6, 1, segLen);
    rd.push(G.roadSeg, mat, [0.92, 0.78, 0.42, 0.55]);

    // Шевроны
    const step = 3.4;
    const off = (run.playTime * 7) % step;
    for (let s = from + off; s < to - 0.6; s += step) {
      const x = p.x + (-p.x / d) * s, z = p.z + (-p.z / d) * s;
      const k = clamp((s - from) / 3, 0.3, 1) * this.roadW;
      m4.compose(mat, x, 0.13, z, 0, ang, 0, k * 1.9, 1, k * 1.9);
      rd.push(G.chevron, mat, [1.0, 0.95, 0.45, 0.9]);
    }
  }

  drawFence(rd) {
    const R = gateRadius();
    const count = Math.max(20, Math.round((TAU * R) / 3.0));
    for (let i = 0; i < count; i++) {
      const a0 = (i / count) * TAU, a1 = ((i + 1) / count) * TAU;
      if (inGate(a0) && inGate(a1)) continue;
      const x0 = Math.cos(a0) * R, z0 = Math.sin(a0) * R;
      const dx = this.cam.x - x0, dz = this.cam.z - z0;
      if (dx * dx + dz * dz > 100 * 100) continue;
      m4.compose(mat, x0, 0, z0, 0, a0, 0, 1, 1, 1);
      rd.push(G.post, mat, WHITE);
      if (inGate(a0) || inGate(a1)) continue;
      const x1 = Math.cos(a1) * R, z1 = Math.sin(a1) * R;
      const len = Math.hypot(x1 - x0, z1 - z0);
      m4.compose(mat, (x0 + x1) / 2, 0, (z0 + z1) / 2, 0, Math.atan2(-(z1 - z0), x1 - x0), 0, len, 1, 1);
      rd.push(G.rail, mat, WHITE);
    }
    const gp = this.gatePos();
    const pulse = 1 + Math.sin(run.playTime * 3) * 0.04;
    m4.compose(mat, gp.x, 0.06, gp.z, 0, 0, 0, 2.8 * pulse, 1, 2.8 * pulse);
    rd.push(G.disc, mat, this.gateActive ? [1.0, 0.86, 0.3, 0.85] : [0.95, 0.75, 0.35, 0.5]);
  }

  drawLabels(rd, vw, vh) {
    const p = this.player;
    const head = project(p.x, 5, p.z, rd.viewProj, vw, vh);
    const foot = project(p.x, 0, p.z, rd.viewProj, vw, vh);
    ui.labelBounds = head && foot ? [{left: head.x - 36, right: head.x + 36,
      top: Math.min(head.y, foot.y) - 12, bottom: Math.max(head.y, foot.y) + 16}] : [];
    const canvasRect = this.canvas.getBoundingClientRect();
    for (const el of document.querySelectorAll('#top .pill, .top-right, #tut, #btn-shop, #btn-ad, #gatebar, #boost, #rainbow, #hint.show')) {
      if (!el.getClientRects().length || getComputedStyle(el).visibility === 'hidden') continue;
      const r = el.getBoundingClientRect();
      ui.labelBounds.push({left:r.left-canvasRect.left-5,right:r.right-canvasRect.left+5,
        top:r.top-canvasRect.top-5,bottom:r.bottom-canvasRect.top+5});
    }
    const near = Math.hypot(p.x, p.z) < 30;
    const sp = project(PILE.x, 3.4, PILE.z, rd.viewProj, vw, vh);
    if (near && sp) {
      ui.sellLabel.querySelector('.sub').textContent = t('sell');
    }
    ui.placeLabel(ui.sellLabel, sp, near);

    const gp = this.gatePos();
    const dd = Math.hypot(p.x - gp.x, p.z - gp.z);
    const vis = dd < 38;
    const lp = project(gp.x, 3.4, gp.z, rd.viewProj, vw, vh);
    if (vis && lp) {
      const cost = nextForestCost();
      ui.gateLabel.querySelector('.sub').textContent =
        t('forest') + ' ' + (deepestForest() + 1) + ' · ' + speciesName(nextForestIndex());
      if (this.gateBlocked) {
        ui.gateLabel.querySelector('.big').textContent = '🪓 ' + ringChopTime(0).toFixed(1) + ' ' + t('unit_sec');
        ui.gateLabel.querySelector('.pbar i').style.width = '0%';
        ui.gateLabel.classList.add('blocked');
      } else {
        ui.gateLabel.querySelector('.big').textContent = '💰 ' + fmtMoney(Math.max(0, cost - run.gateProgress));
        ui.gateLabel.querySelector('.pbar i').style.width = ((run.gateProgress / cost) * 100).toFixed(1) + '%';
        ui.gateLabel.classList.remove('blocked');
      }
    }
    ui.placeLabel(ui.gateLabel, lp, vis);
  }

  // ================= ДЕЙСТВИЯ =================
  tryBuy(id, mult) {
    audio.resume();
    const n = mult === undefined ? ui.buyMult : mult;
    const got = n === 1 ? (canBuy(id) ? (buy(id), 1) : 0) : buyBulk(id, n);
    if (!got) { audio.deny(); return; }
    this.upgradesBought += got;
    audio.buy();
    if (id === 'helpers') this.crew.sync(helperCount());
    ui.refreshShop();
    pushSave();
  }

  tryBuyMeta(id) {
    audio.resume();
    if (!canBuyMeta(id)) { audio.deny(); return; }
    buyMeta(id);
    audio.buy();
    if (!this.preRun && id === 'density') this.rebuildForest();
    if (!this.preRun && id === 'crew') this.crew.sync(helperCount());
    ui.refreshShop();
    pushSave(true);
  }

  toggleSound() {
    meta.soundOn = !meta.soundOn;
    audio.setEnabled(meta.soundOn, meta.volume);
    ui.setSoundIcon(meta.soundOn);
    state.dirty = true;
    pushSave();
  }

  setVolume(v) {
    meta.volume = Math.min(1, Math.max(0, v));
    if (meta.volume > 0 && !meta.soundOn) meta.soundOn = true;
    if (meta.volume === 0) meta.soundOn = false;
    audio.setEnabled(meta.soundOn, meta.volume);
    ui.setSoundIcon(meta.soundOn);
    state.dirty = true;
    pushSave();
  }

  // ---------- Престиж ----------
  askPrestige() {
    const got = pendingAcorns();
    const ok = canPrestige();
    const ap = acornProgress();
    let body = `<div style="opacity:.85;font-weight:800">${t('prestigeText')}</div>` +
      `<div class="bigmoney">🌰 ${fmtMoney(got)}</div>` +
      `<div style="opacity:.6;font-size:13px;font-weight:800">${t('forest')} ${deepestForest()} · ${t('total')} ${fmtMoney(run.totalEarned)}</div>`;
    if (!ok) {
      body += `<div style="margin-top:12px;opacity:.75;font-size:13px;font-weight:800">` +
        `${t('prestigeNeed')} 🌰 ${PRESTIGE.minAcorns} · ${t('forest')} ${ap.forest} → 🌰 ${ap.next}</div>` +
        `<div class="pbar2"><i style="width:${(ap.frac * 100).toFixed(1)}%"></i></div>`;
    }
    ui.modal(t('prestige'), body, [
      { label: t('cancel'), cls: 'ghost', fn: () => ui.closeModal() },
      ok ? { label: t('prestigeGo'), cls: 'gold', fn: () => this.doPrestigeNow() } : null,
    ].filter(Boolean));
  }

  doPrestigeNow() {
    // Забег закончен — это и есть точка, где считается его итог.
    metrics.runFinished({
      minutes: Math.round(run.playTime / 60),
      forest: deepestForest(),
      acorns: pendingAcorns(),
      earned: Math.round(run.totalEarned),
      ads: run.adsThisForest,
      run: meta.runs,
    });
    const got = doPrestige();
    meta.preparingRun = true;
    this.preRun = true;
    this.paused = true;
    sdk.gameplayStop();
    this.swarm.clear();
    this.income.length = 0;
    this.helperIncome.length = 0;
    this.treesChopped = 0; this.upgradesBought = 0;
    ui.closeModal();
    ui._lastMoney = -1; ui._lastBag = ''; ui._lastAcorns = -1;
    ui.updateHud(this);
    ui.showPreRun(got);
    sdk.hideBanner();
    audio.unlock();
    ui.showHint(t('prestigeDone').replace('%s', fmtMoney(got)), 5);
    this._stuckShown = false;
    pushSave(true);
  }

  async beginPreparedRun() {
    // Метод стал асинхронным (между забегами может проиграть фулскрин),
    // поэтому защищаемся от второго нажатия по кнопке «Начать».
    if (!this.preRun || this._startingRun) return;
    this._startingRun = true;
    // Между забегами — самая безопасная пауза: игрок сам нажал «начать»,
    // геймплей ещё не идёт, звук уже на паузе.
    this.allowInterstitial('run');
    try { await this.flushInterstitial('prerun'); } catch (e) {}
    this._startingRun = false;
    if (!this.preRun) return;
    resetRun(); // ещё раз читаем мета-бонусы: купленное на экране сработает с первого кадра
    meta.preparingRun = false;
    this.preRun = false;
    this.paused = false;
    this.input.enabled = true;
    this.rebuildForest();
    this.crew.sync(helperCount());
    this.restoreRush();
    this.player.x = 0; this.player.z = 14.5; this.player.vx = 0; this.player.vz = 0;
    this.cam.x = 0; this.cam.z = 14.5;
    this.swarm.clear();
    this.income.length = 0; this.helperIncome.length = 0;
    this.treesChopped = 0; this.upgradesBought = 0;
    this._stuckShown = false;
    ui.hidePreRun();
    ui._lastMoney = -1; ui._lastBag = ''; ui._lastAcorns = -1;
    ui.updateHud(this);
    audio.unlock();
    sdk.gameplayStart();
    if (flags.banner) sdk.showBanner();
    run.forestStartedAt = 0;
    run.adsThisForest = 0;
    this.gateBlockedFor = 0;
    this.gateReported = false;
    this.lastFullBagWarningAt = -1e9;
    this.forestOpenedAt = -1e9;
    this.offer = null;
    pushSave(true);
  }

  // ---------- Реклама ----------
  updateRainbowOffer() {
    if (!sdk.ready || this.preRun || this.rush) return;
    if (this.rushOffer && state.sessionTime >= this.rushOffer.expiresAt) {
      this.rushOffer = null;
      this.nextRushOfferAt = state.sessionTime + AD.rainbowCooldown;
    }
    if (this.rushOffer || state.sessionTime < this.nextRushOfferAt ||
        state.sessionTime - this.lastFreeLevelAt < AD.rewardedGap) return;
    const roll = Math.random();
    const mult = roll < 0.10 ? 5 : roll < 0.40 ? 3 : 2;
    const valid = AD.rainbowOfferMin + Math.random() * (AD.rainbowOfferMax - AD.rainbowOfferMin);
    this.rushOffer = { mult, expiresAt: state.sessionTime + valid };
  }

  // Заезд куплен рекламой: после перезагрузки он обязан продолжиться,
  // а если время уже вышло — награда доплачивается целиком.
  restoreRush() {
    this.rush = null;
    if (!run.rush) return;
    const r = run.rush;
    if (run.playTime >= r.endsAt) {
      const rest = Math.max(0, r.target - r.paid);
      if (rest > 0) addMoney(rest);
      run.rush = null;
      state.dirty = true;
      return;
    }
    this.rush = { cfg: this.rushConfig(r.mult), ...r };
  }

  rainbowBaseline() {
    // Только реальные поступления за последние 25 секунд. Сами рекламные награды в окно не попадают.
    return Math.max(300, Math.floor(Math.max(1, this._windowRate(this.income)) * 300));
  }

  askRainbowOffer() {
    const usingTicket = meta.rainbowTickets > 0;
    const offer = this.rushOffer || (usingTicket ? { mult: 3, expiresAt: Infinity } : null);
    if (!offer) { audio.deny(); return; }
    const cfg = this.rushConfig(offer.mult);
    const target = this.rainbowBaseline() * cfg.mult;
    const adLine = usingTicket
      ? `<b style="color:#9FE07A">${t('rushWeeklyTicket')}</b>`
      : `<b style="color:#FFD25E">${t('rushAdReward')}</b>`;
    ui.modal(t('rushTitle'),
      `<div style="opacity:.86;font-weight:800">${t('rushBody').replace('%s', cfg.systems)}</div>` +
      `<div class="bigmoney">${t('rushReward').replace('%m', cfg.mult).replace('%v', fmtMoney(target))}</div>` +
      `<div style="font-size:13px;opacity:.72;font-weight:800">${t('rushStats').replace('%p', cfg.power).replace('%r', cfg.radius).replace('%s', cfg.speed)}</div>` +
      `<div style="margin-top:10px">${adLine}</div>`,
      [
        { label: (usingTicket ? t('rushStartTicket') : t('rushStartAd')).replace('%s', cfg.mult), cls: 'gold', rewarded: !usingTicket, fn: () => this.watchRainbowOffer(offer, target, usingTicket) },
        { label: t('cancel'), cls: 'ghost', fn: () => ui.closeModal() },
      ]);
  }

  async watchRainbowOffer(offer, target, usingTicket) {
    ui.closeModal();
    if (usingTicket) meta.rainbowTickets = Math.max(0, meta.rainbowTickets - 1);
    else {
      metrics.offerClicked('rainbow');
      const ok = await sdk.showRewarded('rainbow');
      if (!ok) return false;
    }
    this.lastBonusAt = state.sessionTime;
    this.rushOffer = null;
    this.nextRushOfferAt = state.sessionTime + AD.rainbowCooldown;
    const cfg = this.rushConfig(offer.mult);
    run.rush = { mult: offer.mult, target, paid: 0, endsAt: run.playTime + AD.rainbowDuration };
    this.rush = { cfg, ...run.rush };
    audio.unlock();
    ui.showHint(t('rushStarted'), 3);
    state.dirty = true;
    pushSave(true);
    return true;
  }

  updateRainbowRush() {
    if (!this.rush || run.playTime < this.rush.endsAt) return;
    const rest = Math.max(0, this.rush.target - this.rush.paid);
    if (rest > 0) { addMoney(rest); this.rush.paid += rest; }
    this.float.spawn(this.player.x, 3.0, this.player.z, '+' + fmtMoney(this.rush.target), 'big');
    this.coins.burst(this.player.x, 1.4, this.player.z, 20);
    audio.buy();
    this.rush = null;
    run.rush = null;
    ui.updateRush(null);
    ui.showHint(t('rushFinished'), 4);
    pushSave(true);
  }

  // Один уровень способности бесплатно за просмотр ролика
  canFreeLevel() {
    return sdk.ready && !this.rushOffer && !this.rush &&
      run.playTime >= AD.freeLevelFirstDelay &&
      (state.sessionTime - this.lastFreeLevelAt) > AD.freeLevelCooldown &&
      (state.sessionTime - this.lastBonusAt) > AD.rewardedGap;
  }

  async watchFreeLevel(id) {
    if (!this.canFreeLevel()) { audio.deny(); return false; }
    const offerId = 'freeLevel:' + id;
    metrics.offerClicked(offerId);
    const ok = await sdk.showRewarded(offerId);
    if (!ok) return false;
    this.lastFreeLevelAt = state.sessionTime;
    const u = UPGRADE_BY_ID[id];
    if (run.upg[id] < u.max) {
      run.upg[id]++;
      this.upgradesBought++;
      state.dirty = true;
      audio.buy();
      ui.showHint(t('freeLevel') + ': ' + t('u_' + id) + ' ' + t('lvl') + ' ' + run.upg[id], 3);
      if (id === 'helpers') this.crew.sync(helperCount());
    }
    ui.refreshShop();
    pushSave(true);
    return true;
  }

  // ---------- Ежедневный вход ----------
  todayIndex() { return Math.floor(Date.now() / 86400000); }
  dailyDue() { return meta.dailyDay !== this.todayIndex(); }

  dailyRewardPreview() {
    const today = this.todayIndex();
    const streak = meta.dailyDay === today - 1 ? (meta.dailyStreak % 7) + 1 : 1;
    const rewards = [1, 1, 2, 2, 3, 4, 7];
    return { today, streak, acorns: rewards[streak - 1], rewards };
  }

  maybeShowDaily() {
    if (!this.dailyPending || this.preRun || ui.shopOpen || ui.modalOpen() || run.playTime < 1.2) return;
    if (state.sessionTime - this.lastDailyPrompt < 30) return;
    this.lastDailyPrompt = state.sessionTime;
    const r = this.dailyRewardPreview();
    const rewardTrack = r.rewards.map((amount, index) =>
      `<span${index + 1 === r.streak ? ' class="daily-current"' : ''}>${index + 1}: 🌰${amount}</span>`
    ).join(' · ');
    ui.modal(t('dailyTitle'),
      `<div style="font-weight:900">${t('dailyDay').replace('%s', r.streak)}</div>` +
      `<div class="bigmoney">🌰 ${fmtMoney(r.acorns)}</div>` +
      `<div style="opacity:.76;font-weight:800">${t('dailyFree')}</div>` +
      `<div class="daily-track">${rewardTrack}</div>`,
      [{ label: t('dailyClaim'), cls: 'gold', fn: () => this.claimDaily(r) }]);
  }

  claimDaily(r) {
    if (!this.dailyDue()) { ui.closeModal(); return; }
    meta.dailyDay = r.today;
    meta.dailyStreak = r.streak;
    const received = Math.max(1, Math.floor(r.acorns || 0));
    meta.acorns += received;
    meta.lifetimeAcorns += received;
    this.dailyPending = false;
    state.dirty = true;
    ui.closeModal();
    this.float.spawn(this.player.x, 2.8, this.player.z, '+' + fmtMoney(received) + ' 🌰', 'big');
    ui._lastAcorns = -1;
    ui.updateHud(this);
    audio.buy();
    pushSave(true);
  }

  showMachineInfo() {
    const rows = MACHINE.map((m, i) =>
      `<div class="machine-row${i === machineTier() ? ' current' : ''}"><b>${i === machineTier() ? '▶ ' : ''}${t('mach_' + i)}</b>` +
      `<span>🪓 ×${m.p.toFixed(2)} · 🎯 ×${m.r.toFixed(2)} · 👟 ×${m.s.toFixed(2)}</span></div>`).join('');
    ui.modal(t('machineClasses'),
      `<div style="opacity:.78;font-weight:800;margin-bottom:10px">${t('machineDesc')}</div>` + rows,
      [{ label: t('close'), cls: 'ghost', fn: () => ui.closeModal() }]);
  }

  // ---------- Полноэкранная реклама ----------
  // Требование площадки: только в естественных паузах, никогда во время
  // активного взаимодействия. Единственные точки вызова — открытие нового леса
  // и престиж; во время бега, магазина и модалок фулскрин не показывается.
  //
  // Новичка не трогаем: первый забег целиком без фулскринов, плюс первые
  // 12 минут жизни игрока. Сутки тишины — это перебор, деньги на ровном месте.
  // Открытие леса НЕ показывает рекламу — оно только разрешает следующий показ.
  // Леса иногда открываются подряд за секунды: фулскрин прямо в этот момент
  // прилетел бы игроку в лицо посреди действия.
  allowInterstitial(reason) {
    if (!flags.interstitial) return;
    this.pendingInterstitial = reason || 'other';
  }

  // 判定本身在 state.js（可被 Node 自检直接调用），这里只做包装，保持原有调用点不变。
  quietPeriodOver() { return quietPeriodOverState(); }

  // Реальный показ. Вызывается только из естественных пауз:
  // возвращение на базу, закрытие магазина, старт забега, экран жёлудей.
  async flushInterstitial(where) {
    if (!this.pendingInterstitial || !sdk.ready || !flags.interstitial) return false;
    if (this.rushOffer || this.rush || ui.shopOpen || ui.modalOpen()) return false;
    if (!this.quietPeriodOver()) return false;
    if (!sdk.canShowInterstitial(AD.interstitialCooldown)) return false;
    const reason = this.pendingInterstitial;
    const id = 'interstitial:' + reason + '@' + where;
    this.pendingInterstitial = null;
    this._interstitialPending = true;
    this.syncGameplayState();
    try {
      await this.warnBeforeAd();
      // Состояние могло измениться за время предупреждения. Не показываем
      // фулскрин поверх вновь открытого интерфейса или бонусного заезда.
      if (this.rushOffer || this.rush || ui.shopOpen || ui.modalOpen() || document.hidden || this.focusLost || this.platformPaused) {
        this.pendingInterstitial = this.pendingInterstitial || reason;
        return false;
      }
      return await sdk.showInterstitial(id);
    } finally {
      ui.hideAdWarning();
      this._interstitialPending = false;
      this.syncGameplayState();
    }
  }

  // Предупреждение за 2 секунды: игрок не должен получать рекламу «в лицо»
  // посреди действия. Заодно это снимает случайные клики по объявлению.
  warnBeforeAd() {
    return new Promise((resolve) => {
      let left = AD.warnSeconds;
      ui.showAdWarning(left);
      const tick = () => {
        left--;
        if (left <= 0) { ui.hideAdWarning(); resolve(); return; }
        ui.showAdWarning(left);
        window.__ytGameTimers.setTimeout(tick, 1000);
      };
      window.__ytGameTimers.setTimeout(tick, 1000);
    });
  }

  // ---------- Ролик у закрытых ворот ----------
  // Момент максимального намерения: игрок стоит перед стеной и знает свою
  // проблему. Награда ограничена ровно тем, что снимает блок — реклама
  // не должна обгонять обычную экономику.
  // У ворот больше нет экспериментальной временной ветки: любой старый флаг
  // auto/boost трактуем как levels. Оплаченный ролик всегда снимает текущий
  // DPS-блок полностью.
  effectiveGateMode() {
    return 'levels';
  }

  gateAdCooldownSeconds() {
    return Math.max(0, Math.ceil(((meta.gateAdCooldownUntil || 0) - Date.now()) / 1000));
  }

  gateAdViewsLeft() {
    if (this.gateAdCooldownSeconds() > 0) return 0;
    return Math.max(0, AD.gateBurstMax - (meta.gateAdBurstCount || 0));
  }

  gateOfferAvailable() {
    if (!sdk.ready || flags.gateOffer === 'off') return false;
    if (!this.gateBlocked) return false;
    if (this.gateBlockedFor < AD.gateOfferDelay) return false;
    if (this.gateAdCooldownSeconds() > 0 || this.gateAdViewsLeft() <= 0) return false;
    return gateOfferCanDeliver();
  }

  gateOfferLabel(mode = this.effectiveGateMode()) {
    return t('gbAdLevels')
      .replace('%s', axeLevelsToGate())
      .replace('%n', this.gateAdViewsLeft());
  }

  async watchGateAxe() {
    if (!this.gateOfferAvailable() || sdk.adBusy) { audio.deny(); return false; }
    const mode = 'levels';
    const offerId = 'gate:levels';
    metrics.offerClicked(offerId);
    const ok = await sdk.showRewarded(offerId);
    if (!ok) return false;
    this.lastFreeLevelAt = state.sessionTime;
    this.lastGateAdAt = state.sessionTime;
    this.gateAdVariant = mode;
    run.adsThisForest++;

    const got = grantAxeToGate();
    this.upgradesBought += got;

    meta.gateAdBurstCount = (meta.gateAdBurstCount || 0) + 1;
    if (meta.gateAdBurstCount >= AD.gateBurstMax) {
      meta.gateAdBurstCount = 0;
      meta.gateAdCooldownUntil = Date.now() + AD.gateBurstCooldown * 1000;
    }
    ui.showHint(t('gateAxeDone').replace('%s', got), 3.5);
    state.dirty = true;
    audio.buy();
    ui.refreshShop();
    pushSave(true);
    return true;
  }

  // ---------- Мгновенная сдача ----------
  // Убирает скучную пробежку, а не даёт абстрактный бонус. Первый раз
  // предлагаем только после того, как игрок хотя бы однажды донёс сам —
  // иначе оффер обесценивает рюкзак и погрузчик с первой минуты.
  haulOfferAvailable() {
    if (!sdk.ready || !flags.haulOffer) return false;
    if (meta.manualHauls < flags.haulNeedsManualHauls) return false;
    if (!bagFull() || run.carryCount === 0) return false;
    if (Math.hypot(this.player.x, this.player.z) < AD.haulDistance) return false;
    if (state.sessionTime - this.lastHaulAt < AD.haulCooldown) return false;
    if (state.sessionTime - this.lastFreeLevelAt < AD.rewardedGap) return false;
    return true;
  }

  async watchHaul() {
    if (!this.haulOfferAvailable() || sdk.adBusy) { audio.deny(); return false; }
    metrics.offerClicked('haul');
    const ok = await sdk.showRewarded('haul');
    if (!ok) return false;
    this.lastHaulAt = state.sessionTime;
    this.lastFreeLevelAt = state.sessionTime;
    run.adsThisForest++;
    const groups = takeLogs(run.carryCount);
    let gain = 0;
    const mult = priceMult();
    for (const g of groups) gain += speciesAt(g.idx).value * g.n * mult;
    if (gain > 0) {
      addMoney(gain);
      this.noteIncome(gain, false);
      metrics.noteEarned(gain);
      this.float.spawn(this.player.x, 2.8, this.player.z, '+' + fmtMoney(gain), 'big');
      this.coins.burst(this.player.x, 1.4, this.player.z, 16);
    }
    audio.buy();
    ui.showHint(t('haulDone'), 3);
    pushSave(true);
    return true;
  }

  // ---------- Удвоение добычи после нового леса ----------
  // Приятная эмоциональная награда в момент, когда игрок и так доволен.
  // Никаких автоматических модалок — только кнопка, которая сама уходит.
  forestBonusAvailable() {
    if (!sdk.ready || !flags.forestBonus) return false;
    if (haulBonusActive()) return false;
    if (state.sessionTime - this.forestOpenedAt > AD.forestBonusWindow) return false;
    if (state.sessionTime - this.lastFreeLevelAt < AD.rewardedGap) return false;
    return true;
  }

  async watchForestBonus() {
    if (!this.forestBonusAvailable() || sdk.adBusy) { audio.deny(); return false; }
    metrics.offerClicked('forestBonus');
    const ok = await sdk.showRewarded('forestBonus');
    if (!ok) return false;
    this.lastFreeLevelAt = state.sessionTime;
    run.adsThisForest++;
    run.haulBonusUntil = run.playTime + AD.forestBonusDuration;
    audio.unlock();
    ui.showHint(t('forestBonusOn'), 3);
    pushSave(true);
    return true;
  }

  // ---------- Выбор одного оффера на главную кнопку ----------
  // Кнопка всегда одна. Две мигающие кнопки утомляют быстрее, чем сама реклама.
  resolveOffer() {
    if (this.preRun || this.rush || ui.shopOpen || ui.modalOpen()) return null;
    if (this.haulOfferAvailable()) {
      return { id: 'haul', icon: '🚚', title: t('offHaul'), sub: t('offHaulSub'), fn: () => this.watchHaul() };
    }
    if (this.forestBonusAvailable()) {
      const left = Math.ceil(AD.forestBonusWindow - (state.sessionTime - this.forestOpenedAt));
      return { id: 'forestBonus', icon: '🌟', title: t('offForest'), sub: t('offForestSub').replace('%s', left), fn: () => this.watchForestBonus() };
    }
    if (flags.rainbowOffer && (this.rushOffer || meta.rainbowTickets > 0)) return 'rainbow';
    return null;
  }

  async showLeaderboard() {
    const score = meta.lifetimeEarned + run.totalEarned;
    sdk.submitScore(score);
    ui.modal(t('leaderboard'), '<div style="opacity:.7">…</div>', [{ label: t('close'), cls: 'ghost', fn: () => ui.closeModal() }]);
    const res = await sdk.getLeaderboard();
    let html = '';
    if (!res || !res.entries || !res.entries.length) {
      html = `<div style="opacity:.8;font-weight:800">${t('total')}: <b style="color:#FFC93C">${fmtMoney(score)}</b></div>` +
        `<div style="opacity:.6;margin-top:6px;font-weight:800">${t('bestForest')}: ${meta.bestForest} · ${t('runs')}: ${meta.runs}</div>`;
      if (!sdk.ready) html += `<div style="opacity:.45;margin-top:8px;font-size:13px">${t('leaderboardYandex')}</div>`;
    } else {
      for (const e of res.entries) {
        const me = res.userRank && e.rank === res.userRank;
        const name = (e.player && (e.player.publicName || e.player.name)) || t('player');
        html += `<div class="lb-row${me ? ' me' : ''}"><div class="lb-rank">${e.rank}</div>` +
          `<div class="lb-name">${escapeHtml(name)}</div><div class="lb-score">${fmtMoney(e.score)}</div></div>`;
      }
    }
    ui.el['modal-body'].innerHTML = html;
  }

  showOffline(amount) {
    if (sdk.ready) metrics.offerShown('offline:x2');
    ui.modal(t('offlineTitle'),
      `<div style="opacity:.8;font-weight:800">${t('offlineText')}</div>` +
      `<div class="bigmoney">💰 ${fmtMoney(amount)}</div>`,
      [
        { label: t('collect'), cls: 'ghost', fn: () => { addMoney(amount); ui.closeModal(); audio.coin(); pushSave(); } },
         sdk.ready ? {
           label: t('collectX2'), cls: 'gold', rewarded: true, fn: async () => {
             ui.closeModal();
             metrics.offerClicked('offline:x2');
             const ok = await sdk.showRewarded('offline:x2');
            addMoney(ok ? amount * 2 : amount);
            audio.buy(); pushSave();
          },
        } : null,
      ].filter(Boolean));
  }

  askReset() {
    ui.modal(t('reset'), `<div style="opacity:.8;font-weight:800">${t('resetAsk')}</div>`, [
      { label: t('cancel'), cls: 'ghost', fn: () => ui.closeModal() },
      { label: t('yes'), fn: () => this.doReset() },
    ]);
  }

  doReset() {
    try { window.__ytStorage.removeItem('lumberjack_save_v4'); } catch (e) {}
    try { sdk.player && sdk.player.setData({ save: null }, true); } catch (e) {}
    location.href = location.pathname + '?fresh=' + Date.now();
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

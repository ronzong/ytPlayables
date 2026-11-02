// Панель баланса для плейтеста: живые цифры + лог событий.
// Включается ?debug=1, клавишей L или флагом сборки.
import { state, run, meta, val, mval, chopRadius, moveSpeed, ringChopTime, ringSpecies,
         deepestForest, nextForestCost, pendingAcorns, forestGateOk, helperCount,
         bagCapacity, machineTier, playerAgeHours } from './state.js';
import { speciesName, PRESTIGE, AD } from './config.js';
import { fmtMoney, fmtTime } from './format.js';
import { metrics } from './metrics.js';
import { flags } from './flags.js';

const pct = (x) => (x * 100).toFixed(0) + '%';

export const debug = {
  on: false,
  el: null,
  body: null,
  lines: [],
  t: 0,
  fps: 0,
  _acc: 0, _n: 0,

  tab: 'balance',

  init(game, force) {
    this.game = game;
    const q = location.search;
    this.on = force || /[?&]debug\b/.test(q) || flags.debugPanel;
    const el = document.createElement('div');
    el.id = 'dbg';
    el.className = 'dbg' + (this.on ? '' : ' hidden');
    el.innerHTML =
      '<div class="dbg-head"><b>Баланс</b>' +
      '<button id="dbg-tab">реклама</button>' +
      '<button id="dbg-copy">копировать</button>' +
      '<button id="dbg-clear">очистить</button>' +
      '<button id="dbg-close">×</button></div>' +
      '<div class="dbg-stats" id="dbg-stats"></div>' +
      '<div class="dbg-log" id="dbg-log"></div>';
    document.body.appendChild(el);
    this.el = el;
    this.stats = el.querySelector('#dbg-stats');
    this.body = el.querySelector('#dbg-log');
    el.querySelector('#dbg-close').addEventListener('click', () => this.toggle(false));
    el.querySelector('#dbg-tab').addEventListener('click', () => {
      this.tab = this.tab === 'ads' ? 'balance' : 'ads';
      el.querySelector('#dbg-tab').textContent = this.tab === 'ads' ? 'баланс' : 'реклама';
      this.t = 1;
    });
    el.querySelector('#dbg-clear').addEventListener('click', () => { this.lines.length = 0; this.render(); });
    el.querySelector('#dbg-copy').addEventListener('click', () => {
      const txt = this.dump();
      navigator.clipboard && navigator.clipboard.writeText(txt);
      this.log('лог скопирован в буфер');
    });
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyL' && !e.metaKey && !e.ctrlKey) this.toggle();
    });
    this.log('старт');
  },

  toggle(v) {
    this.on = v === undefined ? !this.on : v;
    if (this.el) this.el.classList.toggle('hidden', !this.on);
  },

  log(msg) {
    const line = '[' + fmtTime(run.playTime) + '] ' + msg;
    this.lines.push(line);
    if (this.lines.length > 200) this.lines.shift();
    if (this.on) this.render();
  },

  render() {
    if (!this.body) return;
    this.body.textContent = this.lines.slice(-40).join('\n');
    this.body.scrollTop = this.body.scrollHeight;
  },

  dump() {
    return this.statsText + '\n\n' + this.lines.join('\n');
  },

  update(dt, game) {
    this._acc += dt; this._n++;
    if (this._acc >= 0.5) { this.fps = this._n / this._acc; this._acc = 0; this._n = 0; }
    if (!this.on || !this.stats) return;
    this.t += dt;
    if (this.t < 0.25) return;
    this.t = 0;

    if (this.tab === 'ads') { this.renderAds(game); return; }

    const rows = [
      ['время забега', fmtTime(run.playTime)],
      ['лес', deepestForest() + ' · ' + speciesName(run.scroll + run.rings - 1)],
      ['деньги', fmtMoney(run.money)],
      ['заработано', fmtMoney(run.totalEarned)],
      ['доход/с', fmtMoney(game.incomePerSec())],
      ['помощники', helperCount() + ' · ' + fmtMoney(game.helperPerSec()) + '/с'],
      ['топор (dps)', fmtMoney(val('axe'))],
      ['рубка ближнего', ringChopTime(0).toFixed(2) + ' c · ' + speciesName(run.scroll)],
      ['рубка дальнего', ringChopTime(run.rings - 1).toFixed(2) + ' c'],
      ['ворота', forestGateOk() ? 'открыты' : 'ЗАКРЫТЫ (топор слаб)'],
      ['цена след. леса', fmtMoney(nextForestCost())],
      ['радиус / скорость', chopRadius().toFixed(1) + ' м · ' + moveSpeed().toFixed(1) + ' м/с'],
      ['рюкзак', fmtMoney(run.carryCount) + '/' + fmtMoney(bagCapacity())],
      ['цена древесины', '×' + fmtMoney(val('price') * mval('priceMeta'))],
      ['уровни', Object.entries(run.upg).map(([k, v]) => k + ':' + v).join(' ')],
      ['жёлуди', meta.acorns + ' (+' + pendingAcorns() + ' за забег, порог ' + PRESTIGE.minAcorns + ')'],
      ['техника', machineTier() + ' · мета ' + Object.entries(meta.m).map(([k, v]) => k + ':' + v).join(' ')],
      ['забегов', meta.runs + ' · лучший лес ' + meta.bestForest],
      ['деревьев / fps', game.forest.trees.length + ' · ' + this.fps.toFixed(0)],
    ];
    this.statsText = rows.map(([a, b]) => a + ': ' + b).join('\n');
    this.stats.innerHTML = rows.map(([a, b]) =>
      `<div><span>${a}</span><b>${b}</b></div>`).join('');
  },

  // Вкладка рекламы. Здесь важно помнить, что показатель принятия оффера —
  // НЕ цель. Цель у ворот — доля «открыл в 120 с», у разгрузки — что игрок
  // продолжает играть, а не выходит через минуту после ролика.
  renderAds(game) {
    const d = metrics.data || {};
    const bt = d.byTrigger || {};
    const ids = Object.keys(bt);
    const rows = [
      ['ворота · реклама', flags.gateOffer + ' · ' + meta.gateAdBurstCount + '/' + AD.gateBurstMax],
      ['источник флагов', flags._src || 'defaults'],
      ['Метрика', flags.metrikaCounterId > 0 ? String(flags.metrikaCounterId) : 'не подключена'],
      ['устройство', metrics.device],
      ['сессий (локально)', d.sessions || 0],
      ['сессия сейчас', fmtTime(metrics.sessionSeconds())],
      ['средняя сессия', fmtTime(metrics.avgSessionSeconds())],
      ['фулскринов', d.interstitialShown || 0],
      ['фулскрин ждёт', game.pendingInterstitial || '—'],
      // 新手保护的两个门槛都显示出来：已开森林 / 目标，账号年龄 / 目标（分钟）
      ['тихий период', game.quietPeriodOver() ? 'кончился'
        : 'идёт (лес ' + deepestForest() + '/' + AD.firstRunFreeForest +
          ' · возраст ' + (playerAgeHours() * 60).toFixed(1) + '/' + AD.quietMinutes + ' мин)'],
      ['роликов', d.rewardedShown || 0],
      ['роликов / сессия', metrics.rewardedPerSession().toFixed(2)],
      // 冷却剩余秒数：数字与 game.js 的判定条件一一对应，方便对着按钮核对
      ['⏳ 🌈 радуга', this.cdRainbow(game)],
      ['⏳ 🎬 свободный уровень', this.cdFreeLevel(game)],
      ['⏳ 🎬 у ворот', this.cdGate(game)],
      ['⏳ 🎁 офлайн ×2', 'только в окне офлайна'],
      ['выход ≤60 с после рекламы', pct(metrics.exitAfterAdRate()) + ' (' + (d.exitsAfterAd || 0) + '/' + (d.adsEndedShown || 0) + ')'],
      ['ручных ходок', meta.manualHauls],
      ['застревал у ворот', pct(metrics.gateStuckShare()) + ' сессий · ' + Math.round(d.gateStuckSeconds || 0) + ' с всего'],
      ['стоит у ворот сейчас', game.gateBlocked ? Math.round(game.gateBlockedFor) + ' с' : '—'],
      ['темп леса без рекламы', fmtTime(metrics.forestPace(false))],
      ['темп леса с рекламой', fmtTime(metrics.forestPace(true))],
    ];
    for (const v of Object.keys(d.gate || {})) {
      rows.push(['ВОРОТА ' + v + ' → открыл ≤120 с',
        pct(metrics.gateWinRate(v)) + ' (' + d.gate[v].opened + '/' + d.gate[v].tried + ')']);
    }
    for (const id of ids) {
      const b = bt[id];
      rows.push(['оффер ' + id, b.offered + ' показ · ' + b.clicked + ' клик (' + pct(metrics.rate(id)) + ') · ' + b.rewarded + ' досмотр']);
    }
    this.statsText = rows.map(([a, b]) => a + ': ' + b).join('\n');
    this.stats.innerHTML = rows.map(([a, b]) =>
      `<div><span>${a}</span><b>${b}</b></div>`).join('');
  },

  // 冷却显示：>0 显示还需等待的秒数，0 表示该条件已满足（其它前置条件仍可能挡住）
  cdLeft(seconds) { return seconds > 0 ? Math.ceil(seconds) + ' с' : 'готово'; },

  cdRainbow(game) {
    const now = state.sessionTime;
    if (game.rush) return 'идёт · ' + fmtTime(Math.max(0, game.rush.endsAt - run.playTime));
    if (game.rushOffer) return 'оффер · ' + fmtTime(Math.max(0, game.rushOffer.expiresAt - now));
    if (meta.rainbowTickets > 0) return 'билет · без рекламы';
    return this.cdLeft(game.nextRushOfferAt - now) +
      ' · гэп ' + this.cdLeft(AD.rewardedGap - (now - game.lastFreeLevelAt));
  },

  cdFreeLevel(game) {
    const now = state.sessionTime;
    return this.cdLeft(AD.freeLevelCooldown - (now - game.lastFreeLevelAt)) +
      ' · гэп ' + this.cdLeft(AD.rewardedGap - (now - game.lastBonusAt)) +
      ' · забег ' + this.cdLeft(AD.freeLevelFirstDelay - run.playTime);
  },

  cdGate(game) {
    return this.cdLeft(game.gateAdCooldownSeconds()) +
      ' · осталось ' + game.gateAdViewsLeft() + '/' + AD.gateBurstMax +
      (game.gateBlocked ? ' · у ворот ' + Math.round(game.gateBlockedFor) + ' с' : ' · ворота открыты');
  },
};

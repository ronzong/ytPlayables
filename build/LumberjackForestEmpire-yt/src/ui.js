// Интерфейс: HUD, магазин с двумя вкладками, обучение, модалки, мировые подписи.
import { UPGRADES, META, MACHINE } from './config.js';
import { run, meta, val, mval, costOf, metaCostOf, canBuy, canBuyMeta, isLocked,
         bagCapacity, pendingAcorns, canPrestige, helperCount, bulkCost, maxAffordable,
         ringChopTime } from './state.js';
import { fmtMoney, fmtTime } from './format.js';
import { t, getLang } from './i18n.js';

const ICONS = { axe: '🪓', radius: '🎯', bag: '🎒', boot: '👟', coin: '💰', truck: '🚜', helper: '👷', bolt: '⚡' };
const $ = (id) => document.getElementById(id);

export const ui = {
  game: null,
  el: {},
  shopOpen: false,
  tab: 'run',
  buyMult: 1,
  _hintT: 0,
  _lastMoney: -1,
  _lastBag: '',
  _lastAcorns: -1,
  _hl: null,
  _gateBarDismissed: false,
  _gateBarWasVisible: false,

  init(game) {
    this.game = game;
    const e = this.el;
    ['money', 'bag', 'bagbar', 'shop', 'shop-list', 'meta-list', 'meta-head', 'shop-money',
      'shop-close', 'btn-shop', 'btn-sound', 'btn-lb', 'btn-ad', 'boost', 'boost-t', 'rainbow', 'rainbow-label', 'rainbow-t', 'rainbow-pay', 'hint',
      'modal', 'modal-title', 'modal-body', 'modal-actions', 'shop-dot', 'world-layer',
      'shop-title', 'shop-label', 'btn-reset', 'btn-prestige', 'prestige-label', 'prestige-num',
      'acorn-pill', 'acorns', 'tab-run', 'tab-meta', 'tut', 'tut-n', 'tut-max', 'tut-text', 'tut-next', 'shop-cur',
      'shop-tip', 'prep-banner', 'prep-title', 'prep-text', 'prep-got', 'prep-start',
      'mults', 'volpop', 'vol',
      'gatebar', 'gb-title', 'gb-sub', 'gb-levels', 'gb-shop', 'gb-ad', 'gb-ad-txt', 'gb-close',
      'adwarn', 'aw-txt', 'aw-n',
    ].forEach((k) => { e[k] = $(k); });
    e['bag-pill'] = document.querySelector('.pill.bag');

    e['btn-shop'].addEventListener('click', () => this.toggleShop());
    e['shop-close'].addEventListener('click', () => this.toggleShop(false));
    e['btn-sound'].addEventListener('click', (ev) => {
      ev.stopPropagation();
      e['volpop'].classList.toggle('hidden');
      if (!e['volpop'].classList.contains('hidden')) e['vol'].value = String(Math.round(meta.volume * 100));
    });
    e['btn-sound'].addEventListener('dblclick', () => game.toggleSound());
    e['vol'].addEventListener('input', () => game.setVolume(+e['vol'].value / 100));
    e['volpop'].addEventListener('click', (ev) => ev.stopPropagation());
    document.addEventListener('pointerdown', (ev) => {
      if (!e['volpop'].contains(ev.target) && ev.target !== e['btn-sound']) e['volpop'].classList.add('hidden');
    });
    e['mults'].querySelectorAll('.mult').forEach((btn) => {
      btn.addEventListener('click', () => {
        const m = btn.dataset.m;
        this.setBuyMult(m === 'max' ? 'max' : +m);
      });
    });
    e['btn-lb'].addEventListener('click', () => game.showLeaderboard());
    e['btn-ad'].addEventListener('click', () => {
      // Одна кнопка — разные офферы. Контекстный имеет приоритет над радужным.
      if (game.offer && game.offer !== 'rainbow') this.runAdAction(e['btn-ad'], () => game.offer.fn());
      else game.askRainbowOffer();
    });
    e['gb-close'].addEventListener('click', () => this.dismissGateBar());
    e['gb-shop'].addEventListener('click', () => {
      // Переход с подсказки всегда ведёт к покупке одного уровня. Иначе
      // запомненный режим ×10/МАКС может делать доступный уровень недоступным.
      this.dismissGateBar();
      this.setBuyMult(1);
      this.toggleShop(true, 'run');
      requestAnimationFrame(() => this.highlightCard('axe'));
    });
    e['gb-ad'].addEventListener('click', () => this.runAdAction(e['gb-ad'], () => game.watchGateAxe()));
    e['btn-reset'].addEventListener('click', () => game.askReset());
    e['btn-prestige'].addEventListener('click', () => game.askPrestige());
    e['prep-start'].addEventListener('click', () => game.beginPreparedRun());
    e['tut-next'].addEventListener('click', () => game.tutorial.ack());
    e['tab-run'].addEventListener('click', () => this.setTab('run'));
    e['tab-meta'].addEventListener('click', () => this.setTab('meta'));
    e['modal'].addEventListener('click', (ev) => { if (ev.target === e['modal']) this.closeModal(); });

    // Свободная игровая область работает как естественная кнопка «назад».
    // Перехватываем pointerdown до Input, чтобы этот же тап не запускал движение.
    const canvas = document.getElementById('c');
    document.addEventListener('pointerdown', (ev) => {
      if (!this.shopOpen || this.preRun || this.modalOpen()) return;
      if (ev.target !== canvas) return;
      ev.preventDefault();
      ev.stopPropagation();
      this.toggleShop(false);
    }, { capture: true });

    this.sellLabel = this.makeLabel('<div class="big"><span class="log-icon" aria-hidden="true"></span> → 💰</div><div class="sub"></div>');
    this.gateLabel = this.makeLabel('<div class="sub"></div><div class="big"></div><div class="pbar"><i></i></div>');
    this.buildShop();
    this.applyLang();
  },

  applyLang() {
    if (!this.el['shop-title']) return;
    document.documentElement.lang = getLang();
    document.title = t('gameTitle');
    const gameName = $('game-name');
    if (gameName) gameName.textContent = t('gameShortName').toUpperCase();
    this.el['shop-title'].textContent = t('shop');
    this.el['shop-label'].textContent = t('shop');
    this.el['loader-text'] = $('loader-text');
    if (this.el['loader-text']) this.el['loader-text'].textContent = t('loading');
    this.el['btn-reset'].textContent = t('reset');
    this.el['mults'].querySelector('#mult-max').textContent = t('max');
    this.el['prestige-label'].textContent = t('prestige');
    this.el['meta-head'].textContent = t('metaHint');
    this.el['shop-tip'].textContent = t('shopHoldTip');
    this.el['prep-title'].textContent = t('prepTitle');
    this.el['prep-text'].textContent = t('prepText');
    this.el['prep-start'].textContent = t('prepStart');
    this.el['btn-sound'].title = t('sound');
    this.el['btn-lb'].title = t('leaderboard');
    this.el['gb-close'].title = t('close');
    this.el['gb-close'].setAttribute('aria-label', t('close'));
    this.el['rainbow-label'].textContent = t('rushHarvester').toUpperCase();
    this.el['btn-ad'].querySelector('.ad-txt').innerHTML = `${t('rushButton')}<br><b>${t('rushSeconds')}</b>`;
    this.rebuildShopTexts();
  },

  makeLabel(html) {
    const d = document.createElement('div');
    d.className = 'wlabel';
    d.innerHTML = html;
    d.style.display = 'none';
    this.el['world-layer'].appendChild(d);
    return d;
  },

  setLoading(p, text) {
    const bar = $('lbar-fill'), tx = $('loader-text');
    if (bar) bar.style.width = Math.round(p * 100) + '%';
    if (tx && text) tx.textContent = text;
  },

  hideLoader() {
    const l = $('loader');
    if (!l) return;
    l.classList.add('gone');
    l.style.display = 'none';
  },

  // ---------- Обучение ----------
  setTutorial(text, n, max, canNext = false) {
    document.body.classList.toggle('tutorial-info', !!text && canNext);
    const el = this.el['tut'];
    if (!el) return;
    if (!text) { el.classList.add('hidden'); el.classList.remove('has-next'); return; }
    el.classList.remove('hidden');
    el.classList.toggle('has-next', canNext);
    this.el['tut-next'].classList.toggle('hidden', !canNext);
    this.el['tut-next'].textContent = t('tut_next');
    this.el['tut-text'].textContent = text;
    this.el['tut-n'].textContent = n;
    this.el['tut-max'].textContent = max;
  },

  highlight(id) {
    if (this._hl) { const o = $(this._hl); o && o.classList.remove('hl'); }
    this._hl = id;
    if (id) { const n = $(id); n && n.classList.add('hl'); }
  },

  // Подсветить карточку улучшения в открытом магазине — чтобы после клика
  // «В магазин» игрок не искал нужную строку глазами.
  highlightCard(upgId) {
    const card = document.querySelector(`.card[data-id="${upgId}"]`);
    if (!card) return;
    card.classList.add('card-hl');
    card.scrollIntoView({ block: 'center', behavior: 'smooth' });
    window.__ytGameTimers.setTimeout(() => card.classList.remove('card-hl'), 2600);
  },

  // ---------- Полоса у закрытых ворот ----------
  // Магазин и добровольная помощь появляются вместе у закрытых ворот.
  setGateBar(visible, blockedFor, adLabel, levelsLeft = 0, cooldownSeconds = 0) {
    const bar = this.el['gatebar'];
    if (!bar) return;
    if (!visible) {
      bar.classList.add('hidden');
      document.body.classList.remove('gate-open');
      this._gateBarWasVisible = false;
      this._gateBarDismissed = false;
      return;
    }
    if (!this._gateBarWasVisible) this._gateBarDismissed = false;
    this._gateBarWasVisible = true;
    if (this._gateBarDismissed) { bar.classList.add('hidden'); document.body.classList.remove('gate-open'); return; }
    bar.classList.remove('hidden');
    document.body.classList.add('gate-open');
    const sec = Math.round(ringChopTime(0));
    this.el['gb-title'].textContent = t('gbTitle');
    this.el['gb-sub'].textContent = t('gbSub').replace('%s', sec > 9000 ? '∞' : sec);
    let levelsText = t('gbLevelsLeft').replace('%s', Math.max(0, levelsLeft));
    if (cooldownSeconds > 0) levelsText += ' · ' + t('gbAdCooldown').replace('%s', fmtTime(cooldownSeconds));
    this.el['gb-levels'].textContent = levelsText;
    this.el['gb-shop'].textContent = t('gbShop');
    const adBtn = this.el['gb-ad'];
    adBtn.classList.toggle('hidden', !adLabel);
    if (adLabel) this.el['gb-ad-txt'].textContent = adLabel;
  },

  dismissGateBar() {
    this._gateBarDismissed = true;
    document.body.classList.remove('gate-open');
    const bar = this.el['gatebar'];
    if (bar) bar.classList.add('hidden');
  },

  // ---------- Контекстный оффер на главной кнопке ----------
  setContextOffer(offer) {
    const btn = this.el['btn-ad'];
    btn.classList.toggle('hidden', !offer);
    if (!offer) return;
    btn.querySelector('.ad-txt').innerHTML = `${offer.icon} ${offer.title}<br><b>${offer.sub}</b>`;
  },

  // ---------- Предупреждение перед фулскрином ----------
  showAdWarning(n) {
    const w = this.el['adwarn'];
    if (!w) return;
    w.classList.remove('hidden');
    this.el['aw-txt'].textContent = t('adWarn');
    this.el['aw-n'].textContent = String(n);
  },

  hideAdWarning() {
    const w = this.el['adwarn'];
    if (w) w.classList.add('hidden');
  },

  // Один физический клик = один запрос к SDK. Пока запрос принят, кнопка
  // блокируется и явно показывает состояние вместо ощущения «клик не сработал».
  async runAdAction(btn, action) {
    if (!btn || btn.dataset.adPending === '1') {
      this.showHint(t('adLoading'), 1.4);
      return false;
    }
    btn.dataset.adPending = '1';
    btn.classList.add('ad-loading');
    btn.setAttribute('aria-busy', 'true');
    const wasDisabled = btn.disabled;
    btn.disabled = true;
    this.showHint(t('adLoading'), 1.4);
    let ok = false;
    try { ok = await action(); } catch (e) { ok = false; }
    finally {
      delete btn.dataset.adPending;
      btn.classList.remove('ad-loading');
      btn.removeAttribute('aria-busy');
      btn.disabled = wasDisabled;
    }
    if (ok === false) this.showHint(t('adUnavailable'), 3.0);
    return ok;
  },

  // ---------- HUD ----------
  updateHud(game) {
    const m = Math.floor(run.money);
    if (m !== this._lastMoney) {
      this._lastMoney = m;
      this.el['money'].textContent = fmtMoney(run.money);
      if (this.shopOpen) this.el['shop-money'].textContent = fmtMoney(run.money);
    }
    if (meta.acorns !== this._lastAcorns) {
      this._lastAcorns = meta.acorns;
      this.el['acorns'].textContent = fmtMoney(meta.acorns);
      this.el['acorn-pill'].classList.toggle('hidden', meta.acorns <= 0 && meta.runs === 0);
    }

    const cap = bagCapacity();
    const bagTxt = fmtMoney(run.carryCount) + '/' + fmtMoney(cap);
    if (bagTxt !== this._lastBag) {
      this._lastBag = bagTxt;
      this.el['bag'].textContent = bagTxt;
      const ratio = Math.min(1, run.carryCount / cap);
      this.el['bagbar'].style.width = (ratio * 100).toFixed(1) + '%';
      if (this.el['bag-pill']) this.el['bag-pill'].classList.toggle('warn', ratio >= 1);
    }

    const boost = run.boostUntil - run.playTime;
    if (boost > 0) {
      this.el['boost'].classList.remove('hidden');
      this.el['boost-t'].textContent = fmtTime(boost);
    } else this.el['boost'].classList.add('hidden');

    let any = false;
    for (const u of UPGRADES) if (!isLocked(u.id) && canBuy(u.id)) { any = true; break; }
    if (!any) for (const mu of META) if (canBuyMeta(mu.id)) { any = true; break; }
    this.el['shop-dot'].classList.toggle('hidden', !any || this.shopOpen);
  },

  setSoundIcon(on) {
    this.el['btn-sound'].textContent = on ? '🔊' : '🔇';
    this.el['btn-sound'].classList.toggle('off', !on);
  },

  setAdOffer(offer, tickets = 0) {
    const visible = !!offer || tickets > 0;
    const btn = this.el['btn-ad'];
    btn.classList.toggle('hidden', !visible);
    if (!visible) return;
    const mult = offer ? offer.mult : 3;
    const left = offer ? Math.max(0, Math.ceil(offer.expiresAt - this.game.sessionTime())) : 0;
    const tail = tickets > 0 ? t('rushTicketNoAd') : t('rushMore') + ' ' + fmtTime(left);
    btn.querySelector('.ad-txt').innerHTML = `${t('rushHarvester')} ×${mult}<br><b>${tail}</b>`;
  },

  updateRush(rush) {
    const active = !!rush;
    this.el['rainbow'].classList.toggle('hidden', !active);
    document.body.classList.toggle('rush-open', active);
    if (!active) return;
    this.el['rainbow-t'].textContent = fmtTime(Math.max(0, rush.endsAt - run.playTime));
    this.el['rainbow-pay'].textContent = `+💰 ${fmtMoney(rush.paid)} / ${fmtMoney(rush.target)}`;
  },

  showHint(text, dur = 4) {
    this.el['hint'].textContent = text;
    this.el['hint'].classList.add('show');
    this._hintT = dur;
  },

  tickHint(dt) {
    if (this._hintT > 0) {
      this._hintT -= dt;
      if (this._hintT <= 0) this.el['hint'].classList.remove('show');
    }
  },

  // ---------- Магазин ----------
  setBuyMult(mult) {
    this.buyMult = mult;
    this.el['mults'].querySelectorAll('.mult').forEach((btn) => {
      const value = btn.dataset.m === 'max' ? 'max' : +btn.dataset.m;
      btn.classList.toggle('active', value === mult);
    });
    this.refreshShop();
  },

  buildShop() {
    this.cards = {};
    this.metaCards = {};
    const mk = (list, box, prefix, onBuy, cls) => {
      box.innerHTML = '';
      for (const u of list) {
        const card = document.createElement('div');
        card.className = 'card' + (cls ? ' ' + cls : '');
        card.dataset.id = u.id;
        card.innerHTML =
          `<div class="cic">${prefix(u)}</div>` +
          `<div class="cmid"><div class="cname"><span class="nm"></span><span class="clvl"></span></div>` +
          `<div class="cdesc"></div><button class="cinfo hidden" type="button"></button><div class="cval"></div></div>` +
          `<button class="buy${cls === 'meta' ? ' acorn' : ''}"><span class="bic">${cls === 'meta' ? '🌰' : '💰'}</span><span class="bt"></span></button>` +
          (cls === 'meta' ? '' : `<button class="adlvl hidden" title="">🎬</button>`);
        const btn = card.querySelector('.buy');
        btn.addEventListener('click', () => onBuy(u.id));
        let holdT = null, holdD = 380;
        const stop = () => { if (holdT) window.__ytGameTimers.clearTimeout(holdT); holdT = null; holdD = 380; };
        const tick = () => {
          const ok = cls === 'meta' ? canBuyMeta(u.id) : canBuy(u.id);
          if (!ok) { stop(); return; }
          onBuy(u.id);
          holdD = Math.max(60, holdD * 0.74);
          holdT = window.__ytGameTimers.setTimeout(tick, holdD);
        };
        btn.addEventListener('pointerdown', () => { stop(); holdT = window.__ytGameTimers.setTimeout(tick, 380); });
        ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => btn.addEventListener(ev, stop));
        box.appendChild(card);
        const adb = card.querySelector('.adlvl');
        if (adb) adb.addEventListener('click', () => this.runAdAction(adb, () => this.game.watchFreeLevel(u.id)));
        const info = card.querySelector('.cinfo');
        if (cls === 'meta' && u.id === 'machine') {
          info.classList.remove('hidden');
          info.textContent = 'ⓘ ' + t('machineInfo');
          info.addEventListener('click', () => this.game.showMachineInfo());
        }
        const refs = {
          root: card, btn, adb, nm: card.querySelector('.nm'), lvl: card.querySelector('.clvl'),
          desc: card.querySelector('.cdesc'), info, val: card.querySelector('.cval'),
          bt: card.querySelector('.bt'), bic: card.querySelector('.bic'),
        };
        (cls === 'meta' ? this.metaCards : this.cards)[u.id] = refs;
      }
    };
    mk(UPGRADES, this.el['shop-list'], (u) => ICONS[u.icon] || '⭐', (id) => this.game.tryBuy(id), '');
    mk(META, this.el['meta-list'], (u) => u.icon, (id) => this.game.tryBuyMeta(id), 'meta');
    this.rebuildShopTexts();
  },

  rebuildShopTexts() {
    if (!this.cards) return;
    for (const u of UPGRADES) {
      const c = this.cards[u.id];
      if (!c) continue;
      c.nm.textContent = t('u_' + u.id);
      c.desc.textContent = t('u_' + u.id + '_d');
    }
    for (const u of META) {
      const c = this.metaCards[u.id];
      if (!c) continue;
      c.nm.textContent = t('m_' + u.id);
      c.desc.textContent = t('m_' + u.id + '_d');
      if (u.id === 'machine' && c.info) c.info.textContent = 'ⓘ ' + t('machineInfo');
    }
  },

  setTab(tab) {
    this.tab = tab;
    this.el['tab-run'].classList.toggle('active', tab === 'run');
    this.el['tab-meta'].classList.toggle('active', tab === 'meta');
    this.el['shop-list'].classList.toggle('hidden', tab !== 'run');
    this.el['mults'].classList.toggle('hidden', tab !== 'run');
    this.el['shop-tip'].classList.toggle('hidden', tab !== 'run');
    this.el['meta-list'].classList.toggle('hidden', tab !== 'meta');
    this.el['meta-head'].classList.toggle('hidden', tab !== 'meta');
    this.refreshShop();
  },

  refreshShop() {
    if (!this.shopOpen) return;
    this.el['shop-cur'].textContent = this.tab === 'meta' ? '🌰' : '💰';
    this.el['shop-money'].textContent = this.tab === 'meta' ? fmtMoney(meta.acorns) : fmtMoney(run.money);

    if (this.tab === 'run') {
      for (const u of UPGRADES) {
        const c = this.cards[u.id];
        const lvl = run.upg[u.id];
        const locked = isLocked(u.id);
        const maxed = lvl >= u.max;
        c.lvl.textContent = maxed ? t('max') : t('lvl') + ' ' + lvl;
        const cur = u.fmt(u.value(lvl));
        let line = maxed ? cur : `<s>${cur}</s>→ ${u.fmt(u.value(lvl + 1))}`;
        if (u.id === 'helpers' && helperCount() > 0 && this.game) {
          line += ` <em>· ${t('helperIncome')} ${fmtMoney(this.game.helperPerSec())}${t('unit_ps')}</em>`;
        }
        c.val.innerHTML = line;
        const afford = canBuy(u.id);
        c.root.classList.toggle('locked', locked);
        c.root.classList.toggle('cant', !afford && !maxed && !locked);
        c.btn.className = 'buy' + (maxed ? ' max' : afford ? '' : ' cant');
        c.btn.disabled = maxed || locked;
        if (maxed) { c.bt.textContent = t('max'); c.bic.style.display = 'none'; }
        else if (locked) { c.bt.textContent = '🔒'; c.bic.style.display = 'none'; }
        else {
          const b = this.buyMult === 1 ? { n: 1, cost: costOf(u.id) }
            : this.buyMult === 'max' ? maxAffordable(u.id) : bulkCost(u.id, this.buyMult);
          const n = Math.max(1, b.n);
          const cost = b.n > 0 ? b.cost : costOf(u.id);
          c.bt.textContent = fmtMoney(cost) + (n > 1 ? '  ×' + n : '');
          c.bic.style.display = '';
        }
        if (c.adb) {
          const show = !maxed && !locked && this.game && this.game.canFreeLevel();
          c.adb.classList.toggle('hidden', !show);
          if (show) c.adb.title = t('freeLevelHint');
        }
      }
    } else {
      for (const u of META) {
        const c = this.metaCards[u.id];
        const lvl = meta.m[u.id];
        const maxed = lvl >= u.max;
        c.lvl.textContent = maxed ? t('max') : t('lvl') + ' ' + lvl;
        const cur = u.fmt(u.value(lvl));
        c.val.innerHTML = maxed ? cur : `<s>${cur}</s>→ ${u.fmt(u.value(lvl + 1))}`;
        if (u.id === 'machine') {
          const a = MACHINE[lvl], b = MACHINE[Math.min(MACHINE.length - 1, lvl + 1)];
          c.desc.textContent = maxed
            ? `🪓 ×${a.p.toFixed(2)}  ·  🎯 ×${a.r.toFixed(2)}  ·  👟 ×${a.s.toFixed(2)}`
            : `🪓 ×${a.p.toFixed(2)}→×${b.p.toFixed(2)}  ·  🎯 ×${a.r.toFixed(2)}→×${b.r.toFixed(2)}  ·  👟 ×${a.s.toFixed(2)}→×${b.s.toFixed(2)}`;
        }
        const afford = canBuyMeta(u.id);
        c.root.classList.toggle('cant', !afford && !maxed);
        c.btn.className = 'buy acorn' + (maxed ? ' max' : afford ? '' : ' cant');
        c.btn.disabled = maxed;
        if (maxed) { c.bt.textContent = t('max'); c.bic.style.display = 'none'; }
        else { c.bt.textContent = fmtMoney(metaCostOf(u.id)); c.bic.style.display = ''; }
      }
    }

    const got = pendingAcorns();
    const ready = canPrestige();
    this.el['prestige-num'].textContent = '+' + fmtMoney(got);
    this.el['btn-prestige'].className = 'prestigebtn' + (ready ? ' ready' : ' cant');
  },

  toggleShop(force, tab) {
    if (this.preRun && force === false) return;
    this.shopOpen = force === undefined ? !this.shopOpen : force;
    this.el['shop'].classList.toggle('hidden', !this.shopOpen);
    document.body.classList.toggle('shop-open', this.shopOpen);
    if (tab) this.setTab(tab);
    if (this.shopOpen) { this.refreshShop(); this.el['shop-dot'].classList.add('hidden'); }
    if (this.game) this.game.syncGameplayState();
    // Закрытие магазина — естественная пауза: игрок только что закончил
    // осознанное действие и ещё не побежал.
    if (!this.shopOpen && this.game && this.game.pendingInterstitial && !this.preRun) this.game.flushInterstitial('shop');
  },

  showPreRun(got = 0) {
    this.preRun = true;
    this.el['prep-got'].textContent = got > 0 ? `+🌰 ${fmtMoney(got)}` : `🌰 ${fmtMoney(meta.acorns)}`;
    this.el['prep-banner'].classList.remove('hidden');
    this.el['prep-start'].classList.remove('hidden');
    this.el['shop-close'].classList.add('hidden');
    this.el['btn-prestige'].classList.add('hidden');
    this.el['btn-reset'].classList.add('hidden');
    document.body.classList.add('prep-open');
    this.toggleShop(true, 'meta');
    // refreshShop перезадаёт className кнопки престижа, поэтому скрываем её после отрисовки.
    this.el['btn-prestige'].classList.add('hidden');
  },

  hidePreRun() {
    this.preRun = false;
    this.el['prep-banner'].classList.add('hidden');
    this.el['prep-start'].classList.add('hidden');
    this.el['shop-close'].classList.remove('hidden');
    this.el['btn-prestige'].classList.remove('hidden');
    this.el['btn-reset'].classList.remove('hidden');
    document.body.classList.remove('prep-open');
    this.toggleShop(false);
  },

  // ---------- Модалки ----------
  modal(title, bodyHtml, actions) {
    this.el['modal-title'].textContent = title;
    this.el['modal-body'].innerHTML = bodyHtml;
    const box = this.el['modal-actions'];
    box.innerHTML = '';
    for (const a of actions) {
      const b = document.createElement('button');
      b.className = 'mbtn ' + (a.cls || '');
      b.textContent = a.label;
      b.addEventListener('click', () => {
        if (!a.fn) return;
        if (a.rewarded) this.runAdAction(b, () => a.fn());
        else a.fn();
      });
      box.appendChild(b);
    }
    this.el['modal'].classList.remove('hidden');
    document.body.classList.add('modal-open');
    if (this.game) this.game.syncGameplayState();
  },

  closeModal() {
    this.el['modal'].classList.add('hidden');
    document.body.classList.remove('modal-open');
    if (this.game) this.game.syncGameplayState();
  },

  modalOpen() { return !this.el['modal'].classList.contains('hidden'); },

  placeLabel(el, p, visible) {
    const w = this.game.cssWidth, h = this.game.cssHeight;
    if (!visible || !p || this.shopOpen || this.modalOpen() || p.x < 0 || p.x > w || p.y < 0 || p.y > h) { el.style.display = 'none'; return; }
    el.style.display = 'block';
    const scale = +(document.getElementById('game-root').dataset.uiScale || 1);
    const hw = el.offsetWidth * scale / 2, hh = el.offsetHeight * scale / 2, gap = 8;
    if (hw * 2 + gap * 2 > w || hh * 2 + gap * 2 > h) { el.style.display = 'none'; return; }
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const positions = [[p.x,p.y], [p.x,p.y-hh-65], [p.x,p.y+hh+65], [p.x-hw-65,p.y], [p.x+hw+65,p.y]];
    for (const [px,py] of positions) {
      const x = clamp(px,hw+gap,w-hw-gap), y = clamp(py,hh+gap,h-hh-gap);
      const box = {left:x-hw-gap,right:x+hw+gap,top:y-hh-gap,bottom:y+hh+gap};
      if ((this.labelBounds || []).some(b => box.left < b.right && box.right > b.left && box.top < b.bottom && box.bottom > b.top)) continue;
      (this.labelBounds ||= []).push(box);
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%,-50%) scale(${scale})`;
      return;
    }
    el.style.display = 'none';
  },
};

export { ICONS };

// Обёртка над Yandex Games SDK. Всё безопасно деградирует, если SDK нет
// (локальный запуск, ошибка сети) — игра остаётся полностью рабочей.

import { LEADERBOARD } from './config.js';
import { metrics } from './metrics.js';

// Админский плейтест живёт в отдельном window.__ytStorage и никогда не читает или
// перезаписывает обычный/облачный сейв игрока.
const ADMIN_PLAYTEST = globalThis.__ADMIN_PLAYTEST__ === true;
const LS_KEY = ADMIN_PLAYTEST ? 'lumberjack_admin_save_v1' : 'lumberjack_save_v4';

// YaGames.init() может не ответить никогда: скрипт SDK загрузился, а сеть
// подвисла. Без ограничения по времени игрок остаётся на экране загрузки
// навсегда — это и модерацию не проходит, и просто выглядит как поломка.
function withTimeout(promise, ms, label) {
  let timer;
  return Promise.race([
    Promise.resolve(promise).finally(() => window.__ytGameTimers.clearTimeout(timer)),
    new Promise((_, rej) => { timer = window.__ytGameTimers.setTimeout(() => rej(new Error(label + ': превышено ожидание')), ms); }),
  ]);
}

// 只有显式 ?nosdk=1 才跳过平台 SDK。
// 以前这里还按主机名（file:/localhost/127.0.0.1/[::1]）直接跳过，结果是本地
// 离线替身（local-game/sdk.js 注入的 window.YaGames）永远不被使用、sdk.ready
// 恒为 false；Facebook 环境下同样会因为拿不到 YaGames 落进同一条 false 分支。
// 可用性现在只取决于“有没有 YaGames 提供者”：真机 SDK、本地替身或 FB 替身都
// 走同一条初始化路径，确实没有提供者时才降级为离线。
function sdkOptOut() {
  try {
    return new URLSearchParams(location.search).get('nosdk') === '1';
  } catch (e) { return false; }
}

export const sdk = {
  ysdk: null,
  player: null,
  lb: null,
  ready: false,
  loadingReady: false,
  gameplayActive: false,
  isMobile: false,
  lang: 'en',
  adPaused: false,
  adBusy: false,
  lastRewardedStatus: 'idle',
  rewardedOpenTimeoutMs: 8000,
  rewardedCloseTimeoutMs: 180000,
  interstitialOpenTimeoutMs: 8000,
  interstitialCloseTimeoutMs: 180000,
  onAdStart: null,
  onAdEnd: null,
  _lastInterstitial: 0,
  _saveTimer: null,
  _pendingSave: null,

  initTimeoutMs: 6000,

  async init() {
    try {
      if (sdkOptOut()) throw new Error('?nosdk=1 — платформа отключена явно');
      if (typeof window.YaGames === 'undefined') throw new Error('SDK не загружен');
      this.ysdk = await withTimeout(window.YaGames.init(), this.initTimeoutMs, 'YaGames.init');
      window.ysdk = this.ysdk;

      try { this.lang = this.ysdk.environment.i18n.lang || 'en'; } catch (e) {}
      try { this.isMobile = !!(this.ysdk.deviceInfo && this.ysdk.deviceInfo.isMobile()); } catch (e) {}

      if (!ADMIN_PLAYTEST) {
        try {
          this.player = await withTimeout(
            this.ysdk.getPlayer({ scopes: false, signed: false }), 5000, 'getPlayer');
        } catch (e) { this.player = null; }
      } else this.player = null;

      if (!ADMIN_PLAYTEST) {
        try {
          this.lb = this.ysdk.leaderboards ||
            (typeof this.ysdk.getLeaderboards === 'function'
              ? await withTimeout(this.ysdk.getLeaderboards(), 5000, 'getLeaderboards') : null);
        } catch (e) { this.lb = null; }
      } else this.lb = null;

      this.ready = true;
    } catch (e) {
      this.ready = false;
    }
    if (!this.isMobile) {
      this.isMobile = /Android|iPhone|iPad|iPod|Mobile|Silk/i.test(navigator.userAgent) ||
        (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform));
    }
    // 本地/离线运行时不再跟随系统语言：默认英文，避免出现俄文界面。
    if (!this.ready) this.lang = 'en';
    return this.ready;
  },

  // Сообщаем платформе, что игра отрисовалась и готова
  gameReady() {
    if (this.loadingReady) return;
    this.loadingReady = true;
    try {
      const p = this.ysdk?.features?.LoadingAPI?.ready();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch (e) {}
  },
  gameplayStart() {
    // GameplayAPI нельзя запускать до LoadingAPI.ready(). Повторные start/stop
    // тоже не отправляем: debug-панель Яндекса считает их ошибкой разметки.
    if (!this.loadingReady || this.gameplayActive) return;
    this.gameplayActive = true;
    try {
      const p = this.ysdk?.features?.GameplayAPI?.start();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch (e) {}
  },
  gameplayStop() {
    if (!this.loadingReady || !this.gameplayActive) return;
    this.gameplayActive = false;
    try {
      const p = this.ysdk?.features?.GameplayAPI?.stop();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch (e) {}
  },

  // ---------- Сохранения ----------
  async load() {
    let cloud = null;
    if (this.player) {
      try {
        const d = await this.player.getData(['save']);
        if (d && d.save) cloud = d.save;
      } catch (e) {}
    }
    let local = null;
    try {
      const raw = window.__ytStorage.getItem(LS_KEY);
      if (raw) local = JSON.parse(raw);
    } catch (e) {}
    if (cloud && local) return (cloud.savedAt || 0) >= (local.savedAt || 0) ? cloud : local;
    return cloud || local;
  },

  // Пишем с дебаунсом: облако не любит частых записей
  save(data, immediate = false) {
    this._pendingSave = data;
    try { window.__ytStorage.setItem(LS_KEY, JSON.stringify(data)); } catch (e) {}
    if (!this.player) return;
    if (this._saveTimer) window.__ytGameTimers.clearTimeout(this._saveTimer);
    const flush = () => {
      this._saveTimer = null;
      const payload = this._pendingSave;
      if (!payload) return;
      this._pendingSave = null;
      try {
        const p = this.player.setData({ save: payload }, false);
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } catch (e) {}
    };
    if (immediate) flush(); else this._saveTimer = window.__ytGameTimers.setTimeout(flush, 4000);
  },

  // ---------- Баннер ----------
  // На десктопе он уходит вбок и геймплей не трогает. На мобильном в портрете
  // съел бы верх экрана вместе с HUD, поэтому там не показываем.
  bannerShown: false,

  isDesktop() {
    try { if (this.ysdk && this.ysdk.deviceInfo) return !!this.ysdk.deviceInfo.isDesktop(); } catch (e) {}
    return !this.isMobile;
  },

  async showBanner() {
    if (!this.ready || this.bannerShown || !this.isDesktop()) return;
    try {
      await this.ysdk.adv.showBannerAdv();
      this.bannerShown = true;
    } catch (e) {}
  },

  async hideBanner() {
    if (!this.ready || !this.bannerShown) return;
    try {
      await this.ysdk.adv.hideBannerAdv();
      this.bannerShown = false;
    } catch (e) {}
  },

  // ---------- Реклама ----------
  canShowInterstitial(minGap) {
    return this.ready && !this.adBusy && (performance.now() / 1000 - this._lastInterstitial) > minGap;
  },

  showInterstitial(id = 'interstitial') {
    return new Promise((resolve) => {
      if (!this.ready || !this.ysdk.adv || this.adBusy) return resolve(false);
      this.adBusy = true;
      let opened = false;
      let settled = false;
      let openTimer = null, closeTimer = null;
      const done = (result, shown, error) => {
        if (settled) return;
        settled = true;
        window.__ytGameTimers.clearTimeout(openTimer); window.__ytGameTimers.clearTimeout(closeTimer);
        if (this.adPaused) this._resume();
        if (shown) this._lastInterstitial = performance.now() / 1000;
        if (error) metrics.adError(id, 'interstitial', error.message || error);
        metrics.adClosed(id, 'interstitial', shown);
        this.adBusy = false;
        resolve(result);
      };
      openTimer = window.__ytGameTimers.setTimeout(() => done(false, false, 'interstitial_open_timeout'), this.interstitialOpenTimeoutMs);
      try {
        this.ysdk.adv.showFullscreenAdv({
          callbacks: {
            onOpen: () => {
              if (settled) return;
              window.__ytGameTimers.clearTimeout(openTimer); opened = true; this._pause(); metrics.adOpened(id, 'interstitial');
              closeTimer = window.__ytGameTimers.setTimeout(() => done(false, true, 'interstitial_close_timeout'), this.interstitialCloseTimeoutMs);
            },
            onClose: (wasShown) => {
              const shown = !!wasShown || opened;
              done(shown, shown);
            },
            onError: (e) => done(false, opened, e || 'sdk_error'),
          },
        });
      } catch (e) { done(false, opened, e); }
    });
  },

  showRewarded(id = 'rewarded') {
    return new Promise((resolve) => {
      if (!this.ready || !this.ysdk?.adv || typeof this.ysdk.adv.showRewardedVideo !== 'function') {
        this.lastRewardedStatus = 'unavailable';
        return resolve(false);
      }
      if (this.adBusy) {
        this.lastRewardedStatus = 'busy';
        return resolve(false);
      }
      this.adBusy = true;
      this.lastRewardedStatus = 'loading';
      let opened = false;
      let rewarded = false;
      let promiseSettled = false;
      let lifecycleDone = false;
      let openTimer = null;
      let closeTimer = null;
      const settle = (result) => {
        if (promiseSettled) return;
        promiseSettled = true;
        resolve(result);
      };
      const finish = (shown, error, status) => {
        if (lifecycleDone) return;
        lifecycleDone = true;
        window.__ytGameTimers.clearTimeout(openTimer);
        window.__ytGameTimers.clearTimeout(closeTimer);
        if (this.adPaused) this._resume();
        if (error) metrics.adError(id, 'rewarded', error.message || error);
        metrics.adClosed(id, 'rewarded', shown);
        this.adBusy = false;
        this.lastRewardedStatus = rewarded ? 'rewarded' : (status || (shown ? 'closed' : 'unavailable'));
        settle(rewarded);
      };
      // Некоторые связки браузер/SDK изредка не присылают ни одного callback.
      // Без предохранителя adBusy оставался навсегда, и все следующие клики
      // молча отбрасывались. Таймер действует только до фактического открытия.
      openTimer = window.__ytGameTimers.setTimeout(() => finish(false, new Error('rewarded_open_timeout'), 'timeout'), this.rewardedOpenTimeoutMs);
      try {
        this.ysdk.adv.showRewardedVideo({
          callbacks: {
            onOpen: () => {
              if (lifecycleDone) return;
              window.__ytGameTimers.clearTimeout(openTimer);
              opened = true;
              this.lastRewardedStatus = 'opened';
              this._pause();
              metrics.adOpened(id, 'rewarded');
              closeTimer = window.__ytGameTimers.setTimeout(() => finish(true, new Error('rewarded_close_timeout'), 'timeout'), this.rewardedCloseTimeoutMs);
            },
            onRewarded: () => {
              if (lifecycleDone) return;
              window.__ytGameTimers.clearTimeout(openTimer);
              const hadOpenCallback = opened;
              opened = true;
              if (!hadOpenCallback) {
                this._pause();
                metrics.adOpened(id, 'rewarded');
                closeTimer = window.__ytGameTimers.setTimeout(() => finish(true, new Error('rewarded_close_timeout'), 'timeout'), this.rewardedCloseTimeoutMs);
              }
              if (!rewarded) metrics.adRewarded(id);
              rewarded = true;
              this.lastRewardedStatus = 'rewarded';
              // По контракту SDK награда выдаётся именно в onRewarded, а не
              // после onClose. Это также спасает браузеры с запоздалым onClose.
              settle(true);
            },
            onClose: (wasShown) => finish(!!wasShown || opened),
            onError: (e) => finish(opened, e || 'sdk_error', 'error'),
          },
        });
      } catch (e) { finish(opened, e, 'error'); }
    });
  },

  _pause() {
    if (this.adPaused) return;
    this.adPaused = true;
    this.onAdStart && this.onAdStart();
  },
  _resume() {
    if (!this.adPaused) return;
    this.adPaused = false;
    this.onAdEnd && this.onAdEnd();
  },

  // ---------- Лидерборд ----------
  async submitScore(score) {
    if (!this.lb) return false;
    const value = Math.max(0, Math.floor(score));
    try {
      if (typeof this.lb.setScore === 'function') {
        if (typeof this.ysdk?.isAvailableMethod === 'function') {
          const available = await this.ysdk.isAvailableMethod('leaderboards.setScore');
          if (!available) return false;
        }
        await this.lb.setScore(LEADERBOARD, value);
      } else if (typeof this.lb.setLeaderboardScore === 'function') {
        await this.lb.setLeaderboardScore(LEADERBOARD, value);
      } else return false;
      return true;
    } catch (e) { return false; }
  },

  async getLeaderboard() {
    if (!this.lb) return null;
    try {
      const options = { quantityTop: 10, includeUser: true, quantityAround: 3 };
      if (typeof this.lb.getEntries === 'function') {
        try { return await this.lb.getEntries(LEADERBOARD, options); }
        catch (e) { return await this.lb.getEntries(LEADERBOARD, { quantityTop: 10, includeUser: false }); }
      }
      if (typeof this.lb.getLeaderboardEntries === 'function') {
        try { return await this.lb.getLeaderboardEntries(LEADERBOARD, options); }
        catch (e) { return await this.lb.getLeaderboardEntries(LEADERBOARD, { quantityTop: 10, includeUser: false }); }
      }
      return null;
    } catch (e) { return null; }
  },
};

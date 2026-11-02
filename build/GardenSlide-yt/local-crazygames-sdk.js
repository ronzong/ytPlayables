/*
 * CrazyGames SDK v3 的本地适配层（CrazyGames 系列本地化游戏共用）。
 *
 * 目的：让原来调用 window.CrazyGames.SDK 的游戏代码在完全离线的本地单机版里
 * 继续工作，但不访问任何外部服务。保持原 API 名称、返回类型与回调顺序：
 *   - 生命周期：init()、game.loadingStart/Stop、gameplayStart/Stop、happytime
 *   - 用户/环境：environment='local'、user.systemInfo、user.isUserAccountAvailable
 *   - 存档：data.getItem/setItem/removeItem/clear（落 window.__ytStorage）
 *   - 广告：ad.requestAd(type, {adStarted,adFinished,adError})、hasAdblock
 *   - 横幅：banner.requestResponsiveBanner/requestBanner（本地直接完成，不占位）
 *   - 设置：game.addSettingsChangeListener（注册后回放一次当前静音状态）
 *
 * 2026-09-29 扩充（向后兼容，默认参数与语义不变）：补 Unity(IL2CPP) 桥实际会调用的
 * `user.getUserToken/getXsollaUserToken/addAuthListener/addScore`、
 * `banner.requestOverlayBanners(banners, cb)`、`analytics.trackOrder`、
 * `data.syncUnityGameData`、`game.hideInviteButton/showInviteButton`（此前已存在）。
 * 这些方法在此前的 CrazyGames 游戏里没被调用过，但 Crazy Office 的 Unity 桥全都在调，
 * 缺一个就会出现"Promise 永不 resolve / 回调永不触发"的卡加载。
 *
 * 调试参数（与仓库约定一致）：
 *   debug=1            打开本地 SDK 日志
 *   ads=off            默认；广告不可用，激励不发奖
 *   ads=mock&adsSec=N  弹出本地模拟广告遮罩，倒计时结束才算看完；中途关闭不发奖
 *   ads=instant        立即成功，仅供本地测试；nofill=1 优先返回无填充
 */
(function () {
  'use strict';

  if (window.CrazyGames && window.CrazyGames.SDK) return;

  var params = new URLSearchParams(location.search || '');
  var DEBUG = params.get('debug') === '1';
  var ADS_MODE = (params.get('ads') || 'off').toLowerCase();
  var NOFILL = params.get('nofill') === '1';
  var adsSecRaw = parseInt(params.get('adsSec') || '3', 10);
  var ADS_SEC = isNaN(adsSecRaw) ? 3 : Math.max(0, Math.min(30, adsSecRaw));

  function log() {
    if (DEBUG) console.info.apply(console, ['[CG-local]'].concat([].slice.call(arguments)));
  }

  // ---------------------------------------------------------------- 广告
  var overlay = null;
  function ensureOverlay() {
    if (overlay) return overlay;
    var box = document.createElement('div');
    box.id = 'cg-local-ad-overlay';
    box.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:2147483647',
      'display:none', 'align-items:center', 'justify-content:center', 'flex-direction:column',
      'background:rgba(6,10,20,.92)', 'color:#e8f1ff',
      'font:600 18px/1.6 system-ui,Segoe UI,sans-serif', 'text-align:center',
    ].join(';');
    var title = document.createElement('div');
    title.id = 'cg-local-ad-title';
    title.textContent = '广告播放中';
    var count = document.createElement('div');
    count.id = 'cg-local-ad-count';
    count.style.cssText = 'font-size:44px;margin:14px 0';
    count.textContent = String(ADS_SEC);
    var btn = document.createElement('button');
    btn.id = 'cg-local-ad-close';
    btn.textContent = '关闭';
    btn.style.cssText = [
      'padding:10px 26px', 'border:0', 'border-radius:8px', 'cursor:pointer',
      'font:600 16px system-ui', 'background:#3d7fff', 'color:#fff',
    ].join(';');
    box.appendChild(title);
    box.appendChild(count);
    box.appendChild(btn);
    (document.body || document.documentElement).appendChild(box);
    overlay = box;
    return box;
  }

  function playMockAd(type, cb) {
    var box = ensureOverlay();
    var title = box.querySelector('#cg-local-ad-title');
    var count = box.querySelector('#cg-local-ad-count');
    var btn = box.querySelector('#cg-local-ad-close');
    title.textContent = type === 'rewarded' ? '广告播放中（激励）' : '广告播放中（插屏）';
    var left = ADS_SEC;
    count.textContent = String(left);
    box.style.display = 'flex';
    var done = false;
    var finished = false;
    var timer = window.__ytGameTimers.setInterval(function () {
      left -= 1;
      count.textContent = String(Math.max(0, left));
      if (left <= 0) {
        window.__ytGameTimers.clearInterval(timer);
        finished = true;
        // 只有看完才回调 adFinished（激励才会发奖）
        if (cb.adFinished) cb.adFinished();
      }
    }, 1000);
    function close(userClosed) {
      if (done) return;
      done = true;
      window.__ytGameTimers.clearInterval(timer);
      box.style.display = 'none';
      if (!userClosed && !finished && left <= 0 && cb.adFinished) cb.adFinished();
    }
    btn.onclick = function () {
      var wasFinished = finished || left <= 0;
      close(true);
      // 中途关闭不算失败，但不发奖：按 SDK 契约走 adError。
      if (!wasFinished && cb.adError) cb.adError({ code: 'ad_closed_by_user' });
      else if (wasFinished && cb.adFinished) cb.adFinished();
    };
    if (ADS_SEC === 0) {
      window.__ytGameTimers.clearInterval(timer);
      finished = true;
      box.style.display = 'none';
      if (cb.adFinished) cb.adFinished();
    }
  }

  function requestAd(type, cb) {
    cb = cb || {};
    log('ad.requestAd', type, 'mode=' + ADS_MODE, 'nofill=' + NOFILL);
    if (cb.adStarted) {
      try {
        cb.adStarted();
      } catch (e) {
        /* ignore */
      }
    }
    if (NOFILL || ADS_MODE === 'off') {
      window.__ytGameTimers.setTimeout(function () {
        if (cb.adError) cb.adError({ code: NOFILL ? 'no_fill' : 'ads_disabled' });
      }, 0);
      return;
    }
    if (ADS_MODE === 'instant') {
      window.__ytGameTimers.setTimeout(function () {
        if (cb.adFinished) cb.adFinished();
      }, 0);
      return;
    }
    playMockAd(type, cb);
  }

  // ---------------------------------------------------------------- 存档
  // 与官方 CrazyGames SDK v3 一致：data 模块是同步 API（getItem 直接返回 string|null）。
  // 用 JSON 序列化保存，保证字符串/数字/对象都能原样取回；调用方 await 同步值也没问题。
  var PREFIX = 'cg_local_data:';
  function lsGet(key) {
    try {
      return window.__ytStorage.getItem(PREFIX + key);
    } catch (e) {
      return null;
    }
  }
  var data = {
    getItem: function (key) {
      var raw = lsGet(key);
      if (raw === null) return null;
      try {
        return JSON.parse(raw);
      } catch (e) {
        return raw;
      }
    },
    setItem: function (key, value) {
      try {
        window.__ytStorage.setItem(PREFIX + key, JSON.stringify(value));
      } catch (e) {
        /* ignore */
      }
    },
    removeItem: function (key) {
      var prev = this.getItem(key);
      try {
        window.__ytStorage.removeItem(PREFIX + key);
      } catch (e) {
        /* ignore */
      }
      return prev === undefined ? null : prev;
    },
    clear: function () {
      try {
        Object.keys(window.__ytStorage)
          .filter(function (k) {
            return k.indexOf(PREFIX) === 0;
          })
          .forEach(function (k) {
            window.__ytStorage.removeItem(k);
          });
      } catch (e) {
        /* ignore */
      }
    },
    // Unity 桥调用：官方语义是把 Unity 自己的存档刷进平台侧。
    // 本地的 getItem/setItem 已经直接落 window.__ytStorage，这里按"已完成"返回。
    syncUnityGameData: function () {
      log('data.syncUnityGameData');
      return Promise.resolve();
    },
  };

  // ---------------------------------------------------------------- 生命周期
  var events = { loadingStop: 0 };
  function emitGame(name, data_) {
    log('game.' + name, data_ || '');
  }

  // 授权状态监听：官方 SDK 在登录状态变化时回调。本地没有账号体系，
  // 注册时立刻用"未登录用户"回放一次，保证依赖它的界面能落到确定状态。
  var authListeners = [];
  function addAuthListener(fn) {
    if (typeof fn !== 'function') return;
    authListeners.push(fn);
    window.__ytGameTimers.setTimeout(function () {
      try {
        fn(null);
      } catch (e) {
        /* ignore */
      }
    }, 0);
  }

  var settingsListeners = [];
  var settings = { muteAudio: false };

  // 设备信息：官方 SDK 里是同步属性，不是 Promise。
  var touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  var systemInfo = {
    countryCode: 'ZZ',
    locale: (navigator.language || 'en').replace('-', '_'),
    device: { type: touch ? 'mobile' : 'desktop', mobileType: touch ? 'mobile' : undefined },
    browser: { name: 'Chrome', version: 'local' },
    os: { name: 'local', version: 'local' },
    applicationType: 'web',
  };

  var SDK = {
    // 标记：本地适配层的实现（与 Poki 适配层的 __localPokiSdk 对应，便于验收探针确认
    // "用的是本地实现"而不是官方 CDN 脚本）。
    __localCrazySdk: true,
    environment: 'local',
    isQaTool: false,
    user: {
      // 官方 SDK 是 getter 属性（布尔）；本地无账号体系，固定 false。
      get isUserAccountAvailable() {
        return false;
      },
      getUser: function () {
        return Promise.resolve(null);
      },
      // Unity(IL2CPP) 桥会直接调用这几个（PluginYG / 官方 unity 包）：
      // 一次性返回"未登录"的确定结果，避免 Promise 永远挂起。
      getUserToken: function () {
        return Promise.resolve('');
      },
      getXsollaUserToken: function () {
        return Promise.resolve('');
      },
      addAuthListener: addAuthListener,
      addScore: function (score) {
        log('user.addScore', score);
        return Promise.resolve(null);
      },
      get systemInfo() {
        return systemInfo;
      },
      getSystemInfo: function () {
        return systemInfo;
      },
      showAuthPrompt: function () {
        return Promise.resolve({ success: false, reason: 'local' });
      },
      showAccountLinkPrompt: function () {
        return Promise.resolve({ success: false, reason: 'local' });
      },
    },
    data: data,
    game: {
      // 官方 SDK 暴露当前设置；本地固定不静音。
      settings: { disableChat: true, muteAudio: false },
      loadingStart: function () {
        emitGame('loadingStart');
      },
      loadingStop: function () {
        events.loadingStop += 1;
        emitGame('loadingStop');
      },
      gameplayStart: function () {
        emitGame('gameplayStart');
      },
      gameplayStop: function () {
        emitGame('gameplayStop');
      },
      happytime: function () {
        emitGame('happytime');
      },
      setGameContext: function (ctx) {
        emitGame('setGameContext', ctx);
      },
      clearGameContext: function () {
        emitGame('clearGameContext');
      },
      inviteLink: function () {
        emitGame('inviteLink');
        return location.href;
      },
      showInviteButton: function () {
        emitGame('showInviteButton');
        return null;
      },
      hideInviteButton: function () {
        emitGame('hideInviteButton');
      },
      getInviteParam: function () {
        return null;
      },
      sdkGameLoadingStart: function () {
        emitGame('sdkGameLoadingStart');
      },
      sdkGameLoadingStop: function () {
        emitGame('sdkGameLoadingStop');
      },
      addSettingsChangeListener: function (fn) {
        if (typeof fn !== 'function') return;
        settingsListeners.push(fn);
        try {
          fn({ muteAudio: settings.muteAudio });
        } catch (e) {
          /* ignore */
        }
      },
      removeSettingsChangeListener: function (fn) {
        var i = settingsListeners.indexOf(fn);
        if (i >= 0) settingsListeners.splice(i, 1);
      },
    },
    ad: {
      requestAd: requestAd,
      hasAdblock: function () {
        return Promise.resolve(false);
      },
    },
    banner: {
      requestBanner: function () {
        return Promise.resolve();
      },
      requestResponsiveBanner: function () {
        return Promise.resolve();
      },
      clearBanner: function () {
        return Promise.resolve();
      },
      clearAllBanners: function () {
        return Promise.resolve();
      },
      // Unity 桥用的是 requestOverlayBanners(banners, cb)：
      // cb(bannerId, message, error)，本地按"请求失败"回一次，避免调用方等不到回调。
      requestOverlayBanners: function (banners, cb) {
        log('banner.requestOverlayBanners');
        if (typeof cb === 'function') {
          window.__ytGameTimers.setTimeout(function () {
            try {
              cb(null, null, { code: 'local_unavailable' });
            } catch (e) {
              /* ignore */
            }
          }, 0);
        }
        return Promise.resolve();
      },
    },
    auth: {
      isUserAccountAvailable: false,
      getUser: function () {
        return Promise.resolve(null);
      },
      showAuthPrompt: function () {
        return Promise.resolve({ success: false, reason: 'local' });
      },
    },
    leaderboards: {
      getLeaderboard: function () {
        return Promise.resolve(null);
      },
      submitScore: function () {
        return Promise.resolve(null);
      },
    },
    analytics: {
      track: function () {},
      // PluginYG2 会把内购订单同步给平台侧分析；本地只记日志。
      trackOrder: function (provider, order) {
        log('analytics.trackOrder', provider, order);
        return Promise.resolve(null);
      },
    },
    init: function () {
      log('SDK.init');
      return Promise.resolve();
    },
  };

  window.CrazyGames = {
    SDK: SDK,
    // 兼容部分构建读取的字段
    environment: 'local',
    isQaTool: false,
  };

  log('CrazyGames 本地 SDK 就绪（ads=' + ADS_MODE + '）');
})();

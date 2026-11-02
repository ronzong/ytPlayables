// 本地 PlayHop/Yandex SDK 兼容层。默认严格离线且广告不可用；仅显式参数启用模拟。
(function () {
  'use strict';
  var params = new URLSearchParams(location.search);
  var adMode = params.get('ads') || 'off';
  var noFill = params.get('nofill') === '1';
  var adSeconds = Math.max(0, Math.min(30, Number(params.get('adsSec')) || 2));
  var dataKey = 'lumberjack_platform_data_v1';
  function readData() { try { return JSON.parse(window.__ytStorage.getItem(dataKey) || '{}'); } catch (_) { return {}; } }
  function writeData(value) { try { window.__ytStorage.setItem(dataKey, JSON.stringify(value || {})); } catch (_) { /* 存储不可用时保持可玩 */ } }
  function callbacks(options) { return options && options.callbacks || {}; }
  function adError() { var e = new Error(noFill ? 'NO_FILL' : 'ADS_NOT_AVAILABLE'); e.code = e.message; return e; }

  // ---------- 本地模拟广告遮罩 ----------
  // ads=mock 时弹一个可见遮罩并倒计时；倒计时结束才算“看完”，中途点关闭按
  // onClose(false) 收尾（激励不发奖）。没有 DOM（Node 自检）或时长为 0 时退回到
  // 纯计时，不创建任何节点。
  var adOverlay = null, adOverlayTimer = null;
  var OVERLAY_ID = 'lumberjack-mock-ad';
  function hideAdOverlay() {
    if (adOverlayTimer) { window.__ytGameTimers.clearInterval(adOverlayTimer); adOverlayTimer = null; }
    if (adOverlay && adOverlay.parentNode) adOverlay.parentNode.removeChild(adOverlay);
    adOverlay = null;
  }
  function showAdOverlay(kind, seconds, onDone, onSkip) {
    hideAdOverlay();
    var root = document.createElement('div');
    root.id = OVERLAY_ID;
    root.style.cssText = 'position:fixed;inset:0;z-index:2147483600;display:flex;' +
      'align-items:center;justify-content:center;background:rgba(0,0,0,.86);color:#fff;' +
      'font:600 16px/1.5 system-ui,Arial,sans-serif;text-align:center';
    var box = document.createElement('div');
    box.style.cssText = 'max-width:520px;padding:24px 28px;border-radius:16px;' +
      'background:#1b1f24;box-shadow:0 10px 40px rgba(0,0,0,.5)';
    var title = document.createElement('div');
    title.textContent = '本地模拟广告 · ' + (kind === 'rewarded' ? '激励' : '插屏');
    title.style.cssText = 'font-size:14px;opacity:.75;letter-spacing:.04em';
    var left = document.createElement('div');
    left.style.cssText = 'font-size:40px;font-weight:800;margin:6px 0 2px';
    var hint = document.createElement('div');
    hint.textContent = kind === 'rewarded' ? '倒计时结束后发奖，中途关闭不发奖' : '倒计时结束后继续游戏';
    hint.style.cssText = 'font-size:13px;opacity:.66';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = kind === 'rewarded' ? '关闭（不发奖）' : '关闭';
    btn.style.cssText = 'margin-top:16px;padding:10px 18px;border:0;border-radius:10px;' +
      'background:#3a4048;color:#fff;font:inherit;cursor:pointer';
    var remain = Math.max(1, Math.ceil(seconds));
    left.textContent = remain + 's';
    btn.addEventListener('click', function () { hideAdOverlay(); onSkip(); });
    box.appendChild(title); box.appendChild(left); box.appendChild(hint); box.appendChild(btn);
    root.appendChild(box);
    document.body.appendChild(root);
    adOverlay = root;
    adOverlayTimer = window.__ytGameTimers.setInterval(function () {
      remain -= 1;
      if (remain <= 0) { hideAdOverlay(); onDone(); return; }
      left.textContent = remain + 's';
    }, 1000);
  }

  function runAd(options, rewarded) {
    var cb = callbacks(options);
    if (noFill || adMode === 'off') {
      window.__ytGameTimers.setTimeout(function () { if (cb.onError) cb.onError(adError()); else if (cb.onClose) cb.onClose(false); }, 0);
      return;
    }
    var kind = rewarded ? 'rewarded' : 'interstitial';
    var seconds = adMode === 'instant' ? 0 : adSeconds;
    var opened = false;
    var open = function () { if (!opened) { opened = true; if (cb.onOpen) cb.onOpen(); } };
    var complete = function () {
      if (rewarded && cb.onRewarded) cb.onRewarded();
      if (cb.onClose) cb.onClose(true);
    };
    var hasDom = typeof document !== 'undefined' && document.createElement && document.body;
    if (!hasDom || seconds <= 0) {
      window.__ytGameTimers.setTimeout(function () { open(); window.__ytGameTimers.setTimeout(complete, 0); }, 0);
      return;
    }
    window.__ytGameTimers.setTimeout(function () {
      if (params.get('debug') === '1') console.info('[local-ad]', kind, seconds + 's 遮罩');
      open();
      showAdOverlay(kind, seconds, complete, function () {
        if (params.get('debug') === '1') console.info('[local-ad]', kind, '中途关闭，不发奖');
        if (cb.onClose) cb.onClose(false);
      });
    }, 0);
  }
  var player = {
    getData: function () { return Promise.resolve(readData()); },
    setData: function (value) { writeData(value); return Promise.resolve(); },
    getName: function () { return 'Local Player'; }, getUniqueID: function () { return 'local-player'; }, getMode: function () { return 'lite'; }
  };
  var storage = {
    getItem: function (key) { return Promise.resolve(window.__ytStorage.getItem(key)); },
    setItem: function (key, value) { window.__ytStorage.setItem(key, String(value)); return Promise.resolve(); },
    removeItem: function (key) { window.__ytStorage.removeItem(key); return Promise.resolve(); }
  };
  var sdk = {
    environment: { i18n: { lang: 'en', tld: 'local' } },
    features: { LoadingAPI: { ready: function () { return Promise.resolve(); } }, GameplayAPI: { start: function () { return Promise.resolve(); }, stop: function () { return Promise.resolve(); } } },
    deviceInfo: { isMobile: function () { return matchMedia('(pointer: coarse)').matches; }, isDesktop: function () { return !matchMedia('(pointer: coarse)').matches; }, isTablet: function () { return false; }, isTV: function () { return false; } },
    getPlayer: function () { return Promise.resolve(player); }, getStorage: function () { return Promise.resolve(storage); },
    isAvailableMethod: function () { return Promise.resolve(false); }, getLeaderboards: function () { return Promise.resolve(null); }, leaderboards: null,
    adv: { showFullscreenAdv: function (o) { runAd(o, false); }, showRewardedVideo: function (o) { runAd(o, true); }, getBannerAdvStatus: function () { return Promise.resolve({ stickyAdvIsShowing: false }); }, showBannerAdv: function () { return Promise.resolve(); }, hideBannerAdv: function () { return Promise.resolve(); } },
    screen: { fullscreen: { request: function () { return Promise.resolve(); }, exit: function () { return Promise.resolve(); } } }, feedback: { canReview: function () { return Promise.resolve({ value: false }); } }
  };
  window.YaGames = { init: function () { return Promise.resolve(sdk); } };
  if (params.get('debug') === '1') console.info('[local-sdk]', { adMode: adMode, noFill: noFill, adSeconds: adSeconds });
}());

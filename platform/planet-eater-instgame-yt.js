/* Planet Eater：保持 Unity 的 instgame Promise 调用面，接入真实 YouTube SDK。 */
(function () {
  'use strict';
  var P = window.__ytPlayables;
  var unityFS, busy = false;
  var lastScore = -1;
  // Unity 既用 RAF 也用定时器推进主循环/托管回调；定时器同样必须冻结。
  var pendingTimers = new Map(), nextTimer = 1;
  var timers = window.__ytUnityTimers = {
    setTimeout: function (cb, ms) { return createTimer(cb, ms, false); },
    setInterval: function (cb, ms) { return createTimer(cb, ms, true); },
    clearTimeout: cancelTimer, clearInterval: cancelTimer
  };
  function createTimer(cb, ms, repeat) {
    var id = nextTimer++, entry = { cb: cb, repeat: repeat, due: false };
    pendingTimers.set(id, entry);
    entry.native = (repeat ? setInterval : setTimeout)(function () {
      if (P.isPaused()) { entry.due = true; return; }
      if (!repeat) pendingTimers.delete(id);
      cb();
    }, ms);
    return id;
  }
  function cancelTimer(id) {
    var entry = pendingTimers.get(id); if (!entry) return;
    (entry.repeat ? clearInterval : clearTimeout)(entry.native); pendingTimers.delete(id);
  }
  P.pauseGate.onPauseChange(function (paused) {
    if (paused) return;
    pendingTimers.forEach(function (entry, id) {
      if (!entry.due) return;
      entry.due = false;
      if (!entry.repeat) pendingTimers.delete(id);
      entry.cb();
    });
  });
  var nativeFlush = P.save.flush;
  // 在任何 SDK 暂停存档之前，同步采集 Unity 的真实 PlayerPrefs 文件。
  P.save.flush = function (force) {
    if (unityFS) capture(unityFS);
    return nativeFlush(force);
  };
  function capture(FS) {
    var files = {};
    function walk(dir) {
      FS.readdir(dir).filter(function (n) { return n !== '.' && n !== '..'; }).forEach(function (n) {
        var path = dir + '/' + n, st = FS.stat(path);
        if (FS.isDir(st.mode)) walk(path);
        else {
          var bytes = FS.readFile(path), text = '';
          for (var i = 0; i < bytes.length; i++) text += String.fromCharCode(bytes[i]);
          files[path] = btoa(text);
          // 分数来自原游戏实际保存的质量；只上报整数，不为预检制造分数。
          if (!P.isPaused() && window.ytgame && ytgame.engagement) {
            var decoded = new TextDecoder().decode(bytes);
            var match = /game_save_data[^{]*({[^}]+})/.exec(decoded);
            if (match) {
              try {
                var mass = Math.floor(Number(JSON.parse(match[1]).mass));
                if (Number.isSafeInteger(mass) && mass >= 0 && mass > lastScore) {
                  lastScore = mass;
                  ytgame.engagement.sendScore({ value: mass }).catch(function (e) { console.warn('[yt] 质量上报失败', e); });
                }
              } catch (e) { /* 旧版存档结构不同则跳过上报，保留原档。 */ }
            }
          }
        }
      });
    }
    walk('/idbfs');
    var raw = JSON.stringify(files);
    if (raw !== P.storage.getItem('unity-files')) P.storage.setItem('unity-files', raw);
  }
  // 构建时替换 IDBFS.syncfs；只挂内存 FS，不访问被平台禁用的 IndexedDB。
  window.__ytUnitySync = function (FS, mount, populate, callback) {
    unityFS = FS;
    try {
      if (populate) {
        var files;
        try { files = JSON.parse(P.storage.getItem('unity-files') || '{}') || {}; }
        catch (e) { console.warn('[yt] 旧版 Unity 存档无效，按空存档启动'); files = {}; }
        Object.keys(files).forEach(function (path) {
          if (!/^\/idbfs\/[a-zA-Z0-9_./-]+$/.test(path) || path.indexOf('..') >= 0) return;
          FS.mkdirTree(path.slice(0, path.lastIndexOf('/')));
          var text = atob(files[path]), bytes = new Uint8Array(text.length);
          for (var i = 0; i < text.length; i++) bytes[i] = text.charCodeAt(i);
          FS.writeFile(path, bytes);
        });
      } else if (!P.isPaused()) capture(FS);
      callback(null);
    } catch (e) { callback(e); }
  };
  window.__localBootReady = false;
  ['pointerdown', 'mousedown', 'touchstart', 'keydown'].forEach(function (type) {
    document.addEventListener(type, function (e) {
      if (!window.__localBootReady) { e.preventDefault(); e.stopImmediatePropagation(); }
    }, { capture: true, passive: false });
  });
  window.localBootReady = function (instance, bar, canvas) {
    bar.style.display = 'none'; canvas.style.pointerEvents = 'none';
    var start = Date.now();
    var timer = setInterval(function () {
      // 此地址只适用于构建脚本校验 SHA256 的 wasm；场景初始化完成才上报可玩。
      if (P.isPaused()) return;
      if (instance.Module.HEAPU8[4274455] === 1) {
        clearInterval(timer); canvas.style.pointerEvents = 'auto';
        window.__localBootReady = true; P.system.gameReady();
      } else if (Date.now() - start > 60000) {
        clearInterval(timer); console.error('[yt] Unity 正式菜单初始化超时');
      }
    }, 100);
  };
  function ad(reward) {
    if (busy) return Promise.reject(new Error('AD_BUSY'));
    busy = true;
    var promise = reward ? P.ads.showRewarded('planet-eater-bonus') : P.ads.showInterstitial();
    return promise.then(function (earned) {
      if (reward && earned !== true) throw new Error('NO_REWARD');
    }).finally(function () { busy = false; });
  }
  window.instgame = {
    initializeAsync: function () { return P.save.init(null); },
    startGameAsync: function () {
      // 加载 UI 在首个浏览器绘制后可见，先通知平台展示，再加载 Unity。
      return new Promise(function (resolve) {
        requestAnimationFrame(function () { P.system.firstFrameReady(); resolve(); });
      });
    },
    getEntryPointAsync: function () { return Promise.resolve('youtube'); },
    context: { getType: function () { return 'SOLO'; } },
    onGameEvent: function () {},
    isBannerReady: function () { return false; }, showBanner: function () {}, hideBanner: function () {},
    isInterstitialReady: function () { return !!(window.ytgame && ytgame.ads && !busy); },
    isRewardvideoReady: function () { return !!(window.ytgame && ytgame.ads && !busy); },
    showInterstitial: function () { return ad(false); },
    showRewardedVideo: function () { return ad(true); }
  };
})();

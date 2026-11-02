/*!
 * YouTube Playables 合规运行时（各游戏共用）
 *
 * 由构建脚本拼在游戏自己的 SDK 适配层前面，一起替换游戏里的 sdk.js。
 * 提供这些能力（全部在**引擎/游戏代码加载之前**安装）：
 *   1. 屏蔽 Page Visibility 类事件注册（visibilitychange / pagehide / pageshow / blur / focus），
 *      并把 document.hidden / visibilityState 固定为“可见” → 暂停恢复只能走 SDK 的 onPause/onResume；
 *   2. 内存存储（Playables 环境里 window.localStorage 被官方 SDK 置为 null 且不可改写）→ 暴露为
 *      window.__ytStorage，并可通过 bindEngineStorage() 顶到 cc.sys.localStorage 上；
 *   3. 暂停闸门：冻结 requestAnimationFrame（游戏循环/渲染）、拦输入、静音、暂停期间不发起新请求；
 *   4. 云存档：把白名单键快照成一块 JSON 走 ytgame.game.loadData/saveData，节流上传 + 暂停时强制落盘；
 *   5. 广告：requestInterstitialAd / requestRewardedAd（只有 resolve(true) 才发奖）；
 *   6. 系统：firstFrameReady / gameReady / getLanguage。
 *
 * 对外接口：window.__ytPlayables（诊断与自动化测试用）
 */
(function () {
  'use strict';

  var g = typeof window !== 'undefined' ? window : globalThis;
  var doc = typeof document !== 'undefined' ? document : null;
  var TAG = '[yt]';
  var flags = String((doc && doc.location && doc.location.hash) || '');
  var DEBUG = {
    heartbeat: flags.indexOf('ytdebug') >= 0,
    noAudio: flags.indexOf('ytnoaudio') >= 0,
    noLeaderboard: flags.indexOf('ytnoleader') >= 0,
    noSave: flags.indexOf('ytnosave') >= 0,
  };
  var ytgame = g.ytgame || null;
  var inPlayables = !!(ytgame && ytgame.IN_PLAYABLES_ENV);

  function log() {
    try {
      var a = Array.prototype.slice.call(arguments);
      a.unshift(TAG);
      console.log.apply(console, a);
    } catch (_e) { /* ignore */ }
  }
  function warn() {
    try {
      var a = Array.prototype.slice.call(arguments);
      a.unshift(TAG);
      console.warn.apply(console, a);
    } catch (_e) { /* ignore */ }
  }
  function callSafe(fn, thisArg, args) {
    if (typeof fn !== 'function') return undefined;
    try {
      return fn.apply(thisArg, args || []);
    } catch (e) {
      warn('回调执行失败', e);
      return undefined;
    }
  }

  /* ------------------------------------------------------------------ *
   * 1. 屏蔽 Page Visibility 类事件注册
   * ------------------------------------------------------------------ */
  var visibilityBlockedCount = 0;
  (function installVisibilityBlock() {
    var BLOCKED = {
      visibilitychange: 1, mozvisibilitychange: 1, msvisibilitychange: 1,
      webkitvisibilitychange: 1, qbrowservisibilitychange: 1,
      pagehide: 1, pageshow: 1, blur: 1, focus: 1,
    };
    function wrap(target) {
      if (!target || typeof target.addEventListener !== 'function' || target.__ytVisibilityBlocked) return;
      target.__ytVisibilityBlocked = true;
      var original = target.addEventListener;
      target.addEventListener = function (type) {
        if (BLOCKED[String(type).toLowerCase()]) {
          visibilityBlockedCount += 1;
          return;
        }
        return original.apply(this, arguments);
      };
    }
    wrap(g);
    wrap(doc);
    try {
      Object.defineProperty(doc, 'hidden', { configurable: true, get: function () { return false; } });
    } catch (_e) { /* ignore */ }
    try {
      Object.defineProperty(doc, 'visibilityState', { configurable: true, get: function () { return 'visible'; } });
    } catch (_e) { /* ignore */ }
  })();

  /* ------------------------------------------------------------------ *
   * 1.5 中和「离屏 DOM 覆盖层」：外壳/引擎会在 <body> 下塞一些定位在负坐标的隐藏节点
   *     （例如字体预加载用的 <div style="font-family:fonts_X; left:-100px; top:-100px">）。
   *     在竖屏/窄视口里（Playables 就是）这些节点会压在 canvas 左上角，把点击全部吃掉，
   *     表现为“某个按钮点了没反应、也没有日志”。它们不是交互元素，这里统一设为
   *     pointer-events:none（只处理负坐标定位的绝对/固定定位元素）。
   * ------------------------------------------------------------------ */
  var overlayNeutralized = 0;
  function neutralizeOffscreenOverlays() {
    if (!doc || !doc.body || !doc.body.children) return overlayNeutralized;
    for (var i = 0; i < doc.body.children.length; i++) {
      var el = doc.body.children[i];
      if (!el || el.tagName === 'CANVAS') continue;
      var st = el.style || {};
      if (String(st.pointerEvents || '') === 'none') continue;
      var cs = g.getComputedStyle ? g.getComputedStyle(el) : null;
      var pos = st.position || (cs && cs.position) || '';
      if (pos !== 'absolute' && pos !== 'fixed') continue;
      var left = parseFloat(st.left || (cs && cs.left) || '0');
      var top = parseFloat(st.top || (cs && cs.top) || '0');
      if (!(left < 0 || top < 0)) continue;
      try {
        st.pointerEvents = 'none';
        overlayNeutralized += 1;
        log('已中和离屏覆盖层（pointer-events:none）:', el.tagName + (el.id ? '#' + el.id : ''), 'left=' + left, 'top=' + top);
      } catch (_e) { /* ignore */ }
    }
    return overlayNeutralized;
  }
  function watchOffscreenOverlays() {
    neutralizeOffscreenOverlays();
    // 页面/场景切换时还会再建，前 60 秒定期扫，另外用 MutationObserver 兜底
    var ticks = 0;
    var timer = setInterval(function () {
      ticks += 1;
      neutralizeOffscreenOverlays();
      if (ticks > 120) clearInterval(timer);
    }, 500);
    try {
      if (g.MutationObserver && doc.body) {
        new g.MutationObserver(function () { neutralizeOffscreenOverlays(); })
          .observe(doc.body, { childList: true, subtree: false });
      }
    } catch (_e) { /* ignore */ }
  }
  watchOffscreenOverlays();

  /* ------------------------------------------------------------------ *
   * 2. 内存存储（替代被置为 null 的 localStorage）
   * ------------------------------------------------------------------ */
  var storage = (function () {
    var map = Object.create(null);
    var watchers = [];

    function notify(key, value) {
      for (var i = 0; i < watchers.length; i++) callSafe(watchers[i], null, [String(key), value]);
    }
    var store = {
      getItem: function (key) {
        key = String(key);
        return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : null;
      },
      setItem: function (key, value) {
        key = String(key);
        var text = String(value);
        map[key] = text;
        notify(key, text);
      },
      removeItem: function (key) {
        key = String(key);
        var had = Object.prototype.hasOwnProperty.call(map, key);
        delete map[key];
        if (had) notify(key, null);
      },
      clear: function () {
        var keys = Object.keys(map);
        map = Object.create(null);
        for (var i = 0; i < keys.length; i++) notify(keys[i], null);
      },
      key: function (index) {
        var keys = Object.keys(map);
        index = Number(index) || 0;
        return index >= 0 && index < keys.length ? keys[index] : null;
      },
      get length() {
        return Object.keys(map).length;
      },
      /** 内部用：快照/恢复，不触发 watcher */
      __snapshot: function (keys) {
        var out = {};
        var list = keys || Object.keys(map);
        for (var i = 0; i < list.length; i++) {
          if (Object.prototype.hasOwnProperty.call(map, list[i])) out[list[i]] = map[list[i]];
        }
        return out;
      },
      __restore: function (data) {
        if (!data || typeof data !== 'object') return;
        for (var k in data) {
          if (Object.prototype.hasOwnProperty.call(data, k)) map[String(k)] = String(data[k]);
        }
      },
      __onWrite: function (cb) {
        watchers.push(cb);
        return function off() {
          var i = watchers.indexOf(cb);
          if (i >= 0) watchers.splice(i, 1);
        };
      },
    };
    g.__ytStorage = store;
    return store;
  })();

  /**
   * 把内存存储顶到引擎的 cc.sys.localStorage 上（Cocos 2.x/3.x 都是读这个属性）。
   * 引擎启动时会因为 window.localStorage 为 null 而回退成空实现，所以要在它初始化后覆盖回来。
   */
  function bindEngineStorage() {
    if (g.__ytEngineStorageBound) return;
    var ticks = 0;
    var timer = setInterval(function () {
      ticks += 1;
      try {
        var cc = g.cc;
        if (cc && cc.sys && cc.sys.localStorage !== storage) {
          cc.sys.localStorage = storage;
          log('已把内存存储接到 cc.sys.localStorage');
          g.__ytEngineStorageBound = true;
          clearInterval(timer);
          return;
        }
        if (cc && cc.sys) g.__ytEngineStorageBound = true;
      } catch (_e) { /* ignore */ }
      if (ticks > 3000) clearInterval(timer); // 最多轮询 30s
    }, 10);
  }

  /**
   * Cocos 2.x 的输入管理器只在 window.resize 时更新 canvas 位置缓存
   * （`cc.inputManager._canvasBoundingRect`），而门户外壳/播放器会在加载完成后才把画布
   * 挪到最终位置（Playables 的 iframe 里画布常常带一个顶部偏移），之后不会再触发 resize，
   * 于是**鼠标/触摸坐标整体偏移**，表现为“顶部/边缘的按钮点不动、也没有日志”。
   * 这里定期（以及 resize/orientationchange/canvas 尺寸变化时）让引擎重算一次。
   */
  var lastCanvasRectSig = '';
  function refreshEngineInputRect() {
    var canvas = doc && doc.getElementById ? doc.getElementById('GameCanvas') : null;
    if (!canvas) return false;
    var r = canvas.getBoundingClientRect();
    var sig = [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)].join(',');
    if (sig === lastCanvasRectSig) return false; // 画布没动就不打扰
    lastCanvasRectSig = sig;
    var cc = g.cc;
    try {
      if (cc && cc.inputManager && typeof cc.inputManager._updateCanvasBoundingRect === 'function') {
        cc.inputManager._updateCanvasBoundingRect();
      }
    } catch (_e) { /* ignore */ }
    // 引擎只监听 window.resize 来重算画布位置；画布位置变化时补一次合成 resize
    try {
      g.dispatchEvent(new Event('resize'));
    } catch (_e) { /* ignore */ }
    log('画布位置变化，已让引擎重算输入映射:', sig);
    return true;
  }

  function installInputRectRefresh() {
    var ticks = 0;
    var timer = setInterval(function () {
      ticks += 1;
      refreshEngineInputRect();
      if (ticks > 600) clearInterval(timer); // 最多盯 5 分钟
    }, 500);
    g.addEventListener('resize', refreshEngineInputRect, { passive: true });
    g.addEventListener('orientationchange', refreshEngineInputRect, { passive: true });
    try {
      if (g.ResizeObserver && doc && doc.getElementById('GameCanvas')) {
        new g.ResizeObserver(function () { refreshEngineInputRect(); })
          .observe(doc.getElementById('GameCanvas'));
      }
    } catch (_e) { /* ignore */ }
  }
  installInputRectRefresh();

  /* ------------------------------------------------------------------ *
   * 3. 暂停闸门：rAF / 输入 / 网络
   * ------------------------------------------------------------------ */
  var pauseGate = (function () {
    var paused = false;
    var frameCount = 0;
    var rafQueue = [];
    var queueIdSeq = 1;
    var queuedIds = Object.create(null);
    var listeners = [];
    var realRaf = typeof g.requestAnimationFrame === 'function' ? g.requestAnimationFrame.bind(g) : null;
    var realCaf = typeof g.cancelAnimationFrame === 'function' ? g.cancelAnimationFrame.bind(g) : null;
    var INPUT_EVENTS = [
      'pointerdown', 'pointermove', 'pointerup', 'pointercancel',
      'mousedown', 'mouseup', 'mousemove', 'click', 'dblclick', 'contextmenu',
      'touchstart', 'touchmove', 'touchend', 'touchcancel',
      'wheel', 'keydown', 'keyup', 'keypress',
    ];

    function installFrameGate() {
      if (!realRaf || g.__ytFrameGateInstalled) return;
      g.__ytFrameGateInstalled = true;
      g.requestAnimationFrame = function (cb) {
        if (!paused) {
          return realRaf(function (t) {
            frameCount += 1;
            return cb(t);
          });
        }
        var id = queueIdSeq++;
        rafQueue.push({ id: id, cb: cb });
        queuedIds[id] = true;
        return id;
      };
      g.cancelAnimationFrame = function (id) {
        if (queuedIds[id]) {
          delete queuedIds[id];
          for (var i = 0; i < rafQueue.length; i++) {
            if (rafQueue[i].id === id) {
              rafQueue.splice(i, 1);
              return;
            }
          }
          return;
        }
        if (realCaf) realCaf(id);
      };
    }

    function blockInput(e) {
      if (!paused) return;
      if (e.cancelable) e.preventDefault();
      e.stopImmediatePropagation();
      e.stopPropagation();
    }

    function installInputGate() {
      if (!doc || g.__ytInputGateInstalled) return;
      g.__ytInputGateInstalled = true;
      for (var i = 0; i < INPUT_EVENTS.length; i++) {
        var opt = { capture: true, passive: false };
        g.addEventListener(INPUT_EVENTS[i], blockInput, opt);
        doc.addEventListener(INPUT_EVENTS[i], blockInput, opt);
      }
    }

    function installNetworkGate() {
      var RealXHR = g.XMLHttpRequest;
      if (RealXHR && RealXHR.prototype && !RealXHR.prototype.__ytGated) {
        RealXHR.prototype.__ytGated = true;
        var realSend = RealXHR.prototype.send;
        RealXHR.prototype.send = function () {
          var self = this;
          var args = arguments;
          if (!paused) return realSend.apply(this, args);
          var off = onPauseChange(function (nowPaused) {
            if (nowPaused) return;
            off();
            realSend.apply(self, args);
          });
          return undefined;
        };
      }
      if (typeof g.fetch === 'function' && !g.fetch.__ytGated) {
        var realFetch = g.fetch.bind(g);
        var gatedFetch = function () {
          var args = arguments;
          if (!paused) return realFetch.apply(null, args);
          return new Promise(function (resolve, reject) {
            var off = onPauseChange(function (nowPaused) {
              if (nowPaused) return;
              off();
              realFetch.apply(null, args).then(resolve, reject);
            });
          });
        };
        gatedFetch.__ytGated = true;
        g.fetch = gatedFetch;
      }
    }

    function flushQueue() {
      var queue = rafQueue;
      rafQueue = [];
      queuedIds = Object.create(null);
      for (var i = 0; i < queue.length; i++) realRaf(queue[i].cb);
    }

    function onPauseChange(cb) {
      listeners.push(cb);
      return function off() {
        var i = listeners.indexOf(cb);
        if (i >= 0) listeners.splice(i, 1);
      };
    }

    function pause(reason) {
      if (paused) return;
      paused = true;
      audioGate.setPaused(true);
      log('已暂停（冻结游戏循环/渲染/输入/音频/新请求）' + (reason ? ' 原因: ' + reason : ''));
      for (var i = 0; i < listeners.length; i++) callSafe(listeners[i], null, [true]);
    }

    function resume(reason) {
      if (!paused) return;
      paused = false;
      audioGate.setPaused(false);
      flushQueue();
      log('已恢复' + (reason ? ' 原因: ' + reason : ''));
      for (var i = 0; i < listeners.length; i++) callSafe(listeners[i], null, [false]);
    }

    installFrameGate();
    installInputGate();
    installNetworkGate();
    return {
      pause: pause,
      resume: resume,
      isPaused: function () { return paused; },
      getFrameCount: function () { return frameCount; },
      onPauseChange: onPauseChange,
    };
  })();

  /* ------------------------------------------------------------------ *
   * 3.5 外部请求闸门：游戏不得向任何外部地址发请求（认证 - 隐私与数据要求）
   *
   * 线上由平台下发的 CSP（connect-src 'self' blob: data:）兜底，这里做到“连试都不试”：
   * 非同源的 XMLHttpRequest / fetch 直接失败（模拟网络错误），与 CSP 拦截后的行为一致，
   * 但不会真的把请求发出去。同源、blob:、data: 不受影响。
   * ------------------------------------------------------------------ */
  var externalBlocked = [];
  function installExternalRequestGuard() {
    function isExternal(url) {
      try {
        var u = new URL(String(url), (doc && doc.location && doc.location.href) || undefined);
        if (u.protocol === 'blob:' || u.protocol === 'data:' || u.protocol === 'file:') return false;
        var here = doc && doc.location ? doc.location.origin : '';
        return !!here && u.origin !== here;
      } catch (_e) {
        return false;
      }
    }
    function note(url) {
      var text = String(url);
      if (externalBlocked.indexOf(text) < 0) {
        externalBlocked.push(text);
        log('已拦截外部请求（Playables 不允许外部调用）:', text);
      }
    }

    var RealXHR = g.XMLHttpRequest;
    if (RealXHR && RealXHR.prototype && !RealXHR.prototype.__ytExternalGuarded) {
      RealXHR.prototype.__ytExternalGuarded = true;
      var realOpen = RealXHR.prototype.open;
      var realSend2 = RealXHR.prototype.send;
      RealXHR.prototype.open = function (method, url) {
        this.__ytUrl = url;
        this.__ytExternal = isExternal(url);
        return realOpen.apply(this, arguments);
      };
      RealXHR.prototype.send = function () {
        var self = this;
        if (!self.__ytExternal) return realSend2.apply(this, arguments);
        note(self.__ytUrl);
        setTimeout(function () {
          try {
            self.readyState = 4;
            self.status = 0;
            self.statusText = '';
            if (typeof self.onreadystatechange === 'function') self.onreadystatechange({ type: 'readystatechange' });
            if (typeof self.onerror === 'function') self.onerror({ type: 'error' });
            if (typeof self.onloadend === 'function') self.onloadend({ type: 'loadend' });
          } catch (_e) { /* ignore */ }
        }, 0);
        return undefined;
      };
    }

    if (typeof g.fetch === 'function' && !g.fetch.__ytExternalGuarded) {
      var realFetch2 = g.fetch.bind(g);
      var guardedFetch = function (input) {
        var url = typeof input === 'string' ? input : (input && input.url) || '';
        if (isExternal(url)) {
          note(url);
          return Promise.reject(new TypeError('Failed to fetch'));
        }
        return realFetch2.apply(null, arguments);
      };
      guardedFetch.__ytExternalGuarded = true;
      g.fetch = guardedFetch;
    }
  }
  installExternalRequestGuard();

  /* ------------------------------------------------------------------ *
   * 4. 音频闸门（平台静音 + 暂停静音）
   * ------------------------------------------------------------------ */
  var audioGate = (function () {
    var enabled = true;
    var paused = false;
    var contexts = [];

    function install() {
      if (DEBUG.noAudio) return;
      try {
        var AC = g.AudioContext || g.webkitAudioContext;
        var Base = AC && Object.getPrototypeOf(AC.prototype);
        var nativeDest = Base && Object.getOwnPropertyDescriptor(Base, 'destination');
        if (AC && nativeDest && nativeDest.get && !AC.__ytPatched) {
          Object.defineProperty(AC, '__ytPatched', { value: true, configurable: true });
          Object.defineProperty(AC.prototype, 'destination', {
            configurable: true,
            enumerable: true,
            get: function () {
              if (!this.__ytMasterGain) {
                var real = nativeDest.get.call(this);
                var gain = this.createGain();
                gain.gain.value = enabled && !paused ? 1 : 0;
                gain.connect(real);
                this.__ytMasterGain = gain;
                contexts.push(this);
              }
              return this.__ytMasterGain;
            },
          });
        }
        var MediaEl = g.HTMLMediaElement;
        if (MediaEl && MediaEl.prototype && !MediaEl.prototype.__ytPatched) {
          var nativePlay = MediaEl.prototype.play;
          Object.defineProperty(MediaEl.prototype, '__ytPatched', { value: true, configurable: true });
          MediaEl.prototype.play = function () {
            try {
              this.muted = !(enabled && !paused);
            } catch (_e) { /* ignore */ }
            return nativePlay.apply(this, arguments);
          };
        }
      } catch (e) {
        warn('音频钩子安装失败（不影响玩法）', e);
      }
    }

    function apply() {
      var on = enabled && !paused;
      for (var i = 0; i < contexts.length; i++) {
        try {
          var gain = contexts[i].__ytMasterGain;
          if (gain) gain.gain.value = on ? 1 : 0;
        } catch (_e) { /* ignore */ }
      }
      if (doc && doc.querySelectorAll) {
        var media = doc.querySelectorAll('audio,video');
        for (var j = 0; j < media.length; j++) {
          try {
            media[j].muted = !on;
          } catch (_e) { /* ignore */ }
        }
      }
    }

    function setEnabled(next) {
      enabled = !!next;
      apply();
      log('YouTube 音频开关 ->', enabled);
    }
    function setPaused(next) {
      paused = !!next;
      apply();
    }

    install();
    if (ytgame && ytgame.system) {
      if (typeof ytgame.system.onAudioEnabledChange === 'function') {
        ytgame.system.onAudioEnabledChange(setEnabled);
      }
      if (typeof ytgame.system.isAudioEnabled === 'function') {
        try {
          setEnabled(ytgame.system.isAudioEnabled());
        } catch (_e) { /* ignore */ }
      }
    }
    return {
      setEnabled: setEnabled,
      setPaused: setPaused,
      isEnabled: function () { return enabled; },
      isPaused: function () { return paused; },
      /** 诊断：主音量 GainNode 当前值（暂停/静音时应为 0） */
      debugGains: function () {
        var out = [];
        for (var i = 0; i < contexts.length; i++) {
          try {
            out.push(contexts[i].__ytMasterGain ? contexts[i].__ytMasterGain.gain.value : null);
          } catch (_e) {
            out.push(null);
          }
        }
        return out;
      },
    };
  })();

  /* ------------------------------------------------------------------ *
   * 5. 云存档：白名单键快照 <-> ytgame.game.saveData/loadData
   * ------------------------------------------------------------------ */
  var save = (function () {
    var keys = [];
    var keyMap = Object.create(null);
    var loaded = false;
    var loadPromise = null;
    var dirty = false;
    var timer = null;
    var chain = Promise.resolve();
    var intervalMs = 4000;
    var saveStatus = { loadSucceeded: false, loadedBytes: 0, successfulWrites: 0, failedWrites: 0, lastSavedBytes: 0 };

    function snapshot() {
      // keys 为空表示“持久化全部键”（外壳/引擎自己的状态键也要存，否则每次进来都像新玩家）
      return storage.__snapshot(keys.length ? keys : null);
    }

    function write(force) {
      // 只有 loadData 成功后才能写；读取失败不能用空存档覆盖已有进度。
      if (!loaded) return Promise.resolve();
      if (!dirty && !force) return chain;
      dirty = false;
      var text = JSON.stringify({ v: 1, t: Date.now(), data: snapshot() });
      if (new TextEncoder().encode(text).length >= 3 * 1048576) {
        dirty = true;
        warn('云存档超过 3 MiB，取消写入');
        return chain;
      }
      chain = chain.then(function () {
        if (DEBUG.noSave) return undefined;
        if (ytgame && ytgame.game && typeof ytgame.game.saveData === 'function') {
          return ytgame.game.saveData(text).then(function () {
            saveStatus.successfulWrites += 1;
            saveStatus.lastSavedBytes = new TextEncoder().encode(text).length;
            log('SDK 云存档写入成功，字节数 =', saveStatus.lastSavedBytes);
          }).catch(function (err) {
            saveStatus.failedWrites += 1;
            dirty = true;
            warn('云存档写入失败', err);
          });
        }
        return undefined;
      });
      return chain;
    }

    function schedule() {
      dirty = true;
      if (timer) return;
      timer = setTimeout(function () {
        timer = null;
        write(false);
      }, intervalMs);
    }

    function load() {
      if (loadPromise) return loadPromise;
      if (!(ytgame && ytgame.game && typeof ytgame.game.loadData === 'function')) {
        loaded = true;
        return Promise.resolve(false);
      }
      loadPromise = ytgame.game
        .loadData()
        .then(function (raw) {
          saveStatus.loadSucceeded = true;
          saveStatus.loadedBytes = typeof raw === 'string' ? new TextEncoder().encode(raw).length : 0;
          log('SDK 云存档读取成功，字节数 =', saveStatus.loadedBytes);
          var payload = null;
          if (typeof raw === 'string' && raw) {
            try {
              payload = JSON.parse(raw);
            } catch (e) {
              warn('云存档不是合法 JSON，按空存档处理', e);
            }
          }
          if (payload && payload.data && typeof payload.data === 'object') {
            storage.__restore(payload.data);
            log('云存档已恢复，键数 =', Object.keys(payload.data).length);
          } else {
            dirty = true; // 首次进入没有存档：让 gameReady 时写一份空的，满足“有存档写入”的检查
          }
          loaded = true;
          return true;
        })
        .catch(function (err) {
          warn('云存档读取失败，按空存档继续', err);
          loaded = false;
          dirty = false;
          return false;
        });
      return loadPromise;
    }

    return {
      /** 配置白名单并开始：恢复云存档 + 监听写入 */
      init: function (keyList, opts) {
        keys = (keyList || []).slice();
        if (opts && opts.intervalMs) intervalMs = opts.intervalMs;
        for (var i = 0; i < keys.length; i++) keyMap[keys[i]] = true;
        storage.__onWrite(function (key) {
          if (!keys.length || keyMap[key]) schedule();
        });
        return load();
      },
      flush: function (force) {
        return write(!!force);
      },
      keys: function () {
        return keys.slice();
      },
      isLoaded: function () {
        return loaded;
      },
      status: function () { return Object.assign({}, saveStatus); },
    };
  })();

  /* ------------------------------------------------------------------ *
   * 6. 广告 / 7. 系统
   * ------------------------------------------------------------------ */
  var ads = {
    showInterstitial: function () {
      if (!(ytgame && ytgame.ads && typeof ytgame.ads.requestInterstitialAd === 'function')) {
        return Promise.reject(new Error('Playables 插屏广告接口不可用'));
      }
      return ytgame.ads.requestInterstitialAd();
    },
    showRewarded: function (rewardId) {
      if (!(ytgame && ytgame.ads && typeof ytgame.ads.requestRewardedAd === 'function')) {
        return Promise.reject(new Error('Playables 激励广告接口不可用'));
      }
      if (!rewardId) return Promise.reject(new Error('rewardId 不能为空'));
      return ytgame.ads.requestRewardedAd(rewardId);
    },
  };

  var system = (function () {
    var firstFrameDone = false;
    var readyDone = false;
    return {
      firstFrameReady: function () {
        if (firstFrameDone) return;
        firstFrameDone = true;
        try {
          if (ytgame && ytgame.game && typeof ytgame.game.firstFrameReady === 'function') {
            ytgame.game.firstFrameReady();
            log('firstFrameReady 已调用');
          }
        } catch (e) {
          warn('firstFrameReady 调用失败', e);
        }
      },
      gameReady: function () {
        if (readyDone) return;
        readyDone = true;
        try {
          if (ytgame && ytgame.game && typeof ytgame.game.gameReady === 'function') {
            ytgame.game.gameReady();
            log('gameReady 已调用');
          }
        } catch (e) {
          warn('gameReady 调用失败', e);
        }
        save.flush(true);
      },
      getLanguage: function () {
        if (ytgame && ytgame.system && typeof ytgame.system.getLanguage === 'function') {
          return ytgame.system.getLanguage().catch(function () {
            return (g.navigator && g.navigator.language) || 'en';
          });
        }
        return Promise.resolve((g.navigator && g.navigator.language) || 'en');
      },
    };
  })();

  function bindSdkLifecycle() {
    if (!ytgame || !ytgame.system) return;
    if (typeof ytgame.system.onPause === 'function') {
      ytgame.system.onPause(function () {
        pauseGate.pause('ytgame.onPause');
        save.flush(true); // 认证要求：暂停时保存进度
      });
    }
    if (typeof ytgame.system.onResume === 'function') {
      ytgame.system.onResume(function () {
        pauseGate.resume('ytgame.onResume');
      });
    }
  }

  bindSdkLifecycle();

  // 诊断心跳（#ytdebug）：帧数 + 暂停状态，用来判断循环是否真的冻住
  if (DEBUG.heartbeat) {
    var lastFrames = 0;
    setInterval(function () {
      var frames = pauseGate.getFrameCount();
      log('heartbeat ' + Math.round(performance.now() / 1000) + 's frames=' + frames +
        ' (+' + (frames - lastFrames) + ')' + (pauseGate.isPaused() ? ' [已暂停]' : ''));
      lastFrames = frames;
    }, 3000);
    log('心跳诊断已开启');
    installUiDiagnostics();
  }

  /**
   * UI 诊断（只在 #ytdebug 下启用）：把“点击到底有没有到达游戏、按钮有没有触发、
   * 弹窗开没开、开的什么路径”逐条打出来，专门用来排查“点了没反应”。
   */
  function installUiDiagnostics() {
    function ui() {
      try {
        var a = Array.prototype.slice.call(arguments);
        a.unshift('[ui]');
        console.log.apply(console, a);
      } catch (_e) { /* ignore */ }
    }

    // 原始输入事件（捕获阶段，最早能看到；同时报告暂停闸门状态）
    var RAW = ['pointerdown', 'mousedown', 'touchstart', 'click'];
    function describe(el) {
      if (!el) return 'null';
      try {
        var r = el.getBoundingClientRect();
        var cs = g.getComputedStyle ? g.getComputedStyle(el) : null;
        var cls = typeof el.className === 'string' ? el.className.slice(0, 40) : '';
        return el.tagName + (el.id ? '#' + el.id : '') + (cls ? '.' + cls : '') +
          ' rect=[' + Math.round(r.left) + ',' + Math.round(r.top) + ',' + Math.round(r.width) + ',' + Math.round(r.height) + ']' +
          ' pe=' + (cs ? cs.pointerEvents : '?') + ' z=' + (cs ? cs.zIndex : '?') +
          ' html=' + String(el.outerHTML || '').slice(0, 140).replace(/\s+/g, ' ');
      } catch (_e) {
        return 'err';
      }
    }
    RAW.forEach(function (type) {
      var handler = function (e) {
        var cx = Math.round(e.clientX || 0);
        var cy = Math.round(e.clientY || 0);
        var top = null;
        try {
          top = doc.elementFromPoint(cx, cy);
        } catch (_e) { /* ignore */ }
        ui('input', type, 'x=' + cx, 'y=' + cy, 'paused=' + pauseGate.isPaused(),
          'target=' + describe(e.target), 'top=' + describe(top));
      };
      if (doc) doc.addEventListener(type, handler, { capture: true, passive: true });
    });
    ui('原始输入监听已装');

    var done = false;
    var timer = setInterval(function () {
      if (done) return;
      try {
        var cc = g.cc;
        if (!(cc && cc.director && cc.director.getScene && cc.director.getScene() && typeof g.__require === 'function')) return;
        done = true;
        clearInterval(timer);

        var canvas = doc.getElementById('GameCanvas');
        var r = canvas.getBoundingClientRect();
        var vs = cc.view.getVisibleSize();
        ui('viewport canvasRect=', [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)],
          'backing=', [canvas.width, canvas.height], 'visible=', [Math.round(vs.width), Math.round(vs.height)]);

        // 诊断期把所有 btn* 节点都挂上（只在 #ytdebug 下启用）
        var watchNames = /^btn/i;
        var seen = [];
        function attach() {
          var scene = cc.director.getScene();
          if (!scene) return;
          (function walk(n) {
            var name = String(n.name || '');
            if (watchNames.test(name) && seen.indexOf(n) < 0) {
              seen.push(n);
              try {
                n.on('click', function () { ui('node click ->', name, 'active=', n.activeInHierarchy); });
                n.on(cc.Node.EventType.TOUCH_END, function () { ui('node TOUCH_END ->', name); });
              } catch (_e) { /* ignore */ }
              ui('已挂监听:', name, 'active=', n.activeInHierarchy, 'pos=', [Math.round(n.position.x), Math.round(n.position.y)]);
            }
            var kids = n.children || [];
            for (var i = 0; i < kids.length; i++) walk(kids[i]);
          })(scene);
        }
        attach();
        setInterval(attach, 2000);

        try {
          var pm = g.__require('PopupManager');
          var PM = pm && (pm.PopupManager || pm.default);
          if (PM && PM.prototype && typeof PM.prototype.open === 'function' && !PM.prototype.__ytDbg) {
            PM.prototype.__ytDbg = true;
            var origOpen = PM.prototype.open;
            PM.prototype.open = function (path) {
              ui('PopupManager.open(', String(path), ')');
              try {
                var res = origOpen.apply(this, arguments);
                if (res && typeof res.then === 'function') {
                  res.then(function () { ui('open 完成', String(path)); }, function (e) {
                    ui('open 失败', String(path), String((e && e.message) || e));
                  });
                }
                return res;
              } catch (e) {
                ui('open 抛错', String(path), String(e && e.message));
                throw e;
              }
            };
            ui('已包装 PopupManager.open');
          }
        } catch (e) {
          ui('包装 PopupManager 失败:', String(e && e.message));
        }

        g.addEventListener('error', function (e) {
          ui('页面异常:', String((e && e.message) || e));
        });
        g.addEventListener('unhandledrejection', function (e) {
          ui('未处理的 Promise 拒绝:', String((e && e.reason && e.reason.message) || (e && e.reason) || e));
        });
      } catch (e) {
        ui('UI 诊断安装异常:', String(e && e.message));
      }
    }, 500);
  }

  g.__ytPlayables = {
    inPlayables: inPlayables,
    storage: storage,
    save: save,
    ads: ads,
    system: system,
    pauseGate: pauseGate,
    audioGate: audioGate,
    bindEngineStorage: bindEngineStorage,
    getVisibilityBlockedCount: function () { return visibilityBlockedCount; },
    /** 诊断：被拦下的外部请求地址列表 */
    getBlockedExternalRequests: function () { return externalBlocked.slice(); },
    // 诊断/自动化测试：走与 SDK 回调完全相同的路径
    pause: function () { pauseGate.pause('手动调用'); },
    resume: function () { pauseGate.resume('手动调用'); },
    isPaused: function () { return pauseGate.isPaused(); },
    getFrameCount: function () { return pauseGate.getFrameCount(); },
    simulateSdkPause: function () {
      pauseGate.pause('ytgame.onPause');
      save.flush(true);
    },
    simulateSdkResume: function () { pauseGate.resume('ytgame.onResume'); },
    getAudioState: function () {
      return {
        youtubeAudioEnabled: audioGate.isEnabled(),
        paused: pauseGate.isPaused(),
        silenced: audioGate.isPaused() || !audioGate.isEnabled(),
        masterGains: audioGate.debugGains(),
        mediaElements: doc
          ? Array.prototype.map.call(doc.querySelectorAll('audio,video'), function (el) {
              return { muted: !!el.muted, paused: !!el.paused };
            })
          : [],
      };
    },
  };

  // 通用调试入口（tools/yt-suite.cjs pause-local / 人工排查都用它）
  g.__ytDebug = g.__ytPlayables;

  log('合规运行时就绪（inPlayables =', inPlayables, '）');
})();

/* 通用引擎边界：定时器冻结、加载首帧及异步键值云存档。 */
(function () {
  'use strict';
  var P=window.__ytPlayables, waiting=new Map(), seq=1;
  P.bindEngineStorage();
  function timer(fn,ms,repeat,args){var id=seq++,e={fn:fn,args:args,repeat:repeat,due:false};waiting.set(id,e);e.native=(repeat?setInterval:setTimeout)(function(){if(P.isPaused()){e.due=true;return;}if(!repeat)waiting.delete(id);fn.apply(null,args);},ms);return id;}
  function cancel(id){var e=waiting.get(id);if(!e)return;(e.repeat?clearInterval:clearTimeout)(e.native);waiting.delete(id);}
  window.__ytGameTimers={setTimeout:function(fn,ms){return timer(fn,ms,false,[].slice.call(arguments,2));},setInterval:function(fn,ms){return timer(fn,ms,true,[].slice.call(arguments,2));},clearTimeout:cancel,clearInterval:cancel};
  P.pauseGate.onPauseChange(function(paused){if(paused){if(window.__ytFlushGameSave)window.__ytFlushGameSave();return;}waiting.forEach(function(e,id){if(e.due){e.due=false;if(!e.repeat)waiting.delete(id);e.fn.apply(null,e.args);}});});
  function frame(){requestAnimationFrame(function(){P.system.firstFrameReady();});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',frame,{once:true});else frame();
  window.__ytAsyncStorage=class {
    constructor(name){this.prefix='game-db:'+name+':';}
    async init(){} async exists(){return (await this.keys()).length>0;} getStorageName(){return 'YouTube';} async getProfileKeyPrefix(){return '';}
    async getItem(k){var v=P.storage.getItem(this.prefix+k);return v===null?null:JSON.parse(v);}
    async setItem(k,v){P.storage.setItem(this.prefix+k,JSON.stringify(v));return P.save.flush();}
    async removeItem(k){P.storage.removeItem(this.prefix+k);return P.save.flush();}
    async keys(){return Object.keys(P.storage.__snapshot()).filter(k=>k.startsWith(this.prefix)).map(k=>k.slice(this.prefix.length));}
    async length(){return (await this.keys()).length;} async key(i){return (await this.keys())[i]??null;}
    async entries(){var m=new Map();for(var k of await this.keys())m.set(k,await this.getItem(k));return m;}
    async values(){return Array.from((await this.entries()).values());}
    async getItemsByPrefix(prefix){return new Map(Array.from((await this.entries()).entries()).filter(([k])=>k.startsWith(prefix)));}
    async setItems(values){for(var [k,v] of values instanceof Map?values.entries():values)P.storage.setItem(this.prefix+k,JSON.stringify(v));return P.save.flush();}
    async removeItems(keys){for(var k of keys)P.storage.removeItem(this.prefix+k);return P.save.flush();}
    async clear(){return this.removeItems(await this.keys());} close(){}
  };
})();

/* Unity 内存文件系统接云档，固定 URL 无关目录；不使用浏览器数据库。 */
(function(){'use strict';var P=window.__ytPlayables,fs;
 function stable(p){return typeof p==='string'?p.replace(/^\/idbfs\/[a-f0-9]{32}(?=\/|$)/i,'/idbfs/game'):p;}
 function snapshot(){if(!fs)return;var map={};function walk(d){fs.readdir(d).filter(n=>n!=='.'&&n!=='..').forEach(function(n){var p=d+'/'+n;if(fs.isDir(fs.stat(p).mode))walk(p);else{var b=fs.readFile(p),s='';for(var v of b)s+=String.fromCharCode(v);map[p]=btoa(s);}});}walk('/idbfs');var raw=JSON.stringify(map);if(P.storage.getItem('unity-files')!==raw)P.storage.setItem('unity-files',raw);}
 var flush=P.save.flush;P.save.flush=function(force){snapshot();return flush(force);};
 window.__ytUnitySync=function(FS,mount,populate,cb){fs=FS;try{if(!fs.__ytStable){fs.__ytStable=true;for(var name of ['lookupPath','open','stat','lstat','mkdir','mkdirTree','mknod','readdir','readFile','writeFile','unlink','rmdir','chmod','chown','utime','truncate']){if(typeof fs[name]!=='function')continue;(function(n,orig){fs[n]=function(){var a=[].slice.call(arguments);a[0]=stable(a[0]);return orig.apply(this,a);};})(name,fs[name]);}}
 if(populate){var files={};try{files=JSON.parse(P.storage.getItem('unity-files')||'{}');}catch(e){console.warn('[yt] 旧档格式无效',e);}Object.entries(files).forEach(function(entry){var p=stable(entry[0]);if(!/^\/idbfs\/[a-zA-Z0-9_./-]+$/.test(p)||p.includes('..'))return;fs.mkdirTree(p.slice(0,p.lastIndexOf('/')));var s=atob(entry[1]);fs.writeFile(p,Uint8Array.from(s,c=>c.charCodeAt(0)));});}else if(!P.isPaused()){snapshot();flush(false);}cb(null);}catch(e){cb(e);}};
 window.__ytDecodeAsset=async function(url){var r=await fetch(url);if(!r.ok)throw Error('资源下载失败 '+url+' '+r.status);var b=new Uint8Array(await r.arrayBuffer());if(b[0]===31&&b[1]===139)b=new Uint8Array(await new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());else if(url.endsWith('.brotli')){var d=window.__ytBrotliDecode(new Int8Array(b));b=new Uint8Array(d.buffer,d.byteOffset,d.byteLength);}return URL.createObjectURL(new Blob([b],{type:url.includes('.wasm')?'application/wasm':'application/octet-stream'}));};
})();

/* GamePush 调用面复用已验证的本地实现；仅存档/广告/生命周期改接 YouTube。 */
window.__ytCloudReady=window.__ytPlayables.save.init(null);
window.__ytCloudReady.then(function(){
(function () {
  "use strict";
  if (window.__dvaGpShim) return;
  window.__dvaGpShim = true;

  var P=window.__ytPlayables,STORE_KEY='gamepush-player';
  function log(){console.log.apply(console,['[yt-gp]'].concat([].slice.call(arguments)));}
  function warn(){console.warn.apply(console,arguments);}
  function resolve(v){return Promise.resolve(v);}function fb(){return null;}
  function fbStart(){P.system.gameReady();return Promise.resolve();}
  function fbInit(){return window.__ytCloudReady;}
  /* ---------- 事件 ---------- */
  function Emitter() { this.map = {}; }
  Emitter.prototype.on = function (name, cb) {
    (this.map[name] = this.map[name] || []).push(cb);
    return this;
  };
  Emitter.prototype.off = function (name, cb) {
    var arr = this.map[name] || [];
    var i = arr.indexOf(cb);
    if (i >= 0) arr.splice(i, 1);
    return this;
  };
  Emitter.prototype.emit = function (name) {
    var args = [].slice.call(arguments, 1);
    (this.map[name] || []).forEach(function (cb) { try { cb.apply(null, args); } catch (e) {} });
    return this;
  };

  /* ---------- 玩家数据（P.storage） ---------- */
  function readStore() {
    try { return JSON.parse(P.storage.getItem(STORE_KEY) || "{}") || {}; }
    catch (e) { return {}; }
  }
  function writeStore(v) {
    try { P.storage.setItem(STORE_KEY, JSON.stringify(v || {})); P.save.flush(); } catch (e) {}
  }
  var playerData = readStore();
  var playerEvents = new Emitter();
  var STATS = { activeDays: 1, activeDaysConsecutive: 1, playtimeAll: 0, playtimeToday: 0 };

  var player = {
    ready: null,
    id: 0,
    name: "Player",
    avatar: "",
    score: 0,
    isLoggedIn: false,
    isStub: true,
    hasAnyCredentials: false,
    fields: [],
    stats: STATS,
    on: function (n, cb) { return playerEvents.on(n, cb); },
    off: function (n, cb) { return playerEvents.off(n, cb); },
    get: function (key) {
      if (typeof key === "undefined") return playerData;
      var v = playerData[key];
      /* 缺失的键返回空串（= GamePush 未存过该字段时的表现）：
         真 GP 的字段没值返回空串，游戏用 string.IsNullOrEmpty 判断"没有存档"再建新档；
         若这里返回 undefined/ null，框架的 toUnity() 会把它 JSON.stringify 成 "null"，
         游戏解析存档时就会抛 `ArgumentException: JSON must represent an object type`。 */
      if (typeof v === "undefined") v = "";
      /* 诊断：记录游戏实际读取的键与拿到的值（排查 JSON must represent an object type） */
      try {
        var arr = (window.__dvaGetLog = window.__dvaGetLog || []);
        if (arr.length < 200) arr.push(String(key) + " => " + (typeof v) + ":" + String(v).slice(0, 60));
      } catch (e) {}
      return v;
    },
    set: function (key, value) {
      if (typeof key === "object") { Object.assign(playerData, key); }
      else { playerData[key] = value; }
      writeStore(playerData);
      return resolve(true);
    },
    add: function (key, value) {
      playerData[key] = (Number(playerData[key]) || 0) + (Number(value) || 0);
      writeStore(playerData);
      return resolve(playerData[key]);
    },
    toggle: function (key) { playerData[key] = !playerData[key]; writeStore(playerData); return resolve(playerData[key]); },
    has: function (key) { return Object.prototype.hasOwnProperty.call(playerData, key); },
    getField: function (key) {
      var v = playerData[key];
      if (typeof v === "undefined") v = "";
      try {
        var arr = (window.__dvaGetLog = window.__dvaGetLog || []);
        if (arr.length < 200) arr.push("field:" + String(key) + " => " + (typeof v) + ":" + String(v).slice(0, 60));
      } catch (e) {}
      return v;
    },
    getFieldName: function (key) { return String(key); },
    getFieldVariantName: function (key) { return String(key); },
    getMaxValue: function () { return 0; },
    getMinValue: function () { return 0; },
    setField: function (key, value) { return player.set(key, value); },
    fetchFields: function () { return resolve([]); },
    sync: function () { playerEvents.emit("sync", true); return resolve(true); },
    load: function () { playerEvents.emit("load", true); return resolve(true); },
    login: function () { playerEvents.emit("login", false); return resolve(false); },
    logout: function () { playerEvents.emit("logout", true); return resolve(true); },
    reset: function () { playerData = {}; writeStore({}); return resolve(true); },
    enableAutoSync: function () {},
    disableAutoSync: function () {},
    remove: function (key) { delete playerData[key]; writeStore(playerData); return resolve(true); }
  };
  /* 注意：**不要冒充已登录**。
     实测把 isLoggedIn/hasAnyCredentials 设成 true 后，游戏的 Storage 会走"已登录"分支去读云存档，
     而我们只有 P.storage → 它拿到不可解析的内容，连续抛
     `ArgumentException: JSON must represent an object type`，最终 Zenject 初始化失败、停在蓝屏。
     按"游客"处理（= 本地能跑通的那条路径）即可，FB 玩家的昵称/头像对基础测试不是必需的。 */
  /* player.ready 不等 FB 初始化：GamePush 里它表示"玩家数据就绪"，游客是立即就绪的。
     若等 fbInit（本地无 FB 时要等 20 秒超时），游戏会白白黑屏 20 秒才去读存档。 */
  player.ready = resolve(player);
  player.ready.catch(function () {});
  /* 真实 GamePush 在初始化完成后会发这些事件（framework 收到后才会给 Unity 发
     CallPlayerFetchFieldsComplete / CallPlayerLoadComplete / CallPlayerSyncComplete）。
     游戏的主流程在等它们，不发就会一直停在 "Loading..."。 */
  player.ready.then(function () {
    setTimeout(function () {
      try {
        playerEvents.emit("fetchFields", true);
        playerEvents.emit("load", true);
        playerEvents.emit("sync", true);
        playerEvents.emit("change", player);
        log("已发出 player fetchFields/load/sync 事件");
      } catch (e) { warn("发送 player 事件失败", e); }
    }, 300);
  });

  function showRewarded(cb){return P.ads.showRewarded('dogs-bonus').then(function(ok){if(ok===true){if(cb)cb(true);ads.emit('rewarded:reward');}ads.emit('rewarded:close',ok===true);return ok===true;},function(){ads.emit('rewarded:close',false);return false;});}
  function showFullscreen(){return P.ads.showInterstitial().then(function(){ads.emit('fullscreen:close',true);return true;},function(){ads.emit('fullscreen:close',false);return false;});}
  var adsEvents = new Emitter();
  var ads = {
    isAdblockEnabled: false,
    isFullscreenAvailable: true,
    isFullscreenPlaying: false,
    isPreloaderAvailable: false,
    isPreloaderPlaying: false,
    isRewardedAvailable: true,
    isRewardedPlaying: false,
    isStickyAvailable: false,
    isStickyPlaying: false,
    isCountdownOverlayEnabled: false,
    isRewardedFailedOverlayEnabled: false,
    canShowFullscreenBeforeGamePlay: true,
    on: function (n, cb) { return adsEvents.on(n, cb); },
    off: function (n, cb) { return adsEvents.off(n, cb); },
    emit: function () { return adsEvents.emit.apply(adsEvents, arguments); },
    showRewardedVideo: function (opts) {
      var cb = (opts && (opts.onSuccess || opts.onRewarded)) || null;
      showRewarded(cb || (opts && opts.onClose));
    },
    showFullscreen: function () { return showFullscreen(); },
    showPreloader: function () { ads.emit("preloader:close", false); },
    showSticky: function () { ads.emit("sticky:render"); },
    refreshSticky: function () {},
    closeSticky: function () { ads.emit("sticky:close"); }
  };

  /* ---------- 其它模块（兜底） ---------- */
  var noopResolve = function () { return resolve(true); };
  function emptyList() { return resolve([]); }
  function sub(name) {
    var e = new Emitter();
    return {
      on: function (n, cb) { return e.on(n, cb); },
      off: function (n, cb) { return e.off(n, cb); },
      emit: function () { return e.emit.apply(e, arguments); },
      __name: name
    };
  }

  var gpObj = {
    __dvaFbShim: true,
    isDev: false,
    isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
    isPortrait: window.innerHeight >= window.innerWidth,
    isPaused: false,
    language: (function () {
      try {
        var F = fb();
        var l = F && F.getLocale && F.getLocale();
        return l ? String(l).split(/[-_]/)[0] : (navigator.language || "en").split("-")[0];
      } catch (e) { return "en"; }
    })(),
    serverTime: function () { return Date.now(); },
    changeLanguage: function () {},
    loadOverlay: { close: function () {}, open: function () {} },
    isAllowedOrigin: function () { return true; },
    players: sub("players"),
    files: {},
    gamesCollections: { on: function () {}, open: emptyList },

    player: player,
    ads: ads,

    /* 分享已在游戏侧移除（见 DogsVsAliens/tools/patch_share.cjs），这里同样只返回"不支持" */
    socials: {
      isSupportsShare: false,
      isSupportsNativeShare: false,
      isSupportsNativePosts: false,
      isSupportsNativeInvite: false,
      canJoinCommunity: false,
      isSupportsNativeCommunityJoin: false,
      communityLink: "",
      on: function () {},
      share: function () { log("share disabled"); },
      post: function () {},
      invite: function () {},
      joinCommunity: function () {},
      makeShareUrl: function () { return ""; },
      getShareParam: function () { return ""; }
    },

    analytics: {
      hit: function () {},
      goal: function () {},
      on: function () {}
    },
    logger: {
      log: function () { try { console.log.apply(console, ["[gp]"].concat([].slice.call(arguments))); } catch (e) {} },
      info: function () {}, warn: function () {}, error: function () {}
    },
    platform: {
      type: "FB",
      tag: "fb",
      getNativeSDK: function () { return fb(); },
      hasIntegratedAuth: false,
      isExternalLinksAllowed: false,
      isLogoutAvailable: false,
      isSecretCodeAuthAvailable: false,
      isSupportsCloudSaves: false
    },
    app: {
      title: document.title || "",
      description: "",
      image: "",
      url: location.href,
      canAddShortcut: false,
      canRequestReview: false,
      isAlreadyReviewed: false,
      requestReview: function () { return resolve(false); }
    },
    /* 注意：framework 的 PaymentsFetchProducts 把结果当 `{products, playerPurchases}` 用
       （JSON.stringify(result.products) → SendMessage）。返回数组会让它 stringify(undefined)，
       Unity 侧报 "Failed to call function CallPaymentsFetchProducts ... with no parameters"。 */
    payments: {
      isAvailable: false,
      isSubscriptionsAvailable: false,
      on: function () {},
      fetchProducts: function () { return resolve({ products: [], playerPurchases: [] }); },
      fetchPlayerPurchases: function () { return resolve({ products: [], playerPurchases: [] }); },
      purchase: function () { return resolve({ success: false }); },
      consume: function () { return resolve(false); },
      restore: function () { return resolve({ products: [], playerPurchases: [] }); }
    },
    leaderboard: { on: function () {}, open: emptyList, fetch: emptyList, fetchPlayerRating: function () { return resolve({}); }, getPlayerRating: function () { return resolve({}); }, setScore: noopResolve, getScore: function () { return resolve(0); } },
    achievements: { on: function () {}, has: function () { return resolve(false); }, getProgress: function () { return resolve(0); }, open: function () {}, unlock: function () { return resolve(false); } },
    rewards: { on: function () {}, list: emptyList, has: function () { return resolve(false); }, hasAccepted: function () { return resolve(false); }, hasUnaccepted: function () { return resolve(false); }, accept: noopResolve, getReward: function () { return resolve(null); }, givenList: emptyList },
    /* 注意：framework 里有 13 处 `return this.gp.X` 是**直接**返回给 _ToBuff 的，
       取到 undefined 就会让 Unity 主循环抛 "Cannot read properties of undefined (reading 'length')"。
       channels.mainChatId 就踩过这个坑，所以这里的字段都必须是确定的字符串/数字/布尔。 */
    channels: Object.assign(sub("channels"), {
      mainChatId: "0",
      isMainChatEnabled: false,
      openChat: function () {},
      openFeed: function () {},
      openPersonalChat: function () {},
      fetchChannels: emptyList,
      fetchMembers: emptyList,
      fetchInvites: emptyList,
      fetchJoinRequests: emptyList,
      fetchSentInvites: emptyList,
      fetchSentJoinRequests: emptyList,
      createChannel: noopResolve,
      updateChannel: noopResolve,
      deleteChannel: noopResolve,
      join: noopResolve,
      leave: noopResolve,
      kick: noopResolve,
      mute: noopResolve,
      unmute: noopResolve,
      sendMessage: noopResolve,
      sendPersonalMessage: noopResolve,
      sendFeedMessage: noopResolve,
      sendInvite: noopResolve,
      acceptInvite: noopResolve,
      rejectInvite: noopResolve,
      cancelInvite: noopResolve,
      cancelJoin: noopResolve,
      acceptJoinRequest: noopResolve,
      rejectJoinRequest: noopResolve,
      deleteMessage: noopResolve,
      editMessage: noopResolve,
      fetchChannel: function () { return resolve(null); },
      fetchChannelInvites: emptyList,
      fetchMoreChannels: emptyList,
      fetchMoreMembers: emptyList,
      fetchMoreInvites: emptyList,
      fetchMoreJoinRequests: emptyList,
      fetchMoreSentInvites: emptyList,
      fetchMoreSentJoinRequests: emptyList
    }),
    documents: { on: function () {}, open: function () {}, fetch: emptyList },
    events: { on: function () {}, list: emptyList, activeList: emptyList, has: function () { return resolve(false); }, isJoined: function () { return resolve(false); }, join: noopResolve, getEvent: function () { return resolve(null); } },
    /* map 必须是对象：framework 的 Experiments_Map() 直接 toUnity(gp.experiments.map)，
       给 null 会 stringify 成 "null"，游戏按 map 解析时同样会报 JSON 类型错误 */
    experiments: { has: function () { return resolve(false); }, map: {} },
    schedulers: { on: function () {}, list: emptyList, activeList: emptyList, isRegistered: function () { return resolve(false); }, register: noopResolve, getScheduler: function () { return resolve(null); }, getSchedulerCurrentDay: function () { return resolve(0); }, getSchedulerDay: function () { return resolve(0); }, canClaimDay: function () { return resolve(false); }, canClaimDayAdditional: function () { return resolve(false); }, canClaimAllDay: function () { return resolve(false); }, isTodayRewardClaimed: function () { return resolve(false); }, claimDay: function () { return resolve({ success: false }); }, claimDayAdditional: function () { return resolve({ success: false }); }, claimAllDay: function () { return resolve({ success: false }); }, claimAllDays: function () { return resolve({ success: false }); } },
    segments: { on: function () {}, list: emptyList, has: function () { return resolve(false); } },
    storage: { on: function () {}, get: function () { return resolve(null); }, set: noopResolve, getGlobal: function () { return resolve(null); }, setGlobal: noopResolve, setStorage: function () {} },
    triggers: { on: function () {}, list: emptyList, activatedList: emptyList, isActivated: function () { return resolve(false); }, isClaimed: function () { return resolve(false); }, claim: function () { return resolve({ success: false }); }, getTrigger: function () { return resolve(null); } },
    uniques: { on: function () {}, list: emptyList, check: function () { return resolve(false); }, register: noopResolve, get: function () { return resolve(null); }, delete: noopResolve },
    /* 同 player.get：缺失的变量返回空串，避免 toUnity(null) -> "null" 被当成 JSON 对象解析 */
    variables: {
      on: function () {},
      get: function () { return ""; },
      has: function () { return false; },
      isPlatformVariablesAvailable: false,
      fetchPlatformVariables: emptyList
    },
    sounds: { isMuted: false, isMusicMuted: false, isSFXMuted: false, on: function () {}, mute: function () {}, unmute: function () {}, muteMusic: function () {}, unmuteMusic: function () {}, muteSFX: function () {}, unmuteSFX: function () {} },
    fullscreen: { on: function () {}, open: function () {}, close: function () {}, toggle: function () {} },
    /* framework 的 ImagesResize 是**同步**取返回值再 trigger，所以这里必须直接返回字符串 */
    images: { resize: function () { return ""; } },
    avatarGenerator: { show: function () {}, close: function () {}, add: function () {} },
    changeAvatarGenerator: function () {},
    windows: { showConfirm: function () { return resolve(false); } },
    pause: { on: function () {} },
    resume: { on: function () {} },
    on: function () {},
    off: function () {},

    /* 游戏就绪信号：GamePush 约定由游戏调用 */
    gameStart: function () {
      log("gameStart（游戏自报就绪）");
      fbStart("gameStart");
    },
    gameplayStart: function () { try { var F = fb(); if (F && F.gameplayStart) F.gameplayStart(); } catch (e) {} },
    gameplayStop: function () { try { var F = fb(); if (F && F.gameplayStop) F.gameplayStop(); } catch (e) {} }
  };

  /* 没实现到的属性统一兜底：函数返回 Promise.resolve(null)，对象返回同款代理 */
  /* 诊断：把返回 undefined 的调用打出来（framework 的 _ToBuff(undefined) 会抛
     "Cannot read properties of undefined (reading 'length')"） */
  (function wrapUndefinedLogging(obj, prefix, depth) {
    if (!obj || depth > 1) return;
    Object.keys(obj).forEach(function (key) {
      var value = obj[key];
      if (typeof value === "function") {
        obj[key] = function () {
          try {
            var calls = (window.__dvaCalls = window.__dvaCalls || []);
            if (calls.length < 400) calls.push(prefix + key);
          } catch (e) {}
          var r = value.apply(this, arguments);
          if (typeof r === "undefined") {
            try {
              var arr = (window.__dvaUndefined = window.__dvaUndefined || []);
              if (arr.length < 100) arr.push(prefix + key);
            } catch (e) {}
            /* framework 的 _ToBuff(undefined) 会抛 "Cannot read properties of undefined
               (reading 'length')"，这里统一兜底成 null，让桥接函数拿到可序列化的值 */
            return null;
          }
          return r;
        };
      } else if (value && typeof value === "object" && !(value instanceof Emitter)) {
        wrapUndefinedLogging(value, prefix + key + ".", depth + 1);
      }
    });
  })(gpObj, "", 0);

  /* 关键防御：framework 里有 13 处 `return this.gp.X`（不经 toUnity）直接交给 _ToBuff，
     只要读到 undefined 就会抛 "Cannot read properties of undefined (reading 'length')"
     并让 Unity 主循环崩溃。这里给每个子对象套 Proxy：读不到的属性返回可调用对象
     （既能当函数调用，交给 _ToBuff 时也会变成空串），同时记录下来便于排查。 */
  Object.keys(gpObj).forEach(function (key) {
    var value = gpObj[key];
    if (!value || typeof value !== "object" || value instanceof Emitter) return;
    gpObj[key] = new Proxy(value, {
      get: function (target, prop) {
        if (prop in target) return target[prop];
        if (typeof prop === "symbol") return undefined;
        try {
          var miss = (window.__dvaMissing = window.__dvaMissing || []);
          var tag = key + "." + String(prop);
          if (miss.length < 100 && miss.indexOf(tag) < 0) miss.push(tag);
        } catch (e) {}
        return function () { return resolve(null); };
      }
    });
  });

  var gp = new Proxy(gpObj, {
    get: function (target, prop) {
      if (prop in target) return target[prop];
      if (typeof prop === "symbol") return undefined;
      return new Proxy(function () { return resolve(null); }, {
        get: function (fnTarget, p2) {
          if (p2 === "then") return undefined;
          if (p2 in fnTarget) return fnTarget[p2];
          return function () { return resolve(null); };
        }
      });
    }
  });
  window.gp = gp;

  /* ---------- 交给 framework.js 的 onGPInit（它在 setTimeout 里注册，这里轮询等待） ==== */
  var waited = 0;
  var timer = setInterval(function () {
    waited += 100;
    if (typeof window.onGPInit === "function") {
      clearInterval(timer);
      try {
        window.onGPInit(gp);
        log("已把本地 GamePush 替身交给 onGPInit");
      } catch (e) {
        warn("onGPInit 调用失败", e);
      }
      return;
    }
    if (waited >= 120000) {
      clearInterval(timer);
      warn("等待 onGPInit 超时（framework 可能没走到 GamePush 初始化）");
    }
  }, 100);

  log("Dogs vs Aliens FB 版本地 GamePush 替身已注入");
})();

});

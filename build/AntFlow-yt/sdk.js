/*!
 * AntFlow YouTube Playables 适配层（构建时替换 local-game/sdk.js）
 *
 * 作用：保持游戏原有的 Yandex Games SDK（YaGames）调用面不变，内部改由
 * YouTube Playables SDK（window.ytgame）实现。游戏本体（src/、assets/、cocos-js/）一行未改。
 *
 * 映射关系：
 *   YaGames.init()                        -> 等待 ytgame.system.getLanguage()，返回 SDK 替身
 *   sdk.features.LoadingAPI.ready()       -> ytgame.game.gameReady()（并落盘一次存档）
 *   sdk.adv.showRewardedVideo(cb)         -> ytgame.ads.requestRewardedAd(rewardId)（返回值即是否发奖）
 *   sdk.adv.showFullscreenAdv(cb)         -> ytgame.ads.requestInterstitialAd()
 *   sdk.getPlayer().getData/setData       -> ytgame.game.loadData()/saveData()（合并写入）
 *   sdk.on('game_api_pause'/'resume')     -> ytgame.system.onPause()/onResume()
 *   sdk.environment.i18n.lang             -> ytgame.system.getLanguage()（取主语言子标签）
 *   sdk.leaderboards.setScore             -> ytgame.engagement.sendScore({value})（整数）
 *   静音开关                              -> ytgame.system.isAudioEnabled()/onAudioEnabledChange()，页面级静音
 *   暂停/恢复                             -> 只认 ytgame.system.onPause/onResume（页面内屏蔽 Page Visibility 类事件）
 *
 * 注意（YouTube 认证要求）：
 *   1. https://www.youtube.com/game_api/v1 必须是 index.html 的第一个 <script>，且不能带 async/defer，
 *      否则测试套件的 “SDK loaded before any game code” 会失败（SDK 内部就是这么校验的）。
 *   2. firstFrameReady() 必须早于 gameReady()；本文件在 init() 里就调用 firstFrameReady()。
 *   3. 云存档必须先 loadData() 成功后才能 saveData()；本文件用 ensureLoaded() 串行化。
 *   4. Playables 环境里 window.localStorage/sessionStorage/indexedDB/cookie 都被官方 SDK 置为 null，
 *      所以存档只能走 ytgame.game.saveData/loadData（下面所有落盘都走云存档）。
 *   5. 认证要求“不得使用 Page Visibility API 或类似 Web API，必须只用 SDK 的 onPause/onResume”。
 *      Cocos 引擎自己会监听 visibilitychange/pagehide 并 pauseByEngine()/resumeByEngine()，
 *      游戏代码也会用 visibilitychange/blur/focus 停音频；这里在页面层把这类事件注册全部拦掉
 *      （见 installVisibilityBlock），保证暂停/恢复只有 SDK 一条通路。
 */
(function () {
  'use strict';

  var global_ = typeof window !== 'undefined' ? window : globalThis;
  var doc = typeof document !== 'undefined' ? document : null;

  // 激励广告奖励 ID：同一种奖励必须始终使用同一个 ID，且不能包含用户数据。
  var REWARD_ID = 'antflow-revive-reward';
  // 页面级日志前缀，便于在测试套件/开发者工具里过滤。
  var TAG = '[antflow-yt]';

  /* ------------------------------------------------------------------ *
   * 屏蔽 Page Visibility API 及其“类似 Web API”的暂停/恢复通路
   *
   * 必须在引擎/游戏代码加载之前执行（本文件就是 index.html 里第一个业务脚本）。
   * 只拦“事件注册”，不改 document.hidden 的其它语义：
   *   - Cocos 引擎 sys._registerEvent() 监听 visibilitychange/pagehide → emit hide/show
   *     → Game._onHide/_onShow → pauseByEngine()/resumeByEngine()；
   *   - 游戏代码监听 visibilitychange/blur/focus 来停/放音频；
   * 拦掉这些注册后，页面里唯一能暂停/恢复游戏的路径就是 SDK 的 onPause/onResume。
   * ------------------------------------------------------------------ */
  function installVisibilityBlock() {
    var BLOCKED = {
      visibilitychange: 1,
      mozvisibilitychange: 1,
      msvisibilitychange: 1,
      webkitvisibilitychange: 1,
      qbrowservisibilitychange: 1,
      pagehide: 1,
      pageshow: 1,
      blur: 1,
      focus: 1,
    };
    var blockedCount = 0;

    function wrap(target, label) {
      if (!target || typeof target.addEventListener !== 'function' || target.__ytVisibilityBlocked) return;
      target.__ytVisibilityBlocked = true;
      var original = target.addEventListener;
      target.addEventListener = function (type, listener, options) {
        if (BLOCKED[String(type).toLowerCase()]) {
          blockedCount += 1;
          return;
        }
        return original.apply(this, arguments);
      };
      // removeEventListener 不用改：被拦掉的注册本来就不存在
      void label;
    }

    wrap(global_, 'window');
    wrap(doc, 'document');

    // 顺带把“页面是否可见”固定成“可见”，避免任何代码因为 iframe/后台被误判成隐藏
    try {
      Object.defineProperty(doc, 'hidden', { configurable: true, get: function () { return false; } });
    } catch (_e) {
      /* ignore */
    }
    try {
      Object.defineProperty(doc, 'visibilityState', { configurable: true, get: function () { return 'visible'; } });
    } catch (_e) {
      /* ignore */
    }

    global_.__ytVisibilityBlock = function () {
      return blockedCount;
    };
  }

  installVisibilityBlock();

  function log() {
    try {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(TAG);
      console.log.apply(console, args);
    } catch (_e) {
      /* ignore */
    }
  }

  function warn() {
    try {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(TAG);
      console.warn.apply(console, args);
    } catch (_e) {
      /* ignore */
    }
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

  var ytgame = global_.ytgame;
  var inPlayables = !!(ytgame && ytgame.IN_PLAYABLES_ENV);
  // 诊断开关（只在本地排查时用）：URL hash 里带下列关键字可临时关掉对应能力。
  //   #ytnoaudio  关掉页面级音频钩子
  //   #ytnoleader 不提供 leaderboards（游戏会走“排行榜不可用”分支）
  //   #ytnosave   存档只留内存，不调用云存档
  //   #ytdebug    每 3 秒打一次心跳（判断主线程是否卡死）
  var dbgFlags = String((doc && doc.location && doc.location.hash) || '');
  var debugFlags = {
    noAudio: dbgFlags.indexOf('ytnoaudio') >= 0,
    noLeaderboard: dbgFlags.indexOf('ytnoleader') >= 0,
    noSave: dbgFlags.indexOf('ytnosave') >= 0,
  };

  /* ------------------------------------------------------------------ *
   * 游戏暂停闸门（认证要求：onPause 必须停掉一切执行）
   *
   * Cocos 主循环靠 requestAnimationFrame 驱动：update / schedule / 渲染都在里面。
   * 所以在 SDK 层把 rAF 闸住，就等于冻结整个游戏循环（不更新、不渲染），
   * 恢复时把排队的帧回调重新交给真正的 rAF，游戏无缝继续。
   *
   * 同时：
   *   - 在 window 捕获阶段拦下所有输入事件（指针/鼠标/触摸/键盘/滚轮），游戏收不到点击；
   *   - 音频走 audio.setPaused(true)（主音量归零 + 所有 <audio>/<video> 静音），
   *     游戏自身的 pauseRuntimeAudio 也会照常执行（我们仍然派发 game_api_pause）。
   *   - 本游戏没有网络请求；循环冻结后也不会有新的请求发出。
   * ------------------------------------------------------------------ */
  var runtimePause = (function () {
    var paused = false;
    var frameCount = 0;
    var rafQueue = [];
    var queueIdSeq = 1;
    var realRaf = typeof global_.requestAnimationFrame === 'function'
      ? global_.requestAnimationFrame.bind(global_)
      : null;
    var realCaf = typeof global_.cancelAnimationFrame === 'function'
      ? global_.cancelAnimationFrame.bind(global_)
      : null;
    var queuedIds = Object.create(null);
    var listeners = [];

    var INPUT_EVENTS = [
      'pointerdown', 'pointermove', 'pointerup', 'pointercancel',
      'mousedown', 'mouseup', 'mousemove', 'click', 'dblclick', 'contextmenu',
      'touchstart', 'touchmove', 'touchend', 'touchcancel',
      'wheel', 'keydown', 'keyup', 'keypress',
    ];

    function installFrameGate() {
      if (!realRaf || global_.__ytFrameGateInstalled) return;
      global_.__ytFrameGateInstalled = true;
      global_.requestAnimationFrame = function (cb) {
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
      global_.cancelAnimationFrame = function (id) {
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
      // 只阻断事件继续传给游戏，不调用 preventDefault，避免影响平台自身的交互
      e.stopImmediatePropagation();
      e.stopPropagation();
    }

    function installInputGate() {
      if (!doc || global_.__ytInputGateInstalled) return;
      global_.__ytInputGateInstalled = true;
      for (var i = 0; i < INPUT_EVENTS.length; i++) {
        var options = { capture: true, passive: true };
        global_.addEventListener(INPUT_EVENTS[i], blockInput, options);
        doc.addEventListener(INPUT_EVENTS[i], blockInput, options);
      }
    }

    function flushQueue() {
      var queue = rafQueue;
      rafQueue = [];
      queuedIds = Object.create(null);
      for (var i = 0; i < queue.length; i++) {
        realRaf(queue[i].cb);
      }
    }

    function pause(reason) {
      if (paused) return;
      paused = true;
      audio.setPaused(true);
      log('已暂停（冻结游戏循环/渲染/输入/音频）' + (reason ? ' 原因: ' + reason : ''));
      for (var i = 0; i < listeners.length; i++) callSafe(listeners[i], null, [true]);
    }

    function resume(reason) {
      if (!paused) return;
      paused = false;
      audio.setPaused(false);
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
      isPaused: function () {
        return paused;
      },
      getFrameCount: function () {
        return frameCount;
      },
      /** 暂停前/后把 rAF 回调数量序列化给诊断心跳用 */
      onPauseChange: function (cb) {
        listeners.push(cb);
        return function off() {
          var i = listeners.indexOf(cb);
          if (i >= 0) listeners.splice(i, 1);
        };
      },
    };
  })();

  /* ------------------------------------------------------------------ *
   * 网络闸门：暂停期间不发起新的请求（认证要求“暂停要停掉网络调用”）
   *
   * 只拦“暂停期间新发起”的 XHR / fetch：把它们排队，等 onResume 后再真正发出。
   * 已经在途的请求不打断（浏览器层面无法撤回），但不会再有新的调用产生。
   * ------------------------------------------------------------------ */
  function installNetworkGate() {
    var RealXHR = global_.XMLHttpRequest;
    if (RealXHR && RealXHR.prototype && !RealXHR.prototype.__ytGated) {
      RealXHR.prototype.__ytGated = true;
      var realSend = RealXHR.prototype.send;
      RealXHR.prototype.send = function () {
        var self = this;
        var args = arguments;
        if (!runtimePause.isPaused()) return realSend.apply(this, args);
        var off = runtimePause.onPauseChange(function (nowPaused) {
          if (nowPaused) return;
          off();
          realSend.apply(self, args);
        });
        return undefined;
      };
    }
    if (typeof global_.fetch === 'function' && !global_.fetch.__ytGated) {
      var realFetch = global_.fetch.bind(global_);
      var gatedFetch = function () {
        var args = arguments;
        if (!runtimePause.isPaused()) return realFetch.apply(null, args);
        return new Promise(function (resolve, reject) {
          var off = runtimePause.onPauseChange(function (nowPaused) {
            if (nowPaused) return;
            off();
            realFetch.apply(null, args).then(resolve, reject);
          });
        });
      };
      gatedFetch.__ytGated = true;
      global_.fetch = gatedFetch;
    }
  }

  /* ------------------------------------------------------------------ *
   * 页面级音频开关（YouTube 静音按钮 / 系统音量要求）
   * 做法：拦截 AudioContext.destination，所有 WebAudio 输出先经过一个主 GainNode；
   *      HTMLMediaElement（<audio>/<video>）则在 play() 时同步 muted。
   * 只影响“YouTube 侧静音”，游戏自身的音量/音效设置不受影响。
   * ------------------------------------------------------------------ */
  var audio = (function () {
    var enabled = true;
    var paused = false;
    var contexts = [];

    function install() {
      try {
        var AC = global_.AudioContext || global_.webkitAudioContext;
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
                gain.gain.value = enabled ? 1 : 0;
                gain.connect(real);
                this.__ytMasterGain = gain;
                contexts.push(this);
              }
              return this.__ytMasterGain;
            },
          });
        }
        var MediaEl = global_.HTMLMediaElement;
        if (MediaEl && MediaEl.prototype && !MediaEl.prototype.__ytPatched) {
          var nativePlay = MediaEl.prototype.play;
          Object.defineProperty(MediaEl.prototype, '__ytPatched', { value: true, configurable: true });
          MediaEl.prototype.play = function () {
            try {
              this.muted = !enabled;
            } catch (_e) {
              /* ignore */
            }
            return nativePlay.apply(this, arguments);
          };
        }
      } catch (e) {
        warn('音频钩子安装失败（不影响玩法）', e);
      }
    }

    function apply() {
      // 只要「YouTube 静音」或「游戏暂停」任一成立，就不许有声音
      var on = enabled && !paused;
      for (var i = 0; i < contexts.length; i++) {
        try {
          var gain = contexts[i].__ytMasterGain;
          if (gain) gain.gain.value = on ? 1 : 0;
        } catch (_e) {
          /* ignore */
        }
      }
      if (doc && doc.querySelectorAll) {
        var media = doc.querySelectorAll('audio,video');
        for (var j = 0; j < media.length; j++) {
          try {
            media[j].muted = !on;
          } catch (_e) {
            /* ignore */
          }
        }
      }
    }

    function setEnabled(next) {
      enabled = !!next;
      apply();
      log('音频开关 ->', enabled);
    }

    function setPaused(next) {
      paused = !!next;
      apply();
    }

    if (!debugFlags.noAudio) install();
    return {
      setEnabled: setEnabled,
      setPaused: setPaused,
      isEnabled: function () {
        return enabled;
      },
      isPaused: function () {
        return paused;
      },
      /** 诊断用：列出所有主音量 GainNode 的当前值（暂停/静音时应为 0） */
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
   * 云存档：ytgame.game.loadData/saveData（整块 JSON）
   * 游戏侧按 key 读写，这里维护一份内存缓存并把改动合并回整块字符串。
   * ------------------------------------------------------------------ */
  var save = (function () {
    var cache = null;
    var loadPromise = null;
    var dirty = false;
    var saveChain = Promise.resolve();
    var localStorageFallback = null;

    function fallbackRead() {
      // 仅在“非 Playables 环境”（本地直开、没有官方 SDK）时才会用到。
      try {
        if (localStorageFallback === null) {
          localStorageFallback = global_.localStorage || null;
        }
        if (!localStorageFallback) return {};
        var raw = localStorageFallback.getItem('__antflow_yt_save__');
        return raw ? JSON.parse(raw) : {};
      } catch (_e) {
        return {};
      }
    }

    function fallbackWrite(text) {
      try {
        if (localStorageFallback === null) localStorageFallback = global_.localStorage || null;
        if (localStorageFallback) localStorageFallback.setItem('__antflow_yt_save__', text);
      } catch (_e) {
        /* ignore */
      }
    }

    function ensureLoaded() {
      if (loadPromise) return loadPromise;
      if (ytgame && ytgame.game && typeof ytgame.game.loadData === 'function') {
        loadPromise = ytgame.game.loadData().then(
          function (raw) {
            var obj = {};
            if (typeof raw === 'string' && raw) {
              try {
                var parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) obj = parsed;
              } catch (e) {
                warn('云存档内容不是合法 JSON，按空存档处理', e);
              }
            }
            cache = obj;
            log('云存档已载入，key 数 =', Object.keys(obj).length);
            return cache;
          },
          function (err) {
            // loadData 失败时不能阻塞游戏：退化为空存档，但要记住状态供上层判断
            warn('云存档读取失败，按空存档继续', err);
            cache = {};
            loadPromise = null;
            return cache;
          }
        );
      } else {
        cache = fallbackRead();
        loadPromise = Promise.resolve(cache);
      }
      return loadPromise;
    }

    function flush() {
      if (!dirty || cache === null) return saveChain;
      dirty = false;
      var text = JSON.stringify(cache);
      saveChain = saveChain.then(function () {
        if (debugFlags.noSave) return undefined;
        if (ytgame && ytgame.game && typeof ytgame.game.saveData === 'function') {
          return ytgame.game.saveData(text).catch(function (err) {
            warn('云存档写入失败', err);
          });
        }
        fallbackWrite(text);
        return undefined;
      });
      return saveChain;
    }

    function getData(keys) {
      return ensureLoaded().then(function (obj) {
        if (!keys || (Array.isArray(keys) && keys.length === 0)) return JSON.parse(JSON.stringify(obj));
        var out = {};
        for (var i = 0; i < keys.length; i++) {
          if (Object.prototype.hasOwnProperty.call(obj, keys[i])) out[keys[i]] = obj[keys[i]];
        }
        return out;
      });
    }

    function setData(data) {
      return ensureLoaded().then(function () {
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          for (var k in data) {
            if (Object.prototype.hasOwnProperty.call(data, k)) cache[k] = data[k];
          }
          dirty = true;
          log('待写入存档 key =', Object.keys(data).join(','));
        }
        return flush();
      });
    }

    function flushNow() {
      return ensureLoaded().then(function () {
        return flush();
      });
    }

    /**
     * 强制写一次云存档（即使本次没有改动）。
     * 用途：游戏进入可玩状态时把当前进度落盘一次，满足“云存档 < 3 MiB / 有存档写入”的检查，
     * 也符合“在重要里程碑自动保存”的认证要求。写入内容就是刚读回来的内容，不会丢档。
     */
    function forceFlush() {
      if (cache === null) return Promise.resolve();
      dirty = true;
      return flush();
    }

    return {
      ensureLoaded: ensureLoaded,
      getData: getData,
      setData: setData,
      flushNow: flushNow,
      forceFlush: forceFlush,
    };
  })();

  /* ------------------------------------------------------------------ *
   * 语言：BCP-47 -> 游戏使用的两位主语言标签
   * ------------------------------------------------------------------ */
  function normalizeLanguage(tag) {
    if (typeof tag !== 'string' || !tag) return 'en';
    var primary = tag.trim().toLowerCase().split('-')[0];
    return primary || 'en';
  }

  /* ------------------------------------------------------------------ *
   * 事件：game_api_pause / game_api_resume
   * ------------------------------------------------------------------ */
  var listeners = { 'game_api_pause': [], 'game_api_resume': [] };
  var sdkEventsBound = false;

  // SDK 的暂停/恢复回调（单独抽出来，便于本地直接验证与诊断）
  function onSdkPause() {
    log('收到 onPause（YouTube 暂停）');
    // 认证要求：暂停必须停掉一切执行 —— 先冻结游戏循环/渲染/输入/音频，再通知游戏；
    // 同时按“暂停时保存进度”的要求落盘一次
    runtimePause.pause('ytgame.onPause');
    save.flushNow();
    emit('game_api_pause');
  }

  function onSdkResume() {
    log('收到 onResume（YouTube 恢复）');
    emit('game_api_resume');
    // 先让游戏自己恢复，再放开循环闸门，避免恢复瞬间丢帧
    runtimePause.resume('ytgame.onResume');
  }

  function bindSdkEvents() {
    if (sdkEventsBound || !ytgame || !ytgame.system) return;
    sdkEventsBound = true;
    if (typeof ytgame.system.onPause === 'function') {
      ytgame.system.onPause(onSdkPause);
    }
    if (typeof ytgame.system.onResume === 'function') {
      ytgame.system.onResume(onSdkResume);
    }
    if (typeof ytgame.system.onAudioEnabledChange === 'function') {
      ytgame.system.onAudioEnabledChange(function (enabled) {
        audio.setEnabled(enabled);
      });
    } else if (typeof ytgame.system.isAudioEnabled === 'function') {
      audio.setEnabled(ytgame.system.isAudioEnabled());
    }
    if (typeof ytgame.system.isAudioEnabled === 'function') {
      audio.setEnabled(ytgame.system.isAudioEnabled());
    }
  }

  function emit(event) {
    var list = listeners[event] || [];
    for (var i = 0; i < list.length; i++) callSafe(list[i], null, []);
  }

  /* ------------------------------------------------------------------ *
   * 广告
   * ------------------------------------------------------------------ */
  var ads = {
    showRewardedVideo: function (options) {
      var callbacks = (options && options.callbacks) || {};
      if (!ytgame || !ytgame.ads || typeof ytgame.ads.requestRewardedAd !== 'function') {
        setTimeout(function () {
          callSafe(callbacks.onError, null, [new Error('Playables 激励广告接口不可用')]);
        }, 0);
        return Promise.resolve();
      }
      // YouTube 的 requestRewardedAd 没有 onOpen：在请求前先通知一次“广告即将展示”
      callSafe(callbacks.onOpen, null, []);
      return ytgame.ads
        .requestRewardedAd(REWARD_ID)
        .then(function (rewarded) {
          log('激励广告结果 rewarded =', rewarded);
          if (rewarded) callSafe(callbacks.onRewarded, null, []);
          callSafe(callbacks.onClose, null, [!!rewarded]);
          return undefined;
        })
        .catch(function (err) {
          warn('激励广告请求失败', err);
          callSafe(callbacks.onError, null, [err]);
          return undefined;
        });
    },

    showFullscreenAdv: function (options) {
      var callbacks = (options && options.callbacks) || {};
      if (!ytgame || !ytgame.ads || typeof ytgame.ads.requestInterstitialAd !== 'function') {
        setTimeout(function () {
          callSafe(callbacks.onClose, null, [false]);
        }, 0);
        return Promise.resolve();
      }
      callSafe(callbacks.onOpen, null, []);
      return ytgame.ads
        .requestInterstitialAd()
        .then(function () {
          log('插屏广告请求完成');
          callSafe(callbacks.onClose, null, [true]);
          return undefined;
        })
        .catch(function (err) {
          warn('插屏广告请求失败', err);
          callSafe(callbacks.onError, null, [err]);
          return undefined;
        });
    },
  };

  /* ------------------------------------------------------------------ *
   * 玩家（云存档 + 只读资料）
   * YouTube 没有“未授权玩家”的概念：所有玩家都能用云存档，因此 isAuthorized 恒为 true，
   * 否则游戏会退回到 localStorage（Playables 环境里 localStorage 为 null）。
   * ------------------------------------------------------------------ */
  var playerPromise = null;

  function getPlayer() {
    if (playerPromise) return playerPromise;
    playerPromise = save.ensureLoaded().then(function () {
      return {
        getMode: function () {
          return 'lite';
        },
        isAuthorized: function () {
          return true;
        },
        getUniqueID: function () {
          return '';
        },
        getName: function () {
          return '';
        },
        getPhoto: function () {
          return '';
        },
        getPayingStatus: function () {
          return 'unknown';
        },
        getData: function (keys) {
          return save.getData(keys);
        },
        setData: function (data) {
          return save.setData(data);
        },
        getStats: function () {
          return Promise.resolve({});
        },
        setStats: function () {
          return Promise.resolve();
        },
      };
    });
    return playerPromise;
  }

  /* ------------------------------------------------------------------ *
   * 排行榜：setScore 走 YouTube 官方计分（recommended 集成），
   * 查询接口不支持 -> 让游戏按“排行榜不可用”分支处理（与原本地版一致）。
   * ------------------------------------------------------------------ */
  var leaderboards = {
    setScore: function (name, score) {
      var value = Math.round(Number(score) || 0);
      if (!ytgame || !ytgame.engagement || typeof ytgame.engagement.sendScore !== 'function') {
        return Promise.resolve();
      }
      if (!Number.isSafeInteger(value) || value < 0) return Promise.resolve();
      log('上报分数 ->', value);
      return ytgame.engagement.sendScore({ value: value }).catch(function (err) {
        warn('上报分数失败', err);
      });
    },
    getEntries: function () {
      return Promise.reject(new Error('LEADERBOARD_UNAVAILABLE'));
    },
    getPlayerEntry: function () {
      return Promise.reject(new Error('LEADERBOARD_UNAVAILABLE'));
    },
  };

  /* ------------------------------------------------------------------ *
   * 组装 YaGames 替身
   * ------------------------------------------------------------------ */
  var markedFirstFrame = false;
  var markedReady = false;

  function firstFrameReady() {
    if (markedFirstFrame) return;
    markedFirstFrame = true;
    try {
      if (ytgame && ytgame.game && typeof ytgame.game.firstFrameReady === 'function') {
        ytgame.game.firstFrameReady();
        log('firstFrameReady 已调用');
      }
    } catch (e) {
      warn('firstFrameReady 调用失败', e);
    }
  }

  function gameReady() {
    if (markedReady) return;
    markedReady = true;
    try {
      if (ytgame && ytgame.game && typeof ytgame.game.gameReady === 'function') {
        ytgame.game.gameReady();
        log('gameReady 已调用');
      }
    } catch (e) {
      warn('gameReady 调用失败', e);
    }
    // 进入可玩状态时落盘一次（认证要求：重要节点要保存进度；也让云存档检查有据可依）
    save.forceFlush();
  }

  function buildSdk(language) {
    bindSdkEvents();
    return {
      environment: {
        i18n: { lang: language, tld: 'com' },
        app: { id: 'youtube-playables' },
      },
      features: {
        LoadingAPI: { ready: gameReady },
        // YouTube 没有对应的 GameplayAPI，保留空实现避免游戏报错
        GameplayAPI: { start: function () {}, stop: function () {} },
      },
      adv: ads,
      leaderboards: debugFlags.noLeaderboard ? undefined : leaderboards,
      getPlayer: function () {
        return getPlayer();
      },
      getLeaderboards: function () {
        return Promise.resolve(leaderboards);
      },
      getFlags: function () {
        return Promise.resolve({});
      },
      isAvailable: function () {
        return true;
      },
      on: function (event, cb) {
        if (!listeners[event]) listeners[event] = [];
        listeners[event].push(cb);
        return function () {
          var i = listeners[event].indexOf(cb);
          if (i >= 0) listeners[event].splice(i, 1);
        };
      },
      off: function (event, cb) {
        var list = listeners[event];
        if (!list) return;
        var i = list.indexOf(cb);
        if (i >= 0) list.splice(i, 1);
      },
      // 微信分支才会用到，这里给空实现
      track: function () {},
    };
  }

  global_.YaGames = {
    init: function () {
      if (!ytgame) {
        warn('未找到 window.ytgame：按非 Playables 环境运行（存档退化为 localStorage）');
        // 即使不在 Playables 环境，也要尽早告诉游戏“开始渲染了”
        setTimeout(firstFrameReady, 0);
        return Promise.resolve(buildSdk('en'));
      }
      // 认证要求：游戏开始显示加载画面时调用 firstFrameReady（这里在 SDK 初始化时立即调用）
      firstFrameReady();
      var langPromise = typeof ytgame.system.getLanguage === 'function'
        ? ytgame.system.getLanguage().catch(function () {
            return 'en';
          })
        : Promise.resolve('en');
      return langPromise.then(function (tag) {
        var lang = normalizeLanguage(tag);
        log('初始化完成 lang =', lang, ' SDK 版本 =', ytgame.SDK_VERSION);
        if (typeof global_.__ytVisibilityBlock === 'function') {
          log('已屏蔽 Page Visibility 类事件注册数 =', global_.__ytVisibilityBlock());
        }
        return buildSdk(lang);
      });
    },
  };

  // 便于测试套件/开发者工具核对该页确实是 YouTube 版
  global_.__antflowYtBridge = {
    rewardId: REWARD_ID,
    inPlayables: inPlayables,
    flushSave: function () {
      return save.flushNow();
    },
    // 暂停闸门（便于本地验证/自动化测试）
    pause: function () {
      runtimePause.pause('手动调用');
    },
    resume: function () {
      runtimePause.resume('手动调用');
    },
    isPaused: function () {
      return runtimePause.isPaused();
    },
    getFrameCount: function () {
      return runtimePause.getFrameCount();
    },
    // 走与 SDK 回调完全相同的代码路径，便于在非 Playables 环境（本地直开）验证暂停效果
    simulateSdkPause: onSdkPause,
    simulateSdkResume: onSdkResume,
    /** 诊断：音频开关/暂停状态 + 主音量值 */
    getAudioState: function () {
      return {
        youtubeAudioEnabled: audio.isEnabled(),
        paused: runtimePause.isPaused(),
        silenced: audio.isPaused() || !audio.isEnabled(),
        masterGains: audio.debugGains(),
        mediaElements: doc
          ? Array.prototype.map.call(doc.querySelectorAll('audio,video'), function (el) {
              return { muted: !!el.muted, paused: !!el.paused };
            })
          : [],
      };
    },
    /** 诊断：被屏蔽的 visibility/blur/focus 事件注册数量 */
    getVisibilityBlockedCount: function () {
      return typeof global_.__ytVisibilityBlock === 'function' ? global_.__ytVisibilityBlock() : 0;
    },
  };

  // 诊断开关：URL 里带 #ytdebug 时每 3 秒打一次心跳（含帧数），用于判断主线程是否卡死、暂停是否真的冻住循环。
  try {
    if (doc && String(doc.location.hash).indexOf('ytdebug') >= 0) {
      var lastFrames = 0;
      setInterval(function () {
        var frames = runtimePause.getFrameCount();
        log(
          'heartbeat ' + Math.round(performance.now() / 1000) + 's frames=' + frames +
            ' (+' + (frames - lastFrames) + ')' + (runtimePause.isPaused() ? ' [已暂停]' : '')
        );
        lastFrames = frames;
      }, 3000);
      log('心跳诊断已开启');
    }
  } catch (_e) {
    /* ignore */
  }

  // 通用调试入口别名：tools/yt-suite.cjs pause-local 对两个游戏用同一个名字
  global_.__ytDebug = global_.__antflowYtBridge;

  log('AntFlow YouTube Playables 适配层已注入（inPlayables =', inPlayables, '）');
})();

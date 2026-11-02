/*
 * Dominators 本地插屏节奏模拟器（可选加载；不带参数时一行钩子都不装）。
 *
 * 为什么需要它：这个构建的 Unity 侧在实测中从不主动请求插屏（见 README「插屏（mock）实测」），
 * 所以"每 20 秒一次会不会太打扰 / 每 2 分钟一次会不会太少"没法靠原样游玩回答。本文件在页面层
 * 模拟真实的请求节奏，让策划/发行能真的玩着感受：
 *   - 请求点：开始游戏（首次点击画面）、过关结算、立即强插（调试用）
 *   - 间隔下限：模仿 PluginYG2 的「Inter Adv Interval」——间隔没到就被拦下，只记一次"被拦"，
 *     这正是真实插件的行为；关掉它才能测"完全不设防"的极端打扰度
 *   - 自动请求：按固定节奏持续请求，模拟"游戏自己按时间请求"的玩法
 *   - 统计：请求/展示/被拦次数、插屏累计时长、会话时长、广告占时比、距下次可展示
 *
 * 参数（默认全关，不生效）：
 *   advsim=1              启用模拟器面板
 *   advInterval=N         间隔下限秒数（默认 60）
 *   advRespect=0          不遵守间隔下限（每次请求都真的展示）
 *   advAutoReq=N          每 N 秒自动请求一次（默认 0 = 关）
 *   advStart=1            玩家开始游戏（首次点击画面）时请求一次
 *   advPanel=0            不显示面板（默认显示）
 *   advlog=1              记录 C#→页面 的 jslib 广告桥调用与页面→C# 的 SendMessage
 *   advkeys=1             快捷键：I=过关结算请求、R=激励、J=立即强插
 *   advtest / advDelay / advEvery   一次性原始触发（绕过间隔下限，链路验证用）
 *
 * 控制台/CDP：__advSim.request('level-end'|'start'|'force')、__advSim.stats()、
 *            __advSim.setInterval(20)、__advSim.setRespect(true)、__advSim.setAutoReq(45)、
 *            __advTest.inter()（等价于 jslib 桥的 InterstitialAdvShow_js）
 * 采集结果：window.__advProbe（bridge / jsToCs / triggers / events / overlay / ads）
 *
 * 边界：本文件不伪造 C# 侧调用，也不改 Build/。插屏走的是入口页同一个 InterAdvShow()，
 * 因此"暂停/恢复、打开与收尾回调"与真实一致；但游戏自己的关卡流程不会配合（广告就出现在
 * 你按下的那一刻的画面上）。真实广告时长用 adsSec 参数设（真实插屏 15–30 秒，adsSec=3 会低估打扰度）。
 */
(function () {
  'use strict';

  var params = new URLSearchParams(location.search || '');
  var TEST = (params.get('advtest') || '').toLowerCase();
  var LOG = params.get('advlog') === '1';
  var KEYS = params.get('advkeys') === '1';
  var SIM = params.get('advsim') === '1' || params.get('advInterval') !== null;
  // 面板：模拟模式或开了快捷键都显示（只有 advPanel=0 才关）。否则"按了没反应"根本没法判断
  // 是钩子没装、还是被间隔拦住——实测就踩过这个坑。
  var PANEL = (SIM || KEYS) && params.get('advPanel') !== '0';
  var INTERVAL = clampInt(params.get('advInterval'), 60, 0, 3600);
  // 间隔下限：模拟模式默认开（要看不被拦/被拦的比例）；只开快捷键时默认关——手按一下就是想
  // 立刻看到广告，默认挂个 60s 下限只会让人以为钩子坏了。
  var RESPECT = params.has('advRespect') ? params.get('advRespect') !== '0' : SIM;
  // 自动请求节奏：给了 advAutoReq 就用它；模拟模式默认 = 间隔下限 + 2s（比下限略长，保证每次
  // 都真的展示），没设下限时给 30s，避免变成无意义轰炸。
  var AUTO_REQ = params.has('advAutoReq')
    ? clampInt(params.get('advAutoReq'), 0, 0, 3600)
    : (SIM ? (INTERVAL > 0 ? INTERVAL + 2 : 30) : 0);
  var AT_START = params.get('advStart') === '1';
  var DELAY = clampInt(params.get('advDelay'), 3, 0, 600);
  var EVERY = clampInt(params.get('advEvery'), 0, 0, 3600);
  var ADS_SEC = clampInt(params.get('adsSec'), 3, 0, 60);

  // 默认什么都不做：不装钩子、不改全局、不触发
  if (!LOG && !TEST && !KEYS && !SIM) return;

  function clampInt(raw, def, min, max) {
    var n = parseInt(raw, 10);
    if (isNaN(n)) n = def;
    return Math.max(min, Math.min(max, n));
  }
  function stamp() {
    return Math.round(performance.now());
  }
  function plog() {
    if (LOG) console.info.apply(console, ['[adv-probe]'].concat([].slice.call(arguments)));
  }

  var PROBE = { bridge: [], jsToCs: [], triggers: [], events: [], overlay: [], ads: [] };
  window.__advProbe = PROBE;

  // 页面上直接给反馈：被拦/失败只在控制台说，实测时会误判成"钩子没生效"
  function toast(msg) {
    try {
      var el = document.getElementById('adv-probe-toast');
      if (!el) {
        el = document.createElement('div');
        el.id = 'adv-probe-toast';
        el.style.cssText = 'position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:2147483600;' +
          'background:rgba(8,12,22,.94);color:#e8f1ff;border:1px solid rgba(120,160,255,.5);border-radius:8px;' +
          'padding:8px 14px;font:600 14px/1.5 system-ui,Segoe UI,sans-serif;pointer-events:none';
        (document.body || document.documentElement).appendChild(el);
      }
      el.textContent = msg;
      el.style.display = 'block';
      clearTimeout(el.__hide);
      el.__hide = setTimeout(function () { el.style.display = 'none'; }, 2200);
    } catch (e) { /* ignore */ }
  }

  // ---------------------------------------------------------------- 1) C# → 页面
  // Unity 框架用 wasmImports 构造 import 对象（info = {env: wasmImports, ...}），
  // 在 WebAssembly.instantiate* 之前把广告桥函数包一层，就能看到 Unity 是否真的请求了广告。
  var AD_IMPORTS = [
    'InterstitialAdvShow_js', 'RewardedAdvShow_js', 'StickyAdActivity_js',
    'IsInitSDK_js', 'GameReadyAPI_js',
  ];
  // mode B 的 wasm 补丁是"直连 jslib"，绕过了插件自己的 interAdvInterval 计时，
  // 所以节奏下限放在页面层：默认 30 秒内重复的插屏请求直接拦下（advFloor=0 关闭，单位秒）。
  var ADV_FLOOR_MS = clampInt(params.get('advFloor'), 30, 0, 3600) * 1000;
  var lastInterReqAt = 0;
  function wrapImports(imports) {
    if (!imports) return imports;
    ['env', 'wasi_snapshot_preview1'].forEach(function (ns) {
      var table = imports[ns];
      if (!table || table.__advProbeWrapped) return;
      AD_IMPORTS.forEach(function (name) {
        var orig = table[name];
        if (typeof orig !== 'function') return;
        table[name] = function () {
          var args = [].slice.call(arguments);
          if (name === 'InterstitialAdvShow_js' && ADV_FLOOR_MS > 0) {
            var now = stamp();
            var since = now - lastInterReqAt;
            if (lastInterReqAt && since < ADV_FLOOR_MS) {
              var remain = Math.ceil((ADV_FLOOR_MS - since) / 1000);
              PROBE.bridge.push({ t: now, name: name, args: args, floorBlocked: true, remainSec: remain });
              plog('C#→JS ' + name + ' 被页面节奏下限拦下（还差 ' + remain + 's，advFloor=0 可关）');
              return undefined;
            }
            lastInterReqAt = now;
          }
          PROBE.bridge.push({ t: stamp(), name: name, args: args });
          plog('C#→JS ' + name + (args.length ? '(' + args.join(',') + ')' : ''));
          return orig.apply(this, arguments);
        };
      });
      table.__advProbeWrapped = true;
    });
    return imports;
  }
  var oInstantiate = WebAssembly.instantiate;
  WebAssembly.instantiate = function (a, b) {
    return oInstantiate.call(this, a, wrapImports(b));
  };
  if (typeof WebAssembly.instantiateStreaming === 'function') {
    var oStreaming = WebAssembly.instantiateStreaming;
    WebAssembly.instantiateStreaming = function (a, b) {
      return oStreaming.call(this, a, wrapImports(b));
    };
  }

  // ---------------------------------------------------------------- 2) 页面 → C#
  function wrapSendMessage(instance) {
    if (!instance || instance.__advProbeWrapped) return;
    try {
      var oSend = instance.SendMessage;
      instance.SendMessage = function (obj, method, arg) {
        PROBE.jsToCs.push({ t: stamp(), method: method, arg: arg });
        plog('JS→C# ' + method + (arg === undefined ? '' : '(' + arg + ')'));
        return oSend.apply(this, arguments);
      };
      instance.__advProbeWrapped = true;
    } catch (e) {
      console.warn('[adv-probe] 包装 SendMessage 失败: ' + e.message);
    }
  }
  if (typeof window.createUnityInstance === 'function') {
    var oCreate = window.createUnityInstance;
    var wrappedCreate = function () {
      return oCreate.apply(this, arguments).then(function (instance) {
        wrapSendMessage(instance);
        plog('Unity 实例就绪，已挂 SendMessage 记录');
        return instance;
      });
    };
    wrappedCreate.__advProbeWrapped = true;
    window.createUnityInstance = wrappedCreate;
  }

  // ---------------------------------------------------------------- 3) 广告时序采集
  // 入口页/sdk.js 只用 console 输出广告过程，这里顺手录一份并按 Open→Close 统计单次时长。
  ['log', 'info', 'warn', 'error'].forEach(function (kind) {
    var orig = console[kind];
    console[kind] = function () {
      try {
        var text = [].slice.call(arguments).map(String).join(' ').replace(/^%c/, '');
        if (/Interstitial Adv|Rewarded Adv|InterAdvShow|RewardAdv|StickyAdv|广告播放中/.test(text)) {
          PROBE.events.push(stamp() + ' ' + text.slice(0, 140));
          if (/Open Interstitial Adv/.test(text)) onAdOpen();
          else if (/Close Interstitial Adv/.test(text)) onAdClose();
        }
      } catch (e) { /* ignore */ }
      return orig.apply(console, arguments);
    };
  });
  function onAdOpen() {
    PROBE.ads.push({ t: stamp(), open: true });
    if (SIMSTAT.pending) {
      SIMSTAT.pending.confirmedAt = stamp();
      SIMSTAT.shown++;
      SIMSTAT.lastShownAt = stamp();
      SIMSTAT.adStartAt = stamp();
      SIMSTAT.pending = null;
    }
    render();
  }
  function onAdClose() {
    PROBE.ads.push({ t: stamp(), open: false });
    if (SIMSTAT.adStartAt) {
      SIMSTAT.adMs += stamp() - SIMSTAT.adStartAt;
      SIMSTAT.adStartAt = 0;
    }
    render();
  }
  // mock 遮罩是 sdk.js 动态插进 body 的单个 DOM 元素，200ms 采样记录出现/消失
  setInterval(function () {
    var box = document.getElementById('ysdk-local-ad-overlay');
    var visible = !!box && getComputedStyle(box).display !== 'none';
    var last = PROBE.overlay[PROBE.overlay.length - 1];
    if (!last || last.visible !== visible) {
      var rec = { t: stamp(), visible: visible };
      if (visible) {
        var title = document.getElementById('ysdk-local-ad-title');
        rec.title = title ? title.textContent : '';
        plog('广告遮罩出现: ' + rec.title);
      } else {
        plog('广告遮罩消失');
      }
      PROBE.overlay.push(rec);
    }
  }, 200);

  // ---------------------------------------------------------------- 4) 触发（与游戏同一条入口）
  function instanceReady() {
    var cover = document.getElementById('loading-cover');
    return !!cover && cover.style.display === 'none';
  }
  function fire(kind) {
    var rec = { t: stamp(), kind: kind };
    if (!instanceReady()) {
      rec.skipped = 'unity-not-ready';
      PROBE.triggers.push(rec);
      plog('Unity 未就绪，跳过 ' + kind);
      return false;
    }
    if (typeof window[kind === 'reward' ? 'RewardedAdvShow' : 'InterAdvShow'] !== 'function') {
      rec.skipped = 'entry-fn-missing';
      PROBE.triggers.push(rec);
      console.warn('[adv-probe] 入口页没有 ' + kind + ' 的触发函数');
      return false;
    }
    PROBE.triggers.push(rec);
    plog('触发 ' + kind);
    try {
      if (kind === 'reward') window.RewardedAdvShow('advtest');
      else window.InterAdvShow();
    } catch (e) {
      rec.error = e.message;
      console.error('[adv-probe] 触发 ' + kind + ' 抛错: ' + e.message);
      return false;
    }
    return true;
  }

  // ---------------------------------------------------------------- 5) 节奏模拟器
  var SIMSTAT = {
    startAt: stamp(), requests: 0, shown: 0, blocked: 0, failed: 0,
    adMs: 0, adStartAt: 0, lastShownAt: 0, pending: null, lastBlockRemain: 0,
  };

  function request(source, force) {
    SIMSTAT.requests++;
    var rec = { t: stamp(), source: source, force: !!force };
    PROBE.triggers.push(rec);
    if (!instanceReady()) {
      SIMSTAT.failed++;
      rec.result = 'unity-not-ready';
      plog('请求(' + source + ') 未就绪，忽略');
      toast('Unity 还没就绪，稍后再试');
      render();
      return false;
    }
    if (SIMSTAT.pending) {
      SIMSTAT.failed++;
      rec.result = 'busy';
      plog('请求(' + source + ') 上一次还在进行中，忽略');
      toast('上一次广告还在播放中');
      render();
      return false;
    }
    // 间隔下限：与 PluginYG2 的 Inter Adv Interval 同义——没到间隔就只记一次"被拦"，不展示
    if (RESPECT && !force && SIMSTAT.shown > 0) {
      var since = stamp() - SIMSTAT.lastShownAt;
      if (since < INTERVAL * 1000) {
        SIMSTAT.blocked++;
        SIMSTAT.lastBlockRemain = Math.ceil((INTERVAL * 1000 - since) / 1000);
        rec.result = 'blocked';
        rec.remainSec = SIMSTAT.lastBlockRemain;
        plog('请求(' + source + ') 被间隔下限拦住，还差 ' + rec.remainSec + 's');
        toast('插屏被间隔下限拦住：还差 ' + rec.remainSec + 's（按 J 强制展示，或关掉「遵守间隔下限」）');
        render();
        return false;
      }
    }
    rec.result = 'fired';
    SIMSTAT.pending = { t: stamp(), source: source };
    plog('请求(' + source + ') 通过 → 触发插屏');
    try {
      window.InterAdvShow();
    } catch (e) {
      SIMSTAT.pending = null;
      SIMSTAT.failed++;
      rec.result = 'throw';
      rec.error = e.message;
      console.error('[adv-probe] 触发插屏抛错: ' + e.message);
      toast('触发插屏抛错：' + e.message);
    }
    render();
    return true;
  }
  // 页面守卫会静默拦掉（例如 SDK 未初始化 / 已有广告在播），1.5s 内没有 Open 事件就算失败
  setInterval(function () {
    if (!SIMSTAT.pending) return;
    if (stamp() - SIMSTAT.pending.t > 1500) {
      SIMSTAT.failed++;
      plog('请求(' + SIMSTAT.pending.source + ') 1.5s 内没有 Open 事件（页面守卫拦下？）');
      toast('插屏没有打开（页面守卫拦下？看控制台）');
      SIMSTAT.pending = null;
      render();
    }
  }, 300);

  function stats() {
    var elapsed = stamp() - SIMSTAT.startAt;
    return {
      intervalSec: INTERVAL,
      respectInterval: RESPECT,
      autoReqSec: AUTO_REQ,
      requests: SIMSTAT.requests,
      shown: SIMSTAT.shown,
      blocked: SIMSTAT.blocked,
      failed: SIMSTAT.failed,
      adMs: SIMSTAT.adMs,
      sessionMs: elapsed,
      adSharePct: elapsed ? Math.round((SIMSTAT.adMs / elapsed) * 1000) / 10 : 0,
      lastBlockRemainSec: SIMSTAT.lastBlockRemain,
    };
  }

  // 面板
  var panel = null;
  function render() {
    if (!panel) return;
    var s = stats();
    var nextIn = SIMSTAT.shown ? Math.max(0, Math.ceil((INTERVAL * 1000 - (stamp() - SIMSTAT.lastShownAt)) / 1000)) : 0;
    panel.querySelector('#adv-sim-stats').textContent =
      '请求 ' + s.requests + ' · 展示 ' + s.shown + ' · 被拦 ' + s.blocked + ' · 失败 ' + s.failed +
      ' | 插屏时长 ' + (s.adMs / 1000).toFixed(1) + 's / 会话 ' + (s.sessionMs / 1000).toFixed(0) + 's' +
      '（占 ' + s.adSharePct + '%）| 距下次可展示 ' + nextIn + 's';
    // 正在输入时不要覆盖用户输入的数字
    var iv = panel.querySelector('#adv-sim-interval');
    if (document.activeElement !== iv) iv.value = String(INTERVAL);
  }
  function buildPanel() {
    if (panel || !PANEL) return;
    var box = document.createElement('div');
    box.id = 'adv-sim-panel';
    box.style.cssText = [
      'position:fixed', 'left:10px', 'bottom:10px', 'z-index:2147483000', 'max-width:360px',
      'background:rgba(8,12,22,.9)', 'color:#e8f1ff', 'border:1px solid rgba(120,160,255,.4)',
      'border-radius:10px', 'padding:8px 10px', 'font:12px/1.6 system-ui,Segoe UI,sans-serif',
      'box-shadow:0 6px 24px rgba(0,0,0,.5)', 'text-align:left',
    ].join(';');
    box.innerHTML =
      '<div style="display:flex;align-items:center;gap:6px;font-weight:700">' +
      '<span>插屏节奏模拟器</span><span style="opacity:.6;font-weight:400">本地调试</span>' +
      '<button id="adv-sim-fold" style="margin-left:auto">－</button></div>' +
      '<div id="adv-sim-body">' +
      '<div style="margin:4px 0">请求触发：' +
      '<button id="adv-sim-start">开始游戏</button>' +
      '<button id="adv-sim-level">过关结算</button>' +
      '<button id="adv-sim-force">强插</button></div>' +
      '<div style="margin:4px 0">间隔下限 <input id="adv-sim-interval" type="number" min="0" max="3600" value="' + INTERVAL + '" style="width:56px"> 秒 ' +
      '<button data-sec="20">20</button><button data-sec="60">60</button><button data-sec="120">120</button></div>' +
      '<div style="margin:4px 0"><label><input id="adv-sim-respect" type="checkbox"' + (RESPECT ? ' checked' : '') + '> 遵守间隔下限（被拦只记请求）</label></div>' +
      '<div style="margin:4px 0">自动请求 每 <input id="adv-sim-auto" type="number" min="0" max="3600" value="' + AUTO_REQ + '" style="width:56px"> 秒（0=关）</div>' +
      '<div id="adv-sim-stats" style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(120,160,255,.25)"></div>' +
      '<div style="margin-top:4px">快捷键：<b>I</b> 请求插屏（受下限约束）· <b>J</b> 强制插屏 · <b>R</b> 激励</div>' +
      '<div style="margin-top:4px;opacity:.72">间隔下限＝最短间隔，真实频次还取决于请求点；Yandex 4.4 不允许短关卡实时游戏在关卡中途插播，平台自身也会限频（过密会在控制台告警）。插件 FAQ 建议 Inter Adv Interval ≥65s。</div>' +
      '</div>';
    (document.body || document.documentElement).appendChild(box);
    panel = box;
    var small = 'padding:2px 8px;margin-right:4px;border:1px solid rgba(120,160,255,.45);' +
      'background:rgba(40,70,140,.5);color:#e8f1ff;border-radius:6px;cursor:pointer;font:12px system-ui';
    Array.prototype.forEach.call(box.querySelectorAll('button'), function (b) {
      if (b.id !== 'adv-sim-fold') b.style.cssText = small;
      else b.style.cssText = small + ';margin-right:0';
    });
    box.querySelector('#adv-sim-start').onclick = function () { request('start'); };
    box.querySelector('#adv-sim-level').onclick = function () { request('level-end'); };
    box.querySelector('#adv-sim-force').onclick = function () { request('force', true); };
    box.querySelector('#adv-sim-respect').onchange = function (e) {
      setRespect(e.target.checked);
    };
    box.querySelector('#adv-sim-interval').onchange = function (e) {
      setIntervalSec(parseInt(e.target.value, 10));
    };
    box.querySelector('#adv-sim-auto').onchange = function (e) {
      setAutoReq(parseInt(e.target.value, 10));
    };
    Array.prototype.forEach.call(box.querySelectorAll('button[data-sec]'), function (b) {
      b.onclick = function () { setIntervalSec(parseInt(b.getAttribute('data-sec'), 10)); };
    });
    box.querySelector('#adv-sim-fold').onclick = function () {
      var body = box.querySelector('#adv-sim-body');
      var folded = body.style.display === 'none';
      body.style.display = folded ? '' : 'none';
      box.querySelector('#adv-sim-fold').textContent = folded ? '－' : '＋';
    };
    render();
  }

  var autoTimer = null;
  function setAutoReq(sec) {
    AUTO_REQ = clampInt(String(sec), 0, 0, 3600);
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    if (AUTO_REQ > 0) {
      // 每秒检查一次，节奏按"距上一次真正展示（或玩家开始游戏）已过 AUTO_REQ 秒"计算，
      // 这样 advStart 或手按的那次不会和自动请求撞车（撞车会凭空多出一条"被拦"记录）。
      autoTimer = setInterval(function () {
        if (AUTO_REQ <= 0) return;
        if (!instanceReady() || !startFired || SIMSTAT.pending) return;
        var base = Math.max(SIMSTAT.lastShownAt || 0, SIMSTAT.firstGestureAt || 0);
        if (base && stamp() - base < AUTO_REQ * 1000) return;
        request('auto-' + AUTO_REQ + 's');
      }, 1000);
    }
    plog('自动请求间隔 = ' + AUTO_REQ + 's（从上次展示/开始游戏起算）');
    render();
  }
  function setIntervalSec(sec) {
    INTERVAL = clampInt(String(sec), INTERVAL, 0, 3600);
    plog('间隔下限 = ' + INTERVAL + 's');
    render();
  }
  function setRespect(on) {
    RESPECT = !!on;
    plog('遵守间隔下限 = ' + RESPECT);
    render();
  }

  // 玩家开始游戏（Unity 就绪后首次点击画面，实际就是点 PLAY 那一下）
  var startFired = false;
  function onFirstGesture() {
    if (startFired || !instanceReady()) return;
    startFired = true;
    SIMSTAT.firstGestureAt = stamp();
    if (AT_START) setTimeout(function () { request('start'); }, 200);
  }
  window.addEventListener('pointerdown', onFirstGesture, true);
  window.addEventListener('touchstart', onFirstGesture, true);

  window.__advSim = {
    request: request,
    stats: stats,
    setInterval: setIntervalSec,
    setRespect: setRespect,
    setAutoReq: setAutoReq,
  };
  window.__advTest = {
    inter: function () { return fire('inter'); },
    reward: function () { return fire('reward'); },
    probe: PROBE,
    simulation: SIMSTAT,
    summary: function () {
      return {
        triggers: PROBE.triggers.length,
        bridge: PROBE.bridge.map(function (r) { return r.name; }),
        jsToCs: PROBE.jsToCs.map(function (r) { return r.method + (r.arg === undefined ? '' : ':' + r.arg); }),
        events: PROBE.events.slice(),
        overlay: PROBE.overlay.slice(),
      };
    },
  };

  if (KEYS) {
    window.addEventListener('keydown', function (e) {
      if (e.repeat || e.ctrlKey || e.altKey || e.metaKey) return;
      var k = (e.key || '').toLowerCase();
      if (k === 'i') request('level-end');
      else if (k === 'j') request('force', true);
      else if (k === 'r') fire('reward');
    });
  }

  if (TEST) {
    setTimeout(function () {
      if (TEST === 'reward') fire('reward');
      else if (TEST === 'both') {
        fire('inter');
        setTimeout(function () { fire('reward'); }, (ADS_SEC + 1) * 1000);
      } else fire('inter');
      if (EVERY > 0) setInterval(function () { fire('inter'); }, EVERY * 1000);
    }, DELAY * 1000);
  }

  function boot() {
    buildPanel();
    if (SIM) setAutoReq(AUTO_REQ);
    setInterval(render, 500);
    plog('已装载 sim=' + SIM + ' 面板=' + PANEL + ' advtest=' + TEST + ' advlog=' + LOG +
      ' 间隔下限=' + INTERVAL + 's 遵守=' + RESPECT + ' 自动请求=' + AUTO_REQ + 's 快捷键=' + KEYS);
    if (PANEL || LOG) {
      console.info('[adv-probe] 广告钩子已就绪：I=请求插屏（下限 ' + (RESPECT ? INTERVAL + 's' : '关') + '）· J=强制 · R=激励' +
        (AUTO_REQ > 0 ? ' · 每 ' + AUTO_REQ + 's 自动请求一次' : ''));
    }
  }
  if (document.body) boot();
  else document.addEventListener('DOMContentLoaded', boot);
})();

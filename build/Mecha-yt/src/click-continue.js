// 横屏输入激活门：仅在需要用户手势时提示点击，用点击恢复页面/Cocos 画布焦点。
//
// 触发条件（不再"游戏 ready 就弹"，避免覆盖广告弹窗、干扰二次进入玩法）：
//   1. 页面/画布失焦或切后台后重新可见（focus-regained）；
//   2. 玩法就绪时页面本就没有焦点（no-focus，对应 FB 审核"键盘不响应"场景）。
// 显式调用（激励/插屏播放结束）由 window.__mechaShowContinue 触发。
//
// 只在桌面网页端提示：安卓/苹果手机直接手指触摸操作，不存在"失焦导致键盘不可用"的问题，
// 因此移动端（cc.sys.isMobile / OS_ANDROID / OS_IOS，或 UA 兜底）整套遮罩都不弹，
// 广告回调也不等待点击，直接完成。
//
// 遮罩显示时暂停游戏（cc.game.pause()），点击继续时恢复（cc.game.resume()）；
// 只有"确实是本遮罩暂停的"才恢复，避免和广告/游戏内暂停弹窗自身的暂停状态打架。
(function () {
  "use strict";
  var params = new URLSearchParams(location.search), disabled = params.get("continue") === "off", debug = params.get("debug") === "1";
  var overlay = null, pending = null;
  var pausedByGate = false;   // 本次遮罩是否由自己触发暂停
  var sawBlur = false;        // 是否观察到页面失焦/切后台
  var gameplayReady = false;  // 玩法根节点是否已就绪
  function log() { if (debug) try { console.info.apply(console, ["[mecha-continue]"].concat([].slice.call(arguments))); } catch (_) {} }
  function ccGame() { try { return window.cc && cc.game ? cc.game : null; } catch (_) { return null; } }
  function adBusy() { return window.__mechaAdBusy === true; }
  function isFocused() { try { return !!(document.hasFocus && document.hasFocus()); } catch (_) { return false; } }
  // 移动端判定：优先用 Cocos 的平台信息，UA 兜底
  function isMobile() {
    try {
      if (window.cc && cc.sys) {
        if (cc.sys.isMobile === true) return true;
        if (cc.sys.os === cc.sys.OS_ANDROID || cc.sys.os === cc.sys.OS_IOS) return true;
      }
    } catch (_) {}
    try {
      var ua = navigator.userAgent || "";
      if (/Android|iPhone|iPad|iPod|Windows Phone|Mobile/i.test(ua)) return true;
      if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return true; // iPadOS 13+ 桌面 UA
    } catch (_) {}
    return false;
  }
  function pauseGame() {
    var game = ccGame();
    if (!game || typeof game.pause !== "function") return;
    try {
      if (typeof game.isPaused === "function" && game.isPaused()) { log("pause skipped: already paused"); return; }
      game.pause(); pausedByGate = true; log("game paused");
    } catch (_) {}
  }
  function resumeGame() {
    var game = ccGame();
    if (pausedByGate && game && typeof game.resume === "function") { try { game.resume(); log("game resumed"); } catch (_) {} }
    pausedByGate = false;
  }
  function restoreFocus() {
    var canvas = document.getElementById("GameCanvas");
    try { window.focus(); } catch (_) {}
    try { if (canvas) { if (!canvas.hasAttribute("tabindex")) canvas.setAttribute("tabindex", "0"); canvas.focus({ preventScroll: true }); } } catch (_) { try { if (canvas) canvas.focus(); } catch (_) {} }
    log("focus restored", document.activeElement && document.activeElement.id);
  }
  function ensureOverlay() {
    if (overlay) return overlay;
    overlay = document.createElement("div"); overlay.id = "mecha-continue-overlay"; overlay.setAttribute("role", "button"); overlay.setAttribute("aria-label", "Click anywhere to continue"); overlay.tabIndex = 0;
    overlay.innerHTML = '<div class="mecha-continue-content"><div class="mecha-continue-title">Click anywhere to continue</div><div class="mecha-touch" aria-hidden="true"><i class="mecha-ring mecha-ring-a"></i><i class="mecha-ring mecha-ring-b"></i><span class="mecha-finger">&#9757;&#65039;</span></div></div>';
    overlay.addEventListener("pointerdown", function (event) { event.preventDefault(); event.stopPropagation(); }, true);
    overlay.addEventListener("click", finish, true);
    overlay.addEventListener("keydown", function (event) { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); finish(event); } });
    document.body.appendChild(overlay); return overlay;
  }
  function finish(event) {
    if (event) event.stopPropagation(); if (!pending) return;
    var resolve = pending.resolve, reason = pending.reason; pending = null;
    if (overlay) overlay.classList.remove("is-visible");
    resumeGame(); restoreFocus(); log("continue", reason);
    window.__ytGameTimers.setTimeout(resolve, 0);
  }
  function present(reason) {
    if (disabled) { restoreFocus(); return Promise.resolve(); }
    if (isMobile()) { log("skip: mobile device", reason); return Promise.resolve(); }
    if (pending) return pending.promise;
    var resolve, promise = new Promise(function (done) { resolve = done; });
    pending = { promise: promise, resolve: resolve, reason: reason || "manual" };
    var node = ensureOverlay(); node.classList.add("is-visible");
    pauseGame();
    requestAnimationFrame(function () { try { node.focus({ preventScroll: true }); } catch (_) { node.focus(); } });
    log("show", pending.reason); return promise;
  }
  // 显式请求（广告结束）：即使广告互斥标记仍在也要弹。
  function show(reason) { return present(reason); }
  // 自动提示（失焦恢复/首次无焦点）：广告进行中不弹，与真实广告层"始终在最上层"的表现一致。
  function autoShow(reason) {
    if (adBusy()) { log("auto show skipped: ad busy", reason); return Promise.resolve(); }
    return present(reason);
  }
  function gameReady() {
    var splash = document.getElementById("splash"), canvas = document.getElementById("GameCanvas"), sceneReady = false;
    try {
      var scene = window.cc && cc.director && cc.director.getScene && cc.director.getScene();
      var gameNode = scene && cc.find && cc.find("Canvas/Game", scene);
      var playerControls = scene && cc.find && cc.find("Canvas/PopUp/playerCtrl", scene);
      var startGuide = scene && cc.find && cc.find("Canvas/TopTips/startGuide", scene);
      sceneReady = !!(gameNode && gameNode.activeInHierarchy &&
        ((playerControls && playerControls.activeInHierarchy) || (startGuide && startGuide.activeInHierarchy)));
    } catch (_) {}
    return !!canvas && sceneReady && (!splash || getComputedStyle(splash).display === "none");
  }
  function waitForGame() {
    var started = Date.now(), stableTicks = 0, timer = window.__ytGameTimers.setInterval(function () {
      if (gameReady()) stableTicks += 1; else stableTicks = 0;
      // 连续两次确认玩法根节点处于激活状态，避免盖在游戏内部 Loading 画面上。
      if (stableTicks >= 2) {
        window.__ytGameTimers.clearInterval(timer); gameplayReady = true;
        // 页面/画布本就没有焦点时（FB iframe 常见），提示点击以激活键盘控制。
        if (isFocused()) log("game-ready focused, no prompt");
        else autoShow("no-focus");
      } else if (Date.now() - started > 60000) { window.__ytGameTimers.clearInterval(timer); log("game-ready timeout"); }
    }, 250);
  }
  function onVisibleOrFocused() {
    if (document.hidden) return;
    var wasBlurred = sawBlur; sawBlur = false;
    if (!wasBlurred) return;
    // 延后到本轮事件分发结束，先让 cc.game 完成自身的 auto-resume，
    // 再判断是否需要由遮罩接管暂停；否则会误判成"已暂停"而不接管。
    window.__ytGameTimers.setTimeout(function () {
      // 遮罩仍在时，Cocos 会在重新可见时自动 resume，这里要重新把暂停接管回来。
      if (pending) { pauseGame(); return; }
      // 广告进行中是否弹出交给 autoShow 统一判断
      if (gameplayReady) autoShow("focus-regained");
      else restoreFocus();
    }, 0);
  }
  window.__mechaShowContinue = show; window.__mechaRestoreFocus = restoreFocus;
  window.addEventListener("blur", function () { sawBlur = true; log("window blur"); });
  window.addEventListener("focus", onVisibleOrFocused);
  window.addEventListener("pageshow", function () { restoreFocus(); });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { sawBlur = true; log("document hidden"); }
    else onVisibleOrFocused();
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", waitForGame, { once: true }); else waitForGame();
}());

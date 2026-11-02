/* FallToRescue 本地广告适配层（AGENTS.md §6）
 *
 * 原页面用 Google H5 广告（adsbygoogle.adBreak）+ Meta Pixel / TikTok Pixel / GA 外链，
 * 本地单机版全部去掉，改成页面级实现。对游戏只保留它真正调用的接口：
 *   getAdClient() / getAdSlot() / initAds()  ← 框架 _GetAdClient/_GetAdSlot/_InitAdScript
 *   playinter() / playreward()               ← 框架 _ShowInter/_ShowReward
 *
 * getAdClient() 的返回值不是普通配置：游戏 C# 的 CheckADID 会做 "adid == AES_Decrypt(secadid, key)"
 * 校验，不通过就 StopPlay() 并报 "不让你玩"（站点原页面靠 /adId.txt 里的合法 id 对通过校验）。
 * 本地单机版没有该文件，也不做真实广告，这里返回空对 "#"（游戏侧实测日志 "校验正确"、不阻断），
 * 需要改用真实 id 对时用 ?adid=X#Y 覆盖。
 *
 * 回调契约（与原页面一致，SendMessage 到 Unity 的 ADManager 对象）：
 *   插屏 InterCallBack:  beforeAd -> afterAd
 *   激励 RewardCallBack: beforeAd -> adViewed（看完，发奖）
 *                                 / adDismissed（中途关闭或不可用，不发奖） -> afterAd
 *
 * 调试参数：
 *   ?ads=off       默认：本地不播广告，插屏/激励按"不可用"收尾
 *   ?ads=mock      模拟广告：本地遮罩 N 秒后成功收尾
 *   ?ads=instant   模拟广告：立即成功收尾
 *   ?nofill=1      模拟无填充（优先于 ads=*），激励弹失败提示且不发奖
 *   ?adsSec=N      模拟时长（0~60 秒，默认 1.5）
 *   ?adid=X#Y      覆盖 getAdClient() 的返回值（调试用；游戏侧 CheckADID 会校验 X == Decrypt(Y)）
 *
 * 右上角音乐开关（本地单机版新增，独立于游戏自身的音频设置）：
 *   图标 = 当前状态（on.png = 音乐开，off.png = 静音），点击切换并写入 localStorage；
 *   ?music=off|on 可临时覆盖。实现见下方"右上角音乐开关"代码块。
 */
(function () {
  "use strict";

  var q = new URLSearchParams(location.search);
  var MODE = q.get("ads") || "";
  if (MODE !== "mock" && MODE !== "instant") MODE = "off";
  var NOFILL = q.get("nofill") === "1";
  var SEC = parseFloat(q.get("adsSec") || "1.5");
  if (!isFinite(SEC) || SEC < 0 || SEC > 60) SEC = 1.5;
  var FAIL_TEXT = "Ads are not available right now, please try again late";
  var unity = null;
  var busy = false;

  function log() {
    try { console.log.apply(console, ["[ftr-ads]"].concat([].slice.call(arguments))); } catch (e) {}
  }

  /* ---- 本地单机版：右上角音乐开关（页面层静音，不改游戏；与 StretchTheCat 同一套实现） ----
   * 该构建每个音频通道都是 source → (panner) → gain → AudioContext.destination，
   * 这里拦 AudioNode.prototype.connect，把所有"连到 destination"的连接改成连到本页的总音量
   * GainNode（gain = 0/1），因此游戏自己（或平台 SDK）改回音量也盖不掉这个开关。
   * 图标 = 当前状态（on.png = 音乐开，off.png = 静音），状态存 localStorage（按端口隔离）。
   * ?music=off|on 可临时覆盖（不写 localStorage）。
   */
  var MUSIC_KEY = "FallToRescue.music.muted";
  var MUSIC_BTN_ID = "ftr-music-toggle";
  var musicMuted = false;
  try { musicMuted = localStorage.getItem(MUSIC_KEY) === "1"; } catch (e) {}
  if (q.get("music") === "off") musicMuted = true;
  else if (q.get("music") === "on") musicMuted = false;
  var masterGains = [];   // [{ ctx, gain }]
  var audioStats = { contexts: 0, redirects: 0 };
  var audioOrigConnect = (window.AudioNode && window.AudioNode.prototype && window.AudioNode.prototype.connect) || null;

  function masterGainFor(ctx) {
    for (var i = 0; i < masterGains.length; i++) {
      if (masterGains[i].ctx === ctx) return masterGains[i].gain;
    }
    var gain = ctx.createGain();
    gain.gain.value = musicMuted ? 0 : 1;
    if (audioOrigConnect) audioOrigConnect.call(gain, ctx.destination);
    else gain.connect(ctx.destination);
    masterGains.push({ ctx: ctx, gain: gain });
    audioStats.contexts++;
    return gain;
  }

  function isDestinationNode(dest) {
    return !!(dest && dest.context && dest === dest.context.destination);
  }

  if (audioOrigConnect) {
    window.AudioNode.prototype.connect = function (dest) {
      if (isDestinationNode(dest)) {
        audioStats.redirects++;
        return audioOrigConnect.call(this, masterGainFor(dest.context));
      }
      return audioOrigConnect.apply(this, arguments);
    };
    log("音乐开关：已接管音频通路（连到 destination 的连接会先经过总音量节点）");
  } else {
    log("音乐开关：本浏览器没有 AudioNode，仅保留 UI 状态");
  }

  function musicIconSrc() { return musicMuted ? "off.png" : "on.png"; }

  function setMusicMuted(value) {
    musicMuted = !!value;
    try { localStorage.setItem(MUSIC_KEY, musicMuted ? "1" : "0"); } catch (e) {}
    for (var i = 0; i < masterGains.length; i++) masterGains[i].gain.gain.value = musicMuted ? 0 : 1;
    var btn = document.getElementById(MUSIC_BTN_ID);
    if (btn) {
      var img = btn.querySelector("img");
      if (img) img.setAttribute("src", musicIconSrc());
      btn.setAttribute("aria-label", musicMuted ? "音乐已关闭，点击开启" : "音乐已开启，点击静音");
      btn.setAttribute("title", btn.getAttribute("aria-label"));
    }
    log("音乐开关：" + (musicMuted ? "已静音（总音量 0）" : "已开启（总音量 1）"));
  }

  function initMusicUi() {
    if (document.getElementById(MUSIC_BTN_ID)) return;
    var style = document.createElement("style");
    style.textContent =
      "#" + MUSIC_BTN_ID + "{position:fixed;top:8px;right:8px;width:50px;height:50px;padding:0;border:0;background:none;" +
      "cursor:pointer;z-index:2147483646;line-height:0;touch-action:manipulation;-webkit-tap-highlight-color:transparent}" +
      "#" + MUSIC_BTN_ID + " img{width:100%;height:100%;display:block;filter:drop-shadow(0 1px 2px rgba(0,0,0,.35))}" +
      "@media (max-width:480px){#" + MUSIC_BTN_ID + "{width:42px;height:42px;top:6px;right:6px}}";
    (document.head || document.documentElement).appendChild(style);
    var btn = document.createElement("button");
    btn.id = MUSIC_BTN_ID;
    btn.type = "button";
    var img = document.createElement("img");
    img.setAttribute("src", musicIconSrc());
    img.alt = "";
    img.draggable = false;
    btn.appendChild(img);
    // 开关自己吃掉指针事件，避免点击穿透到 Unity 被当成游戏点击
    ["mousedown", "mouseup", "click", "pointerdown", "pointerup", "touchstart", "touchend", "dblclick"].forEach(function (type) {
      btn.addEventListener(type, function (e) { e.stopPropagation(); }, false);
    });
    btn.addEventListener("click", function (e) { e.preventDefault(); setMusicMuted(!musicMuted); }, false);
    (document.body || document.documentElement).appendChild(btn);
    setMusicMuted(musicMuted);
    log("音乐开关 UI 已就绪：" + MUSIC_BTN_ID + "（" + musicIconSrc() + "）");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initMusicUi);
  else initMusicUi();

  // 送到 Unity 的 ADManager（字符串与原页面完全一致）
  function send(method, value) {
    if (!unity) { log("Unity 未就绪，丢弃 " + method + " '" + value + "'"); return false; }
    try {
      unity.SendMessage("ADManager", method, value);
      log("SendMessage ADManager." + method + "('" + value + "')");
      return true;
    } catch (e) {
      log("SendMessage 异常: " + e);
      return false;
    }
  }

  /* ---- 本地提示与模拟遮罩（只在本页面显示，不影响游戏 UI） ---- */
  var overlay = null;
  function showOverlay(text) {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.style.cssText = "position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.85);color:#fff;font:16px/1.4 Arial,Helvetica,sans-serif;text-align:center;padding:20px";
    overlay.textContent = text;
    (document.body || document.documentElement).appendChild(overlay);
  }
  function hideOverlay() {
    if (overlay) { overlay.remove(); overlay = null; }
  }
  function toast(text) {
    var el = document.getElementById("ftr-local-ad-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "ftr-local-ad-toast";
      el.style.cssText = "position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);max-width:80%;padding:14px 20px;border-radius:10px;background:rgba(0,0,0,.82);color:#fff;font:16px/1.4 Arial;z-index:2147483647;pointer-events:none;text-align:center";
      (document.body || document.documentElement).appendChild(el);
    }
    el.textContent = text;
    el.style.display = "block";
    clearTimeout(el.__t);
    el.__t = setTimeout(function () { el.style.display = "none"; }, 2200);
  }

  /* ---- 广告流程 ---- */
  function playInter() {
    log("插屏请求（ads=" + MODE + " nofill=" + NOFILL + "）");
    // 插屏：失败/无填充不提示、不发奖，只做一次收尾（与原 AdSense 行为一致：没有广告就什么都不发生）
    if (NOFILL || MODE === "off") { log("插屏不可用，不发提示"); return; }
    busy = true;
    send("InterCallBack", "beforeAd");
    var wait = MODE === "instant" ? 0 : SEC * 1000;
    if (MODE === "mock") showOverlay("（本地模拟广告）插屏 " + SEC + "s");
    setTimeout(function () {
      hideOverlay();
      send("InterCallBack", "afterAd");
      log("插屏结束");
      busy = false;
    }, wait);
  }

  function playReward() {
    log("激励请求（ads=" + MODE + " nofill=" + NOFILL + "）");
    busy = true;
    send("RewardCallBack", "beforeAd");
    if (NOFILL || MODE === "off") {
      // 无填充/本地不可用：按"未看完"收尾，提示一次且不发奖
      toast(FAIL_TEXT);
      send("RewardCallBack", "adDismissed");
      send("RewardCallBack", "afterAd");
      busy = false;
      return;
    }
    var wait = MODE === "instant" ? 0 : SEC * 1000;
    if (MODE === "mock") showOverlay("（本地模拟广告）激励 " + SEC + "s");
    setTimeout(function () {
      hideOverlay();
      send("RewardCallBack", "adViewed");
      send("RewardCallBack", "afterAd");
      log("激励看完，已发奖");
      busy = false;
    }, wait);
  }

  // 中途关闭（调试用：控制台执行 __ftrAds.dismissReward()）
  function dismissReward() {
    if (!busy) return;
    hideOverlay();
    send("RewardCallBack", "adDismissed");
    send("RewardCallBack", "afterAd");
    log("激励中途关闭，不发奖");
    busy = false;
  }

  window.__ftrAds = {
    mode: MODE,
    nofill: NOFILL,
    get busy() { return busy; },
    onUnityReady: function (instance) { unity = instance; log("Unity 实例已交给广告适配层"); },
    dismissReward: dismissReward,
  };

  /* ---- 右上角音乐开关（控制台/验收接口，见 README §4） ---- */
  window.__ftrMusic = {
    key: MUSIC_KEY,
    buttonId: MUSIC_BTN_ID,
    get muted() { return musicMuted; },
    set: function (v) { setMusicMuted(!!v); },
    toggle: function () { setMusicMuted(!musicMuted); },
    stats: function () {
      var gains = [];
      for (var i = 0; i < masterGains.length; i++) gains.push(masterGains[i].gain.gain.value);
      var states = [];
      for (var j = 0; j < masterGains.length; j++) { try { states.push(masterGains[j].ctx.state); } catch (e) { states.push("?"); } }
      var btn = document.getElementById(MUSIC_BTN_ID);
      var img = btn && btn.querySelector("img");
      var box = null;
      if (btn) { var r = btn.getBoundingClientRect(); box = [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; }
      var stored = null;
      try { stored = localStorage.getItem(MUSIC_KEY); } catch (e) {}
      return {
        muted: musicMuted,
        contexts: audioStats.contexts,
        contextStates: states,
        redirects: audioStats.redirects,
        gainValues: gains,
        stored: stored,
        button: btn ? { id: btn.id, box: box, icon: img ? img.getAttribute("src") : null, iconLoaded: !!(img && img.naturalWidth) } : null,
      };
    },
  };

  /* ---- 框架 JSLib 调用的页面接口（原页面同名函数） ---- */
  // 站点原页面在这里返回 "adId.txt 第1行#第2行"，供游戏 C# 侧校验广告位配置。
  var AD_ID = q.get("adid") || "#";
  window.getAdClient = function () { return AD_ID; };
  window.getAdSlot = function () { return ""; };
  window.initAds = function () { log("initAds：本地不加载外部广告脚本"); };
  window.playinter = playInter;
  window.playreward = playReward;

  log("本地广告适配层就绪：ads=" + MODE + " nofill=" + NOFILL + " adsSec=" + SEC);
})();

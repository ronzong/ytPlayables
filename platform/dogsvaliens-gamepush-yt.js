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

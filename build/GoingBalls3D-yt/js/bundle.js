!function () {
    "use strict";
    class e { }
    var t, i;
    e.UIType = {
        loadUI: 0,
        gameExport1: "gameExport1",
        gameExport2: "gameExport2",
        gameExport3: "gameExport3",
        homeUI: "homeUI",
        gameUI: "gameUI",
        shopUI: "shopUI",
        trySkinUI: "trySkinUI",
        resultUI: "resultUI",
        hitBoxUI: "hitBoxUI",
        hitBoxUI1: "hitBoxUI1",
        hitBoxUI2: "hitBoxUI2",
        threeGridUI: "threeGridUI",
        fourGridUI: "fourGridUI",
        video: "video",
        interstitialAd: "interstitialAd",
        sceneLateUI1: "sceneLateUI1",
        sceneLateUI2: "sceneLateUI2",
        sceneLateUI3: "sceneLateUI3",
        sceneLateUI4: "sceneLateUI4",
        singleGridUI: "singleGridUI",
        resultUI2: "resultUI2",
        sceneLateUI5: "sceneLateUI5",
        reviveUI: "reviveUI"
    }, e.curUI = "homeUI", e.processUI = ["threeGridUI", "homeUI", "gameUI", "resultUI", "gameExport3", "gameExport1", "hitBoxUI", "sceneLateUI1", "video", "sceneLateUI2", "sceneLateUI3", "sceneLateUI4", "fourGridUI", "singleGridUI", "interstitialAd", "trySkinUI", "resultUI2"],
        e.before_pass_limit_export = !1, e.before_pass_limit_ad = !1, e.beforeGameUI = !1,
        e.afterGameUI = !1, e.RegNum = 13, e.IconUIType = {
            gameExport1: "gameExport1",
            gameExport2: "gameExport2",
            gameExport3: "gameExport3",
            homeUI: 3,
            gameUI: "gameUI",
            shopUI: "shopUI",
            trySkinUI: 2,
            resultUI: 4,
            hitBoxUI: 1,
            hitBoxUI1: "hitBoxUI1",
            hitBoxUI2: "hitBoxUI2",
            threeGridUI: 0,
            fourGridUI: 0,
            video: "video",
            interstitialAd: "interstitialAd",
            sceneLateUI1: 1,
            sceneLateUI2: 1,
            sceneLateUI3: 1,
            sceneLateUI4: 1,
            singleGridUI: 0,
            resultUI2: 4,
            sceneLateUI5: 1
        }, function (e) {
            e[e.RESULTUI = 0] = "RESULTUI", e[e.GRIDUI = 1] = "GRIDUI", e[e.TRYSKINUI = 2] = "TRYSKINUI";
        }(t || (t = {})), function (e) {
            e[e.HOMEUI = 0] = "HOMEUI", e[e.GAMEUI = 1] = "GAMEUI", e[e.TRYSKINUI = 2] = "TRYSKINUI";
        }(i || (i = {}));
    const s = "wxbe2511d10a62959e", a = "1524", n = "highball", r = "", o = "",//https://api.328vip.com/Api
        h = "", l = ``, //https://wxsdk-cdn.miso-lab.com/${n}/
        d = "2.0.1";
    class c {
        constructor() { }
        static init(e) {
            let t;
            this.miniprogram_id = e.miniId || 0, this.openid = this.uid = e.openid || "";
            let i = wx.getSystemInfoSync(), s = ((t = window.wx.getLaunchOptionsSync()).referrerInfo || {}).appId || "", a = i.version || "", n = t.query;
            this.client = i.brand + "-" + i.model, this.inviter_id = n.inviter_id || "", this.channel_id = n.channel_id || "",
                this.share_id = n.share_id || 0, this.scene = t.scene || 0, this.appid = s, this.version = a,
                this.today_first_scene = "", this.reg_channel_id = "", this.reg_time = 0, this.sdkversion = "2.0.0",
                this.userInit();
        }
        static checkInitComplete() {
            return !(!this.miniprogram_id || !this.openid) || (console.error("初始化失败,请填入游戏ID以及openid"),
                !1);
        }
        static userInit() {
            if (this.checkInitComplete()) {
                let e = {
                    miniprogram_id: this.miniprogram_id,
                    uid: this.uid,
                    openid: this.openid,
                    scene: this.scene,
                    share_id: this.share_id || 0,
                    channel_id: this.channel_id,
                    appId: this.appid,
                    version: this.version,
                    inviter_id: this.inviter_id,
                    client: this.client,
                    sdk_version: this.sdkversion
                }, t = e => {
                    this.reg_channel_id = e.data.channel_id, this.today_first_scene = e.data.scene,
                        this.reg_time = e.data.reg_time;
                };
                this.request("/Stat/Index/init", e, t);
            }
        }
        static eventStat(e, t) { }
        static boxClick(e) {
            if (this.checkInitComplete()) {
                let t = e.id;
                if (!t) return void console.error("统计->跳转ID为空");
                let i = {
                    id: t,
                    miniprogram_id: this.miniprogram_id,
                    openid: this.openid,
                    channel_id: this.reg_channel_id,
                    scene: this.today_first_scene,
                    images_id: e.images_id || 0,
                    reg_time: this.reg_time,
                    sdk_version: this.sdkversion
                }, s = function (e) { };
                this.request("/Stat/Index/click", i, s);
            }
        }
        static boxStat(e) {
            if (this.checkInitComplete()) {
                let t = e.id;
                if (!t) return void console.error("统计->跳转ID为空");
                let i = {
                    id: t,
                    miniprogram_id: this.miniprogram_id,
                    openid: this.openid,
                    channel_id: this.reg_channel_id,
                    scene: this.today_first_scene,
                    images_id: e.images_id || 0,
                    reg_time: this.reg_time,
                    sdk_version: this.sdkversion
                }, s = function (e) {
                    console.log(e.msg);
                };
                this.request("/Stat/Index/box", i, s);
            }
        }
    }
    c.formatURL = function (e) {
        return "" + e;//https://log.328vip.com
    }, c.request = function (e, t, i, s = !1) {
        let a = this;
        e = this.formatURL(e);
        let n = t;
        var r = new XMLHttpRequest();
        if (r.onreadystatechange = function () {
            if (r.status >= 200 && r.status < 400 && 4 == r.readyState) {
                let e = r.responseText, t = a.dealWithHttpResponse(e);
                i && i(t);
            }
        }, r.open("POST", e, !0), s) r.setRequestHeader("Content-Type", "application/json"),
            r.send(JSON.stringify(n)); else {
            let e = "";
            for (let t in n) "?" != e && "" != e && (e += "&"), e += t + "=" + encodeURIComponent(n[t]);
            r.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;"), r.send(e);
        }
        console.log("统计请求发送Https数据", n);
    }, c.dealWithHttpResponse = function (e) {
        if ("fail" == e || "" == e) return;
        return JSON.parse(e);
    };
    var p = Laya.Browser.window.wx;
    class g {
        constructor() {
            this.bannerIdex = 0, this.isShow = !1, this.bannerIdex = 0, this.allBanner = [];
        }
        static get Inst() {
            return g._inst || (g._inst = new g()), g._inst;
        }
        init(e, t, i) {
            for (var s in this.bannerId = e, this.bannerIdex = 0, this.refreshTime = 1e3 * t || 5e3,
                this.showNum = i, this.system = window.wx.getSystemInfoSync(), this.bannerId) this.initBanner(this.bannerId[s]);
            Laya.timer.loop(20, this, this.loopFun), window.wx && (window.wx.onShow(e => {
                this.onShow(e);
            }), window.wx.onHide(e => {
                this.onHide(e);
            }));
        }
        loopFun() {
            this.isShow && Laya.timer.currTimer > this.nextBannerTime && this.changeBanner();
        }
        onShow(e) {
            console.log("onshow--", e), this.isShow && this.showBanner();
        }
        onHide(e) {
            console.log("onHide--", e);
        }
        initBanner(e) {
            if (null == e) return;
            let t = p.createBannerAd({
                adUnitId: e,
                adIntervals: 30,
                style: {
                    left: .1 * this.system.windowWidth,
                    top: 0,
                    width: .8 * this.system.windowWidth
                }
            });
            t.onResize(e => {
                t.style.height = 120, t.style.top = this.system.windowHeight - Math.floor(e.height) - 20;
            }), t.onError(t => {
                console.log(e + "init Banner fail !!!", t);
            }), t.onLoad(e => {
                console.log("bannerOnLoad"), t.hide();
                let i = {
                    bannerAd: t,
                    isShow: !1,
                    num: 0
                };
                this.allBanner.push(i);
            });
        }
        changeBanner() {
            this.bannerIdex = (this.bannerIdex + 1) % this.bannerId.length, this.showBanner();
        }
        showBanner() {
            if (this.hideBanner(), this.isShow = !0, this.allBanner.length > 0 && this.allBanner[this.bannerIdex]) {
                let e = this.allBanner[this.bannerIdex];
                e.bannerAd && e.bannerAd.show(), e.isShow = !0, e.num += 1, this.nextBannerTime = Laya.timer.currTimer + this.refreshTime;
            } else this.nextBannerTime = Laya.timer.currTimer + 500;
        }
        hideBanner() {
            if (this.isShow = !1, this.allBanner.length > 0) for (var e in this.allBanner) {
                let t = this.allBanner[e];
                t.isShow && (t.bannerAd && t.bannerAd.hide(), t.isShow = !1, t.num > this.showNum && this.createBanner(e));
            }
        }
        createBanner(e) {
            let t = this.allBanner[e];
            t.num = 0, t.bannerAd && t.bannerAd.destroy(), t.bannerAd = null;
            let i = p.createBannerAd({
                adUnitId: this.bannerId[e],
                adIntervals: 30,
                style: {
                    left: 0,
                    top: 0,
                    width: this.system.windowWidth
                }
            });
            i.onResize(e => {
                i.style.height = 120, i.style.top = this.system.windowHeight - Math.floor(e.height) - 3,
                    i.style.left = 0;
            }), i.onError(t => {
                console.log(this.bannerId[e] + "init Banner fail !!!", t);
            }), i.onLoad(e => {
                console.log("bannerOnLoad"), i.hide(), t.bannerAd = i;
            });
        }
    }
    class u {
        constructor() {
            this.eventDispatcher = new Laya.EventDispatcher();
        }
        static get inst() {
            return null == this._inst && (this._inst = new u()), this._inst;
        }
        event(e, t) {
            this.eventDispatcher.event(e, t);
        }
        on(e, t, i, s) {
            this.eventDispatcher.on(e, t, i, s);
        }
        off(e, t, i) {
            this.eventDispatcher.off(e, t, i);
        }
    }
    u.ON_SHOW = "onshow", u.ON_HIDE = "onhide", u.START_GAME = "startgame", u.GAME_OVER = "gameover",
        u.ADD_DOLLAR = "adddollar", u.UPDATE_MOUSE = "updatemouse", u.CHANGE_SKIN = "changeskin";
    var m, y, I, f, w, x, b, _, S, v, L, C;
    function __awaiter(e, t, i, s) {
        return new (i || (i = Promise))(function (a, n) {
            function fulfilled(e) {
                try {
                    step(s.next(e));
                } catch (e) {
                    n(e);
                }
            }
            function rejected(e) {
                try {
                    step(s.throw(e));
                } catch (e) {
                    n(e);
                }
            }
            function step(e) {
                e.done ? a(e.value) : new i(function (t) {
                    t(e.value);
                }).then(fulfilled, rejected);
            }
            step((s = s.apply(e, t || [])).next());
        });
    }
    !function (e) {
        e[e.Prod = 2] = "Prod", e[e.Pre = 1] = "Pre";
    }(m || (m = {})), function (e) {
        e[e.Invalid = -1] = "Invalid", e[e.Unknown = 0] = "Unknown", e[e.Male = 1] = "Male",
            e[e.Female = 2] = "Female";
    }(y || (y = {})), function (e) {
        e[e.Click = 0] = "Click", e[e.Cancel = -1] = "Cancel";
    }(I || (I = {})), function (e) {
        e[e.None = -1] = "None", e[e.Share = 1] = "Share", e[e.Video = 2] = "Video", e[e.VideoToShare = 3] = "VideoToShare";
    }(f || (f = {})), function (e) {
        e[e.None = 0] = "None", e[e.Share = 1] = "Share", e[e.ShareAysnc = 2] = "ShareAysnc",
            e[e.Video = 3] = "Video";
    }(w || (w = {})), function (e) {
        e[e.ShareLaunch = 10] = "ShareLaunch", e[e.ShareInterrupt = 11] = "ShareInterrupt",
            e[e.ShareSuccess = 12] = "ShareSuccess", e[e.ShareEnterLaunch = 13] = "ShareEnterLaunch",
            e[e.ShareEnterGame = 14] = "ShareEnterGame", e[e.VideoFetchSuccess = 20] = "VideoFetchSuccess",
            e[e.VideoPlayInterrupt = 21] = "VideoPlayInterrupt", e[e.VideoPlayComplete = 22] = "VideoPlayComplete",
            e[e.VideoFetchFail = 23] = "VideoFetchFail", e[e.InterstitialAdSuccess = 30] = "InterstitialAdSuccess",
            e[e.InterstitialAdFail = 31] = "InterstitialAdFail";
    }(x || (x = {})), function (e) {
        e[e.default = 0] = "default", e[e.share = 1] = "share", e[e.click = 2] = "click";
    }(b || (b = {})), function (e) {
        e[e.default = 0] = "default", e[e.banner = 1] = "banner", e[e.video = 2] = "video",
            e[e.interstitial = 3] = "interstitial", e[e.grid = 4] = "grid", e[e.custom = 5] = "custom";
    }(_ || (_ = {})), function (e) {
        e[e.default = 0] = "default", e[e.request = 1] = "request", e[e.rt = 2] = "rt",
            e[e.show = 3] = "show", e[e.click = 4] = "click", e[e.complete = 5] = "complete",
            e[e.interrupt = 6] = "interrupt", e[e.fail = 7] = "fail";
    }(S || (S = {})), function (e) {
        e.Wifi = "wifi", e["2g"] = "2g", e["3g"] = "3g", e["4g"] = "4g", e.Unknown = "unknown",
            e.None = "none";
    }(v || (v = {})), function (e) {
        e[e.default = 0] = "default", e[e.draw = 1] = "draw", e[e.guessLike = 2] = "guessLike",
            e[e.grid = 3] = "grid", e[e.play = 4] = "play";
    }(L || (L = {}));
    class U {
        constructor() {
            this.token = "", this.refToken = "", this.expice = 0, this.isnew = 0, this.scene = "",
                this.openId = "", this.userId = 0, this.regTime = "", this.launchTime = 0, this.shareId = 0,
                this.shareKey = "", this.platform = "", this.networkType = v.Unknown, this.gender = y.Unknown,
                this.channelId = 0, this.queryChannelId = 0, this.queryExtData = {}, this.inviteType = 0,
                this.shareTicket = "", this.systemId = 0, this.launchKey = "", this.launchSource = -1,
                this.authorize = !1, this.cdnUrl = "", this.envEnum = 2, this.version = "1.0", this.inviteUid = 0,
                this.queryUserInviteUid = 0, this.shield = 0, this.configParams = null, this.userState = C.Default,
                this.isCross = !1, this.isDrawer = !1, this.isGuessLike = !1;
        }
    }
    !function (e) {
        e[e.Default = 0] = "Default", e[e.Old = 1] = "Old", e[e.New = 2] = "New";
    }(C || (C = {}));
    class k {
        static isString(e) {
            return "[object String]" === this.toString.call(e);
        }
        static isFunction(e) {
            return "function" == typeof e;
        }
        static isPlainObject(e) {
            return null !== e && "[object Object]" === this.toString.call(e) && "isPrototypeOf" in e;
        }
        static isObject(e) {
            return null !== e && "[object Object]" === this.toString.call(e);
        }
        static isArray(e) {
            return "[object Array]" === this.toString.call(e);
        }
        static isNumber(e) {
            return "number" == typeof e && isFinite(e);
        }
        static isUndefined(e) {
            return void 0 === e || "undefined" === e;
        }
        static hasProperty(e, t) {
            return !!e && e.hasOwnProperty(t);
        }
        static trim(e) {
            return e.replace(/^\s+/g, "").replace(/\s+$/g, "");
        }
        static isEmpty(e) {
            return !e || void 0 === e || this.isString(e) && "" === this.trim(e) || "null" === e;
        }
        static covertArray(e) {
            let t = [];
            return t = this.isArray(e) ? [...e] : [e];
        }
        static serializeParams(e) {
            if (!e) return "";
            const t = encodeURIComponent;
            return Object.keys(e).map(i => `${t(i)}=${t(e[i])}`).join("&");
        }
        static compareVersion(e, t) {
            e = e.split("."), t = t.split(".");
            let i = Math.max(e.length, t.length);
            for (; e.length < i;) e.push("0");
            for (; t.length < i;) t.push("0");
            for (let s = 0; s < i; s++) {
                let i = parseInt(e[s]), a = parseInt(t[s]);
                if (i > a) return 1;
                if (i < a) return -1;
            }
            return 0;
        }
        static clone(e) {
            if (null === e || "object" != typeof e) return e;
            if (this.isArray(e)) {
                let t = e.slice();
                for (let e = 0, i = t.length; e < i; e++) t[e] = this.clone(t[e]);
                return t;
            }
            {
                let t = {};
                for (let i in e) t[i] = this.clone(e[i]);
                return t;
            }
        }
        static merge(e, t, i) {
            if (null === e || "object" != typeof e) throw new TypeError("SDK merge() - 第一个参数必须是object, 不能为 " + typeof e + "。");
            if (null === t || "object" != typeof t) throw new TypeError("SDK merge() - 第二个参数必须是object, 不能为 " + typeof t + "。");
            if (this.isArray(e) || this.isArray(t)) throw new TypeError("SDK merge() - 不支持数组合并。");
            for (let s in t) {
                let a, n = t[s];
                Object.prototype.hasOwnProperty.call(e, s) ? i || (null !== (a = e[s]) && "object" == typeof a && null !== n && "object" == typeof n ? this.merge(a, n, !1) : e[s] = this.clone(n)) : e[s] = this.clone(n);
            }
            return e;
        }
        static promisifyAsyncWrap(e) {
            return t => new Promise((i, s) => {
                let a = {
                    success: e => {
                        i(e);
                    },
                    fail: e => {
                        s(e);
                    }
                };
                e(Object.assign({}, a, t));
            });
        }
    }
    k.toString = Object.prototype.toString;
    class E {
        getItem(e) {
            return wx.getStorageSync(e);
        }
        setItem(e, t) {
            wx.setStorageSync(e, t);
        }
        removeItem(e) {
            wx.removeStorageSync(e);
        }
        clear() {
            wx.clearStorageSync();
        }
        hasKey(e) {
            let t = wx.getStorageInfoSync().keys, i = [];
            return t && t.length && (i = t.filter(t => t === e)), 0 !== i.length;
        }
    }
    class B {
        getItem(e) {
            return window.__ytStorage.getItem(e) || "";
        }
        setItem(e, t) {
            window.__ytStorage.setItem(e, t);
        }
        removeItem(e) {
            window.__ytStorage.removeItem(e);
        }
        clear() {
            window.__ytStorage.clear();
        }
        hasKey(e) {
            let t = window.__ytStorage.length;
            if (t) for (let i = 0; i < t; i++) {
                if (e === window.__ytStorage.key(i)) return !0;
            }
            return !1;
        }
    }
    class A {
        constructor() {
            this.store = null, "object" == typeof window.__ytStorage && (this.store = new B()), "undefined" != typeof wx && (this.store = new E());
        }
        __isExpired(e) {
            if (!e) return !0;
            return this.timestamp - (e.timestamp + e.expiration) >= 0;
        }
        get timestamp() {
            return +(new Date().getTime() / 1e3).toFixed(0);
        }
        set(e, t, i = 0) {
            const s = {
                timestamp: this.timestamp,
                expiration: i,
                key: e,
                value: t
            };
            return this.store.setItem(e, JSON.stringify(s)), this;
        }
        get(e) {
            let t;
            try {
                if (!(t = this.store.getItem(e))) return null;
                t = JSON.parse(t);
            } catch (e) {
                return console.warn(e), null;
            }
            return t.expiration && this.__isExpired(t) ? (this.remove(e), null) : t.value;
        }
        remove(e) {
            try {
                this.store.removeItem(e);
            } catch (e) {
                console.warn(e);
            }
            return this;
        }
        clear() {
            try {
                this.store.clear();
            } catch (e) {
                console.warn(e);
            }
            return this;
        }
        isExist(e) {
            return this.store.hasKey(e);
        }
        static get I() {
            return this.instance || (this.instance = new A());
        }
    }
    const T = {
        game_id: "10069",
        channel_id: "10069",
        version: "1.0.2",
        appkey: "5fafc9d8693ec245b5da09c6e40ff658",
        interstitialAdId: "adunit-e8f80e01fb6e1b8e",
        bannerId: "adunit-9e80cbc3f0eb027e",
        gridId: "",
        customId: "adunit-cf69738dc3970fa7",
        videoAd: "adunit-c5bf132d0e157f57",
        shareMessageToFriend: {
            scene: 10,
            sharekey: "shareMessageToFriendScene",
            share_id: 26
        },
        default_share: {
            content: "球球冲呀！！",
            icon: "https://cdn-wxsdk.miso-lab.com/a0/84fbb432b479bac59270c52db01392.png",
            id: "9999",
            key: "default",
            title: "默认",
            typ: 1,
            videoid: ""
        },
        MidasPay: {
            OfferId: "1450031480",
            ZoneId: "1",
            Mode: "game",
            CurrencyType: "CNY",
            Platform: ""
        }
    }, P = !1, N = {
        Prod: "https://login-wxsdk.d3games.com/",
        Pre: "https://login-wxsdk-pre.d3games.com/"
    }, D = {
        Prod: "https://wxsdk-api.cn-beijing.log.aliyuncs.com/",
        Pre: "https://wxsdk-api.cn-beijing.log.aliyuncs.com/"
    }, M = {
        Prod: "https://wxsdk-data.d3games.com/",
        Pre: "https://wxsdk-data-pre.d3games.com/"
    }, G = {
        Prod: "https://wxsdk-order.d3games.com/",
        Pre: "https://wxsdk-order-pre.d3games.com/"
    }, V = "logstores/login/track", O = "logstores/adlog/track", j = "logstores/times/track", R = "logstores/share/track", H = "logstores/firstsecren/track", F = "logstores/stay/track", z = "logstores/behaviors/track", K = "logstores/events/track", W = "logstores/jumps/track", Y = "logstores/level/track", X = "logstores/role/track", q = "api/login", $ = "api/login", Q = "api/reftoken", Z = "api/share/lst", J = "api/game/config", ee = "api/subscribe/add", te = "api/member/savedata", ie = "api/member/getdata", se = "api/rank/add", ae = "api/rank/list", ne = "game/totalrank/add", re = "game/totalrank/list", oe = "api/adplan/list", he = "api/order/report", le = "api/order/query", de = {
        SDKAdVtKey: "__pcsdk_advt_key__",
        SDKAdMvKey: "__pcsdk_admv_key__",
        SDKAdMvNewKey: "__pcsdk_admv_new_key__",
        SDKTokenKey: "__pcsdk_token_key__",
        SDKLaunchKey: "__pcsdk_launch_key__",
        SDKEventLaunchKey: "__pcsdk_event_launch",
        SDKOnlienKey: "__pcsdk_online_env_key__",
        SDKStartUpKey: "__pcsdk_startup_key__",
        SDKDayAllShareNumKey: "__pcsdk_day_allsharenum_key__",
        SDKDayAllVideoNumKey: "__pcsdk_day_allvideonum_key__",
        SDKIntegralShareNumKey: "__pcsdk_integral_sharenum_key__",
        SDKVideoOverShareNumKey: "__pcsdk_video_over_sharenum_$0_key__",
        SDKShareRatioKey: "__pcsdk_shareratio_key__",
        SDKUserShieldKey: "__pcsdk_usershield_key__"
    }, ce = {
        UnKnow: {
            code: 1001,
            msg: "未知错误"
        },
        InvalidLogin: {
            code: 1e4,
            msg: "登陆失效"
        }
    }, pe = {
        VideoQuit: {
            code: 1e3,
            msg: "要看完视频哦!"
        },
        VideoFail: {
            code: 1001,
            msg: "视频广告加载失败!"
        },
        VideoInvalid: {
            code: 999,
            msg: "视频UID不存在!"
        },
        VideoNotOpen: {
            code: 1002,
            msg: "视频组件未开放!"
        },
        VideoPlaying: {
            code: 1003,
            msg: "正在观看视频中..."
        },
        ShareFail: {
            code: 1004,
            msg: "分享失败，请尝试发送至不同群!"
        },
        ShareSame: {
            code: 1005,
            msg: "别总骚扰这个群，换个群分享吧!"
        },
        ShareNotGroup: {
            code: 1006,
            msg: "请分享到群哦!"
        },
        NotNet: {
            code: 1007,
            msg: "网络错误~"
        },
        ShareRuleFail: {
            code: 1008,
            msg: "分享失败，请尝试发送至不同群!"
        },
        ShareOverLimit: {
            code: 1009,
            msg: "今日已达分享上限次数，请明日再来"
        }
    }, ge = {
        BannerInvalid: {
            code: 1e3,
            msg: "广告 uid不能为空!"
        },
        BannerFail: {
            code: 1001,
            msg: "加载广告失败!"
        },
        BannerNotOpen: {
            code: 1002,
            msg: "加载广告失败!"
        }
    };
    class ue {
        constructor() {
            this.data = wx.getLaunchOptionsSync();
        }
        get LaunchData() {
            return this.data;
        }
        get query() {
            return this.data.query;
        }
        get scene() {
            return this.data.scene;
        }
        get shareTicket() {
            return this.data.shareTicket;
        }
        get referrerInfo() {
            return this.data.referrerInfo;
        }
        static get I() {
            return this.instance || (this.instance = new ue());
        }
    }
    class me {
        constructor() {
            this._data = new U();
        }
        setValue(e, t) {
            k.isUndefined(t) || (this._data = Object.assign(Object.assign({}, this._data), {
                [e]: t
            }));
        }
        get Data() {
            return this._data;
        }
        setLoginData(e) {
            e && 0 !== Object.keys(e).length && (e.hasOwnProperty("openId") && this.setOpenId(e.openId),
                e.hasOwnProperty("channel") && this.setChannelId(e.channel), e.hasOwnProperty("userId") && this.setUserId(e.userId),
                e.hasOwnProperty("regTime") && this.setRegTime(e.regTime), e.hasOwnProperty("token") && this.setToken(e.token),
                e.hasOwnProperty("refToken") && this.setRefToken(e.refToken), e.hasOwnProperty("expire") && this.setExpice(e.expire),
                e.hasOwnProperty("isnew") && this.setIsnew(e.isnew));
        }
        get expice() {
            return this._data.expice;
        }
        setExpice(e) {
            return this.setValue("expire", e), this;
        }
        get isnew() {
            return this._data.isnew;
        }
        setIsnew(e) {
            return this.setValue("isnew", e), this;
        }
        get Scene() {
            return this._data.scene || 0;
        }
        setScene(e) {
            return this.setValue("scene", e), this;
        }
        get ReferrerInfo() {
            return this._data.referrerInfo || {};
        }
        setReferrerInfo(e) {
            return this.setValue("referrerInfo", e), this;
        }
        get Token() {
            return this._data.token || "";
        }
        setToken(e) {
            return this.setValue("token", e), this;
        }
        get refToken() {
            return this._data.refToken;
        }
        setRefToken(e) {
            return this.setValue("refToken", e), this;
        }
        get OpenId() {
            return this._data.openId;
        }
        setOpenId(e) {
            return this.setValue("openId", e), this;
        }
        get UserId() {
            return this._data.userId ? this._data.userId : this.OpenId;
        }
        setUserId(e) {
            return this.setValue("userId", e), this;
        }
        get RegTime() {
            return this._data.regTime;
        }
        setRegTime(e) {
            return this.setValue("regTime", e), this;
        }
        get LaunchTime() {
            return this._data.launchTime;
        }
        setLaunchTime(e) {
            return this.setValue("launchTime", e), this;
        }
        get ShareId() {
            return this._data.shareId;
        }
        setShareId(e) {
            return this.setValue("shareId", e), this;
        }
        get ShareKey() {
            return this._data.shareKey;
        }
        setShareKey(e) {
            return this.setValue("shareKey", e), this;
        }
        get Platform() {
            return this._data.platform;
        }
        setPlatform(e) {
            return this.setValue("platform", e), this;
        }
        setNetworkType(e) {
            return this.setValue("networkType", e), this;
        }
        get Gender() {
            return this._data.gender || y.Unknown;
        }
        setGender(e) {
            return this.setValue("gender", e), this;
        }
        get ChannelId() {
            return this._data.channelId;
        }
        setChannelId(e) {
            return this.setValue("channelId", e), this;
        }
        get QueryChannelId() {
            return this._data.queryChannelId || 0;
        }
        setQueryChannelId(e) {
            return this.setValue("queryChannelId", e), this;
        }
        get InviteType() {
            return this._data.inviteType || 0;
        }
        setInviteType(e) {
            return this.setValue("inviteType", e), this;
        }
        get QueryUserInviteUid() {
            return this._data.queryUserInviteUid || 0;
        }
        setQueryUserInviteUid(e) {
            return this.setValue("queryUserInviteUid", e), this;
        }
        get QueryExtData() {
            return this._data.queryExtData || {};
        }
        setQueryExtData(e) {
            return this.setValue("queryExtData", e), this;
        }
        get UserInviteUid() {
            return this._data.inviteUid || 0;
        }
        setUserInviteUid(e) {
            return this.setValue("inviteUid", e), this;
        }
        setUserState(e) {
            return this.setValue("userState", e), this;
        }
        get Shield() {
            return this._data.shield || A.I.get(de.SDKUserShieldKey) || 0;
        }
        setShield(e) {
            return this.setValue("shield", e), A.I.set(de.SDKUserShieldKey, e), this;
        }
        get ShareTicket() {
            return this._data.shareTicket;
        }
        setShareTicket(e) {
            return this.setValue("shareTicket", e), this;
        }
        get SystemId() {
            return this._data.systemId;
        }
        setSystemId() {
            let e = "android" === this.Platform ? 1 : 0;
            return this.setValue("systemId", e), this;
        }
        get Authorize() {
            return this._data.authorize;
        }
        setAuthorize(e) {
            return this.setValue("authorize", e), this;
        }
        get Version() {
            return this._data.version;
        }
        setVersion(e) {
            return this.setValue("version", e), this;
        }
        get CdnUrl() {
            return this._data.cdnUrl;
        }
        setCdnUrl(e) {
            return this.setValue("cdnUrl", e), this;
        }
        get EnvEnum() {
            return this._data.envEnum;
        }
        setEnvEnum(e) {
            return this.setValue("envEnum", e), this;
        }
        get LoginApi() {
            let e = N.Prod;
            return 1 === this.EnvEnum && (e = N.Pre), e;
        }
        get GameApi() {
            let e = M.Prod;
            return 1 === this.EnvEnum && (e = M.Pre), e;
        }
        get DotApi() {
            let e = D.Prod;
            return 1 === this.EnvEnum && (e = D.Pre), e;
        }
        get OrderApi() {
            let e = G.Prod;
            return 1 === this.EnvEnum && (e = G.Pre), e;
        }
        get GameId() {
            return T.game_id;
        }
        get LaunchKey() {
            return this._data.launchKey || A.I.get(de.SDKLaunchKey) || "";
        }
        fixLaunchKey(e) {
            return e && (A.I.set(de.SDKLaunchKey, e), this.setValue("launchKey", e)), this;
        }
        setLaunchSource() {
            let e = 0, { query: t } = ue.I.LaunchData;
            if (t) if (t.scene) {
                decodeURIComponent(t.scene).split("&")[1] && (e = 1);
            } else (t.user_invite_id || t.user_invite_uid || t.invite_unionid) && (e = 1); else e = 0;
            return this.setValue("launchSource", e), this;
        }
        get IsCross() {
            return this._data.isCross;
        }
        setIsCross(e) {
            return this.setValue("isCross", e), this;
        }
        get IsDrawer() {
            return this._data.isDrawer;
        }
        setIsDrawer(e) {
            return this.setValue("isDrawer", e), this;
        }
        get IsGuessLike() {
            return this._data.isGuessLike;
        }
        setIsGuessLike(e) {
            return this.setValue("isGuessLike", e), this;
        }
        static get I() {
            return this.instance || (this.instance = new me());
        }
    }
    class ye {
        static randomArray(e) {
            return e[Math.floor(Math.random() * e.length)];
        }
        static rand(e, t) {
            return e = e || 0, t = t || 1e4, Math.floor(1e4 * Math.random()) % (t - e) + e;
        }
        static rang(e, t) {
            return Math.round(Math.random() * (t - e) + e);
        }
        static randFloat(e, t) {
            return parseFloat((Math.random() * (t - e) + e).toFixed(2));
        }
    }
    class Ie { }
    Ie.SimulateShareTime = 3e3;
    class fe {
        constructor() {
            this._events = {};
        }
        static get I() {
            return this.instance || (this.instance = new fe());
        }
        getEvents() {
            return this._events || (this._events = {});
        }
        getListeners(e) {
            let t = this.getEvents();
            return t[e] || (t[e] = []);
        }
        getListenersAsObject(e) {
            let t, i = this.getListeners(e);
            return i instanceof Array && ((t = {})[e] = i), t || i;
        }
        isValidListener(e) {
            return "function" == typeof e || e instanceof RegExp || !(!e || "object" != typeof e) && this.isValidListener(e.listener);
        }
        getOnceReturnValue() {
            return !this.hasOwnProperty("_onceReturnValue") || this._onceReturnValue;
        }
        set onceReturnValue(e) {
            this._onceReturnValue = e;
        }
        indexOf(e, t, i) {
            let s = e.length;
            for (; s--;) if (e[s].listener === t && (!i || e[s].context === i)) return s;
            return -1;
        }
        add(e, t, i) {
            if (!e || !e.constructor) throw new TypeError("evt must be a string");
            if (!this.isValidListener(t)) throw new TypeError("listener must be a function");
            let s, a = this.getListenersAsObject(e), n = "object" == typeof t;
            for (s in a) a.hasOwnProperty(s) && -1 === this.indexOf(a[s], t, i) && a[s].push(n ? t : {
                listener: t,
                context: i,
                once: !1
            });
            return this;
        }
        once(e, t, i) {
            return this.add(e, {
                listener: t,
                context: i,
                once: !0
            });
        }
        remove(e, t, i) {
            let s, a, n = this.getListenersAsObject(e);
            for (a in n) n.hasOwnProperty(a) && -1 !== (s = this.indexOf(n[a], t, i)) && n[a].splice(s, 1);
            return this;
        }
        removeAll(e) {
            let t = typeof e, i = this.getEvents();
            return "string" === t ? delete i[e] : delete this._events, this;
        }
        trigger(e, ...t) {
            let i, s, a, n, r, o = this.getListenersAsObject(e);
            for (n in o) if (o.hasOwnProperty(n)) for (i = o[n].slice(0), a = 0; a < i.length; a++) !0 === (s = i[a]).once && this.remove(e, s.listener, s.context),
                (r = s.listener.apply(s.context || this, t || [])) === this.getOnceReturnValue() && this.remove(e, s.listener, s.context);
            return this;
        }
        emit(e, ...t) {
            return this.trigger(e, ...t);
        }
        defineEvent(e) {
            return this.getListeners(e), this;
        }
        defineEvents(e) {
            for (let t = 0, i = e.length; t < i; t++) this.defineEvent(e[t]);
            return this;
        }
    }
    var we, xe, be, _e;
    !function (e) {
        e.APP_SHOW = "app.show", e.APP_HIDE = "app.hide", e.TACTIC_UPDATE = "tactic.update",
            e.BANNER_HIDE = "banner.hide", e.BANNER_SHOW = "banner.show", e.BANNER_ERROR = "banner.error",
            e.BANNER_DESTORY = "banner.destory", e.BANNER_SUCCESS = "banner.success", e.ONLINE_SUCCESS = "online.success";
    }(we || (we = {}));
    class Se {
        constructor() {
            this.hideTime = 0, this.delayTime = 300;
        }
        get SuccessTime() {
            return Ie.SimulateShareTime;
        }
        bind(e) {
            P && console.warn("SDK SimulateShare bind");
            let { success: t, fail: i, cancel: s } = e, a = !0;
            e.success = (e => {
                a && t(e), a = !1;
            }), e.fail = (e => {
                a && i(e), a = !1;
            }), e.cancel = (e => {
                a && s(e), a = !1;
            }), this.hideTime = 0, this.callbacks = e, fe.I.add(we.APP_SHOW, this.onShow, this),
                fe.I.add(we.APP_HIDE, this.onHide, this);
        }
        clear() {
            this.hideTime = 0, fe.I.remove(we.APP_SHOW, this.onShow, this), fe.I.remove(we.APP_HIDE, this.onHide, this);
        }
        onHide() {
            P && console.warn("SDK SimulateShare hide"), this.hideTime = new Date().getTime();
        }
        onShow() {
            let e = this.SuccessTime;
            P && console.warn("SDK SimulateShare show", e);
            let t, { success: i, fail: s } = this.callbacks, a = Date.now() - this.hideTime;
            t = a < e ? window.__ytGameTimers.setTimeout(() => {
                P && console.warn("SDK SimulateShare 模拟分享失败！"), s && s({
                    errMsg: "模拟分享失败！"
                }), window.__ytGameTimers.clearTimeout(t), t = null;
            }, this.delayTime) : window.__ytGameTimers.setTimeout(() => {
                P && console.warn("SDK SimulateShare 模拟分享成功！"), i && i({
                    errMsg: "模拟分享成功！",
                    shareTickets: ["simulate_ticket"]
                }), window.__ytGameTimers.clearTimeout(t), t = null;
            }, this.delayTime), this.clear();
        }
        static get I() {
            return this.instance || (this.instance = new Se());
        }
    }
    class ve {
        constructor() {
            this._state = new Int32Array(4), this._buffer = new ArrayBuffer(68), this._buffer8 = new Uint8Array(this._buffer, 0, 68),
                this._buffer32 = new Uint32Array(this._buffer, 0, 17), this.start();
        }
        static hashStr(e, t = !1) {
            return this.onePassHasher.start().appendStr(e).end(t);
        }
        static hashAsciiStr(e, t = !1) {
            return this.onePassHasher.start().appendAsciiStr(e).end(t);
        }
        static _hex(e) {
            const t = ve.hexChars, i = ve.hexOut;
            let s, a, n, r;
            for (r = 0; r < 4; r += 1) for (a = 8 * r, s = e[r], n = 0; n < 8; n += 2) i[a + 1 + n] = t.charAt(15 & s),
                s >>>= 4, i[a + 0 + n] = t.charAt(15 & s), s >>>= 4;
            return i.join("");
        }
        static _md5cycle(e, t) {
            let i = e[0], s = e[1], a = e[2], n = e[3];
            s = ((s += ((a = ((a += ((n = ((n += ((i = ((i += (s & a | ~s & n) + t[0] - 680876936 | 0) << 7 | i >>> 25) + s | 0) & s | ~i & a) + t[1] - 389564586 | 0) << 12 | n >>> 20) + i | 0) & i | ~n & s) + t[2] + 606105819 | 0) << 17 | a >>> 15) + n | 0) & n | ~a & i) + t[3] - 1044525330 | 0) << 22 | s >>> 10) + a | 0,
                s = ((s += ((a = ((a += ((n = ((n += ((i = ((i += (s & a | ~s & n) + t[4] - 176418897 | 0) << 7 | i >>> 25) + s | 0) & s | ~i & a) + t[5] + 1200080426 | 0) << 12 | n >>> 20) + i | 0) & i | ~n & s) + t[6] - 1473231341 | 0) << 17 | a >>> 15) + n | 0) & n | ~a & i) + t[7] - 45705983 | 0) << 22 | s >>> 10) + a | 0,
                s = ((s += ((a = ((a += ((n = ((n += ((i = ((i += (s & a | ~s & n) + t[8] + 1770035416 | 0) << 7 | i >>> 25) + s | 0) & s | ~i & a) + t[9] - 1958414417 | 0) << 12 | n >>> 20) + i | 0) & i | ~n & s) + t[10] - 42063 | 0) << 17 | a >>> 15) + n | 0) & n | ~a & i) + t[11] - 1990404162 | 0) << 22 | s >>> 10) + a | 0,
                s = ((s += ((a = ((a += ((n = ((n += ((i = ((i += (s & a | ~s & n) + t[12] + 1804603682 | 0) << 7 | i >>> 25) + s | 0) & s | ~i & a) + t[13] - 40341101 | 0) << 12 | n >>> 20) + i | 0) & i | ~n & s) + t[14] - 1502002290 | 0) << 17 | a >>> 15) + n | 0) & n | ~a & i) + t[15] + 1236535329 | 0) << 22 | s >>> 10) + a | 0,
                s = ((s += ((a = ((a += ((n = ((n += ((i = ((i += (s & n | a & ~n) + t[1] - 165796510 | 0) << 5 | i >>> 27) + s | 0) & a | s & ~a) + t[6] - 1069501632 | 0) << 9 | n >>> 23) + i | 0) & s | i & ~s) + t[11] + 643717713 | 0) << 14 | a >>> 18) + n | 0) & i | n & ~i) + t[0] - 373897302 | 0) << 20 | s >>> 12) + a | 0,
                s = ((s += ((a = ((a += ((n = ((n += ((i = ((i += (s & n | a & ~n) + t[5] - 701558691 | 0) << 5 | i >>> 27) + s | 0) & a | s & ~a) + t[10] + 38016083 | 0) << 9 | n >>> 23) + i | 0) & s | i & ~s) + t[15] - 660478335 | 0) << 14 | a >>> 18) + n | 0) & i | n & ~i) + t[4] - 405537848 | 0) << 20 | s >>> 12) + a | 0,
                s = ((s += ((a = ((a += ((n = ((n += ((i = ((i += (s & n | a & ~n) + t[9] + 568446438 | 0) << 5 | i >>> 27) + s | 0) & a | s & ~a) + t[14] - 1019803690 | 0) << 9 | n >>> 23) + i | 0) & s | i & ~s) + t[3] - 187363961 | 0) << 14 | a >>> 18) + n | 0) & i | n & ~i) + t[8] + 1163531501 | 0) << 20 | s >>> 12) + a | 0,
                s = ((s += ((a = ((a += ((n = ((n += ((i = ((i += (s & n | a & ~n) + t[13] - 1444681467 | 0) << 5 | i >>> 27) + s | 0) & a | s & ~a) + t[2] - 51403784 | 0) << 9 | n >>> 23) + i | 0) & s | i & ~s) + t[7] + 1735328473 | 0) << 14 | a >>> 18) + n | 0) & i | n & ~i) + t[12] - 1926607734 | 0) << 20 | s >>> 12) + a | 0,
                s = ((s += ((a = ((a += ((n = ((n += ((i = ((i += (s ^ a ^ n) + t[5] - 378558 | 0) << 4 | i >>> 28) + s | 0) ^ s ^ a) + t[8] - 2022574463 | 0) << 11 | n >>> 21) + i | 0) ^ i ^ s) + t[11] + 1839030562 | 0) << 16 | a >>> 16) + n | 0) ^ n ^ i) + t[14] - 35309556 | 0) << 23 | s >>> 9) + a | 0,
                s = ((s += ((a = ((a += ((n = ((n += ((i = ((i += (s ^ a ^ n) + t[1] - 1530992060 | 0) << 4 | i >>> 28) + s | 0) ^ s ^ a) + t[4] + 1272893353 | 0) << 11 | n >>> 21) + i | 0) ^ i ^ s) + t[7] - 155497632 | 0) << 16 | a >>> 16) + n | 0) ^ n ^ i) + t[10] - 1094730640 | 0) << 23 | s >>> 9) + a | 0,
                s = ((s += ((a = ((a += ((n = ((n += ((i = ((i += (s ^ a ^ n) + t[13] + 681279174 | 0) << 4 | i >>> 28) + s | 0) ^ s ^ a) + t[0] - 358537222 | 0) << 11 | n >>> 21) + i | 0) ^ i ^ s) + t[3] - 722521979 | 0) << 16 | a >>> 16) + n | 0) ^ n ^ i) + t[6] + 76029189 | 0) << 23 | s >>> 9) + a | 0,
                s = ((s += ((a = ((a += ((n = ((n += ((i = ((i += (s ^ a ^ n) + t[9] - 640364487 | 0) << 4 | i >>> 28) + s | 0) ^ s ^ a) + t[12] - 421815835 | 0) << 11 | n >>> 21) + i | 0) ^ i ^ s) + t[15] + 530742520 | 0) << 16 | a >>> 16) + n | 0) ^ n ^ i) + t[2] - 995338651 | 0) << 23 | s >>> 9) + a | 0,
                s = ((s += ((n = ((n += (s ^ ((i = ((i += (a ^ (s | ~n)) + t[0] - 198630844 | 0) << 6 | i >>> 26) + s | 0) | ~a)) + t[7] + 1126891415 | 0) << 10 | n >>> 22) + i | 0) ^ ((a = ((a += (i ^ (n | ~s)) + t[14] - 1416354905 | 0) << 15 | a >>> 17) + n | 0) | ~i)) + t[5] - 57434055 | 0) << 21 | s >>> 11) + a | 0,
                s = ((s += ((n = ((n += (s ^ ((i = ((i += (a ^ (s | ~n)) + t[12] + 1700485571 | 0) << 6 | i >>> 26) + s | 0) | ~a)) + t[3] - 1894986606 | 0) << 10 | n >>> 22) + i | 0) ^ ((a = ((a += (i ^ (n | ~s)) + t[10] - 1051523 | 0) << 15 | a >>> 17) + n | 0) | ~i)) + t[1] - 2054922799 | 0) << 21 | s >>> 11) + a | 0,
                s = ((s += ((n = ((n += (s ^ ((i = ((i += (a ^ (s | ~n)) + t[8] + 1873313359 | 0) << 6 | i >>> 26) + s | 0) | ~a)) + t[15] - 30611744 | 0) << 10 | n >>> 22) + i | 0) ^ ((a = ((a += (i ^ (n | ~s)) + t[6] - 1560198380 | 0) << 15 | a >>> 17) + n | 0) | ~i)) + t[13] + 1309151649 | 0) << 21 | s >>> 11) + a | 0,
                s = ((s += ((n = ((n += (s ^ ((i = ((i += (a ^ (s | ~n)) + t[4] - 145523070 | 0) << 6 | i >>> 26) + s | 0) | ~a)) + t[11] - 1120210379 | 0) << 10 | n >>> 22) + i | 0) ^ ((a = ((a += (i ^ (n | ~s)) + t[2] + 718787259 | 0) << 15 | a >>> 17) + n | 0) | ~i)) + t[9] - 343485551 | 0) << 21 | s >>> 11) + a | 0,
                e[0] = i + e[0] | 0, e[1] = s + e[1] | 0, e[2] = a + e[2] | 0, e[3] = n + e[3] | 0;
        }
        start() {
            return this._dataLength = 0, this._bufferLength = 0, this._state.set(ve.stateIdentity),
                this;
        }
        appendStr(e) {
            const t = this._buffer8, i = this._buffer32;
            let s, a, n = this._bufferLength;
            for (a = 0; a < e.length; a += 1) {
                if ((s = e.charCodeAt(a)) < 128) t[n++] = s; else if (s < 2048) t[n++] = 192 + (s >>> 6),
                    t[n++] = 63 & s | 128; else if (s < 55296 || s > 56319) t[n++] = 224 + (s >>> 12),
                        t[n++] = s >>> 6 & 63 | 128, t[n++] = 63 & s | 128; else {
                    if ((s = 1024 * (s - 55296) + (e.charCodeAt(++a) - 56320) + 65536) > 1114111) throw new Error("Unicode standard supports code points up to U+10FFFF");
                    t[n++] = 240 + (s >>> 18), t[n++] = s >>> 12 & 63 | 128, t[n++] = s >>> 6 & 63 | 128,
                        t[n++] = 63 & s | 128;
                }
                n >= 64 && (this._dataLength += 64, ve._md5cycle(this._state, i), n -= 64, i[0] = i[16]);
            }
            return this._bufferLength = n, this;
        }
        appendAsciiStr(e) {
            const t = this._buffer8, i = this._buffer32;
            let s, a = this._bufferLength, n = 0;
            for (; ;) {
                for (s = Math.min(e.length - n, 64 - a); s--;) t[a++] = e.charCodeAt(n++);
                if (a < 64) break;
                this._dataLength += 64, ve._md5cycle(this._state, i), a = 0;
            }
            return this._bufferLength = a, this;
        }
        appendByteArray(e) {
            const t = this._buffer8, i = this._buffer32;
            let s, a = this._bufferLength, n = 0;
            for (; ;) {
                for (s = Math.min(e.length - n, 64 - a); s--;) t[a++] = e[n++];
                if (a < 64) break;
                this._dataLength += 64, ve._md5cycle(this._state, i), a = 0;
            }
            return this._bufferLength = a, this;
        }
        getState() {
            const e = this._state;
            return {
                buffer: String.fromCharCode.apply(null, this._buffer8),
                buflen: this._bufferLength,
                length: this._dataLength,
                state: [e[0], e[1], e[2], e[3]]
            };
        }
        setState(e) {
            const t = e.buffer, i = e.state, s = this._state;
            let a;
            for (this._dataLength = e.length, this._bufferLength = e.buflen, s[0] = i[0], s[1] = i[1],
                s[2] = i[2], s[3] = i[3], a = 0; a < t.length; a += 1) this._buffer8[a] = t.charCodeAt(a);
        }
        end(e = !1) {
            const t = this._bufferLength, i = this._buffer8, s = this._buffer32, a = 1 + (t >> 2);
            let n;
            if (this._dataLength += t, i[t] = 128, i[t + 1] = i[t + 2] = i[t + 3] = 0, s.set(ve.buffer32Identity.subarray(a), a),
                t > 55 && (ve._md5cycle(this._state, s), s.set(ve.buffer32Identity)), (n = 8 * this._dataLength) <= 4294967295) s[14] = n; else {
                const e = n.toString(16).match(/(.*?)(.{0,8})$/);
                if (null === e) return;
                const t = parseInt(e[2], 16), i = parseInt(e[1], 16) || 0;
                s[14] = t, s[15] = i;
            }
            return ve._md5cycle(this._state, s), e ? this._state : ve._hex(this._state);
        }
    }
    ve.stateIdentity = new Int32Array([1732584193, -271733879, -1732584194, 271733878]),
        ve.buffer32Identity = new Int32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
        ve.hexChars = "0123456789abcdef", ve.hexOut = [], ve.onePassHasher = new ve(), "5d41402abc4b2a76b9719d911017c592" !== ve.hashStr("hello") && console.error("Md5 self test failed.");
    class Le {
        static get I() {
            return this.instance || (this.instance = new Le());
        }
        createSign(e) {
            let t = this.createQuery(e) + "" + T.appkey;
            return ve.hashStr(t);
        }
        ksort(e) {
            let t, i, s, a = {}, n = [], r = {};
            for (s in t = function (e, t) {
                let i = parseFloat(e), s = parseFloat(t), a = i + "" === e, n = s + "" === t;
                return a && n ? i > s ? 1 : i < s ? -1 : 0 : a && !n ? 1 : !a && n ? -1 : e > t ? 1 : e < t ? -1 : 0;
            }, e) e.hasOwnProperty(s) && n.push(s);
            for (n.sort(t), i = 0; i < n.length; i++) a[s = n[i]] = e[s];
            for (i in a) a.hasOwnProperty(i) && (r[i] = a[i]);
            return r;
        }
        createQuery(e) {
            e = e || {};
            let t = Object.keys(this.ksort(e)), i = "", s = "";
            for (let a = 0, n = t.length; a < n; a++) "" !== e[t[a]] && "0" !== e[t[a]] && 0 !== e[t[a]] && "ver" !== t[a] && (i = t[a],
                a && (s += ""), k.isArray(e[i]) ? s += `${i}=${JSON.stringify(e[i])}` : s += `${i}=${e[i]}`);
            return s;
        }
    }
    class Ce {
        static httpRequest(e, t, i, s = "json") {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise((s, a) => {
                    if (i = Object.assign(Object.assign({}, i), {
                        ver: T.version,
                        gameid: T.game_id,
                        sign_type: "md5",
                        time_stamp: Math.floor(Date.now() / 1e3) + ""
                    }), (i = Object.assign(Object.assign({}, i), {
                        sign: Le.I.createSign(i)
                    })) && "object" == typeof i && (i = JSON.stringify(i)), i = i || "", "GET" == t && "" != i) {
                        i = JSON.parse(i);
                        let t = "";
                        for (let e in i) t = t + `${e}` + "=" + `${i[e]}&`;
                        e += "?" + t, i = "";
                    }
                    let n = new XMLHttpRequest();
                    n.onreadystatechange = function () {
                        if (4 == n.readyState) if (n.status >= 200 && n.status < 400) {
                            let i = n.responseText;
                            try {
                                if (i = JSON.parse(i), e.indexOf(".json") > -1) s({
                                    code: 0,
                                    data: i,
                                    msg: i.msg
                                }); else {
                                    var t = i.data;
                                    i.ip && (t = Object.assign(Object.assign({}, t), {
                                        ip: i.ip
                                    })), s({
                                        code: +i.code,
                                        data: t,
                                        msg: i.msg
                                    });
                                }
                                return;
                            } catch (e) {
                                return void s({
                                    msg: "JSON parse error:" + e.message,
                                    code: -1
                                });
                            }
                        } else console.error(n.status, "网络请求失败！"), s({
                            code: -1
                        });
                    }, n.ontimeout = function (e) {
                        s({
                            msg: "请求超时！",
                            code: -1
                        });
                    }, n.onerror = function (e) {
                        s({
                            msg: "请求失败！",
                            code: -1
                        });
                    }, n.onabort = function (e) {
                        s({
                            msg: "请求失败！",
                            code: -1
                        });
                    }, n.open(t, e, !0), "POST" == t && n.setRequestHeader("Content-Type", "application/json;charset=utf-8"),
                        n.timeout = 3e3, n.send(i);
                });
            });
        }
        static httpGet(e, t, i = "json") {
            return __awaiter(this, void 0, void 0, function* () {
                return this.httpRequest(e, "GET", t, i);
            });
        }
        static httpPost(e, t, i = "json") {
            return this.httpRequest(e, "POST", t, i);
        }
    }
    class Ue { }
    Ue.Version = ((...e) => Ce.httpPost("https://wxsdk-ver.d3games.com/version", ...e)),
        Ue.ShareList = ((...e) => Ce.httpPost(`${me.I.GameApi}${Z}`, ...e)), Ue.getConfig = ((...e) => Ce.httpPost(`${me.I.GameApi}${J}`, ...e)),
        Ue.subscribe = ((...e) => Ce.httpPost(`${me.I.GameApi}${ee}`, ...e)), Ue.saveData = ((...e) => Ce.httpPost(`${me.I.GameApi}${te}`, ...e)),
        Ue.getData = ((...e) => Ce.httpPost(`${me.I.GameApi}${ie}`, ...e)), Ue.rankAdd = ((...e) => Ce.httpPost(`${me.I.GameApi}${se}`, ...e)),
        Ue.totalrankAdd = ((...e) => Ce.httpPost(`${me.I.GameApi}${ne}`, ...e)), Ue.rankList = ((...e) => Ce.httpPost(`${me.I.GameApi}${ae}`, ...e)),
        Ue.totalrankList = ((...e) => Ce.httpPost(`${me.I.GameApi}${re}`, ...e)), Ue.adList = ((...e) => Ce.httpPost(`${me.I.GameApi}${oe}`, ...e)),
        Ue.Login = ((...e) => Ce.httpPost(`${me.I.LoginApi}${q}`, ...e)), Ue.reftoken = ((...e) => Ce.httpPost(`${me.I.LoginApi}${Q}`, ...e)),
        Ue.weakLogin = ((...e) => Ce.httpPost(`${me.I.LoginApi}${$}`, ...e)), Ue.logOut = ((...e) => Ce.httpGet(`${me.I.DotApi}${j}`, ...e)),
        Ue.loadingFinish = ((...e) => Ce.httpGet(`${me.I.DotApi}${H}`, ...e)), Ue.active = ((...e) => Ce.httpGet(`${me.I.DotApi}${V}`, ...e)),
        Ue.share = ((...e) => Ce.httpGet(`${me.I.DotApi}${R}`, ...e)), Ue.adStat = ((...e) => Ce.httpGet(`${me.I.DotApi}${O}`, ...e)),
        Ue.stay = ((...e) => Ce.httpGet(`${me.I.DotApi}${F}`, ...e)), Ue.behaviors = ((...e) => Ce.httpGet(`${me.I.DotApi}${z}`, ...e)),
        Ue.dot = ((...e) => Ce.httpGet(`${me.I.DotApi}${K}`, ...e)), Ue.jumps = ((...e) => Ce.httpGet(`${me.I.DotApi}${W}`, ...e)),
        Ue.level = ((...e) => Ce.httpGet(`${me.I.DotApi}${Y}`, ...e)), Ue.role = ((...e) => Ce.httpGet(`${me.I.DotApi}${X}`, ...e)),
        Ue.pay = ((...e) => Ce.httpPost(`${me.I.OrderApi}${he}`, ...e)), Ue.orderQuery = ((...e) => Ce.httpPost(`${me.I.OrderApi}${le}`, ...e));
    class ke {
        constructor() {
            this.data = wx.getSystemInfoSync();
        }
        get SystemData() {
            return this.data;
        }
        get version() {
            return this.data.version;
        }
        get system() {
            return this.data.system;
        }
        get platform() {
            return this.data.platform;
        }
        get language() {
            return this.data.language;
        }
        get winWidth() {
            return this.data.windowWidth;
        }
        get winHeight() {
            return this.data.windowHeight;
        }
        get screenWidth() {
            return this.data.screenWidth;
        }
        get screenHeight() {
            return this.data.screenHeight;
        }
        get SDKVersion() {
            return this.data.SDKVersion;
        }
        get brand() {
            return this.data.brand;
        }
        get model() {
            return this.data.model;
        }
        static get I() {
            return this.instance || (this.instance = new ke());
        }
    }
    class Ee {
        static get now() {
            return Math.floor(this.nowTime / 1e3);
        }
        static get nowTime() {
            return new Date().getTime();
        }
        static get today() {
            let e = new Date(this.nowTime), t = e.getFullYear(), i = e.getMonth() + 1, s = e.getDate();
            return `${t}-${this.add(i)}-${this.add(s)}`;
        }
        static add(e) {
            return e < 10 ? "0" + e : "" + e;
        }
    }
    class Be {
        constructor() {
            this.queue = [], this.isLogin = !1, this.exposureArr = {}, this.logResArr = [],
                this.logLevelArr = [], this.regFinishState = 0, this.isHandledShare = !1, this.timeoutShareId = 0,
                this.lastReqBannerTime = {}, this.lastReqBannerData = {};
        }
        setRegFinishState(e) {
            this.regFinishState = e;
        }
        get SystemId() {
            return me.I.SystemId;
        }
        get LaunchTime() {
            return me.I.LaunchTime;
        }
        get LaunchKey() {
            return me.I.LaunchKey;
        }
        get Scene() {
            return me.I.Scene;
        }
        get RegTime() {
            return me.I.RegTime;
        }
        get UserId() {
            return me.I.UserId;
        }
        get OpenId() {
            return me.I.OpenId;
        }
        get UserInviteUid() {
            return me.I.UserInviteUid;
        }
        get QueryUserInviteUid() {
            return me.I.QueryUserInviteUid;
        }
        get QueryExtData() {
            return me.I.QueryExtData;
        }
        get Shield() {
            return me.I.Shield;
        }
        get shareKey() {
            return me.I.ShareKey;
        }
        get shareId() {
            return me.I.ShareId;
        }
        fixLaunchKey(e) {
            me.I.fixLaunchKey(e);
        }
        setLogind(e) {
            if (me.I.setLoginData(e), this.isLogin = !0, this.queue.length > 0) for (let e = 0; e < this.queue.length; e++) {
                (0, this.queue[e])();
            }
            this.queue = [];
        }
        dot(e, t = {}) {
            return __awaiter(this, void 0, void 0, function* () {
                let i = "", s = "";
                if ("{}" != JSON.stringify(t) && "object" == typeof t) for (let e in t) "" === i && (i = e,
                    s = t[e]);
                this.checkLogin(() => Ue.dot(Object.assign(Object.assign({}, this.buildParams()), {
                    eventkey: e,
                    value: JSON.stringify(t),
                    itemkey: i,
                    itemvalue: s
                })));
            });
        }
        levelStart(e, t, i) {
            return __awaiter(this, void 0, void 0, function* () {
                this.checkLogin(() => Ue.level(Object.assign(Object.assign({}, this.buildParams()), {
                    stageid: e,
                    stagename: t,
                    pattern: i,
                    typ: 1
                })));
            });
        }
        levelRunning(e, t, i, s, a, n, r, o) {
            return __awaiter(this, void 0, void 0, function* () {
                this.checkLogin(() => Ue.level(Object.assign(Object.assign({}, this.buildParams()), {
                    stageid: e,
                    stagename: t,
                    pattern: i,
                    event: s,
                    params_id: a,
                    params_name: n,
                    params_count: r,
                    params_desc: o,
                    typ: 2
                })));
            });
        }
        levelEnd(e, t, i, s, a, n) {
            return __awaiter(this, void 0, void 0, function* () {
                this.checkLogin(() => Ue.level(Object.assign(Object.assign({}, this.buildParams()), {
                    stageid: e,
                    stagename: t,
                    pattern: i,
                    event: s,
                    times: a,
                    perc: n,
                    typ: 3
                })));
            });
        }
        loadingFinish() {
            return __awaiter(this, void 0, void 0, function* () {
                this.checkLogin(() => Ue.loadingFinish(Object.assign({}, this.buildParams()))),
                    this.startStay();
            });
        }
        active() {
            return __awaiter(this, void 0, void 0, function* () {
                this.checkLogin(() => Ue.active(Object.assign(Object.assign({}, this.buildParams()), {
                    isnew: 0,
                    sharekey: this.shareKey,
                    shareid: this.shareId
                })));
            });
        }
        logOut(e) {
            this.checkLogin(() => Ue.logOut(Object.assign(Object.assign({}, this.buildParams()), {
                times: e
            })));
        }
        share(e, t, i) {
            this.checkLogin(() => Ue.share(Object.assign(Object.assign({}, this.buildParams()), {
                typ: i,
                sharekey: e,
                shareid: t,
                shareuid: i === b.click ? this.QueryUserInviteUid : ""
            })));
        }
        adStat(e, t, i, s) {
            this.checkLogin(() => Ue.adStat(Object.assign(Object.assign({}, this.buildParams()), {
                videokey: e,
                adplat: "1",
                adid: t,
                adtyp: i,
                adstatus: s
            })));
        }
        startStay() {
            this.stayInterval = window.__ytGameTimers.setInterval(this.stayFun.bind(this), 1e3);
        }
        stayFun() {
            let e = A.I.get("newUserTime") || 0;
            e++, A.I.set("newUserTime", e), 1 === (A.I.get("newUserDot") || 0) && window.__ytGameTimers.clearInterval(this.stayInterval),
                e >= 30 && (A.I.set("newUserDot", 1), this.loadingFinishStay(30), window.__ytGameTimers.clearInterval(this.stayInterval));
        }
        loadingFinishStay(e) {
            return __awaiter(this, void 0, void 0, function* () {
                this.checkLogin(() => {
                    me.I.RegTime === Ee.today && Ue.stay(Object.assign(Object.assign({}, this.buildParams()), {
                        times: e
                    }));
                });
            });
        }
        stay(e) { }
        behaviors() {
            this.checkLogin(() => Ue.behaviors(Object.assign({}, this.buildParams())));
        }
        checkLogin(e) {
            this.isLogin ? e() : this.queue.push(e);
        }
        jumps(e, t) {
            this.checkLogin(() => Ue.jumps(Object.assign(Object.assign({}, this.buildParams()), {
                adid: 0,
                adplat: 1,
                adtyp: t,
                typ: 1,
                times: 1,
                id: e
            })));
        }
        bannerExposure2(e, t, i) {
            this.checkLogin(() => Ue.jumps(Object.assign(Object.assign({}, this.buildParams()), {
                adid: 0,
                adplat: 1,
                adtyp: t,
                typ: 2,
                times: i,
                id: e
            })));
        }
        addExposure(e, t) {
            t && t.forEach(t => {
                let { id: i } = t;
                if (this.exposureArr.hasOwnProperty(e)) {
                    this.exposureArr[e].hasOwnProperty(i) ? this.exposureArr[e][i]++ : this.exposureArr[e] = Object.assign(Object.assign({}, this.exposureArr[e]), {
                        [i]: 1
                    });
                } else {
                    let t = {
                        [e]: {
                            [i]: 1
                        }
                    };
                    this.exposureArr = Object.assign(Object.assign({}, this.exposureArr), t);
                }
            });
        }
        bannerExposure() {
            if ("{}" === JSON.stringify(this.exposureArr)) return;
            let e = JSON.parse(JSON.stringify(this.exposureArr));
            this.exposureArr = {};
            for (let t in e) {
                let i = e[t];
                for (let e in i) this.bannerExposure2(e, t, i[e]);
            }
        }
        role(e, t) {
            this.checkLogin(() => Ue.role(Object.assign(Object.assign({}, this.buildParams()), {
                role_name: e,
                region: t
            })));
        }
        buildParams() {
            return {
                gameid: T.game_id,
                channel: me.I.ChannelId,
                APIVersion: "0.6.0",
                brand: ke.I.brand,
                model: ke.I.model,
                version: ke.I.version,
                system: ke.I.system,
                platform: ke.I.platform,
                sdkversion: ke.I.SDKVersion,
                scene: me.I.Scene + "",
                uid: this.UserId,
                env: 1 === me.I.EnvEnum ? "pre" : "prod"
            };
        }
        static get I() {
            return this.instance || (this.instance = new Be());
        }
    }
    class Ae {
        constructor() {
            this.shareSimulate = !0;
        }
        static get I() {
            return this.instance || (this.instance = new Ae());
        }
        share(e, t, i = {}) {
            return new Promise((s, a) => {
                let { title: n, imageUrl: r, query: o, imageUrlId: h, share_id: l, withShareTicket: d } = t, c = {
                    title: n,
                    imageUrl: r,
                    query: o,
                    imageUrlId: h || ""
                }, p = {
                    success: t => {
                        P && console.error("WxShare share success"), Be.I.share(e, l, b.share), s(t);
                    },
                    fail: e => {
                        P && console.error("WxShare share fail"), a(Object.assign({}, pe.ShareNotGroup));
                    },
                    cancel: () => {
                        P && console.error("WxShare share cancel", null), a(null);
                    }
                };
                this.shareSimulate && !i.closeSimulate && this.simulate(Object.assign({}, p)), this.shareSimulate && i.closeSimulate && Be.I.share(e, l, b.share),
                    wx.shareAppMessage(c);
            });
        }
        updateShareMenu(e) {
            "undefined" != typeof wx && wx.updateShareMenu({
                withShareTicket: e
            });
        }
        forward(e, t = {}) {
            let i = this, { title: s, imageUrl: a, query: n, imageUrlId: r } = e;
            wx.onShareAppMessage(function () {
                let e = {
                    title: s,
                    imageUrl: a,
                    query: n,
                    imageUrlId: r || "",
                    success: e => {
                        P && console.error("WxShare forward success"), t.success && t.success.call(t.context, e);
                    },
                    fail: e => {
                        P && console.error("WxShare forward fail"), t.fail && t.fail.call(t.context, e);
                    },
                    cancel: () => {
                        P && console.error("WxShare forward cancel", null), t.fail && t.fail.call(t.context, null);
                    }
                };
                return i.shareSimulate && !t.closeSimulate && i.simulate(Object.assign({}, e)),
                    e;
            }), wx.showShareMenu({});
        }
        createQuery(e = {}) {
            e = Object.assign({}, e);
            let t = "";
            for (let i in e) t.length && (t += "&"), t += `${i}=${e[i]}`;
            return t;
        }
        simulate(e) {
            Se.I.bind(e);
        }
    }
    class Te {
        constructor() {
            this.isPreload = !1, this.videoKey = "", this._isPlaying = !1, this._isErrored = !1;
        }
        get isErrored() {
            return this._isErrored;
        }
        get isPlaying() {
            return this._isPlaying;
        }
        preloadVideo(e) {
            if (this.preloadVideoAd || this.isPreload) return;
            this.isPreload = !0;
            let t = wx.createRewardedVideoAd({
                adUnitId: e
            });
            t.onError(this.preError), t.load().then(this.handleLoaded2).catch(() => {
                this.isPreload = !1;
            }), this.videoAd2 = t;
        }
        preError() {
            Te.I.isPreload = !1;
        }
        handleLoaded2() {
            let e = Te.I;
            e.preloadVideoAd = e.videoAd2, e.isPreload = !1, P && console.warn("视频预加载成功", e.preloadVideoAd),
                console.warn(e.preloadVideoAd.isReady());
        }
        offPreload() {
            let e = Te.I;
            e.preloadVideoAd.offError(e.preError);
        }
        show(e, t) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise((i, s) => __awaiter(this, void 0, void 0, function* () {
                    if (this.isPlaying) return s(Object.assign({}, pe.VideoPlaying));
                    if (!t) return s(Object.assign({}, pe.VideoInvalid));
                    let a, n;
                    if (Be.I.adStat(e, this.adUnitId, _.video, S.request), this.preloadVideoAd ? (P && console.log("使用预加载视频", this.preloadVideoAd),
                        n = !0, this.offPreload(), a = this.preloadVideoAd, this.preloadVideoAd = null) : (P && console.log("不使用预加载视频"),
                            n = !1, a = wx.createRewardedVideoAd({
                                adUnitId: t
                            })), !a) return s(Object.assign({}, pe.VideoNotOpen));
                    if (this._isPlaying = !0, this._isErrored = !1, this.videoKey = e, this.adUnitId = t,
                        this.resolve = i, this.reject = s, this.videoAd = a, a.onClose(this.handleClose),
                        a.onError(this.onError), n) try {
                            yield this.handleLoaded();
                        } catch (e) {
                            P && console.log("error", e), yield a.load(), this.handleLoaded();
                        } else try {
                            yield a.load(), yield this.handleLoaded();
                        } catch (e) {
                            this.handleError({});
                        }
                    this.preloadVideo(t), P && console.warn("====> PCSDK WxVideo 请求视频adUnitId", t);
                }));
            });
        }
        onError(e) {
            let t = Te.I;
            !t.isErrored && t.handleError(e);
        }
        handleLoaded() {
            return __awaiter(this, void 0, void 0, function* () {
                let e = Te.I;
                try {
                    P && console.warn("handleLoaded2", e.videoAd, e.videoAd.isReady()), Be.I.adStat(this.videoKey, this.adUnitId, _.video, S.show),
                        e.videoAd.isReady() ? yield e.videoAd.show() : e.videoAd.load().then(() => {
                            e.videoAd.show();
                        }).catch(e.handleError), P && console.log("handleLoaded_show");
                } catch (t) {
                    P && console.log("handleLoaded_show__err"), e.handleError({});
                }
            });
        }
        handleClose(e) {
            P && console.warn("====> PCSDK WxVideo 广告关闭", e && e.isEnded || void 0 === e);
            let t = Te.I;
            e && e.isEnded || void 0 === e ? (Be.I.adStat(t.videoKey, t.adUnitId, _.video, S.complete),
                t.resolve && t.resolve({
                    type: 2
                })) : (Be.I.adStat(t.videoKey, t.adUnitId, _.video, S.interrupt), t.reject && t.reject(Object.assign({}, pe.VideoQuit))),
                t.videoAd.offClose(t.handleClose), t._isPlaying = !1, t._isErrored = !1;
        }
        handleError(e) {
            P && console.warn("====> PCSDK WxVideo 加载视频广告失败", e);
            let t = Te.I;
            Be.I.adStat(t.videoKey, t.adUnitId, _.video, S.fail), t.reject && t.reject(Object.assign({}, pe.VideoFail)),
                t.videoAd && t.videoAd.offClose && t.videoAd.offClose(t.handleClose), t._isPlaying = !1,
                t._isErrored = !0;
        }
        static get I() {
            return this.instance || (this.instance = new Te());
        }
    }
    class Pe {
        constructor() {
            this.preload = !0, this.forwardKey = "forward", this.shareObjs = {
                default: [T.default_share]
            };
        }
        setForwardKey(e) {
            this.forwardKey = e, this.forward(this.forwardKey);
        }
        init() {
            return __awaiter(this, void 0, void 0, function* () {
                let e = yield Ue.ShareList();
                this.setShareVideoData(e), Ae.I.updateShareMenu(!0), this.forwardKey && this.forward(this.forwardKey);
            });
        }
        preloadVideo() {
            Te.I.preloadVideo(T.videoAd);
        }
        share(e, t = {}, i = {}) {
            return new Promise((t, s) => {
                let { id: a, typ: n, content: r, key: o, icon: h, videoid: l } = this.getShareVideoData(e), d = {
                    title: r,
                    imageUrl: h,
                    share_id: a,
                    query: this.createQuery({
                        share_key: o,
                        share_id: a
                    })
                };
                switch (i && (i.title && (d.title = i.title), i.img_url && (d.imageUrl = i.img_url),
                    i.share_type && (n = i.share_type)), +n) {
                    case f.Video:
                        Te.I.show(e, l).then(e => {
                            t(e);
                        }).catch(e => {
                            s(e);
                        });
                        break;

                    case f.VideoToShare:
                        Te.I.show(e, l).then(e => {
                            t(e);
                        }).catch(a => {
                            1e3 !== a.code && 1003 !== a.code ? Ae.I.share(e, d, i).then(e => {
                                t(e);
                            }).catch(e => {
                                s(e);
                            }) : s(a);
                        });
                        break;

                    case f.Share:
                        Ae.I.share(e, d, i).then(e => {
                            t(e);
                        }).catch(e => {
                            s(e);
                        });
                        break;

                    case f.None:
                    default:
                        t({});
                }
            });
        }
        forward(e) {
            let t = this.getShareVideoData(e || this.forwardKey), i = {
                title: t.content,
                imageUrl: t.icon,
                query: this.createQuery({
                    share_key: t.key,
                    share_id: t.id
                })
            };
            Ae.I.forward(i);
        }
        shareDispatch(e, t = {}, i = {}) { }
        dispatchType(e, t, i = {}, s = {}) { }
        shareWithType(e, t, i = {}, s = {}) {
            this.dispatchType(e, t, i, s);
        }
        getShareVideoID(e) {
            return this.getShareVideoData(e).id;
        }
        getShareVideoID2(e) {
            return this.getShareVideoData(e).videoid;
        }
        getShareVideoType(e) {
            return +this.getShareVideoData(e).typ;
        }
        getShareType(e) {
            return this.getShareVideoType(e);
        }
        getType(e) {
            return this.getShareVideoType(e);
        }
        handleSuccess(e, t, i, s) { }
        handleFail(e, t, i, s, a) { }
        setShareVideoData(e) {
            (e.data || []).forEach(e => {
                this.shareObjs[e.key] = this.shareObjs[e.key] || [], this.shareObjs[e.key].push(e);
            });
        }
        getShareVideoData(e) {
            let t = this.shareObjs[e];
            return t || (t = this.shareObjs.default), t[ye.rand(0, t.length)];
        }
        createQuery(e = {}) {
            e = Object.assign(Object.assign({}, e), {
                channel_id: T.channel_id,
                user_invite_uid: me.I.UserId
            });
            let t = "";
            for (let i in e) t.length && (t += "&"), t += `${i}=${e[i]}`;
            return t;
        }
        static get I() {
            return this.instance || (this.instance = new Pe());
        }
    }
    !function (e) {
        e.WX = "wx", e.QQ = "qq";
    }(xe || (xe = {})), function (e) {
        e.PlatformType = "wx";
    }(be || (be = {}));
    class Ne {
        constructor() {
            this.DEFUALT = "0.0.0", this.VERSION = {
                createRewardedVideoAd: {
                    [xe.WX]: "2.0.4",
                    [xe.QQ]: "0.1.26"
                },
                createInterstitialAd: {
                    [xe.WX]: "2.6.0"
                },
                createFeedbackButton: {
                    [xe.WX]: "2.1.2"
                },
                createUserInfoButton: {
                    [xe.WX]: "2.0.1"
                },
                createBannerAd: {
                    [xe.WX]: "2.0.4",
                    [xe.QQ]: "0.1.26"
                },
                createGameBanner: {
                    [xe.WX]: "2.7.5"
                },
                createGamePortal: {
                    [xe.WX]: "2.7.5"
                },
                createGameIcon: {
                    [xe.WX]: "2.8.2"
                },
                setClipboardData: {
                    [xe.WX]: "1.1.0"
                },
                setSubscribeMessage: {
                    [xe.WX]: "2.8.0"
                },
                getUpdateManager: {
                    [xe.WX]: "1.9.90"
                },
                updateShareMenu: {
                    [xe.WX]: "1.2.0"
                },
                showShareMenu: {
                    [xe.WX]: "1.1.0"
                },
                vibrate: {
                    [xe.WX]: "1.2.0"
                },
                getShareInfo: {
                    [xe.WX]: "1.1.0"
                },
                openCustomerServiceConversation: {
                    [xe.WX]: "2.0.3"
                }
            }, P && console.error("SDK Version ", this.VERSION, this.getVRewardedVideoAd(), this.getVInterstitialAd());
        }
        getVRewardedVideoAd() {
            return this.VERSION.createRewardedVideoAd[be.PlatformType] || this.DEFUALT;
        }
        getVInterstitialAd() {
            return this.VERSION.createInterstitialAd[be.PlatformType] || this.DEFUALT;
        }
        getVFeedbackButton() {
            return this.VERSION.createFeedbackButton[be.PlatformType] || this.DEFUALT;
        }
        getVUserInfoButton() {
            return this.VERSION.createUserInfoButton[be.PlatformType] || this.DEFUALT;
        }
        getVBannerAd() {
            return this.VERSION.createBannerAd[be.PlatformType] || this.DEFUALT;
        }
        getVGameBanner() {
            return this.VERSION.createGameBanner[be.PlatformType] || this.DEFUALT;
        }
        getVGamePortal() {
            return this.VERSION.createGamePortal[be.PlatformType] || this.DEFUALT;
        }
        getVGameIcon() {
            return this.VERSION.createGameIcon[be.PlatformType] || this.DEFUALT;
        }
        getVClipboardData() {
            return this.VERSION.setClipboardData[be.PlatformType] || this.DEFUALT;
        }
        getVSubscribeMessage() {
            return this.VERSION.setSubscribeMessage[be.PlatformType] || this.DEFUALT;
        }
        getVUpdateManager() {
            return this.VERSION.getUpdateManager[be.PlatformType] || this.DEFUALT;
        }
        getVVibrate() {
            return this.VERSION.vibrate[be.PlatformType] || this.DEFUALT;
        }
        getVShareInfo() {
            return this.VERSION.getShareInfo[be.PlatformType] || this.DEFUALT;
        }
        getVUpdateShareMenu() {
            return this.VERSION.updateShareMenu[be.PlatformType] || this.DEFUALT;
        }
        getVShowShareMenu() {
            return this.VERSION.showShareMenu[be.PlatformType] || this.DEFUALT;
        }
        getVCustomerService() {
            return this.VERSION.openCustomerServiceConversation[be.PlatformType] || this.DEFUALT;
        }
        static get I() {
            return this.instance || (this.instance = new Ne());
        }
    }
    class De {
        getVersionError(e) {
            return {
                errMsg: `支持最低版本：${e}`,
                errCode: -1
            };
        }
        canIUse(e) {
            return k.compareVersion(ke.I.SDKVersion, e) >= 0;
        }
        showModal(e) {
            wx.showModal(e);
        }
        subscribeMessage(e) {
            let t = Ne.I.getVSubscribeMessage();
            return this.canIUse(t) ? (console.log("tmplIds", e), new Promise((t, i) => {
                wx.requestSubscribeMessage({
                    tmplIds: e,
                    success: e => {
                        t(e);
                    },
                    fail: e => {
                        i(e);
                    }
                });
            })) : Promise.reject(this.getVersionError(t));
        }
        createBannerAd(e, t, i) {
            return this.canIUse(Ne.I.getVBannerAd()) ? (i = i || 30, wx.createBannerAd({
                adUnitId: e,
                style: t
            })) : null;
        }
        createGameBanner(e, t) {
            return this.canIUse(Ne.I.getVGameBanner()) ? wx.createGameBanner({
                adUnitId: e,
                style: t
            }) : null;
        }
        createInterstitialAd(e) {
            return this.canIUse(Ne.I.getVInterstitialAd()) ? wx.createInterstitialAd({
                adUnitId: e
            }) : null;
        }
        createGameIcon(e, t) {
            return this.canIUse(Ne.I.getVGameIcon()) ? wx.createGameIcon(Object.assign({
                adUnitId: e
            }, t)) : null;
        }
        createGamePortal(e) {
            return this.canIUse(Ne.I.getVGamePortal()) ? wx.createGamePortal({
                adUnitId: e
            }) : null;
        }
        createRewardedVideoAd(e) {
            return this.canIUse(Ne.I.getVRewardedVideoAd()) ? wx.createRewardedVideoAd({
                adUnitId: e
            }) : null;
        }
        createFeedbackButton(e) {
            return this.canIUse(Ne.I.getVFeedbackButton()) ? wx.createFeedbackButton(e) : null;
        }
        createUserInfoButton(e) {
            return this.canIUse(Ne.I.getVUserInfoButton()) ? wx.createUserInfoButton(e) : null;
        }
        openCustomerServiceConversation(e) {
            return this.canIUse(Ne.I.getVCustomerService()) ? (wx.openCustomerServiceConversation(Object.assign({}, e)),
                1) : -1;
        }
        vibrateLong() {
            return this.canIUse(Ne.I.getVVibrate()) ? new Promise((e, t) => {
                wx.vibrateLong({
                    success: () => {
                        e(1);
                    },
                    fail: () => {
                        e(0);
                    }
                });
            }) : Promise.reject(null);
        }
        vibrateShort() {
            return this.canIUse(Ne.I.getVVibrate()) ? new Promise((e, t) => {
                wx.vibrateShort({
                    success: () => {
                        e(1);
                    },
                    fail: () => {
                        e(0);
                    }
                });
            }) : Promise.reject(null);
        }
        updateShareMenu(e) {
            this.canIUse(Ne.I.getVUpdateShareMenu()) && wx.updateShareMenu({
                withShareTicket: e
            });
        }
        checkUpdate(e) {
            if (!this.canIUse(Ne.I.getVUpdateManager())) return;
            let t = this, i = {
                title: (e = e || {}).title || "更新提示",
                content: e.content || "新版本已经准备好，是否重启应用？",
                showCancel: !1,
                success: t => {
                    e.success && e.success(t), t.confirm && s.applyUpdate();
                },
                fail: t => e.fail && e.fail(t),
                complete: () => e.complete && e.complete()
            };
            ["cancelText", "cancelColor", "confirmText", "confirmColor"].forEach(t => k.hasProperty(e, t) && (i = Object.assign(Object.assign({}, i), {
                [t]: e[t]
            })));
            let s = wx.getUpdateManager("");
            s.onCheckForUpdate(e => {
                P && console.warn("====> PCSDK WxApi updateManager onCheckForUpdate", e.hasUpdate);
            }), s.onUpdateReady(function () {
                t.showModal(i);
            }), s.onUpdateFailed(function () {
                P && console.warn("SDK WxApi updateManager onUpdateFailed");
            });
        }
        showShareMenu(e, t) {
            this.canIUse(Ne.I.getVShowShareMenu()) && (P && console.error("showShareMenu shareApp"),
                P && console.error("showShareMenu shareMenu"), wx.onShareAppMessage(() => e), wx.showShareMenu(t));
        }
        shareAppMessage(e) {
            wx.shareAppMessage(e);
        }
        previewImage(e, t) {
            return new Promise((i, s) => {
                e && 0 !== e.length ? wx.previewImage({
                    current: e[t],
                    urls: e,
                    success(e) {
                        i(Object.assign(Object.assign({}, e), {
                            qrcode: 1
                        }));
                    },
                    fail(e) {
                        s(e);
                    }
                }) : s();
            });
        }
        getNetworkType() {
            return new Promise((e, t) => {
                wx.getNetworkType({
                    success(t) {
                        e(t);
                    },
                    fail(e) {
                        t({
                            networkType: v.Unknown
                        });
                    }
                });
            });
        }
        navigateToMiniProgram(e, t, i = {}) {
            return new Promise((s, a) => {
                wx.navigateToMiniProgram({
                    appId: e,
                    path: t,
                    extraData: i.extraData || {},
                    envVersion: i.envVersion || "release",
                    success(e) {
                        s(e);
                    },
                    fail(e) {
                        a(e);
                    }
                });
            });
        }
        login() {
            return new Promise((e, t) => {
                wx.login({
                    success: t => {
                        e(t.code);
                    },
                    fail: e => {
                        t(e), De.I.setAuthorize(Object.assign({
                            errorTip: "wx.login fail"
                        }, e));
                    }
                });
            });
        }
        getUserinfo() {
            return new Promise((e, t) => {
                wx.getUserInfo({
                    lang: "zh_CN",
                    withCredentials: !0,
                    success: i => {
                        if (!i) return t(i), De.I.setAuthorize(Object.assign({
                            errorTip: "getUserInfo Success result is null"
                        }, i));
                        e(i);
                    },
                    fail: e => {
                        t(e), De.I.setAuthorize(Object.assign({
                            errorTip: "getUserInfo Fail"
                        }, e));
                    }
                });
            });
        }
        getShareInfo(e) {
            return this.canIUse(Ne.I.getVShareInfo()) ? new Promise((t, i) => {
                wx.getShareInfo({
                    shareTicket: e,
                    success: e => {
                        let { errMsg: s } = e;
                        "getShareInfo:ok" === s ? t(e) : i(e);
                    },
                    fail: e => {
                        i(e);
                    }
                });
            }) : Promise.reject(null);
        }
        requestMidasPayment(e) {
            let { mode: t, env: i, offerId: s, currencyType: a, platform: n, buyQuantity: r, zoneId: o } = e;
            return console.warn("====> PCSDK WxApi requestMidasPayment 支付参数", {
                mode: t,
                env: i,
                offerId: s,
                currencyType: a,
                platform: n,
                buyQuantity: r,
                zoneId: o
            }), new Promise((e, h) => {
                wx.requestMidasPayment({
                    mode: t,
                    env: i,
                    offerId: s,
                    currencyType: a,
                    platform: n,
                    buyQuantity: r,
                    zoneId: o,
                    success: t => {
                        t && "requestMidasPayment:ok" === t.errMsg ? e(t) : h(t);
                    },
                    fail: e => {
                        h(e);
                    }
                });
            });
        }
        setAuthorize(e) {
            me.I.setAuthorize(!1);
        }
        static get I() {
            return this._instance || (this._instance = new De());
        }
    }
    class Me {
        constructor() {
            this.onlineTime = Ee.nowTime, wx.onShow(this.onShow.bind(this)), wx.onHide(this.onHide.bind(this)),
                wx.onNetworkStatusChange(this.onNetworkStatusChange.bind(this));
        }
        init() {
            let { platform: e } = ke.I.SystemData, t = ue.I.LaunchData;
            console.log("启动信息", t);
            let { query: i, scene: s, referrerInfo: a } = t, { invite_type: n, channelId: r, channel_id: o, td_channelid: h, channel: l, share_id: d, share_key: c, user_invite_uid: p, weixinadinfo: g, account_id: u, service_id: m, shareMessageToFriendScene: y } = i, I = r || o || l || h;
            if (g) {
                let e = g.split(".");
                e && e.length && (I = e[0]);
            }
            y && y >= 0 && y <= 50 && (c = T.shareMessageToFriend.sharekey, d = T.shareMessageToFriend.share_id),
                P && console.warn(`====> PCSDK wxinit query user_invite_uid：${p}; fromChannel：${I}; channelId：${I}; scene：${s}; share_id：${d}; share_key：${c};`),
                me.I.setScene(s).setReferrerInfo(a || {}).setShareId(d).setPlatform(e).setShareKey(c).setChannelId(I).setQueryChannelId(I || T.channel_id).setInviteType(n).setQueryUserInviteUid(p || 0).setQueryExtData({
                    account_id: u,
                    service_id: m
                }).setSystemId().setLaunchSource(), De.I.getNetworkType().then(e => this.setNetworkType(e)).catch(e => this.setNetworkType(e));
        }
        onShow(e) {
            console.log("onshow_opts", e);
            let t = Ee.nowTime, { scene: i, shareTicket: s } = e;
            if (this.onlineTime = t, me.I.setScene(i).setLaunchTime(t).setLaunchSource(), e && e.query) {
                let { share_key: t, share_id: i, invite_type: a, user_invite_uid: n } = e.query;
                !k.isUndefined(i) && me.I.setShareId(i), !k.isUndefined(t) && me.I.setShareKey(t),
                    !k.isUndefined(a) && me.I.setInviteType(a), !k.isUndefined(s) && me.I.setShareTicket(s),
                    !k.isUndefined(n) && me.I.setQueryUserInviteUid(n), i && t && Be.I.share(t, i, b.click);
            }
            fe.I.emit(we.APP_SHOW, e);
        }
        onHide() {
            fe.I.emit(we.APP_HIDE), Be.I.bannerExposure(), this.onlineTime && (Be.I.logOut(Ee.nowTime - this.onlineTime),
                this.onlineTime = 0);
        }
        onNetworkStatusChange(e) {
            console.warn("网络变化了：", e), this.setNetworkType(e);
        }
        setNetworkType(e) {
            e && e.networkType && me.I.setNetworkType(e.networkType);
        }
        static get I() {
            return this.instance || (this.instance = new Me());
        }
    }
    class Ge {
        constructor() {
            this.isDebug = !1;
        }
        setData(e) {
            e && (this.data = e);
        }
        setDebugMode(e) {
            this.isDebug = e;
        }
        updateOnlineConfig() {
            return new Promise((e, t) => {
                this.reqOnlineConfig().then(t => e(t)).catch(e => t(e));
            });
        }
        getParams(e) {
            if (!e) return P && console.warn("SDK OnlineService 请传递key！"), null;
            let t = this.data;
            return t ? t.hasOwnProperty(e) ? t[e] : (P && console.warn("SDK OnlineService 请在后台配置在线参数key：【" + e + "】"),
                null) : null;
        }
        getParamsObj(...e) {
            let t = this.getParams(e[0]);
            return 2 !== e.length || t ? t ? JSON.parse(t) : t : e[1];
        }
        getParamsInt(...e) {
            let t = this.getParams(e[0]);
            return 2 !== e.length || t ? +t : e[1];
        }
        getParamsString(...e) {
            let t = this.getParams(e[0]);
            return 2 !== e.length || t ? t : e[1];
        }
        reqOnlineConfig() {
            return new Promise((e, t) => {
                Ue.getConfig().then(t => {
                    (this.data = t && t.data && t.data.config) && (this.data = t.data.config), e(this.data);
                }).catch(e => {
                    t(e);
                });
            });
        }
        static get I() {
            return this.instance || (this.instance = new Ge());
        }
    }
    class Ve {
        login(e, t) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise((i, s) => __awaiter(this, void 0, void 0, function* () {
                    let a = yield De.I.login();
                    e ? De.I.getUserinfo().then(e => this.authedlogin(e, a, i, s, t)).catch(e => this.weakLogin(e, a, i, s, t)) : this.weakLogin({
                        errCode: 1,
                        msg: "默认未授权登录"
                    }, a, i, s, t);
                }));
            });
        }
        authedlogin(e, t, i, s, a) {
            return __awaiter(this, void 0, void 0, function* () {
                let { rawData: n, iv: r, encryptedData: o, signature: h, userInfo: l } = e, d = Object.assign(Object.assign({}, this.buildParams()), {
                    code: t,
                    signature: h,
                    iv: r,
                    encryptedData: o,
                    ip: a && a.ip ? "1" : "0"
                });
                l && me.I.setGender(l.gender), Ue.Login(d).then(e => {
                    this.handleLogin(e, i, !0), i(e);
                }).catch(e => s(e));
            });
        }
        weakLogin(e, t, i, s, a) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!e || e.errCode === ce.InvalidLogin.code) return;
                me.I.ReferrerInfo;
                let n = Object.assign(Object.assign({}, this.buildParams()), {
                    code: t,
                    ip: a && a.ip ? "1" : "0"
                });
                Ue.weakLogin(n).then(e => {
                    this.handleLogin(e, i, !1);
                }).catch(e => s(e));
            });
        }
        handleLogin(e, t, i) {
            if (e && e.data) {
                let { channel: t, uid: i, firstlogin: a, token: n, reftoken: r, openid: o, expire: h, isnew: l, gameconfig: d, ip: c } = e.data;
                var s = {
                    channel: t,
                    userId: i,
                    regTime: a,
                    openId: o,
                    isnew: l,
                    token: n,
                    refToken: r,
                    expire: h
                };
                c && (s = Object.assign(Object.assign({}, s), {
                    ip: c
                })), Be.I.setLogind(s), Ge.I.setData(d), Be.I.active(), !this.isFirst && me.I.ShareKey && me.I.ShareId && (this.isFirst = !0,
                    Be.I.share(me.I.ShareKey, me.I.ShareId, b.click)), this.handleExpire(h), Pe.I.forward();
            }
            t(e);
        }
        buildParams() {
            return {
                channel: me.I.QueryChannelId + "",
                brand: ke.I.brand,
                model: ke.I.model,
                version: ke.I.version,
                system: ke.I.system,
                platform: ke.I.platform,
                sdkversion: ke.I.SDKVersion,
                shareuid: +me.I.QueryUserInviteUid,
                scene: me.I.Scene + "",
                sharekey: me.I.ShareKey,
                shareid: me.I.ShareId + ""
            };
        }
        handleExpire(e) {
            let t = e - Ee.now;
            this.countDown && window.__ytGameTimers.clearTimeout(this.countDown), this.countDown = window.__ytGameTimers.setTimeout(this.refreshToken, 1e3 * t);
        }
        refreshToken() {
            Ue.reftoken({
                channel: me.I.ChannelId + "",
                uid: me.I.UserId,
                token: me.I.Token,
                reftoken: me.I.refToken
            }).then(e => {
                let { token: t, reftoken: i, expire: s } = e.data;
                me.I.setLoginData({
                    token: t,
                    refToken: i,
                    expire: s
                }), this.handleExpire(s);
            });
        }
        static get I() {
            return this._instance || (this._instance = new Ve());
        }
    }
    class Oe {
        pay(e, t = {}) {
            return new Promise((i, s) => {
                let { Mode: a, OfferId: n, ZoneId: r, CurrencyType: o, Platform: h } = T.MidasPay, l = h || (0 === me.I.SystemId ? "ios" : "android"), d = {
                    mode: a,
                    env: 1,
                    platform: l,
                    offerId: n,
                    currencyType: o,
                    buyQuantity: 10 * e.money,
                    zoneId: r
                };
                console.log(d), De.I.requestMidasPayment(d).then(() => this.handlePaySuccess(Object.assign(Object.assign({}, e), {
                    platform: l
                }), t, i, s)).catch(e => this.handlePayError(e, s));
            });
        }
        handlePaySuccess(e, t, i, s) {
            return __awaiter(this, void 0, void 0, function* () {
                let a = "";
                for (let e in t) a += `${e}=${t[e]}&`;
                a = a.substring(0, a.length - 1), a = encodeURIComponent(a);
                let n = Object.assign(Object.assign(Object.assign({}, this.buildParams()), t), {
                    extend: a,
                    source: e.source,
                    type: 1,
                    amount: 100 * e.money,
                    platform: e.platform
                });
                Ue.pay(n).then(e => i(e)).catch(e => this.handlePayError(e, s));
            });
        }
        handlePayError(e, t) {
            console.log("支付失败", JSON.stringify(e)), t(e);
        }
        buildParams() {
            let e = T.game_id, t = me.I.ChannelId;
            return {
                gameid: e,
                openid: me.I.OpenId,
                channel: t,
                brand: ke.I.brand,
                model: ke.I.model,
                version: ke.I.version,
                system: ke.I.system,
                sdkversion: ke.I.SDKVersion,
                scene: me.I.Scene + "",
                uid: me.I.UserId,
                token: me.I.Token,
                env: 1 === me.I.EnvEnum ? "pre" : "prod"
            };
        }
        static get I() {
            return this._instance || (this._instance = new Oe());
        }
    }
    class je {
        constructor() { }
        env() {
            return new Promise((e, t) => {
                Ue.Version().then(t => {
                    if (t) {
                        P && console.log("版本信息", t);
                        let e = t.data && t.data.env ? t.data.env : 2;
                        me.I.setEnvEnum(+e);
                    }
                    e(t);
                }).catch(e => {
                    t(e);
                });
            });
        }
        login(e = !1, t) {
            return Ve.I.login(e, t);
        }
        saveData(e, t) {
            return Ue.saveData({
                key: e,
                content: t,
                uid: me.I.UserId,
                token: me.I.Token
            });
        }
        getData(e) {
            return Ue.getData({
                key: e,
                uid: me.I.UserId,
                token: me.I.Token
            });
        }
        rankAdd(e, t) {
            return Ue.rankAdd({
                typ: e,
                fraction: t,
                uid: me.I.UserId,
                token: me.I.Token
            });
        }
        rankList(e, t, i) {
            return Ue.rankList({
                typ: e,
                t: t,
                rankdata: i ? 1 : 0,
                uid: me.I.UserId,
                token: me.I.Token
            });
        }
        totalrankAdd(e, t, i, s) {
            return Ue.totalrankAdd({
                typ: e,
                sort: s,
                t: i,
                fraction: t,
                uid: me.I.UserId,
                token: me.I.Token
            });
        }
        totalrankList(e, t, i, s) {
            return Ue.totalrankList({
                typ: e,
                t: t,
                sort: s,
                rankdata: i ? 1 : 0,
                uid: me.I.UserId,
                token: me.I.Token
            });
        }
        adList(e) {
            return Ue.adList({
                adtyp: e,
                uid: me.I.UserId,
                token: me.I.Token
            });
        }
        subScribe(e, t) {
            return new Promise((i, s) => {
                De.I.subscribeMessage(e).then(i => {
                    if (i = i || {}, e.filter(e => i[e] && "accept" === i[e]).length) {
                        let e = +me.I.UserId, i = me.I.Token + "", s = me.I.OpenId + "", a = t;
                        Ue.subscribe({
                            uid: e,
                            token: i,
                            openid: s,
                            status: 1,
                            id: a
                        });
                    } else s({
                        errCode: 0,
                        errMsg: "点击取消订阅"
                    });
                }).catch(e => s(e));
            });
        }
        pay(e, t = {}) {
            return Oe.I.pay(e, t);
        }
        orderQuery(e) {
            return Ue.orderQuery(Object.assign(Object.assign({}, this.buildParams()), {
                source: e
            }));
        }
        buildParams() {
            return {
                gameid: T.game_id,
                channel: me.I.ChannelId,
                uid: me.I.UserId,
                token: me.I.Token
            };
        }
        static get I() {
            return this.instance || (this.instance = new je());
        }
    }
    class Re {
        constructor(e, t) {
            this.queue = [], this.isEnd = !1, e = e || 750, t = t || 750, this.adUnitId = "",
                this._isErrored = !1, this.designWidth = e, this.bannerScale = ke.I.winWidth / this.designWidth,
                this.bannerWidth = Math.max(this.bannerScale * t, 300), this.bannerHeight = ke.I.winHeight / this.bannerScale;
        }
        static get I() {
            return this.instance || (this.instance = new Re(750, 750));
        }
        get isErrored() {
            return this._isErrored;
        }
        create(e, t) {
            return this.bannerParams = t || {}, t && t.bannerWidth && (this.bannerWidth = t.bannerWidth),
                this.isEnd = !0, this.bannerParams.type = this.bannerParams.type || 1, this.bannerParams.offsetY = -this.bannerParams.offsetY || 0,
                this.bannerParams.adIntervals = this.bannerParams.adIntervals || 120, new Promise((i, s) => {
                    if (this.resolve = i, this.reject = s, this._isErrored = !1, this.adUnitId = e,
                        k.isEmpty(e)) return Re.I.handleQueue(), this.reject(Object.assign(Object.assign({}, ge.BannerInvalid), {
                            adUnitId: this.adUnitId
                        }));
                    2 === this.bannerParams.type && (this.bannerWidth = ke.I.winWidth);
                    let a = {
                        top: 0,
                        left: (ke.I.winWidth - this.bannerWidth) / 2,
                        width: this.bannerWidth
                    };
                    if (a = Object.assign(Object.assign({}, a), {
                        top: 0 + this.bannerParams.offsetY
                    }), this.bannerAd) (!t || t && !t.isOff) && this.show(!1); else {
                        if (this.bannerAd = wx.createBannerAd({
                            adUnitId: e,
                            style: a,
                            adIntervals: this.bannerParams.adIntervals
                        }), Be.I.adStat("banner", this.adUnitId, _.banner, S.request), !this.bannerAd) return Re.I.handleQueue(),
                            this.reject(Object.assign(Object.assign({}, ge.BannerNotOpen), {
                                adUnitId: this.adUnitId
                            }));
                        this.bannerAd.onLoad(this.onLoad), this.bannerAd.onError(this.onError), this.bannerAd.onResize(this.onResize),
                            (!t || t && !t.isOff) && this.show(!1);
                    }
                });
        }
        show(e = !0) {
            if (!Re.I.isEnd || !e) return Re.I.isEnd = !0, this.bannerAd ? (this.bannerAd.style.realHeight && (this.bannerAd.style.top = ke.I.winHeight - this.bannerAd.style.realHeight + this.bannerParams.offsetY),
                2 === this.bannerParams.type && this.bannerAd.style.width ? this.bannerAd.style.left = (ke.I.winWidth - this.bannerAd.style.width) / 2 : this.bannerAd.style.left = (ke.I.winWidth - this.bannerWidth) / 2,
                Be.I.adStat("banner", this.adUnitId, _.banner, S.show), this.bannerAd.show().catch(e => this.handleShowError(e)),
                P && console.error("wxBanner - show: " + this.adUnitId, this.bannerAd.style), Re.I.handleQueue(),
                !0) : (Re.I.handleQueue(), !1);
            Re.I.queue.push(Re.I.show.bind(Re.I));
        }
        hide() {
            let e = Re.I;
            e.isEnd ? e.queue.push(e.hide.bind(e)) : (e.isEnd = !0, this.bannerAd && (this.bannerAd.style.left = -9999,
                this.bannerAd.hide(), Be.I.adStat("banner", e.adUnitId, _.banner, S.interrupt),
                P && console.error("wxBanner - hide: " + this.adUnitId)), e.handleQueue());
        }
        toggle(e) {
            e ? this.show() : this.hide();
        }
        destory() {
            this.bannerAd && (this.bannerAd.style.left = -9999, this.bannerAd.destroy(), this.bannerAd = null,
                Be.I.adStat("banner", this.adUnitId, _.banner, S.interrupt), P && console.error("wxBanner - destory: " + this.adUnitId));
        }
        onLoad() {
            let e = Re.I, t = e.bannerAd;
            t && (P && console.error("wxBanner - onLoad: " + e.adUnitId), t.style.realHeight && (t.style.top = ke.I.winHeight - t.style.realHeight + e.bannerParams.offsetY),
                e.unbind(), e.handleQueue(), e.resolve && e.resolve({
                    adUnitId: e.adUnitId,
                    scale: e.bannerScale,
                    width: t.style.realWidth / e.bannerScale,
                    height: t.style.realHeight / e.bannerScale
                }));
        }
        onError(e) {
            P && console.error("wxBanner - onError", e);
            let t = Re.I;
            !t._isErrored && t.handleError(e, Object.assign(Object.assign({}, ge.BannerFail), {
                adUnitId: t.adUnitId
            }));
        }
        onResize() {
            let e = Re.I, t = e.bannerAd;
            t && (t.style.top = ke.I.winHeight - t.style.realHeight + e.bannerParams.offsetY,
                t.style.left = (ke.I.winWidth - t.style.realWidth) / 2);
        }
        handleShowError(e) {
            P && console.error("wxBanner - handleShowError", e);
            let t = Re.I, { errCode: i, errMsg: s } = e;
            !t.isErrored && t.handleError(e, {
                code: i,
                msg: s
            });
        }
        handleError(e, t) {
            let i = Re.I;
            i.unbind(), i._isErrored = !0, i.bannerAd = null, i.handleQueue(), Be.I.adStat("banner", i.adUnitId, _.banner, S.fail),
                i.reject && i.reject(Object.assign(Object.assign({}, t), {
                    adUnitId: i.adUnitId
                })), P && console.error("wxBanner - onError: " + i.adUnitId);
        }
        unbind() {
            this.bannerAd && (this.bannerAd.offLoad(this.onLoad), this.bannerAd.offError(this.onError),
                this.bannerAd.offResize(this.onResize));
        }
        handleQueue() {
            let e = Re.I;
            if (e.queue.length > 0) {
                e.isEnd = !1, e.queue.shift()();
            } else e.isEnd = !1;
        }
    }
    class He {
        constructor(e, t) {
            e = e || 750, t = t || 750, this.AdList = {}, this.adUnitId = "", this._isErrored = !1,
                this.designWidth = e, this.bannerScale = ke.I.winWidth / this.designWidth, this.bannerWidth = Math.max(this.bannerScale * t, 300),
                this.bannerHeight = ke.I.winHeight / this.bannerScale;
        }
        static get I() {
            return this.instance || (this.instance = new He(750, 750));
        }
        get isErrored() {
            return this._isErrored;
        }
        create(e, t, i) {
            return this.bannerParams = i || {}, this.AdList[e] = Object.assign(Object.assign({}, i), {
                adUnitId: t,
                key: e,
                isEnd: !1,
                queue: []
            }), i && i.bannerWidth && (this.bannerWidth = i.bannerWidth), this.bannerParams.type = this.bannerParams.type || 1,
                this.bannerParams.gridCount = this.bannerParams.gridCount || 5, this.bannerParams.offsetY = -this.bannerParams.offsetY || 0,
                this.bannerParams.adIntervals = this.bannerParams.adIntervals || 60, new Promise((i, s) => {
                    if (this.resolve = i, this.reject = s, this._isErrored = !1, this.adUnitId = t,
                        k.isEmpty(t)) return this.reject(Object.assign(Object.assign({}, ge.BannerInvalid), {
                            adUnitId: this.adUnitId
                        }));
                    2 === this.bannerParams.type && (this.bannerWidth = ke.I.winWidth);
                    let a = {
                        top: 0,
                        left: (ke.I.winWidth - this.bannerWidth) / 2,
                        width: this.bannerWidth
                    };
                    return a = Object.assign(Object.assign({}, a), {
                        top: 0 + this.bannerParams.offsetY
                    }), this.AdList[e].gridAd ? (this.AdList[e].isOff && this.show(e), void i()) : (this.gridAd = wx.createGridAd({
                        adUnitId: t,
                        style: {
                            left: a.left,
                            top: this.bannerHeight
                        },
                        gridCount: this.bannerParams.gridCount
                    }), Be.I.adStat("grid", t, _.grid, S.request), this.gridAd ? (this.AdList[e].gridAd = this.gridAd,
                        this.gridAd.onLoad(this.onLoad), this.gridAd.onError(this.onError), this.gridAd.onResize(this.onResize),
                        void (this.AdList[e].isOff || this.show(e))) : this.reject(Object.assign(Object.assign({}, ge.BannerNotOpen), {
                            adUnitId: this.adUnitId
                        })));
                });
        }
        show(e) {
            if (this.AdList[e].gridAd) {
                if (this.AdList[e].isEnd) {
                    let t = e => {
                        He.I.show(e);
                    };
                    return void this.AdList[e].queue.push(t);
                }
                return this.AdList[e].isEnd = !0, this.AdList[e].gridAd.style.realHeight && (this.AdList[e].gridAd.style.top = ke.I.winHeight - this.AdList[e].gridAd.style.realHeight + this.AdList[e].offsetY),
                    2 === this.bannerParams.type && this.AdList[e].gridAd.style.width ? this.AdList[e].gridAd.style.left = (ke.I.winWidth - this.AdList[e].gridAd.style.width) / 2 : this.AdList[e].gridAd.style.left = (ke.I.winWidth - this.bannerWidth) / 2,
                    Be.I.adStat("grid", this.AdList[e].adUnitId, _.grid, S.show), this.AdList[e].gridAd.show().catch(e => this.handleShowError(e)),
                    this.onResize(), P && console.error("WxGrid - show: " + this.adUnitId, this.AdList[e].gridAd.style),
                    He.I.handleQueue(e), !0;
            }
            return He.I.handleQueue(e), !1;
        }
        hide(e) {
            if (this.AdList[e].gridAd) {
                if (this.AdList[e].isEnd) {
                    let t = e => {
                        He.I.hide(e);
                    };
                    return void this.AdList[e].queue.push(t);
                }
                this.AdList[e].isEnd = !0, this.AdList[e].gridAd.style.left = -9999, this.AdList[e].gridAd.hide(),
                    Be.I.adStat("grid", this.AdList[e].adUnitId, _.grid, S.interrupt), P && console.error("WxGrid - hide: " + this.adUnitId),
                    He.I.handleQueue(e);
            }
        }
        destory(e) {
            this.AdList[e] && this.AdList[e].gridAd && (this.AdList[e].gridAd.style.left = -9999,
                this.AdList[e].gridAd.destroy(), this.AdList[e].gridAd = null, Be.I.adStat("grid", this.AdList[e].adUnitId, _.grid, S.interrupt),
                P && console.error("WxGrid - destory: " + this.AdList[e].adUnitId));
        }
        onLoad() {
            let e = He.I, t = e.gridAd;
            t && (P && console.error("WxGrid - onLoad: " + e.adUnitId), t.style.realHeight && (t.style.top = ke.I.winHeight - t.style.realHeight + e.bannerParams.offsetY,
                t.style.left = (ke.I.winWidth - t.style.realWidth) / 2), e.unbind(), e.resolve && e.resolve({
                    adUnitId: e.adUnitId,
                    scale: e.bannerScale,
                    width: t.style.realWidth / e.bannerScale,
                    height: t.style.realHeight / e.bannerScale
                }));
        }
        onError(e) {
            P && console.error("WxGrid - onError", e);
            let t = He.I;
            !t._isErrored && t.handleError(e, Object.assign(Object.assign({}, ge.BannerFail), {
                adUnitId: t.adUnitId
            }));
        }
        onResize() {
            let e = He.I, t = e.gridAd;
            t && (t.style.top = ke.I.winHeight - t.style.realHeight + e.bannerParams.offsetY,
                t.style.left = (ke.I.winWidth - t.style.realWidth) / 2);
        }
        handleShowError(e) {
            P && console.error("WxGrid - handleShowError", e);
            let t = He.I, { errCode: i, errMsg: s } = e;
            !t.isErrored && t.handleError(e, {
                code: i,
                msg: s
            });
        }
        handleError(e, t) {
            let i = He.I;
            i.unbind(), i.gridAd && i.gridAd.destroy(), i.gridAd = null, i._isErrored = !0,
                i.reject && i.reject(Object.assign(Object.assign({}, t), {
                    adUnitId: i.adUnitId
                })), Be.I.adStat("grid", i.adUnitId, _.grid, S.fail), P && console.error("WxGrid - onError: " + i.adUnitId);
        }
        unbind() {
            this.gridAd && (this.gridAd.offLoad(this.onLoad), this.gridAd.offError(this.onError),
                this.gridAd.offResize(this.onResize));
        }
        handleQueue(e) {
            let t = He.I;
            if (t.AdList[e].queue.length > 0) {
                t.AdList[e].isEnd = !1, t.AdList[e].queue.shift()();
            } else t.AdList[e].isEnd = !1;
        }
    }
    class Fe {
        constructor() {
            this.queue = [], this.isEnd = !1, this.adUnitId = "", this._isErrored = !1;
        }
        static get I() {
            return this.instance || (this.instance = new Fe());
        }
        get isErrored() {
            return this._isErrored;
        }
        create(e, t) {
            if (this.bannerParams = t || {}, this.bannerParams.adIntervals = this.bannerParams.adIntervals || 60,
                !this.customAd || !Fe.I.isEnd) return this.isEnd = !0, new Promise((i, s) => {
                    if (this.resolve = i, this.reject = s, this._isErrored = !1, this.adUnitId = e,
                        k.isEmpty(e)) return Fe.I.handleQueue(), this.reject(Object.assign(Object.assign({}, ge.BannerInvalid), {
                            adUnitId: this.adUnitId
                        }));
                    if (this.customAd) return void this.show(!1);
                    let a = {
                        top: t.top,
                        left: t.left
                    };
                    if (this.customAd = wx.createCustomAd({
                        adUnitId: e,
                        style: a,
                        adIntervals: this.bannerParams.adIntervals
                    }), Be.I.adStat("custom", this.adUnitId, _.custom, S.request), !this.customAd) return this.reject(Object.assign(Object.assign({}, ge.BannerNotOpen), {
                        adUnitId: this.adUnitId
                    }));
                    this.customAd.onLoad(this.onLoad), this.customAd.onClose(this.onClose), this.customAd.onError(this.onError);
                });
            Fe.I.queue.push(Fe.I.show.bind(Fe.I));
        }
        show(e = !0) {
            if (!Fe.I.isEnd || !e) return Fe.I.isEnd = !0, this.customAd ? (Be.I.adStat("custom", this.adUnitId, _.custom, S.show),
                this.customAd.show().then(e => {
                    Fe.I.handleQueue();
                }).catch(e => this.handleShowError(e)), P && console.error("WxCustom - show: " + this.adUnitId, this.customAd),
                !0) : (Fe.I.handleQueue(), !1);
            Fe.I.queue.push(Fe.I.show.bind(Fe.I));
        }
        hide() {
            let e = Fe.I;
            e.isEnd ? e.queue.push(e.hide.bind(e)) : (e.isEnd = !0, this.customAd && (this.customAd.hide(),
                Be.I.adStat("custom", e.adUnitId, _.custom, S.interrupt), P && console.error("WxCustom - hide: " + e.adUnitId)),
                e.handleQueue());
        }
        toggle(e) {
            e ? this.show() : this.hide();
        }
        destory() {
            this.customAd && (this.customAd.destroy(), this.customAd = null, Be.I.adStat("custom", this.adUnitId, _.custom, S.interrupt),
                P && console.error("WxCustom - destory: " + this.adUnitId));
        }
        onLoad() {
            let e = Fe.I;
            e.customAd && (e.show(!1), P && console.error("WxCustom - onLoad: " + e.adUnitId),
                e.unbind(), e.resolve && e.resolve({
                    adUnitId: e.adUnitId,
                    top: e.bannerParams.top,
                    left: e.bannerParams.left
                }));
        }
        onError(e) {
            P && console.error("WxCustom - onError", e);
            let t = Fe.I;
            !t._isErrored && t.handleError(e, Object.assign(Object.assign({}, ge.BannerFail), {
                adUnitId: t.adUnitId
            }));
        }
        onClose() {
            Fe.I.customAd = null, Be.I.dot("wxCustom_close");
        }
        handleShowError(e) {
            P && console.error("WxCustom - handleShowError", e);
            let t = Fe.I, { errCode: i, errMsg: s } = e;
            !t.isErrored && t.handleError(e, {
                code: i,
                msg: s
            });
        }
        handleError(e, t) {
            let i = Fe.I;
            i.unbind(), i._isErrored = !0, i.customAd && i.customAd.destroy(), i.customAd = null,
                i.handleQueue(), i.reject && i.reject(Object.assign(Object.assign({}, t), {
                    adUnitId: i.adUnitId
                })), Be.I.adStat("custom", this.adUnitId, _.custom, S.fail), P && console.error("WxCustom - onError: " + i.adUnitId);
        }
        unbind() {
            this.customAd && (this.customAd.offLoad(this.onLoad), this.customAd.offClose(this.onClose),
                this.customAd.offError(this.onError));
        }
        handleQueue() {
            let e = Fe.I;
            if (e.queue.length > 0) {
                e.isEnd = !1, e.queue.shift()();
            } else e.isEnd = !1;
        }
    }
    class ze {
        static initInterstitialAd(e = T.interstitialAdId) {
            this.interstitialAdId = e, this.createInterstitial();
        }
        static showInterstitialAd(e = T.interstitialAdId) {
            this.interstitialAdId = e, this.interstitialSuccell ? (this.interstitialAd.show(),
                window.__ytGameTimers.setTimeout(() => {
                    this.createInterstitial(!1);
                }, 5e3)) : this.createInterstitial(!0);
        }
        static createInterstitial(e = !1) {
            Be.I.adStat("InterstitialAd", this.interstitialAdId, _.interstitial, S.request),
                this.interstitialAd = De.I.createInterstitialAd(this.interstitialAdId), this.interstitialAd.onLoad(() => {
                    ze.interstitialSuccell = !0, Be.I.adStat("InterstitialAd", this.interstitialAdId, _.interstitial, S.rt),
                        e && (Be.I.adStat("InterstitialAd", this.interstitialAdId, _.interstitial, S.show),
                            this.interstitialAd.show());
                }), this.interstitialAd.onError(e => {
                    Be.I.adStat("InterstitialAd", this.interstitialAdId, _.interstitial, S.fail), ze.interstitialSuccell = !1;
                });
        }
    }
    ze.interstitialAdId = T.interstitialAdId, ze.interstitialSuccell = !1;
    class Ke {
        constructor() { }
        createBanner(e, t) {
            return Re.I.create(e, t);
        }
        showBanner() {
            Re.I.show();
        }
        hideBanner() {
            Re.I.hide();
        }
        destoryBanner() {
            Re.I.destory();
        }
        createInterstitialAd(e) {
            ze.showInterstitialAd(e);
        }
        createGrid(e, t, i) {
            return He.I.create(e, t, i);
        }
        showGrid(e) {
            He.I.show(e);
        }
        hideGrid(e) {
            He.I.hide(e);
        }
        destoryGrid(e) {
            He.I.destory(e);
        }
        createCustom(e, t) {
            return Fe.I.create(e, t);
        }
        showCustom() {
            Fe.I.show();
        }
        hideCustom() {
            Fe.I.hide();
        }
        destoryCustom() {
            Fe.I.destory();
        }
        navigateToMiniProgram(e, t, i) {
            let { id: s, appid: a, path: n, game: r } = e;
            return Be.I.jumps(s, t), n || (n = `?channel_id=${T.channel_id}`), De.I.navigateToMiniProgram(a, n, i);
        }
        static get I() {
            return this.instance || (this.instance = new Ke());
        }
    }
    class We {
        static get isWx() {
            return "undefined" != typeof wx;
        }
        static get data() {
            return me.I.Data;
        }
        static get share() {
            return Pe.I;
        }
        static get game() {
            return je.I;
        }
        static get ad() {
            return Ke.I;
        }
        static get stat() {
            return Be.I;
        }
        static get online() {
            return Ge.I;
        }
        static init() {
            return __awaiter(this, void 0, void 0, function* () {
                return this.isWx && (Me.I.init(), window.__ytGameTimers.setTimeout(() => {
                    ze.initInterstitialAd(), Pe.I.preloadVideo();
                }, 2e3)), yield this.game.env(), this.isWx && Pe.I.init(), Promise.resolve();
            });
        }
    }
    class Ye {
        static get isWx() {
            return "undefined" != typeof wx;
        }
        static get isSupported() {
            return "object" == typeof We;
        }
        static get envNum() {
            return We.data.envEnum;
        }
        static get data() {
            return We.data;
        }
        static get scene() {
            return We.data.scene;
        }
        static get uid() {
            return We.data.userId;
        }
        static get channel() {
            return We.data.channelId;
        }
        static get openId() {
            return We.data.openId;
        }
        static get isnew() {
            try {
                let e = Ee.today;
                return We.data.regTime === e;
            } catch (e) {
                return !1;
            }
        }
        static get isFirstLogin() {
            try {
                return 1 === We.data.isnew;
            } catch (e) {
                return !1;
            }
        }
        static isAfterTime(e) {
            try {
                let t = new Date(e).getTime();
                return new Date(`${We.data.regTime} 00:00:00`).getTime() >= t;
            } catch (e) {
                return !1;
            }
        }
        static createBanner(e = T.bannerId, t) {
            if (this.isWx) return We.ad.createBanner(e, t);
        }
        static showBanner() {
            this.isWx && We.ad.showBanner();
        }
        static hideBanner() {
            this.isWx && We.ad.hideBanner();
        }
        static destoryBanner() {
            this.isWx && We.ad.destoryBanner();
        }
        static createInterstitialAd(e = T.interstitialAdId) {
            this.isWx && We.ad.createInterstitialAd(e);
        }
        static createGrid(e, t = T.gridId, i) {
            if (this.isWx) return We.ad.createGrid(e, t, i);
        }
        static showGrid(e) {
            this.isWx && We.ad.showGrid(e);
        }
        static hideGrid(e) {
            this.isWx && We.ad.hideGrid(e);
        }
        static destoryGrid(e) {
            this.isWx && We.ad.destoryGrid(e);
        }
        static createCustom(e = T.customId, t) {
            if (this.isWx) return We.ad.createCustom(e, t);
        }
        static showCustom() {
            this.isWx && We.ad.showCustom();
        }
        static hideCustom() {
            this.isWx && We.ad.hideCustom();
        }
        static destoryCustom() {
            this.isWx && We.ad.destoryCustom();
        }
        static navigateToMiniProgram(e, t, i) {
            if (this.isWx) return We.ad.navigateToMiniProgram(e, t, i);
        }
        static subScribe(e, t) {
            if (this.isWx) return We.game.subScribe(e, t);
        }
        static login(e, t) {
            return We.game.login(e);
        }
        static saveData(e, t) {
            return We.game.saveData(e, t);
        }
        static getData(e) {
            return We.game.getData(e);
        }
        static rankAdd(e, t) {
            return We.game.rankAdd(e, t);
        }
        static updateRankData(e = {}) {
            let t = JSON.stringify(e);
            return We.game.saveData("rankData", t);
        }
        static rankList(e, t = 1, i = !1) {
            return this.isWx ? We.game.rankList(e, t, i) : Promise.resolve({
                code: -1
            });
        }
        static totalrankAdd(e, t, i = 0, s = 1) {
            return We.game.totalrankAdd(e, t, i, s);
        }
        static totalrankList(e, t = 0, i = !1, s = 1) {
            return this.isWx ? We.game.totalrankList(e, t, i, s) : Promise.resolve({
                code: -1
            });
        }
        static adList(e) {
            return this.isWx ? We.game.adList(e) : Promise.resolve({
                code: -1
            });
        }
        static addExposure(e, t) {
            return this.isWx ? We.stat.addExposure(e, t) : Promise.resolve({
                code: -1
            });
        }
        static updateOnlineParams() {
            return We.online.updateOnlineConfig();
        }
        static getParamsInt(e, t = 0) {
            return We.online.getParamsInt(e.toString(), t);
        }
        static getParamsObj(e, t = {}) {
            return We.online.getParamsObj(e.toString(), t);
        }
        static getParamsString(e, t = "") {
            return We.online.getParamsString(e.toString(), t);
        }
        static pay(e, t = {}) {
            return We.game.pay(e, t);
        }
        static orderQuery(e) {
            return We.game.orderQuery(e);
        }
        static role(e, t) {
            return We.stat.role(e, t);
        }
    }
    !function (e) {
        e.isOpenInterstitialAdId = "isOpenInterstitialAdId", e.shareRandom = "shareRandom",
            e.switch_draw = "switch_draw", e.switch_banner = "switch_banner", e.switch_grid = "switch_grid",
            e.calendar_level_max = "calendar_level_max", e.over_show_ad = "over_show_ad";
    }(_e || (_e = {}));
    var Xe = Laya.Browser.window.wx;
    class qe {
        constructor() {
            this.PixY = 2, this.login_count = 0, this.max_count = 0, this.bannerheight = 130,
                this.appId = s, this.miniID = a, this.apiUrl = o, this.clientVersion = d, this.config = {
                    box_info: []
                }, this.isExternal = !1, this.externalMiniID = r, this.externalDataServerUrl = r,
                this.externalServerUrl = h, this.isTT = !1, this.isBannerShowed = !1, this.isCheat = !1,
                this.isExportUser = !1, this.isChannelUser = !1, this.isCurIncrease = !1, this.gameName = n,
                this.isUma = !1, this.toggleBanner = !1, this.interstitialIDArr = [], this.interIdex = 0,
                this.gridArr = new Map(), this.isGridShow = !1, this.isfirstVideo = !0, this.navigateFailNum = 0,
                Xe && (this.system = Xe.getSystemInfoSync(), this.luach = Xe.getLaunchOptionsSync(),
                    this.PixY = Laya.stage.height / this.system.windowHeight), this.userInfo = {
                        openid: "",
                        session_key: "",
                        head_cookie: "",
                        inviter_id: "",
                        nickname: "",
                        headimgurl: "",
                        id: "",
                        is_new: !0,
                        area: ""
                    };
        }
        static get inst() {
            return qe._inst || (qe._inst = new qe()), qe._inst;
        }
        initzs(e = this.userInfo.openid) {
            const t = this;
            let i, s, a, n = Xe.getSystemInfoSync();
            s = n.brand + "-" + n.model, a = Xe.getLaunchOptionsSync(), this.stageId = a.scene;
            let r = a.referrerInfo || {}, o = a.query, h = r.appId || "";
            n.version;
            if (Xe.getNetworkType({
                success: s => {
                    i = s.networkType, c.init({
                        miniId: t.miniID,
                        openid: e
                    });
                }
            }), t.isExternal) {
                let i = {
                    application_id: t.externalMiniID,
                    version: t.clientVersion,
                    scene: a.scene,
                    openid: e,
                    share_id: o.share_id,
                    channel_id: o.channel_id,
                    scene_id: a.scene,
                    is_new: t.userInfo.is_new,
                    app_id: h
                };
                t.baseExternalRequest("GET", t.externalDataServerUrl + "Sdk/User/dauZs", i);
            }
        }
        baseExternalRequest(e, t, i, s = null, a = null) {
            const n = this;
            Xe && Xe.request({
                url: t,
                method: e,
                header: {
                    "content-type": "application/json",
                    cookie: n.userInfo.head_cookie,
                    version: n.clientVersion,
                    appid: this.appId
                },
                data: i,
                success(i) {
                    200 == i.data.code ? s && s(i.data, i.header) : (console.warn("baseRequest:" + e + ",url:" + t + ",code:" + i.data.code),
                        a && a(i));
                },
                fail() {
                    a && a("请求失败");
                }
            });
        }
        userLogin(e, t) {
            if (null == Xe) return e();
            const i = this;
            We.game.login(!1, {
                ip: !0
            }).then(t => {
                console.log(t), t.data.ip && (i.userInfo.area = t.data.ip.city), e && e(t);
            }).catch(() => {
                window.__ytGameTimers.setTimeout(() => {
                    i.login_count >= i.max_count ? t && t() : (i.userLogin(e, t), console.log("login_fail ===============> count: ", i.login_count),
                        i.login_count += 1);
                }, 300);
            });
        }
        getSetting(e, t, i) {
            const s = this;
            Laya.loader.load("https://wxsdk-cdn.miso-lab.com/highball/" + (1 == Ye.envNum ? "pre" : "data") + "/data.json", Laya.Handler.create(this, () => {
                var t = Laya.loader.getRes("https://wxsdk-cdn.miso-lab.com/highball/" + (1 == Ye.envNum ? "pre" : "data") + "/data.json");
                console.log("获取cdn数据", t), s.config = t.data, null == s.config.share_count && (s.config.share_count = 1),
                    null != t.data.ad_videoID && ("string" == typeof t.data.ad_videoID ? s.videoID = t.data.ad_videoID : "object" == typeof t.data.ad_videoID && t.data.ad_videoID.length > 0 && (s.videoID = t.data.ad_videoID[0])),
                    null != t.data.ad_bannerID && (s.bannerID = t.data.ad_bannerID), null != t.data.insertAdIds && (s.interstitialIDArr = t.data.insertAdIds),
                    e && e(t), i && i();
            }), null, Laya.Loader.JSON);
            let a = Xe.getLaunchOptionsSync(), n = (a.query, a.referrerInfo || {});
            if (n && n.appId && n.appId, s.isExternal) {
                let n = {
                    application_id: s.externalMiniID,
                    scene: a.scene || 0,
                    version: s.clientVersion
                };
                this.baseExternalRequest("GET", s.externalServerUrl + "/Home/Config/getConfigByZs", n, t => {
                    s.config = t.data, null != t.data.ad_videoID && (s.videoID = t.data.ad_videoID),
                        null != t.data.ad_bannerID && (s.bannerID = t.data.ad_bannerID), console.log("设置游戏数据成功", t.data),
                        e && e(t), i && i();
                }, e => {
                    t && t(e), i && i();
                });
            } else;
        }
        ttLogin(e, t) {
            const i = this;
            let s = {
                code: i.wxcode,
                anonymous_code: i.anonymousCode,
                sceneid: i.luach.scene
            };
            i.baseRequest("POST", "/user/login", JSON.stringify(s), (t, s) => {
                if (200 == t.code) {
                    for (var a in i.userInfo) a in t.data && (i.userInfo[a] = t.data[a]);
                    s["Set-Cookie"] ? i.userInfo.head_cookie = s["Set-Cookie"] : i.userInfo.head_cookie = s["set-cookie"],
                        console.log("登录成功:", i.userInfo, t), e && e(t);
                }
            }, e => {
                console.log(e), t && t();
            });
        }
        baseRequest(e, t, i, s, a) {
            const n = this;
            Xe && Xe.request({
                url: n.apiUrl + t,
                method: e,
                header: {
                    "content-type": "application/json",
                    cookie: n.userInfo.head_cookie,
                    version: n.clientVersion,
                    appid: n.appId
                },
                data: i,
                success(e) {
                    200 == e.data.code ? s && s(e.data, e.header) : a && a(e);
                },
                fail() {
                    a && a("登录失败");
                }
            });
        }
        createInterAd(e) {
            if (window.wx && window.wx.createInterstitialAd) {
                let t = this.interstitialIDArr[this.interIdex];
                this.interIdex = this.interIdex + 1 >= this.interstitialIDArr.length ? 0 : this.interIdex + 1,
                    this.interstitialAd = window.wx.createInterstitialAd({
                        adUnitId: t
                    });
                let i = () => {
                    this.interstitialAd.destroy(), this.interstitialAd.offLoad(), this.interstitialAd.offError(),
                        this.interstitialAd.offClose();
                };
                this.interstitialAd.onLoad(() => {
                    console.log("插屏 广告加载成功"), this.interstitialAd.show();
                }), this.interstitialAd.onError(t => {
                    console.log(" createInterstitialAd error", t), i(), e && e();
                }), this.interstitialAd.onClose(t => {
                    console.log("插屏 广告关闭"), i(), e && e();
                });
            }
        }
        getVideoIconVisible(e) {
            return !1;
        }
        canInsterAd(e) {
            return this.config.InsertArr[e] || 0;
        }
        getFloatBoxNum(e) {
            return this.config.floatAdNum[e] || 0;
        }
        createGrid(e, t) {
            if (window.wx) {
                const i = window.wx.createCustomAd({
                    adUnitId: e,
                    style: t
                }), s = () => {
                    i.offLoad(), i.offError();
                };
                i.onError(t => {
                    console.error("createGrid error", e, t), s();
                }), i.onLoad(t => {
                    console.log("createGrid success", e, t), s(), this.gridArr.set(e, i), this.isGridShow && i.show();
                });
            }
        }
        showGrid(e, t) {
            this.isGridShow = !0, this.gridArr.get(e) ? this.gridArr.get(e).show() : this.createGrid(e, t);
        }
        hideGrid() {
            this.isGridShow = !1, this.gridArr.forEach(e => {
                e.hide();
            });
        }
        getBoxInfo() {
            for (var e = 0; e < 21; ++e) {
                var t = {
                    appid: "wxf5aff0e346b14167",
                    banner_images: "https://oss.vipwzs.com/417/547/2019-11-04/30a9f7891e7e53c33f2f76cdfc771093.png",
                    banner_images1: [],
                    id: 189,
                    images: "gamebox/bg_hz.png",
                    images1: [],
                    images2: "",
                    is_banner: 0,
                    is_best: 0,
                    is_hot: 0,
                    is_multipoint: 1,
                    is_recommend: 1,
                    is_top: 0,
                    frame: 9,
                    name: "开心涂色球" + e,
                    navigate_type: 1,
                    pageimg: "",
                    path: "",
                    poster: "",
                    target_id: 0,
                    type: 2
                };
                this.config.box_info.push(t);
            }
            this.config.open_export = 1, this.config.open_ad_late = 1, this.config.open_tempGame = 0,
                this.config.player_type = 3, this.config.chest_adType = [1, 2, 1], this.config.bottom_goOnBtn_cz = 2,
                this.config.videoIcon = [1, 0, 0, 1, 0], this.config.exportListLength = 4, this.config.floatAdNum = [6, 4, 2],
                this.config.InsertArr = [0, 1, 1];
        }
        compareVersion(e) {
            let t = this.system.SDKVersion.split("."), i = e.split(".");
            const s = Math.max(t.length, i.length);
            for (; t.length < s;) t.push("0");
            for (; i.length < s;) i.push("0");
            for (let e = 0; e < s; e++) {
                const s = Math.floor(Number(t[e])), a = Math.floor(Number(i[e]));
                if (s > a) return 1;
                if (s < a) return -1;
            }
            return 0;
        }
        showToast(e = "提示", t = "none", i = 2e3) {
            // null != Xe ? Xe.showToast({
            //     title: e,
            //     icon: t,
            //     duration: i
            // }) : alert(e);
        }
        showAlert(e, t = "提示", i) {
            null != Xe && Xe.showModal({
                title: t,
                content: e,
                showCancel: !1,
                success(e) {
                    i && i(e);
                }
            });
        }
        showConfirm(e, t = "确认提醒", i, s, a = "确认") {
            null != Xe && Xe.showModal({
                title: t,
                content: e,
                showCancel: !0,
                confirmText: a,
                success(e) {
                    e.confirm ? i && i() : e.cancel && s && s();
                }
            });
        }
        getWxMenuPos() {
            if (Xe) {
                var e = Xe.getMenuButtonBoundingClientRect();
                let t = this.system.screenWidth, i = Laya.stage.width / t;
                return e.left *= i, e.bottom *= i, console.log(e), e;
            }
            return {
                bottom: 84,
                height: 32,
                left: 556,
                right: 365,
                top: 10,
                width: 87
            };
        }
        gc() {
            Xe && Xe.triggerGC();
        }
        vibrateFun(e, t = 0) {
            if (window.wx) if (e) Xe.vibrateLong({
                success: () => { },
                fail: () => { },
                complete: () => { }
            }); else if (0 == t) Xe.vibrateShort({
                success: () => { },
                fail: () => { },
                complete: () => { }
            }); else {
                let e = t / 15, i = 0, s = {
                    count: e,
                    index: i
                };
                Laya.timer.loop(16, s, function () {
                    this.vibrateFun(!1), ++i > e && Laya.timer.clearAll(s);
                });
            }
        }
        aldOnStart(e, t) {
            const i = this;
            i.isUma && 1 == this.config.open_ald_eventstat ? Xe.uma.stage.onStart({
                stageId: e,
                stageName: t
            }) : Xe && Xe.aldStage && Xe.aldStage.onStart && 1 == this.config.open_ald_eventstat && Xe.aldStage.onStart({
                stageId: e,
                stageName: t,
                userId: i.userInfo.id
            });
        }
        aldOnEnd(e, t, i, s) {
            const a = this;
            a.isUma && 1 == this.config.open_ald_eventstat ? Xe.uma.stage.onEnd({
                stageId: e,
                stageName: t,
                event: i
            }) : Xe && Xe.aldStage && Xe.aldStage.onEnd && 1 == this.config.open_ald_eventstat && Xe.aldStage.onEnd({
                stageId: e,
                stageName: t,
                userId: a.userInfo.id,
                event: i,
                params: {
                    desc: s
                }
            });
        }
        aldOnRunning(e, t = null, i = null, s = null) {
            const a = this;
            a.isUma && 1 == this.config.open_ald_eventstat ? Xe.uma.stage.onRunning({
                stageId: "stage1",
                stageName: "event",
                event: "award",
                params: e + ""
            }) : Xe && Xe.aldStage && Xe.aldStage.onRunning && 1 == this.config.open_ald_eventstat && Xe.aldStage.onRunning({
                stageId: e,
                stageName: t,
                userId: a.userInfo.id,
                event: i,
                params: {
                    itemName: s
                }
            });
        }
        clearAllTime() {
            Laya.timer.clearAll(this);
        }
        initBanner(e = !1) {
            null != this.bannerID ? this.bannerID.length <= 0 ? this.bannerAd = void 0 : g.Inst.init(this.bannerID, this.config.bannner_refresh_time, this.config.recreate_num) : this.bannerAd = void 0;
        }
        showBanner(t, i) {
            if (this.onBannerError = i, Xe) {
                console.debug("showBanner--- bannershow"), this.hideBanner();
                var s = !1;
                1 == this.config.open_ad_late && 1 == this.config.open_button_move_up && this.ranInt(0, 100) < this.config.bannerad_clikck_cover_percent && (s = !(this.isCheat && (Laya.timer.currTimer - this.isCheatTime) / 1e3 > this.config.bannerad_click_again_wd_time)),
                    e.before_pass_limit_ad && e.beforeGameUI && (s = !1), s && t ? (this.isCurIncrease = !0,
                        this.bannerMoveTop(t, () => {
                            this.bannershow();
                        }, !0)) : this.bannerMoveTop(t, () => {
                            this.bannershow();
                        }, !1);
            } else {
                (s = !0) && t && this.ranInt(0, 100) < 30 ? this.bannerMoveTop(t, () => {
                    this.bannershow();
                }, !0) : this.bannerMoveTop(t, () => {
                    this.bannershow();
                }, !1);
            }
        }
        bannerMoveTop(e, t, i = !1) {
            const s = this;
            let a = 0;
            if (i) {
                a = Laya.stage.height - 100, e.y = a, a = Laya.stage.height - (s.bannerheight + 15) * s.PixY;
                let i = s.config.button_wxad_show_time || 1, n = s.config.button_move_up_time || 1;
                Laya.timer.once(1e3 * parseInt(i), s, () => {
                    t && t(), s.bannerClcikTime = Laya.timer.currTimer;
                }), Laya.timer.once(1e3 * parseInt(n), s, () => {
                    Laya.Tween.to(e, {
                        y: a
                    }, 1e3, Laya.Ease.linearIn);
                });
            } else a = Laya.stage.height - (s.bannerheight + 20) * s.PixY, e && (e.y = a), t && t();
        }
        bannerVideoVisible(e) {
            dt.Inst.banner_video.visible = e;
        }
        bannershow() {
            if (!this.toggleBanner) return this.hideBanner(), void this.bannerVideoVisible(!0);
            g.Inst.showBanner();
        }
        hideBanner() {
            this.bannerVideoVisible(!1), g.Inst.hideBanner();
        }
        checkVideo() {
            this.videoID ? null == this.videoAd && Xe.createRewardedVideoAd && (this.videoAd = Xe.createRewardedVideoAd({
                adUnitId: this.videoID
            }), this.videoAd.onError(e => {
                console.log(e);
            })) : this.hasVideo = !1;
        }
        showVideo(e, t) {
            if (Xe) {
                if (this.checkVideo(), null == this.videoAd) return console.log("去分享"), void (1 == this.config.is_share ? this.share(e, t) : e && e());
                if (1 == this.config.is_share_ad) return console.log("强制分享"), void this.share(e, t);
                if (this.videoPlaying) return this.showToast("视频载入中");
                this.videoPlaying = !0;
                let i = s => {
                    this.videoAd.offClose(i), null == s || null == s.isEnded || 1 == s.isEnded ? (this.videoPlaying = !1,
                        e && e(), this.cancelClicked = !1) : (this.videoPlaying = !1, this.isfirstVideo ? 0 == this.config.closeVideo_action ? (this.showToast("你提前关闭了视频"),
                            t && t(), this.isfirstVideo = !1) : 1 == this.config.closeVideo_action ? (this.showVideo(e, t),
                                this.isfirstVideo = !1) : -1 == this.config.closeVideo_action && this.showVideo(e, t) : (this.showToast("你提前关闭了视频"),
                                    t && t(), this.isfirstVideo = !0), this.cancelClicked = !0), Laya.SoundManager.playMusic("Music/bgm.mp3", 0);
                };
                this.videoAd.onClose(i), this.videoAd.load().then(() => {
                    this.videoAd.show();
                }).catch(s => {
                    this.hasVideo = !1, this.videoPlaying = !1, console.log(s.errMsg, "视频广告出错"), this.videoAd.offClose(i),
                        1 == this.config.is_share ? this.share(e, t) : e && e();
                });
            } else e && e();
        }
        share(e, t) {
            const i = this;
            null != Xe && (i.before = new Date(), e ? (i.startShare = !0, i.successReward = null,
                i.successReward = e) : (i.startShare = !1, i.successReward = (() => { })), i.failShare = t,
                this.cancelClicked = !1, 0 != i.config.is_share ? i.shareStep1() : (this.shareFailStep1(i.successReward),
                    i.startShare = !1));
        }
        shareStep1() {
            Xe.shareAppMessage(this.getShareInfo());
        }
        getShareInfo(e = "") {
            const t = this;
            let i = 0;
            return t.config.share_info.length && (i = Math.floor(Math.random() * t.config.share_info.length)),
                null != t.config.share_info[i] ? {
                    title: t.config.share_info[i].title,
                    imageUrl: t.config.share_info[i].images,
                    query: "inviter_id=" + t.userInfo.id + "&share_id=" + t.config.share_info[i].id + "&inviter_openid=" + t.userInfo.openid,
                    ald_desc: e
                } : {
                    title: t.gameName,
                    imageUrl: "",
                    query: "inviter_id=" + t.userInfo.id + "&share_id=0"
                };
        }
        shareFailStep1(e) {
            // const t = this;
            // t.hasVideo && 1 != t.config.is_share_ad ? (console.log("重置看视频次数"), t.showVideo(() => {
            //     e(), console.log("分享关闭显示视频");
            // }, () => {
            //     Laya.timer.resume();
            // })) : e();
        }
        initShare() {
            // const e = this;
            // null != Xe && (Xe.updateShareMenu({
            //     withShareTicket: !0,
            //     success: () => { },
            //     fail: () => { },
            //     complete: () => { }
            // }), Xe.showShareMenu({
            //     withShareTicket: !0,
            //     success: () => { },
            //     fail: () => { },
            //     complete: () => { }
            // }), Xe.onShareAppMessage(() => e.getShareInfo()), Xe.onShow(t => {
            //     e.onShow(t), console.log("startShare" + e.startShare), e.startShare && e.shareCallback(() => {
            //         e.startShare = !1, e.successReward && e.successReward(), e.successReward = null,
            //             console.log("shareSuccess");
            //     }, () => {
            //         e.startShare = !1, Laya.timer.resume(), e.cancelClicked = !0, e.failShare && e.failShare(),
            //             e.failShare = null, console.log("sharefail");
            //     });
            // }), Xe.onHide(() => {
            //     console.log("onHide" + this.startShare), e.onHide();
            // }));
        }
        getReward(e, t) {
            if (null == Xe) return e();
            this.videoAd || "" != this.videoID ? (console.log("去视频"), this.showVideo(e, t)) : this.share(e, t);
        }
        onStartGame(e, t) {
            var i = this.ranInt(0, 100);
            i < t && 1 == this.config.open_ad_late ? (console.log("vidoe", i), this.getReward(() => {
                e();
            }, () => {
                e();
            })) : e();
        }
        onShow(e) {
            console.log("onshow------", e.scene), u.inst.event(u.ON_SHOW);
        }
        onHide() {
            const e = this;
            1 == e.isCurIncrease ? (Laya.timer.currTimer - e.bannerClcikTime) / 1e3 < e.config.bannerad_vaild_click_time ? (e.AldingRecord("假定骗点点击成功一次"),
                e.isCheat = !0, e.isCheatTime = Laya.timer.currTimer) : e.isCheat = !1 : e.isCheat = !1;
        }
        UmaSendEvent(e, t = null) {
            Xe && 1 == this.config.open_ald_eventstat && this.isUma && Xe.uma.trackEvent(e.toString(), t);
        }
        AldingRecord(e) {
            this.reportOp2Ald(e);
        }
        reportOp2Ald(e) {
            const t = this;
            Xe && 1 == this.config.open_ald_eventstat && Xe.aldSendEvent && (Xe.aldSendEvent(e),
                Xe.aldStage.onRunning({
                    stageId: 0,
                    stageName: t.gameName,
                    userId: t.userInfo.id,
                    event: "tools",
                    params: {
                        itemName: e
                    }
                }));
        }
        shareCallback(e, t) {
            const i = this;
            let s = ["分享失败，请重试", "请分享到不同的群", "本次分享无效，请分享到其他群"], a = Math.floor(3 * Math.random()), n = null != i.config.share_long_time ? i.config.share_long_time[0].time / 1e3 : 1, r = null != i.config.share_long_time ? i.config.share_long_time[1].time / 1e3 : 3, o = null != i.config.share_long_time ? i.config.share_long_time[0].probability : 0, h = null != i.config.share_long_time ? i.config.share_long_time[1].probability : 20, l = null != i.config.share_long_time ? i.config.share_long_time[2].probability : [80, 10, 50, 60], d = Math.floor(100 * Math.random()) + 1, c = i.getSecond1();
            if (console.log("nowShareTime=" + c), c < n) d < o ? (console.log(d + "<" + o),
                e && e()) : (console.log("直接失败"), i.showConfirm(s[a], "系统提示：", function () {
                    i.share(i.successReward, t);
                }, function () {
                    t && t();
                }, "分享到群")); else if (c < r) d < h ? (console.log(d + "<" + h), e && e()) : i.showConfirm(s[a], "系统提示：", function () {
                    i.share(i.successReward, t);
                }, function () {
                    t && t();
                }, "分享到群"); else {
                let n = l[i.shareRatio];
                console.log("range=" + d), console.log("rate=" + n), d <= n ? (console.log("分享大于3成功"),
                    e && e()) : (console.log("gailvjianceshibai"), i.showConfirm(s[a], "系统提示：", function () {
                        i.share(i.successReward, t);
                    }, function () {
                        t && t();
                    }, "分享到群")), i.shareRatio += 1, i.shareRatio >= l.length && (i.shareRatio = 0);
            }
        }
        getSecond1() {
            let e = (new Date().getTime() - this.before.getTime()) / 1e3;
            return Math.floor(e);
        }
        openMiniGame(e, t, i, s) {
            const a = this;
            if (Xe && null != e) if (this.navigateFailNum >= 5 && this.config.is_cancalNavigate) this.showVideo(t, i); else if (null != c && c.boxClick({
                id: e.id,
                images_id: e.images_id
            }), Xe.navigateToMiniProgram && 1 == e.navigate_type) Xe.navigateToMiniProgram({
                appId: e.appid,
                path: e.path,
                extraData: null,
                envVersion: "release",
                success() {
                    t && t(), null != c && c.boxStat({
                        id: e.id,
                        images_id: e.images_id
                    }), a.isExternal && a.externalBoxStat(e), qe.inst.AldingRecord(s + "icon点击成功");
                },
                fail(e) {
                    "navigateToMiniProgram:fail navigate ability banned!" == e.errMsg && (a.navigateFailNum = 5),
                        a.navigateFailNum += 1, console.log("openMiniGame失败回调", e), i && i();
                },
                complete: () => { }
            }); else {
                let n = e.poster;
                Xe.previewImage({
                    current: n,
                    urls: [n],
                    success() {
                        t && t(), null != c && c.boxStat({
                            id: e.id,
                            images_id: e.images_id
                        }), a.isExternal && a.externalBoxStat(e), qe.inst.AldingRecord(s + "icon点击成功");
                    },
                    fail() {
                        console.log("扫码openMiniGame失败回调"), i && i();
                    },
                    complete() { }
                });
            }
        }
        externalBoxStat(e) {
            let t = e.id;
            if (!t) return void console.error("统计->跳转ID为空");
            var i = Xe.getLaunchOptionsSync(), s = i.query;
            let a = {
                export_id: t,
                application_id: this.externalMiniID,
                version: this.clientVersion,
                scene: i.scene,
                openid: this.userInfo.openid,
                share_id: s.share_id || 0,
                channel_id: s.channel_id || "",
                scene_id: i.scene,
                is_new: this.userInfo.is_new,
                image_url: e.images
            };
            this.baseExternalRequest("GET", this.externalDataServerUrl + "/Sdk/User/exportZs", a, function (e) {
                console.log(e.msg);
            });
        }
        setKeepLight() {
            this.compareVersion("1.4.0") >= 0 && Xe.setKeepScreenOn({
                keepScreenOn: !0,
                success: () => { },
                fail: () => { },
                complete: () => { }
            });
        }
        saveLocalData(e, t) {
            Laya.LocalStorage.setItem(e, JSON.stringify(t));
        }
        fetchLocalData(e) {
            return Laya.LocalStorage.getItem(e) ? JSON.parse(Laya.LocalStorage.getItem(e)) : null;
        }
        removeLocalData() {
            Laya.LocalStorage.clear();
        }
        ranInt(e, t) {
            return Math.floor(Math.random() * (t - e + 1)) + e;
        }
        shuffleArray(e) {
            return e.sort((e, t) => Math.random() > .5 ? -1 : 1);
        }
        zIndexToTop(e, t) {
            if (0 != t) {
                let i = e[t];
                e.splice(t, 1), e.unshift(i);
            } else console.log("已经处于置顶");
        }
        zIndexToBottom(e, t) {
            if (t != e.length - 1) {
                let i = e[t];
                e.splice(t, 1), e.push(i);
            } else console.log("已经处于置底");
        }
        timeFormat(e = 0) {
            let t, i, s, a, n, r, o;
            return i = ("0" + ((t = new Date(new Date().getTime() + 24 * e * 3600 * 1e3)).getMonth() + 1)).slice(-2),
                s = ("0" + t.getDate()).slice(-2), a = ("0" + t.getHours()).slice(-2), n = ("0" + t.getMinutes()).slice(-2),
                r = ("0" + t.getSeconds()).slice(-2), o = `${t.getFullYear()}/${i}/${s} ${a}:${n}:${r}`;
        }
        secondFormat(e, t = !1) {
            let i = Math.floor(e), s = 0, a = 0;
            return i > 60 && (s = Math.floor(i / 60), i = Math.floor(i % 60), s > 60 && (a = Math.floor(s / 60),
                s = Math.floor(s % 60))), t ? {
                    hour: a = parseInt(("0" + a).slice(-2)),
                    minute: s = parseInt(("0" + s).slice(-2)),
                    second: i = parseInt(("0" + i).slice(-2))
                } : (s = parseInt(("0" + s).slice(-2))) + ":" + (i = parseInt(("0" + i).slice(-2)));
        }
        getSecond(e, t) {
            let i = (new Date(e).getTime() - new Date(t).getTime()) / 1e3;
            return Math.floor(i);
        }
        getDays(e, t) {
            return Math.floor(e.getTime() - t.getTime() / 864e5);
        }
        filterStr(e) {
            let t = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？%+_]"), i = "";
            for (let s = 0; s < e.length; s++) i += e.substr(s, 1).replace(t, "");
            return i;
        }
        unitsNumber(e = 0) {
            if (0 == (e = Math.floor(e))) return 0;
            let t = Math.floor(Math.log(e) / Math.log(1e3)), i = e / Math.pow(1e3, t);
            return 0 === t ? i : (i = parseInt(i.toFixed(3)), (i = parseInt(i.toString().substring(0, i.toString().lastIndexOf(".") + 2))) + ["", "k", "m", "b", "f", "e", "ae", "be", "ce", "de", "ee", "fe", "ge", "he", "ie"][t]);
        }
    }
    var $e = Laya.Browser.window.wx;
    class Qe {
        constructor() {
            this.CustomIdex = 0, this.isCustomShow = !1, this.customId = []
            // this.system = $e.getSystemInfoSync();
        }
        static get Inst() {
            return Qe._inst || (Qe._inst = new Qe()), Qe._inst;
        }
        init(e, t) {
            this.CustomList = [], this.CustomIdex = 0, this.isCustomShow = !1, this.customId = e,
                this.seconds = t, this.curSecond = 0;
        }
        creatCustomAd(e, t) {
            let i = {
                customID: e,
                customAd: null,
                style: t
            };
            const s = $e.createCustomAd({
                adUnitId: e,
                style: t
            });
            s.onLoad(() => {
                this.isCustomShow && s.show(), i.customAd = s, -1 == this.CustomList.indexOf(i) && this.CustomList.push(i);
            }), s.onError(e => {
                console.log("createCustomAd error", e), -1 == this.CustomList.indexOf(i) && this.CustomList.push(i);
            });
        }
        showCustom() {
            // if (this.isCustomShow = !0, this.CustomList && 0 == this.CustomList.length) {
            //     const e = {
            //         left: 20,
            //         top: this.getWxMenuPos().top + 200
            //     }, t = this.customId && this.customId[0];
            //     t && this.creatCustomAd(t, e);
            //     const i = {
            //         left: this.system.windowWidth - 80,
            //         top: this.getWxMenuPos().top + 200
            //     }, s = this.customId && this.customId[1];
            //     s && this.creatCustomAd(s, i);
            //     const a = {
            //         left: (this.system.windowWidth - 360) / 2,
            //         top: this.getWxMenuPos().top
            //     }, n = qe.inst.config.customUI && qe.inst.config.customUI[0];
            //     n && this.creatCustomAd(n, a);
            // } else for (let e = 0; e < this.CustomList.length; e++) {
            //     let t = this.CustomList[e];
            //     t && t.customAd ? t.customAd.isShow() || t.customAd.show() : (t && this.creatCustomAd(t.customID, t.style), 
            //     this.CustomList[e] = null);
            // }
        }
        hideCustom() {
            if (!this.CustomList || 0 != this.CustomList.length) {
                for (let e in this.CustomList) {
                    let t = this.CustomList[e];
                    t && t.customAd && t.customAd.hide();
                }
                this.isCustomShow = !1;
            }
        }
        getWxMenuPos() {
            if ($e) {
                var e = $e.getMenuButtonBoundingClientRect();
                let t = this.system.screenWidth, i = Laya.stage.width / t;
                return e.left *= i, e.bottom *= i, e;
            }
            return {
                bottom: 84,
                height: 32,
                left: 556,
                right: 365,
                top: 10,
                width: 87
            };
        }
    }
    var Ze, Je, et, tt, it = Laya.Scene, st = Laya.ClassUtils.regClass;
    !function (e) {
        !function (e) {
            class t extends it {
                constructor() {
                    super();
                }
                createChildren() {
                    super.createChildren(), this.createView(t.uiView);
                }
            }
            //那就吃大鱼吧
            //gamesceneui
            t.uiView = {
                "x": 0,
                "type": "Scene",
                "selectedBox": 111,
                "selecteID": 693,
                "searchKey": "Scene",
                "props": { "width": 750, "runtime": "game/manager/UIManager.ts", "positionVariance_0": 100, "maxPartices": 100, "height": 1624 },
                "nodeParent": -1,
                "maxID": 694,
                "loadList3D": [
                ],
                "loadList": [
                    "ui/ksyx_icom.png",
                    "ui/ksyx.png",
                    "ui/pf_sp.png",
                    "ui/ljsy_icon.png",
                    "ui/gdhw.png",
                    "ui/sc_icon.png",
                    "ui/gk_dk.png",
                    "ui/gk_sz.png",
                    "ui/gk_dg.png",
                    "ui/ksdj.png",
                    "ui/jdt_01.png",
                    "ui/jdt_02.png",
                    "ui/BG.png",
                    "tbox/light.png",
                    "tbox/chest1.png",
                    "tbox/bt.png",
                    "tbox/kdzl.png",
                    "tbox/txt.png",
                    "tbox/jd.png",
                    "tbox/txt-sm.png",
                    "gamebox/frame_game4_1.png",
                    "gamebox/bg_hz.png",
                    "gamebox/frame_game4_2.png",
                    "gamebox/point.sk",
                    "gamebox/ico_game.png",
                    "gamebox/tit_rmtj.png",
                    "ui/tit_jxyx.png",
                    "gamebox/ico_new.png",
                    "load/bg.jpg",
                    "skin/bg_02.png",
                    "skin/jx_01.png",
                    "skin/1.png",
                    "skin/jx_03.png",
                    "skin/？.png",
                    "skin/√.png",
                    "skin/jbgm_icon.png",
                    "skin/jb.png",
                    "skin/sz.png",
                    "skin/gkhq_icon.png",
                    "skin/gkhq_hqjb.png",
                    "skin/fh_icon.png",
                    "ui/jb_dk.png",
                    "ui/jb.png",
                    "gamebox/tit_sl.png",
                    "gamebox/but.png",
                    "gamebox/font_xyg.png",
                    "ui/fhdjs.png",
                    "ui/fhdjs_sz.png",
                    "ui/ljfh.png",
                    "ui/ljfh_fqjh.png",
                    "ui/pfsy.png",
                    "ui/tx_01.png",
                    "ui/tx_02.png",
                    "ui/tx_03.png",
                    "ui/ljsy.png",
                    "ui/bj.jpg",
                    "ui/jxyx.png",
                    "ui/sl_gx.png",
                    "ui/sl_d.png",
                    "ui/sl_bt.png",
                    "ui/sb_gx.png",
                    "ui/sb_d.png",
                    "ui/sb.png",
                    "comp/vscroll.png",
                    "ui/icon.png",
                    "ui/icon_choice_bg.png",
                    "ui/icon_choice.png",
                    "ui/jxyx_icon.png",
                    "gamebox/but3.png",
                    "gamebox/btn_djqw.png",
                    "ui/banner_bg.png",
                    "ui/banner_hand1.png",
                    "ui/banner_hand.png"],
                "label": "Scene",
                "isOpen": true,
                "isDirectory": true,
                "isAniNode": true,
                "hasChild": true,
                "compId": 1,
                "child": [
                    {
                        "x": 15,
                        "type": "Box",
                        "searchKey": "Box,scnew3d",
                        "props": { "var": "scnew3d" },
                        "nodeParent": 1,
                        "label": "scnew3d",
                        "isOpen": false,
                        "isDirectory": true,
                        "isAniNode": true,
                        "hasChild": true,
                        "compId": 21,
                        "child": [
                            {
                                "type": "Script",
                                "switchAble": true,
                                "source": "src/game/script/MainScene.ts",
                                "searchKey": "Script,MainScene",
                                "removeAble": true,
                                "props": { "runtime": "game/script/MainScene.ts" },
                                "nodeParent": 21,
                                "label": "MainScene",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 307,
                                "child": [
                                ]
                            }]
                    },
                    {
                        "x": 15,
                        "type": "Box",
                        "searchKey": "Box,homeUI",
                        "props": { "y": 0, "x": 0, "top": 0, "right": 0, "name": "homeUI", "left": 0, "bottom": 0, "anchorY": 0 },
                        "nodeParent": 1,
                        "label": "homeUI",
                        "isOpen": true,
                        "isDirectory": true,
                        "isAniNode": true,
                        "hasChild": true,
                        "compId": 111,
                        "child": [
                            {
                                "x": 30,
                                "type": "Button",
                                "searchKey": "Button,startGame",
                                "props": { "width": 396, "stateNum": 1, "skin": "ui/ksyx_icom.png", "name": "startGame", "height": 131, "centerX": 0, "bottom": 430, "anchorY": 1, "anchorX": 0.5 },
                                "nodeParent": 111,
                                "label": "startGame",
                                "isOpen": false,
                                "isDirectory": true,
                                "isAniNode": true,
                                "hasChild": true,
                                "compId": 144,
                                "child": [
                                    {
                                        "type": "Sprite",
                                        "searchKey": "Sprite",
                                        "props": { "y": 34.5, "x": 116, "texture": "ui/ksyx.png" },
                                        "nodeParent": 144,
                                        "label": "Sprite",
                                        "isDirectory": false,
                                        "isAniNode": true,
                                        "hasChild": false,
                                        "compId": 552,
                                        "child": [
                                        ]
                                    },
                                    {
                                        "type": "Sprite",
                                        "searchKey": "Sprite,icon",
                                        "props": { "y": 55, "x": 597, "visible": false, "texture": "ui/pf_sp.png", "name": "icon" },
                                        "nodeParent": 144,
                                        "label": "icon",
                                        "isDirectory": false,
                                        "isAniNode": true,
                                        "hasChild": false,
                                        "compId": 671,
                                        "child": [
                                        ]
                                    }]
                            },
                            {
                                "x": 30,
                                "type": "Script",
                                "switchAble": true,
                                "source": "src/view/HomeUI.ts",
                                "searchKey": "Script,HomeUI",
                                "removeAble": true,
                                "props": { "runtime": "view/HomeUI.ts" },
                                "nodeParent": 111,
                                "label": "HomeUI",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 202,
                                "child": [
                                ]
                            },
                            {
                                "x": 30,
                                "type": "Image",
                                "searchKey": "Image,moreGame",
                                "props": { "skin": "ui/ljsy_icon.png", "name": "moreGame", "centerX": 0, "bottom": 290, "anchorY": 0.5, "anchorX": 0.5 },
                                "nodeParent": 111,
                                "label": "moreGame",
                                "isOpen": null,
                                "isDirectory": true,
                                "isAniNode": true,
                                "hasChild": true,
                                "compId": 413,
                                "child": [
                                    {
                                        "type": "Sprite",
                                        "searchKey": "Sprite",
                                        "props": { "y": 39, "x": 56, "texture": "ui/gdhw.png" },
                                        "nodeParent": 413,
                                        "label": "Sprite",
                                        "isDirectory": false,
                                        "isAniNode": true,
                                        "hasChild": false,
                                        "compId": 412,
                                        "child": [
                                        ]
                                    }]
                            },
                            {
                                "x": 30,
                                "type": "Image",
                                "searchKey": "Image,shop",
                                "props": { "skin": "ui/sc_icon.png", "name": "shop", "left": 39, "bottom": 299 },
                                "nodeParent": 111,
                                "label": "shop",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 555,
                                "child": [
                                ]
                            },
                            {
                                "x": 30,
                                "type": "Image",
                                "searchKey": "Image,logo",
                                "props": { "y": 132, "x": 156, "skin": "load/logo.png", "name": "logo" },
                                "nodeParent": 111,
                                "label": "logo",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 688,
                                "child": [
                                ]
                            },
                            {
                                "x": 30,
                                "type": "Image",
                                "searchKey": "Image,onSoundBtn",
                                "props": { "y": 142, "x": 50, "scaleY": 0.6, "scaleX": 0.6, "name": "onSoundBtn" },
                                "nodeParent": 111,
                                "label": "onSoundBtn",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 693,
                                "child": [
                                ]
                            }]
                    },
                    {
                        "x": 15,
                        "type": "Box",
                        "searchKey": "Box,gameUI",
                        "props": { "y": 0, "x": 0, "visible": false, "top": 0, "right": 0, "name": "gameUI", "left": 0, "bottom": 0 },
                        "nodeParent": 1,
                        "label": "gameUI",
                        "isOpen": false,
                        "isDirectory": true,
                        "isAniNode": true,
                        "hasChild": true,
                        "compId": 112,
                        "child": [
                            {
                                "type": "Script",
                                "switchAble": true,
                                "source": "src/view/GameUI.ts",
                                "searchKey": "Script,GameUI",
                                "removeAble": true,
                                "props": { "runtime": "view/GameUI.ts" },
                                "nodeParent": 112,
                                "label": "GameUI",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 186,
                                "child": [
                                ]
                            },
                            {
                                "type": "Image",
                                "searchKey": "Image,sp",
                                "props": { "top": 80, "skin": "ui/gk_dk.png", "name": "sp", "centerX": 0 },
                                "nodeParent": 112,
                                "label": "sp",
                                "isOpen": true,
                                "isDirectory": true,
                                "isAniNode": true,
                                "hasChild": true,
                                "compId": 429,
                                "child": [
                                    {
                                        "type": "FontClip",
                                        "searchKey": "FontClip,level",
                                        "props": { "y": 17.5, "x": 202, "width": 50, "value": "10", "spaceX": -15, "skin": "ui/gk_sz.png", "sheet": "0123456789", "pivotX": 25, "name": "level", "height": 50, "align": "center" },
                                        "nodeParent": 429,
                                        "label": "level",
                                        "isDirectory": false,
                                        "isAniNode": true,
                                        "hasChild": false,
                                        "compId": 553,
                                        "child": [
                                        ]
                                    },
                                    {
                                        "type": "Sprite",
                                        "searchKey": "Sprite",
                                        "props": { "y": 21, "x": 64, "texture": "ui/gk_dg.png", "scaleY": 0.7, "scaleX": 0.7 },
                                        "nodeParent": 429,
                                        "label": "Sprite",
                                        "isDirectory": false,
                                        "isAniNode": true,
                                        "hasChild": false,
                                        "compId": 554,
                                        "child": [
                                        ]
                                    }]
                            }]
                    },
                    {
                        "x": 15,
                        "type": "Box",
                        "searchKey": "Box,sceneLate2",
                        "props": { "y": 0, "x": 0, "visible": false, "top": 0, "right": 0, "name": "sceneLate2", "left": 0, "bottom": 0 },
                        "nodeParent": 1,
                        "label": "sceneLate2",
                        "isOpen": false,
                        "isDirectory": true,
                        "isAniNode": true,
                        "hasChild": true,
                        "compId": 592,
                        "child": [
                            {
                                "type": "Image",
                                "searchKey": "Image,sp",
                                "props": { "y": 0, "x": 0, "top": 80, "skin": "ui/gk_dk.png", "name": "sp", "centerX": 0 },
                                "nodeParent": 592,
                                "label": "sp",
                                "isOpen": null,
                                "isDirectory": true,
                                "isAniNode": true,
                                "hasChild": true,
                                "compId": 594,
                                "child": [
                                    {
                                        "type": "FontClip",
                                        "searchKey": "FontClip,level",
                                        "props": { "y": 15, "x": 146, "width": 50, "value": "10", "spaceX": -15, "skin": "ui/gk_sz.png", "sheet": "0123456789", "pivotX": 25, "name": "level", "height": 50, "align": "center" },
                                        "nodeParent": 594,
                                        "label": "level",
                                        "isDirectory": false,
                                        "isAniNode": true,
                                        "hasChild": false,
                                        "compId": 595,
                                        "child": [
                                        ]
                                    },
                                    {
                                        "type": "Sprite",
                                        "searchKey": "Sprite",
                                        "props": { "y": 15, "x": 86, "texture": "ui/gk_dg.png" },
                                        "nodeParent": 594,
                                        "label": "Sprite",
                                        "isDirectory": false,
                                        "isAniNode": true,
                                        "hasChild": false,
                                        "compId": 596,
                                        "child": [
                                        ]
                                    }]
                            },
                            {
                                "type": "Image",
                                "searchKey": "Image,clickBtn",
                                "props": { "skin": "ui/ljsy_icon.png", "name": "clickBtn", "centerX": 0, "bottom": 100 },
                                "nodeParent": 592,
                                "label": "clickBtn",
                                "isOpen": null,
                                "isDirectory": true,
                                "isAniNode": true,
                                "hasChild": true,
                                "compId": 597,
                                "child": [
                                    {
                                        "type": "Sprite",
                                        "searchKey": "Sprite",
                                        "props": { "y": 31, "x": 37, "texture": "ui/ksdj.png" },
                                        "nodeParent": 597,
                                        "label": "Sprite",
                                        "isDirectory": false,
                                        "isAniNode": true,
                                        "hasChild": false,
                                        "compId": 598,
                                        "child": [
                                        ]
                                    },
                                    {
                                        "type": "Sprite",
                                        "searchKey": "Sprite,icon",
                                        "props": { "y": 41, "x": 283, "texture": "ui/pf_sp.png", "name": "icon" },
                                        "nodeParent": 597,
                                        "label": "icon",
                                        "isDirectory": false,
                                        "isAniNode": true,
                                        "hasChild": false,
                                        "compId": 679,
                                        "child": [
                                        ]
                                    }]
                            },
                            {
                                "type": "Image",
                                "searchKey": "Image,process",
                                "props": { "x": 0, "skin": "ui/jdt_01.png", "name": "process", "centerX": 0, "bottom": 300 },
                                "nodeParent": 592,
                                "label": "process",
                                "isOpen": null,
                                "isDirectory": true,
                                "isAniNode": true,
                                "hasChild": true,
                                "compId": 599,
                                "child": [
                                    {
                                        "type": "Image",
                                        "searchKey": "Image,value",
                                        "props": { "y": 4, "x": 4, "width": 455, "skin": "ui/jdt_02.png", "name": "value" },
                                        "nodeParent": 599,
                                        "label": "value",
                                        "isDirectory": false,
                                        "isAniNode": true,
                                        "hasChild": false,
                                        "compId": 600,
                                        "child": [
                                        ]
                                    }]
                            },
                            {
                                "type": "Script",
                                "switchAble": true,
                                "source": "src/view/SceneLateUI1.ts",
                                "searchKey": "Script,SceneLateUI1",
                                "removeAble": true,
                                "props": { "runtime": "view/SceneLateUI1.ts" },
                                "nodeParent": 592,
                                "label": "SceneLateUI1",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 643,
                                "child": [
                                ]
                            }]
                    },
                    {
                        "x": 15,
                        "type": "Box",
                        "searchKey": "Box,hitBoxUI2",
                        "props": { "y": 0, "x": 0, "visible": false, "top": 0, "right": 0, "name": "hitBoxUI2", "left": 0, "bottom": 0 },
                        "nodeParent": 1,
                        "label": "hitBoxUI2",
                        "isOpen": false,
                        "isDirectory": true,
                        "isAniNode": true,
                        "hasChild": true,
                        "compId": 330,
                        "child": [
                            {
                                "type": "Image",
                                "searchKey": "Image",
                                "props": { "top": 0, "skin": "ui/BG.png", "right": 0, "left": 0, "bottom": 0 },
                                "nodeParent": 330,
                                "label": "Image",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 344,
                                "child": [
                                ]
                            },
                            {
                                "type": "Box",
                                "searchKey": "Box,page1",
                                "props": { "visible": false, "top": 0, "right": 0, "name": "page1", "left": 0, "bottom": 0 },
                                "nodeParent": 330,
                                "label": "page1",
                                "isOpen": null,
                                "isDirectory": true,
                                "isAniNode": true,
                                "hasChild": true,
                                "compId": 345,
                                "child": [
                                    {
                                        "type": "Image",
                                        "searchKey": "Image,light",
                                        "props": { "y": 650, "x": 375, "skin": "tbox/light.png", "name": "light", "anchorY": 0.5, "anchorX": 0.5 },
                                        "nodeParent": 345,
                                        "label": "light",
                                        "isDirectory": false,
                                        "isAniNode": true,
                                        "hasChild": false,
                                        "compId": 346,
                                        "child": [
                                        ]
                                    },
                                    {
                                        "type": "Image",
                                        "searchKey": "Image,chest",
                                        "props": { "y": 650, "x": 375, "skin": "tbox/chest1.png", "scaleY": 1, "scaleX": 1, "name": "chest", "anchorY": 0.5, "anchorX": 0.5 },
                                        "nodeParent": 345,
                                        "label": "chest",
                                        "isDirectory": false,
                                        "isAniNode": true,
                                        "hasChild": false,
                                        "compId": 347,
                                        "child": [
                                        ]
                                    },
                                    {
                                        "type": "Box",
                                        "searchKey": "Box,hitbox1bottom",
                                        "props": { "y": 1624, "x": 0, "width": 750, "name": "hitbox1bottom", "height": 400, "anchorY": 1 },
                                        "nodeParent": 345,
                                        "label": "hitbox1bottom",
                                        "isDirectory": true,
                                        "isAniNode": true,
                                        "hasChild": true,
                                        "compId": 348,
                                        "child": [
                                            {
                                                "type": "Image",
                                                "searchKey": "Image,Btn_Click",
                                                "props": { "y": 250, "x": 375, "skin": "tbox/bt.png", "scaleY": 1, "scaleX": 1, "name": "Btn_Click", "anchorY": 0.5, "anchorX": 0.5 },
                                                "nodeParent": 348,
                                                "label": "Btn_Click",
                                                "isDirectory": true,
                                                "isAniNode": true,
                                                "hasChild": true,
                                                "compId": 349,
                                                "child": [
                                                    {
                                                        "type": "Image",
                                                        "searchKey": "Image",
                                                        "props": { "y": -97, "x": 331, "skin": "tbox/kdzl.png" },
                                                        "nodeParent": 349,
                                                        "label": "Image",
                                                        "isDirectory": false,
                                                        "isAniNode": true,
                                                        "hasChild": false,
                                                        "compId": 350,
                                                        "child": [
                                                        ]
                                                    },
                                                    {
                                                        "type": "Sprite",
                                                        "searchKey": "Sprite,icon",
                                                        "props": { "y": 26.5, "x": 277, "texture": "ui/pf_sp.png", "name": "icon" },
                                                        "nodeParent": 349,
                                                        "label": "icon",
                                                        "isDirectory": false,
                                                        "isAniNode": true,
                                                        "hasChild": false,
                                                        "compId": 672,
                                                        "child": [
                                                        ]
                                                    }]
                                            }]
                                    },
                                    {
                                        "type": "Sprite",
                                        "searchKey": "Sprite,title",
                                        "props": { "y": 150, "x": 156, "texture": "tbox/txt.png", "name": "title" },
                                        "nodeParent": 345,
                                        "label": "title",
                                        "isDirectory": false,
                                        "isAniNode": true,
                                        "hasChild": false,
                                        "compId": 351,
                                        "child": [
                                        ]
                                    },
                                    {
                                        "type": "ProgressBar",
                                        "searchKey": "ProgressBar,Pro_Value",
                                        "props": { "y": 950, "x": 136, "value": 0, "skin": "tbox/jd.png", "scaleY": 1, "scaleX": 1, "name": "Pro_Value" },
                                        "nodeParent": 345,
                                        "label": "Pro_Value",
                                        "isDirectory": false,
                                        "isAniNode": true,
                                        "hasChild": false,
                                        "compId": 352,
                                        "child": [
                                        ]
                                    },
                                    {
                                        "type": "Sprite",
                                        "searchKey": "Sprite,tip",
                                        "props": { "y": 1050, "x": 164, "texture": "tbox/txt-sm.png", "name": "tip" },
                                        "nodeParent": 345,
                                        "label": "tip",
                                        "isDirectory": false,
                                        "isAniNode": true,
                                        "hasChild": false,
                                        "compId": 353,
                                        "child": [
                                        ]
                                    }]
                            },
                            {
                                "type": "Script",
                                "switchAble": true,
                                "source": "src/view/HitBoxUI2.ts",
                                "searchKey": "Script,HitBoxUI2",
                                "removeAble": true,
                                "props": { "runtime": "view/HitBoxUI2.ts" },
                                "nodeParent": 330,
                                "label": "HitBoxUI2",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 354,
                                "child": [
                                ]
                            }]
                    },
                    {
                        "x": 15,
                        "type": "Box",
                        "searchKey": "Box,gameExport1",
                        "props": { "y": 0, "x": 0, "visible": false, "var": "gameExport1", "top": 0, "right": 0, "left": 0, "bottom": 0, "bgColor": "#617EDB" },
                        "nodeParent": 1,
                        "label": "gameExport1",
                        "isOpen": false,
                        "isDirectory": true,
                        "isAniNode": true,
                        "hasChild": true,
                        "compId": 331,
                        "child": [
                            {
                                "type": "List",
                                "searchKey": "List,list",
                                "props": { "y": 115, "x": 50, "width": 656, "spaceY": 24, "spaceX": 62, "repeatY": 3, "repeatX": 2, "name": "list", "height": 1145 },
                                "nodeParent": 331,
                                "label": "list",
                                "isOpen": null,
                                "isDirectory": true,
                                "isAniNode": true,
                                "hasChild": true,
                                "compId": 355,
                                "child": [
                                    {
                                        "type": "Sprite",
                                        "searchKey": "Sprite",
                                        "props": { "texture": "gamebox/frame_game4_1.png", "renderType": "render" },
                                        "nodeParent": 355,
                                        "label": "Sprite",
                                        "isDirectory": true,
                                        "isAniNode": false,
                                        "hasChild": true,
                                        "compId": 356,
                                        "child": [
                                            {
                                                "type": "Clip",
                                                "searchKey": "Clip,Pic",
                                                "props": { "y": 10, "x": 10, "width": 274, "skin": "gamebox/bg_hz.png", "name": "Pic", "height": 274 },
                                                "nodeParent": 356,
                                                "label": "Pic",
                                                "isDirectory": false,
                                                "isAniNode": false,
                                                "hasChild": false,
                                                "compId": 357,
                                                "child": [
                                                ]
                                            },
                                            {
                                                "type": "Sprite",
                                                "searchKey": "Sprite",
                                                "props": { "y": 284, "x": 10, "width": 274, "texture": "gamebox/frame_game4_2.png", "height": 70 },
                                                "nodeParent": 356,
                                                "label": "Sprite",
                                                "isDirectory": false,
                                                "isAniNode": false,
                                                "hasChild": false,
                                                "compId": 358,
                                                "child": [
                                                ]
                                            },
                                            {
                                                "type": "Text",
                                                "searchKey": "Text,Name",
                                                "props": { "y": 304, "x": 147, "width": 271, "valign": "middle", "text": "天天斗地主", "runtime": "Laya.Text", "pivotX": 136, "name": "Name", "height": 32, "fontSize": 32, "color": "#000000", "bold": true, "align": "center" },
                                                "nodeParent": 356,
                                                "label": "Name",
                                                "isDirectory": false,
                                                "isAniNode": false,
                                                "hasChild": false,
                                                "compId": 359,
                                                "child": [
                                                ]
                                            },
                                            {
                                                "type": "SkeletonPlayer",
                                                "searchKey": "SkeletonPlayer,point",
                                                "props": { "y": 254, "x": 217, "visible": false, "url": "gamebox/point.sk", "runtime": "Laya.Skeleton", "name": "point" },
                                                "nodeParent": 356,
                                                "label": "point",
                                                "isDirectory": false,
                                                "isAniNode": false,
                                                "hasChild": false,
                                                "compId": 360,
                                                "child": [
                                                ]
                                            }]
                                    }]
                            },
                            {
                                "type": "Sprite",
                                "searchKey": "Sprite",
                                "props": { "y": 48, "x": 248, "texture": "gamebox/ico_game.png" },
                                "nodeParent": 331,
                                "label": "Sprite",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 361,
                                "child": [
                                ]
                            },
                            {
                                "type": "Sprite",
                                "searchKey": "Sprite",
                                "props": { "y": 56, "x": 329, "texture": "gamebox/tit_rmtj.png" },
                                "nodeParent": 331,
                                "label": "Sprite",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 362,
                                "child": [
                                ]
                            },
                            {
                                "type": "Image",
                                "searchKey": "Image,Btn_back",
                                "props": { "y": 1371, "text": "继续游戏", "skin": "ui/ljsy_icon.png", "name": "Btn_back", "fontSize": 48, "font": "Microsoft YaHei", "color": "#ffffff", "centerX": 0, "bold": true, "anchorY": 1 },
                                "nodeParent": 331,
                                "label": "Btn_back",
                                "isOpen": null,
                                "isDirectory": true,
                                "isAniNode": true,
                                "hasChild": true,
                                "compId": 363,
                                "child": [
                                    {
                                        "type": "Sprite",
                                        "searchKey": "Sprite",
                                        "props": { "y": 22, "x": 38, "texture": "ui/tit_jxyx.png" },
                                        "nodeParent": 363,
                                        "label": "Sprite",
                                        "isDirectory": false,
                                        "isAniNode": true,
                                        "hasChild": false,
                                        "compId": 364,
                                        "child": [
                                        ]
                                    }]
                            },
                            {
                                "type": "Script",
                                "switchAble": true,
                                "source": "src/view/gameExport1.ts",
                                "searchKey": "Script,gameExport1",
                                "removeAble": true,
                                "props": { "runtime": "view/gameExport1.ts" },
                                "nodeParent": 331,
                                "label": "gameExport1",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 365,
                                "child": [
                                ]
                            }]
                    },
                    {
                        "x": 15,
                        "type": "Box",
                        "searchKey": "Box,gameExport3",
                        "props": { "y": 0, "x": 0, "width": 750, "visible": false, "var": "gameExport3", "top": 0, "right": 0, "left": 0, "height": 1624, "bottom": 0, "bgColor": "#617EDB" },
                        "nodeParent": 1,
                        "label": "gameExport3",
                        "isOpen": false,
                        "isDirectory": true,
                        "isAniNode": true,
                        "hasChild": true,
                        "compId": 332,
                        "child": [
                            {
                                "type": "List",
                                "searchKey": "List,list",
                                "props": { "y": 115, "x": 0, "width": 750, "spaceY": 30, "spaceX": 25, "repeatX": 3, "name": "list", "height": 1220 },
                                "nodeParent": 332,
                                "label": "list",
                                "isOpen": null,
                                "isDirectory": true,
                                "isAniNode": true,
                                "hasChild": true,
                                "compId": 366,
                                "child": [
                                    {
                                        "type": "Sprite",
                                        "searchKey": "Sprite",
                                        "props": { "y": 10, "x": 10, "width": 225, "texture": "gamebox/frame_game4_1.png", "renderType": "render", "height": 225 },
                                        "nodeParent": 366,
                                        "label": "Sprite",
                                        "isDirectory": true,
                                        "isAniNode": false,
                                        "hasChild": true,
                                        "compId": 367,
                                        "child": [
                                            {
                                                "type": "Clip",
                                                "searchKey": "Clip,Pic",
                                                "props": { "y": 0, "x": 0, "width": 225, "skin": "gamebox/bg_hz.png", "name": "Pic", "height": 225 },
                                                "nodeParent": 367,
                                                "label": "Pic",
                                                "isDirectory": false,
                                                "isAniNode": false,
                                                "hasChild": false,
                                                "compId": 368,
                                                "child": [
                                                ]
                                            },
                                            {
                                                "type": "Sprite",
                                                "searchKey": "Sprite",
                                                "props": { "y": 225, "x": 0, "width": 225, "texture": "ui/BG.png", "pivotY": 56, "height": 56, "alpha": 0.8 },
                                                "nodeParent": 367,
                                                "label": "Sprite",
                                                "isDirectory": false,
                                                "isAniNode": false,
                                                "hasChild": false,
                                                "compId": 369,
                                                "child": [
                                                ]
                                            },
                                            {
                                                "type": "Text",
                                                "searchKey": "Text,Name",
                                                "props": { "y": 182, "x": 106, "width": 225, "valign": "middle", "text": "天天斗地主", "runtime": "Laya.Text", "pivotX": 106, "name": "Name", "height": 32, "fontSize": 28, "color": "#ffffff", "bold": false, "align": "center" },
                                                "nodeParent": 367,
                                                "label": "Name",
                                                "isDirectory": false,
                                                "isAniNode": false,
                                                "hasChild": false,
                                                "compId": 370,
                                                "child": [
                                                ]
                                            },
                                            {
                                                "type": "Sprite",
                                                "searchKey": "Sprite,new",
                                                "props": { "y": -9, "x": 157, "texture": "gamebox/ico_new.png", "name": "new" },
                                                "nodeParent": 367,
                                                "label": "new",
                                                "isDirectory": false,
                                                "isAniNode": false,
                                                "hasChild": false,
                                                "compId": 371,
                                                "child": [
                                                ]
                                            },
                                            {
                                                "type": "SkeletonPlayer",
                                                "searchKey": "SkeletonPlayer,point",
                                                "props": { "y": 153, "x": 175, "visible": false, "url": "gamebox/point.sk", "runtime": "Laya.Skeleton", "name": "point" },
                                                "nodeParent": 367,
                                                "label": "point",
                                                "isDirectory": false,
                                                "isAniNode": false,
                                                "hasChild": false,
                                                "compId": 372,
                                                "child": [
                                                ]
                                            }]
                                    }]
                            },
                            {
                                "type": "Label",
                                "searchKey": "Label",
                                "props": { "y": 54, "x": 20, "text": "好友都在玩", "fontSize": 40, "color": "#ffffff", "bold": true },
                                "nodeParent": 332,
                                "label": "Label",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 373,
                                "child": [
                                ]
                            },
                            {
                                "type": "Sprite",
                                "searchKey": "Sprite,Btn_back",
                                "props": { "y": 1254, "x": 375, "width": 337, "texture": "ui/ljsy_icon.png", "pivotY": 129, "pivotX": 169, "name": "Btn_back", "height": 129 },
                                "nodeParent": 332,
                                "label": "Btn_back",
                                "isOpen": null,
                                "isDirectory": true,
                                "isAniNode": true,
                                "hasChild": true,
                                "compId": 374,
                                "child": [
                                    {
                                        "type": "Sprite",
                                        "searchKey": "Sprite",
                                        "props": { "y": 24, "x": 48, "texture": "ui/tit_jxyx.png" },
                                        "nodeParent": 374,
                                        "label": "Sprite",
                                        "isDirectory": false,
                                        "isAniNode": true,
                                        "hasChild": false,
                                        "compId": 375,
                                        "child": [
                                        ]
                                    }]
                            },
                            {
                                "type": "Script",
                                "switchAble": true,
                                "source": "src/view/gameExport3.ts",
                                "searchKey": "Script,gameExport3",
                                "removeAble": true,
                                "props": { "runtime": "view/gameExport3.ts" },
                                "nodeParent": 332,
                                "label": "gameExport3",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 376,
                                "child": [
                                ]
                            }]
                    },
                    {
                        "x": 15,
                        "type": "Box",
                        "searchKey": "Box,skinUI",
                        "props": { "y": 0, "x": 0, "visible": false, "name": "skinUI" },
                        "nodeParent": 1,
                        "label": "skinUI",
                        "isOpen": true,
                        "isDirectory": true,
                        "isAniNode": true,
                        "hasChild": true,
                        "compId": 574,
                        "child": [
                            {
                                "x": 30,
                                "type": "Sprite",
                                "searchKey": "Sprite",
                                "props": { "texture": "load/bg.jpg", "height": 1624 },
                                "nodeParent": 574,
                                "label": "Sprite",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 575,
                                "child": [
                                ]
                            },
                            {
                                "x": 30,
                                "type": "Sprite",
                                "searchKey": "Sprite",
                                "props": { "texture": "ui/BG.png" },
                                "nodeParent": 574,
                                "label": "Sprite",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 605,
                                "child": [
                                ]
                            },
                            {
                                "x": 30,
                                "type": "Image",
                                "searchKey": "Image,bg",
                                "props": { "y": 1624, "x": 0, "skin": "skin/bg_02.png", "name": "bg", "anchorY": 1 },
                                "nodeParent": 574,
                                "label": "bg",
                                "isOpen": false,
                                "isDirectory": true,
                                "isAniNode": true,
                                "hasChild": true,
                                "compId": 576,
                                "child": [
                                    {
                                        "type": "List",
                                        "searchKey": "List,list",
                                        "props": { "y": 45, "x": 103, "spaceY": 30, "spaceX": 30, "repeatY": 3, "repeatX": 3, "name": "list" },
                                        "nodeParent": 576,
                                        "label": "list",
                                        "isOpen": null,
                                        "isDirectory": true,
                                        "isAniNode": true,
                                        "hasChild": true,
                                        "compId": 583,
                                        "child": [
                                            {
                                                "type": "Box",
                                                "searchKey": "Box",
                                                "props": { "renderType": "render" },
                                                "nodeParent": 583,
                                                "label": "Box",
                                                "isDirectory": true,
                                                "isAniNode": false,
                                                "hasChild": true,
                                                "compId": 582,
                                                "child": [
                                                    {
                                                        "type": "Image",
                                                        "searchKey": "Image,bg",
                                                        "props": { "y": 1, "x": 1, "width": 160, "skin": "skin/jx_01.png", "name": "bg", "height": 160 },
                                                        "nodeParent": 582,
                                                        "label": "bg",
                                                        "isDirectory": false,
                                                        "isAniNode": false,
                                                        "hasChild": false,
                                                        "compId": 578,
                                                        "child": [
                                                        ]
                                                    },
                                                    {
                                                        "type": "Image",
                                                        "searchKey": "Image,img",
                                                        "props": { "y": 4, "x": 3, "width": 161, "skin": "skin/1.png", "name": "img", "height": 161 },
                                                        "nodeParent": 582,
                                                        "label": "img",
                                                        "isDirectory": false,
                                                        "isAniNode": false,
                                                        "hasChild": false,
                                                        "compId": 593,
                                                        "child": [
                                                        ]
                                                    },
                                                    {
                                                        "type": "Sprite",
                                                        "searchKey": "Sprite,isSelect",
                                                        "props": { "texture": "skin/jx_03.png", "name": "isSelect" },
                                                        "nodeParent": 582,
                                                        "label": "isSelect",
                                                        "isDirectory": false,
                                                        "isAniNode": false,
                                                        "hasChild": false,
                                                        "compId": 579,
                                                        "child": [
                                                        ]
                                                    },
                                                    {
                                                        "type": "Sprite",
                                                        "searchKey": "Sprite,wen",
                                                        "props": { "y": 51, "x": 64, "texture": "skin/？.png", "name": "wen" },
                                                        "nodeParent": 582,
                                                        "label": "wen",
                                                        "isDirectory": false,
                                                        "isAniNode": false,
                                                        "hasChild": false,
                                                        "compId": 580,
                                                        "child": [
                                                        ]
                                                    },
                                                    {
                                                        "type": "Sprite",
                                                        "searchKey": "Sprite,check",
                                                        "props": { "y": 43, "x": 35, "texture": "skin/√.png", "name": "check" },
                                                        "nodeParent": 582,
                                                        "label": "check",
                                                        "isDirectory": false,
                                                        "isAniNode": false,
                                                        "hasChild": false,
                                                        "compId": 581,
                                                        "child": [
                                                        ]
                                                    }]
                                            }]
                                    },
                                    {
                                        "type": "Image",
                                        "searchKey": "Image,getskin",
                                        "props": { "y": 655, "skin": "skin/jbgm_icon.png", "name": "getskin", "centerX": -160 },
                                        "nodeParent": 576,
                                        "label": "getskin",
                                        "isOpen": true,
                                        "isDirectory": true,
                                        "isAniNode": true,
                                        "hasChild": true,
                                        "compId": 584,
                                        "child": [
                                            {
                                                "type": "Sprite",
                                                "searchKey": "Sprite",
                                                "props": { "y": 18, "x": 23, "texture": "skin/jb.png" },
                                                "nodeParent": 584,
                                                "label": "Sprite",
                                                "isDirectory": false,
                                                "isAniNode": true,
                                                "hasChild": false,
                                                "compId": 586,
                                                "child": [
                                                ]
                                            },
                                            {
                                                "type": "FontClip",
                                                "searchKey": "FontClip,num",
                                                "props": { "y": 37, "x": 89, "width": 166, "value": "1000", "spaceX": -10, "skin": "skin/sz.png", "sheet": "0123456789", "name": "num", "height": 61, "align": "center" },
                                                "nodeParent": 584,
                                                "label": "num",
                                                "isDirectory": false,
                                                "isAniNode": true,
                                                "hasChild": false,
                                                "compId": 588,
                                                "child": [
                                                ]
                                            }]
                                    },
                                    {
                                        "type": "Image",
                                        "searchKey": "Image,videoGold",
                                        "props": { "y": 655, "skin": "skin/gkhq_icon.png", "name": "videoGold", "centerX": 160 },
                                        "nodeParent": 576,
                                        "label": "videoGold",
                                        "isOpen": true,
                                        "isDirectory": true,
                                        "isAniNode": true,
                                        "hasChild": true,
                                        "compId": 585,
                                        "child": [
                                            {
                                                "type": "Sprite",
                                                "searchKey": "Sprite",
                                                "props": { "y": 16, "x": 38, "texture": "skin/gkhq_hqjb.png" },
                                                "nodeParent": 585,
                                                "label": "Sprite",
                                                "isDirectory": false,
                                                "isAniNode": true,
                                                "hasChild": false,
                                                "compId": 587,
                                                "child": [
                                                ]
                                            },
                                            {
                                                "type": "FontClip",
                                                "searchKey": "FontClip",
                                                "props": { "y": 45, "x": 146, "width": 110, "value": "500", "spaceX": -10, "skin": "skin/sz.png", "sheet": "0123456789", "height": 55, "align": "center" },
                                                "nodeParent": 585,
                                                "label": "FontClip",
                                                "isDirectory": false,
                                                "isAniNode": true,
                                                "hasChild": false,
                                                "compId": 607,
                                                "child": [
                                                ]
                                            }]
                                    }]
                            },
                            {
                                "x": 30,
                                "type": "Image",
                                "searchKey": "Image,backBtn",
                                "props": { "top": 383, "skin": "skin/fh_icon.png", "name": "backBtn", "left": 12 },
                                "nodeParent": 574,
                                "label": "backBtn",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 577,
                                "child": [
                                ]
                            },
                            {
                                "x": 30,
                                "type": "Script",
                                "switchAble": true,
                                "source": "src/view/ShopUI.ts",
                                "searchKey": "Script,ShopUI",
                                "removeAble": true,
                                "props": { "runtime": "view/ShopUI.ts" },
                                "nodeParent": 574,
                                "label": "ShopUI",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 606,
                                "child": [
                                ]
                            },
                            {
                                "x": 30,
                                "type": "Text",
                                "searchKey": "Text,tipView",
                                "props": { "y": 173, "x": 154, "width": 454, "visible": false, "valign": "middle", "text": "Get 500 gold", "name": "tipView", "height": 97, "fontSize": 40, "font": "Arial", "color": "#ffffff", "align": "center" },
                                "nodeParent": 574,
                                "label": "tipView",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 692,
                                "child": [
                                ]
                            }]
                    },
                    {
                        "x": 15,
                        "type": "Image",
                        "searchKey": "Image,gold",
                        "props": { "y": 50, "skin": "ui/jb_dk.png", "right": 32, "name": "gold" },
                        "nodeParent": 1,
                        "label": "gold",
                        "isOpen": true,
                        "isDirectory": true,
                        "isAniNode": true,
                        "hasChild": true,
                        "compId": 556,
                        "child": [
                            {
                                "x": 30,
                                "type": "Sprite",
                                "searchKey": "Sprite",
                                "props": { "y": -9, "x": 154.5, "texture": "ui/jb.png" },
                                "nodeParent": 556,
                                "label": "Sprite",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 557,
                                "child": [
                                ]
                            },
                            {
                                "x": 30,
                                "type": "Label",
                                "searchKey": "Label,txt",
                                "props": { "y": 7.5, "x": 14.5, "width": 140, "valign": "middle", "text": "650", "name": "txt", "height": 50, "fontSize": 35, "font": "Arial", "color": "#ffffff", "align": "center" },
                                "nodeParent": 556,
                                "label": "txt",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 558,
                                "child": [
                                ]
                            }]
                    },
                    {
                        "x": 15,
                        "type": "Box",
                        "searchKey": "Box,resultUI",
                        "props": { "y": 2, "x": 0, "visible": false, "top": 2, "right": 0, "name": "resultUI", "left": 0, "bottom": 0, "bgColor": "#617EDB" },
                        "nodeParent": 1,
                        "label": "resultUI",
                        "isOpen": false,
                        "isDirectory": true,
                        "isAniNode": true,
                        "hasChild": true,
                        "compId": 25,
                        "child": [
                            {
                                "type": "Box",
                                "searchKey": "Box,topUI",
                                "props": { "y": 150, "right": 0, "name": "topUI", "left": 0 },
                                "nodeParent": 25,
                                "label": "topUI",
                                "isOpen": null,
                                "isDirectory": true,
                                "isAniNode": true,
                                "hasChild": true,
                                "compId": 34,
                                "child": [
                                    {
                                        "type": "Image",
                                        "searchKey": "Image,logo",
                                        "props": { "y": 0, "x": 241, "skin": "gamebox/tit_sl.png", "name": "logo" },
                                        "nodeParent": 34,
                                        "label": "logo",
                                        "isDirectory": false,
                                        "isAniNode": true,
                                        "hasChild": false,
                                        "compId": 35,
                                        "child": [
                                        ]
                                    }]
                            },
                            {
                                "type": "Box",
                                "searchKey": "Box,middleUI",
                                "props": { "y": 863, "width": 750, "visible": false, "right": 0, "name": "middleUI", "left": -988, "height": 664, "anchorY": 0.5 },
                                "nodeParent": 25,
                                "label": "middleUI",
                                "isOpen": false,
                                "isDirectory": true,
                                "isAniNode": true,
                                "hasChild": true,
                                "compId": 36,
                                "child": [
                                    {
                                        "type": "List",
                                        "searchKey": "List,list,resultExportList",
                                        "props": { "y": -40, "x": 68, "width": 613, "var": "resultExportList", "spaceY": 15, "spaceX": 35, "repeatY": 2, "repeatX": 2, "name": "list", "height": 660, "anchorY": 0 },
                                        "nodeParent": 36,
                                        "label": "list",
                                        "isOpen": null,
                                        "isDirectory": true,
                                        "isAniNode": true,
                                        "hasChild": true,
                                        "compId": 407,
                                        "child": [
                                            {
                                                "type": "Image",
                                                "searchKey": "Image",
                                                "props": { "y": 160, "x": 143, "width": 286, "skin": "gamebox/but.png", "rotation": 0, "renderType": "render", "height": 320, "anchorY": 0.5, "anchorX": 0.5 },
                                                "nodeParent": 407,
                                                "label": "Image",
                                                "isDirectory": true,
                                                "isAniNode": false,
                                                "hasChild": true,
                                                "compId": 408,
                                                "child": [
                                                    {
                                                        "type": "Clip",
                                                        "searchKey": "Clip,Pic",
                                                        "props": { "y": 10, "x": 10, "width": 265, "skin": "gamebox/bg_hz.png", "name": "Pic", "height": 235 },
                                                        "nodeParent": 408,
                                                        "label": "Pic",
                                                        "isDirectory": false,
                                                        "isAniNode": false,
                                                        "hasChild": false,
                                                        "compId": 409,
                                                        "child": [
                                                        ]
                                                    },
                                                    {
                                                        "type": "Label",
                                                        "searchKey": "Label,Name",
                                                        "props": { "y": 260, "x": 142, "text": "啦啦啦啦啦", "name": "Name", "fontSize": 36, "color": "#000000", "bold": true, "anchorX": 0.5, "align": "center" },
                                                        "nodeParent": 408,
                                                        "label": "Name",
                                                        "isDirectory": false,
                                                        "isAniNode": false,
                                                        "hasChild": false,
                                                        "compId": 410,
                                                        "child": [
                                                        ]
                                                    },
                                                    {
                                                        "type": "SkeletonPlayer",
                                                        "searchKey": "SkeletonPlayer,point",
                                                        "props": { "y": 196, "x": 201, "visible": false, "url": "gamebox/point.sk", "runtime": "Laya.Skeleton", "name": "point" },
                                                        "nodeParent": 408,
                                                        "label": "point",
                                                        "isDirectory": false,
                                                        "isAniNode": false,
                                                        "hasChild": false,
                                                        "compId": 411,
                                                        "child": [
                                                        ]
                                                    }]
                                            }]
                                    }]
                            },
                            {
                                "type": "Box",
                                "searchKey": "Box,bottomUI",
                                "props": { "y": 1355, "width": 750, "visible": true, "right": 0, "pivotY": 79, "name": "bottomUI", "left": 0, "height": 79 },
                                "nodeParent": 25,
                                "label": "bottomUI",
                                "isOpen": true,
                                "isDirectory": true,
                                "isAniNode": true,
                                "hasChild": true,
                                "compId": 41,
                                "child": [
                                    {
                                        "type": "Image",
                                        "searchKey": "Image,next",
                                        "props": { "y": 21, "x": 375, "skin": "gamebox/font_xyg.png", "name": "next", "anchorY": 0.5, "anchorX": 0.5 },
                                        "nodeParent": 41,
                                        "label": "next",
                                        "isOpen": null,
                                        "isDirectory": true,
                                        "isAniNode": true,
                                        "hasChild": true,
                                        "compId": 42,
                                        "child": [
                                            {
                                                "type": "Sprite",
                                                "searchKey": "Sprite,icon",
                                                "props": { "y": -2, "x": 152, "texture": "ui/pf_sp.png", "name": "icon" },
                                                "nodeParent": 42,
                                                "label": "icon",
                                                "isDirectory": false,
                                                "isAniNode": true,
                                                "hasChild": false,
                                                "compId": 673,
                                                "child": [
                                                ]
                                            }]
                                    }]
                            },
                            {
                                "type": "Script",
                                "switchAble": true,
                                "source": "src/view/ResultUI.ts",
                                "searchKey": "Script,ResultUI",
                                "removeAble": true,
                                "props": { "runtime": "view/ResultUI.ts" },
                                "nodeParent": 25,
                                "label": "ResultUI",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 187,
                                "child": [
                                ]
                            },
                            {
                                "type": "Image",
                                "searchKey": "Image",
                                "props": { "y": 890, "x": 275, "width": 235, "skin": "ui/jb_dk.png", "height": 85 },
                                "nodeParent": 25,
                                "label": "Image",
                                "isOpen": true,
                                "isDirectory": true,
                                "isAniNode": true,
                                "hasChild": true,
                                "compId": 689,
                                "child": [
                                    {
                                        "type": "Image",
                                        "searchKey": "Image",
                                        "props": { "y": 13.5, "x": 150, "width": 59, "skin": "ui/jb.png", "height": 58 },
                                        "nodeParent": 689,
                                        "label": "Image",
                                        "isDirectory": false,
                                        "isAniNode": true,
                                        "hasChild": false,
                                        "compId": 690,
                                        "child": [
                                        ]
                                    },
                                    {
                                        "type": "FontClip",
                                        "searchKey": "FontClip",
                                        "props": { "y": -42.5, "x": 7.5, "value": "50", "skin": "ui/fhdjs_sz.png", "sheet": "0123456789", "align": "center" },
                                        "nodeParent": 689,
                                        "label": "FontClip",
                                        "isDirectory": false,
                                        "isAniNode": true,
                                        "hasChild": false,
                                        "compId": 691,
                                        "child": [
                                        ]
                                    }]
                            }]
                    },
                    {
                        "x": 15,
                        "type": "Box",
                        "searchKey": "Box,reviveUI",
                        "props": { "visible": false, "top": 0, "right": 0, "name": "reviveUI", "left": 0, "bottom": 0 },
                        "nodeParent": 1,
                        "label": "reviveUI",
                        "isOpen": true,
                        "isDirectory": true,
                        "isAniNode": true,
                        "hasChild": true,
                        "compId": 559,
                        "child": [
                            {
                                "x": 30,
                                "type": "Image",
                                "searchKey": "Image",
                                "props": { "top": 0, "skin": "ui/BG.png", "right": 0, "left": 0, "bottom": 0 },
                                "nodeParent": 559,
                                "label": "Image",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 560,
                                "child": [
                                ]
                            },
                            {
                                "x": 30,
                                "type": "Image",
                                "searchKey": "Image",
                                "props": { "top": 250, "skin": "ui/fhdjs.png", "centerX": 0 },
                                "nodeParent": 559,
                                "label": "Image",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 561,
                                "child": [
                                ]
                            },
                            {
                                "x": 30,
                                "type": "FontClip",
                                "searchKey": "FontClip,numClip",
                                "props": { "value": "9", "skin": "ui/fhdjs_sz.png", "sheet": "0123456789", "name": "numClip", "centerY": -100, "centerX": 0 },
                                "nodeParent": 559,
                                "label": "numClip",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 562,
                                "child": [
                                ]
                            },
                            {
                                "x": 30,
                                "type": "Image",
                                "searchKey": "Image,reviveBtn",
                                "props": { "skin": "ui/ksyx_icom.png", "name": "reviveBtn", "centerX": 0, "bottom": 400 },
                                "nodeParent": 559,
                                "label": "reviveBtn",
                                "isOpen": null,
                                "isDirectory": true,
                                "isAniNode": true,
                                "hasChild": true,
                                "compId": 563,
                                "child": [
                                    {
                                        "type": "Sprite",
                                        "searchKey": "Sprite",
                                        "props": { "y": 37, "x": 75, "texture": "ui/ljfh.png" },
                                        "nodeParent": 563,
                                        "label": "Sprite",
                                        "isDirectory": false,
                                        "isAniNode": true,
                                        "hasChild": false,
                                        "compId": 564,
                                        "child": [
                                        ]
                                    }]
                            },
                            {
                                "x": 30,
                                "type": "Image",
                                "searchKey": "Image,abandBtn",
                                "props": { "skin": "ui/ljfh_fqjh.png", "name": "abandBtn", "centerX": 0, "bottom": 316 },
                                "nodeParent": 559,
                                "label": "abandBtn",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 565,
                                "child": [
                                ]
                            },
                            {
                                "x": 30,
                                "type": "Script",
                                "switchAble": true,
                                "source": "src/view/ReviveUI.ts",
                                "searchKey": "Script,ReviveUI",
                                "removeAble": true,
                                "props": { "y": 1, "x": 0, "timeClip": "@node:562", "runtime": "view/ReviveUI.ts", "reviveBtn": "@node:563", "abandBtn": "@node:565" },
                                "nodeParent": 559,
                                "label": "ReviveUI",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 590,
                                "child": [
                                ]
                            }]
                    },
                    {
                        "x": 15,
                        "type": "Box",
                        "searchKey": "Box,trySkinUI",
                        "props": { "visible": false, "top": 1, "right": 0, "name": "trySkinUI", "left": 0, "bottom": 0 },
                        "nodeParent": 1,
                        "label": "trySkinUI",
                        "isOpen": false,
                        "isDirectory": true,
                        "isAniNode": true,
                        "hasChild": true,
                        "compId": 566,
                        "child": [
                            {
                                "type": "Image",
                                "searchKey": "Image",
                                "props": { "top": 0, "skin": "ui/BG.png", "right": 0, "left": 0, "bottom": 0 },
                                "nodeParent": 566,
                                "label": "Image",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 567,
                                "child": [
                                ]
                            },
                            {
                                "type": "Image",
                                "searchKey": "Image",
                                "props": { "top": 250, "skin": "ui/pfsy.png", "centerX": 0 },
                                "nodeParent": 566,
                                "label": "Image",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 568,
                                "child": [
                                ]
                            },
                            {
                                "type": "Image",
                                "searchKey": "Image,light",
                                "props": { "y": 712, "x": 375, "skin": "ui/tx_01.png", "name": "light", "centerY": -100, "centerX": 0, "anchorY": 0.5, "anchorX": 0.5 },
                                "nodeParent": 566,
                                "label": "light",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 569,
                                "child": [
                                ]
                            },
                            {
                                "type": "Sprite",
                                "searchKey": "Sprite",
                                "props": { "y": 507, "x": 354, "texture": "ui/tx_02.png" },
                                "nodeParent": 566,
                                "label": "Sprite",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 603,
                                "child": [
                                ]
                            },
                            {
                                "type": "Sprite",
                                "searchKey": "Sprite",
                                "props": { "y": 618, "x": 152, "texture": "ui/tx_03.png" },
                                "nodeParent": 566,
                                "label": "Sprite",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 604,
                                "child": [
                                ]
                            },
                            {
                                "type": "Image",
                                "searchKey": "Image,tryBtn",
                                "props": { "skin": "ui/ljsy_icon.png", "name": "tryBtn", "centerX": 0, "bottom": 370 },
                                "nodeParent": 566,
                                "label": "tryBtn",
                                "isOpen": null,
                                "isDirectory": true,
                                "isAniNode": true,
                                "hasChild": true,
                                "compId": 570,
                                "child": [
                                    {
                                        "type": "Sprite",
                                        "searchKey": "Sprite",
                                        "props": { "y": 30, "x": 14, "texture": "ui/ljsy.png" },
                                        "nodeParent": 570,
                                        "label": "Sprite",
                                        "isDirectory": false,
                                        "isAniNode": true,
                                        "hasChild": false,
                                        "compId": 571,
                                        "child": [
                                        ]
                                    },
                                    {
                                        "type": "Sprite",
                                        "searchKey": "Sprite",
                                        "props": { "y": 37, "x": 265, "texture": "ui/pf_sp.png" },
                                        "nodeParent": 570,
                                        "label": "Sprite",
                                        "isDirectory": false,
                                        "isAniNode": true,
                                        "hasChild": false,
                                        "compId": 680,
                                        "child": [
                                        ]
                                    }]
                            },
                            {
                                "type": "Script",
                                "switchAble": true,
                                "source": "src/view/TrySkinUI.ts",
                                "searchKey": "Script,TrySkinUI",
                                "removeAble": true,
                                "props": { "tryBtn": "@node:570", "runtime": "view/TrySkinUI.ts", "light": "@node:569", "abandBtn": "@node:602" },
                                "nodeParent": 566,
                                "label": "TrySkinUI",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 591,
                                "child": [
                                ]
                            },
                            {
                                "type": "Image",
                                "searchKey": "Image,aband",
                                "props": { "skin": "ui/ljfh_fqjh.png", "name": "aband", "centerX": 0, "bottom": 300 },
                                "nodeParent": 566,
                                "label": "aband",
                                "isOpen": null,
                                "isDirectory": true,
                                "isAniNode": true,
                                "hasChild": true,
                                "compId": 602,
                                "child": [
                                    {
                                        "type": "Sprite",
                                        "searchKey": "Sprite,icon",
                                        "props": { "y": -3, "x": 169, "texture": "ui/pf_sp.png", "name": "icon" },
                                        "nodeParent": 602,
                                        "label": "icon",
                                        "isDirectory": false,
                                        "isAniNode": true,
                                        "hasChild": false,
                                        "compId": 674,
                                        "child": [
                                        ]
                                    }]
                            }]
                    },
                    {
                        "x": 15,
                        "type": "Box",
                        "searchKey": "Box,threeGridUI",
                        "props": { "y": 0, "x": 0, "visible": false, "top": 0, "right": 0, "name": "threeGridUI", "left": 0, "bottom": 0 },
                        "nodeParent": 1,
                        "label": "threeGridUI",
                        "isOpen": null,
                        "isDirectory": true,
                        "isAniNode": true,
                        "hasChild": true,
                        "compId": 608,
                        "child": [
                            {
                                "type": "Sprite",
                                "searchKey": "Sprite",
                                "props": { "width": 750, "texture": "ui/bj.jpg", "height": 1624 },
                                "nodeParent": 608,
                                "label": "Sprite",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 612,
                                "child": [
                                ]
                            },
                            {
                                "type": "Image",
                                "searchKey": "Image,nextbtn",
                                "props": { "y": 1504, "skin": "ui/jxyx.png", "name": "nextbtn", "centerX": 0, "bottom": 120, "anchorY": 1 },
                                "nodeParent": 608,
                                "label": "nextbtn",
                                "isDirectory": true,
                                "isAniNode": true,
                                "hasChild": true,
                                "compId": 613,
                                "child": [
                                    {
                                        "type": "Sprite",
                                        "searchKey": "Sprite,icon",
                                        "props": { "y": -2, "x": 220, "texture": "ui/pf_sp.png", "name": "icon" },
                                        "nodeParent": 613,
                                        "label": "icon",
                                        "isDirectory": false,
                                        "isAniNode": true,
                                        "hasChild": false,
                                        "compId": 675,
                                        "child": [
                                        ]
                                    }]
                            },
                            {
                                "type": "Sprite",
                                "searchKey": "Sprite",
                                "props": { "y": 50, "x": 298, "texture": "gamebox/tit_rmtj.png" },
                                "nodeParent": 608,
                                "label": "Sprite",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 614,
                                "child": [
                                ]
                            },
                            {
                                "type": "Script",
                                "source": "src/view/ThreeGridUI.ts",
                                "searchKey": "Script,ThreeGridUI",
                                "props": { "runtime": "view/ThreeGridUI.ts" },
                                "nodeParent": 608,
                                "label": "ThreeGridUI",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 615,
                                "child": [
                                ]
                            }]
                    },
                    {
                        "x": 15,
                        "type": "Box",
                        "searchKey": "Box,fourGridUI",
                        "props": { "y": 0, "x": 0, "visible": false, "top": 0, "right": 0, "name": "fourGridUI", "left": 0, "bottom": 0 },
                        "nodeParent": 1,
                        "label": "fourGridUI",
                        "isOpen": null,
                        "isDirectory": true,
                        "isAniNode": true,
                        "hasChild": true,
                        "compId": 609,
                        "child": [
                            {
                                "type": "Sprite",
                                "searchKey": "Sprite",
                                "props": { "width": 750, "texture": "ui/bj.jpg", "height": 1624 },
                                "nodeParent": 609,
                                "label": "Sprite",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 616,
                                "child": [
                                ]
                            },
                            {
                                "type": "Sprite",
                                "searchKey": "Sprite",
                                "props": { "y": 50, "x": 298, "texture": "gamebox/tit_rmtj.png" },
                                "nodeParent": 609,
                                "label": "Sprite",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 617,
                                "child": [
                                ]
                            },
                            {
                                "type": "Image",
                                "searchKey": "Image,nextbtn",
                                "props": { "y": 1504, "x": 273, "skin": "ui/jxyx.png", "name": "nextbtn", "centerX": 0, "bottom": 120, "anchorY": 1 },
                                "nodeParent": 609,
                                "label": "nextbtn",
                                "isDirectory": true,
                                "isAniNode": true,
                                "hasChild": true,
                                "compId": 618,
                                "child": [
                                    {
                                        "type": "Sprite",
                                        "searchKey": "Sprite,icon",
                                        "props": { "y": -2, "x": 220, "texture": "ui/pf_sp.png", "name": "icon" },
                                        "nodeParent": 618,
                                        "label": "icon",
                                        "isDirectory": false,
                                        "isAniNode": true,
                                        "hasChild": false,
                                        "compId": 676,
                                        "child": [
                                        ]
                                    }]
                            },
                            {
                                "type": "Script",
                                "source": "src/view/FourGridUI.ts",
                                "searchKey": "Script,FourGridUI",
                                "props": { "runtime": "view/FourGridUI.ts" },
                                "nodeParent": 609,
                                "label": "FourGridUI",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 619,
                                "child": [
                                ]
                            }]
                    },
                    {
                        "x": 15,
                        "type": "Box",
                        "searchKey": "Box,singleGridUI",
                        "props": { "y": 0, "x": 0, "visible": false, "top": 0, "right": 0, "name": "singleGridUI", "left": 0, "bottom": 0 },
                        "nodeParent": 1,
                        "label": "singleGridUI",
                        "isOpen": null,
                        "isDirectory": true,
                        "isAniNode": true,
                        "hasChild": true,
                        "compId": 610,
                        "child": [
                            {
                                "type": "Sprite",
                                "searchKey": "Sprite",
                                "props": { "width": 750, "texture": "ui/bj.jpg", "height": 1624 },
                                "nodeParent": 610,
                                "label": "Sprite",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 620,
                                "child": [
                                ]
                            },
                            {
                                "type": "Sprite",
                                "searchKey": "Sprite",
                                "props": { "y": 50, "x": 273, "texture": "ui/gdhw.png" },
                                "nodeParent": 610,
                                "label": "Sprite",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 621,
                                "child": [
                                ]
                            },
                            {
                                "type": "Image",
                                "searchKey": "Image,nextbtn",
                                "props": { "skin": "ui/jxyx.png", "name": "nextbtn", "centerX": 0, "bottom": 120, "anchorY": 1 },
                                "nodeParent": 610,
                                "label": "nextbtn",
                                "isDirectory": true,
                                "isAniNode": true,
                                "hasChild": true,
                                "compId": 622,
                                "child": [
                                    {
                                        "type": "Sprite",
                                        "searchKey": "Sprite,icon",
                                        "props": { "y": -2, "x": 220, "texture": "ui/pf_sp.png", "name": "icon" },
                                        "nodeParent": 622,
                                        "label": "icon",
                                        "isDirectory": false,
                                        "isAniNode": true,
                                        "hasChild": false,
                                        "compId": 677,
                                        "child": [
                                        ]
                                    }]
                            },
                            {
                                "type": "Script",
                                "source": "src/view/singleGridUI.ts",
                                "searchKey": "Script,singleGridUI",
                                "props": { "runtime": "view/singleGridUI.ts" },
                                "nodeParent": 610,
                                "label": "singleGridUI",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 623,
                                "child": [
                                ]
                            }]
                    },
                    {
                        "x": 15,
                        "type": "Box",
                        "searchKey": "Box,resultUI2",
                        "props": { "y": 0, "x": 0, "visible": false, "top": 0, "right": 0, "name": "resultUI2", "left": 0, "bottom": 0, "bgColor": "#617EDB" },
                        "nodeParent": 1,
                        "label": "resultUI2",
                        "isOpen": false,
                        "isDirectory": true,
                        "isAniNode": true,
                        "hasChild": true,
                        "compId": 611,
                        "child": [
                            {
                                "type": "Sprite",
                                "searchKey": "Sprite",
                                "props": { "texture": "ui/bj.jpg" },
                                "nodeParent": 611,
                                "label": "Sprite",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 624,
                                "child": [
                                ]
                            },
                            {
                                "type": "Box",
                                "searchKey": "Box,topUI",
                                "props": { "y": 250, "right": 0, "name": "topUI", "left": 0 },
                                "nodeParent": 611,
                                "label": "topUI",
                                "isOpen": true,
                                "isDirectory": true,
                                "isAniNode": true,
                                "hasChild": true,
                                "compId": 625,
                                "child": [
                                    {
                                        "type": "Box",
                                        "searchKey": "Box,win",
                                        "props": { "y": -219, "x": 112, "name": "win" },
                                        "nodeParent": 625,
                                        "label": "win",
                                        "isOpen": true,
                                        "isDirectory": true,
                                        "isAniNode": true,
                                        "hasChild": true,
                                        "compId": 626,
                                        "child": [
                                            {
                                                "type": "Sprite",
                                                "searchKey": "Sprite",
                                                "props": { "texture": "ui/sl_gx.png" },
                                                "nodeParent": 626,
                                                "label": "Sprite",
                                                "isDirectory": false,
                                                "isAniNode": true,
                                                "hasChild": false,
                                                "compId": 627,
                                                "child": [
                                                ]
                                            },
                                            {
                                                "type": "Sprite",
                                                "searchKey": "Sprite",
                                                "props": { "y": 219, "x": 26, "texture": "ui/sl_d.png" },
                                                "nodeParent": 626,
                                                "label": "Sprite",
                                                "isDirectory": false,
                                                "isAniNode": true,
                                                "hasChild": false,
                                                "compId": 628,
                                                "child": [
                                                ]
                                            },
                                            {
                                                "type": "Image",
                                                "searchKey": "Image,logo",
                                                "props": { "y": 224, "x": 143, "skin": "ui/sl_bt.png", "name": "logo" },
                                                "nodeParent": 626,
                                                "label": "logo",
                                                "isDirectory": false,
                                                "isAniNode": true,
                                                "hasChild": false,
                                                "compId": 629,
                                                "child": [
                                                ]
                                            }]
                                    },
                                    {
                                        "type": "Box",
                                        "searchKey": "Box,fail",
                                        "props": { "y": -219, "x": 112, "name": "fail" },
                                        "nodeParent": 625,
                                        "label": "fail",
                                        "isOpen": true,
                                        "isDirectory": true,
                                        "isAniNode": true,
                                        "hasChild": true,
                                        "compId": 630,
                                        "child": [
                                            {
                                                "type": "Sprite",
                                                "searchKey": "Sprite",
                                                "props": { "texture": "ui/sb_gx.png" },
                                                "nodeParent": 630,
                                                "label": "Sprite",
                                                "isDirectory": false,
                                                "isAniNode": true,
                                                "hasChild": false,
                                                "compId": 631,
                                                "child": [
                                                ]
                                            },
                                            {
                                                "type": "Sprite",
                                                "searchKey": "Sprite",
                                                "props": { "y": 219, "x": 26, "texture": "ui/sb_d.png" },
                                                "nodeParent": 630,
                                                "label": "Sprite",
                                                "isDirectory": false,
                                                "isAniNode": true,
                                                "hasChild": false,
                                                "compId": 632,
                                                "child": [
                                                ]
                                            },
                                            {
                                                "type": "Image",
                                                "searchKey": "Image,logo",
                                                "props": { "y": 228, "x": 135, "skin": "ui/sb.png", "scaleY": 0.8, "scaleX": 0.8, "name": "logo" },
                                                "nodeParent": 630,
                                                "label": "logo",
                                                "isDirectory": false,
                                                "isAniNode": true,
                                                "hasChild": false,
                                                "compId": 633,
                                                "child": [
                                                ]
                                            }]
                                    }]
                            },
                            {
                                "type": "Box",
                                "searchKey": "Box,middleUI",
                                "props": { "y": 800, "width": 750, "visible": false, "right": 0, "name": "middleUI", "left": -863, "height": 626, "anchorY": 0.5 },
                                "nodeParent": 611,
                                "label": "middleUI",
                                "isOpen": null,
                                "isDirectory": true,
                                "isAniNode": true,
                                "hasChild": true,
                                "compId": 634,
                                "child": [
                                    {
                                        "type": "List",
                                        "searchKey": "List,list",
                                        "props": { "y": 115, "x": 90, "width": 570, "vScrollBarSkin": "comp/vscroll.png", "spaceY": 20, "spaceX": 20, "repeatX": 3, "name": "list", "height": 375 },
                                        "nodeParent": 634,
                                        "label": "list",
                                        "isDirectory": true,
                                        "isAniNode": true,
                                        "hasChild": true,
                                        "compId": 635,
                                        "child": [
                                            {
                                                "type": "Sprite",
                                                "searchKey": "Sprite",
                                                "props": { "y": 10, "x": 0, "width": 170, "texture": "ui/icon.png", "renderType": "render", "height": 170 },
                                                "nodeParent": 635,
                                                "label": "Sprite",
                                                "isDirectory": true,
                                                "isAniNode": false,
                                                "hasChild": true,
                                                "compId": 636,
                                                "child": [
                                                    {
                                                        "type": "Clip",
                                                        "searchKey": "Clip,Pic",
                                                        "props": { "y": 3, "x": 5, "width": 160, "skin": "gamebox/bg_hz.png", "name": "Pic", "height": 160 },
                                                        "nodeParent": 636,
                                                        "label": "Pic",
                                                        "isDirectory": false,
                                                        "isAniNode": false,
                                                        "hasChild": false,
                                                        "compId": 637,
                                                        "child": [
                                                        ]
                                                    },
                                                    {
                                                        "type": "SkeletonPlayer",
                                                        "searchKey": "SkeletonPlayer,point",
                                                        "props": { "y": 164, "x": 140, "visible": false, "url": "gamebox/point.sk", "runtime": "Laya.Skeleton", "name": "point" },
                                                        "nodeParent": 636,
                                                        "label": "point",
                                                        "isDirectory": false,
                                                        "isAniNode": false,
                                                        "hasChild": false,
                                                        "compId": 638,
                                                        "child": [
                                                        ]
                                                    }]
                                            }]
                                    }]
                            },
                            {
                                "type": "Box",
                                "searchKey": "Box,bottomUI",
                                "props": { "y": 1330, "width": 750, "visible": true, "right": 0, "pivotY": 54, "name": "bottomUI", "left": 0, "height": 54 },
                                "nodeParent": 611,
                                "label": "bottomUI",
                                "isOpen": true,
                                "isDirectory": true,
                                "isAniNode": true,
                                "hasChild": true,
                                "compId": 639,
                                "child": [
                                    {
                                        "type": "Sprite",
                                        "searchKey": "Sprite,toggle",
                                        "props": { "y": 9, "x": -382, "visible": false, "texture": "ui/icon_choice_bg.png", "name": "toggle" },
                                        "nodeParent": 639,
                                        "label": "toggle",
                                        "isOpen": null,
                                        "isDirectory": true,
                                        "isAniNode": true,
                                        "hasChild": true,
                                        "compId": 685,
                                        "child": [
                                            {
                                                "type": "Sprite",
                                                "searchKey": "Sprite,toggleSel",
                                                "props": { "y": 8, "x": 8, "texture": "ui/icon_choice.png", "name": "toggleSel" },
                                                "nodeParent": 685,
                                                "label": "toggleSel",
                                                "isDirectory": false,
                                                "isAniNode": true,
                                                "hasChild": false,
                                                "compId": 686,
                                                "child": [
                                                ]
                                            },
                                            {
                                                "type": "Text",
                                                "searchKey": "Text",
                                                "props": { "y": 6, "x": 42, "text": "观看视频获取100金币", "runtime": "Laya.Text", "fontSize": 24, "color": "#ffffff" },
                                                "nodeParent": 685,
                                                "label": "Text",
                                                "isDirectory": false,
                                                "isAniNode": true,
                                                "hasChild": false,
                                                "compId": 687,
                                                "child": [
                                                ]
                                            }]
                                    },
                                    {
                                        "type": "Image",
                                        "searchKey": "Image,next",
                                        "props": { "y": 74, "x": 375, "width": 292, "skin": "ui/jxyx_icon.png", "pivotY": 106, "pivotX": 146, "name": "next", "height": 106 },
                                        "nodeParent": 639,
                                        "label": "next",
                                        "isOpen": true,
                                        "isDirectory": true,
                                        "isAniNode": true,
                                        "hasChild": true,
                                        "compId": 640,
                                        "child": [
                                            {
                                                "type": "Sprite",
                                                "searchKey": "Sprite",
                                                "props": { "y": 26, "x": 47, "texture": "ui/jxyx.png" },
                                                "nodeParent": 640,
                                                "label": "Sprite",
                                                "isDirectory": false,
                                                "isAniNode": true,
                                                "hasChild": false,
                                                "compId": 641,
                                                "child": [
                                                ]
                                            },
                                            {
                                                "type": "Sprite",
                                                "searchKey": "Sprite,icon",
                                                "props": { "y": 53, "x": 708, "visible": false, "texture": "ui/pf_sp.png", "name": "icon" },
                                                "nodeParent": 640,
                                                "label": "icon",
                                                "isDirectory": false,
                                                "isAniNode": true,
                                                "hasChild": false,
                                                "compId": 678,
                                                "child": [
                                                ]
                                            }]
                                    }]
                            },
                            {
                                "type": "Script",
                                "switchAble": true,
                                "source": "src/view/ResultUI2.ts",
                                "searchKey": "Script,ResultUI2",
                                "removeAble": true,
                                "props": { "runtime": "view/ResultUI2.ts" },
                                "nodeParent": 611,
                                "label": "ResultUI2",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 642,
                                "child": [
                                ]
                            }]
                    },
                    {
                        "x": 15,
                        "type": "Box",
                        "searchKey": "Box,floatBox",
                        "props": { "y": 0, "x": 0, "visible": false, "top": 0, "right": 0, "name": "floatBox", "mouseThrough": true, "left": 0, "bottom": 0 },
                        "nodeParent": 1,
                        "label": "floatBox",
                        "isOpen": false,
                        "isDirectory": true,
                        "isAniNode": true,
                        "hasChild": true,
                        "compId": 644,
                        "child": [
                            {
                                "type": "Box",
                                "searchKey": "Box,left",
                                "props": { "width": 142, "name": "left", "left": 50, "height": 600, "centerY": 0, "anchorY": 0.5 },
                                "nodeParent": 644,
                                "label": "left",
                                "isOpen": null,
                                "isDirectory": true,
                                "isAniNode": true,
                                "hasChild": true,
                                "compId": 645,
                                "child": [
                                    {
                                        "type": "Box",
                                        "searchKey": "Box,item0",
                                        "props": { "y": 100, "x": 70, "width": 130, "name": "item0", "height": 160, "anchorY": 0.5, "anchorX": 0.5 },
                                        "nodeParent": 645,
                                        "label": "item0",
                                        "isDirectory": true,
                                        "isAniNode": true,
                                        "hasChild": true,
                                        "compId": 646,
                                        "child": [
                                            {
                                                "type": "Clip",
                                                "searchKey": "Clip,Pic",
                                                "props": { "width": 130, "skin": "gamebox/bg_hz.png", "name": "Pic", "height": 130 },
                                                "nodeParent": 646,
                                                "label": "Pic",
                                                "isDirectory": true,
                                                "isAniNode": true,
                                                "hasChild": true,
                                                "compId": 647,
                                                "child": [
                                                    {
                                                        "type": "Sprite",
                                                        "searchKey": "Sprite",
                                                        "props": { "width": 130, "texture": "gamebox/but3.png", "renderType": "mask", "height": 130 },
                                                        "nodeParent": 647,
                                                        "label": "Sprite",
                                                        "isDirectory": false,
                                                        "isAniNode": true,
                                                        "hasChild": false,
                                                        "compId": 648,
                                                        "child": [
                                                        ]
                                                    }]
                                            },
                                            {
                                                "type": "Button",
                                                "searchKey": "Button",
                                                "props": { "y": 140, "x": 1, "width": 128, "stateNum": 1, "skin": "gamebox/btn_djqw.png", "height": 42 },
                                                "nodeParent": 646,
                                                "label": "Button",
                                                "isDirectory": false,
                                                "isAniNode": true,
                                                "hasChild": false,
                                                "compId": 649,
                                                "child": [
                                                ]
                                            }]
                                    },
                                    {
                                        "type": "Box",
                                        "searchKey": "Box,item0",
                                        "props": { "y": 300, "x": 70, "width": 130, "name": "item0", "height": 160, "anchorY": 0.5, "anchorX": 0.5 },
                                        "nodeParent": 645,
                                        "label": "item0",
                                        "isDirectory": true,
                                        "isAniNode": true,
                                        "hasChild": true,
                                        "compId": 650,
                                        "child": [
                                            {
                                                "type": "Clip",
                                                "searchKey": "Clip,Pic",
                                                "props": { "width": 130, "skin": "gamebox/bg_hz.png", "name": "Pic", "height": 130 },
                                                "nodeParent": 650,
                                                "label": "Pic",
                                                "isDirectory": true,
                                                "isAniNode": true,
                                                "hasChild": true,
                                                "compId": 651,
                                                "child": [
                                                    {
                                                        "type": "Sprite",
                                                        "searchKey": "Sprite",
                                                        "props": { "width": 130, "texture": "gamebox/but3.png", "renderType": "mask", "height": 130 },
                                                        "nodeParent": 651,
                                                        "label": "Sprite",
                                                        "isDirectory": false,
                                                        "isAniNode": true,
                                                        "hasChild": false,
                                                        "compId": 652,
                                                        "child": [
                                                        ]
                                                    }]
                                            },
                                            {
                                                "type": "Button",
                                                "searchKey": "Button",
                                                "props": { "y": 140, "x": 1, "width": 128, "stateNum": 1, "skin": "gamebox/btn_djqw.png", "height": 42 },
                                                "nodeParent": 650,
                                                "label": "Button",
                                                "isDirectory": false,
                                                "isAniNode": true,
                                                "hasChild": false,
                                                "compId": 653,
                                                "child": [
                                                ]
                                            }]
                                    },
                                    {
                                        "type": "Box",
                                        "searchKey": "Box,item0",
                                        "props": { "y": 500, "x": 71, "width": 130, "visible": false, "name": "item0", "height": 160, "anchorY": 0.5, "anchorX": 0.5 },
                                        "nodeParent": 645,
                                        "label": "item0",
                                        "isDirectory": true,
                                        "isAniNode": true,
                                        "hasChild": true,
                                        "compId": 654,
                                        "child": [
                                            {
                                                "type": "Clip",
                                                "searchKey": "Clip,Pic",
                                                "props": { "width": 130, "skin": "gamebox/bg_hz.png", "name": "Pic", "height": 130 },
                                                "nodeParent": 654,
                                                "label": "Pic",
                                                "isDirectory": true,
                                                "isAniNode": true,
                                                "hasChild": true,
                                                "compId": 655,
                                                "child": [
                                                    {
                                                        "type": "Sprite",
                                                        "searchKey": "Sprite",
                                                        "props": { "width": 130, "texture": "gamebox/but3.png", "renderType": "mask", "height": 130 },
                                                        "nodeParent": 655,
                                                        "label": "Sprite",
                                                        "isDirectory": false,
                                                        "isAniNode": true,
                                                        "hasChild": false,
                                                        "compId": 656,
                                                        "child": [
                                                        ]
                                                    }]
                                            },
                                            {
                                                "type": "Button",
                                                "searchKey": "Button",
                                                "props": { "y": 140, "x": 1, "width": 128, "stateNum": 1, "skin": "gamebox/btn_djqw.png", "height": 42 },
                                                "nodeParent": 654,
                                                "label": "Button",
                                                "isDirectory": false,
                                                "isAniNode": true,
                                                "hasChild": false,
                                                "compId": 657,
                                                "child": [
                                                ]
                                            }]
                                    }]
                            },
                            {
                                "type": "Box",
                                "searchKey": "Box,right",
                                "props": { "width": 153, "right": 50, "name": "right", "height": 600, "centerY": 0, "anchorY": 0.5 },
                                "nodeParent": 644,
                                "label": "right",
                                "isOpen": null,
                                "isDirectory": true,
                                "isAniNode": true,
                                "hasChild": true,
                                "compId": 658,
                                "child": [
                                    {
                                        "type": "Box",
                                        "searchKey": "Box,item0",
                                        "props": { "y": 100, "x": 70, "width": 130, "name": "item0", "height": 160, "anchorY": 0.5, "anchorX": 0.5 },
                                        "nodeParent": 658,
                                        "label": "item0",
                                        "isDirectory": true,
                                        "isAniNode": true,
                                        "hasChild": true,
                                        "compId": 659,
                                        "child": [
                                            {
                                                "type": "Clip",
                                                "searchKey": "Clip,Pic",
                                                "props": { "width": 130, "skin": "gamebox/bg_hz.png", "name": "Pic", "height": 130 },
                                                "nodeParent": 659,
                                                "label": "Pic",
                                                "isDirectory": true,
                                                "isAniNode": true,
                                                "hasChild": true,
                                                "compId": 660,
                                                "child": [
                                                    {
                                                        "type": "Sprite",
                                                        "searchKey": "Sprite",
                                                        "props": { "width": 130, "texture": "gamebox/but3.png", "renderType": "mask", "height": 130 },
                                                        "nodeParent": 660,
                                                        "label": "Sprite",
                                                        "isDirectory": false,
                                                        "isAniNode": true,
                                                        "hasChild": false,
                                                        "compId": 661,
                                                        "child": [
                                                        ]
                                                    }]
                                            },
                                            {
                                                "type": "Button",
                                                "searchKey": "Button",
                                                "props": { "y": 140, "x": 1, "width": 128, "stateNum": 1, "skin": "gamebox/btn_djqw.png", "height": 42 },
                                                "nodeParent": 659,
                                                "label": "Button",
                                                "isDirectory": false,
                                                "isAniNode": true,
                                                "hasChild": false,
                                                "compId": 662,
                                                "child": [
                                                ]
                                            }]
                                    },
                                    {
                                        "type": "Box",
                                        "searchKey": "Box,item0",
                                        "props": { "y": 300, "x": 70, "width": 130, "name": "item0", "height": 160, "anchorY": 0.5, "anchorX": 0.5 },
                                        "nodeParent": 658,
                                        "label": "item0",
                                        "isDirectory": true,
                                        "isAniNode": true,
                                        "hasChild": true,
                                        "compId": 663,
                                        "child": [
                                            {
                                                "type": "Clip",
                                                "searchKey": "Clip,Pic",
                                                "props": { "width": 130, "skin": "gamebox/bg_hz.png", "name": "Pic", "height": 130 },
                                                "nodeParent": 663,
                                                "label": "Pic",
                                                "isDirectory": true,
                                                "isAniNode": true,
                                                "hasChild": true,
                                                "compId": 664,
                                                "child": [
                                                    {
                                                        "type": "Sprite",
                                                        "searchKey": "Sprite",
                                                        "props": { "width": 130, "texture": "gamebox/but3.png", "renderType": "mask", "height": 130 },
                                                        "nodeParent": 664,
                                                        "label": "Sprite",
                                                        "isDirectory": false,
                                                        "isAniNode": true,
                                                        "hasChild": false,
                                                        "compId": 665,
                                                        "child": [
                                                        ]
                                                    }]
                                            },
                                            {
                                                "type": "Button",
                                                "searchKey": "Button",
                                                "props": { "y": 140, "x": 1, "width": 128, "stateNum": 1, "skin": "gamebox/btn_djqw.png", "height": 42 },
                                                "nodeParent": 663,
                                                "label": "Button",
                                                "isDirectory": false,
                                                "isAniNode": true,
                                                "hasChild": false,
                                                "compId": 666,
                                                "child": [
                                                ]
                                            }]
                                    },
                                    {
                                        "type": "Box",
                                        "searchKey": "Box,item0",
                                        "props": { "y": 500, "x": 70, "width": 130, "name": "item0", "height": 160, "anchorY": 0.5, "anchorX": 0.5 },
                                        "nodeParent": 658,
                                        "label": "item0",
                                        "isDirectory": true,
                                        "isAniNode": true,
                                        "hasChild": true,
                                        "compId": 667,
                                        "child": [
                                            {
                                                "type": "Clip",
                                                "searchKey": "Clip,Pic",
                                                "props": { "width": 130, "skin": "gamebox/bg_hz.png", "name": "Pic", "height": 130 },
                                                "nodeParent": 667,
                                                "label": "Pic",
                                                "isDirectory": true,
                                                "isAniNode": true,
                                                "hasChild": true,
                                                "compId": 668,
                                                "child": [
                                                    {
                                                        "type": "Sprite",
                                                        "searchKey": "Sprite",
                                                        "props": { "width": 130, "texture": "gamebox/but3.png", "renderType": "mask", "height": 130 },
                                                        "nodeParent": 668,
                                                        "label": "Sprite",
                                                        "isDirectory": false,
                                                        "isAniNode": true,
                                                        "hasChild": false,
                                                        "compId": 669,
                                                        "child": [
                                                        ]
                                                    }]
                                            },
                                            {
                                                "type": "Button",
                                                "searchKey": "Button",
                                                "props": { "y": 140, "x": 1, "width": 128, "stateNum": 1, "skin": "gamebox/btn_djqw.png", "height": 42 },
                                                "nodeParent": 667,
                                                "label": "Button",
                                                "isDirectory": false,
                                                "isAniNode": true,
                                                "hasChild": false,
                                                "compId": 670,
                                                "child": [
                                                ]
                                            }]
                                    }]
                            },
                            {
                                "type": "Button",
                                "searchKey": "Button,banner_video",
                                "props": { "width": 750, "visible": false, "name": "banner_video", "left": 0, "height": 260, "bottom": 0 },
                                "nodeParent": 644,
                                "label": "banner_video",
                                "isOpen": null,
                                "isDirectory": true,
                                "isAniNode": true,
                                "hasChild": true,
                                "compId": 682,
                                "child": [
                                    {
                                        "type": "Sprite",
                                        "searchKey": "Sprite",
                                        "props": { "width": 750, "texture": "ui/banner_bg.png", "height": 260 },
                                        "nodeParent": 682,
                                        "label": "Sprite",
                                        "isDirectory": false,
                                        "isAniNode": true,
                                        "hasChild": false,
                                        "compId": 681,
                                        "child": [
                                        ]
                                    },
                                    {
                                        "type": "Sprite",
                                        "searchKey": "Sprite,hand1",
                                        "props": { "y": 90, "x": 501, "var": "hand1", "texture": "ui/banner_hand1.png", "skewY": 0.5 },
                                        "nodeParent": 682,
                                        "label": "hand1",
                                        "isDirectory": false,
                                        "isAniNode": true,
                                        "hasChild": false,
                                        "compId": 684,
                                        "child": [
                                        ]
                                    },
                                    {
                                        "type": "Sprite",
                                        "searchKey": "Sprite,hand",
                                        "props": { "y": 90, "x": 501, "var": "hand", "texture": "ui/banner_hand.png" },
                                        "nodeParent": 682,
                                        "label": "hand",
                                        "isDirectory": false,
                                        "isAniNode": true,
                                        "hasChild": false,
                                        "compId": 683,
                                        "child": [
                                        ]
                                    }]
                            }]
                    }],
                "animations": [
                    {
                        "nodes": [
                            {
                                "target": 255,
                                "keyframes": {
                                    "alpha": [
                                        {
                                            "value": 0,
                                            "tweenMethod": "linearNone",
                                            "tween": true,
                                            "target": 255,
                                            "key": "alpha",
                                            "index": 0
                                        },
                                        {
                                            "value": 1,
                                            "tweenMethod": "linearNone",
                                            "tween": true,
                                            "target": 255,
                                            "key": "alpha",
                                            "index": 10
                                        },
                                        {
                                            "value": 0,
                                            "tweenMethod": "linearNone",
                                            "tween": true,
                                            "target": 255,
                                            "key": "alpha",
                                            "index": 20
                                        }]
                                }
                            },
                            {
                                "target": 257,
                                "keyframes": {
                                    "alpha": [
                                        {
                                            "value": 0,
                                            "tweenMethod": "linearNone",
                                            "tween": true,
                                            "target": 257,
                                            "key": "alpha",
                                            "index": 0
                                        },
                                        {
                                            "value": 1,
                                            "tweenMethod": "linearNone",
                                            "tween": true,
                                            "target": 257,
                                            "key": "alpha",
                                            "index": 10
                                        },
                                        {
                                            "value": 0,
                                            "tweenMethod": "linearNone",
                                            "tween": true,
                                            "target": 257,
                                            "key": "alpha",
                                            "index": 20
                                        }]
                                }
                            },
                            {
                                "target": 258,
                                "keyframes": {
                                    "alpha": [
                                        {
                                            "value": 0,
                                            "tweenMethod": "linearNone",
                                            "tween": true,
                                            "target": 258,
                                            "key": "alpha",
                                            "index": 0
                                        },
                                        {
                                            "value": 1,
                                            "tweenMethod": "linearNone",
                                            "tween": true,
                                            "target": 258,
                                            "key": "alpha",
                                            "index": 10
                                        },
                                        {
                                            "value": 0,
                                            "tweenMethod": "linearNone",
                                            "tween": true,
                                            "target": 258,
                                            "key": "alpha",
                                            "index": 20
                                        }]
                                }
                            },
                            {
                                "target": 264,
                                "keyframes": {
                                    "alpha": [
                                        {
                                            "value": 0,
                                            "tweenMethod": "linearNone",
                                            "tween": true,
                                            "target": 264,
                                            "key": "alpha",
                                            "index": 0
                                        },
                                        {
                                            "value": 1,
                                            "tweenMethod": "linearNone",
                                            "tween": true,
                                            "target": 264,
                                            "key": "alpha",
                                            "index": 10
                                        },
                                        {
                                            "value": 0,
                                            "tweenMethod": "linearNone",
                                            "tween": true,
                                            "target": 264,
                                            "key": "alpha",
                                            "index": 20
                                        }]
                                }
                            }],
                        "name": "ani1",
                        "id": 1,
                        "frameRate": 24,
                        "action": 2
                    },
                    {
                        "nodes": [
                        ],
                        "name": "ani2",
                        "id": 2,
                        "frameRate": 24,
                        "action": 0
                    },
                    {
                        "nodes": [
                            {
                                "target": 684,
                                "keyframes": {
                                    "x": [
                                        {
                                            "value": 500,
                                            "tweenMethod": "linearNone",
                                            "tween": true,
                                            "target": 684,
                                            "key": "x",
                                            "index": 0
                                        },
                                        {
                                            "value": 200,
                                            "tweenMethod": "quadIn",
                                            "tween": true,
                                            "target": 684,
                                            "key": "x",
                                            "index": 40
                                        }],
                                    "width": [
                                        {
                                            "value": 0,
                                            "tweenMethod": "linearNone",
                                            "tween": true,
                                            "target": 684,
                                            "key": "width",
                                            "index": 0
                                        },
                                        {
                                            "value": 80,
                                            "tweenMethod": "linearNone",
                                            "tween": true,
                                            "target": 684,
                                            "key": "width",
                                            "index": 2
                                        },
                                        {
                                            "value": 300,
                                            "tweenMethod": "linearNone",
                                            "tween": true,
                                            "target": 684,
                                            "key": "width",
                                            "index": 50
                                        }],
                                    "alpha": [
                                        {
                                            "value": 1,
                                            "tweenMethod": "linearNone",
                                            "tween": true,
                                            "target": 684,
                                            "key": "alpha",
                                            "index": 0
                                        },
                                        {
                                            "value": 1,
                                            "tweenMethod": "linearNone",
                                            "tween": true,
                                            "target": 684,
                                            "key": "alpha",
                                            "index": 55
                                        },
                                        {
                                            "value": 0,
                                            "tweenMethod": "linearNone",
                                            "tween": true,
                                            "target": 684,
                                            "key": "alpha",
                                            "index": 80
                                        }]
                                }
                            },
                            {
                                "target": 683,
                                "keyframes": {
                                    "x": [
                                        {
                                            "value": 500,
                                            "tweenMethod": "linearNone",
                                            "tween": true,
                                            "target": 683,
                                            "key": "x",
                                            "index": 0
                                        },
                                        {
                                            "value": 200,
                                            "tweenMethod": "linearNone",
                                            "tween": true,
                                            "target": 683,
                                            "key": "x",
                                            "index": 40
                                        }],
                                    "rotation": [
                                        {
                                            "value": 0,
                                            "tweenMethod": "linearNone",
                                            "tween": true,
                                            "target": 683,
                                            "key": "rotation",
                                            "index": 0
                                        },
                                        {
                                            "value": 20,
                                            "tweenMethod": "linearNone",
                                            "tween": true,
                                            "target": 683,
                                            "key": "rotation",
                                            "index": 40
                                        }]
                                }
                            }],
                        "name": "anim_banner",
                        "id": 3,
                        "frameRate": 60,
                        "action": 2
                    }]
            },

                e.GameSceneUI = t, st("ui.test.GameSceneUI", t);
            class i extends it {
                constructor() {
                    super();
                }
                createChildren() {
                    super.createChildren(), this.createView(i.uiView);
                }
            }
            i.uiView = {
                "x": 0,
                "type": "Scene",
                "selectedBox": 2,
                "selecteID": 5,
                "searchKey": "Scene",
                "props": { "width": 750, "runtime": "view/LoadUI.ts", "height": 1650 },
                "nodeParent": -1,
                "maxID": 9,
                "loadList3D": [
                ],
                "loadList": [
                    "load/bg.jpg",
                    "load/load_2.png",
                    "load/load.png",
                    "load/tips_jk.png",
                    "load/logo.png"],
                "label": "Scene",
                "isOpen": true,
                "isDirectory": true,
                "isAniNode": true,
                "hasChild": true,
                "compId": 2,
                "child": [
                    {
                        "x": 15,
                        "type": "Image",
                        "searchKey": "Image,bg",
                        "props": { "y": 0, "var": "bg", "top": 0, "skin": "load/bg.jpg", "right": 0, "left": 0, "bottom": 0 },
                        "nodeParent": 2,
                        "label": "bg",
                        "isDirectory": false,
                        "isAniNode": true,
                        "hasChild": false,
                        "compId": 3,
                        "child": [
                        ]
                    },
                    {
                        "x": 15,
                        "type": "Box",
                        "searchKey": "Box,loginView",
                        "props": { "y": 709, "x": 916, "var": "loginView", "anchorY": 0.5 },
                        "nodeParent": 2,
                        "label": "loginView",
                        "isOpen": true,
                        "isDirectory": true,
                        "isAniNode": true,
                        "hasChild": true,
                        "compId": 4,
                        "child": [
                            {
                                "x": 30,
                                "type": "Image",
                                "searchKey": "Image",
                                "props": { "skin": "load/load_2.png", "centerX": -868, "bottom": 0 },
                                "nodeParent": 4,
                                "label": "Image",
                                "isDirectory": true,
                                "isAniNode": true,
                                "hasChild": true,
                                "compId": 5,
                                "child": [
                                    {
                                        "type": "Image",
                                        "searchKey": "Image,loginprogress",
                                        "props": { "y": 0, "x": 0, "var": "loginprogress", "skin": "load/load.png", "sizeGrid": "0,0,0,0,1", "scaleY": 1, "scaleX": 1 },
                                        "nodeParent": 5,
                                        "label": "loginprogress",
                                        "isDirectory": false,
                                        "isAniNode": true,
                                        "hasChild": false,
                                        "compId": 6,
                                        "child": [
                                        ]
                                    }]
                            },
                            {
                                "x": 30,
                                "type": "Image",
                                "searchKey": "Image",
                                "props": { "skin": "load/tips_jk.png", "centerX": 0, "bottom": 200 },
                                "nodeParent": 4,
                                "label": "Image",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 7,
                                "child": [
                                ]
                            },
                            {
                                "x": 30,
                                "type": "Image",
                                "searchKey": "Image",
                                "props": { "visible": true, "top": 643, "skin": "load/logo.png", "scaleY": 1, "scaleX": 1, "centerX": 115 },
                                "nodeParent": 4,
                                "label": "Image",
                                "isDirectory": false,
                                "isAniNode": true,
                                "hasChild": false,
                                "compId": 8,
                                "child": [
                                ]
                            }]
                    }],
                "animations": [
                    {
                        "nodes": [
                        ],
                        "name": "ani1",
                        "id": 1,
                        "frameRate": 24,
                        "action": 0
                    }]
            }, e.LoadSceneUI = i, st("ui.test.LoadSceneUI", i);
        }(e.test || (e.test = {}));
    }(Ze || (Ze = {}));
    class at {
        static saveData() {
            Laya.LocalStorage.setItem(at.gameName, JSON.stringify(at.Data));
        }
        static getData() {
            let e = Laya.LocalStorage.getItem(at.gameName) ? JSON.parse(Laya.LocalStorage.getItem(at.gameName)) : null;
            e && (at.Data = e);
        }
        static addCrash(e) {
            at.Data.gold += e,
                qe.inst.showToast(`恭喜获得${e}金币`), at.saveData(), u.inst.event(u.ADD_DOLLAR, [at.Data.gold]);
        }
        static removeLocalData() {
            Laya.LocalStorage.clear();
        }
        static getRandomSkin() {
            let e = [];
            for (let t = 1; t < 10; t++) -1 == at.Data.skin.indexOf(t) && e.push(t);
            return e[Math.floor(Math.random() * (e.length - 1))];
        }
    }
    at.UserInfo = {}, at.Data = {
        level: 1,
        skin: [1],
        curSkin: 1,
        gold: 100
    }, at.gameName = n;
    class nt {
        constructor() { }
        static Init() { }
        static SoundPlay(e, t = 1) {
            if (Laya.LocalStorage.getItem("soundsound") == 0
                || Laya.LocalStorage.getItem("soundsound") == null) {

                Laya.SoundManager.playSound(`Music/${e}.mp3`, t);
            }
        }
        static StopSound(e) {
            Laya.SoundManager.stopSound(`Music/${e}.mp3`);
        }
        static StopAllSound() {
            Laya.SoundManager.stopAllSound();
        }
        static MusicPlay(e, t = 1) {
            // 1 == nt.isLoad && Laya.SoundManager.playMusic(`Music/${e}.mp3`, t);
        }
        static StopMusic() {
            Laya.SoundManager.stopMusic();
        }
    }
    nt.isLoad = !1, function (e) {
        e.BG = "bgm", e.CrossDoor = "door", e.Win = "win", e.Fail = "fail", e.Get = "get",
            e.Sick = "sick", e.Hit = "hit", e.Open = "openDoor";
    }(Je || (Je = {}));
    class rt {
        constructor() {
            u.inst.on(u.GAME_OVER, this, rt.gameOver);
        }
    }
    rt.IsStart = !1, rt.IsPause = !1, rt.IsSuccess = !1, rt.startGame = function () {
        rt.IsStart = !0, qe.inst.aldOnStart(at.Data.level, "第" + at.Data.level + "关"), u.inst.event(u.START_GAME);
    }, rt.gameOver = function (t) {
        console.log("🚀 ~ file: GameManager.ts ~ line 23 ~ GameManager ~ isSuccess", t),
            rt.IsStart = !1, rt.IsSuccess = t, t ? (nt.SoundPlay(Je.Win), qe.inst.aldOnEnd(at.Data.level, "第" + at.Data.level + "关", "complete", "过关")) : (nt.SoundPlay(Je.Fail),
                qe.inst.aldOnEnd(at.Data.level, "第" + at.Data.level + "关", "fail", "失败")), dt.Inst.GetUI(e.UIType.gameUI).Hide(),
            dt.Inst.showNextUI();
    }, rt.pauseGame = function () {
        rt.IsPause = !0, rt.IsStart;
    }, rt.remuseGame = function () {
        rt.IsPause = !1, rt.IsStart;
    }, rt.onBtnFunction = function (e, t, i) {
        e.on(t, this, () => {
            i()
            if (Laya.LocalStorage.getItem("soundsound") == 0
                || Laya.LocalStorage.getItem("soundsound") == null) {

                Laya.SoundManager.playSound("Music/btn.mp3");
            }
        }), e.on(Laya.Event.MOUSE_DOWN, this, () => {
            e.scale(.9, .9, !0);
        }), e.on(Laya.Event.MOUSE_UP, this, () => {
            e.scale(1, 1, !0);
        }), e.on(Laya.Event.MOUSE_OUT, this, () => {
            e.scale(1, 1, !0);
        });
    };
    class ot {
        static getSystemInfo() {
            "undefined" != typeof wx && (this.SystemInfo = wx.getSystemInfoSync());
        }
        static postMessage(e, t) { }
        static updateWxRank(e) {
            if ("undefined" == typeof wx || !this.checkVerison("1.9.92")) return;
            let t = {
                score: e
            };
            wx.setUserCloudStorage({
                KVDataList: [{
                    key: "score",
                    value: JSON.stringify(t)
                }]
            });
        }
        static compareVersion(e, t) {
            e = e.split("."), t = t.split(".");
            let i = Math.max(e.length, t.length);
            for (; e.length < i;) e.push("0");
            for (; t.length < i;) t.push("0");
            for (let s = 0; s < i; s++) {
                let i = parseInt(e[s]), a = parseInt(t[s]);
                if (i > a) return 1;
                if (i < a) return -1;
            }
            return 0;
        }
        static checkVerison(e) {
            return this.compareVersion(this.SystemInfo.SDKVersion, e) >= 0;
        }
        static showModal(e) {
            return new Promise((t, i) => {
                "undefined" != typeof wx && wx.showModal(Object.assign(Object.assign({}, e), {
                    success: e => {
                        e.confirm ? t(!0) : t(!1);
                    },
                    fail: () => {
                        i();
                    }
                }));
            });
        }
    }
    class ht {
        static share(e, t, i) {
            "undefined" == typeof wx || this.isTest ? t && t.success && t.success() : (this.onShowAd = !0,
                We.share.share(e.toString(), t, i).then(e => __awaiter(this, void 0, void 0, function* () {
                    this.onShowAd = !1, t && t.success && t.success(e);
                })).catch(s => __awaiter(this, void 0, void 0, function* () {
                    if (console.log("err", s), s && s.code && 1006 === s.code) if (Math.random() > Ye.getParamsInt(_e.shareRandom, 1) && !this.isFail) {
                        if (this.isFail = !0, yield ot.showModal({
                            title: "分享失败",
                            content: `${Math.random() > .5 ? "分享失败,请重新分享！" : "请分享其它群试试！"}`,
                            showCancel: !0,
                            confirmText: "去分享"
                        })) return void ht.share(e, t, i);
                    } else this.isFail = !1;
                    this.onShowAd = !1, t && t.fail ? t && t.fail && t.fail(s) : (qe.inst.showToast(s.msg),
                        console.log("分享视频失败：" + s.msg));
                })));
        }
        static pureShare(e, t = {}) {
            this.share(e, {}, Object.assign({
                closeSimulate: !0
            }, t));
        }
        static setForwardKey(e) {
            We.share.setForwardKey(e);
        }
        static getShareType(e) {
            try {
                return We.share.getType(e);
            } catch (e) {
                return console.log("1"), 2;
            }
        }
    }
    ht.isFail = !1, ht.onShowAd = !1, ht.isTest = !1, function (e) {
        e.banner_video = "banner_video";
    }(et || (et = {}));
    var lt;
    Laya.Browser.window.wx;
    class dt extends Ze.test.GameSceneUI {
        constructor() {
            super(), this.uiNum = 0, this.uiMap = new Map(), this.showIdx = -1, this.game_process = [],
                this.gameBannerBox = [], this.isLoadSub = !1, this.a = -1, this.b = 0, this.sendUINum = 0,
                this.homeIdex = 0, this.chestNum = 0, this.floatHight = 200, dt._Inst = this, tt = this;
        }
        onAwake() {
            this.game_process = qe.inst.config.game_process || [1, 2, 15, 7, 6, 0, 16, 13],
                this.uiNum = 0, this.uiMap = new Map(), this.uishowMap = new Map(), 1 == qe.inst.config.open_gridBannner && Qe.Inst.init(qe.inst.config.ad_gridBannerID, qe.inst.config.gridBannner_refresh_time),
                this.initCity(), this.playBg(), u.inst.on(u.ON_SHOW, this, this.playBg), 1 == qe.inst.isChannelUser ? this.a = 0 : 1 == qe.inst.isExportUser && (this.a = 1),
                qe.inst.config.account_topGameBtn_showType > 0 && this.initTopGameBtn(), this.width = Laya.stage.width,
                this.height = Laya.stage.height, this.goldTxt = this.getChildByName("gold").getChildByName("txt"),
                u.inst.on(u.ADD_DOLLAR, this, this.refGoldUI), this.refGoldUI(at.Data.gold), this.initFloatBox();
        }
        playBg() {
            // Laya.SoundManager.playMusic("Music/bgm.mp3", 0);
        }
        initCity() {
            e.before_pass_limit_export = !1, e.before_pass_limit_ad = !1, e.beforeGameUI = !0,
                e.afterGameUI = !1;
            let t = qe.inst.userInfo.area || "广东广州";
            if (1 != Ye.getParamsInt("ip_switch", 0)) {
                for (let i in qe.inst.config.before_pass_limit_export_city) t.indexOf(qe.inst.config.before_pass_limit_export_city[i]) > 0 && (e.before_pass_limit_export = !0);
                for (let i in qe.inst.config.before_pass_limit_ad_late_city) t.indexOf(qe.inst.config.before_pass_limit_ad_late_city[i]) > 0 && (e.before_pass_limit_ad = !0);
                for (let e in qe.inst.config.limit_area) t.indexOf(qe.inst.config.limit_area[e]) > 0 && (qe.inst.config.open_export = 0,
                    qe.inst.config.open_ad_late = 0);
                if (1 == qe.inst.config.is_gdt_user) if (0 == qe.inst.config.limit_gdt_scene_user) qe.inst.config.open_ad_late = 0,
                    qe.inst.config.open_button_move_up = 0, qe.inst.config.open_export = 0; else if ("全国" == qe.inst.config.limit_gdt_scene_area) e.before_pass_limit_ad = !0; else for (let i in qe.inst.config.limit_gdt_scene_area) t.indexOf(qe.inst.config.limit_gdt_scene_area[i]) > 0 && (e.before_pass_limit_ad = !0);
            }
        }
        showNextUI() {
            if (this.showIdx += 1, this.showIdx >= this.game_process.length && (this.showIdx = 0,
                e.afterGameUI = !1), this.nexUI = e.processUI[this.game_process[this.showIdx]],
                console.log(this.showIdx, this.nexUI), null != this.nexUI) {
                if (this.nexUI == e.UIType.gameUI) e.beforeGameUI = !1, e.afterGameUI = !0; else if (this.nexUI == e.UIType.homeUI) this.homeIdex = this.showIdx,
                    0 == qe.inst.config.next_pass_back_index && (this.game_process[this.showIdx] = null); else {
                    if (this.nexUI == e.UIType.video) return void qe.inst.onStartGame(() => {
                        this.showNextUI();
                    }, qe.inst.config.auto_video_percent);
                    if (this.nexUI == e.UIType.interstitialAd) return void qe.inst.createInterAd(() => {
                        this.showNextUI();
                    });
                }
                null != this.GetUI(this.nexUI) ? e.beforeGameUI && e.before_pass_limit_export && (this.nexUI == e.UIType.gameExport1 || this.nexUI == e.UIType.gameExport3) ? (console.log("地区限制关卡前的导出关闭"),
                    this.showNextUI()) : "singleGridUI" == this.nexUI && 1 != Ye.getParamsInt("show_grid_view", 0) ? this.showNextUI() : this.GetUI(this.nexUI).Show() : this.showNextUI();
            } else this.showNextUI();
        }
        sendUI() { }
        static get Inst() {
            return dt._Inst;
        }
        backHome() {
            this.showIdx = this.homeIdex, this.GetUI(e.UIType.homeUI).Show();
        }
        ShowGameView(t, i, s) {
            switch (t) {
                case 1:
                    this.GetUI(e.UIType.gameExport1).Show(i, s);
                    break;

                case 2:
                    this.GetUI(e.UIType.gameExport3).Show(i, s);
                    break;

                case 3:
                    this.GetUI(e.UIType.threeGridUI).Show(i, s);
                    break;

                case 4:
                    this.GetUI(e.UIType.fourGridUI).Show(i, s);
                    break;

                case 5:
                    1 == Ye.getParamsInt("show_grid_view", 0) ? this.GetUI(e.UIType.singleGridUI).Show(i, s) : s && s();
                    break;

                case 6:
                    qe.inst.onStartGame(() => {
                        s && s();
                    }, qe.inst.config.auto_video_percent);
                    break;

                case 7:
                    this.GetUI(e.UIType.resultUI2).Show(i, s);
                    break;

                default:
                    s && s();
            }
        }
        onGameOverClickCancel(e) {
            var t = 1;
            null != qe.inst.config.account_page_cancel_click_cz && (t = qe.inst.config.account_page_cancel_click_cz),
                this.ShowGameView(t, !1, () => {
                    e && e();
                });
        }
        onReviveClcikNo(e) {
            var t = 1;
            null != qe.inst.config.account_page_game_giveup_ad_cz && (t = qe.inst.config.account_page_game_giveup_ad_cz),
                this.ShowGameView(t, !0, () => {
                    e && e();
                });
        }
        RegUI(e, t) {
            dt.Inst.uiMap.set(e, t);
        }
        GetUI(e) {
            return dt.Inst.uiMap.get(e);
        }
        initTopGameBtn() {
            Laya.loader.load("prefab/moreGameBox.json", Laya.Handler.create(this, t => {
                let i = new Laya.Prefab();
                i.json = t;
                let s = Laya.Pool.getItemByCreateFun("GameBox", i.create, i);
                Laya.stage.addChild(s), s.name = "GameBox", s.x = qe.inst.getWxMenuPos().left, s.y = qe.inst.getWxMenuPos().bottom + 60,
                    1 == qe.inst.config.account_topGameBtn_showType ? s.getChildByName("truthGame").visible = !0 : s.getChildByName("moreGame").visible = !0,
                    s.on(Laya.Event.CLICK, this, () => {
                        rt.pauseGame(), this.ShowGameView(1, !1, () => {
                            rt.remuseGame(), this.GetUI(e.curUI).Show(!0, null, !1);
                        });
                    });
            }));
        }
        checkVideo() {
            this.chestNum = this.chestNum >= qe.inst.config.chest_adType.length ? 0 : this.chestNum;
            let e = 2 == qe.inst.config.chest_adType[this.chestNum];
            return this.chestNum += 1, e;
        }
        refGoldUI(e) {
            this.goldTxt.text = e;
        }
        initFloatBox() {
            this.leftItem = this.getChildByName("floatBox").getChildByName("left"), this.rightItem = this.getChildByName("floatBox").getChildByName("right"),
                this.banner_video = this.getChildByName("floatBox").getChildByName("banner_video"),
                this.banner_video.on(Laya.Event.CLICK, this, () => {
                    ht.share("banner_video", {
                        success: () => {
                            at.addCrash(500);
                        }
                    });
                }), this.listItem = [];
            for (var e = 0; e < this.leftItem.numChildren; e++) this.listItem.push(this.leftItem.getChildAt(e)),
                this.listItem.push(this.rightItem.getChildAt(e));
            this.listGameExportData = qe.inst.config.box_info;
            for (e = 0; e < this.listItem.length; ++e) this.listItem[e].visible = qe.inst.config.floatad_cancel_click_cz > -1,
                this.listItem[e].on(Laya.Event.CLICK, this, function (e) {
                    e < this.listRand.length && qe.inst.openMiniGame(this.listGameExportData[this.listRand[e]], null, function () {
                        dt.Inst.ShowGameView(qe.inst.config.floatad_cancel_click_cz, !1, () => {
                            tt.Show();
                        });
                    }, "主页悬浮icon");
                }, [e]);
            1 == qe.inst.config.open_export && this.listGameExportData.length > 0 ? (this.m_randItem(),
                Laya.timer.loop(3e3, this, this.m_randItem)) : this.leftItem.visible = this.rightItem.visible = !1;
        }
        m_randItem() {
            this.listRand = [];
            for (var e = 0; e < this.listItem.length; e++) {
                var t = qe.inst.ranInt(0, this.listGameExportData.length - 1);
                -1 != this.listRand.indexOf(t) && this.listGameExportData.length > this.listItem.length ? e -= 1 : this.listRand.push(t);
            }
            for (e = 0; e < this.listItem.length; ++e) this.m_SetItemPic(e, this.listGameExportData[this.listRand[e]]),
                this.m_Tween(e);
        }
        m_SetItemPic(e, t) {
            var i = this.listItem[e];
            i.getChildByName("Pic").skin = t.images, 9 == t.frame && (i.getChildByName("Pic").clipX = 3,
                i.getChildByName("Pic").clipY = 3, i.getChildByName("Pic").autoPlay = !0, i.getChildByName("Pic").interval = 500);
        }
        m_Tween(e) {
            Laya.Tween.to(this.listItem[e], {
                rotation: -10
            }, 100, Laya.Ease.linearNone, Laya.Handler.create(this, function (e) {
                Laya.Tween.to(this.listItem[e], {
                    rotation: 10
                }, 150, Laya.Ease.linearNone, Laya.Handler.create(this, function (e) {
                    Laya.Tween.to(this.listItem[e], {
                        rotation: 0
                    }, 100, Laya.Ease.linearNone, Laya.Handler.create(this, function (e) { }, [e]));
                }, [e]));
            }, [e]), 0);
        }
        showFloatBox(e) {
            if (1 == qe.inst.config.open_export && this.listGameExportData.length > 0) {
                this.leftItem.visible = this.rightItem.visible = !0;
                for (let t = 5; t >= 0; t--) this.listItem[t].visible = !(t >= e);
                this.leftItem.height = this.floatHight * Math.ceil(e / 2), this.rightItem.height = this.floatHight * Math.floor(e / 2);
            }
        }
    }
    class ct { }
    ct.gameCfg = null, ct.assetUrl = "", ct.sub = null, ct.isDown = !0, ct.trySkinIdex = 0,
        ct._translate = new Laya.Vector3(), function (e) {
            e[e.UP = 0] = "UP", e[e.Down = 1] = "Down", e[e.Left = 2] = "Left", e[e.Right = 3] = "Right";
        }(lt || (lt = {}));
    class pt {
        constructor() {
            this.objMap = new Map(), this.objArrMap = new Map();
        }
        static get Inst() {
            return this.inst || (this.inst = new pt()), this.inst;
        }
        setBox(e) {
            this.objMap.set(e.name, e), e.active = !1;
            this.objArrMap.set(e.name, []);
        }
        getBox(e) {
            return this.objMap.get(e)[0];
        }
        getPool(e) {
            try {
                let t, i = this.objArrMap.get(e);
                return (t = i.length > 0 ? i.pop() : this.objMap.get(e).clone()).active = !0, t;
            } catch (t) {
                console.error(e, t);
            }
        }
        recoverPool(e) {
            e.active = !1;
            let t = this.objArrMap.get(e.name);
            t && t.push(e);
        }
        clearPool(e) {
            this.objArrMap.get(e.name).length = 0;
        }
    }
    class gt {
        constructor() {
            this.filePath = ct.assetUrl + "d3/LayaScene_SampleScene/Conventional/SampleScene.ls",
                this.texPath = "d3/LayaScene_SampleScene/Conventional/Assets/fbx/tex/", this.ItemNames = [];
        }
        loadModels(e = null) {
            this.initTexture(), Laya.Sprite3D.load(this.filePath, Laya.Handler.create(this, t => {
                let i = t.numChildren;
                for (let e = 0; e < i; e++) {
                    let i = t.getChildAt(e);
                    this.ItemNames.push(i.name), pt.Inst.setBox(i);
                }
                e && e();
            }));
        }
        getModelCloneByName(e) {
            return pt.Inst.getPool(e);
        }
        recoverModel(e) {
            pt.Inst.recoverPool(e);
        }
        loadOtherPlayer(e) {
            Laya.Sprite3D.load(this.playerPath, Laya.Handler.create(this, t => {
                let i = t.numChildren;
                for (let e = 0; e < i; e++) {
                    let i = t.getChildAt(e);
                    this.ItemNames.push(i.name), pt.Inst.setBox(i);
                }
                e && e();
            }));
        }
        getOrgModle(e) {
            return pt.Inst.getBox(e);
        }
        initTexture() {
            let e = [];
            for (let t = 1; t < 10; t++) e.push(this.texPath + t + ".jpg");
            Laya.loader.load(e, Laya.Handler.create(this, () => { }));
        }
        getTexture(e) {
            return Laya.loader.getRes(this.texPath + e + ".jpg");
        }
        static get Inst() {
            return this._ins || (this._ins = new gt()), this._ins;
        }
    }
    class ut extends Laya.Script3D {
        constructor() {
            super(), this.dir = 1, this.isMove = !1, this.allTime = 1500, this.curTime = 0,
                this.isDestory = !1;
        }
        init(e, t) {
            if (this.enabled = !0, this.barrierType = e.ModelName, this.barrierDepth = e.ItemID,
                this.model = this.owner, this.model.transform.position = new Laya.Vector3(e.posX, e.posY, e.posZ),
                this.model.transform.rotationEuler = new Laya.Vector3(e.rotaX, 180 - e.rotaY, e.rotaZ),
                this.model.transform.setWorldLossyScale(new Laya.Vector3(e.scaleX, e.scaleY, e.scaleZ)),
                "tiao_ban" == this.barrierType) this.isX = e.Val, this.leftP = e.Val1, this.rightP = e.Val2,
                    this.isX ? (this.model.transform.position = new Laya.Vector3(this.leftP, e.posY, e.posZ),
                        ct._translate = new Laya.Vector3(.02 * this.dir, 0, 0)) : (this.model.transform.position = new Laya.Vector3(e.posX, e.posY, this.leftP),
                            ct._translate = new Laya.Vector3(0, 0, .02 * this.dir)), this._trans = this.model.getChildByName("center").transform; else if ("hei_qiu" == this.barrierType) {
                                this.model.getComponent(Laya.Rigidbody3D).clearForces();
                            }
        }
        onUpdate() {
            this.isDestory || ("jin_bi" == this.barrierType ? this.model.transform.rotate(new Laya.Vector3(0, .1, 0)) : "tiao_ban" == this.barrierType && (this.isMove ? (this.isX ? (this.model.transform.position.x <= this.leftP ? (this.dir = -1,
                this.isMove = !1, this.curTime = this.allTime) : this.model.transform.position.x >= this.rightP && (this.dir = 1,
                    this.isMove = !1, this.curTime = this.allTime), ct._translate = new Laya.Vector3(.02 * this.dir, 0, 0)) : (this.model.transform.position.z <= this.leftP ? (this.dir = 1,
                        this.isMove = !1, this.curTime = this.allTime) : this.model.transform.position.z >= this.rightP && (this.dir = -1,
                            this.isMove = !1, this.curTime = this.allTime), ct._translate = new Laya.Vector3(0, 0, .02 * this.dir)),
                this.model.transform.translate(ct._translate)) : (this.curTime -= Laya.timer.delta,
                    this.curTime <= 0 && (this.isMove = !0), ct._translate = new Laya.Vector3(0, 0, 0))));
        }
        recover() {
            this.enabled = !1, this.isDestory = !0, this.destroy();
        }
        getBoxArea(e) {
            return e.x < this._trans.position.x + 1.5 && e.x > this._trans.position.x - 1.5 && e.z > this._trans.position.z - 1.5 && e.z < this._trans.position.z + 1.5;
        }
    }
    class mt extends Laya.Script3D {
        constructor() {
            super(), this.isPhysics = !0, this.subZ = ct.gameCfg.zAsub, this.subX = ct.gameCfg.xAsub,
                this.xSpeed = 0, this.zSpeed = 0, this.maxXSpeed = ct.gameCfg.xMax, this.maxZSpeed = ct.gameCfg.zMax,
                this.addZ = ct.gameCfg.zAadd, this.addX = ct.gameCfg.xAadd, this.isChangeDir = !1,
                this.maxHySpeed = Math.pow(ct.gameCfg.hyMax, 2), this.curGold = 0, this.isTiaoBan = !1,
                this.isMouseDown = !1;
        }
        init(e) {
            this.sceneCtrl = e, this.cameraCtrl = this.sceneCtrl.cameraCtrl, this.modelRoot = this.owner,
                this._tras = this.modelRoot.transform, this._tras.position = new Laya.Vector3(0, .2, 2),
                this.character = this.modelRoot.addComponent(Laya.CharacterController);
            var t = new Laya.SphereColliderShape(.2);
            t.localOffset = new Laya.Vector3(0, 0, 0), this.character.colliderShape = t, this.character.friction = 0,
                this.character.gravity = new Laya.Vector3(0, -10, 0), this.isPhysics = !0, this.curDir = lt.UP,
                this.cameraCtrl.moveDir = lt.UP, u.inst.on(u.GAME_OVER, this, this.m_gameOver);
            if (Laya.LocalStorage.getItem("soundsound") == 0
                || Laya.LocalStorage.getItem("soundsound") == null) {

                this.rollSound = Laya.SoundManager.playSound("Music/roll.mp3", 0)
            }
            this.rollSound && this.rollSound.pause(),
                this.exitPos = this._tras.position.clone();
        }
        setSpeed(e, t) {
            this.isMouseDown = !0;
            let i = new Laya.Vector3(this.xSpeed, 0, this.zSpeed);
            if (Laya.Vector3.scalarLengthSquared(i) < this.maxHySpeed && (e > 0 ?
                this.xSpeed += this.addX : e < 0 &&
                (this.xSpeed -= this.addX),
                t > 0 ? this.zSpeed += this.addZ : t < 0 && (this.zSpeed -= this.addZ),
                Math.abs(this.xSpeed) >= this.maxXSpeed && (this.xSpeed = this.maxXSpeed * (this.xSpeed > 0 ? 1 : -1)),
                Math.abs(this.zSpeed) >= this.maxZSpeed && (this.zSpeed = this.maxZSpeed * (this.zSpeed > 0 ? 1 : -1))),
                0 == this.isChangeDir) {
                let e = lt.UP;
                switch (
                this.maxZSpeed == Math.abs(this.zSpeed) ?
                    this.zSpeed < 0 && (e = lt.Down,
                        console.log("nextdir down")) :
                    this.maxXSpeed - .01 <= Math.abs(this.xSpeed) && (this.xSpeed > 0 ?
                        (e = lt.Left,
                            console.log("nextdir left")) :
                        (e = lt.Right, console.log("nextdir right"))), this.curDir) {
                    case lt.UP:
                        this.curDir = e;
                        break;

                    case lt.Down:
                        e == lt.Down ? this.curDir = lt.UP : e == lt.Left ? this.curDir = lt.Right : e == lt.Right && (this.curDir = lt.Left);
                        break;

                    case lt.Left:
                        e == lt.Down ? this.curDir = lt.Right : e == lt.Left ? this.curDir = lt.Down : e == lt.Right && (this.curDir = lt.UP);
                        break;

                    case lt.Right:
                        e == lt.Down ? this.curDir = lt.Left : e == lt.Left ? this.curDir = lt.UP : e == lt.Right && (this.curDir = lt.Down);
                }
                if (this.cameraCtrl.moveDir != this.curDir) {
                    switch (this.isChangeDir = !0, this.curDir) {
                        case lt.UP:
                            console.log("curDir up");
                            break;

                        case lt.Down:
                            console.log("curDir Down");
                            break;

                        case lt.Left:
                            console.log("curDir Left");
                            break;

                        case lt.Right:
                            console.log("curDir Right");

                    }
                    this.cameraCtrl.moveDir = this.curDir,
                        this.cameraCtrl.onCameraChange(() => {
                            this.zSpeed = 0, this.xSpeed = 0;
                        });
                }
            }
        }
        reset() {
            this.isTiaoBan = !1, this.character.enabled = !0, this.isPhysics = !0, this.curGold = 0,
                this._tras.position = new Laya.Vector3(0, .2, 2), this.sceneCtrl.cameraRoot.transform.position = new Laya.Vector3(0, .2, 2),
                this.curDir = lt.UP, this.cameraCtrl.moveDir = this.curDir, this.zSpeed = 0, this.xSpeed = 0,
                this.tiaobanCtrl = null, this.character.move(new Laya.Vector3(0, 0, 0)), this.cameraCtrl.onCameraChange(() => { }),
                this.rollSound && this.rollSound.pause(), this.exitPos = this._tras.position.clone();
        }
        onCollisionEnter(e) {
            if (!rt.IsStart || rt.IsPause) return;
            let t = e.other.owner;
            if ("hei_qiu" != t.name) {

                this.exitPos = e.other.owner.transform.position
            }
            // this.exitPos = new Laya.Vector3(this._tras.position.x, this._tras.position.y, this._tras.position.z),
            "po_dao" == t.name ?
                (this.lastSubZ = this.subZ, this.subZ = 0)
                :
                "jin_bi" == t.name ?
                    (t.active = !1,
                        this.curGold += 10,
                        ((Laya.LocalStorage.getItem("soundsound") == 0
                            || Laya.LocalStorage.getItem("soundsound") == null) && Laya.SoundManager.playSound("Music/gold.mp3"))

                    )
                    :
                    "tiao_ban" == t.name ? (this.character.enabled = !1,
                        this.isPhysics = !1, this.tiaobanCtrl = t.getComponent(ut), this.isTiaoBan = !0,
                        console.log("tiaobanCtrl", this.tiaobanCtrl)) :
                        "zhongdian" == t.name ? u.inst.event(u.GAME_OVER, [!0]) :
                            "hei_qiu" == t.name &&
                            ((Laya.LocalStorage.getItem("soundsound") == 0
                                || Laya.LocalStorage.getItem("soundsound") == null) && Laya.SoundManager.playSound("Music/hitball.mp3"))

        }
        onCollisionExit(e) {

            if (!rt.IsStart || rt.IsPause) return;
            let t = e.other.owner;
            "po_dao" == t.name ? this.subZ = this.lastSubZ : t.name;
        }
        onUpdate() {
            if (this.cameraCtrl.Update(), !rt.IsStart || rt.IsPause) return;
            this.isMouseDown || (this.xSpeed = (Math.abs(this.xSpeed) - this.subX) * (this.xSpeed > 0 ? 1 : -1),
                this.zSpeed = (Math.abs(this.zSpeed) - this.subZ) * (this.zSpeed > 0 ? 1 : -1),
                Math.abs(this.xSpeed) < this.subX && (this.xSpeed = 0, this.rollSound && this.rollSound.pause()),
                Math.abs(this.zSpeed) < this.subZ && (this.zSpeed = 0, this.rollSound && this.rollSound.pause()));
            let e = new Laya.Vector3();
            switch (this.curDir) {
                case lt.UP:
                    e = new Laya.Vector3(this.xSpeed, 0, this.zSpeed);
                    break;

                case lt.Down:
                    e = new Laya.Vector3(-this.xSpeed, 0, -this.zSpeed);
                    break;

                case lt.Left:
                    e = new Laya.Vector3(this.zSpeed, 0, -this.xSpeed);
                    break;

                case lt.Right:
                    e = new Laya.Vector3(-this.zSpeed, 0, this.xSpeed);
            }
            this.isPhysics ? this.character.move(e) : this._tras.translate(e, !1), this._tras.rotate(new Laya.Vector3(10 * e.z, 0, -10 * e.x), !1),
                this._tras.position.y < -20 && this.dead(), this.isTiaoBan && (this._tras.translate(new Laya.Vector3(-1 * ct._translate.x, 0, -1 * ct._translate.z), !1),
                    this.tiaobanCtrl.getBoxArea(this._tras.position) || (this.isTiaoBan = !1, this.character.enabled = !0,
                        this.isPhysics = !0)), this.isMouseDown = !1;
        }
        dead() {
            this.character.enabled = !1, this._tras.position = this.exitPos, this.curDir = lt.UP,
                this.cameraCtrl.moveDir = this.curDir, this.cameraCtrl.onCameraChange(() => { }),
                this.zSpeed = 0, this.xSpeed = 0, this.rollSound && this.rollSound.pause(), dt.Inst.GetUI(e.UIType.gameUI).Hide(),
                dt.Inst.GetUI(e.UIType.reviveUI).Show();
        }
        revive() {


            console.log("复活位置：", this._tras.position)
            this._tras.position = new Laya.Vector3(this.exitPos.x, this.exitPos.y + 2, this.exitPos.z)
            this.character.enabled = !0;

        }
        m_gameOver(e) {
            rt.gameOver(e), rt.remuseGame(), e && (at.Data.level += 1), this.curGold > 0 && (at.addCrash(this.curGold),
                at.saveData()), this.reset();
        }
    }
    class yt extends Laya.Script {
        constructor() {
            super(...arguments), this.obj = null, this.camera = null, this.rotationCamera = null,
                this.followObj = null, this.rotationObj = null, this.isAutoCorrect = !0, this.tw = null,
                this.perFrame = 2, this.isTurnReverse = !1, this.frameFlag = 10, this.cameraOffX = 0,
                this.cameraOffY = 0, this.cameraOffZ = 0, this.isZ = !0, this.isChange = !1, this.isFront = !0,
                this.isJump = !1, this.isChangeTarget = !1, this.isUpdate = !0;
        }
        Update() {
            this.camera.active && this.cameraFollow(.05);
        }
        initCtrl(e, t, i, s, a) {
            this.obj = e, this.camera = t, this.followObj = i, s && (this.isTurnReverse = s),
                a && (this.isAutoCorrect = !1);
        }
        onFront(e) {
            Laya.Tween.to(this.followObj.transform, {
                localRotationEulerY: 0
            }, 600, null, Laya.Handler.create(this, () => {
                e && e();
            }));
        }
        onBack(e) {
            Laya.Tween.to(this.followObj.transform, {
                localRotationEulerY: 180
            }, 600, null, Laya.Handler.create(this, () => {
                e && e();
            }));
        }
        onLeft(e) {
            Laya.Tween.to(this.followObj.transform, {
                localRotationEulerY: 90
            }, 600, null, Laya.Handler.create(this, () => {
                e && e();
            }));
        }
        onRight(e) {
            let t = 0 == this.followObj.transform.localRotationEulerY ? -90 : 270;
            Laya.Tween.to(this.followObj.transform, {
                localRotationEulerY: t
            }, 600, null, Laya.Handler.create(this, () => {
                e && e();
            }));
        }
        onCameraChange(e) {
            //旋转相机
            switch (this.moveDir) {
                case lt.UP:
                    this.onFront(e);
                    break;

                case lt.Down:
                    this.onBack(e);
                    break;

                case lt.Left:
                    this.onLeft(e);
                    break;

                case lt.Right:
                    this.onRight(e);
                    break;
            }
        }
        updatePosition() {
            this.obj && this.followObj && this.obj.transform && (this.followObj.transform.position = new Laya.Vector3(this.obj.transform.position.x, this.obj.transform.position.y, this.obj.transform.position.z));
        }
        cameraFollow(e) {// e = 0.05
            if (this.followObj && this.obj) {
                var t = this.followObj.transform.position,
                    i = this.lerp(t.x, this.obj.transform.position.x, e),
                    s = this.lerp(t.y, this.obj.transform.position.y, 1);
                this.lerp(t.z, this.obj.transform.position.z, 1);
                console.log("isChange?", this.isChange)
                this.isChange ? this.followObj.transform.localPositionY = s + this.cameraOffY :
                    this.followObj.transform.localPosition = new Laya.Vector3(i + this.cameraOffX, s + this.cameraOffY, this.obj.transform.position.z);
            }
        }
        playCameraAni(e) {
            this.isUpdate = !1,
                window.canMove = !1,
                console.log("this.followObj.transform:", this.followObj.transform.localRotationEulerY),
                Laya.Tween.to(this.followObj.transform, {
                    localRotationEulerY: this.followObj.transform.localRotationEulerY + e
                }, 100, Laya.Ease.linearNone, Laya.Handler.create(this, this.onplayCameraAniEnd));
        }
        onplayCameraAniEnd() {
            window.canMove = !0
            console.log("onplayCameraAniEnd this.followObj.transform:", this.followObj.transform.localRotationEulerY);
        }
        changeTarget(e) {
            this.obj = e;
        }
        updateCamera() {
            if (!this.isUpdate) return;
            let e = this.followObj.transform.localRotationEulerY, t = this.obj.transform.localRotationEulerY;
            this.isFront || (t += 180), e < -100 && t > 100 ? (e = 360 + e, this.followObj.transform.localRotationEulerY = e) : e > 100 && t < -100 && (e -= 360,
                this.followObj.transform.localRotationEulerY = e);
            let i = Laya.MathUtil.lerp(e, t, .05);
            this.followObj.transform.localRotationEulerY = i;
        }
        updateTargetCamera() {
            let e = this.followObj.transform.localRotationEulerY, t = this.changeTargetSp.transform.localRotationEulerY, i = this.followObj.transform.localRotationEulerX, s = this.changeTargetSp.transform.localRotationEulerX;
            e < -100 && t > 100 ? (e = 360 + e, this.followObj.transform.localRotationEulerY = e) : e > 100 && t < -100 && (e -= 360,
                this.followObj.transform.localRotationEulerY = e), t += 180;
            let a = Laya.MathUtil.lerp(e, t, .1);
            Math.abs(e - t) >= 350 && (a = t);
            let n = Laya.MathUtil.lerp(i, s, .1);
            Math.abs(i - s) >= 350 && (n = s), this.followObj.transform.localRotationEulerY = a,
                this.followObj.transform.localRotationEulerX = n;
        }
        lerp(e, t, i) {
            return i <= 0 ? e : i >= 1 ? t : i * t + (1 - i) * e;
        }
        moveCamera() {
            if (!this.followObj) return;
            if (!this.followObj.transform) return void console.log("镜头跟踪失败中");
            let e = this.followObj.transform.localRotationEulerY;
            this.isTurnReverse && (e > 0 && e <= 180 ? e -= 180 : e < 0 && e >= -180 && (e += 180));
            let t = this.obj.transform.rotationEuler.y, i = 0, s = 0;
            e >= -180 && e <= -120 && t <= 180 && t >= 120 ? (i = e - -180 + (180 - t), s = 1) : t >= -180 && t <= -120 && e <= 180 && e >= 120 ? (i = t - -180 + (180 - e),
                s = -1) : t > e ? (i = t - e, s = -1) : (i = e - t, s = 1);
            this.tw && Laya.Tween.clear(this.tw), this.tw = Laya.Tween.to({
                value: 0
            }, {
                value: 1,
                update: new Laya.Handler(this, e => {
                    this.followObj && this.followObj.transform && (1 == s ? this.followObj.transform.rotate(new Laya.Vector3(0, -i / this.frameFlag, 0), !1, !1) : this.followObj.transform.rotate(new Laya.Vector3(0, i / this.frameFlag, 0), !1, !1),
                        0);
                })
            }, Math.floor(1e3 * this.perFrame / 60), Laya.Ease.cubicInOut, new Laya.Handler(this, () => { }), 0, !0, !0);
        }
        stopCameraMove() {
            this.tw && Laya.Tween.clear(this.tw), this.isAutoCorrect = !1;
        }
        continueCameraMove(e) {
            e && (this.camera.transform.localPosition = e), this.isAutoCorrect = !0, this.rotationCamera && this.rotationCamera.active || (this.camera.active = !0);
        }
    }
    class It {
        static m_FindChildsByName(e, t, i = []) {
            if (!t) return i;
            if (t.name == e && i.push(t), !t.numChildren) return i;
            for (var s = 0; s < t.numChildren; ++s) this.m_FindChildsByName(e, t.getChildAt(s), i);
            return i;
        }
        static GetComponent(e, t = null) {
            if (!e || !t) return null;
            var i = t.getComponent(e);
            if (i) return i;
            if (!t.numChildren) return null;
            for (var s = 0; s < t.numChildren; ++s) {
                var a = t.getChildAt(s);
                if (a && (i = this.GetComponent(e, a))) return i;
            }
            return null;
        }
        static getStrColorToRbg(e) {
            let t = [];
            for (let i = 0; i < e.length; i += 2) t.push(parseInt("0x" + e.slice(i, i + 2)) / 255);
            return new Laya.Vector4(t[0], t[1], t[2], 1);
        }
        static m_InitEffect(e, t = !1, i = []) {
            if (!e) return [];
            e.particleSystem && i.push(e.particleSystem);
            for (var s = 0; s < e.numChildren; ++s) {
                var a = e.getChildAt(s);
                a.numChildren ? It.m_InitEffect(a, t, i) : a.particleSystem && i.push(a.particleSystem);
            }
            return t ? It.m_PlayEffect(i) : It.m_StopEffect(i), i;
        }
        static m_PlayEffect(e) {
            if (e) for (var t in e) e[t] && e[t].play();
        }
        static getRandomArrayElements(e, t) {
            let i, s, a = e.length, n = a - t;
            for (; a-- > n;) i = e[s = Math.floor((a + 1) * Math.random())], e[s] = e[a], e[a] = i;
            return e.slice(n);
        }
        static m_StopEffect(e) {
            if (e) for (var t in e) e[t] && e[t].stop();
        }
        static getTriangleIdex(e) {
            let t = 0, i = 0, s = 0;
            for (let a = 0; a < 100; a++) {
                if (!(t < e)) return i = (s = a - 1) - (t - e), console.log(e, "curX", i, "curY", s),
                    new Laya.Vector2(i, s);
                t += a;
            }
        }
        static getTriangleIdex2(e) {
            let t = 0, i = 0, s = 0;
            for (let a = 0; a < 100; a++) {
                if (!(t < e)) return i = t - e - (s = a) + 1, new Laya.Vector2(i, s);
                t += 2 * (a + 1) - 1;
            }
        }
        static onUIScale(e) {
            Laya.Tween.to(e, {
                scaleX: .8,
                scaleY: .8
            }, 500, Laya.Ease.linearIn, new Laya.Handler(this, () => {
                Laya.Tween.to(e, {
                    scaleX: 1,
                    scaleY: 1
                }, 500, Laya.Ease.linearIn);
            }));
        }
        static FindChildByName(e, t) {
            let i = t => {
                if (t.name == e) return t;
                let s = null;
                for (let a = 0; a < t.numChildren; a++) {
                    if (t.getChildAt(a).name == e) {
                        s = t.getChildAt(a);
                        break;
                    }
                    if (t.getChildAt(a).numChildren && (s = i(t.getChildAt(a)))) break;
                }
                return s;
            };
            if (t.name == e) return t;
            for (let e = 0; e < t.numChildren; e++) {
                let s = i(t.getChildAt(e));
                if (s) return s;
            }
            return null;
        }
        static ColiderCanShow(e, t, i) {
            let s = new Laya.Vector3();
            s = i ? It.FindChildByName(i, e).meshRenderer.bounds.getExtent() : e.meshRenderer.bounds.getExtent();
            let a = e.addChild(new Laya.PixelLineSprite3D(12));
            t && (a.transform.localPositionY = t), a.addLine(new Laya.Vector3(s.x, -s.y, -s.z), new Laya.Vector3(-s.x, -s.y, -s.z), Laya.Color.GREEN, Laya.Color.GREEN),
                a.addLine(new Laya.Vector3(s.x, -s.y, -s.z), new Laya.Vector3(s.x, s.y, -s.z), Laya.Color.GREEN, Laya.Color.GREEN),
                a.addLine(new Laya.Vector3(s.x, s.y, -s.z), new Laya.Vector3(-s.x, s.y, -s.z), Laya.Color.GREEN, Laya.Color.GREEN),
                a.addLine(new Laya.Vector3(-s.x, s.y, -s.z), new Laya.Vector3(-s.x, -s.y, -s.z), Laya.Color.GREEN, Laya.Color.GREEN),
                a.addLine(new Laya.Vector3(s.x, -s.y, s.z), new Laya.Vector3(-s.x, -s.y, s.z), Laya.Color.GREEN, Laya.Color.GREEN),
                a.addLine(new Laya.Vector3(s.x, -s.y, s.z), new Laya.Vector3(s.x, s.y, s.z), Laya.Color.GREEN, Laya.Color.GREEN),
                a.addLine(new Laya.Vector3(s.x, s.y, s.z), new Laya.Vector3(-s.x, s.y, s.z), Laya.Color.GREEN, Laya.Color.GREEN),
                a.addLine(new Laya.Vector3(-s.x, s.y, s.z), new Laya.Vector3(-s.x, -s.y, s.z), Laya.Color.GREEN, Laya.Color.GREEN),
                a.addLine(new Laya.Vector3(s.x, -s.y, -s.z), new Laya.Vector3(s.x, -s.y, s.z), Laya.Color.GREEN, Laya.Color.GREEN),
                a.addLine(new Laya.Vector3(s.x, s.y, -s.z), new Laya.Vector3(s.x, s.y, s.z), Laya.Color.GREEN, Laya.Color.GREEN),
                a.addLine(new Laya.Vector3(-s.x, s.y, -s.z), new Laya.Vector3(-s.x, s.y, s.z), Laya.Color.GREEN, Laya.Color.GREEN),
                a.addLine(new Laya.Vector3(-s.x, -s.y, -s.z), new Laya.Vector3(-s.x, -s.y, s.z), Laya.Color.GREEN, Laya.Color.GREEN);
        }
        static onUINavRoate(e) {
            Laya.Tween.to(e, {
                rotation: -15
            }, 100, Laya.Ease.linearIn, new Laya.Handler(this, () => {
                Laya.Tween.to(e, {
                    rotation: 15
                }, 200, Laya.Ease.linearIn, new Laya.Handler(this, () => {
                    Laya.Tween.to(e, {
                        rotation: -15
                    }, 200, Laya.Ease.linearIn, new Laya.Handler(this, () => {
                        Laya.Tween.to(e, {
                            rotation: 0
                        }, 100, Laya.Ease.linearIn);
                    }));
                }));
            }));
        }
        static NumLerp(e, t, i) {
            return e + (t - e) * i;
        }
        static lerp(e, t, i) {
            return i <= 0 ? e : i >= 1 ? t : i * t + (1 - i) * e;
        }
        static ContainsPoint(e, t) {
            var i = e.length - 1, s = !1;
            for (let a = 0; a < e.length; i = a++) (e[a].z <= t.z && t.z < e[i].z || e[i].z <= t.z && t.z < e[a].z) && t.x < (e[i].x - e[a].x) * (t.z - e[a].z) / (e[i].z - e[a].z) + e[a].x && (s = !s);
            return s;
        }
        static shuffleArray(e) {
            return e.sort((e, t) => Math.random() > .5 ? -1 : 1);
        }
        static BoxCheck_2D_Normal(e, t, i, s) {
            let a = e.x, n = t.x, r = e.y, o = t.y, h = i.x, l = s.x, d = i.y, c = s.y, p = h - a, g = d - r, u = Math.abs(g), m = Math.abs(p), y = (o + c) / 2, I = (n + l) / 2;
            return {
                isHit: u < y && m < I,
                xDis: m,
                xRange: I,
                yDis: u,
                yRange: y,
                xWay: p,
                yWay: g
            };
        }
        static bezier(e, t, i, s) {
            var a = Math.pow(1 - e, 2), n = new Laya.Point(t.x * a, t.y * a), r = 2 * e * (1 - e), o = new Laya.Point(s.x * r, s.y * r), h = Math.pow(e, 2), l = new Laya.Point(i.x * h, i.y * h), d = new Laya.Point(n.x + o.x + l.x, n.y + o.y + l.y);
            return new Laya.Vector3(d.x, 0, d.y);
        }
        static ranInt(e, t) {
            return Math.floor(Math.random() * (t - e + 1)) + e;
        }
        static CameraTOTex(e, t, i) {
            return e.active = !0, e.renderTarget = new Laya.RenderTexture(t, i), e.renderingOrder = -1,
                e.clearFlag = Laya.CameraClearFlags.Sky, new Laya.Texture(e.renderTarget, Laya.Texture.DEF_UV);
        }
        static CancelRecevieShoads(e) {
            for (let t = 0; t < e.numChildren; t++) {
                let i = e.getChildAt(t);
                i.numChildren > 0 ? this.CancelRecevieShoads(i) : i.meshRenderer ? i.meshRenderer.receiveShadow = !1 : i.skinnedMeshRenderer && (i.skinnedMeshRenderer.receiveShadow = !1);
            }
        }
        static V3ToV2(e, t) {
            var i = new Laya.Vector4();
            return e.viewport.project(t, e.projectionViewMatrix, i), new Laya.Vector2(i.x, i.y);
        }
        static getAngle(e, t) {
            let i = new Laya.Vector3();
            return Laya.Vector3.subtract(e, t, i), (i.x < 0 ? 180 + (Math.atan(i.x / i.z) / Math.PI * 180 > 0 ? Math.atan(i.x / i.z) / Math.PI * 180 : 180 - Math.abs(Math.atan(i.x / i.z) / Math.PI * 180)) : 180 + (Math.atan(i.x / i.z) / Math.PI * 180 > 0 ? Math.atan(i.x / i.z) / Math.PI * 180 + 180 : 360 - Math.abs(Math.atan(i.x / i.z) / Math.PI * 180))) % 360;
        }
        static animatorEndRun(e, t, i = 1, s) {
            if (!e) return;
            e.play(t, 0, 0), e.speed = i;
            let a = e._update;
            e._updateOrigin = e._updateOrigin || a;
            e._update = function () {
                e._updateOrigin(), e.getControllerLayer(0).getCurrentPlayState().normalizedTime > 1 && (s(),
                    e._update = e._updateOrigin);
            };
        }
    }
    It.upV3 = new Laya.Vector3(0, 1, 0);
    class ft extends Laya.Script {
        constructor() {
            super(), this.BarrierAry = [], this.isMouseDown = !1, this._startTouchPt = new Laya.Vector2(),
                this.isInit = !0, this.isStart = !1, this.R = 1.5, this.x0 = 0, this.y0 = 1.5;
        }
        onAwake() {
            ft.Inst = this, this.init();
        }
        init() {
            this.constansCfg = Laya.loader.getRes("json/constansCfg.json"), ct.gameCfg = this.constansCfg,
                this.newScene = this.owner.addChildAt(new Laya.Scene3D(), 0), this.gameScene = this.newScene.addChild(new Laya.Sprite3D()),
                this.sceneMap = this.gameScene.addChild(new Laya.Sprite3D("map"));
            var e = this.newScene;
            e.ambientMode = 0, e.ambientColor = new Laya.Vector3(.6, .6, .6), this.DirectionLight = e.addChild(new Laya.DirectionLight()),
                this.DirectionLight.color = new Laya.Vector3(1, 1, 1), this.DirectionLight.transform.rotationEuler = new Laya.Vector3(-140, 120, 0),
                this.DirectionLight.intensity = .8, this.DirectionLight.shadowMode = 1, this.DirectionLight.shadowDistance = 10,
                this.DirectionLight.shadowCascadesMode = 1, this.DirectionLight.shadowResolution = 1024,
                this.DirectionLight.shadowStrength = .5, this.cameraRoot = this.gameScene.addChild(new Laya.Sprite3D("cameraRoot")),
                this.cameraRoot.transform.rotationEuler = new Laya.Vector3(0, 0, 0), this.cameraRoot.transform.localPosition = new Laya.Vector3(),
                this.MainCamera || (this.MainCamera = new Laya.Camera(0, .1, 300), this.MainCamera.enableHDR = !1,
                    this.cameraRoot.addChild(this.MainCamera), this.MainCamera.clearFlag = Laya.CameraClearFlags.SolidColor,
                    this.cameraCtrl = this.MainCamera.addComponent(yt), this.initNorCamera()), e.enableFog = !1,
                e.fogColor = new Laya.Vector3(93 / 255, 205 / 255, 254 / 255), e.fogStart = 20,
                e.fogRange = 80, this.initScene(), this.initPlayer(), u.inst.on(u.START_GAME, this, () => { }),
                u.inst.on(u.GAME_OVER, this, () => {
                    this.m_gameOver();
                }), u.inst.on(u.CHANGE_SKIN, this, e => {
                    this.changePlayer(e);
                }), 1 == Ye.getParamsInt("banner_video", 0) ? (console.log("test_a"), dt.Inst.banner_video.visible = !0,
                    Laya.timer.loop(1e4, this, () => {
                        qe.inst.toggleBanner = !qe.inst.toggleBanner, console.log("切换：" + (qe.inst.toggleBanner ? "banner" : "视频"));
                    })) : (dt.Inst.banner_video.visible = !1, qe.inst.toggleBanner = !0, qe.inst.showBanner());
        }
        initNorCamera() {
            this.MainCamera.transform.localPosition = new Laya.Vector3(this.constansCfg.defCameraX, this.constansCfg.defCameraY, this.constansCfg.defCameraZ),
                this.MainCamera.transform.localRotationEuler = new Laya.Vector3(this.constansCfg.defCameraRX, this.constansCfg.defCameraRY, 0);
        }
        initPlayer() {
            this.playerSp = this.gameScene.addChild(gt.Inst.getModelCloneByName("1")), this.cameraCtrl.initCtrl(this.playerSp, this.MainCamera, this.cameraRoot),
                this.playerSp.transform.rotationEuler = new Laya.Vector3(0, 0, 0), It.CancelRecevieShoads(this.playerSp),
                this.playCtrl = this.playerSp.getComponent(mt) || this.playerSp.addComponent(mt),
                this.playCtrl.init(this), this.playerTrans = this.playerSp.transform, this.playerMat = this.playerSp.meshRenderer.material,
                this.playerMat.albedoTexture = gt.Inst.getTexture(at.Data.curSkin);
        }
        changePlayer(e) {
            this.playerMat.albedoTexture = gt.Inst.getTexture(e);
        }
        initScene() {
            let e = at.Data.level > this.constansCfg.level ? at.Data.level % this.constansCfg.level + 1 : at.Data.level, t = l + `map/${e}.json`;
            /* 地图 JSON 拿不到时重试，并挡住 createMap(undefined) 抛错：
               FB 内容服务偶发返回 200+0 字节（还会被浏览器缓存），以前会让关卡没有地形，
               表现为"球一开局就往下坠落、直接失败"。这里失败就换个缓存键重试最多 3 次。 */
            /* 加载期间先冻结小球：地图是异步来的，地面没建好之前小球不该带物理，
               否则网络稍慢就会"地面还没出现先坠落"。createMap 结束时再解冻。 */
            this.__mapReady = !1;
            try { this.playCtrl && this.playCtrl.character && (this.playCtrl.character.enabled = !1); } catch (err) {}
            console.log("[gb] 第 " + at.Data.level + " 关地图加载中: " + t);
            let n = 0;
            let load = (u) => Laya.loader.create(u, Laya.Handler.create(this, (res) => {
                if (!res || !res.SceneItems) {
                    if (n++ < 3) {
                        let sep = u.indexOf("?") < 0 ? "?" : "&";
                        console.warn("[patch] map 加载异常，重试 " + n + "：" + u);
                        try { Laya.loader.clearRes && Laya.loader.clearRes(u); } catch (err) {}
                        load(u + sep + "r=" + Date.now());
                        return;
                    }
                    console.error("[patch] map 加载失败：" + u);
                    return;
                }
                this.createMap(res);
            }));
            load(t);
        }
        createMap(e) {
            let t = e.SceneItems, i = e.Items;
            for (let e in t) {
                let i = gt.Inst.getModelCloneByName(t[e].ModelName);
                this.sceneMap.addChild(i);
                let s = i.getComponent(ut);
                s ? s.init(t[e], !1) : i.addComponent(ut).init(t[e], !1);
            }
            for (let e in i) {
                let t = gt.Inst.getModelCloneByName(i[e].ModelName);
                this.sceneMap.addChild(t);
                let s = t.getComponent(ut);
                s ? s.init(i[e], !0) : t.addComponent(ut).init(i[e], !0);
            }
            e.KeyPointData && (this.cameraRoot.transform.position = this.playerSp.transform.position = new Laya.Vector3(e.KeyPointData[0].posX, e.KeyPointData[0].posY, e.KeyPointData[0].posZ),
                this.successPos = new Laya.Vector3(e.KeyPointData[1].posX, e.KeyPointData[1].posY, e.KeyPointData[1].posZ),
                this.mapDis = e.KeyPointData[1].posZ - e.KeyPointData[0].posZ), console.log("loadsueeess");
            /* 地图搭好了：打一条诊断日志，并把小球解冻（配合 initScene 的冻结） */
            console.log("[gb] 第 " + at.Data.level + " 关地图就绪: SceneItems=" + Object.keys(t || {}).length +
                ", Items=" + Object.keys(i || {}).length +
                (e.KeyPointData ? ", 起点=(" + e.KeyPointData[0].posX + "," + e.KeyPointData[0].posY + "," + e.KeyPointData[0].posZ + ")" : ", 无 KeyPointData"));
            if (!this.__mapReady) {
                this.__mapReady = !0;
                try { this.playCtrl && this.playCtrl.character && (this.playCtrl.character.enabled = !0); } catch (err) {}
            }
        }
        initEffect() { }
        playCaiDai(e) { }
        m_startGame() {
            this.isStart = !0, this.registerEvent();
            window.canMove = !0
        }
        m_gameOver() {
            this.cancelEvent(), this.isStart = !1, this.reset();
        }
        reset() {
            for (let e = 0; e < this.sceneMap.numChildren; e++) {
                let t = this.sceneMap.getChildAt(e).getComponent(ut);
                t && t.recover(), gt.Inst.recoverModel(this.sceneMap.getChildAt(e));
            }
            this.sceneMap.removeChildren(0, this.sceneMap.numChildren), this.initScene();
        }
        registerEvent() {
            Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.mouseType), Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.mouseType),
                Laya.stage.on(Laya.Event.MOUSE_UP, this, this.mouseType), Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.mouseType);
        }
        cancelEvent() {
            Laya.stage.off(Laya.Event.MOUSE_DOWN, this, this.mouseType), Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.mouseType),
                Laya.stage.off(Laya.Event.MOUSE_UP, this, this.mouseType), Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.mouseType);
        }
        mouseType(e) {
            if (!rt.IsPause) switch (e.type) {
                case Laya.Event.MOUSE_DOWN:
                    this.isMouseDown = !0, this._startTouchPt = new Laya.Vector2(e.stageX, e.stageY),
                        !rt.IsStart && this.isStart && rt.startGame(), this.playCtrl.rollSound && this.playCtrl.rollSound.resume();
                    break;

                case Laya.Event.MOUSE_MOVE:
                    if (this.isMouseDown) {
                        //球球移动
                        if (window.canMove) {

                            let t = e.stageX - this._startTouchPt.x, i = e.stageY - this._startTouchPt.y, s = t > 0 ? -1 : 1, a = Math.min(Math.abs(t) / 200, this.constansCfg.xMax) * s, n = i > 0 ? -1 : 1, r = Math.min(Math.abs(i) / 50, this.constansCfg.zMax) * n;
                            this.playCtrl.setSpeed(a, r);
                        }
                    }
                    this._startTouchPt.x = e.stageX, this._startTouchPt.y = e.stageY;
                    break;

                case Laya.Event.MOUSE_UP:
                case Laya.Event.MOUSE_OUT:
                    this.isMouseDown = !1, this.playCtrl.isMouseDown = !1, this.playCtrl.isChangeDir = !1;
            }
        }
        getCirclePos(e) {
            let t = this.x0 + this.R * Math.cos(e * Math.PI / 180), i = this.y0 + this.R * Math.sin(e * Math.PI / 180);
            return new Laya.Vector2(t, i);
        }
    }
    ft.Inst = null;
    class wt extends Laya.Script {
        constructor() {
            super(), this.isBanner = !0, this.isCustom = !0;
        }
        onAwake() {
            this.initUI();
        }
        initUI() {
            this.showAdType = 1, dt.Inst.uiNum += 1, this.moveBtn = null, dt.Inst.uiNum >= e.RegNum && dt.Inst.showNextUI(),
                this.isCustom = !1;
        }
        Show(e = !1, t = null) {
            switch (this.owner.visible = !0, this.showAdType) {
                case 0:
                    qe.inst.hideBanner();
                    break;

                case 1:
                    qe.inst.showBanner(this.moveBtn, null);
                    break;

                case 2:
                    qe.inst.bannerMoveTop(this.moveBtn);
            }
            window.wx && 1 == qe.inst.config.open_gridBannner && (this.isCustom ? Qe.Inst.showCustom() : Qe.Inst.hideCustom());
        }
        Hide() {
            this.owner.visible = !1,
                qe.inst.clearAllTime(),

                dt.Inst.leftItem.visible = dt.Inst.rightItem.visible = !1;
        }
        showGameBox(e) { }
    }
    class xt extends wt {
        constructor() {
            super(), this;
        }
        initUI() {
            this.onSoundBtn = this.owner.getChildByName("onSoundBtn")

            if (Laya.LocalStorage.getItem("soundsound") == 0
                || Laya.LocalStorage.getItem("soundsound") == null) {
                this.issoundOff = false;
                Laya.SoundManager.playMusic("Music/bgm.mp3")
                this.onSoundBtn.skin = "new/on.png";
            }
            else {
                this.issoundOff = true;
                Laya.SoundManager.stopMusic("Music/bgm.mp3")
                this.onSoundBtn.skin = "new/off.png";
            };

            this.onSoundBtn.on(Laya.Event.CLICK, this, () => {
                this.issoundOff = !this.issoundOff;
                if (!this.issoundOff) {
                    Laya.LocalStorage.setItem("soundsound", 0);
                    Laya.SoundManager.playMusic("Music/bgm.mp3")
                    this.onSoundBtn.skin = "new/on.png";
                }
                else {
                    Laya.LocalStorage.setItem("soundsound", 1);
                    Laya.SoundManager.stopMusic("Music/bgm.mp3");
                    this.onSoundBtn.skin = "new/off.png";
                }
            });

            dt.Inst.RegUI(e.UIType.homeUI, this), super.initUI(),
                this.startGameBtn = this.owner.getChildByName("startGame"),
                rt.onBtnFunction(this.startGameBtn, Laya.Event.CLICK, () => {
                    //插屏  开始游戏
                    // YYGGames.showInterstitial(() => {
                    // if (typeof sdk !== 'undefined' && sdk.showBanner !== 'undefined') {
                    //     sdk.showBanner();
                    // }
                    window.showInterstitialSafe();
                    this.onStartGame();
                    // })
                }),


                this.isCustom = !0, this.moreGameBtn = this.owner.getChildByName("moreGame"),
                this.moreGameBtn.y = Laya.stage.height - 135 * qe.inst.PixY - 100, rt.onBtnFunction(this.moreGameBtn, Laya.Event.CLICK, () => {
                    dt.Inst.ShowGameView(qe.inst.config.home_moreGameCliCk_showBox, !1, () => {
                        this.Show();
                    });
                }), this.moreGameBtn.visible = qe.inst.config.open_export && qe.inst.config.home_moreGameCliCk_showBox > 0 && 1 == Ye.getParamsInt("show_grid_view", 0),
                this.showAdType = qe.inst.config.homeUI_showExport, this.Hide(),
                this.shopBtn = this.owner.getChildByName("shop"),
                rt.onBtnFunction(this.shopBtn, Laya.Event.CLICK, () => {
                    // if (typeof sdk !== 'undefined' && sdk.showBanner !== 'undefined') {
                    //     sdk.showBanner();
                    // }
                    // YYGGames.showInterstitial(() => {
                    window.showInterstitialSafe();
                    // YYGGames.gameBox.game1.visible = YYGGames.gameBox.game2.visible = !1
                    this.Hide(), dt.Inst.GetUI(e.UIType.shopUI).Show();
                    // })
                }), this.startGameBtn.getChildByName("icon").visible = qe.inst.getVideoIconVisible(e.IconUIType.homeUI);
        }
        Show() {
            // YYGGames.gameBanner.visible = !1
            // YYGGames.gameBox.game1.visible = YYGGames.gameBox.game2.visible = !0
            // Laya.timer.once(500, this, Adapter.hideLoading)
            e.curUI = e.UIType.homeUI, super.Show(), window.__ytPlayables.system.gameReady(), dt.Inst.showFloatBox(qe.inst.getFloatBoxNum(i.HOMEUI));
        }
        Hide() {
            super.Hide();
        }
        onStartGame() {
            // YYGGames.gameBox.game1.visible = YYGGames.gameBox.game2.visible = !1
            ft.Inst.isInit && (this.Hide(), dt.Inst.showNextUI());
        }
        m_randItem() {
            this.listRand = [];
            for (var e = 0; e < this.listItem.length; e++) {
                var t = qe.inst.ranInt(0, this.listGameExportData.length - 1);
                -1 != this.listRand.indexOf(t) && this.listGameExportData.length > this.listItem.length ? e -= 1 : this.listRand.push(t);
            }
            for (e = 0; e < this.listItem.length; ++e) this.m_SetItemPic(e, this.listGameExportData[this.listRand[e]]),
                this.m_Tween(e);
        }
        m_SetItemPic(e, t) {
            var i = this.listItem[e];
            i.getChildByName("Pic").skin = t.images, 9 == t.frame && (i.getChildByName("Pic").clipX = 3,
                i.getChildByName("Pic").clipY = 3, i.getChildByName("Pic").autoPlay = !0, i.getChildByName("Pic").interval = 500);
        }
        m_Tween(e) {
            Laya.Tween.to(this.listItem[e], {
                rotation: -10
            }, 100, Laya.Ease.linearNone, Laya.Handler.create(this, function (e) {
                Laya.Tween.to(this.listItem[e], {
                    rotation: 10
                }, 150, Laya.Ease.linearNone, Laya.Handler.create(this, function (e) {
                    Laya.Tween.to(this.listItem[e], {
                        rotation: 0
                    }, 100, Laya.Ease.linearNone, Laya.Handler.create(this, function (e) { }, [e]));
                }, [e]));
            }, [e]), 0);
        }
    }
    Laya.Browser.window.wx;
    class bt extends wt {
        constructor() {
            super();
        }
        initUI() {
            dt.Inst.RegUI(e.UIType.gameUI, this), super.initUI(), this.levelT = this.owner.getChildByName("sp").getChildByName("level"),
                this.isCustom = !0;
        }
        Show(t = !0, s = null, a = !0) {
            e.curUI = e.UIType.gameUI, super.Show(), rt.remuseGame(), ft.Inst.m_startGame(),
                this.levelT.value = at.Data.level, dt.Inst.showFloatBox(qe.inst.getFloatBoxNum(i.GAMEUI));
        }
        Hide() {
            super.Hide(), ft.Inst.cancelEvent();
        }
    }
    class _t extends wt {
        constructor() {
            super(), this.clickCount = 0, this.subNum = 0, this.showBanerTime = 0, this.procent = 0,
                this.isbannerShow = !1;
        }
        initUI() {
            dt.Inst.RegUI(e.UIType.sceneLateUI1, this), super.initUI(), this.levelValue = this.owner.getChildByName("sp").getChildByName("level"),
                this.process = this.owner.getChildByName("process").getChildByName("value"), this.cliclBtn = this.owner.getChildByName("clickBtn"),
                rt.onBtnFunction(this.cliclBtn, Laya.Event.CLICK, () => {
                    this.on_clcik();
                }), this.clickCount += qe.inst.config.chest_click_inc_percent || 20, this.subNum = qe.inst.config.chest_click_sub_percent / 60 || 1,
                this.showBanerTime = qe.inst.config.chest_progress_cz || 30, this.cliclBtn.getChildByName("icon").visible = qe.inst.getVideoIconVisible(e.IconUIType.sceneLateUI1);
        }
        Show() {
            dt.Inst.showNextUI()
            // if (0 == qe.inst.config.open_ad_late) return void dt.Inst.showNextUI();
            // super.Show(), this.isVideo = dt.Inst.checkVideo(), this.levelValue.value = at.Data.level, 
            // this.process.width = 0, this.procent = 0, this.isbannerShow = !1;
            // const e = Laya.stage.getChildByName("GameBox");
            // e && (e.visible = !1), qe.inst.hideBanner();
        }
        Hide() {
            super.Hide(), u.inst.event(u.CHANGE_SKIN, [at.Data.curSkin]);
        }
        on_clcik() {
            this.procent += this.clickCount, this.procent > 100 && (this.procent = 100), Laya.Tween.to(this.process, {
                width: this.procent / 100 * 455
            }, 10, null), u.inst.event(u.CHANGE_SKIN, [Math.ceil(9 * Math.random())]), 0 == this.isbannerShow && this.procent >= this.showBanerTime && (this.isbannerShow = !0,
                this.clickLate());
        }
        clickLate() {
            let e = () => {
                this.Hide();
                const e = Laya.stage.getChildByName("GameBox");
                e && (e.visible = !0), dt.Inst.showNextUI();
            };
            this.isVideo ? ht.share("scene_late_ui1", {
                success: e,
                fail: e
            }) : (null != window.wx && qe.inst.bannershow(), Laya.timer.once(2e3, this, () => {
                e();
            }));
        }
        onUpdate() {
            this.procent > 0 && (this.procent -= this.subNum, this.process.width = this.procent / 100 * 455);
        }
    }
    var St, vt, Lt, Ct = Laya.Browser.window.wx;
    class Ut extends Laya.Script {
        constructor() {
            super(), this.isNext = !1, this.subNum = 0, this.isHit = !1, this.isVideo = !1,
                St = this;
        }
        onEnable() {
            dt.Inst.RegUI(e.UIType.hitBoxUI, this),
                this.clickCount = 0,
                this.page1 = this.owner.getChildByName("page1"),
                this.chest = this.page1.getChildByName("chest"),
                this.chest.y = 700 / 1624 * Laya.stage.height,
                this.light = this.owner.getChildByName("page1").getChildByName("light"),
                this.light.y = 700 / 1624 * Laya.stage.height,
                this.owner.getChildByName("page1").getChildByName("tip").y = 1050 / 1624 * Laya.stage.height,
                this.owner.getChildByName("page1").getChildByName("title").y = 200 / 1624 * Laya.stage.height,
                this.Pro_Value = this.owner.getChildByName("page1").getChildByName("Pro_Value"),
                this.Pro_Value.y = 950 / 1624 * Laya.stage.height, this.Btn_Click = this.owner.getChildByName("page1").getChildByName("hitbox1bottom").getChildByName("Btn_Click"),
                this.owner.getChildByName("page1").getChildByName("hitbox1bottom").y = Laya.stage.height,
                rt.onBtnFunction(this.Btn_Click, Laya.Event.CLICK, () => {
                    this.onClick_Click();
                }), this.Btn_Click.getChildByName("icon").visible = qe.inst.getVideoIconVisible(e.IconUIType.hitBoxUI),
                this.subNum = qe.inst.config.chest_click_sub_percent / 60 || 1;
        }
        onUpdate() {
            this.light && (this.light.rotation += 2), this.Pro_Value.value > 0 && (this.clickCount -= this.subNum,
                this.Pro_Value.value -= this.subNum / 100);
        }
        onDisable() { }
        Show(t, i) {
            dt.Inst.showNextUI();
            // if (St.isSuc = t, e.curUI = e.UIType.hitBoxUI, this.chest.skin = `tbox/chest${Math.round(3 * Math.random()) + 1}.png`, 
            // 0 == qe.inst.config.open_ad_late) return void dt.Inst.showNextUI();
            // St.isVideo = dt.Inst.checkVideo();
            // const s = Laya.stage.getChildByName("GameBox");
            // s && (s.visible = !1), dt.Inst.sendUI(), St.isHit = !1, St.owner.visible = !1, St.page1.visible = !1, 
            // St.Pro_Value.value = 0, St.clickCount = 0, St.isbannerShow = !1, vt = qe.inst.config.hitBox_hideTime || 2e3, 
            // Lt = qe.inst.config.chest_progress_cz || 30, null != Ct && qe.inst.hideBanner(), 
            // St.owner.height = Laya.stage.height, St.owner.getChildByName("page1").height = Laya.stage.height, 
            // St.owner.getChildByName("page1").getChildByName("hitbox1bottom").anchorY = 1, St.owner.getChildByName("page1").getChildByName("hitbox1bottom").y = Laya.stage.height;
        }
        RefreshUI() {
            Laya.Tween.to(this.Pro_Value, {
                value: this.clickCount / 100
            }, 10, null);
        }
        onClick_Click() {
            this.m_Click(), Laya.Tween.to(this.Btn_Click, {
                scaleX: .8,
                scaleY: .8
            }, 100, Laya.Ease.strongOut, Laya.Handler.create(this, function () {
                this.Btn_Click.scaleX = 1, this.Btn_Click.scaleY = 1;
            }));
        }
        m_Click() {
            this.clickCount += qe.inst.config.chest_click_inc_percent || 20, this.RefreshUI(),
                this.shakechest(), 0 == this.isbannerShow && this.clickCount >= Lt && (this.isbannerShow = !0,
                    this.clickLate());
        }
        clickLate() {
            let e = () => {
                St.owner.visible = !1, qe.inst.hideBanner();
                const e = Laya.stage.getChildByName("GameBox");
                e && (e.visible = !0), dt.Inst.showNextUI();
            };
            St.isVideo ? ht.share("hit_box_ui2", {
                success: e,
                fail: e
            }) : (null != Ct && qe.inst.bannershow(), Laya.timer.once(vt, St, function () {
                e();
            }));
        }
        shakechest() {
            Laya.Tween.to(this.chest, {
                rotation: 10
            }, 30, Laya.Ease.linearNone, Laya.Handler.create(this, function () {
                Laya.Tween.to(this.chest, {
                    rotation: -10
                }, 50, Laya.Ease.linearNone, Laya.Handler.create(this, function () {
                    Laya.Tween.to(this.chest, {
                        rotation: 0
                    }, 50, Laya.Ease.linearNone, null, null, !1);
                }));
            }));
        }
    }
    var kt, Et, Bt = 0;
    class At extends wt {
        constructor() {
            super(), this.listGameExportData = [], this.isNext = !1, this.fingerAray = [], kt = this;
        }
        initUI() {

            for (var t in dt.Inst.RegUI(e.UIType.gameExport1, this), this.listGameExportData = this.listGameExportData.concat(qe.inst.config.box_info),
                this.listGameExportData) this.fingerAray[t] = Number(t);
            this.fingerAray = It.getRandomArrayElements(this.fingerAray, 5), this.nextBtn = this.owner.getChildByName("Btn_back"),
                this.nextBtn.y = Laya.stage.height - 20, this.list = this.owner.getChildByName("list"),
                this.list.height = Laya.stage.height - 150 - qe.inst.bannerheight * qe.inst.PixY,
                this.list.vScrollBarSkin = "", this.list.scrollBar.hide = !0, this.list.repeatY = this.listGameExportData.length / 2,
                this.list.renderHandler = new Laya.Handler(this, this.render), this.list.array = this.listGameExportData,
                rt.onBtnFunction(this.nextBtn, Laya.Event.CLICK, () => {
                    this.Hide(), this.closeCallBack && (this.closeCallBack(), this.closeCallBack = null),
                        this.isNext && dt.Inst.showNextUI();
                }), this.closeCallBack = null, this.Hide(), super.initUI(), this.moveBtn = this.nextBtn,
                this.isCustom = !1;
        }
        render(e, t) {
            e.getChildByName("Name").text = this.listGameExportData[t].name, e.getChildByName("Pic").skin = this.listGameExportData[t].images,
                this.fingerAray.indexOf(t, 0) > -1 && 1 == qe.inst.config.open_ad_finger && (e.getChildByName("point").visible = !0),
                9 == this.listGameExportData[t].frame ? (e.getChildByName("Pic").clipX = 3, e.getChildByName("Pic").clipY = 3,
                    e.getChildByName("Pic").autoPlay = !0, e.getChildByName("Pic").interval = 500) : (e.getChildByName("Pic").clipX = 0,
                        e.getChildByName("Pic").clipY = 0, e.getChildByName("Pic").autoPlay = !1), e.offAll(Laya.Event.CLICK),
                e.on(Laya.Event.CLICK, this, function () {
                    qe.inst.AldingRecord("热门推荐-icon点击"), qe.inst.openMiniGame(this.listGameExportData[t], null, function () {
                        qe.inst.shuffleArray(kt.listGameExportData), kt.list.array = kt.listGameExportData,
                            kt.list.refresh();
                    }, "热门推荐");
                });
        }
        Show(t = !0, i) {
            dt.Inst.showNextUI();
            // kt.closeCallBack = i, this.isNext = t, 1 == qe.inst.config.open_export ? (t && (e.curUI = e.UIType.gameExport1), 
            // super.Show(), qe.inst.shuffleArray(kt.listGameExportData), kt.list.array = kt.listGameExportData, 
            // kt.list.refresh(), Laya.Tween.clearAll(kt.list), Laya.timer.clearAll(kt), kt.tweenList2(kt.list, !0, 1), 
            // 1 == qe.inst.config.hotad_auto_show && qe.inst.openMiniGame(kt.listGameExportData[Math.floor(Math.random() * kt.listGameExportData.length)])) : (kt.Hide(), 
            // this.closeCallBack && (this.closeCallBack(), this.closeCallBack = null), t && dt.Inst.showNextUI());
        }
        Hide() {
            super.Hide();
        }
        tweenList2(e, t, i) {
            e.array && (null == t && (t = !0), Bt = e.startIndex + i, e.tweenTo(Bt, 500, new Laya.Handler(this, function () {
                Laya.timer.once(1500, this, function () {
                    t ? e.scrollBar.value >= e.scrollBar.max ? this.tweenList2(e, !1, -2) : this.tweenList2(e, !0, 2) : e.scrollBar.value <= e.scrollBar.min ? this.tweenList2(e, !0, 2) : this.tweenList2(e, !1, -2);
                });
            })));
        }
    }
    class Tt extends wt {
        constructor() {
            super(), this.listGameExportData1 = [], this.isNext = !1, this.fingerAray1 = [],
                Et = this;
        }
        initUI() {
            dt.Inst.RegUI(e.UIType.gameExport3, this);
            for (let e in qe.inst.config.box_info) this.listGameExportData1.push(qe.inst.config.box_info[e]);
            for (var t in this.listGameExportData1) this.fingerAray1[t] = Number(t);
            this.fingerAray1 = It.getRandomArrayElements(this.fingerAray1, 5), this.list = this.owner.getChildByName("list"),
                this.list.height = Laya.stage.height - 115 - qe.inst.bannerheight * qe.inst.PixY - 20,
                this.backBtn = this.owner.getChildByName("Btn_back"), this.backBtn.y = Laya.stage.height - 150,
                rt.onBtnFunction(this.backBtn, Laya.Event.CLICK, () => {
                    this.Hide();
                }), this.list.vScrollBarSkin = "", this.list.scrollBar.hide = !0, this.list.repeatX = 3,
                this.list.repeatY = this.listGameExportData1.length / 3, this.list.renderHandler = new Laya.Handler(this, this.render),
                this.list.array = this.listGameExportData1, this.list.on(Laya.Event.MOUSE_UP, this, function () {
                    Laya.Tween.clearAll(this.list), this.ListRun(this.list, void 0, !1);
                }), this.Hide(), super.initUI(), this.moveBtn = this.backBtn, this.isCustom = !1;
        }
        render(e, t) {
            e.getChildByName("Name").text = this.listGameExportData1[t].name, e.getChildByName("Pic").skin = this.listGameExportData1[t].images,
                e.getChildByName("new").visible = this.listGameExportData1[t].is_hot, 9 == this.listGameExportData1[t].frame ? (e.getChildByName("Pic").clipX = 3,
                    e.getChildByName("Pic").clipY = 3, e.getChildByName("Pic").autoPlay = !0, e.getChildByName("Pic").interval = 500) : (e.getChildByName("Pic").clipX = 0,
                        e.getChildByName("Pic").clipY = 0, e.getChildByName("Pic").autoPlay = !1), this.fingerAray1.indexOf(t, 0) > -1 && 1 == qe.inst.config.open_ad_finger && (e.getChildByName("point").visible = !0),
                e.offAll(Laya.Event.CLICK), e.on(Laya.Event.CLICK, this, function () {
                    qe.inst.AldingRecord("好友在玩-icon点击"), qe.inst.openMiniGame(this.listGameExportData1[t], null, function () {
                        qe.inst.shuffleArray(Et.listGameExportData1), Et.list.array = Et.listGameExportData1,
                            Et.list.refresh();
                    }, "好友在玩");
                });
        }
        Show(t = !0, i) {
            dt.Inst.showNextUI();
            Et.closeCallBack = i, this.isNext = t, 1 == qe.inst.config.open_export ? (t && (e.curUI = e.UIType.gameExport3),
                super.Show(), qe.inst.shuffleArray(Et.listGameExportData1), Et.list.array = Et.listGameExportData1,
                Et.list.refresh(), Laya.Tween.clearAll(Et.list), Laya.timer.clearAll(Et), Et.ListRun(Et.list, !0, !1),
                1 == qe.inst.config.hyad_auto_show && qe.inst.openMiniGame(Et.listGameExportData1[Math.floor(Math.random() * Et.listGameExportData1.length)])) : Et.Hide();
        }
        Hide() {
            console.log("this.hide"), super.Hide(), this.closeCallBack && (this.closeCallBack(),
                this.closeCallBack = null), this.isNext && dt.Inst.showNextUI();
        }
        ListRun(e, t, i) {
            e.array && (null == t && (t = !0), Laya.Tween.to(e.scrollBar, {
                value: t ? e.scrollBar.max : e.scrollBar.min
            }, 700 * (i ? e.repeatX : e.repeatY), Laya.Ease.linearNone, Laya.Handler.create(this, this.ListRun, [e, !t, i]), 700, !0));
        }
    }
    class Pt extends wt {
        constructor() {
            super(), this.skingold = 500, this.skinArr = ["", "橄榄球", "足球", "铁球", "西瓜", "篮球", "菠萝", "精灵球", "七龙珠", "地球"],
                this.selectIndex = 0;
        }
        initUI() {
            super.initUI(),
                dt.Inst.RegUI(e.UIType.shopUI, this), this.bg = this.owner.getChildByName("bg"),
                this.bg.y = Laya.stage.height,
                this.shopList = this.bg.getChildByName("list"),
                this.tipView = this.owner.getChildByName("tipView"),
                this.getSkinBtn = this.bg.getChildByName("getskin"),
                this.videoGold = this.bg.getChildByName("videoGold"),
                this.backBtn = this.owner.getChildByName("backBtn"),
                this.goldTxt = this.getSkinBtn.getChildByName("num"),
                this.shopList.renderHandler = new Laya.Handler(this, this.render),
                this.shopList.selectHandler = new Laya.Handler(this, this.select);
            let t = new Array(9);
            this.shopList.array = t, this.shopList.repeatX = 3, this.shopList.repeatY = 3, this.shopList.selectEnable = !0,
                this.shopList.refresh(), this.creatScene3D(), this.showAdType = 0, rt.onBtnFunction(this.backBtn, Laya.Event.CLICK, () => {
                    this.Hide(), dt.Inst.GetUI(e.UIType.homeUI).Show();
                }), rt.onBtnFunction(this.getSkinBtn, Laya.Event.CLICK, () => {

                    if (at.Data.gold < this.curSkinGold) {
                        this.tipView.visible = !0,
                            this.tipView.text = "Not enough gold",
                            Laya.timer.once(1500, this, () => {
                                this.tipView.visible = !1;
                            });
                    } else {
                        (
                            this.tipView.visible = !0,
                            this.tipView.text = "Get a new skin",
                            Laya.timer.once(1500, this, () => {
                                this.tipView.visible = !1;
                            }),
                            //Get a new skin
                            at.Data.gold -= this.curSkinGold,
                            u.inst.event(u.ADD_DOLLAR, [at.Data.gold]),
                            qe.inst.showToast(`恭喜获得${this.skinArr[at.Data.skin.length + 1]}`),
                            at.Data.curSkin = at.Data.skin.length + 1,
                            at.Data.skin.push(at.Data.skin.length + 1),
                            at.saveData(),
                            console.log("皮肤：", at.Data.skin.length),

                            this.changeModel(at.Data.curSkin),
                            this.curSkinGold = this.skingold * at.Data.skin.length,
                            this.goldTxt.value = this.curSkinGold,
                            this.shopList.refresh(),
                            u.inst.event(u.CHANGE_SKIN, [at.Data.curSkin]));
                        if (at.Data.skin.length >= 9) {
                            this.getSkinBtn.visible = this.videoGold.visible = !1
                        }
                    }



                    // at.Data.gold < this.curSkinGold ? 
                    // qe.inst.showToast("金币不足") 

                    // :
                    //  (at.Data.gold -= this.curSkinGold, 
                    // u.inst.event(u.ADD_DOLLAR, [ at.Data.gold ]), 
                    // qe.inst.showToast(`恭喜获得${this.skinArr[at.Data.skin.length + 1]}`), 
                    // at.Data.curSkin = at.Data.skin.length + 1, 
                    // at.Data.skin.push(at.Data.skin.length + 1), 
                    // at.saveData(), 
                    // console.log("皮肤：",at.Data.skin.length),

                    // this.changeModel(at.Data.curSkin),
                    //  this.curSkinGold = this.skingold * at.Data.skin.length, 
                    // this.goldTxt.value = this.curSkinGold, 
                    // this.shopList.refresh(), 
                    // u.inst.event(u.CHANGE_SKIN, [ at.Data.curSkin ]));
                    // if(at.Data.skin.length >=9){
                    //     this.getSkinBtn.visible = this.videoGold.visible = !1
                    // }
                }),
                rt.onBtnFunction(this.videoGold, Laya.Event.CLICK, () => {
                    //激励


                    // if (typeof sdk !== 'undefined' && sdk.showBanner !== 'undefined') {
                    //     sdk.showBanner();
                    // }
                    ht.share("shop", {
                        success: () => {
                            /* 箭头函数保留 initUI 里的 this（ShopUI 实例）；
                               原来写成 function(){} 会让 this 变成 window，
                               this.tipView 抛 TypeError，后面的 at.addCrash(500) 永远不执行 */
                            window.showRewardedSafe(() => {
                                this.tipView.visible = !0,
                                    this.tipView.text = "Get 500 Golds",
                                    Laya.timer.once(1500, this, () => {
                                        this.tipView.visible = !1;
                                    });

                                at.addCrash(500);
                            });
                            // YYGGames.showReward(() => {

                            // });
                        }
                    });

                })


            if (at.Data.skin.length >= 9) {
                this.getSkinBtn.visible = this.videoGold.visible = !1
            }
        }
        render(e, t) {
            -1 == at.Data.skin.indexOf(t + 1) ? (e.getChildByName("bg").skin = "skin/jx_01.png",
                e.getChildByName("wen").visible = !0, e.getChildByName("check").visible = !1, e.getChildByName("img").visible = !1) : (e.getChildByName("bg").skin = "skin/jx_02.png",
                    e.getChildByName("img").visible = !0, e.getChildByName("img").skin = `skin/${t + 1}.png`,
                    e.getChildByName("wen").visible = !1, e.getChildByName("check").visible = !1), at.Data.curSkin == t + 1 && (e.getChildByName("check").visible = !0),
                e.getChildByName("isSelect").visible = !1, this.selectIndex == t && (e.getChildByName("isSelect").visible = !0);
        }
        select(e) {
            at.Data.skin.indexOf(e + 1) > -1 && (this.changeModel(e + 1), at.Data.curSkin = e + 1,
                u.inst.event(u.CHANGE_SKIN, [e + 1])), this.selectIndex = e;
        }
        changeModel(e) {
            this.monkeyMat.albedoTexture = gt.Inst.getTexture(e);
        }
        Show() {
            super.Show(), e.curUI = e.UIType.shopUI, this.changeModel(at.Data.curSkin), this.curSkinGold = this.skingold * at.Data.skin.length,
                this.goldTxt.value = this.curSkinGold;
        }
        Hide() {
            super.Hide();
        }
        creatScene3D() {
            this.scene3d = new Laya.Scene3D(), this.owner.addChild(this.scene3d), this.pos = new Laya.Vector3(Laya.stage.width / 2, Laya.stage.height / 2 - 300, 0),
                this.translate = new Laya.Vector3(), this.layaMonkey = null, this.camera = new Laya.Camera(0, .1, 1e3),
                this.scene3d.addChild(this.camera), this.camera.transform.rotate(new Laya.Vector3(-45, 0, 0), !1, !1),
                this.camera.transform.translate(new Laya.Vector3(5, -10, 1)), this.camera.clearFlag = Laya.BaseCamera.CLEARFLAG_DEPTHONLY,
                this.camera.orthographic = !0, this.camera.orthographicVerticalSize = 10;
            let e = new Laya.DirectionLight();
            e.transform.localRotationEuler = new Laya.Vector3(-65, 12, 0), this.scene3d.addChild(e),
                this.layaMonkey = this.scene3d.addChild(gt.Inst.getModelCloneByName("1")), this.layaMonkey.transform.localScale = new Laya.Vector3(3, 3, 3),
                this.camera.convertScreenCoordToOrthographicCoord(this.pos, this.translate), this.layaMonkey.transform.position = this.translate,
                this.layaMonkey.transform.rotationEuler = new Laya.Vector3(0, 0, 0), this.monkeyMat = this.layaMonkey.meshRenderer.material;
        }
    }
    class Nt extends wt {
        constructor() {
            super();
        }
        initUI() {
            dt.Inst.RegUI(e.UIType.resultUI, this), super.initUI(), this.showIdex = 0, this.middleUI = this.owner.getChildByName("middleUI"),
                this.middleUI.y = Laya.stage.height / 2, this.bottomUI = this.owner.getChildByName("bottomUI"),
                this.bottomUI.y = Laya.stage.height - qe.inst.bannerheight * qe.inst.PixY - 30,
                this.topUI = this.owner.getChildByName("topUI"), this.nextBtn = this.bottomUI.getChildByName("next"),
                this.listGameExportData = qe.inst.config.box_info, this.logo = this.topUI.getChildByName("logo"),
                this.list = this.middleUI.getChildByName("list"), this.list.repeatX = 2, this.list.repeatY = 2,
                this.list.renderHandler = new Laya.Handler(this, this.render), this.list.array = this.listGameExportData,
                rt.onBtnFunction(this.nextBtn, Laya.Event.CLICK, () => {
                    this.Hide();
                }), this.showAdType = qe.inst.config.acount_page_bottom_ad, this.isCustom = !0,
                this.moveBtn = this.bottomUI, this.nextBtn.getChildByName("icon").visible = qe.inst.getVideoIconVisible(e.IconUIType.resultUI);
        }
        render(e, t) {
            e.getChildByName("Name").text = this.listGameExportData[this.showIdex].name, e.getChildByName("Pic").skin = this.listGameExportData[this.showIdex].images,
                9 == this.listGameExportData[this.showIdex].frame ? (e.getChildByName("Pic").clipX = 3,
                    e.getChildByName("Pic").clipY = 3, e.getChildByName("Pic").autoPlay = !0, e.getChildByName("Pic").interval = 500) : (e.getChildByName("Pic").clipX = 0,
                        e.getChildByName("Pic").clipY = 0, e.getChildByName("Pic").autoPlay = !1), 1 == qe.inst.config.open_ad_finger && Math.random() < .5 && (e.getChildByName("point").visible = !0),
                e.offAll(Laya.Event.CLICK), e.on(Laya.Event.CLICK, this, function () {
                    qe.inst.AldingRecord("结束游戏的盒子-icon点击"), qe.inst.openMiniGame(this.listGameExportData[this.showIdex], null, function () {
                        dt.Inst.onGameOverClickCancel(() => {
                            qe.inst.showBanner(this.bottomUI);
                        }), this.refreshBox(e);
                    }.bind(this), "结束游戏的盒子");
                }), this.showIdex += 1, this.showIdex >= this.listGameExportData.length && (this.showIdex = 0);
        }
        refreshBox(e) {
            this.showIdex += 1, this.showIdex >= this.listGameExportData.length && (this.showIdex = 0),
                e.getChildByName("Name").text = this.listGameExportData[this.showIdex].name, e.getChildByName("Pic").skin = this.listGameExportData[this.showIdex].images,
                9 == this.listGameExportData[this.showIdex].frame ? (e.getChildByName("Pic").clipX = 3,
                    e.getChildByName("Pic").clipY = 3, e.getChildByName("Pic").autoPlay = !0, e.getChildByName("Pic").interval = 500) : (e.getChildByName("Pic").clipX = 0,
                        e.getChildByName("Pic").clipY = 0, e.getChildByName("Pic").autoPlay = !1), e.offAll(Laya.Event.CLICK),
                e.on(Laya.Event.CLICK, this, function () {
                    qe.inst.AldingRecord("结束游戏的盒子-icon点击"), qe.inst.openMiniGame(this.listGameExportData[this.showIdex], null, function () {
                        dt.Inst.onGameOverClickCancel(() => {
                            qe.inst.showBanner(this.bottomUI);
                        }), this.refreshBox(e);
                    }.bind(this), "结束游戏的盒子");
                });
        }
        Show(i, s, a = !0) {
            // YYGGames.gameBanner.visible = !0
            // dt.Inst.showNextUI();
            e.curUI = e.UIType.resultUI, qe.inst.shuffleArray(this.listGameExportData), this.showIdex = 0,
                this.list.array = this.listGameExportData, this.list.refresh(), Laya.timer.clearAll(this),
                Laya.timer.loop(3e3, this, () => {
                    this.list.refresh();
                }), rt.IsSuccess ? this.logo.skin = "gamebox/tit_sl.png" : this.logo.skin = "gamebox/tit_sb.png",
                qe.inst.canInsterAd(t.RESULTUI) && qe.inst.createInterAd(null), super.Show(), 1 == qe.inst.config.open_export ? this.showList() : this.list.visible = !1;
        }
        Hide() {
            Laya.timer.clearAll(this), super.Hide(), dt.Inst.showNextUI();
        }
        showList() {
            for (var e in this.list.x = -500, this.list.cells) this.list.cells[e].rotation = -180,
                Laya.Tween.to(this.list.cells[e], {
                    rotation: 0
                }, 500, Laya.Ease.linearNone, null);
            Laya.Tween.to(this.list, {
                x: 68
            }, 500, Laya.Ease.linearNone, null);
        }
    }
    class Dt extends wt {
        constructor() {
            super(), this.reviveTime = 10, this.curTime = 0;
        }
        initUI() {
            dt.Inst.RegUI(e.UIType.reviveUI, this),
                super.initUI(),



                rt.onBtnFunction(this.reviveBtn, Laya.Event.CLICK, () => {
                    // if (typeof sdk !== 'undefined' && sdk.showBanner !== 'undefined') {
                    //     sdk.showBanner();
                    // }
                    // YYGGames.showReward(() => {
                    window.showRewardedSafe(function () {
                        Laya.timer.pause(),
                            ht.share("revive", {
                                success: () => {
                                    Laya.timer.resume(),
                                        dt.Inst.GetUI(e.UIType.reviveUI).Hide(),
                                        ft.Inst.playCtrl.revive(),
                                        dt.Inst.GetUI(e.UIType.gameUI).Show(!0, null, !1);
                                },
                                fail: () => {
                                    Laya.timer.resume();
                                }
                            });
                    });


                    // })




                }),


                rt.onBtnFunction(this.abandBtn, Laya.Event.CLICK, () => {
                    this.Hide(), u.inst.event(u.GAME_OVER, [!1]);
                });
        }
        Show() {
            e.curUI = e.UIType.reviveUI,
                super.Show(),
                this.curTime = this.reviveTime,
                this.timeClip.value = this.curTime,
                Laya.timer.loop(1e3, this, () => {

                    this.curTime -= 1,
                        this.timeClip.value = this.curTime,
                        this.curTime <= 0 && (this.Hide(),
                            u.inst.event(u.GAME_OVER, [!1]));

                });
        }
        Hide() {
            super.Hide()
                , Laya.timer.clearAll(this)
                ;
        }
    }
    class Mt extends wt {
        constructor() {
            super(), this.curConfim = 0, this.curCancel = 0;
        }
        initUI() {
            dt.Inst.RegUI(e.UIType.trySkinUI, this), super.initUI(), this.confimVideoNum = qe.inst.config.skinUI_videoNum && qe.inst.config.skinUI_videoNum[0] || 1,
                this.cancelVideoNum = qe.inst.config.skinUI_videoNum && qe.inst.config.skinUI_videoNum[1] || 1,
                rt.onBtnFunction(this.tryBtn, Laya.Event.CLICK, () => {
                    ht.share("try_skin", {
                        success: () => {
                            this.Hide(), u.inst.event(u.CHANGE_SKIN);
                        },
                        fail: () => {
                            this.Hide();
                        }
                    });
                }), rt.onBtnFunction(this.abandBtn, Laya.Event.CLICK, () => {
                    1 == qe.inst.config.skinUI_cancelVideo ? ht.share("try_skin_aband", {
                        success: () => {
                            this.Hide(), u.inst.event(u.CHANGE_SKIN, [ct.trySkinIdex]);
                        },
                        fail: () => {
                            this.Hide();
                        }
                    }) : this.Hide();
                }), this.creatScene3D(), this.abandBtn.getChildByName("icon").visible = qe.inst.getVideoIconVisible(e.IconUIType.trySkinUI);
        }
        Show() {
            super.Hide(), dt.Inst.showNextUI();

            // e.curUI = e.UIType.trySkinUI, super.Show(), ct.trySkinIdex = at.getRandomSkin(), 
            // this.monkeyMat.albedoTexture = gt.Inst.getTexture(ct.trySkinIdex), dt.Inst.showFloatBox(qe.inst.getFloatBoxNum(i.TRYSKINUI)), 
            // qe.inst.canInsterAd(t.TRYSKINUI) && qe.inst.createInterAd(null);
        }
        Hide() {
            super.Hide(), dt.Inst.showNextUI();
        }
        onUpdate() {
            this.light.rotation += 1;
        }
        creatScene3D() {
            this.scene3d = new Laya.Scene3D(), this.owner.addChild(this.scene3d), this.pos = new Laya.Vector3(Laya.stage.width / 2, Laya.stage.height / 2 - 100, 0),
                this.translate = new Laya.Vector3(), this.layaMonkey = null;
            let e = new Laya.Camera(0, .1, 1e3);
            this.scene3d.addChild(e), e.transform.rotate(new Laya.Vector3(-45, 0, 0), !1, !1),
                e.transform.translate(new Laya.Vector3(5, -10, 1)), e.clearFlag = Laya.BaseCamera.CLEARFLAG_DEPTHONLY,
                e.orthographic = !0, e.orthographicVerticalSize = 10;
            let t = new Laya.DirectionLight();
            t.transform.localRotationEuler = new Laya.Vector3(-37, 112, 0), this.scene3d.addChild(t),
                this.layaMonkey = this.scene3d.addChild(gt.Inst.getModelCloneByName("1")), this.monkeyMat = this.layaMonkey.meshRenderer.material,
                this.layaMonkey.transform.localScale = new Laya.Vector3(3, 3, 3), e.convertScreenCoordToOrthographicCoord(this.pos, this.translate),
                this.layaMonkey.transform.position = this.translate, this.layaMonkey.transform.rotationEuler = new Laya.Vector3(0, 0, 0);
        }
    }
    Laya.Browser.window.wx;
    class Gt extends wt {
        constructor() {
            super(), this._this = this, this.gridwidth = 360, this.gridheight = 272, this.bannerShow = !1;
        }
        initUI() {
            dt.Inst.RegUI(e.UIType.threeGridUI, this), this.Btn_Click = this.owner.getChildByName("nextbtn"),
                rt.onBtnFunction(this.Btn_Click, Laya.Event.CLICK, () => {
                    1 == Ye.getParamsInt("grid_view_wd", 0) ? (this.clickNum >= qe.inst.config.bottom_goOnBtn_cz && (2 == qe.inst.config.bottom_banner_cz ? ht.share("three_grid_ui", {
                        success: () => {
                            this.Hide();
                        },
                        fail: () => {
                            this.Hide();
                        }
                    }) : this.Hide()), this.clickNum += 1) : this.Hide();
                }), super.initUI(), this.Btn_Click.getChildByName("icon").visible = qe.inst.getVideoIconVisible(e.IconUIType.fourGridUI);
        }
        Show(i = !0, s) {
            dt.Inst.showNextUI()
            // this.isNext = i, this.closeBack = s, Qe.Inst.hideCustom(), e.curUI = e.UIType.threeGridUI, 
            // this.clickNum = 0;
            // const a = Laya.stage.getChildByName("GameBox");
            // a && (a.visible = !1), this.owner.visible = !0, qe.inst.onGridUI = !0, this.createGrid(), 
            // this.bannerShow = !0, this.timeShow(this.bannerShow), 1 == qe.inst.config.open_ad_late && 1 == qe.inst.config.bottom_banner_cz && Laya.timer.loop(1e3 * qe.inst.config.gridUI_bannerShowTime, this, () => {
            //     this.timeShow(this.bannerShow);
            // }), qe.inst.canInsterAd(t.GRIDUI) && qe.inst.createInterAd(null);
        }
        timeShow(e) {
            console.log("timeShow", e), e ? (qe.inst.hideBanner(), this.bannerShow = !1) : (qe.inst.showBanner(),
                this.bannerShow = !0);
        }
        createGrid() {
            if (window.wx) {
                let e = qe.inst.system.windowWidth, t = qe.inst.system.windowHeight, i = {
                    left: (e - this.gridwidth) / 2,
                    top: t - 2 * this.gridheight - 160 / 667 * t,
                    width: this.gridwidth
                };
                qe.inst.showGrid(qe.inst.config.ad_cellGridBannerID[0], i);
                let s = {
                    left: (e - this.gridwidth) / 2,
                    top: t - this.gridheight - 160 / 667 * t,
                    width: this.gridwidth
                };
                qe.inst.showGrid(qe.inst.config.ad_cellGridBannerID[1], s);
            }
        }
        Hide() {
            const e = Laya.stage.getChildByName("GameBox");
            e && (e.visible = !0), this.owner.visible = !1, qe.inst.hideGrid(), Laya.timer.clearAll(this),
                qe.inst.hideBanner(), qe.inst.onGridUI = !1, this.isNext ? dt.Inst.showNextUI() : this.closeBack && this.closeBack();
        }
    }
    Laya.Browser.window.wx;
    class Vt extends wt {
        constructor() {
            super(), this._this = this, this.gridwidth = 360, this.gridheight = 310, this.bannerShow = !1;
        }
        initUI() {
            dt.Inst.RegUI(e.UIType.fourGridUI, this), this.Btn_Click = this.owner.getChildByName("nextbtn"),
                rt.onBtnFunction(this.Btn_Click, Laya.Event.CLICK, () => {
                    1 == Ye.getParamsInt("grid_view_wd", 0) ? (this.clickNum >= qe.inst.config.bottom_goOnBtn_cz && (2 == qe.inst.config.bottom_banner_cz ? ht.share("for_grid_ui", {
                        success: () => {
                            this.Hide();
                        },
                        fail: () => {
                            this.Hide();
                        }
                    }) : this.Hide()), this.clickNum += 1) : this.Hide();
                }), super.initUI(), this.Btn_Click.getChildByName("icon").visible = qe.inst.getVideoIconVisible(e.IconUIType.fourGridUI);
        }
        Show(i = !0, s) {
            this.isNext = i, this.closeBack = s, e.curUI = e.UIType.fourGridUI, Qe.Inst.hideCustom(),
                this.clickNum = 0;
            const a = Laya.stage.getChildByName("GameBox");
            a && (a.visible = !1), this.owner.visible = !0, qe.inst.onGridUI = !0, this.createGrid(),
                this.bannerShow = !0, this.timeShow(this.bannerShow), 1 == qe.inst.config.open_ad_late && 1 == qe.inst.config.bottom_banner_cz && Laya.timer.loop(1e3 * qe.inst.config.gridUI_bannerShowTime, this, () => {
                    this.timeShow(this.bannerShow);
                }), qe.inst.canInsterAd(t.GRIDUI) && qe.inst.createInterAd(null);
        }
        timeShow(e) {
            console.log("timeShow", e), e ? (qe.inst.hideBanner(), this.bannerShow = !1) : (qe.inst.showBanner(),
                this.bannerShow = !0);
        }
        createGrid() {
            if (window.wx) {
                let e = qe.inst.system.windowWidth, t = qe.inst.system.windowHeight, i = {
                    left: (e - this.gridwidth) / 2,
                    top: t - 2 * this.gridheight - 160 / 667 * t,
                    width: this.gridwidth
                };
                qe.inst.showGrid(qe.inst.config.ad_fourCellGridID[0], i);
                let s = {
                    left: (e - this.gridwidth) / 2,
                    top: t - this.gridheight - 160 / 667 * t,
                    width: this.gridwidth
                };
                qe.inst.showGrid(qe.inst.config.ad_fourCellGridID[1], s);
            }
        }
        Hide() {
            const e = Laya.stage.getChildByName("GameBox");
            e && (e.visible = !0), this.owner.visible = !1, qe.inst.hideGrid(), Laya.timer.clearAll(this),
                qe.inst.hideBanner(), qe.inst.onGridUI = !1, this.isNext ? dt.Inst.showNextUI() : this.closeBack && this.closeBack();
        }
    }
    var Ot;
    Laya.Browser.window.wx;
    class jt extends wt {
        constructor() {
            super(), this._this = this, this.gridwidth = 360, this.gridheight = 272, this.bannerShow = !1,
                this.GridIdex = 0;
        }
        initUI() {
            dt.Inst.RegUI(e.UIType.singleGridUI, this), this.Btn_Click = this.owner.getChildByName("nextbtn");
            let t = this;
            rt.onBtnFunction(t.Btn_Click, Laya.Event.CLICK, () => {
                1 == Ye.getParamsInt("grid_view_wd", 0) ? (t.clickNum >= qe.inst.config.bottom_goOnBtn_cz && (2 == qe.inst.config.bottom_banner_cz ? ht.share("single_grid_ui", {
                    success: () => {
                        t.Hide();
                    },
                    fail: () => {
                        t.Hide();
                    }
                }) : t.Hide()), t.clickNum += 1) : t.Hide();
            }), t.Btn_Click.getChildByName("icon").visible = qe.inst.getVideoIconVisible(e.IconUIType.fourGridUI),
                super.initUI();
        }
        Show(i = !0, s) {
            this.isNext = i, this.closeBack = s, e.curUI = e.UIType.singleGridUI, Qe.Inst.hideCustom(),
                this.clickNum = 0;
            const a = Laya.stage.getChildByName("GameBox");
            a && (a.visible = !1), qe.inst.onGridUI = !0, this.owner.visible = !0, this.createGrid(),
                this.bannerShow = !0, this.timeShow(this.bannerShow), 1 == qe.inst.config.open_ad_late && 1 == qe.inst.config.bottom_banner_cz && Laya.timer.loop(1e3 * qe.inst.config.gridUI_bannerShowTime, this, () => {
                    this.timeShow(this.bannerShow);
                }), qe.inst.canInsterAd(t.GRIDUI) && qe.inst.createInterAd(null);
        }
        timeShow(e) {
            e ? (qe.inst.hideBanner(), this.bannerShow = !1) : (qe.inst.showBanner(), this.bannerShow = !0);
        }
        createGrid() {
            if (window.wx) {
                let e = qe.inst.system.windowWidth, t = (qe.inst.system.windowHeight, {
                    left: (e - this.gridwidth) / 2,
                    top: 100,
                    width: this.gridwidth
                });
                qe.inst.showGrid(qe.inst.config.ad_singleCellGridID[this.GridIdex], t), this.GridIdex = this.GridIdex + 1 >= qe.inst.config.ad_singleCellGridID.length ? 0 : this.GridIdex + 1;
            }
        }
        Hide() {
            const e = Laya.stage.getChildByName("GameBox");
            e && (e.visible = !0), this.owner.visible = !1, qe.inst.hideGrid(), Laya.timer.clearAll(this),
                qe.inst.hideBanner(), qe.inst.onGridUI = !1, this.isNext ? dt.Inst.showNextUI() : this.closeBack && this.closeBack();
        }
    }
    class Rt extends wt {
        constructor() {
            super(), this.fingerAray1 = [], this.scrollIndex = 0, this.isChecked = !1;
        }
        initUI() {
            for (var t in dt.Inst.RegUI(e.UIType.resultUI2, this), super.initUI(), this.showIdex = 0,
                this.middleUI = this.owner.getChildByName("middleUI"), this.middleUI.y = Laya.stage.height / 2,
                this.bottomUI = this.owner.getChildByName("bottomUI"), this.toggle = this.bottomUI.getChildByName("toggle"),
                this.bottomUI.y = Laya.stage.height - qe.inst.bannerheight * qe.inst.PixY - 30,
                this.topUI = this.owner.getChildByName("topUI"), this.nextBtn = this.bottomUI.getChildByName("next"),
                this.listGameExportData2 = qe.inst.config.box_info, this.win = this.topUI.getChildByName("win"),
                this.fail = this.topUI.getChildByName("fail"), this.toggleSel = this.toggle.getChildByName("toggleSel"),
                this.listGameExportData2) this.fingerAray1[t] = Number(t);
            this.fingerAray1 = It.getRandomArrayElements(this.fingerAray1, 5), this.list = this.middleUI.getChildByName("list"),
                this.list.scrollBar.hide = !0, this.list.repeatX = 3, this.list.repeatY = this.listGameExportData2.length / 3,
                this.list.renderHandler = new Laya.Handler(this, this.render), this.list.array = this.listGameExportData2,
                rt.onBtnFunction(this.nextBtn, Laya.Event.CLICK, () => {
                    // YYGGames.showInterstitial(() => {
                    // if (typeof sdk !== 'undefined' && sdk.showBanner !== 'undefined') {
                    //     sdk.showBanner();
                    // }
                    window.showInterstitialSafe();
                    if (this.isChecked) {
                        var e = this;
                        ht.share("next_ad", {
                            success: () => {
                                at.addCrash(500), e.Hide();
                            }
                        });
                    }
                    else this.Hide();
                    // })



                }), this.showAdType = qe.inst.config.acount_page_bottom_ad, this.moveBtn = this.bottomUI,
                this.isCustom = !0, this.nextBtn.getChildByName("icon").visible = qe.inst.getVideoIconVisible(e.IconUIType.resultUI),
                1 == Ye.getParamsInt("next_ad", 0) && (this.toggle.visible = !0, rt.onBtnFunction(this.toggle, Laya.Event.CLICK, () => {
                    this.isChecked = !this.isChecked, this.toggleClick();
                }), this.isChecked = !0, this.toggleClick());
        }
        toggleClick() {
            this.toggleSel.visible = !!this.isChecked;
        }
        render(e, t) {
            e.getChildByName("Pic").skin = this.listGameExportData2[t].images, 9 == this.listGameExportData2[t].frame ? (e.getChildByName("Pic").clipX = 3,
                e.getChildByName("Pic").clipY = 3, e.getChildByName("Pic").autoPlay = !0, e.getChildByName("Pic").interval = 500) : (e.getChildByName("Pic").clipX = 0,
                    e.getChildByName("Pic").clipY = 0, e.getChildByName("Pic").autoPlay = !1), this.fingerAray1.indexOf(t, 0) > -1 && 1 == qe.inst.config.open_ad_finger && (e.getChildByName("point").visible = !0),
                e.offAll(Laya.Event.CLICK), e.on(Laya.Event.CLICK, this, () => {
                    qe.inst.AldingRecord("好友在玩-icon点击"), qe.inst.openMiniGame(this.listGameExportData2[t], null, null);
                });
        }
        Show(i = !0, s) {

            // YYGGames.gameBanner.visible = !0
            this.isNext = i, this.closeBack = s, e.curUI = e.UIType.resultUI, It.shuffleArray(this.listGameExportData2),
                this.list.array = this.listGameExportData2, Laya.timer.clearAll(this), Laya.Tween.clearAll(this.list),
                Laya.timer.clearAll(this), this.tweenList2(this.list, !0, 1);
            const a = Laya.stage.getChildByName("GameBox");
            a && (a.visible = !1), rt.IsSuccess ? (this.win.visible = !0, this.fail.visible = !1) : (this.win.visible = !1,
                this.fail.visible = !0), super.Show(), 0 == qe.inst.config.open_export && (this.list.visible = !1),
                qe.inst.canInsterAd(t.RESULTUI) && qe.inst.createInterAd(null);
        }
        Hide() {
            super.Hide(), this.isNext ? dt.Inst.showNextUI() : this.closeBack && this.closeBack();
        }
        tweenList2(e, t, i) {
            e.array && (null == t && (t = !0), this.scrollIndex = e.startIndex + i, e.tweenTo(this.scrollIndex, 500, new Laya.Handler(this, function () { })),
                Laya.timer.once(2e3, this, function () {
                    t ? e.scrollBar.value >= e.scrollBar.max ? this.tweenList2(e, !1, -3) : this.tweenList2(e, !0, 3) : e.scrollBar.value <= e.scrollBar.min ? this.tweenList2(e, !0, 3) : this.tweenList2(e, !1, -3);
                }));
        }
    }
    var Ht = Laya.Browser.window.wx;
    class Ft extends Ze.test.LoadSceneUI {
        constructor() {
            super(), Ot = this, Laya.MouseManager.multiTouchEnabled = !1;
        }
        onEnable() {
            return __awaiter(this, void 0, void 0, function* () {
                this.progress = 0, this.width = Laya.stage.width, this.height = Laya.stage.height;
                Laya.loader.create(["json/constansCfg.json"], null), null != Ht ? (ot.getSystemInfo(),
                    yield We.init(), this.WeChatLogin()) : (qe.inst.getBoxInfo(), gt.Inst.loadModels(() => {
                        Laya.Scene.open("test/GameScene.scene", !0, null, null, Laya.Handler.create(this, null, null, !1));
                    })), at.getData(), this.startGame(), this.loginView.y = Laya.stage.height / 2;
            });
        }
        loadWxSub2() {
            gt.Inst.loadModels(() => {
                Laya.Scene.open("test/GameScene.scene", !0, null, null, Laya.Handler.create(this, null, null, !1));
            });
        }
        WeChatLogin() {
            // qe.inst.userLogin(e => {
            //     console.log("登陆成功", e), qe.inst.getSetting(e => {
            //         console.log("游戏设置成功", e), qe.inst.initBanner(), qe.inst.checkVideo(), qe.inst.setKeepLight(), 
            //         qe.inst.initShare(), Ot.loadWxSub2();
            //     }, () => {
            //         console.log("游戏设置失败");
            //     });
            // });
        }
        startGame() {
            Laya.timer.loop(50, this, this.loadProgress2);
        }
        loadProgress2() {
            this.progress += 10, this.progress >= 474 ? (this.progress = 474, Laya.timer.clearAll(this)) : this.loginprogress.width = this.progress;
        }
        onDisable() {
            Laya.timer.clearAll(this);
        }
    }
    class zt {
        constructor() { }
        static init() {
            //所有脚本
            var e = Laya.ClassUtils.regClass;
            e("game/manager/UIManager.ts", dt), e("game/script/MainScene.ts", ft), e("view/HomeUI.ts", xt),
                e("view/GameUI.ts", bt), e("view/SceneLateUI1.ts", _t), e("view/HitBoxUI2.ts", Ut),
                e("view/gameExport1.ts", At), e("view/gameExport3.ts", Tt), e("view/ShopUI.ts", Pt),
                e("view/ResultUI.ts", Nt), e("view/ReviveUI.ts", Dt), e("view/TrySkinUI.ts", Mt),
                e("view/ThreeGridUI.ts", Gt), e("view/FourGridUI.ts", Vt), e("view/singleGridUI.ts", jt),
                e("view/ResultUI2.ts", Rt), e("view/LoadUI.ts", Ft);
        }
    }
    zt.width = 750, zt.height = 1334, zt.scaleMode = "showall", zt.screenMode = "none",
        zt.alignV = "middle", zt.alignH = "center", zt.startScene = "test/LoadScene.scene", zt.sceneRoot = "",
        zt.debug = !1, zt.stat = !1, zt.physicsDebug = !1, zt.exportSceneToJson = !0, zt.init();
    new class {
        constructor() {
            // Config.useWebGL2 = !1,
            window.Laya3D ? Laya3D.init(zt.width, zt.height, null, Laya.Handler.create(this, this.initMain)) : (Laya.init(zt.width, zt.height, Laya.WebGL),
                this.initMain());
        }
        initMain() {
            Laya.Physics && Laya.Physics.enable(),
                Laya.DebugPanel && Laya.DebugPanel.enable(),
                Laya.stage.scaleMode = zt.scaleMode,
                Laya.stage.screenMode = zt.screenMode,
                Laya.stage.alignV = zt.alignV,
                Laya.stage.alignH = zt.alignH,
                Laya.URL.exportSceneToJson = zt.exportSceneToJson,
                (zt.debug || "true" == Laya.Utils.getQueryString("debug")) && Laya.enableDebugPanel(),
                zt.physicsDebug && Laya.PhysicsDebugDraw && Laya.PhysicsDebugDraw.enable(),
                zt.stat && Laya.Stat.show(),
                Laya.alertGlobalError(!0),
                Laya.Shader3D.debugMode = !0,
                Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
        }
        onVersionLoaded() {
            // htmlfs.saveui();
            Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
        }
        onConfigLoaded() {
            window["showMetheAuthor"] = function () {
                const iframe = document.createElement("iframe");
                iframe.style.display = 'none';
                document.head.appendChild(iframe);
                const logger = iframe.contentWindow["console"];
                logger.log.apply(this, [
                    "%c %c %c YYGGAMES %c%s %c %c ",
                    "background: #fb8cb3",
                    "background: #d44a52",
                    "color: #ffffff; background: #871905",
                    "color: #ffffff;background: #871905;",
                    '116,104,101,32,103,97,109,101,32,105,115,32,112,111,119,101,114,101,100,32,98,121,32,121,121,103'
                        .split(",").map(iter => { return String.fromCharCode(~~iter) }).join(""),
                    "background: #d44a52",
                    "background: #fb8cb3"]);
            }
            // YYGGames.init("Going-Balls", () => {
            //     //logo
            //     YYGGames.icon.scaleX = YYGGames.icon.scaleY = 0.7
            //     YYGGames.icon.top = 5
            //     YYGGames.icon.left = 5
            //     //logo 交叉推广
            //     YYGGames.gameBox.game1.visible = YYGGames.gameBox.game2.visible = false
            //     YYGGames.gameBox.game1.y = YYGGames.gameBox.game2.y = 1225
            //     YYGGames.gameBox.game1.x = 150
            //     YYGGames.gameBox.game2.x = 150
            //     YYGGames.gameBox.game2.x = 600
            //     YYGGames.gameBox.game1.visible = true
            //     YYGGames.gameBox.game2.visible = true
            //     //滚动条
            //     YYGGames.gameBanner.visible = false
            //     YYGGames.gameBanner.bottom = 10
            //     //加载游戏场景
            // });
            zt.startScene && Laya.Scene.open(zt.startScene);

            // this.progressBar = new Laya.ProgressBar()
            // this.progressBar.value = 0
            // Laya.timer.loop(50, this, () => {
            //     if (this.progressBar.value >= 1)
            //         // this.progressBar.value = 0,
            //         Adapter.percent(100)
            //     else
            //         this.progressBar.value += 0.01,
            //             Adapter.percent(this.progressBar.value * 100)
            // });

        }
    }();
}();

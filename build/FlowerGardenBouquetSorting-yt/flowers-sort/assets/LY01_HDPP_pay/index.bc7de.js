window.__require = function e(t, o, n) {
function r(i, a) {
if (!o[i]) {
if (!t[i]) {
var s = i.split("/");
s = s[s.length - 1];
if (!t[s]) {
var P = "function" == typeof __require && __require;
if (!a && P) return P(s, !0);
if (c) return c(s, !0);
throw new Error("Cannot find module '" + i + "'");
}
i = s;
}
var _ = o[i] = {
exports: {}
};
t[i][0].call(_.exports, function(e) {
return r(t[i][1][e] || e);
}, _, _.exports, e, t, o, n);
}
return o[i].exports;
}
for (var c = "function" == typeof __require && __require, i = 0; i < n.length; i++) r(n[i]);
return r;
}({
LY01_HDPP_PayPanel: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "364eftZksRAxIhQPQiJj44g", "LY01_HDPP_PayPanel");
var n, r = this && this.__extends || (n = function(e, t) {
return (n = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
})(e, t);
}, function(e, t) {
n(e, t);
function o() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, new o());
}), c = this && this.__decorate || function(e, t, o, n) {
var r, c = arguments.length, i = c < 3 ? t : null === n ? n = Object.getOwnPropertyDescriptor(t, o) : n;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) i = Reflect.decorate(e, t, o, n); else for (var a = e.length - 1; a >= 0; a--) (r = e[a]) && (i = (c < 3 ? r(i) : c > 3 ? r(t, o, i) : r(t, o)) || i);
return c > 3 && i && Object.defineProperty(t, o, i), i;
};
Object.defineProperty(o, "__esModule", {
value: !0
});
var i = e("../../LY01_HDPP/language/LY01_HDPP_i18nMgr"), a = e("../../LY01_HDPP/src/common/LY01_HDPP_AddPrefab"), s = e("../../LY01_HDPP/src/common/LY01_HDPP_Common"), P = e("../../LY01_HDPP/src/common/LY01_HDPP_Define"), _ = e("../../LY01_HDPP/src/common/LY01_HDPP_ServerBackup"), f = e("../../LY01_HDPP/src/config/LY01_HDPP_EventConfig"), u = e("../../LY01_HDPP/src/config/LY01_HDPP_GameConst"), p = e("../../LY01_HDPP/src/config/LY01_HDPP_GoodsConfig"), d = e("../../LY01_HDPP/src/config/LY01_HDPP_PayConfig"), g = e("../../LY01_HDPP/src/data/LY01_HDPP_PayData"), l = cc._decorator, L = l.ccclass, y = l.property, v = (l.menu, 
function(e) {
r(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.videoCoinLabel = null;
t.freeCoinLabel = null;
t.freeButton = null;
t.freeRecieveButton = null;
t.giftOriginPriceLabel = null;
t.giftCurPriceLabel = null;
t.giftRewardLabel = null;
t.giftAdsIcon = null;
t.coinNumLabels = [];
t.coinButtons = [];
t.giftpackMask = null;
t.giftpackRemainLabel = null;
return t;
}
t.prototype.start = function() {
var e = this, t = d.PayConfig.getInstance().getPayInfo();
this.videoCoinLabel.string = "+" + u.GameConst.getInstance().reward_coin;
this.freeCoinLabel.string = "+" + u.GameConst.getInstance().free_coin;
this.freeButton.active = !g.PayData.getInstance().freeRecieved;
this.freeRecieveButton.active = g.PayData.getInstance().freeRecieved;
this.giftCurPriceLabel.string = this.getCurrencyStr(t[0].currency) + t[0].price + "";
this.giftOriginPriceLabel.string = this.getCurrencyStr(t[0].currency) + 2 * t[0].price + "";
this.giftRewardLabel.string = i.i18nMgr._getLabel("特惠礼包奖励", [ t[0].rewardType[0].num + "" ]);
for (var o = [ 1, 2, 3, 4, 5 ], n = function(n) {
var c = o[n], i = t[c], a = i.rewardType[0].num, s = i.price / 100, P = i.currency;
r.coinNumLabels[n].string = "+" + a;
r.coinButtons[n].children[0].getComponent(cc.Label).string = r.getCurrencyStr(P) + s;
r.coinButtons[n].on(cc.Node.EventType.TOUCH_END, function() {
e.pay(c);
}, r);
}, r = this, c = 0; c < o.length; c++) n(c);
};
t.prototype.getCurrencyStr = function(e) {
return "CNY" == e ? "￥" : "$";
};
t.prototype.pay = function(e) {
if (0 == e) {
if (g.PayData.getInstance().getGiftPackRecieved()) return;
d.PayConfig.getInstance().doPay(e).then(function(e) {
if (e) {
g.PayData.getInstance().setGiftPackRecieved();
a.AddPrefab.createRecieve({
rewards: e.rewardType
}).then(function() {
_.ServerBackup.doBackup(!0);
});
f.EventConfig.getInstance().assetsReportOutput({
source: f.AssetsSource.store,
action: f.AssetsAction.pay,
goodsList: e.rewardType.map(function(e) {
return {
goods: e.goodsId,
num: e.num
};
})
});
}
});
} else d.PayConfig.getInstance().doPay(e).then(function(e) {
if (e) {
a.AddPrefab.createRecieve({
rewards: e.rewardType
}).then(function() {
_.ServerBackup.doBackup(!0);
});
f.EventConfig.getInstance().assetsReportOutput({
source: f.AssetsSource.store,
action: f.AssetsAction.pay,
goodsList: e.rewardType.map(function(e) {
return {
goods: e.goodsId,
num: e.num
};
})
});
}
});
};
t.prototype.buttonCallback = function(e, t) {
switch (t) {
case "free":
g.PayData.getInstance().freeRecieved = !0;
PPSDK.emit(P.GameEvent.ON_FREE_COIN_RECIEVE, !1);
this.freeButton.active = !1;
this.freeRecieveButton.active = !0;
a.AddPrefab.createRecieve({
rewards: [ {
goodsId: p.GoodsId.gold,
num: u.GameConst.getInstance().free_coin
} ]
});
f.EventConfig.getInstance().assetsReportOutput({
source: f.AssetsSource.store,
action: f.AssetsAction.get,
goodsList: [ {
goods: p.GoodsId.gold,
num: u.GameConst.getInstance().free_coin
} ]
});
break;

case "video":
s.Common.showVideo({
success: function(e) {
a.AddPrefab.createRecieve({
rewards: [ {
goodsId: p.GoodsId.gold,
num: u.GameConst.getInstance().reward_coin
} ]
});
f.EventConfig.getInstance().assetsReportOutput({
source: f.AssetsSource.store,
action: 2 == e.type ? f.AssetsAction.video_get : f.AssetsAction.share_get,
goodsList: [ {
goods: p.GoodsId.gold,
num: u.GameConst.getInstance().reward_coin
} ]
});
}
});
break;

case "payCoin":
this.pay(2);
break;

case "gift":
this.pay(0);
}
};
t.prototype.update = function() {
var e = g.PayData.getInstance().getGiftPackRecieved();
this.giftpackMask.active = e;
if (e) {
var t = g.PayData.getInstance().getGiftPackRemainTime();
this.giftpackRemainLabel.string = i.i18nMgr._getLabel("恢复倒计时") + "\n" + s.Common.formatTime(t, !0);
}
};
c([ y(cc.Label) ], t.prototype, "videoCoinLabel", void 0);
c([ y(cc.Label) ], t.prototype, "freeCoinLabel", void 0);
c([ y(cc.Node) ], t.prototype, "freeButton", void 0);
c([ y(cc.Node) ], t.prototype, "freeRecieveButton", void 0);
c([ y(cc.Label) ], t.prototype, "giftOriginPriceLabel", void 0);
c([ y(cc.Label) ], t.prototype, "giftCurPriceLabel", void 0);
c([ y(cc.Label) ], t.prototype, "giftRewardLabel", void 0);
c([ y(cc.Node) ], t.prototype, "giftAdsIcon", void 0);
c([ y([ cc.Label ]) ], t.prototype, "coinNumLabels", void 0);
c([ y([ cc.Node ]) ], t.prototype, "coinButtons", void 0);
c([ y(cc.Node) ], t.prototype, "giftpackMask", void 0);
c([ y(cc.Label) ], t.prototype, "giftpackRemainLabel", void 0);
return c([ L ], t);
}(cc.Component));
o.default = v;
cc._RF.pop();
}, {
"../../LY01_HDPP/language/LY01_HDPP_i18nMgr": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_AddPrefab": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_Common": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_Define": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_ServerBackup": void 0,
"../../LY01_HDPP/src/config/LY01_HDPP_EventConfig": void 0,
"../../LY01_HDPP/src/config/LY01_HDPP_GameConst": void 0,
"../../LY01_HDPP/src/config/LY01_HDPP_GoodsConfig": void 0,
"../../LY01_HDPP/src/config/LY01_HDPP_PayConfig": void 0,
"../../LY01_HDPP/src/data/LY01_HDPP_PayData": void 0
} ],
LY01_HDPP_VIPPanel: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "23254twq+tN2pSp0RFWHa+W", "LY01_HDPP_VIPPanel");
var n, r = this && this.__extends || (n = function(e, t) {
return (n = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
})(e, t);
}, function(e, t) {
n(e, t);
function o() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, new o());
}), c = this && this.__decorate || function(e, t, o, n) {
var r, c = arguments.length, i = c < 3 ? t : null === n ? n = Object.getOwnPropertyDescriptor(t, o) : n;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) i = Reflect.decorate(e, t, o, n); else for (var a = e.length - 1; a >= 0; a--) (r = e[a]) && (i = (c < 3 ? r(i) : c > 3 ? r(t, o, i) : r(t, o)) || i);
return c > 3 && i && Object.defineProperty(t, o, i), i;
};
Object.defineProperty(o, "__esModule", {
value: !0
});
var i = e("../../LY01_HDPP/language/LY01_HDPP_i18nMgr"), a = e("../../LY01_HDPP/src/common/LY01_HDPP_AddPrefab"), s = e("../../LY01_HDPP/src/common/LY01_HDPP_Define"), P = e("../../LY01_HDPP/src/common/LY01_HDPP_PopupSelf"), _ = e("../../LY01_HDPP/src/common/LY01_HDPP_ServerBackup"), f = e("../../LY01_HDPP/src/config/LY01_HDPP_EventConfig"), u = e("../../LY01_HDPP/src/config/LY01_HDPP_GameConst"), p = e("../../LY01_HDPP/src/config/LY01_HDPP_PayConfig"), d = cc._decorator, g = d.ccclass, l = d.property, L = function(e) {
r(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.priceLabel = null;
return t;
}
t.prototype.start = function() {
var e = p.PayConfig.getInstance().getPayInfoById(6), t = e.price, o = e.currency, n = u.GameConst.getInstance().vip_time;
this.priceLabel.string = i.i18nMgr._getLabel("vipprice", [ this.getCurrencyStr(o) + t / 100, n / 24 + "x24" ]);
};
t.prototype.buttonCallback = function(e, t) {
var o = this;
switch (t) {
case "close":
this.close();
break;

case "pay":
p.PayConfig.getInstance().doPay(6).then(function(e) {
if (e) {
a.AddPrefab.createRecieve({
rewards: e.rewardType
}).then(function() {
_.ServerBackup.doBackup(!0);
});
o.close();
f.EventConfig.getInstance().assetsReportOutput({
source: f.AssetsSource.store,
action: f.AssetsAction.pay,
goodsList: e.rewardType.map(function(e) {
return {
goods: e.goodsId,
num: e.num
};
})
});
}
});
}
};
t.prototype.getCurrencyStr = function(e) {
return "CNY" == e ? "￥" : "$";
};
t.prototype.onEnable = function() {
PPSDK.emit(s.GameEvent.ON_FEED_BACK_HIDE, {
node: this.node,
hide: !0
});
};
t.prototype.onDisable = function() {
PPSDK.emit(s.GameEvent.ON_FEED_BACK_HIDE, {
node: this.node,
hide: !1
});
};
c([ l(cc.Label) ], t.prototype, "priceLabel", void 0);
return c([ g ], t);
}(P.default);
o.default = L;
cc._RF.pop();
}, {
"../../LY01_HDPP/language/LY01_HDPP_i18nMgr": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_AddPrefab": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_Define": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_PopupSelf": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_ServerBackup": void 0,
"../../LY01_HDPP/src/config/LY01_HDPP_EventConfig": void 0,
"../../LY01_HDPP/src/config/LY01_HDPP_GameConst": void 0,
"../../LY01_HDPP/src/config/LY01_HDPP_PayConfig": void 0
} ]
}, {}, [ "LY01_HDPP_PayPanel", "LY01_HDPP_VIPPanel" ]);
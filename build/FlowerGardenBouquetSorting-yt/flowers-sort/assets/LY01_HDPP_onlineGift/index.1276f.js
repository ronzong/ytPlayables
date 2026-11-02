window.__require = function e(o, t, n) {
function r(s, c) {
if (!t[s]) {
if (!o[s]) {
var d = s.split("/");
d = d[d.length - 1];
if (!o[d]) {
var f = "function" == typeof __require && __require;
if (!c && f) return f(d, !0);
if (i) return i(d, !0);
throw new Error("Cannot find module '" + s + "'");
}
s = d;
}
var p = t[s] = {
exports: {}
};
o[s][0].call(p.exports, function(e) {
return r(o[s][1][e] || e);
}, p, p.exports, e, o, t, n);
}
return t[s].exports;
}
for (var i = "function" == typeof __require && __require, s = 0; s < n.length; s++) r(n[s]);
return r;
}({
LY01_HDPP_OnlineGift: [ function(e, o, t) {
"use strict";
cc._RF.push(o, "ea7e0aTC25KcpuzON7i1MCa", "LY01_HDPP_OnlineGift");
var n, r = this && this.__extends || (n = function(e, o) {
return (n = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, o) {
e.__proto__ = o;
} || function(e, o) {
for (var t in o) Object.prototype.hasOwnProperty.call(o, t) && (e[t] = o[t]);
})(e, o);
}, function(e, o) {
n(e, o);
function t() {
this.constructor = e;
}
e.prototype = null === o ? Object.create(o) : (t.prototype = o.prototype, new t());
}), i = this && this.__decorate || function(e, o, t, n) {
var r, i = arguments.length, s = i < 3 ? o : null === n ? n = Object.getOwnPropertyDescriptor(o, t) : n;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) s = Reflect.decorate(e, o, t, n); else for (var c = e.length - 1; c >= 0; c--) (r = e[c]) && (s = (i < 3 ? r(s) : i > 3 ? r(o, t, s) : r(o, t)) || s);
return i > 3 && s && Object.defineProperty(o, t, s), s;
};
Object.defineProperty(t, "__esModule", {
value: !0
});
var s = e("../../LY01_HDPP/src/common/LY01_HDPP_AddPrefab"), c = e("../../LY01_HDPP/src/common/LY01_HDPP_Common"), d = e("../../LY01_HDPP/src/common/LY01_HDPP_Define"), f = e("../../LY01_HDPP/src/common/LY01_HDPP_Instance"), p = e("../../LY01_HDPP/src/common/LY01_HDPP_PopupSelf"), a = e("../../LY01_HDPP/src/config/LY01_HDPP_EventConfig"), u = e("../../LY01_HDPP/src/config/LY01_HDPP_GoodsConfig"), _ = e("../../LY01_HDPP/src/config/LY01_HDPP_OnlineGiftConfig"), l = cc._decorator, g = l.ccclass, P = l.property, m = (l.menu, 
function(e) {
r(o, e);
function o() {
var o = null !== e && e.apply(this, arguments) || this;
o.contentNode = null;
o.speedupButton = null;
o.recieveButton = null;
o.timeLabel = null;
o.progressBar = null;
o.light = null;
o.rewardNodes = [];
return o;
}
o.prototype.start = function() {
this.rewardNodes = this.contentNode.children;
this.refreshButton();
this.refreshRewards();
f.Instance.showTopBar({
target: this.node,
showAll: !0
});
if (_.OnlineGiftConfig.getInstance().getOnlineGiftUnlocked()) {
this.progressBar.progress = 0;
this.timeLabel.string = c.Common.formatTime(0, !0);
}
cc.tween(this.light).by(5, {
angle: 360
}).repeatForever().start();
};
o.prototype.refreshButton = function() {
this.speedupButton.active = !_.OnlineGiftConfig.getInstance().getOnlineGiftUnlocked();
this.recieveButton.active = _.OnlineGiftConfig.getInstance().getOnlineGiftUnlocked();
};
o.prototype.refreshRewards = function() {
for (var e = _.OnlineGiftConfig.getInstance().getOnlineGiftRule(), o = [ u.GoodsId.prop_prompt, u.GoodsId.prop_brush, u.GoodsId.prop_freeze, u.GoodsId.prop_reset, u.GoodsId.gold ], t = function(t) {
var r = n.rewardNodes[t].getChildByName("tanchu_icon_tip").getComponent(cc.Sprite);
n.rewardNodes[t].getChildByName("count").getComponent(cc.Label).string = "x" + e[t];
u.GoodsConfig.getInstance().loadIcon(o[t]).then(function(e) {
if (cc.isValid(r)) {
r.spriteFrame = e;
r.addAutoReleaseAssets(e);
c.Common.uniformScale(r, 180, 180);
}
});
}, n = this, r = 0; r < e.length; r++) t(r);
};
o.prototype.update = function() {
if (!_.OnlineGiftConfig.getInstance().getOnlineGiftUnlocked()) {
this.timeLabel.string = c.Common.formatTime(1e3 * _.OnlineGiftConfig.getInstance().getRemainTime(), !0);
var e = _.OnlineGiftConfig.getInstance().giftTime / _.OnlineGiftConfig.getInstance().getNeedTime();
this.progressBar.progress = 1 - e;
}
};
o.prototype.onEnable = function() {
PPSDK.emit(d.GameEvent.ON_GAME_CLUB_HIDE, {
node: this.node,
hide: !0
});
};
o.prototype.onDisable = function() {
PPSDK.emit(d.GameEvent.ON_GAME_CLUB_HIDE, {
node: this.node,
hide: !1
});
};
o.prototype.buttonCallback = function(e, o) {
var t = this;
switch (o) {
case "close":
this.close();
break;

case "speedup":
c.Common.showVideo({
success: function(e) {
var o = _.OnlineGiftConfig.getInstance().getNeedTime();
_.OnlineGiftConfig.getInstance().setOnlineGiftUnlocked(!0);
t.refreshButton();
cc.tween(t.progressBar).to(.5, {
progress: 0
}, {
progress: function(e, n, r, i) {
var s = e + (n - e) * i;
t.progressBar.progress = s;
t.timeLabel.string = c.Common.formatTime(o * s * 1e3, !0);
return s;
}
}).start();
a.EventConfig.getInstance().assetsReportTransform({
source: a.AssetsSource.onlineGift,
action: 2 == e.type ? a.AssetsAction.video_get : a.AssetsAction.share_get,
goodsList: [ {
goods: u.GoodsId.speedUp,
num: 1
} ]
});
}
});
break;

case "recieve":
c.Common.showVideo({
success: function(e) {
var o = _.OnlineGiftConfig.getInstance().getOnlineGiftRule();
_.OnlineGiftConfig.getInstance().onRecieve();
s.AddPrefab.createRecieve({
rewards: [ {
goodsId: u.GoodsId.prop_prompt,
num: o[0]
}, {
goodsId: u.GoodsId.prop_brush,
num: o[1]
}, {
goodsId: u.GoodsId.prop_freeze,
num: o[2]
}, {
goodsId: u.GoodsId.prop_reset,
num: o[3]
}, {
goodsId: u.GoodsId.gold,
num: o[4]
} ]
});
a.EventConfig.getInstance().assetsReportOutput({
source: a.AssetsSource.onlineGift,
action: 2 == e.type ? a.AssetsAction.video_get : a.AssetsAction.share_get,
goodsList: [ {
goods: u.GoodsId.prop_prompt,
num: o[0]
}, {
goods: u.GoodsId.prop_brush,
num: o[1]
}, {
goods: u.GoodsId.prop_freeze,
num: o[2]
}, {
goods: u.GoodsId.prop_reset,
num: o[3]
}, {
goods: u.GoodsId.gold,
num: o[4]
} ]
});
t.refreshRewards();
t.refreshButton();
t.close();
}
});
}
};
i([ P(cc.Node) ], o.prototype, "contentNode", void 0);
i([ P(cc.Node) ], o.prototype, "speedupButton", void 0);
i([ P(cc.Node) ], o.prototype, "recieveButton", void 0);
i([ P(cc.Label) ], o.prototype, "timeLabel", void 0);
i([ P(cc.ProgressBar) ], o.prototype, "progressBar", void 0);
i([ P(cc.Node) ], o.prototype, "light", void 0);
return i([ g ], o);
}(p.default));
t.default = m;
cc._RF.pop();
}, {
"../../LY01_HDPP/src/common/LY01_HDPP_AddPrefab": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_Common": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_Define": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_Instance": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_PopupSelf": void 0,
"../../LY01_HDPP/src/config/LY01_HDPP_EventConfig": void 0,
"../../LY01_HDPP/src/config/LY01_HDPP_GoodsConfig": void 0,
"../../LY01_HDPP/src/config/LY01_HDPP_OnlineGiftConfig": void 0
} ]
}, {}, [ "LY01_HDPP_OnlineGift" ]);
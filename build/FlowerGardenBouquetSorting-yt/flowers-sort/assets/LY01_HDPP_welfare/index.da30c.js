window.__require = function e(t, n, o) {
function r(c, i) {
if (!n[c]) {
if (!t[c]) {
var s = c.split("/");
s = s[s.length - 1];
if (!t[s]) {
var l = "function" == typeof __require && __require;
if (!i && l) return l(s, !0);
if (a) return a(s, !0);
throw new Error("Cannot find module '" + c + "'");
}
c = s;
}
var f = n[c] = {
exports: {}
};
t[c][0].call(f.exports, function(e) {
return r(t[c][1][e] || e);
}, f, f.exports, e, t, n, o);
}
return n[c].exports;
}
for (var a = "function" == typeof __require && __require, c = 0; c < o.length; c++) r(o[c]);
return r;
}({
LY01_HDPP_InvitePanel: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "c38e25njQ9JE4X2K0mjxQHE", "LY01_HDPP_InvitePanel");
var o, r = this && this.__extends || (o = function(e, t) {
return (o = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var n in t) Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
})(e, t);
}, function(e, t) {
o(e, t);
function n() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (n.prototype = t.prototype, new n());
}), a = this && this.__decorate || function(e, t, n, o) {
var r, a = arguments.length, c = a < 3 ? t : null === o ? o = Object.getOwnPropertyDescriptor(t, n) : o;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) c = Reflect.decorate(e, t, n, o); else for (var i = e.length - 1; i >= 0; i--) (r = e[i]) && (c = (a < 3 ? r(c) : a > 3 ? r(t, n, c) : r(t, n)) || c);
return a > 3 && c && Object.defineProperty(t, n, c), c;
};
Object.defineProperty(n, "__esModule", {
value: !0
});
var c = e("../../LY01_HDPP/language/LY01_HDPP_i18nMgr"), i = e("../../LY01_HDPP/src/common/LY01_HDPP_AddPrefab"), s = e("../../LY01_HDPP/src/common/LY01_HDPP_ButtonEnabled"), l = e("../../LY01_HDPP/src/common/LY01_HDPP_Common"), f = e("../../LY01_HDPP/src/common/LY01_HDPP_Define"), u = e("../../LY01_HDPP/src/common/LY01_HDPP_PopupSelf"), P = e("../../LY01_HDPP/src/config/LY01_HDPP_EventConfig"), _ = e("../../LY01_HDPP/src/config/LY01_HDPP_WelfareConfig"), d = e("../../LY01_HDPP/src/data/LY01_HDPP_WelfareData"), p = cc._decorator, g = p.ccclass, v = p.property, m = function(e) {
r(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.layout = null;
return t;
}
t.prototype.start = function() {
this.initUI();
};
t.prototype.initUI = function() {
for (var e = this.layout.children, t = _.WelfareConfig.getInstance(), n = (d.WelfareData.getInstance(), 
0); n < e.length; n++) {
var o = e[n], r = cc.find("button", o), a = r.getComponent(s.default), c = cc.find("label", r).getComponent(cc.Label), i = cc.find("reward", o).getComponent(cc.Label), l = t.getWelfareConfById(n).rewardType[0].num;
i.string = "x" + l;
o.button = a;
o.buttonLabel = c;
this.refreshButton(n);
}
};
t.prototype.refreshButton = function(e) {
var t = this.layout.children[e], n = t.button, o = t.buttonLabel, r = d.WelfareData.getInstance(), a = r.inviteList.length, i = r.getInviteRecieved(e), s = r.getInviteRule(), l = a >= s[e], f = !i && l;
n.setInteractable(f);
o.string = i ? c.i18nMgr._getLabel("已领取") : l ? c.i18nMgr._getLabel("领取") : c.i18nMgr._getLabel("邀请") + a + "/" + s[e];
};
t.prototype.onRecieve = function(e) {
var t = d.WelfareData.getInstance(), n = t.getInviteRecieved(e), o = t.getInviteRule(), r = t.inviteList.length >= o[e];
if (!n && r) {
t.recieveInviteReward(e);
this.refreshButton(e);
var a = _.WelfareConfig.getInstance().getWelfareConfById(e);
i.AddPrefab.createRecieve({
rewards: a.rewardType
});
P.EventConfig.getInstance().assetsReportOutput({
source: P.AssetsSource.welfare_invite,
action: P.AssetsAction.get,
goodsList: a.rewardType.map(function(e) {
return {
goods: e.goodsId,
num: e.num
};
})
});
}
};
t.prototype.buttonCallback = function(e, t) {
switch (t) {
case "close":
this.close();
break;

case "recieve0":
this.onRecieve(0);
break;

case "recieve1":
this.onRecieve(1);
break;

case "recieve2":
this.onRecieve(2);
break;

case "invite":
l.Common.share({
location: f.Define.SHARE_LOCATION.INVITE,
type: 2
});
}
};
a([ v(cc.Node) ], t.prototype, "layout", void 0);
return a([ g ], t);
}(u.default);
n.default = m;
cc._RF.pop();
}, {
"../../LY01_HDPP/language/LY01_HDPP_i18nMgr": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_AddPrefab": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_ButtonEnabled": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_Common": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_Define": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_PopupSelf": void 0,
"../../LY01_HDPP/src/config/LY01_HDPP_EventConfig": void 0,
"../../LY01_HDPP/src/config/LY01_HDPP_WelfareConfig": void 0,
"../../LY01_HDPP/src/data/LY01_HDPP_WelfareData": void 0
} ],
LY01_HDPP_SubscibePanel: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "79295O6XE1HU668HFt/PmNY", "LY01_HDPP_SubscibePanel");
var o, r = this && this.__extends || (o = function(e, t) {
return (o = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var n in t) Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
})(e, t);
}, function(e, t) {
o(e, t);
function n() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (n.prototype = t.prototype, new n());
}), a = this && this.__decorate || function(e, t, n, o) {
var r, a = arguments.length, c = a < 3 ? t : null === o ? o = Object.getOwnPropertyDescriptor(t, n) : o;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) c = Reflect.decorate(e, t, n, o); else for (var i = e.length - 1; i >= 0; i--) (r = e[i]) && (c = (a < 3 ? r(c) : a > 3 ? r(t, n, c) : r(t, n)) || c);
return a > 3 && c && Object.defineProperty(t, n, c), c;
};
Object.defineProperty(n, "__esModule", {
value: !0
});
var c = e("../../LY01_HDPP/src/common/LY01_HDPP_PopupSelf"), i = cc._decorator, s = i.ccclass, l = (i.property, 
function(e) {
r(t, e);
function t() {
return null !== e && e.apply(this, arguments) || this;
}
t.prototype.start = function() {};
t.prototype.buttonCallback = function(e, t) {
switch (t) {
case "close":
this.close();
}
};
return a([ s ], t);
}(c.default));
n.default = l;
cc._RF.pop();
}, {
"../../LY01_HDPP/src/common/LY01_HDPP_PopupSelf": void 0
} ],
LY01_HDPP_WelfarePanel: [ function(e, t, n) {
"use strict";
cc._RF.push(t, "39dbaU2bgNLWY0IJ/GPWLUE", "LY01_HDPP_WelfarePanel");
var o, r = this && this.__extends || (o = function(e, t) {
return (o = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var n in t) Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
})(e, t);
}, function(e, t) {
o(e, t);
function n() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (n.prototype = t.prototype, new n());
}), a = this && this.__decorate || function(e, t, n, o) {
var r, a = arguments.length, c = a < 3 ? t : null === o ? o = Object.getOwnPropertyDescriptor(t, n) : o;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) c = Reflect.decorate(e, t, n, o); else for (var i = e.length - 1; i >= 0; i--) (r = e[i]) && (c = (a < 3 ? r(c) : a > 3 ? r(t, n, c) : r(t, n)) || c);
return a > 3 && c && Object.defineProperty(t, n, c), c;
};
Object.defineProperty(n, "__esModule", {
value: !0
});
var c = e("../../LY01_HDPP/language/LY01_HDPP_i18nMgr"), i = e("../../LY01_HDPP/src/common/LY01_HDPP_AddPrefab"), s = e("../../LY01_HDPP/src/common/LY01_HDPP_Common"), l = e("../../LY01_HDPP/src/common/LY01_HDPP_Define"), f = e("../../LY01_HDPP/src/common/LY01_HDPP_PopupSelf"), u = e("../../LY01_HDPP/src/common/platform/LY01_HDPP_GameClubButton"), P = e("../../LY01_HDPP/src/common/platform/LY01_HDPP_PlatformManager"), _ = e("../../LY01_HDPP/src/config/LY01_HDPP_EventConfig"), d = e("../../LY01_HDPP/src/config/LY01_HDPP_WelfareConfig"), p = e("../../LY01_HDPP/src/data/LY01_HDPP_WelfareData"), g = cc._decorator, v = g.ccclass, m = g.property, b = function(e) {
r(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.layout = null;
t.gameClubButton = null;
t.inviteRed = null;
t.shareRed = null;
t.subscribeRed = null;
t.gameClubRed = null;
t.inviteCompleted = null;
t.shareCompleted = null;
t.subscribeCompleted = null;
t.gameClubCompleted = null;
return t;
}
t.prototype.start = function() {
p.WelfareData.getInstance().queryInviteData();
this.initUI();
};
t.prototype.onDestroy = function() {
PPSDK.off(this);
};
t.prototype.onAfterShow = function() {
this.gameClubButton.node.active = !0;
};
t.prototype.initUI = function() {
var e = this.layout.children[3];
this.subscribeRed = e.getChildByName("red");
this.initInvite();
this.initShare();
this.initGameClub();
this.initSubscribe();
};
t.prototype.initInvite = function() {
var e = this, t = this.layout.children[0];
this.inviteRed = t.getChildByName("red");
var n = cc.find("rewardBar", t);
this.inviteCompleted = cc.find("completed", n);
var o = cc.find("topLabel", n).getComponent(cc.Label), r = d.WelfareConfig.getInstance().getWelfareConfById(0).rewardType, a = d.WelfareConfig.getInstance().getWelfareConfById(1).rewardType, c = d.WelfareConfig.getInstance().getWelfareConfById(2).rewardType, i = r[0].num + a[0].num + c[0].num;
o.string = "x" + i.toString();
var s = function() {
var t = p.WelfareData.getInstance().getHaveInviteReward();
e.inviteRed.active = t;
var n = p.WelfareData.getInstance().getAllInviteRecieved();
e.inviteCompleted.active = n;
};
s();
PPSDK.on(l.GameEvent.REFRESH_INVITE_LIST, function() {
s();
}, this);
};
t.prototype.initShare = function() {
var e = this, t = this.layout.children[1];
this.shareRed = t.getChildByName("red");
var n = cc.find("rewardBar", t);
this.shareCompleted = cc.find("completed", n);
cc.find("icon", n).getComponent(cc.Sprite);
var o = cc.find("topLabel", n).getComponent(cc.Label), r = d.WelfareConfig.getInstance().getWelfareConfById(3).rewardType;
o.string = "x" + r[0].num.toString();
var a = function() {
var t = p.WelfareData.getInstance().getHaveShareReward();
e.shareRed.active = t;
e.shareCompleted.active = !t;
};
a();
PPSDK.on(l.GameEvent.ON_DAILY_SHARE_REFRESH, function() {
a();
}, this);
};
t.prototype.initGameClub = function() {
var e = this, t = p.WelfareData.getInstance().getGameClubRecievedCount(), n = this.layout.children[2];
this.gameClubRed = n.getChildByName("red");
var o = cc.find("rewardBar", n);
this.gameClubCompleted = cc.find("completed", o);
cc.find("icon", o).getComponent(cc.Sprite);
var r = cc.find("topLabel", o).getComponent(cc.Label), a = d.WelfareConfig.getInstance().getWelfareConfById(0 == t ? 6 : 4).rewardType;
r.string = "x" + a[0].num.toString();
var s = cc.find("title", n).getComponent(cc.Label), f = cc.find("desc", n).getComponent(cc.Label);
s.string = c.i18nMgr._getLabel(0 == t ? "加入游戏圈" : "游戏圈互动");
f.string = c.i18nMgr._getLabel(0 == t ? "加入游戏圈描述" : "游戏圈互动描述");
var u = function() {
var t = p.WelfareData.getInstance().getHaveGameClubReward();
e.gameClubRed.active = t;
e.gameClubCompleted.active = !t;
};
u();
PPSDK.on(l.GameEvent.ON_GAME_CLUB_REFRESH, function() {
u();
}, this);
this.gameClubButton.addButtonCallback(function() {
if (p.WelfareData.getInstance().getHaveGameClubReward()) {
p.WelfareData.getInstance().recieveGameClubReward();
i.AddPrefab.createRecieve({
rewards: a
});
_.EventConfig.getInstance().assetsReportOutput({
source: _.AssetsSource.welfare_club,
action: _.AssetsAction.get,
goodsList: a.map(function(e) {
return {
goods: e.goodsId,
num: e.num
};
})
});
}
});
};
t.prototype.initSubscribe = function() {
var e = this, t = this.layout.children[3];
this.subscribeRed = t.getChildByName("red");
var n = cc.find("rewardBar", t);
this.subscribeCompleted = cc.find("completed", n);
cc.find("icon", n).getComponent(cc.Sprite);
var o = cc.find("topLabel", n).getComponent(cc.Label), r = d.WelfareConfig.getInstance().getWelfareConfById(5).rewardType;
o.string = "x" + r[0].num.toString();
var a = function() {
var t = p.WelfareData.getInstance().getHaveSubscribeReward();
e.subscribeRed.active = t;
e.subscribeCompleted.active = !t;
};
a();
PPSDK.on(l.GameEvent.ON_SUBSCRIBE_REFRESH, function() {
a();
}, this);
};
t.prototype.buttonCallback = function(e, t) {
switch (t) {
case "close":
this.close();
break;

case "invite":
this.close();
i.AddPrefab.createInvitePanel();
break;

case "share":
s.Common.share({
location: l.Define.SHARE_LOCATION.LOGIN,
type: 3,
success: function() {
if (p.WelfareData.getInstance().getHaveShareReward()) {
p.WelfareData.getInstance().recieveDailyShare();
var e = d.WelfareConfig.getInstance().getWelfareConfById(3).rewardType;
i.AddPrefab.createRecieve({
rewards: e
});
_.EventConfig.getInstance().assetsReportOutput({
source: _.AssetsSource.welfare,
action: _.AssetsAction.share_get,
goodsList: e.map(function(e) {
return {
goods: e.goodsId,
num: e.num
};
})
});
}
}
});
break;

case "subscribe":
if (!p.WelfareData.getInstance().getHaveSubscribeReward()) return;
PPSDK.showLoading();
var n = 0, o = 0, r = function() {
if (n + o >= 1) {
PPSDK.hideLoading();
if (o > 0) i.AddPrefab.createSubscribePanel(); else {
p.WelfareData.getInstance().recieveSubscribe();
var e = d.WelfareConfig.getInstance().getWelfareConfById(5).rewardType;
i.AddPrefab.createRecieve({
rewards: e
});
_.EventConfig.getInstance().assetsReportOutput({
source: _.AssetsSource.welfare,
action: _.AssetsAction.share_get,
goodsList: e.map(function(e) {
return {
goods: e.goodsId,
num: e.num
};
})
});
}
}
};
P.PlatformManager.getInstance().wx.requestSubscribeSystemMessage({
success: function() {
n++;
r();
},
fail: function() {
o++;
r();
}
});
}
};
a([ m(cc.Node) ], t.prototype, "layout", void 0);
a([ m(u.default) ], t.prototype, "gameClubButton", void 0);
return a([ v ], t);
}(f.default);
n.default = b;
cc._RF.pop();
}, {
"../../LY01_HDPP/language/LY01_HDPP_i18nMgr": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_AddPrefab": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_Common": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_Define": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_PopupSelf": void 0,
"../../LY01_HDPP/src/common/platform/LY01_HDPP_GameClubButton": void 0,
"../../LY01_HDPP/src/common/platform/LY01_HDPP_PlatformManager": void 0,
"../../LY01_HDPP/src/config/LY01_HDPP_EventConfig": void 0,
"../../LY01_HDPP/src/config/LY01_HDPP_WelfareConfig": void 0,
"../../LY01_HDPP/src/data/LY01_HDPP_WelfareData": void 0
} ]
}, {}, [ "LY01_HDPP_InvitePanel", "LY01_HDPP_SubscibePanel", "LY01_HDPP_WelfarePanel" ]);
window.__require = function e(t, o, n) {
function r(a, s) {
if (!o[a]) {
if (!t[a]) {
var c = a.split("/");
c = c[c.length - 1];
if (!t[c]) {
var l = "function" == typeof __require && __require;
if (!s && l) return l(c, !0);
if (i) return i(c, !0);
throw new Error("Cannot find module '" + a + "'");
}
a = c;
}
var p = o[a] = {
exports: {}
};
t[a][0].call(p.exports, function(e) {
return r(t[a][1][e] || e);
}, p, p.exports, e, t, o, n);
}
return o[a].exports;
}
for (var i = "function" == typeof __require && __require, a = 0; a < n.length; a++) r(n[a]);
return r;
}({
LY01_HDPP_DailyRankView: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "64255Sy2hRFKaktsf54LNIm", "LY01_HDPP_DailyRankView");
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
}), i = this && this.__decorate || function(e, t, o, n) {
var r, i = arguments.length, a = i < 3 ? t : null === n ? n = Object.getOwnPropertyDescriptor(t, o) : n;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) a = Reflect.decorate(e, t, o, n); else for (var s = e.length - 1; s >= 0; s--) (r = e[s]) && (a = (i < 3 ? r(a) : i > 3 ? r(t, o, a) : r(t, o)) || a);
return i > 3 && a && Object.defineProperty(t, o, a), a;
};
Object.defineProperty(o, "__esModule", {
value: !0
});
var a = e("../../LY01_HDPP/language/LY01_HDPP_i18nMgr"), s = e("../../LY01_HDPP/src/common/LY01_HDPP_Common"), c = e("../../LY01_HDPP/src/config/LY01_HDPP_WorldRankConfig"), l = e("./LY01_HDPP_WorldRankView"), p = cc._decorator, u = p.ccclass, d = p.property, h = function(e) {
r(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.todayRank = null;
t.yesterdayRank = null;
t.dateLabel = null;
t.remainLabel = null;
t.buttonLabel = null;
t.isToday = !0;
return t;
}
t.prototype.start = function() {};
t.prototype.show = function() {
this.node.active = !0;
this.showToday();
};
t.prototype.hide = function() {
this.node.active = !1;
};
t.prototype.showToday = function() {
this.isToday = !0;
this.todayRank.show();
this.yesterdayRank.hide();
this.buttonLabel.string = a.i18nMgr._getLabel("查看昨日排行");
};
t.prototype.showYesterday = function() {
this.isToday = !1;
this.todayRank.hide();
this.yesterdayRank.show();
this.buttonLabel.string = a.i18nMgr._getLabel("返回今日排行");
};
t.prototype.onClose = function() {
this.todayRank.onClose();
this.yesterdayRank.onClose();
};
t.prototype.buttonCallback = function(e, t) {
switch (t) {
case "date":
this.isToday ? this.showYesterday() : this.showToday();
}
};
t.prototype.update = function() {
if (this.isToday) {
var e = c.WorldRankConfig.getInstance().getTodayRankRemainTime();
this.dateLabel.string = a.i18nMgr._getLabel("距离排行结束还剩");
this.remainLabel.string = s.Common.formatTime(e, !0);
} else {
var t = this.getYesterday();
this.dateLabel.string = a.i18nMgr._getLabel("排名日期");
this.remainLabel.string = t;
}
};
t.prototype.getYesterday = function() {
var e = s.Common.getNow(), t = new Date(e);
t.setDate(t.getDate() - 1);
var o = t.getFullYear(), n = t.getMonth() + 1, r = t.getDate();
return o + "/" + PPSDK.utils.padding(n, 2) + "/" + PPSDK.utils.padding(r, 2);
};
i([ d(l.default) ], t.prototype, "todayRank", void 0);
i([ d(l.default) ], t.prototype, "yesterdayRank", void 0);
i([ d(cc.Label) ], t.prototype, "dateLabel", void 0);
i([ d(cc.Label) ], t.prototype, "remainLabel", void 0);
i([ d(cc.Label) ], t.prototype, "buttonLabel", void 0);
return i([ u ], t);
}(cc.Component);
o.default = h;
cc._RF.pop();
}, {
"../../LY01_HDPP/language/LY01_HDPP_i18nMgr": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_Common": void 0,
"../../LY01_HDPP/src/config/LY01_HDPP_WorldRankConfig": void 0,
"./LY01_HDPP_WorldRankView": "LY01_HDPP_WorldRankView"
} ],
LY01_HDPP_FirendRankView: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "04d4bRjhwRPbYlOAamHSHGF", "LY01_HDPP_FirendRankView");
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
}), i = this && this.__decorate || function(e, t, o, n) {
var r, i = arguments.length, a = i < 3 ? t : null === n ? n = Object.getOwnPropertyDescriptor(t, o) : n;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) a = Reflect.decorate(e, t, o, n); else for (var s = e.length - 1; s >= 0; s--) (r = e[s]) && (a = (i < 3 ? r(a) : i > 3 ? r(t, o, a) : r(t, o)) || a);
return i > 3 && a && Object.defineProperty(t, o, a), a;
}, a = this && this.__awaiter || function(e, t, o, n) {
return new (o || (o = Promise))(function(r, i) {
function a(e) {
try {
c(n.next(e));
} catch (e) {
i(e);
}
}
function s(e) {
try {
c(n.throw(e));
} catch (e) {
i(e);
}
}
function c(e) {
e.done ? r(e.value) : (t = e.value, t instanceof o ? t : new o(function(e) {
e(t);
})).then(a, s);
var t;
}
c((n = n.apply(e, t || [])).next());
});
}, s = this && this.__generator || function(e, t) {
var o, n, r, i, a = {
label: 0,
sent: function() {
if (1 & r[0]) throw r[1];
return r[1];
},
trys: [],
ops: []
};
return i = {
next: s(0),
throw: s(1),
return: s(2)
}, "function" == typeof Symbol && (i[Symbol.iterator] = function() {
return this;
}), i;
function s(e) {
return function(t) {
return c([ e, t ]);
};
}
function c(i) {
if (o) throw new TypeError("Generator is already executing.");
for (;a; ) try {
if (o = 1, n && (r = 2 & i[0] ? n.return : i[0] ? n.throw || ((r = n.return) && r.call(n), 
0) : n.next) && !(r = r.call(n, i[1])).done) return r;
(n = 0, r) && (i = [ 2 & i[0], r.value ]);
switch (i[0]) {
case 0:
case 1:
r = i;
break;

case 4:
a.label++;
return {
value: i[1],
done: !1
};

case 5:
a.label++;
n = i[1];
i = [ 0 ];
continue;

case 7:
i = a.ops.pop();
a.trys.pop();
continue;

default:
if (!(r = a.trys, r = r.length > 0 && r[r.length - 1]) && (6 === i[0] || 2 === i[0])) {
a = 0;
continue;
}
if (3 === i[0] && (!r || i[1] > r[0] && i[1] < r[3])) {
a.label = i[1];
break;
}
if (6 === i[0] && a.label < r[1]) {
a.label = r[1];
r = i;
break;
}
if (r && a.label < r[2]) {
a.label = r[2];
a.ops.push(i);
break;
}
r[2] && a.ops.pop();
a.trys.pop();
continue;
}
i = t.call(e, a);
} catch (e) {
i = [ 6, e ];
n = 0;
} finally {
o = r = 0;
}
if (5 & i[0]) throw i[1];
return {
value: i[0] ? i[1] : void 0,
done: !0
};
}
};
Object.defineProperty(o, "__esModule", {
value: !0
});
var c = e("../../LY01_HDPP/src/common/LY01_HDPP_Common"), l = cc._decorator, p = l.ccclass, u = l.property, d = function(e) {
r(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.rankKey = "score";
t.rankItem = null;
t.selfItem = null;
t.listview = null;
t.scopePanel = null;
t.subview = null;
t.loading = null;
t.loaded = !1;
t.authorized = !1;
return t;
}
t.prototype.start = function() {
cc.tween(this.loading).by(5, {
angle: 360
}).repeatForever().start();
};
t.prototype.onClose = function() {
cc.sys.platform === cc.sys.WECHAT_GAME && wx.getOpenDataContext().postMessage({
msg: "closeAll",
pauseUpdate: !0
});
};
t.prototype.onDisable = function() {
cc.sys.platform === cc.sys.WECHAT_GAME && wx.getOpenDataContext().postMessage({
msg: "hideAll",
pauseUpdate: !0
});
};
t.prototype.onHide = function() {
cc.sys.platform === cc.sys.WECHAT_GAME && wx.getOpenDataContext().postMessage({
msg: "hideAll",
pauseUpdate: !0
});
};
t.prototype.show = function() {
return a(this, void 0, void 0, function() {
var e, t, o, n, r, i, a, c, l, p;
return s(this, function() {
this.loading.active = !1;
this.subview.active = !0;
if (cc.sys.platform !== cc.sys.WECHAT_GAME) return [ 2 ];
e = this.subview.getBoundingBoxToWorld();
t = cc.view.getVisibleSize();
if (!this.loaded) {
if (wx.getOpenDataContext) {
(o = wx.getOpenDataContext().canvas).width = this.subview.width;
o.height = this.subview.height;
}
wx.getOpenDataContext().postMessage({
msg: "viewport",
resolution: [ e.x, t.height - (e.y + e.height), t.width, t.height, cc.winSize.width / cc.view.getDesignResolutionSize().width ]
});
(n = this.node.getComponent(cc.Sprite)) && (n.srcBlendFactor = cc.macro.BlendFactor.ONE);
}
r = this.rankItem.data.height;
i = this.selfItem.data.height;
a = this.listview.node.height;
c = this.listview.spacingY;
l = this.listview.paddingTop;
p = this.listview.paddingBottom;
wx.getOpenDataContext().postMessage({
msg: "rank",
action: "show",
pageMode: !1,
startUpdate: !0,
key: this.rankKey,
params: {
scale: cc.winSize.width / cc.view.getDesignResolutionSize().width,
itemHeight: r,
selfHeight: i,
listHeight: a,
gapY: c,
paddingTop: l,
paddingBottom: p
}
});
this.loaded = !0;
return [ 2 ];
});
});
};
t.prototype.hide = function() {
this.node.active = !1;
};
t.prototype.scopeFun = function(e) {
var t = this, o = "scope.WxFriendInteraction";
this.scopePanel.active = !1;
this.loading.active = !0;
if (e) c.Common.authorize(o).then(function() {
t.authorized = !0;
t.show();
}).catch(function() {
t.scopePanel.active = !0;
}); else {
if (this.authorized) {
this.show();
return;
}
c.Common.getSetting(o).then(function(e) {
if (0 == e.result) if (1 == e.type) {
t.scopePanel.active = !0;
t.loading.active = !1;
} else t.scopeFun(!0); else t.scopeFun(!0);
}).catch(function() {
t.scopePanel.active = !0;
t.loading.active = !1;
});
}
};
t.prototype.buttonCallback = function(e, t) {
switch (t) {
case "scope":
this.scopeFun(!0);
}
};
i([ u ], t.prototype, "rankKey", void 0);
i([ u(cc.Prefab) ], t.prototype, "rankItem", void 0);
i([ u(cc.Prefab) ], t.prototype, "selfItem", void 0);
i([ u(cc.Layout) ], t.prototype, "listview", void 0);
i([ u(cc.Node) ], t.prototype, "scopePanel", void 0);
i([ u(cc.Node) ], t.prototype, "subview", void 0);
i([ u(cc.Node) ], t.prototype, "loading", void 0);
return i([ p ], t);
}(cc.Component);
o.default = d;
cc._RF.pop();
}, {
"../../LY01_HDPP/src/common/LY01_HDPP_Common": void 0
} ],
LY01_HDPP_RankItem: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "717d9uXCGlMLL+Hh8XW0u+1", "LY01_HDPP_RankItem");
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
}), i = this && this.__decorate || function(e, t, o, n) {
var r, i = arguments.length, a = i < 3 ? t : null === n ? n = Object.getOwnPropertyDescriptor(t, o) : n;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) a = Reflect.decorate(e, t, o, n); else for (var s = e.length - 1; s >= 0; s--) (r = e[s]) && (a = (i < 3 ? r(a) : i > 3 ? r(t, o, a) : r(t, o)) || a);
return i > 3 && a && Object.defineProperty(t, o, a), a;
};
Object.defineProperty(o, "__esModule", {
value: !0
});
var a = e("../../LY01_HDPP/language/LY01_HDPP_i18nMgr"), s = e("../../LY01_HDPP/src/common/LY01_HDPP_AddPrefab"), c = e("../../LY01_HDPP/src/common/listview/LY01_HDPP_listviewitem"), l = e("../../LY01_HDPP/src/config/LY01_HDPP_WorldRankConfig"), p = cc._decorator, u = p.ccclass, d = p.property, h = function(e) {
r(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.bgSprite = null;
t.bgSpriteFrames = [];
t.rankSprite = null;
t.rankSpriteFrames = [];
t.rankLabel = null;
t.avatarSprite = null;
t.nameLabel = null;
t.scoreLabel = null;
t.rewardSprite = null;
t.rewardSpriteFrames = [];
t.needReward = !0;
t.avatarUrl = "";
return t;
}
t.prototype.onSetData = function(e) {
e.rank && -1 != e.rank ? this.rankLabel.string = e.rank.toString() : this.rankLabel.string = a.i18nMgr._getLabel("未上榜");
this.nameLabel.string = e.name;
"number" == typeof e.score && -1 != e.score ? this.scoreLabel.string = e.score.toString() : this.scoreLabel.string = "0";
this.rankSprite.node.active = !1;
this.rankLabel.node.active = !1;
if (e.isSelf) {
this.bgSprite.spriteFrame = this.bgSpriteFrames[0];
this.rankLabel.node.active = !0;
} else if (1 == e.rank) {
this.bgSprite.spriteFrame = this.bgSpriteFrames[1];
this.rankSprite.node.active = !0;
this.rankSprite.spriteFrame = this.rankSpriteFrames[0];
} else if (2 == e.rank) {
this.bgSprite.spriteFrame = this.bgSpriteFrames[2];
this.rankSprite.node.active = !0;
this.rankSprite.spriteFrame = this.rankSpriteFrames[1];
} else if (3 == e.rank) {
this.bgSprite.spriteFrame = this.bgSpriteFrames[3];
this.rankSprite.node.active = !0;
this.rankSprite.spriteFrame = this.rankSpriteFrames[2];
} else {
this.bgSprite.spriteFrame = this.bgSpriteFrames[4];
this.rankLabel.node.active = !0;
}
this.needReward && this.showReward(e.rank);
this.loadAvatar(e.avatar);
};
t.prototype.showReward = function(e) {
var t = l.WorldRankConfig.getInstance().getDailyRewardByRank(e);
if (t) {
this.rewardSprite.node.active = !0;
this.rewardSprite.spriteFrame = this.rewardSpriteFrames[t.id];
} else this.rewardSprite.node.active = !1;
};
t.prototype.loadAvatar = function(e) {
var t = this;
this.avatarSprite.spriteFrame = null;
this.avatarUrl = e;
cc.assetManager.loadRemote(e, {
ext: ".png"
}, function(o, n) {
if (o) console.error(e, o); else if (t.avatarUrl == e && cc.isValid(t.avatarSprite)) {
t.avatarSprite.spriteFrame = new cc.SpriteFrame(n);
t.addAutoReleaseAssets(n);
}
});
};
t.prototype.onTouchEnd = function(e, t, o) {
console.log("onTouchEnd", o);
};
t.prototype.touchReward = function() {
s.AddPrefab.createRankRewardPanel();
};
i([ d(cc.Sprite) ], t.prototype, "bgSprite", void 0);
i([ d([ cc.SpriteFrame ]) ], t.prototype, "bgSpriteFrames", void 0);
i([ d(cc.Sprite) ], t.prototype, "rankSprite", void 0);
i([ d([ cc.SpriteFrame ]) ], t.prototype, "rankSpriteFrames", void 0);
i([ d(cc.Label) ], t.prototype, "rankLabel", void 0);
i([ d(cc.Sprite) ], t.prototype, "avatarSprite", void 0);
i([ d(cc.Label) ], t.prototype, "nameLabel", void 0);
i([ d(cc.Label) ], t.prototype, "scoreLabel", void 0);
i([ d(cc.Sprite) ], t.prototype, "rewardSprite", void 0);
i([ d([ cc.SpriteFrame ]) ], t.prototype, "rewardSpriteFrames", void 0);
i([ d() ], t.prototype, "needReward", void 0);
return i([ u ], t);
}(c.ListViewItem);
o.default = h;
cc._RF.pop();
}, {
"../../LY01_HDPP/language/LY01_HDPP_i18nMgr": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_AddPrefab": void 0,
"../../LY01_HDPP/src/common/listview/LY01_HDPP_listviewitem": void 0,
"../../LY01_HDPP/src/config/LY01_HDPP_WorldRankConfig": void 0
} ],
LY01_HDPP_RankPanel: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "d9f36iROMBMa5MgN3r79ggn", "LY01_HDPP_RankPanel");
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
}), i = this && this.__decorate || function(e, t, o, n) {
var r, i = arguments.length, a = i < 3 ? t : null === n ? n = Object.getOwnPropertyDescriptor(t, o) : n;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) a = Reflect.decorate(e, t, o, n); else for (var s = e.length - 1; s >= 0; s--) (r = e[s]) && (a = (i < 3 ? r(a) : i > 3 ? r(t, o, a) : r(t, o)) || a);
return i > 3 && a && Object.defineProperty(t, o, a), a;
}, a = this && this.__awaiter || function(e, t, o, n) {
return new (o || (o = Promise))(function(r, i) {
function a(e) {
try {
c(n.next(e));
} catch (e) {
i(e);
}
}
function s(e) {
try {
c(n.throw(e));
} catch (e) {
i(e);
}
}
function c(e) {
e.done ? r(e.value) : (t = e.value, t instanceof o ? t : new o(function(e) {
e(t);
})).then(a, s);
var t;
}
c((n = n.apply(e, t || [])).next());
});
}, s = this && this.__generator || function(e, t) {
var o, n, r, i, a = {
label: 0,
sent: function() {
if (1 & r[0]) throw r[1];
return r[1];
},
trys: [],
ops: []
};
return i = {
next: s(0),
throw: s(1),
return: s(2)
}, "function" == typeof Symbol && (i[Symbol.iterator] = function() {
return this;
}), i;
function s(e) {
return function(t) {
return c([ e, t ]);
};
}
function c(i) {
if (o) throw new TypeError("Generator is already executing.");
for (;a; ) try {
if (o = 1, n && (r = 2 & i[0] ? n.return : i[0] ? n.throw || ((r = n.return) && r.call(n), 
0) : n.next) && !(r = r.call(n, i[1])).done) return r;
(n = 0, r) && (i = [ 2 & i[0], r.value ]);
switch (i[0]) {
case 0:
case 1:
r = i;
break;

case 4:
a.label++;
return {
value: i[1],
done: !1
};

case 5:
a.label++;
n = i[1];
i = [ 0 ];
continue;

case 7:
i = a.ops.pop();
a.trys.pop();
continue;

default:
if (!(r = a.trys, r = r.length > 0 && r[r.length - 1]) && (6 === i[0] || 2 === i[0])) {
a = 0;
continue;
}
if (3 === i[0] && (!r || i[1] > r[0] && i[1] < r[3])) {
a.label = i[1];
break;
}
if (6 === i[0] && a.label < r[1]) {
a.label = r[1];
r = i;
break;
}
if (r && a.label < r[2]) {
a.label = r[2];
a.ops.push(i);
break;
}
r[2] && a.ops.pop();
a.trys.pop();
continue;
}
i = t.call(e, a);
} catch (e) {
i = [ 6, e ];
n = 0;
} finally {
o = r = 0;
}
if (5 & i[0]) throw i[1];
return {
value: i[0] ? i[1] : void 0,
done: !0
};
}
};
Object.defineProperty(o, "__esModule", {
value: !0
});
var c = e("../../LY01_HDPP/src/common/LY01_HDPP_AddPrefab"), l = e("../../LY01_HDPP/src/common/LY01_HDPP_Common"), p = e("../../LY01_HDPP/src/common/LY01_HDPP_Define"), u = e("../../LY01_HDPP/src/common/LY01_HDPP_ToggleCustom"), d = e("../../LY01_HDPP/src/common/platform/LY01_HDPP_UserInfoButton"), h = e("../../LY01_HDPP/src/data/LY01_HDPP_PlayerInfo"), f = e("./LY01_HDPP_DailyRankView"), _ = e("./LY01_HDPP_FirendRankView"), P = e("./LY01_HDPP_WeeklyRankView"), y = e("./LY01_HDPP_WorldRankView"), g = cc._decorator, v = g.ccclass, w = g.property, m = (g.menu, 
function(e) {
r(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.friendToggle = null;
t.dailyToggle = null;
t.weeklyToggle = null;
t.medalToggle = null;
t.friendRankView = null;
t.dailyRankView = null;
t.weekyRankView = null;
t.modelRankView = null;
t.bottomButtons = null;
t.shareButton = null;
t.authorizePanel = null;
t.userInfoButton = null;
t.toggles = [];
t.pages = [];
t.curPage = 0;
return t;
}
t.prototype.start = function() {
var e = this;
this.toggles = [ this.friendToggle, this.dailyToggle, this.weeklyToggle, this.medalToggle ];
this.pages = [ this.friendRankView.node, this.dailyRankView.node, this.weekyRankView.node, this.modelRankView.node ];
this.pages.forEach(function(e) {
e.active = !1;
});
this.dailyRankView.todayRank.rankId = p.Define.RANK_ID.TODAY;
this.dailyRankView.yesterdayRank.rankId = p.Define.RANK_ID.YESTERDAY;
this.weekyRankView.weekRank.rankId = p.Define.RANK_ID.WEEKLY;
this.weekyRankView.lastRank.rankId = p.Define.RANK_ID.LASTWEEK;
this.modelRankView.rankId = p.Define.RANK_ID.MEDAL;
this.authorizePanel.active = !1;
this.scheduleOnce(function() {
e.init(1);
});
PPSDK.on(p.GameEvent.ON_SWITCH_PAGE, function(t) {
if (3 != t) {
e.authorizePanel.active && e.userInfoButton.hide();
e.friendRankView.onHide();
}
}, this);
};
t.prototype.onDestroy = function() {
PPSDK.off(this);
};
t.prototype.init = function(e) {
this.curPage = e;
this.showToggle(this.toggles[e]);
this.showPage(e);
};
t.prototype.refresh = function() {
this.friendRankView.onClose();
this.dailyRankView.onClose();
this.weekyRankView.onClose();
this.modelRankView.onClose();
this.showPage(this.curPage);
};
t.prototype.showToggle = function(e) {
for (var t = this.toggles.indexOf(e), o = 0; o < this.toggles.length; o++) this.toggles[o].isChecked = o === t;
};
t.prototype.showPage = function(e) {
return a(this, void 0, void 0, function() {
var t;
return s(this, function(o) {
switch (o.label) {
case 0:
this.authorizePanel.active = !1;
for (t = 0; t < this.pages.length; t++) this.pages[t].active = t == e;
if (0 != e) return [ 3, 1 ];
this.friendRankView.scopeFun(!1);
return [ 3, 3 ];

case 1:
return [ 4, this.checkAuthorize(e) ];

case 2:
o.sent() && (1 == e ? this.dailyRankView.show() : 2 == e ? this.weekyRankView.show() : 3 == e && this.modelRankView.show());
o.label = 3;

case 3:
return [ 2 ];
}
});
});
};
t.prototype.checkAuthorize = function(e) {
return a(this, void 0, void 0, function() {
var t = this;
return s(this, function(o) {
switch (o.label) {
case 0:
return [ 4, h.PlayerInfo.getInstance().checkAuthorize() ];

case 1:
if (o.sent()) {
this.authorizePanel.active = !1;
return [ 2, !0 ];
}
this.authorizePanel.active = !0;
this.userInfoButton.addButtonCallback(function(o) {
if (o && o.userInfo) {
h.PlayerInfo.getInstance().setPlayerInfo(o.userInfo);
h.PlayerInfo.getInstance().submitLevelToWorldRank();
t.authorizePanel.active = !1;
t.showPage(e);
}
});
return [ 2, !1 ];
}
});
});
};
t.prototype.buttonCallback = function(e, t) {
switch (t) {
case "rewards":
c.AddPrefab.createRankRewardPanel();
break;

case "share":
l.Common.share({
location: p.Define.SHARE_LOCATION.RANK,
type: 1
});
}
};
t.prototype.toggleCallback = function(e) {
e.isChecked || this.init(this.toggles.indexOf(e));
};
i([ w(u.default) ], t.prototype, "friendToggle", void 0);
i([ w(u.default) ], t.prototype, "dailyToggle", void 0);
i([ w(u.default) ], t.prototype, "weeklyToggle", void 0);
i([ w(u.default) ], t.prototype, "medalToggle", void 0);
i([ w(_.default) ], t.prototype, "friendRankView", void 0);
i([ w(f.default) ], t.prototype, "dailyRankView", void 0);
i([ w(P.default) ], t.prototype, "weekyRankView", void 0);
i([ w(y.default) ], t.prototype, "modelRankView", void 0);
i([ w(cc.Node) ], t.prototype, "bottomButtons", void 0);
i([ w(cc.Node) ], t.prototype, "shareButton", void 0);
i([ w(cc.Node) ], t.prototype, "authorizePanel", void 0);
i([ w(d.default) ], t.prototype, "userInfoButton", void 0);
return i([ v ], t);
}(cc.Component));
o.default = m;
cc._RF.pop();
}, {
"../../LY01_HDPP/src/common/LY01_HDPP_AddPrefab": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_Common": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_Define": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_ToggleCustom": void 0,
"../../LY01_HDPP/src/common/platform/LY01_HDPP_UserInfoButton": void 0,
"../../LY01_HDPP/src/data/LY01_HDPP_PlayerInfo": void 0,
"./LY01_HDPP_DailyRankView": "LY01_HDPP_DailyRankView",
"./LY01_HDPP_FirendRankView": "LY01_HDPP_FirendRankView",
"./LY01_HDPP_WeeklyRankView": "LY01_HDPP_WeeklyRankView",
"./LY01_HDPP_WorldRankView": "LY01_HDPP_WorldRankView"
} ],
LY01_HDPP_RankRewardPanel: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "8c6a4JabbxHiJoU3GWyxvzd", "LY01_HDPP_RankRewardPanel");
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
}), i = this && this.__decorate || function(e, t, o, n) {
var r, i = arguments.length, a = i < 3 ? t : null === n ? n = Object.getOwnPropertyDescriptor(t, o) : n;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) a = Reflect.decorate(e, t, o, n); else for (var s = e.length - 1; s >= 0; s--) (r = e[s]) && (a = (i < 3 ? r(a) : i > 3 ? r(t, o, a) : r(t, o)) || a);
return i > 3 && a && Object.defineProperty(t, o, a), a;
};
Object.defineProperty(o, "__esModule", {
value: !0
});
var a = e("../../LY01_HDPP/language/LY01_HDPP_i18nMgr"), s = e("../../LY01_HDPP/src/common/LY01_HDPP_PopupSelf"), c = e("../../LY01_HDPP/src/common/LY01_HDPP_ToggleCustom"), l = e("../../LY01_HDPP/src/config/LY01_HDPP_WorldRankConfig"), p = cc._decorator, u = p.ccclass, d = p.property, h = function(e) {
r(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.dailyContent = null;
t.weeklyContent = null;
t.rewardBar = null;
t.rewardTg = null;
t.ruleTg = null;
t.rewardPage = null;
t.rulePage = null;
return t;
}
t.prototype.start = function() {
for (var e = l.WorldRankConfig.getInstance(), t = e.weeklyRewards, o = e.dailyRewards, n = 0; n < o.length; n++) {
var r = o[n], i = r.rewardType, s = (c = r.rankStart) == (p = r.rankEnd) ? c + "" : c + "-" + p;
(u = this.getRewardBar()).rankLabel.string = a.i18nMgr._getLabel("第x名", [ s ]);
u.coinLabel.string = i[0].num + "";
u.medalLabel.string = i[1].num + "";
this.dailyContent.addChild(u.node);
}
for (n = 0; n < t.length; n++) {
var c, p, u, d = t[n];
i = d.rewardType, s = (c = d.rankStart) == (p = d.rankEnd) ? c + "" : c + "-" + p;
(u = this.getRewardBar()).rankLabel.string = a.i18nMgr._getLabel("第x名", [ s ]);
u.coinLabel.string = i[0].num + "";
u.medalLabel.string = i[1].num + "";
this.weeklyContent.addChild(u.node);
}
this.switch(this.rewardTg);
};
t.prototype.getRewardBar = function() {
var e = cc.instantiate(this.rewardBar), t = e.getChildByName("t1").getComponent(cc.Label), o = e.getChildByName("t2").getComponent(cc.Label), n = e.getChildByName("t3").getComponent(cc.Label);
e.active = !0;
e.x = 0;
return {
node: e,
rankLabel: t,
coinLabel: o,
medalLabel: n
};
};
t.prototype.switch = function(e) {
if (e == this.rewardTg) {
this.rewardTg.isChecked = !0;
this.ruleTg.isChecked = !1;
this.rewardPage.active = !0;
this.rulePage.active = !1;
} else {
this.rewardTg.isChecked = !1;
this.ruleTg.isChecked = !0;
this.rewardPage.active = !1;
this.rulePage.active = !0;
}
};
t.prototype.buttonCallback = function(e, t) {
switch (t) {
case "close":
this.close();
}
};
t.prototype.toggleCallback = function(e) {
e.isChecked || this.switch(e);
};
i([ d(cc.Node) ], t.prototype, "dailyContent", void 0);
i([ d(cc.Node) ], t.prototype, "weeklyContent", void 0);
i([ d(cc.Node) ], t.prototype, "rewardBar", void 0);
i([ d(c.default) ], t.prototype, "rewardTg", void 0);
i([ d(c.default) ], t.prototype, "ruleTg", void 0);
i([ d(cc.Node) ], t.prototype, "rewardPage", void 0);
i([ d(cc.Node) ], t.prototype, "rulePage", void 0);
return i([ u ], t);
}(s.default);
o.default = h;
cc._RF.pop();
}, {
"../../LY01_HDPP/language/LY01_HDPP_i18nMgr": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_PopupSelf": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_ToggleCustom": void 0,
"../../LY01_HDPP/src/config/LY01_HDPP_WorldRankConfig": void 0
} ],
LY01_HDPP_WeeklyRankView: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "1efefaUFAVBgKcqYhmidVOH", "LY01_HDPP_WeeklyRankView");
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
}), i = this && this.__decorate || function(e, t, o, n) {
var r, i = arguments.length, a = i < 3 ? t : null === n ? n = Object.getOwnPropertyDescriptor(t, o) : n;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) a = Reflect.decorate(e, t, o, n); else for (var s = e.length - 1; s >= 0; s--) (r = e[s]) && (a = (i < 3 ? r(a) : i > 3 ? r(t, o, a) : r(t, o)) || a);
return i > 3 && a && Object.defineProperty(t, o, a), a;
};
Object.defineProperty(o, "__esModule", {
value: !0
});
var a = e("../../LY01_HDPP/language/LY01_HDPP_i18nMgr"), s = e("../../LY01_HDPP/src/common/LY01_HDPP_Common"), c = e("../../LY01_HDPP/src/config/LY01_HDPP_WorldRankConfig"), l = e("./LY01_HDPP_WorldRankView"), p = cc._decorator, u = p.ccclass, d = p.property, h = function(e) {
r(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.weekRank = null;
t.lastRank = null;
t.dateLabel = null;
t.remainLabel = null;
t.buttonLabel = null;
t.isWeek = !0;
return t;
}
t.prototype.start = function() {};
t.prototype.show = function() {
this.node.active = !0;
this.showWeek();
};
t.prototype.hide = function() {
this.node.active = !1;
};
t.prototype.showWeek = function() {
this.isWeek = !0;
this.weekRank.show();
this.lastRank.hide();
this.buttonLabel.string = a.i18nMgr._getLabel("查看上周排行");
};
t.prototype.showLast = function() {
this.isWeek = !1;
this.weekRank.hide();
this.lastRank.show();
this.buttonLabel.string = a.i18nMgr._getLabel("返回本周排行");
};
t.prototype.onClose = function() {
this.weekRank.onClose();
this.lastRank.onClose();
};
t.prototype.buttonCallback = function(e, t) {
switch (t) {
case "date":
this.isWeek ? this.showLast() : this.showWeek();
}
};
t.prototype.update = function() {
if (this.isWeek) {
var e = c.WorldRankConfig.getInstance().getWeekRankRemainTime();
this.dateLabel.string = a.i18nMgr._getLabel("距离排行结束还剩");
this.remainLabel.string = this.formatTime(e);
} else {
var t = this.getLastWeekSpace();
this.dateLabel.string = " ";
this.remainLabel.string = t;
}
};
t.prototype.formatTime = function(e) {
var t = Math.floor(e / 864e5), o = Math.floor(e % 864e5 / 36e5);
return a.i18nMgr._getLabel("x天x小时", [ t.toString(), o.toString() ]);
};
t.prototype.getLastWeekSpace = function() {
var e = s.Common.getNow(), t = new Date(e), o = t.getDay(), n = new Date(t);
n.setDate(t.getDate() - o - 6);
var r = new Date(t);
r.setDate(t.getDate() - o);
return s.Common.formatDate(n.getTime()) + "-" + s.Common.formatDate(r.getTime());
};
i([ d(l.default) ], t.prototype, "weekRank", void 0);
i([ d(l.default) ], t.prototype, "lastRank", void 0);
i([ d(cc.Label) ], t.prototype, "dateLabel", void 0);
i([ d(cc.Label) ], t.prototype, "remainLabel", void 0);
i([ d(cc.Label) ], t.prototype, "buttonLabel", void 0);
return i([ u ], t);
}(cc.Component);
o.default = h;
cc._RF.pop();
}, {
"../../LY01_HDPP/language/LY01_HDPP_i18nMgr": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_Common": void 0,
"../../LY01_HDPP/src/config/LY01_HDPP_WorldRankConfig": void 0,
"./LY01_HDPP_WorldRankView": "LY01_HDPP_WorldRankView"
} ],
LY01_HDPP_WorldRankView: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "352c9MrdOFFuYtKsso+eZ42", "LY01_HDPP_WorldRankView");
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
}), i = this && this.__decorate || function(e, t, o, n) {
var r, i = arguments.length, a = i < 3 ? t : null === n ? n = Object.getOwnPropertyDescriptor(t, o) : n;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) a = Reflect.decorate(e, t, o, n); else for (var s = e.length - 1; s >= 0; s--) (r = e[s]) && (a = (i < 3 ? r(a) : i > 3 ? r(t, o, a) : r(t, o)) || a);
return i > 3 && a && Object.defineProperty(t, o, a), a;
}, a = this && this.__awaiter || function(e, t, o, n) {
return new (o || (o = Promise))(function(r, i) {
function a(e) {
try {
c(n.next(e));
} catch (e) {
i(e);
}
}
function s(e) {
try {
c(n.throw(e));
} catch (e) {
i(e);
}
}
function c(e) {
e.done ? r(e.value) : (t = e.value, t instanceof o ? t : new o(function(e) {
e(t);
})).then(a, s);
var t;
}
c((n = n.apply(e, t || [])).next());
});
}, s = this && this.__generator || function(e, t) {
var o, n, r, i, a = {
label: 0,
sent: function() {
if (1 & r[0]) throw r[1];
return r[1];
},
trys: [],
ops: []
};
return i = {
next: s(0),
throw: s(1),
return: s(2)
}, "function" == typeof Symbol && (i[Symbol.iterator] = function() {
return this;
}), i;
function s(e) {
return function(t) {
return c([ e, t ]);
};
}
function c(i) {
if (o) throw new TypeError("Generator is already executing.");
for (;a; ) try {
if (o = 1, n && (r = 2 & i[0] ? n.return : i[0] ? n.throw || ((r = n.return) && r.call(n), 
0) : n.next) && !(r = r.call(n, i[1])).done) return r;
(n = 0, r) && (i = [ 2 & i[0], r.value ]);
switch (i[0]) {
case 0:
case 1:
r = i;
break;

case 4:
a.label++;
return {
value: i[1],
done: !1
};

case 5:
a.label++;
n = i[1];
i = [ 0 ];
continue;

case 7:
i = a.ops.pop();
a.trys.pop();
continue;

default:
if (!(r = a.trys, r = r.length > 0 && r[r.length - 1]) && (6 === i[0] || 2 === i[0])) {
a = 0;
continue;
}
if (3 === i[0] && (!r || i[1] > r[0] && i[1] < r[3])) {
a.label = i[1];
break;
}
if (6 === i[0] && a.label < r[1]) {
a.label = r[1];
r = i;
break;
}
if (r && a.label < r[2]) {
a.label = r[2];
a.ops.push(i);
break;
}
r[2] && a.ops.pop();
a.trys.pop();
continue;
}
i = t.call(e, a);
} catch (e) {
i = [ 6, e ];
n = 0;
} finally {
o = r = 0;
}
if (5 & i[0]) throw i[1];
return {
value: i[0] ? i[1] : void 0,
done: !0
};
}
};
Object.defineProperty(o, "__esModule", {
value: !0
});
var c = e("../../LY01_HDPP/src/common/listview/LY01_HDPP_listviewCom"), l = e("../../LY01_HDPP/src/data/LY01_HDPP_PlayerInfo"), p = e("./LY01_HDPP_RankItem"), u = cc._decorator, d = u.ccclass, h = u.property, f = function(e) {
r(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.rankId = 0;
t.listView = null;
t.loading = null;
t.nullLabel = null;
t.selfItem = null;
t._tempData = null;
return t;
}
t.prototype.onLoad = function() {
cc.tween(this.loading).by(5, {
angle: 360
}).repeatForever().start();
this.loading.active = !1;
this.nullLabel.active = !1;
};
t.prototype.show = function() {
return a(this, void 0, void 0, function() {
var e, t, o, n, r, i, a, c, u, d, h, f, _, P, y, g, v, w;
return s(this, function(s) {
switch (s.label) {
case 0:
this.node.active = !0;
this.listView.init();
this.nullLabel.active = !1;
if (this._tempData) {
this.loading.active = !1;
this.nullLabel.active = !1;
return [ 2 ];
}
this.selfItem && (this.selfItem.node.active = !1);
this.listView.removeAllData();
this.loading.active = !0;
return [ 4, l.PlayerInfo.getInstance().getWorldRankData(this.rankId) ];

case 1:
e = s.sent();
this.loading.active = !1;
if (!e) {
this.nullLabel.active = !0;
return [ 2 ];
}
if (0 == e.rankList.length) {
this.nullLabel.active = !0;
return [ 2 ];
}
this._tempData = e;
if (this._tempData) {
t = this._tempData, o = t.userInfo, n = t.rankList;
r = o.userName, i = o.avatar, a = o.rank, o.extendField, c = o.value;
u = [];
for (d = 0; d < n.length; d++) {
h = n[d], f = h.userName, _ = h.avatar, P = h.rank, h.extendField, y = h.value;
g = {
rank: P,
avatar: _,
name: f,
score: y,
isSelf: !1
};
u.push(g);
}
this.listView.setData(u);
if (!this.selfItem) {
(v = cc.instantiate(this.listView.itemTemp)).x = 0;
(w = v.addComponent(cc.Widget)).isAlignBottom = !0;
w.bottom = 0;
this.node.addChild(v);
this.selfItem = v.getComponent(p.default);
}
this.selfItem.onSetData({
rank: a,
avatar: null != i ? i : l.PlayerInfo.getInstance().avatarUrl,
name: null != r ? r : l.PlayerInfo.getInstance().nickName,
score: null != c ? c : 0,
isSelf: !0
}, 0);
this.selfItem.node.active = !0;
}
return [ 2 ];
}
});
});
};
t.prototype.hide = function() {
this.node.active = !1;
};
t.prototype.onDisable = function() {};
t.prototype.onClose = function() {
this._tempData = null;
};
i([ h({
tooltip: "后台配置的排行榜ID"
}) ], t.prototype, "rankId", void 0);
i([ h(c.ListviewCom) ], t.prototype, "listView", void 0);
i([ h(cc.Node) ], t.prototype, "loading", void 0);
i([ h(cc.Node) ], t.prototype, "nullLabel", void 0);
return i([ d ], t);
}(cc.Component);
o.default = f;
cc._RF.pop();
}, {
"../../LY01_HDPP/src/common/listview/LY01_HDPP_listviewCom": void 0,
"../../LY01_HDPP/src/data/LY01_HDPP_PlayerInfo": void 0,
"./LY01_HDPP_RankItem": "LY01_HDPP_RankItem"
} ]
}, {}, [ "LY01_HDPP_DailyRankView", "LY01_HDPP_FirendRankView", "LY01_HDPP_RankItem", "LY01_HDPP_RankPanel", "LY01_HDPP_RankRewardPanel", "LY01_HDPP_WeeklyRankView", "LY01_HDPP_WorldRankView" ]);
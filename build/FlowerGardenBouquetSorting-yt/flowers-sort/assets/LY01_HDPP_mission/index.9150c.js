window.__require = function t(e, o, i) {
function n(r, a) {
if (!o[r]) {
if (!e[r]) {
var c = r.split("/");
c = c[c.length - 1];
if (!e[c]) {
var l = "function" == typeof __require && __require;
if (!a && l) return l(c, !0);
if (s) return s(c, !0);
throw new Error("Cannot find module '" + r + "'");
}
r = c;
}
var d = o[r] = {
exports: {}
};
e[r][0].call(d.exports, function(t) {
return n(e[r][1][t] || t);
}, d, d.exports, t, e, o, i);
}
return o[r].exports;
}
for (var s = "function" == typeof __require && __require, r = 0; r < i.length; r++) n(i[r]);
return n;
}({
LY01_HDPP_MissionBar: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "2d036LZYGZO8YlB/3hSOrnh", "LY01_HDPP_MissionBar");
var i, n = this && this.__extends || (i = function(t, e) {
return (i = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(t, e) {
t.__proto__ = e;
} || function(t, e) {
for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
})(t, e);
}, function(t, e) {
i(t, e);
function o() {
this.constructor = t;
}
t.prototype = null === e ? Object.create(e) : (o.prototype = e.prototype, new o());
}), s = this && this.__decorate || function(t, e, o, i) {
var n, s = arguments.length, r = s < 3 ? e : null === i ? i = Object.getOwnPropertyDescriptor(e, o) : i;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(t, e, o, i); else for (var a = t.length - 1; a >= 0; a--) (n = t[a]) && (r = (s < 3 ? n(r) : s > 3 ? n(e, o, r) : n(e, o)) || r);
return s > 3 && r && Object.defineProperty(e, o, r), r;
};
Object.defineProperty(o, "__esModule", {
value: !0
});
var r = t("../../LY01_HDPP/language/LY01_HDPP_i18nMgr"), a = t("../../LY01_HDPP/src/common/LY01_HDPP_AddPrefab"), c = t("../../LY01_HDPP/src/common/LY01_HDPP_Common"), l = t("../../LY01_HDPP/src/common/LY01_HDPP_Define"), d = t("../../LY01_HDPP/src/common/listview/LY01_HDPP_listviewitem"), p = t("../../LY01_HDPP/src/config/LY01_HDPP_GoodsConfig"), u = t("../../LY01_HDPP/src/config/LY01_HDPP_MissionConfig"), f = t("../../LY01_HDPP/src/data/LY01_HDPP_PayData"), v = cc._decorator, h = v.ccclass, P = v.property, _ = function() {
function t() {
this.node = null;
this.rewardIcon = null;
this.rewardLabel = null;
this.progressNode = null;
this.recieveNode = null;
this.completedNode = null;
}
s([ P(cc.Node) ], t.prototype, "node", void 0);
s([ P(cc.Sprite) ], t.prototype, "rewardIcon", void 0);
s([ P(cc.Label) ], t.prototype, "rewardLabel", void 0);
s([ P(cc.Node) ], t.prototype, "progressNode", void 0);
s([ P(cc.Node) ], t.prototype, "recieveNode", void 0);
s([ P(cc.Node) ], t.prototype, "completedNode", void 0);
return s([ h("LY01_HDPP_MissionStateBar") ], t);
}(), y = function() {
function t() {
this.node = null;
this.rewardNode = null;
this.progressNode = null;
this.recieveNode = null;
this.completedNode = null;
}
s([ P(cc.Node) ], t.prototype, "node", void 0);
s([ P(cc.Node) ], t.prototype, "rewardNode", void 0);
s([ P(cc.Node) ], t.prototype, "progressNode", void 0);
s([ P(cc.Node) ], t.prototype, "recieveNode", void 0);
s([ P(cc.Node) ], t.prototype, "completedNode", void 0);
return s([ h("LY01_HDPP_ConstMissionStateBar") ], t);
}(), g = function() {
function t() {
this.node = null;
this.rewardIcon = null;
this.rewardIcon2 = null;
this.rewardLabel = null;
this.progressNode = null;
this.recieveNode = null;
this.completedNode = null;
this.vipIcons = [];
this.progressLabel = null;
this.completeLabel = null;
}
s([ P(cc.Node) ], t.prototype, "node", void 0);
s([ P(cc.Sprite) ], t.prototype, "rewardIcon", void 0);
s([ P(cc.Sprite) ], t.prototype, "rewardIcon2", void 0);
s([ P(cc.Label) ], t.prototype, "rewardLabel", void 0);
s([ P(cc.Node) ], t.prototype, "progressNode", void 0);
s([ P(cc.Node) ], t.prototype, "recieveNode", void 0);
s([ P(cc.Node) ], t.prototype, "completedNode", void 0);
s([ P([ cc.Node ]) ], t.prototype, "vipIcons", void 0);
s([ P(cc.Label) ], t.prototype, "progressLabel", void 0);
s([ P(cc.Label) ], t.prototype, "completeLabel", void 0);
return s([ h("LY01_HDPP_MissionVIPStateBar") ], t);
}(), m = function(t) {
n(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.icon = null;
e.titleLabel = null;
e.descLabel = null;
e.progressLabel = null;
e.progressBar = null;
e.vipStateBar = null;
e.normalStateBar = null;
e.constStateBar = null;
e.redDot = null;
e.taskBoards = [];
e.missonIcon = [];
return e;
}
e.prototype.onSetData = function(t) {
var e = this;
this.options = t;
var o = u.MissionConfig.getInstance(), i = t.missionId, n = t.state, s = t.vipState, r = o.getMissonById(i), a = r.reward, d = r.type, f = r.mode, v = r.term, h = r.vipReward, P = o.getMissionDesc(i), _ = P.title, y = (P.icon, 
P.desc);
P.bundle;
this.titleLabel.string = _;
this.descLabel.string = y;
var g = o.getMissionNum(i), m = Math.min(1, g / v);
this.progressBar.progress = m;
this.progressLabel.string = (n == u.MissionState.RECIEVED || n == u.MissionState.COMPLETED ? Math.min(g, v) : g) + "/" + v;
if (f == u.MissionMode.DAILY) {
var D = this, L = a[0].goodsId;
p.GoodsConfig.getInstance().loadIcon(L).then(function(t) {
if (cc.isValid(D) && t.goodsId == L) {
D.normalStateBar.rewardIcon.spriteFrame = t;
D.normalStateBar.rewardIcon.addAutoReleaseAssets(t);
c.Common.uniformScale(D.normalStateBar.rewardIcon, 80, 80);
}
});
var S = h[0].goodsId;
p.GoodsConfig.getInstance().loadIcon(S).then(function(t) {
if (cc.isValid(D) && t.goodsId == S) {
D.vipStateBar.rewardIcon.spriteFrame = t;
D.vipStateBar.rewardIcon2.spriteFrame = t;
c.Common.uniformScale(D.vipStateBar.rewardIcon, 80, 80);
c.Common.uniformScale(D.vipStateBar.rewardIcon2, 80, 80);
D.vipStateBar.rewardIcon.addAutoReleaseAssets(t);
}
});
this.normalStateBar.rewardLabel.string = "x" + a[0].num;
this.vipStateBar.rewardLabel.string = "x" + h[0].num;
this.normalStateBar.completedNode.active = n == u.MissionState.COMPLETED;
this.vipStateBar.completedNode.active = s == u.MissionState.COMPLETED;
this.normalStateBar.progressNode.active = n == u.MissionState.PROGRESS;
this.vipStateBar.progressNode.active = s == u.MissionState.PROGRESS;
this.normalStateBar.recieveNode.active = n == u.MissionState.RECIEVED;
this.vipStateBar.recieveNode.active = s == u.MissionState.RECIEVED;
this.refreshVipState();
} else {
for (var M = this.constStateBar, I = M.rewardNode, b = function(t) {
var e = I.children[t];
w.node.getChildByName("label" + t).getComponent(cc.Label).string = a[t].num.toString();
var o = e.getChildByName("icon").getComponent(cc.Sprite), i = a[t].goodsId;
p.GoodsConfig.getInstance().loadIcon(i).then(function(t) {
if (cc.isValid(o) && t.goodsId == i) {
o.spriteFrame = t;
o.addAutoReleaseAssets(t);
c.Common.uniformScale(o, 40, 40);
}
});
}, w = this, C = 0; C < I.children.length; C++) b(C);
d == u.MissionType.LEVEL_TOTAL ? this.node.getChildByName("bg").getComponent(cc.Sprite).spriteFrame = this.taskBoards[0] : this.node.getChildByName("bg").getComponent(cc.Sprite).spriteFrame = this.taskBoards[1];
this.node.getChildByName("task_icon").getComponent(cc.Sprite).spriteFrame = this.missonIcon[d == u.MissionType.LEVEL_TOTAL ? 0 : 1];
M.progressNode.active = n == u.MissionState.PROGRESS;
M.recieveNode.active = n == u.MissionState.RECIEVED;
M.completedNode.active = n == u.MissionState.COMPLETED;
}
this.redDot.active = n == u.MissionState.COMPLETED || s == u.MissionState.COMPLETED;
PPSDK.on(l.GameEvent.ON_VIP_CHANGE, function() {
e.refreshVipState();
}, this);
};
e.prototype.refreshVipState = function() {
var t = f.PayData.getInstance().getIsVip();
if (this.vipStateBar) {
if (this.vipStateBar.vipIcons) {
this.vipStateBar.vipIcons[0].active = !t;
this.vipStateBar.vipIcons[1].active = t;
this.vipStateBar.vipIcons[1].active && this.vipStateBar.vipIcons[1].getComponent(sp.Skeleton).setAnimation(0, "01-idle", !0);
}
this.vipStateBar.progressLabel && (this.vipStateBar.progressLabel.string = t ? "" : r.i18nMgr._getLabel("激活VIP"));
this.vipStateBar.completeLabel && (this.vipStateBar.completeLabel.string = r.i18nMgr._getLabel(t ? "点击领取奖励" : "激活VIP"));
}
};
e.prototype.touchNormal = function() {
this.options.state == u.MissionState.COMPLETED ? this.options.onRecieve && this.options.onRecieve(this.options.missionId, !1) : this.options.state == u.MissionState.PROGRESS && a.AddPrefab.createTipsNode({
str: "任务未完成"
});
};
e.prototype.touchVIP = function() {
var t = f.PayData.getInstance().getIsVip();
this.options.vipState == u.MissionState.COMPLETED ? t ? this.options.onRecieve && this.options.onRecieve(this.options.missionId, !0) : a.AddPrefab.createVIPPanel() : this.options.vipState == u.MissionState.PROGRESS && (t ? a.AddPrefab.createTipsNode({
str: "任务未完成"
}) : a.AddPrefab.createVIPPanel());
};
e.prototype.showVIP = function() {
a.AddPrefab.createVIPPanel();
};
e.prototype.onDestroy = function() {
PPSDK.off(this);
};
e.prototype.start = function() {};
s([ P(cc.Sprite) ], e.prototype, "icon", void 0);
s([ P(cc.Label) ], e.prototype, "titleLabel", void 0);
s([ P(cc.Label) ], e.prototype, "descLabel", void 0);
s([ P(cc.Label) ], e.prototype, "progressLabel", void 0);
s([ P(cc.ProgressBar) ], e.prototype, "progressBar", void 0);
s([ P(g) ], e.prototype, "vipStateBar", void 0);
s([ P(_) ], e.prototype, "normalStateBar", void 0);
s([ P(y) ], e.prototype, "constStateBar", void 0);
s([ P(cc.Node) ], e.prototype, "redDot", void 0);
s([ P([ cc.SpriteFrame ]) ], e.prototype, "taskBoards", void 0);
s([ P([ cc.SpriteFrame ]) ], e.prototype, "missonIcon", void 0);
return s([ h ], e);
}(d.ListViewItem);
o.default = m;
cc._RF.pop();
}, {
"../../LY01_HDPP/language/LY01_HDPP_i18nMgr": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_AddPrefab": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_Common": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_Define": void 0,
"../../LY01_HDPP/src/common/listview/LY01_HDPP_listviewitem": void 0,
"../../LY01_HDPP/src/config/LY01_HDPP_GoodsConfig": void 0,
"../../LY01_HDPP/src/config/LY01_HDPP_MissionConfig": void 0,
"../../LY01_HDPP/src/data/LY01_HDPP_PayData": void 0
} ],
LY01_HDPP_MissionPanel: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "615ab14wBNLuIcPQ6ZtRPjC", "LY01_HDPP_MissionPanel");
var i, n = this && this.__extends || (i = function(t, e) {
return (i = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(t, e) {
t.__proto__ = e;
} || function(t, e) {
for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
})(t, e);
}, function(t, e) {
i(t, e);
function o() {
this.constructor = t;
}
t.prototype = null === e ? Object.create(e) : (o.prototype = e.prototype, new o());
}), s = this && this.__decorate || function(t, e, o, i) {
var n, s = arguments.length, r = s < 3 ? e : null === i ? i = Object.getOwnPropertyDescriptor(e, o) : i;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(t, e, o, i); else for (var a = t.length - 1; a >= 0; a--) (n = t[a]) && (r = (s < 3 ? n(r) : s > 3 ? n(e, o, r) : n(e, o)) || r);
return s > 3 && r && Object.defineProperty(e, o, r), r;
}, r = this && this.__awaiter || function(t, e, o, i) {
return new (o || (o = Promise))(function(n, s) {
function r(t) {
try {
c(i.next(t));
} catch (t) {
s(t);
}
}
function a(t) {
try {
c(i.throw(t));
} catch (t) {
s(t);
}
}
function c(t) {
t.done ? n(t.value) : (e = t.value, e instanceof o ? e : new o(function(t) {
t(e);
})).then(r, a);
var e;
}
c((i = i.apply(t, e || [])).next());
});
}, a = this && this.__generator || function(t, e) {
var o, i, n, s, r = {
label: 0,
sent: function() {
if (1 & n[0]) throw n[1];
return n[1];
},
trys: [],
ops: []
};
return s = {
next: a(0),
throw: a(1),
return: a(2)
}, "function" == typeof Symbol && (s[Symbol.iterator] = function() {
return this;
}), s;
function a(t) {
return function(e) {
return c([ t, e ]);
};
}
function c(s) {
if (o) throw new TypeError("Generator is already executing.");
for (;r; ) try {
if (o = 1, i && (n = 2 & s[0] ? i.return : s[0] ? i.throw || ((n = i.return) && n.call(i), 
0) : i.next) && !(n = n.call(i, s[1])).done) return n;
(i = 0, n) && (s = [ 2 & s[0], n.value ]);
switch (s[0]) {
case 0:
case 1:
n = s;
break;

case 4:
r.label++;
return {
value: s[1],
done: !1
};

case 5:
r.label++;
i = s[1];
s = [ 0 ];
continue;

case 7:
s = r.ops.pop();
r.trys.pop();
continue;

default:
if (!(n = r.trys, n = n.length > 0 && n[n.length - 1]) && (6 === s[0] || 2 === s[0])) {
r = 0;
continue;
}
if (3 === s[0] && (!n || s[1] > n[0] && s[1] < n[3])) {
r.label = s[1];
break;
}
if (6 === s[0] && r.label < n[1]) {
r.label = n[1];
n = s;
break;
}
if (n && r.label < n[2]) {
r.label = n[2];
r.ops.push(s);
break;
}
n[2] && r.ops.pop();
r.trys.pop();
continue;
}
s = e.call(t, r);
} catch (t) {
s = [ 6, t ];
i = 0;
} finally {
o = n = 0;
}
if (5 & s[0]) throw s[1];
return {
value: s[0] ? s[1] : void 0,
done: !0
};
}
};
Object.defineProperty(o, "__esModule", {
value: !0
});
var c = t("../../LY01_HDPP/src/common/LY01_HDPP_AddPrefab"), l = t("../../LY01_HDPP/src/common/LY01_HDPP_Define"), d = t("../../LY01_HDPP/src/common/listview/LY01_HDPP_listviewCom"), p = t("../../LY01_HDPP/src/config/LY01_HDPP_EventConfig"), u = t("../../LY01_HDPP/src/config/LY01_HDPP_MissionConfig"), f = t("../../LY01_HDPP/src/data/LY01_HDPP_MissionData"), v = cc._decorator, h = v.ccclass, P = v.property, _ = (v.menu, 
function(t) {
n(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.dailyTitle = null;
e.constTitle = null;
e.dailyBar = null;
e.constBar = null;
e.dailyDot = null;
e.constDot = null;
e.dailyScroll = null;
e.constScroll = null;
e.dailyInit = !1;
e.constInit = !1;
e.mode = u.MissionMode.DAILY;
return e;
}
e.prototype.start = function() {
this.onInit({
mode: u.MissionMode.DAILY
});
};
e.prototype.onInit = function(t) {
var e, o = this;
this.options = t;
var i = null !== (e = t.mode) && void 0 !== e ? e : u.MissionMode.DAILY;
this.showTitle(i);
this.showMode(i);
this.refreshDot();
PPSDK.on(l.GameEvent.ON_MISSION_CHANGE, function() {
o.mode == u.MissionMode.DAILY ? o.refreshDaily(!0) : o.mode == u.MissionMode.CONST && o.refreshConst(!0);
}, this);
};
e.prototype.showTitle = function(t) {
this.dailyTitle.active = t == u.MissionMode.DAILY;
this.constTitle.active = t == u.MissionMode.CONST;
};
e.prototype.showMode = function(t) {
this.mode = t;
this.showTitle(t);
if (t == u.MissionMode.DAILY) {
this.dailyScroll.node.active = !0;
this.constScroll.node.active = !1;
if (!this.dailyInit) {
this.dailyScroll.init();
this.refreshDaily(!1);
this.dailyInit = !0;
}
} else {
this.dailyScroll.node.active = !1;
this.constScroll.node.active = !0;
if (!this.constInit) {
this.constScroll.init();
this.refreshConst(!1);
this.constInit = !0;
}
}
};
e.prototype.refreshDot = function() {
var t = u.MissionConfig.getInstance();
this.dailyDot.active = t.getMissionDailyCompleted();
this.constDot.active = t.getMissionConstCompleted();
};
e.prototype.refreshDaily = function(t) {
void 0 === t && (t = !0);
return r(this, void 0, void 0, function() {
var t, e, o, i, n, s, r, l, d, v, h = this;
return a(this, function() {
t = u.MissionConfig.getInstance();
e = t.getMissionDailyList();
this.dailyDot.active = t.getMissionDailyCompleted();
this.dailyScroll.removeAllData();
o = [];
i = 0;
for (n = 0; n < e.length; n++) {
s = e[n];
r = s.state, l = s.show, d = s.id, v = s.vipState;
l && o.push({
missionId: d,
state: r,
vipState: v,
idx: i++,
onRecieve: function(t, e) {
if (e) {
f.MissionData.getInstance().recieveDailyVipMission(t);
var o = u.MissionConfig.getInstance().getMissonById(t).vipReward;
c.AddPrefab.createRecieve({
rewards: o
});
p.EventConfig.getInstance().assetsReportOutput({
source: p.AssetsSource.mission,
action: p.AssetsAction.get,
goodsList: o.map(function(t) {
return {
goods: t.goodsId,
num: t.num
};
})
});
} else {
f.MissionData.getInstance().recieveDailyMission(t);
o = u.MissionConfig.getInstance().getMissonById(t).reward;
c.AddPrefab.createRecieve({
rewards: o
});
p.EventConfig.getInstance().assetsReportOutput({
source: p.AssetsSource.mission,
action: p.AssetsAction.get,
goodsList: o.map(function(t) {
return {
goods: t.goodsId,
num: t.num
};
})
});
}
h.refreshDaily(!0);
}
});
}
this.dailyScroll.setData(o);
return [ 2 ];
});
});
};
e.prototype.refreshConst = function(t) {
void 0 === t && (t = !0);
return r(this, void 0, void 0, function() {
var t, e, o, i, n, s, r, l, d, p = this;
return a(this, function() {
t = u.MissionConfig.getInstance();
e = t.getConstMissionList();
this.constDot.active = t.getMissionConstCompleted();
this.constScroll.removeAllData();
o = [];
for (i = 0; i < e.length; i++) {
n = e[i];
s = n.state, r = n.show, l = n.id, d = n.vipState;
if (r) {
o.push({
missionId: l,
state: s,
vipState: d,
onRecieve: function(t) {
f.MissionData.getInstance().recieveConstMission(t);
var e = u.MissionConfig.getInstance().getMissonById(t).reward;
c.AddPrefab.createRecieve({
rewards: e
});
p.refreshConst(!0);
}
});
this.constScroll.setData(o);
}
}
return [ 2 ];
});
});
};
e.prototype.onEnable = function() {};
e.prototype.onDisable = function() {};
e.prototype.buttonCallback = function(t, e) {
switch (e) {
case "daily":
this.showMode(u.MissionMode.DAILY);
break;

case "const":
this.showMode(u.MissionMode.CONST);
}
};
e.prototype.onDestroy = function() {
PPSDK.off(this);
t.prototype.onDestroy && t.prototype.onDestroy.call(this);
};
s([ P(cc.Node) ], e.prototype, "dailyTitle", void 0);
s([ P(cc.Node) ], e.prototype, "constTitle", void 0);
s([ P(cc.Prefab) ], e.prototype, "dailyBar", void 0);
s([ P(cc.Prefab) ], e.prototype, "constBar", void 0);
s([ P(cc.Node) ], e.prototype, "dailyDot", void 0);
s([ P(cc.Node) ], e.prototype, "constDot", void 0);
s([ P(d.ListviewCom) ], e.prototype, "dailyScroll", void 0);
s([ P(d.ListviewCom) ], e.prototype, "constScroll", void 0);
return s([ h ], e);
}(cc.Component));
o.default = _;
cc._RF.pop();
}, {
"../../LY01_HDPP/src/common/LY01_HDPP_AddPrefab": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_Define": void 0,
"../../LY01_HDPP/src/common/listview/LY01_HDPP_listviewCom": void 0,
"../../LY01_HDPP/src/config/LY01_HDPP_EventConfig": void 0,
"../../LY01_HDPP/src/config/LY01_HDPP_MissionConfig": void 0,
"../../LY01_HDPP/src/data/LY01_HDPP_MissionData": void 0
} ]
}, {}, [ "LY01_HDPP_MissionBar", "LY01_HDPP_MissionPanel" ]);
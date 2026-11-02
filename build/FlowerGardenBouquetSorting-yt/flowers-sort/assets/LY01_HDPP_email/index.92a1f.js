window.__require = function e(t, i, o) {
function a(r, c) {
if (!i[r]) {
if (!t[r]) {
var l = r.split("/");
l = l[l.length - 1];
if (!t[l]) {
var s = "function" == typeof __require && __require;
if (!c && s) return s(l, !0);
if (n) return n(l, !0);
throw new Error("Cannot find module '" + r + "'");
}
r = l;
}
var P = i[r] = {
exports: {}
};
t[r][0].call(P.exports, function(e) {
return a(t[r][1][e] || e);
}, P, P.exports, e, t, i, o);
}
return i[r].exports;
}
for (var n = "function" == typeof __require && __require, r = 0; r < o.length; r++) a(o[r]);
return a;
}({
LY01_HDPP_EmailDetail: [ function(e, t, i) {
"use strict";
cc._RF.push(t, "2f48bTDCeFKoK3uUXalVD3M", "LY01_HDPP_EmailDetail");
var o, a = this && this.__extends || (o = function(e, t) {
return (o = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var i in t) Object.prototype.hasOwnProperty.call(t, i) && (e[i] = t[i]);
})(e, t);
}, function(e, t) {
o(e, t);
function i() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (i.prototype = t.prototype, new i());
}), n = this && this.__decorate || function(e, t, i, o) {
var a, n = arguments.length, r = n < 3 ? t : null === o ? o = Object.getOwnPropertyDescriptor(t, i) : o;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(e, t, i, o); else for (var c = e.length - 1; c >= 0; c--) (a = e[c]) && (r = (n < 3 ? a(r) : n > 3 ? a(t, i, r) : a(t, i)) || r);
return n > 3 && r && Object.defineProperty(t, i, r), r;
};
Object.defineProperty(i, "__esModule", {
value: !0
});
var r = e("../../LY01_HDPP/language/LY01_HDPP_i18nMgr"), c = e("../../LY01_HDPP/src/common/LY01_HDPP_AddPrefab"), l = e("../../LY01_HDPP/src/common/LY01_HDPP_Common"), s = e("../../LY01_HDPP/src/common/LY01_HDPP_PopupSelf"), P = e("../../LY01_HDPP/src/common/LY01_HDPP_ServerBackup"), d = e("../../LY01_HDPP/src/config/LY01_HDPP_PayConfig"), _ = e("../../LY01_HDPP/src/data/LY01_HDPP_EmailData"), f = cc._decorator, p = f.ccclass, u = f.property, g = function(e) {
a(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.desc = null;
t.btnGet = null;
t.btnGeted = null;
t.title = null;
t.rewardTitle = null;
t.validLabel = null;
t.config = null;
return t;
}
t.prototype.initPanel = function(e) {
var t, i;
this.config = e;
this.title.string = e.title;
var o = l.Common.tiemToDateDetail(e.createTime);
if (1 == e.type) {
this.title.string = null !== (t = e.title) && void 0 !== t ? t : r.i18nMgr._getLabel("补单标题");
this.desc.string = null !== (i = e.desc) && void 0 !== i ? i : r.i18nMgr._getLabel("补单提示", [ o ]);
this.rewardTitle.string = r.i18nMgr._getLabel("补单礼包");
} else if (2 == e.type) {
this.desc.string = e.desc;
this.rewardTitle.string = r.i18nMgr._getLabel("奖励礼包");
} else 3 == e.type && (this.desc.string = e.desc);
var a = _.EmailData.getInstance().checkEmailValid(e), n = a.valid, c = a.time;
if (n) {
this.btnGet.active = !e.get;
this.btnGeted.active = e.get;
e.view || _.EmailData.getInstance().changeEmail({
id: e.id,
view: !0
});
this.validLabel.string = c >= 0 ? r.i18nMgr._getLabel("x天后过期", [ this.getValidDay(c) + "" ]) : "";
} else {
this.btnGet.active = !1;
this.btnGeted.active = !1;
this.validLabel.string = r.i18nMgr._getLabel("已过期");
}
};
t.prototype.getValidDay = function(e) {
return Math.floor(e / 864e5);
};
t.prototype.getClick = function() {
var e = this, t = this.config;
if (t.get) {
this.btnGet.active = !1;
this.btnGeted.active = !0;
} else {
PPSDK.showLoading();
if (1 == t.type) lieyou_SdkManager.getUserOrderList({
callFun: function(i) {
var o = !0;
if (i.data) {
for (var a = 0; a < i.data.length; a++) i.data[a].orderSn == t.id && (o = !1);
if (o) {
_.EmailData.getInstance().changeEmail({
id: t.id,
get: !0,
deleted: !0
});
PPSDK.showToast(r.i18nMgr._getLabel("补单不存在"));
PPSDK.hideLoading();
e.close();
} else {
var n = d.PayConfig.getInstance().getPayInfoByActionId(t.actionId);
if (!n) {
PPSDK.hideLoading();
PPSDK.showToast("Error!");
return;
}
if ("tt" == lieyou_SdkManager.getSysPlatformName()) lieyou_SdkManager.instance.midasPay(t.id, n.price, function(i) {
if (i) {
var o = n.rewardType;
c.AddPrefab.createRecieve({
rewards: o
}).then(function() {
P.ServerBackup.doBackup(!0);
});
_.EmailData.getInstance().changeEmail({
id: t.id,
get: !0
});
PPSDK.hideLoading();
e.close();
} else {
PPSDK.hideLoading();
PPSDK.showToast(r.i18nMgr._getLabel("补单领取失败"));
}
}); else {
var l = n.rewardType;
c.AddPrefab.createRecieve({
rewards: l
}).then(function() {
P.ServerBackup.doBackup(!0);
});
_.EmailData.getInstance().changeEmail({
id: t.id,
get: !0
});
PPSDK.hideLoading();
e.close();
lieyou_SdkManager.giveOrder(t.id);
}
}
} else {
PPSDK.hideLoading();
PPSDK.showToast(r.i18nMgr._getLabel("补单领取失败"));
}
}
}); else if (2 == t.type) {
var i = t.rewards;
i.length > 0 && c.AddPrefab.createRecieve({
rewards: i
}).then(function() {
P.ServerBackup.doBackup(!0);
});
_.EmailData.getInstance().changeEmail({
id: t.id,
get: !0
});
this.close();
}
}
};
t.prototype.buttonCallback = function(e, t) {
switch (t) {
case "close":
this.close();
}
};
n([ u(cc.Label) ], t.prototype, "desc", void 0);
n([ u(cc.Node) ], t.prototype, "btnGet", void 0);
n([ u(cc.Node) ], t.prototype, "btnGeted", void 0);
n([ u(cc.Label) ], t.prototype, "title", void 0);
n([ u(cc.Label) ], t.prototype, "rewardTitle", void 0);
n([ u(cc.Label) ], t.prototype, "validLabel", void 0);
return n([ p ], t);
}(s.default);
i.default = g;
cc._RF.pop();
}, {
"../../LY01_HDPP/language/LY01_HDPP_i18nMgr": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_AddPrefab": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_Common": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_PopupSelf": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_ServerBackup": void 0,
"../../LY01_HDPP/src/config/LY01_HDPP_PayConfig": void 0,
"../../LY01_HDPP/src/data/LY01_HDPP_EmailData": void 0
} ],
LY01_HDPP_EmailPanel: [ function(e, t, i) {
"use strict";
cc._RF.push(t, "28d3aTRiLFIt7F2o6/Lb2EU", "LY01_HDPP_EmailPanel");
var o, a = this && this.__extends || (o = function(e, t) {
return (o = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var i in t) Object.prototype.hasOwnProperty.call(t, i) && (e[i] = t[i]);
})(e, t);
}, function(e, t) {
o(e, t);
function i() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (i.prototype = t.prototype, new i());
}), n = this && this.__decorate || function(e, t, i, o) {
var a, n = arguments.length, r = n < 3 ? t : null === o ? o = Object.getOwnPropertyDescriptor(t, i) : o;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(e, t, i, o); else for (var c = e.length - 1; c >= 0; c--) (a = e[c]) && (r = (n < 3 ? a(r) : n > 3 ? a(t, i, r) : a(t, i)) || r);
return n > 3 && r && Object.defineProperty(t, i, r), r;
}, r = this && this.__spreadArrays || function() {
for (var e = 0, t = 0, i = arguments.length; t < i; t++) e += arguments[t].length;
var o = Array(e), a = 0;
for (t = 0; t < i; t++) for (var n = arguments[t], r = 0, c = n.length; r < c; r++, 
a++) o[a] = n[r];
return o;
};
Object.defineProperty(i, "__esModule", {
value: !0
});
var c = e("../../LY01_HDPP/src/common/LY01_HDPP_AddPrefab"), l = e("../../LY01_HDPP/src/common/LY01_HDPP_ButtonEnabled"), s = e("../../LY01_HDPP/src/common/LY01_HDPP_Define"), P = e("../../LY01_HDPP/src/common/LY01_HDPP_PopupSelf"), d = e("../../LY01_HDPP/src/common/LY01_HDPP_ServerBackup"), _ = e("../../LY01_HDPP/src/config/LY01_HDPP_PayConfig"), f = e("../../LY01_HDPP/src/data/LY01_HDPP_EmailData"), p = e("./LY01_HDPP_EmialItem"), u = cc._decorator, g = u.ccclass, D = u.property, m = function(e) {
a(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.bag = null;
t.itemPre = null;
t.btnClearAll = null;
t.btnGetAll = null;
t.nullLabel = null;
return t;
}
t.prototype.start = function() {
PPSDK.on(s.GameEvent.REFRESH_EMAIL_LIST, this.updateList, this);
this.initList();
};
t.prototype.onDestroy = function() {
PPSDK.off(this);
};
t.prototype.initList = function() {
for (var e = f.EmailData.getInstance().getEmails().sort(function(e, t) {
var i = e.view, o = e.deleted, a = e.get, n = e.createTime, r = t.view, c = t.deleted, l = t.get, s = t.createTime, P = 0, d = 0;
o && (P += 1e7);
c && (d += 1e7);
a && (P += 1e5);
l && (d += 1e5);
i && (P += 100);
r && (d += 100);
return P == d ? s - n : P - d;
}), t = 0; t < e.length; t++) {
var i = e[t], o = cc.instantiate(this.itemPre);
o.parent = this.bag;
o.getComponent(p.default).updateItem(i);
}
this.updateList();
};
t.prototype.updateList = function() {
for (var e = f.EmailData.getInstance().getEmails(), t = this.bag.children, i = 0, o = 0, a = 0, n = 0; n < t.length; n++) for (var r = 0; r < e.length; r++) {
var c = t[n].getComponent(p.default);
if (c.config.id == e[r].id) {
c.updateItem(e[r]);
var l = f.EmailData.getInstance().checkEmailValid(e[r]), s = l.valid;
l.time;
if (e[r].deleted) continue;
a++;
if (!s) {
o++;
continue;
}
e[r].get || e[r].deleted || i++;
e[r].get && !e[r].deleted && o++;
break;
}
}
this.btnClearAll.setInteractable(o > 0);
this.btnGetAll.setInteractable(i > 0);
this.nullLabel.active = 0 == a;
};
t.prototype.deleteAll = function() {
for (var e = f.EmailData.getInstance().getEmails(), t = 0; t < e.length; t++) {
var i = e[t];
i.view && i.get && (e[t].deleted = !0);
}
f.EmailData.getInstance().saveEmails(e);
};
t.prototype.getAll = function() {
for (var e = f.EmailData.getInstance().getEmails(), t = [], i = [], o = 0; o < e.length; o++) {
var a = e[o];
if (!a.get) {
if (1 == a.type) {
var n = a.actionId, l = _.PayConfig.getInstance().getPayInfoByActionId(n);
if (l) {
var s = l.rewardType;
t = r(t, s);
}
} else if (2 == a.type) {
var P = a.rewards;
t = r(t, P);
}
e[o].get = !0;
e[o].view = !0;
i.push(e[o]);
}
}
var p = {};
for (o = 0; o < t.length; o++) {
var u = t[o], g = u.goodsId, D = u.num;
p[g] || (p[g] = 0);
p[g] += D;
}
var m = [];
for (var v in p) m.push({
goodsId: v,
num: p[v]
});
if (m.length > 0) {
c.AddPrefab.createRecieve({
rewards: m
}).then(function() {
d.ServerBackup.doBackup(!0);
});
for (o = 0; o < i.length; o++) 1 == i[o].type && lieyou_SdkManager.giveOrder(e[o].id);
}
f.EmailData.getInstance().saveEmails(e);
};
t.prototype.buttonCallback = function(e, t) {
switch (t) {
case "deleteall":
if (!this.btnClearAll.interactable) return;
this.deleteAll();
break;

case "getall":
if (!this.btnGetAll.interactable) return;
this.getAll();
break;

case "close":
this.close();
}
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
n([ D(cc.Node) ], t.prototype, "bag", void 0);
n([ D(cc.Prefab) ], t.prototype, "itemPre", void 0);
n([ D(l.default) ], t.prototype, "btnClearAll", void 0);
n([ D(l.default) ], t.prototype, "btnGetAll", void 0);
n([ D(cc.Node) ], t.prototype, "nullLabel", void 0);
return n([ g ], t);
}(P.default);
i.default = m;
cc._RF.pop();
}, {
"../../LY01_HDPP/src/common/LY01_HDPP_AddPrefab": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_ButtonEnabled": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_Define": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_PopupSelf": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_ServerBackup": void 0,
"../../LY01_HDPP/src/config/LY01_HDPP_PayConfig": void 0,
"../../LY01_HDPP/src/data/LY01_HDPP_EmailData": void 0,
"./LY01_HDPP_EmialItem": "LY01_HDPP_EmialItem"
} ],
LY01_HDPP_EmialItem: [ function(e, t, i) {
"use strict";
cc._RF.push(t, "b403b8fgcZM5bEaDQFRCdNj", "LY01_HDPP_EmialItem");
var o, a = this && this.__extends || (o = function(e, t) {
return (o = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var i in t) Object.prototype.hasOwnProperty.call(t, i) && (e[i] = t[i]);
})(e, t);
}, function(e, t) {
o(e, t);
function i() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (i.prototype = t.prototype, new i());
}), n = this && this.__decorate || function(e, t, i, o) {
var a, n = arguments.length, r = n < 3 ? t : null === o ? o = Object.getOwnPropertyDescriptor(t, i) : o;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(e, t, i, o); else for (var c = e.length - 1; c >= 0; c--) (a = e[c]) && (r = (n < 3 ? a(r) : n > 3 ? a(t, i, r) : a(t, i)) || r);
return n > 3 && r && Object.defineProperty(t, i, r), r;
};
Object.defineProperty(i, "__esModule", {
value: !0
});
var r = e("../../LY01_HDPP/language/LY01_HDPP_i18nMgr"), c = e("../../LY01_HDPP/src/common/LY01_HDPP_AddPrefab"), l = e("../../LY01_HDPP/src/common/LY01_HDPP_Common"), s = e("../../LY01_HDPP/src/data/LY01_HDPP_EmailData"), P = cc._decorator, d = P.ccclass, _ = P.property, f = function(e) {
a(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.dot = null;
t.date = null;
t.title = null;
t.config = null;
return t;
}
t.prototype.updateItem = function(e) {
var t;
this.config = e;
this.title.string = e.title;
1 == e.type && (this.title.string = null !== (t = e.title) && void 0 !== t ? t : r.i18nMgr._getLabel("补单标题"));
if (e.deleted) this.node.destroy(); else {
var i = s.EmailData.getInstance().checkEmailValid(e), o = i.valid;
i.time;
if (o) {
this.node.opacity = e.get ? 150 : 255;
this.date.string = l.Common.timeToDate(e.createTime);
this.dot.active = !e.view;
} else {
this.node.opacity = 150;
this.date.string = r.i18nMgr._getLabel("已过期");
this.dot.active = !1;
}
}
};
t.prototype.showDetail = function() {
c.AddPrefab.createEmailDetail({
config: this.config
});
};
n([ _(cc.Node) ], t.prototype, "dot", void 0);
n([ _(cc.Label) ], t.prototype, "date", void 0);
n([ _(cc.Label) ], t.prototype, "title", void 0);
return n([ d ], t);
}(cc.Component);
i.default = f;
cc._RF.pop();
}, {
"../../LY01_HDPP/language/LY01_HDPP_i18nMgr": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_AddPrefab": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_Common": void 0,
"../../LY01_HDPP/src/data/LY01_HDPP_EmailData": void 0
} ]
}, {}, [ "LY01_HDPP_EmailDetail", "LY01_HDPP_EmailPanel", "LY01_HDPP_EmialItem" ]);
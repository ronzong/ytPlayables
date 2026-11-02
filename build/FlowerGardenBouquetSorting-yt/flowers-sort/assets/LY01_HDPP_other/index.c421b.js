window.__require = function e(t, o, r) {
function n(c, a) {
if (!o[c]) {
if (!t[c]) {
var P = c.split("/");
P = P[P.length - 1];
if (!t[P]) {
var s = "function" == typeof __require && __require;
if (!a && s) return s(P, !0);
if (i) return i(P, !0);
throw new Error("Cannot find module '" + c + "'");
}
c = P;
}
var _ = o[c] = {
exports: {}
};
t[c][0].call(_.exports, function(e) {
return n(t[c][1][e] || e);
}, _, _.exports, e, t, o, r);
}
return o[c].exports;
}
for (var i = "function" == typeof __require && __require, c = 0; c < r.length; c++) n(r[c]);
return n;
}({
LY01_HDPP_CodePanel: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "cef918cbjZEa70ejZwOad4L", "LY01_HDPP_CodePanel");
var r, n = this && this.__extends || (r = function(e, t) {
return (r = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
})(e, t);
}, function(e, t) {
r(e, t);
function o() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, new o());
}), i = this && this.__decorate || function(e, t, o, r) {
var n, i = arguments.length, c = i < 3 ? t : null === r ? r = Object.getOwnPropertyDescriptor(t, o) : r;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) c = Reflect.decorate(e, t, o, r); else for (var a = e.length - 1; a >= 0; a--) (n = e[a]) && (c = (i < 3 ? n(c) : i > 3 ? n(t, o, c) : n(t, o)) || c);
return i > 3 && c && Object.defineProperty(t, o, c), c;
};
Object.defineProperty(o, "__esModule", {
value: !0
});
var c = e("../../LY01_HDPP/src/common/LY01_HDPP_AddPrefab"), a = e("../../LY01_HDPP/src/common/LY01_HDPP_Define"), P = e("../../LY01_HDPP/src/common/LY01_HDPP_PopupSelf"), s = e("../../LY01_HDPP/src/common/LY01_HDPP_ServerBackup"), _ = e("../../LY01_HDPP/src/config/LY01_HDPP_PayConfig"), p = cc._decorator, l = p.ccclass, f = p.property, u = function(e) {
n(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.editorBox = null;
return t;
}
t.prototype.start = function() {
this.refresh();
};
t.prototype.refresh = function() {};
t.prototype.buttonCallback = function(e, t) {
var o = this;
switch (t) {
case "close":
this.close();
break;

case "ok":
var r = this.editorBox.string;
if ("" == r) {
c.AddPrefab.createTipsNode({
str: "请输入兑换码"
});
return;
}
PPSDK.showLoading();
lieyou_SdkManager.queryRedeemCodeInfo(r, function(e) {
PPSDK.hideLoading();
o.close();
var t = e.actionId;
console.log("info:", e);
var r = _.PayConfig.getInstance().getPayInfoByActionId(t);
console.log("payInfo:", r);
c.AddPrefab.createRecieve({
rewards: r.rewardType
}).then(function() {
s.ServerBackup.doBackup(!0);
});
}, function() {
PPSDK.hideLoading();
c.AddPrefab.createTipsNode({
str: "兑换码无效"
});
});
}
};
t.prototype.onEnable = function() {
PPSDK.emit(a.GameEvent.ON_FEED_BACK_HIDE, {
node: this.node,
hide: !0
});
};
t.prototype.onDisable = function() {
PPSDK.emit(a.GameEvent.ON_FEED_BACK_HIDE, {
node: this.node,
hide: !1
});
};
i([ f(cc.EditBox) ], t.prototype, "editorBox", void 0);
return i([ l ], t);
}(P.default);
o.default = u;
cc._RF.pop();
}, {
"../../LY01_HDPP/src/common/LY01_HDPP_AddPrefab": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_Define": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_PopupSelf": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_ServerBackup": void 0,
"../../LY01_HDPP/src/config/LY01_HDPP_PayConfig": void 0
} ],
LY01_HDPP_StatePanel: [ function(e, t, o) {
"use strict";
cc._RF.push(t, "56862i0fadFsLsMoe0a0Img", "LY01_HDPP_StatePanel");
var r, n = this && this.__extends || (r = function(e, t) {
return (r = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(e, t) {
e.__proto__ = t;
} || function(e, t) {
for (var o in t) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
})(e, t);
}, function(e, t) {
r(e, t);
function o() {
this.constructor = e;
}
e.prototype = null === t ? Object.create(t) : (o.prototype = t.prototype, new o());
}), i = this && this.__decorate || function(e, t, o, r) {
var n, i = arguments.length, c = i < 3 ? t : null === r ? r = Object.getOwnPropertyDescriptor(t, o) : r;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) c = Reflect.decorate(e, t, o, r); else for (var a = e.length - 1; a >= 0; a--) (n = e[a]) && (c = (i < 3 ? n(c) : i > 3 ? n(t, o, c) : n(t, o)) || c);
return i > 3 && c && Object.defineProperty(t, o, c), c;
};
Object.defineProperty(o, "__esModule", {
value: !0
});
var c = e("../../LY01_HDPP/language/LY01_HDPP_i18nMgr"), a = e("../../LY01_HDPP/src/common/LY01_HDPP_AddPrefab"), P = e("../../LY01_HDPP/src/common/LY01_HDPP_Define"), s = e("../../LY01_HDPP/src/common/LY01_HDPP_PopupSelf"), _ = e("../../LY01_HDPP/src/data/LY01_HDPP_PayData"), p = cc._decorator, l = p.ccclass, f = p.property, u = function(e) {
n(t, e);
function t() {
var t = null !== e && e.apply(this, arguments) || this;
t.materials = [];
t.vipIcon = null;
t.noadsIcon = null;
t.vipLabel = null;
t.noadsLabel = null;
t.buttonLabel = null;
return t;
}
t.prototype.start = function() {
this.refresh();
};
t.prototype.refresh = function() {
var e = _.PayData.getInstance(), t = e.getIsVip(), o = e.getIsRemoveAds(), r = e.getVipRemainTime(), n = e.getNoAdsRemainTime(), i = this.timeToString(r), a = this.timeToString(n);
this.vipIcon.setMaterial(0, this.materials[t ? 1 : 0]);
this.noadsIcon.setMaterial(0, this.materials[o ? 1 : 0]);
this.vipLabel.string = t ? c.i18nMgr._getLabel("剩余时长", [ i.day.toString(), i.hours.toString() ]) : c.i18nMgr._getLabel("未激活");
this.noadsLabel.string = o ? c.i18nMgr._getLabel("剩余时长", [ a.day.toString(), a.hours.toString() ]) : c.i18nMgr._getLabel("未激活");
this.buttonLabel.string = t ? c.i18nMgr._getLabel("确定") : c.i18nMgr._getLabel("激活VIP");
};
t.prototype.buttonCallback = function(e, t) {
switch (t) {
case "close":
this.close();
break;

case "ok":
if (_.PayData.getInstance().getIsVip()) this.close(); else {
this.close();
a.AddPrefab.createVIPPanel();
}
}
};
t.prototype.onEnable = function() {
PPSDK.emit(P.GameEvent.ON_FEED_BACK_HIDE, {
node: this.node,
hide: !0
});
};
t.prototype.onDisable = function() {
PPSDK.emit(P.GameEvent.ON_FEED_BACK_HIDE, {
node: this.node,
hide: !1
});
};
t.prototype.timeToString = function(e) {
var t = Math.floor(e / 24), o = Math.round(e % 24);
if (24 == o) {
t += 1;
o = 0;
}
return {
day: t,
hours: o
};
};
i([ f([ cc.Material ]) ], t.prototype, "materials", void 0);
i([ f(cc.Sprite) ], t.prototype, "vipIcon", void 0);
i([ f(cc.Sprite) ], t.prototype, "noadsIcon", void 0);
i([ f(cc.Label) ], t.prototype, "vipLabel", void 0);
i([ f(cc.Label) ], t.prototype, "noadsLabel", void 0);
i([ f(cc.Label) ], t.prototype, "buttonLabel", void 0);
return i([ l ], t);
}(s.default);
o.default = u;
cc._RF.pop();
}, {
"../../LY01_HDPP/language/LY01_HDPP_i18nMgr": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_AddPrefab": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_Define": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_PopupSelf": void 0,
"../../LY01_HDPP/src/data/LY01_HDPP_PayData": void 0
} ]
}, {}, [ "LY01_HDPP_CodePanel", "LY01_HDPP_StatePanel" ]);
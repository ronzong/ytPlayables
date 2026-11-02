window.__require = function e(o, t, n) {
function r(c, s) {
if (!t[c]) {
if (!o[c]) {
var i = c.split("/");
i = i[i.length - 1];
if (!o[i]) {
var P = "function" == typeof __require && __require;
if (!s && P) return P(i, !0);
if (a) return a(i, !0);
throw new Error("Cannot find module '" + c + "'");
}
c = i;
}
var _ = t[c] = {
exports: {}
};
o[c][0].call(_.exports, function(e) {
return r(o[c][1][e] || e);
}, _, _.exports, e, o, t, n);
}
return t[c].exports;
}
for (var a = "function" == typeof __require && __require, c = 0; c < n.length; c++) r(n[c]);
return r;
}({
LY01_HDPP_BankPanel: [ function(e, o, t) {
"use strict";
cc._RF.push(o, "791d6iU4c1CP6Q/A83HpVns", "LY01_HDPP_BankPanel");
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
}), a = this && this.__decorate || function(e, o, t, n) {
var r, a = arguments.length, c = a < 3 ? o : null === n ? n = Object.getOwnPropertyDescriptor(o, t) : n;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) c = Reflect.decorate(e, o, t, n); else for (var s = e.length - 1; s >= 0; s--) (r = e[s]) && (c = (a < 3 ? r(c) : a > 3 ? r(o, t, c) : r(o, t)) || c);
return a > 3 && c && Object.defineProperty(o, t, c), c;
};
Object.defineProperty(t, "__esModule", {
value: !0
});
var c = e("../../LY01_HDPP/language/LY01_HDPP_i18nMgr"), s = e("../../LY01_HDPP/src/common/LY01_HDPP_AddPrefab"), i = e("../../LY01_HDPP/src/common/LY01_HDPP_Common"), P = e("../../LY01_HDPP/src/common/LY01_HDPP_Define"), _ = e("../../LY01_HDPP/src/common/LY01_HDPP_Instance"), l = e("../../LY01_HDPP/src/common/LY01_HDPP_PopupSelf"), d = e("../../LY01_HDPP/src/config/LY01_HDPP_EventConfig"), u = e("../../LY01_HDPP/src/config/LY01_HDPP_GameConst"), p = e("../../LY01_HDPP/src/config/LY01_HDPP_GoodsConfig"), f = e("../../LY01_HDPP/src/data/LY01_HDPP_BankData"), L = e("../../LY01_HDPP/src/data/LY01_HDPP_CurrencyData"), D = cc._decorator, g = D.ccclass, m = D.property, H = (D.menu, 
function(e) {
r(o, e);
function o() {
var o = null !== e && e.apply(this, arguments) || this;
o.progressBar = null;
o.maxLabel = null;
o.recieveLabel = null;
o.moneyLabel = null;
o.descLabel = null;
o.iconNode = null;
return o;
}
o.prototype.start = function() {
var e = f.BankData.getInstance(), o = u.GameConst.getInstance().money_max, t = u.GameConst.getInstance().money_valid, n = e.getSaveMoney(), r = n / o;
this.maxLabel.string = o.toString();
this.recieveLabel.string = t.toString();
this.moneyLabel.string = n.toString();
this.descLabel.string = c.i18nMgr._getLabel("银行规则", [ t.toString(), o.toString() ]);
this.progressBar.progress = r;
_.Instance.showTopBar({
target: this.node,
showAll: !0
});
};
o.prototype.refresh = function() {
var e = f.BankData.getInstance(), o = u.GameConst.getInstance().money_max, t = e.getSaveMoney(), n = t / o;
this.moneyLabel.string = t.toString();
this.progressBar.progress = n;
};
o.prototype.onEnable = function() {
PPSDK.emit(P.GameEvent.ON_GAME_CLUB_HIDE, {
node: this.node,
hide: !0
});
};
o.prototype.onDisable = function() {
PPSDK.emit(P.GameEvent.ON_GAME_CLUB_HIDE, {
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

case "video":
var n = f.BankData.getInstance(), r = u.GameConst.getInstance().money_valid, a = n.getSaveMoney();
a >= r ? i.Common.showVideo({
success: function() {
n.useSaveMoney(a);
s.AddPrefab.flyGold({
count: 10,
fromNode: t.iconNode,
onEnd: function() {
L.CurrencyData.getInstance().addCurrency({
type: L.CurrencyType.COIN,
num: a
});
d.EventConfig.getInstance().assetsReportOutput({
source: d.AssetsSource.bank,
action: d.AssetsAction.video_get,
goodsList: [ {
goods: p.GoodsId.gold,
num: a
} ]
});
}
});
t.refresh();
}
}) : s.AddPrefab.createTipsNode({
str: "金币不足x",
params: [ r.toString() ]
});
}
};
a([ m(cc.ProgressBar) ], o.prototype, "progressBar", void 0);
a([ m(cc.Label) ], o.prototype, "maxLabel", void 0);
a([ m(cc.Label) ], o.prototype, "recieveLabel", void 0);
a([ m(cc.Label) ], o.prototype, "moneyLabel", void 0);
a([ m(cc.Label) ], o.prototype, "descLabel", void 0);
a([ m(cc.Node) ], o.prototype, "iconNode", void 0);
return a([ g ], o);
}(l.default));
t.default = H;
cc._RF.pop();
}, {
"../../LY01_HDPP/language/LY01_HDPP_i18nMgr": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_AddPrefab": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_Common": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_Define": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_Instance": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_PopupSelf": void 0,
"../../LY01_HDPP/src/config/LY01_HDPP_EventConfig": void 0,
"../../LY01_HDPP/src/config/LY01_HDPP_GameConst": void 0,
"../../LY01_HDPP/src/config/LY01_HDPP_GoodsConfig": void 0,
"../../LY01_HDPP/src/data/LY01_HDPP_BankData": void 0,
"../../LY01_HDPP/src/data/LY01_HDPP_CurrencyData": void 0
} ]
}, {}, [ "LY01_HDPP_BankPanel" ]);
window.__require = function t(e, o, n) {
function r(c, s) {
if (!o[c]) {
if (!e[c]) {
var a = c.split("/");
a = a[a.length - 1];
if (!e[a]) {
var u = "function" == typeof __require && __require;
if (!s && u) return u(a, !0);
if (i) return i(a, !0);
throw new Error("Cannot find module '" + c + "'");
}
c = a;
}
var p = o[c] = {
exports: {}
};
e[c][0].call(p.exports, function(t) {
return r(e[c][1][t] || t);
}, p, p.exports, t, e, o, n);
}
return o[c].exports;
}
for (var i = "function" == typeof __require && __require, c = 0; c < n.length; c++) r(n[c]);
return r;
}({
LY01_HDPP_ShopBgItem: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "12e27dORvFIIqWhE/8HGDF9", "LY01_HDPP_ShopBgItem");
var n, r = this && this.__extends || (n = function(t, e) {
return (n = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(t, e) {
t.__proto__ = e;
} || function(t, e) {
for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
})(t, e);
}, function(t, e) {
n(t, e);
function o() {
this.constructor = t;
}
t.prototype = null === e ? Object.create(e) : (o.prototype = e.prototype, new o());
}), i = this && this.__decorate || function(t, e, o, n) {
var r, i = arguments.length, c = i < 3 ? e : null === n ? n = Object.getOwnPropertyDescriptor(e, o) : n;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) c = Reflect.decorate(t, e, o, n); else for (var s = t.length - 1; s >= 0; s--) (r = t[s]) && (c = (i < 3 ? r(c) : i > 3 ? r(e, o, c) : r(e, o)) || c);
return i > 3 && c && Object.defineProperty(e, o, c), c;
}, c = this && this.__awaiter || function(t, e, o, n) {
return new (o || (o = Promise))(function(r, i) {
function c(t) {
try {
a(n.next(t));
} catch (t) {
i(t);
}
}
function s(t) {
try {
a(n.throw(t));
} catch (t) {
i(t);
}
}
function a(t) {
t.done ? r(t.value) : (e = t.value, e instanceof o ? e : new o(function(t) {
t(e);
})).then(c, s);
var e;
}
a((n = n.apply(t, e || [])).next());
});
}, s = this && this.__generator || function(t, e) {
var o, n, r, i, c = {
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
function s(t) {
return function(e) {
return a([ t, e ]);
};
}
function a(i) {
if (o) throw new TypeError("Generator is already executing.");
for (;c; ) try {
if (o = 1, n && (r = 2 & i[0] ? n.return : i[0] ? n.throw || ((r = n.return) && r.call(n), 
0) : n.next) && !(r = r.call(n, i[1])).done) return r;
(n = 0, r) && (i = [ 2 & i[0], r.value ]);
switch (i[0]) {
case 0:
case 1:
r = i;
break;

case 4:
c.label++;
return {
value: i[1],
done: !1
};

case 5:
c.label++;
n = i[1];
i = [ 0 ];
continue;

case 7:
i = c.ops.pop();
c.trys.pop();
continue;

default:
if (!(r = c.trys, r = r.length > 0 && r[r.length - 1]) && (6 === i[0] || 2 === i[0])) {
c = 0;
continue;
}
if (3 === i[0] && (!r || i[1] > r[0] && i[1] < r[3])) {
c.label = i[1];
break;
}
if (6 === i[0] && c.label < r[1]) {
c.label = r[1];
r = i;
break;
}
if (r && c.label < r[2]) {
c.label = r[2];
c.ops.push(i);
break;
}
r[2] && c.ops.pop();
c.trys.pop();
continue;
}
i = e.call(t, c);
} catch (t) {
i = [ 6, t ];
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
var a = t("../../LY01_HDPP/src/config/LY01_HDPP_ShopConfig"), u = cc._decorator, p = u.ccclass, l = u.property, h = (u.menu, 
function(t) {
r(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.bg = null;
return e;
}
e.prototype.start = function() {};
e.prototype.onInit = function(t) {
return c(this, void 0, void 0, function() {
return s(this, function(e) {
switch (e.label) {
case 0:
return [ 4, this.setThisSprite(t) ];

case 1:
e.sent();
return [ 2, this.node ];
}
});
});
};
e.prototype.setThisSprite = function(t) {
return c(this, void 0, void 0, function() {
var e = this;
return s(this, function() {
a.ShopConfig.getInstance().loadShopKuang(t).then(function(t) {
e.bg.spriteFrame = t;
e.addAutoReleaseAssets(t);
});
return [ 2 ];
});
});
};
i([ l(cc.Sprite) ], e.prototype, "bg", void 0);
return i([ p ], e);
}(cc.Component));
o.default = h;
cc._RF.pop();
}, {
"../../LY01_HDPP/src/config/LY01_HDPP_ShopConfig": void 0
} ],
LY01_HDPP_ShopItem: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "12a58xroBFJCrnWaI1tVOGD", "LY01_HDPP_ShopItem");
var n, r = this && this.__extends || (n = function(t, e) {
return (n = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(t, e) {
t.__proto__ = e;
} || function(t, e) {
for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
})(t, e);
}, function(t, e) {
n(t, e);
function o() {
this.constructor = t;
}
t.prototype = null === e ? Object.create(e) : (o.prototype = e.prototype, new o());
}), i = this && this.__decorate || function(t, e, o, n) {
var r, i = arguments.length, c = i < 3 ? e : null === n ? n = Object.getOwnPropertyDescriptor(e, o) : n;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) c = Reflect.decorate(t, e, o, n); else for (var s = t.length - 1; s >= 0; s--) (r = t[s]) && (c = (i < 3 ? r(c) : i > 3 ? r(e, o, c) : r(e, o)) || c);
return i > 3 && c && Object.defineProperty(e, o, c), c;
}, c = this && this.__awaiter || function(t, e, o, n) {
return new (o || (o = Promise))(function(r, i) {
function c(t) {
try {
a(n.next(t));
} catch (t) {
i(t);
}
}
function s(t) {
try {
a(n.throw(t));
} catch (t) {
i(t);
}
}
function a(t) {
t.done ? r(t.value) : (e = t.value, e instanceof o ? e : new o(function(t) {
t(e);
})).then(c, s);
var e;
}
a((n = n.apply(t, e || [])).next());
});
}, s = this && this.__generator || function(t, e) {
var o, n, r, i, c = {
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
function s(t) {
return function(e) {
return a([ t, e ]);
};
}
function a(i) {
if (o) throw new TypeError("Generator is already executing.");
for (;c; ) try {
if (o = 1, n && (r = 2 & i[0] ? n.return : i[0] ? n.throw || ((r = n.return) && r.call(n), 
0) : n.next) && !(r = r.call(n, i[1])).done) return r;
(n = 0, r) && (i = [ 2 & i[0], r.value ]);
switch (i[0]) {
case 0:
case 1:
r = i;
break;

case 4:
c.label++;
return {
value: i[1],
done: !1
};

case 5:
c.label++;
n = i[1];
i = [ 0 ];
continue;

case 7:
i = c.ops.pop();
c.trys.pop();
continue;

default:
if (!(r = c.trys, r = r.length > 0 && r[r.length - 1]) && (6 === i[0] || 2 === i[0])) {
c = 0;
continue;
}
if (3 === i[0] && (!r || i[1] > r[0] && i[1] < r[3])) {
c.label = i[1];
break;
}
if (6 === i[0] && c.label < r[1]) {
c.label = r[1];
r = i;
break;
}
if (r && c.label < r[2]) {
c.label = r[2];
c.ops.push(i);
break;
}
r[2] && c.ops.pop();
c.trys.pop();
continue;
}
i = e.call(t, c);
} catch (t) {
i = [ 6, t ];
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
var a = t("../../LY01_HDPP/src/common/LY01_HDPP_AddPrefab"), u = t("../../LY01_HDPP/src/common/LY01_HDPP_Common"), p = t("../../LY01_HDPP/src/common/LY01_HDPP_ServerBackup"), l = t("../../LY01_HDPP/src/config/LY01_HDPP_EventConfig"), h = t("../../LY01_HDPP/src/config/LY01_HDPP_GoodsConfig"), f = t("../../LY01_HDPP/src/config/LY01_HDPP_ShopConfig"), _ = t("../../LY01_HDPP/src/data/LY01_HDPP_CurrencyData"), d = t("../../LY01_HDPP/src/data/LY01_HDPP_ShopData"), P = cc._decorator, g = P.ccclass, y = P.property, v = function(t) {
r(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.numlabel = null;
e.buy = null;
e.use = null;
e.used = null;
e.goldbtn = null;
e.voidbtn = null;
e.vfx = null;
e.clicknum = 0;
e.usenum = 0;
e.pricenum = 0;
e.onClick = null;
return e;
}
e.prototype.onLoad = function() {};
e.prototype.start = function() {};
e.prototype.init = function(t, e, o, n, r) {
return c(this, void 0, void 0, function() {
var i;
return s(this, function(c) {
switch (c.label) {
case 0:
this.onClick = r;
i = d.ShopData.getInstance();
this.usenum = i.getShopUse();
this.clicknum = o;
this.pricenum = e;
if (t) {
this.buy.active = !1;
o == this.usenum ? this.used.active = !0 : this.use.active = !0;
} else {
this.buy.active = !0;
if (1 == n) {
this.goldbtn.active = !0;
this.voidbtn.active = !1;
this.numlabel.string = e.toString();
} else if (2 == n) {
this.goldbtn.active = !1;
this.voidbtn.active = !0;
}
}
return [ 4, this.setThisSprite(o) ];

case 1:
c.sent();
return [ 2, this.node ];
}
});
});
};
e.prototype.onclickuse = function() {
d.ShopData.getInstance().setShopUse(this.clicknum);
this.onClickThis();
};
e.prototype.onclickbuy = function() {
var t = _.CurrencyData.getInstance(), e = d.ShopData.getInstance();
if (t.checkEnough({
type: 0,
num: this.pricenum
})) {
t.useCurrency({
type: 0,
num: this.pricenum
});
e.setShopUnlock(this.clicknum);
e.setShopUse(this.clicknum);
u.Common.playSfx("shop_purchase", this);
this.onClickThis();
this.buy.active = !1;
var o = f.ShopConfig.getInstance().getConfigs()[this.clicknum].goodsId;
l.EventConfig.getInstance().assetsReportTransform({
source: l.AssetsSource.shop,
action: l.AssetsAction.coin_get,
goodsList: [ {
goods: h.GoodsId.gold,
num: -this.pricenum
}, {
goods: o,
num: 1
} ]
});
p.ServerBackup.doBackup();
} else a.AddPrefab.createTipsNode({
str: "金币不足"
});
};
e.prototype.onClickVoid = function() {
var t = this, e = d.ShopData.getInstance(), o = f.ShopConfig.getInstance().getConfigs()[this.clicknum].goodsId;
u.Common.showVideo({
success: function(n) {
e.setShopUnlock(t.clicknum);
e.setShopUse(t.clicknum);
u.Common.playSfx("shop_purchase", t);
l.EventConfig.getInstance().assetsReportTransform({
source: l.AssetsSource.shop,
action: 2 == n.type ? l.AssetsAction.video_get : l.AssetsAction.share_get,
goodsList: [ {
goods: o,
num: 1
} ]
});
t.onClickThis();
t.buy.active = !1;
p.ServerBackup.doBackup();
}
});
};
e.prototype.onClickThis = function() {
this.onClick && this.onClick(this);
};
e.prototype.setThisSprite = function(t) {
return c(this, void 0, void 0, function() {
var e = this;
return s(this, function() {
f.ShopConfig.getInstance().loadShopIcon(t).then(function(t) {
e.buy.getChildByName("bg").getComponent(cc.Sprite).spriteFrame = t;
e.use.getChildByName("bg").getComponent(cc.Sprite).spriteFrame = t;
e.used.getChildByName("bg").getComponent(cc.Sprite).spriteFrame = t;
e.addAutoReleaseAssets(t);
});
return [ 2 ];
});
});
};
e.prototype.setThisActive = function() {
var t = d.ShopData.getInstance(), e = t.getShopUnlock(this.clicknum), o = t.getShopUse();
if (e) {
this.buy.active = !1;
if (o == this.clicknum) {
this.used.active = !0;
this.use.active = !1;
} else {
this.use.active = !0;
this.used.active = !1;
}
} else {
this.buy.active = !0;
this.used.active = !1;
this.use.active = !1;
this.numlabel.string = this.pricenum.toString();
}
};
i([ y(cc.Label) ], e.prototype, "numlabel", void 0);
i([ y(cc.Node) ], e.prototype, "buy", void 0);
i([ y(cc.Node) ], e.prototype, "use", void 0);
i([ y(cc.Node) ], e.prototype, "used", void 0);
i([ y(cc.Node) ], e.prototype, "goldbtn", void 0);
i([ y(cc.Node) ], e.prototype, "voidbtn", void 0);
i([ y(cc.Node) ], e.prototype, "vfx", void 0);
return i([ g ], e);
}(cc.Component);
o.default = v;
cc._RF.pop();
}, {
"../../LY01_HDPP/src/common/LY01_HDPP_AddPrefab": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_Common": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_ServerBackup": void 0,
"../../LY01_HDPP/src/config/LY01_HDPP_EventConfig": void 0,
"../../LY01_HDPP/src/config/LY01_HDPP_GoodsConfig": void 0,
"../../LY01_HDPP/src/config/LY01_HDPP_ShopConfig": void 0,
"../../LY01_HDPP/src/data/LY01_HDPP_CurrencyData": void 0,
"../../LY01_HDPP/src/data/LY01_HDPP_ShopData": void 0
} ],
LY01_HDPP_ShopPanel: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "12679X60jpPfra/Eu4ePP/M", "LY01_HDPP_ShopPanel");
var n, r = this && this.__extends || (n = function(t, e) {
return (n = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(t, e) {
t.__proto__ = e;
} || function(t, e) {
for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
})(t, e);
}, function(t, e) {
n(t, e);
function o() {
this.constructor = t;
}
t.prototype = null === e ? Object.create(e) : (o.prototype = e.prototype, new o());
}), i = this && this.__decorate || function(t, e, o, n) {
var r, i = arguments.length, c = i < 3 ? e : null === n ? n = Object.getOwnPropertyDescriptor(e, o) : n;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) c = Reflect.decorate(t, e, o, n); else for (var s = t.length - 1; s >= 0; s--) (r = t[s]) && (c = (i < 3 ? r(c) : i > 3 ? r(e, o, c) : r(e, o)) || c);
return i > 3 && c && Object.defineProperty(e, o, c), c;
}, c = this && this.__awaiter || function(t, e, o, n) {
return new (o || (o = Promise))(function(r, i) {
function c(t) {
try {
a(n.next(t));
} catch (t) {
i(t);
}
}
function s(t) {
try {
a(n.throw(t));
} catch (t) {
i(t);
}
}
function a(t) {
t.done ? r(t.value) : (e = t.value, e instanceof o ? e : new o(function(t) {
t(e);
})).then(c, s);
var e;
}
a((n = n.apply(t, e || [])).next());
});
}, s = this && this.__generator || function(t, e) {
var o, n, r, i, c = {
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
function s(t) {
return function(e) {
return a([ t, e ]);
};
}
function a(i) {
if (o) throw new TypeError("Generator is already executing.");
for (;c; ) try {
if (o = 1, n && (r = 2 & i[0] ? n.return : i[0] ? n.throw || ((r = n.return) && r.call(n), 
0) : n.next) && !(r = r.call(n, i[1])).done) return r;
(n = 0, r) && (i = [ 2 & i[0], r.value ]);
switch (i[0]) {
case 0:
case 1:
r = i;
break;

case 4:
c.label++;
return {
value: i[1],
done: !1
};

case 5:
c.label++;
n = i[1];
i = [ 0 ];
continue;

case 7:
i = c.ops.pop();
c.trys.pop();
continue;

default:
if (!(r = c.trys, r = r.length > 0 && r[r.length - 1]) && (6 === i[0] || 2 === i[0])) {
c = 0;
continue;
}
if (3 === i[0] && (!r || i[1] > r[0] && i[1] < r[3])) {
c.label = i[1];
break;
}
if (6 === i[0] && c.label < r[1]) {
c.label = r[1];
r = i;
break;
}
if (r && c.label < r[2]) {
c.label = r[2];
c.ops.push(i);
break;
}
r[2] && c.ops.pop();
c.trys.pop();
continue;
}
i = e.call(t, c);
} catch (t) {
i = [ 6, t ];
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
var a = t("../../LY01_HDPP/src/common/LY01_HDPP_Define"), u = t("../../LY01_HDPP/src/common/LY01_HDPP_Instance"), p = t("../../LY01_HDPP/src/common/LY01_HDPP_PopupSelf"), l = t("../../LY01_HDPP/src/config/LY01_HDPP_ShopConfig"), h = t("../../LY01_HDPP/src/data/LY01_HDPP_ShopData"), f = t("./LY01_HDPP_ShopBgItem"), _ = t("./LY01_HDPP_ShopItem"), d = cc._decorator, P = d.ccclass, g = d.property, y = function(t) {
r(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.shopcontent = null;
e.shopbgcontent = null;
e.shopitem = null;
e.shopbgitem = null;
e.shopbg = null;
e.shopbgscroll2 = null;
e.shopbgscroll1 = null;
return e;
}
e.prototype.onLoad = function() {
t.prototype.onLoad && t.prototype.onLoad.call(this);
u.Instance.showTopBar({
target: this.node,
showAll: !0
});
};
e.prototype.onEnable = function() {
PPSDK.emit(a.GameEvent.ON_GAME_CLUB_HIDE, {
node: this.node,
hide: !0
});
};
e.prototype.onDisable = function() {
PPSDK.emit(a.GameEvent.ON_GAME_CLUB_HIDE, {
node: this.node,
hide: !1
});
};
e.prototype.start = function() {
var t = h.ShopData.getInstance();
this.onInitShopping();
this.setShopBgSprite(t.getShopUse());
};
e.prototype.showAction = function() {
return Promise.resolve();
};
e.prototype.hideAction = function() {
return Promise.resolve();
};
e.prototype.buttonCallback = function(t, e) {
switch (e) {
case "close":
this.close();
}
};
e.prototype.onInitShopping = function() {
return c(this, void 0, void 0, function() {
var t, e, o, n, r, i, c, a, u, p, d, P, g = this;
return s(this, function(s) {
switch (s.label) {
case 0:
t = h.ShopData.getInstance();
e = l.ShopConfig.getInstance();
o = e.getConfigs();
n = [];
p = 0;
s.label = 1;

case 1:
if (!(p < o.length)) return [ 3, 4 ];
d = cc.instantiate(this.shopitem);
this.shopcontent.addChild(d);
r = d.getComponent(_.default);
i = o[p], c = i.price, a = i.type, i.goodsId, u = i.id;
return [ 4, r.init(t.getShopUnlock(p), c, u, a, function(t) {
for (var e = function(e) {
var o = n[e], r = o.getComponent(_.default);
r.setThisActive();
if (r == t) {
o.getChildByName("vfx").active = !0;
var i = t.clicknum;
g.setShopBgSprite(i);
g.scheduleOnce(function() {
g.shopbgscroll2.scrollToPage(i, .5);
});
} else o.getChildByName("vfx").active = !1;
}, o = 0; o < n.length; o++) e(o);
}) ];

case 2:
s.sent();
n.push(d);
s.label = 3;

case 3:
p++;
return [ 3, 1 ];

case 4:
for (p = 0; p < this.shopbgcontent.children.length; p++) {
d = this.shopbgcontent.children[p];
P = d.getComponent(f.default);
d.width = Math.max(cc.winSize.width, cc.view.getDesignResolutionSize().width);
P.onInit(p);
}
this.scheduleOnce(function() {
g.shopbgscroll2.scrollToPage(t.getShopUse(), .5);
g.shopbgscroll1.scrollToTop(.3);
});
return [ 2 ];
}
});
});
};
e.prototype.setShopBgSprite = function(t) {
return c(this, void 0, void 0, function() {
var e = this;
return s(this, function() {
l.ShopConfig.getInstance().loadBgSkin(t).then(function(t) {
e.shopbg.spriteFrame = t;
e.addAutoReleaseAssets(t);
});
return [ 2 ];
});
});
};
i([ g(cc.Node) ], e.prototype, "shopcontent", void 0);
i([ g(cc.Node) ], e.prototype, "shopbgcontent", void 0);
i([ g(cc.Prefab) ], e.prototype, "shopitem", void 0);
i([ g(cc.Prefab) ], e.prototype, "shopbgitem", void 0);
i([ g(cc.Sprite) ], e.prototype, "shopbg", void 0);
i([ g(cc.PageView) ], e.prototype, "shopbgscroll2", void 0);
i([ g(cc.ScrollView) ], e.prototype, "shopbgscroll1", void 0);
return i([ P ], e);
}(p.default);
o.default = y;
cc._RF.pop();
}, {
"../../LY01_HDPP/src/common/LY01_HDPP_Define": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_Instance": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_PopupSelf": void 0,
"../../LY01_HDPP/src/config/LY01_HDPP_ShopConfig": void 0,
"../../LY01_HDPP/src/data/LY01_HDPP_ShopData": void 0,
"./LY01_HDPP_ShopBgItem": "LY01_HDPP_ShopBgItem",
"./LY01_HDPP_ShopItem": "LY01_HDPP_ShopItem"
} ],
LY01_HDPP_ShopTry: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "1213cUcUcRNO7CB3vESpxc4", "LY01_HDPP_ShopTry");
var n, r = this && this.__extends || (n = function(t, e) {
return (n = Object.setPrototypeOf || {
__proto__: []
} instanceof Array && function(t, e) {
t.__proto__ = e;
} || function(t, e) {
for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
})(t, e);
}, function(t, e) {
n(t, e);
function o() {
this.constructor = t;
}
t.prototype = null === e ? Object.create(e) : (o.prototype = e.prototype, new o());
}), i = this && this.__decorate || function(t, e, o, n) {
var r, i = arguments.length, c = i < 3 ? e : null === n ? n = Object.getOwnPropertyDescriptor(e, o) : n;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) c = Reflect.decorate(t, e, o, n); else for (var s = t.length - 1; s >= 0; s--) (r = t[s]) && (c = (i < 3 ? r(c) : i > 3 ? r(e, o, c) : r(e, o)) || c);
return i > 3 && c && Object.defineProperty(e, o, c), c;
}, c = this && this.__awaiter || function(t, e, o, n) {
return new (o || (o = Promise))(function(r, i) {
function c(t) {
try {
a(n.next(t));
} catch (t) {
i(t);
}
}
function s(t) {
try {
a(n.throw(t));
} catch (t) {
i(t);
}
}
function a(t) {
t.done ? r(t.value) : (e = t.value, e instanceof o ? e : new o(function(t) {
t(e);
})).then(c, s);
var e;
}
a((n = n.apply(t, e || [])).next());
});
}, s = this && this.__generator || function(t, e) {
var o, n, r, i, c = {
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
function s(t) {
return function(e) {
return a([ t, e ]);
};
}
function a(i) {
if (o) throw new TypeError("Generator is already executing.");
for (;c; ) try {
if (o = 1, n && (r = 2 & i[0] ? n.return : i[0] ? n.throw || ((r = n.return) && r.call(n), 
0) : n.next) && !(r = r.call(n, i[1])).done) return r;
(n = 0, r) && (i = [ 2 & i[0], r.value ]);
switch (i[0]) {
case 0:
case 1:
r = i;
break;

case 4:
c.label++;
return {
value: i[1],
done: !1
};

case 5:
c.label++;
n = i[1];
i = [ 0 ];
continue;

case 7:
i = c.ops.pop();
c.trys.pop();
continue;

default:
if (!(r = c.trys, r = r.length > 0 && r[r.length - 1]) && (6 === i[0] || 2 === i[0])) {
c = 0;
continue;
}
if (3 === i[0] && (!r || i[1] > r[0] && i[1] < r[3])) {
c.label = i[1];
break;
}
if (6 === i[0] && c.label < r[1]) {
c.label = r[1];
r = i;
break;
}
if (r && c.label < r[2]) {
c.label = r[2];
c.ops.push(i);
break;
}
r[2] && c.ops.pop();
c.trys.pop();
continue;
}
i = e.call(t, c);
} catch (t) {
i = [ 6, t ];
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
var a = t("../../LY01_HDPP/src/common/LY01_HDPP_Common"), u = t("../../LY01_HDPP/src/common/LY01_HDPP_PopupSelf"), p = t("../../LY01_HDPP/src/config/LY01_HDPP_EventConfig"), l = t("../../LY01_HDPP/src/config/LY01_HDPP_ShopConfig"), h = t("../../LY01_HDPP/src/data/LY01_HDPP_ShopData"), f = cc._decorator, _ = f.ccclass, d = f.property, P = function(t) {
r(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.kuang = null;
e.bgsp = null;
e.returnbtn = null;
e.voidbtn = null;
e.biaoti = null;
e.shopbg = null;
return e;
}
e.prototype.start = function() {};
e.prototype.onInit = function(t) {
return c(this, void 0, void 0, function() {
return s(this, function() {
this.options = t;
this.setThisSprite();
return [ 2 ];
});
});
};
e.prototype.showAction = function() {
return new Promise(function(t) {
t();
});
};
e.prototype.hideAction = function() {
return Promise.resolve();
};
e.prototype.onAfterHide = function() {
this.options.onClose && this.options.onClose();
t.prototype.onAfterHide && t.prototype.onAfterHide.call(this);
};
e.prototype.buttonCallback = function(t, e) {
var o = this;
switch (e) {
case "close":
this.close();
break;

case "video":
a.Common.showVideo({
success: function(t) {
var e = h.ShopData.getInstance();
e.setShopUnlock(o.options.skin);
e.setShopUse(o.options.skin);
var n = l.ShopConfig.getInstance().getConfigs()[o.options.skin].goodsId;
p.EventConfig.getInstance().assetsReportTransform({
source: p.AssetsSource.game,
action: 2 == t.type ? p.AssetsAction.video_get : p.AssetsAction.share_get,
goodsList: [ {
goods: n,
num: 1
} ]
});
o.close();
}
});
}
};
e.prototype.setThisSprite = function() {
return c(this, void 0, void 0, function() {
var t, e = this;
return s(this, function() {
t = this.options.skin;
l.ShopConfig.getInstance().loadShopKuang(t).then(function(t) {
if (t) {
e.kuang.spriteFrame = t;
e.addAutoReleaseAssets(t);
} else console.error("11111");
});
l.ShopConfig.getInstance().loadBgSkin(t).then(function(t) {
if (t) {
e.bgsp.spriteFrame = t;
e.addAutoReleaseAssets(t);
} else console.error("2222222");
});
return [ 2 ];
});
});
};
e.prototype.onUiSet = function() {
return new Promise(function() {});
};
i([ d(cc.Sprite) ], e.prototype, "kuang", void 0);
i([ d(cc.Sprite) ], e.prototype, "bgsp", void 0);
i([ d(cc.Node) ], e.prototype, "returnbtn", void 0);
i([ d(cc.Node) ], e.prototype, "voidbtn", void 0);
i([ d(cc.Node) ], e.prototype, "biaoti", void 0);
i([ d(cc.Node) ], e.prototype, "shopbg", void 0);
return i([ _ ], e);
}(u.default);
o.default = P;
cc._RF.pop();
}, {
"../../LY01_HDPP/src/common/LY01_HDPP_Common": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_PopupSelf": void 0,
"../../LY01_HDPP/src/config/LY01_HDPP_EventConfig": void 0,
"../../LY01_HDPP/src/config/LY01_HDPP_ShopConfig": void 0,
"../../LY01_HDPP/src/data/LY01_HDPP_ShopData": void 0
} ]
}, {}, [ "LY01_HDPP_ShopBgItem", "LY01_HDPP_ShopItem", "LY01_HDPP_ShopPanel", "LY01_HDPP_ShopTry" ]);
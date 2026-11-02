window.__require = function t(e, o, n) {
function i(c, a) {
if (!o[c]) {
if (!e[c]) {
var s = c.split("/");
s = s[s.length - 1];
if (!e[s]) {
var p = "function" == typeof __require && __require;
if (!a && p) return p(s, !0);
if (r) return r(s, !0);
throw new Error("Cannot find module '" + c + "'");
}
c = s;
}
var l = o[c] = {
exports: {}
};
e[c][0].call(l.exports, function(t) {
return i(e[c][1][t] || t);
}, l, l.exports, t, e, o, n);
}
return o[c].exports;
}
for (var r = "function" == typeof __require && __require, c = 0; c < n.length; c++) i(n[c]);
return i;
}({
LY01_HDPP_ListItemInit: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "12d76S9gfdA7akqQfB+Wyh9", "LY01_HDPP_ListItemInit");
var n, i = this && this.__extends || (n = function(t, e) {
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
}), r = this && this.__decorate || function(t, e, o, n) {
var i, r = arguments.length, c = r < 3 ? e : null === n ? n = Object.getOwnPropertyDescriptor(e, o) : n;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) c = Reflect.decorate(t, e, o, n); else for (var a = t.length - 1; a >= 0; a--) (i = t[a]) && (c = (r < 3 ? i(c) : r > 3 ? i(e, o, c) : i(e, o)) || c);
return r > 3 && c && Object.defineProperty(e, o, c), c;
};
Object.defineProperty(o, "__esModule", {
value: !0
});
var c = cc._decorator, a = c.ccclass, s = c.property, p = (c.menu, function(t) {
i(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.starlabel = null;
e.namelabel = null;
e.rank = null;
e.icon = null;
e.bg = [];
e.bg2 = [];
e.iconrank = [];
return e;
}
e.prototype.start = function() {};
e.prototype.initItem = function(t, e, o, n) {
for (var i = 0; i < this.bg.length; i++) {
this.bg[i].active = !n;
this.bg2[i].active = n;
}
this.namelabel.string = n ? "Player" : e;
if (1 == t) {
this.icon.active = !0;
this.icon.getComponent(cc.Sprite).spriteFrame = this.iconrank[0];
} else if (2 == t) {
this.icon.active = !0;
this.icon.getComponent(cc.Sprite).spriteFrame = this.iconrank[1];
} else if (3 == t) {
this.icon.active = !0;
this.icon.getComponent(cc.Sprite).spriteFrame = this.iconrank[2];
} else {
this.rank.active = !0;
this.rank.getComponent(cc.Label).string = t.toString();
}
this.starlabel.string = o.toString();
};
r([ s(cc.Label) ], e.prototype, "starlabel", void 0);
r([ s(cc.Label) ], e.prototype, "namelabel", void 0);
r([ s(cc.Node) ], e.prototype, "rank", void 0);
r([ s(cc.Node) ], e.prototype, "icon", void 0);
r([ s(cc.Node) ], e.prototype, "bg", void 0);
r([ s(cc.Node) ], e.prototype, "bg2", void 0);
r([ s(cc.SpriteFrame) ], e.prototype, "iconrank", void 0);
return r([ a ], e);
}(cc.Component));
o.default = p;
cc._RF.pop();
}, {} ],
LY01_HDPP_List: [ function(t, e, o) {
"use strict";
cc._RF.push(e, "12a7eSwYzJI3Z7jeYqRzMeY", "LY01_HDPP_List");
var n, i = this && this.__extends || (n = function(t, e) {
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
}), r = this && this.__decorate || function(t, e, o, n) {
var i, r = arguments.length, c = r < 3 ? e : null === n ? n = Object.getOwnPropertyDescriptor(e, o) : n;
if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) c = Reflect.decorate(t, e, o, n); else for (var a = t.length - 1; a >= 0; a--) (i = t[a]) && (c = (r < 3 ? i(c) : r > 3 ? i(e, o, c) : i(e, o)) || c);
return r > 3 && c && Object.defineProperty(e, o, c), c;
};
Object.defineProperty(o, "__esModule", {
value: !0
});
var c = t("../../LY01_HDPP/src/common/LY01_HDPP_Define"), a = t("../../LY01_HDPP/src/common/LY01_HDPP_Instance"), s = t("../../LY01_HDPP/src/common/LY01_HDPP_PopupSelf"), p = t("../../LY01_HDPP/src/config/LY01_HDPP_RankConfig"), l = t("../../LY01_HDPP/src/data/LY01_HDPP_GameData"), u = t("./LY01_HDPP_ListItemInit"), _ = cc._decorator, f = _.ccclass, P = _.property, h = (_.menu, 
function(t) {
i(e, t);
function e() {
var e = null !== t && t.apply(this, arguments) || this;
e.list = null;
e.rank = null;
e.icon = null;
e.iconrank = [];
e.listitem = null;
e.cnt = null;
return e;
}
e.prototype.onLoad = function() {
t.prototype.onLoad && t.prototype.onLoad.call(this);
var e = l.GameData.getInstance();
this.list.string = e.getStarNum().toString();
a.Instance.showTopBar({
target: this.node,
showAll: !0
});
};
e.prototype.start = function() {
this.inItUi();
};
e.prototype.onInit = function() {};
e.prototype.onEnable = function() {
PPSDK.emit(c.GameEvent.ON_GAME_CLUB_HIDE, {
node: this.node,
hide: !0
});
};
e.prototype.onDisable = function() {
PPSDK.emit(c.GameEvent.ON_GAME_CLUB_HIDE, {
node: this.node,
hide: !1
});
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
e.prototype.inItUi = function() {
for (var t = this, e = p.RankConfig.getInstance().getRankList(), o = null, n = 0; n < e.length; n++) if (e[n].startnum < l.GameData.getInstance().getStarNum()) {
o = n;
break;
}
if ("number" == typeof o) if (o < 3) {
this.icon.active = !0;
this.icon.getComponent(cc.Sprite).spriteFrame = this.iconrank[o];
} else {
this.rank.active = !0;
this.rank.getComponent(cc.Label).string = (o + 1).toString();
} else {
this.rank.active = !0;
this.rank.getComponent(cc.Label).string = "50+";
}
var i = 0;
this.schedule(function() {
var n, r = cc.instantiate(t.listitem), c = r.getComponent(u.default);
n = "zh" == PPSDK.languageManager.getLanguage() ? e[i].id : e[i].name_en;
i < o ? c.initItem(i + 1, n, e[i].startnum, !1) : i == o ? c.initItem(i + 1, "Player", l.GameData.getInstance().getStarNum(), !0) : c.initItem(i + 1, n, e[i].startnum, !1);
i++;
t.cnt.addChild(r);
}, 0, 49, 0);
};
r([ P(cc.Label) ], e.prototype, "list", void 0);
r([ P(cc.Node) ], e.prototype, "rank", void 0);
r([ P(cc.Node) ], e.prototype, "icon", void 0);
r([ P(cc.SpriteFrame) ], e.prototype, "iconrank", void 0);
r([ P(cc.Prefab) ], e.prototype, "listitem", void 0);
r([ P(cc.Node) ], e.prototype, "cnt", void 0);
return r([ f ], e);
}(s.default));
o.default = h;
cc._RF.pop();
}, {
"../../LY01_HDPP/src/common/LY01_HDPP_Define": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_Instance": void 0,
"../../LY01_HDPP/src/common/LY01_HDPP_PopupSelf": void 0,
"../../LY01_HDPP/src/config/LY01_HDPP_RankConfig": void 0,
"../../LY01_HDPP/src/data/LY01_HDPP_GameData": void 0,
"./LY01_HDPP_ListItemInit": "LY01_HDPP_ListItemInit"
} ]
}, {}, [ "LY01_HDPP_List", "LY01_HDPP_ListItemInit" ]);
// 弹窗布局与开关修正：整个弹窗居中、黑色半透明底图居中并铺满屏幕，
// 并让弹窗内「音乐 / 音效」两行开关的「开启」「关闭」两个选项都能点。
//
// 由 Mecha/tools/patch_local.cjs 在 DlgPause.init() / DlgSet.init() 里调用
//   window.__mechaCenterDialog(this.node)      // DlgPause 用的是旧名 __mechaCenterPauseDlg，等价
// 原 prefab 的 DlgPause 根节点被 Widget 对齐到父节点一侧，面板与按钮集中在右上角，
// 在 fitHeight 等策略下会部分跑到屏幕外。这里每次显示时按当前可见尺寸重新排版：
//   1) 关掉根节点/底图上的 Widget，避免每帧把位置改回去；
//   2) 把底图以外的可见内容（面板、设置面板、底部按钮）整体平移到屏幕中心；
//   3) 底图锚点改为居中、尺寸设为可见区域，铺满整个屏幕。
// 窗口大小或宽高比变化时会重新计算，因此跟随屏幕适配；重复显示结果收敛。
//
// 说明：暂停本身已按需求放弃——点暂停按钮只弹设置弹窗、不再暂停游戏。本文件只负责排版，
// 不碰游戏状态，也不改动弹窗内音乐/音效开关的原有实现（曾试过让它更可点，会与 prefab 的
// "开启/关闭"两个图标叠加出重叠字样，并导致 setChange 重复绑定、音效重复播放，已回退）。
(function () {
  "use strict";
  var params = new URLSearchParams(location.search), debug = params.get("debug") === "1";
  function log() { if (debug) try { console.info.apply(console, ["[mecha-pause-ui]"].concat([].slice.call(arguments))); } catch (_) {} }
  function disableWidgets(node) {
    if (!node || !node.getComponents || !window.cc || !cc.Widget) return;
    var list = node.getComponents(cc.Widget) || [];
    for (var i = 0; i < list.length; i++) list[i].enabled = false;
  }
  // ---- 音乐/音效开关：让「开启 / 关闭」两个选项都能点 ----
  // prefab 每行是「开启」「关闭」两个并排标签 + 两个按钮（open/close，各 72x49）：
  //   open  按钮（底图"开启底"）原本绑 closeBtn，close 按钮（底图"关闭底"）原本绑 openBtn；
  //   showSet() 用 active 互斥显示"当前状态"的那个按钮，所以另一个标签的位置点不到。
  // 这里按「点哪个选哪个」处理，同时避开之前踩过的两个坑：
  //   1) 不再把两个按钮同时显示（非当前状态的按钮 opacity=0 完全透明，不会叠出重样文字）；
  //   2) 不改原型、不重新绑定 setChange，只在末尾追加一个自己的监听做视觉同步，并给
  //      openBtn/closeBtn 包一层：状态已是目标值时直接返回，不会多发 setChange
  //      （那是音效重复播放的来源）。
  function switchGroup(comp, index) {
    var group = index === 0 ? comp.effectNode : comp.musicNode;
    if (!group || !group.getChildByName) return null;
    return { group: group, open: group.getChildByName("open"), close: group.getChildByName("close") };
  }
  function setBtnHandler(node, handler) {
    if (!node || !node.getComponent || !window.cc || !cc.Button) return;
    var btn = node.getComponent(cc.Button);
    var events = btn && btn.clickEvents;
    if (!events) return;
    for (var i = 0; i < events.length; i++) events[i].handler = handler;
  }
  // showSet() 刚设好的 active 才代表当前状态，先记下来再改视觉
  function captureSwitch(comp) {
    for (var i = 0; i <= 1; i++) {
      var s = switchGroup(comp, i);
      if (!s) continue;
      if (s.open) s.open.__mechaOn = !!s.open.active;
    }
  }
  function applySwitchVisual(comp) {
    for (var i = 0; i <= 1; i++) {
      var s = switchGroup(comp, i);
      if (!s) continue;
      var on = !!(s.open && s.open.__mechaOn);
      // 两个按钮都保持可点，只有当前状态那个可见（另一个完全透明，不会重叠）
      if (s.open) { if (!s.open.active) s.open.active = true; s.open.opacity = on ? 255 : 0; }
      if (s.close) { if (!s.close.active) s.close.active = true; s.close.opacity = on ? 0 : 255; }
    }
  }
  function installSwitchFix(root) {
    var musicset = root.getChildByName && root.getChildByName("musicset");
    if (!musicset) return;
    var comps = musicset._components || [], comp = null;
    for (var i = 0; i < comps.length; i++) {
      if (comps[i] && comps[i].effectNode && comps[i].musicNode) { comp = comps[i]; break; }
    }
    if (!comp || comp.__mechaSwitchFixed) return;
    comp.__mechaSwitchFixed = true;
    // 1) handler 与标签语义一致：开启=openBtn、关闭=closeBtn
    for (var j = 0; j <= 1; j++) {
      var s = switchGroup(comp, j);
      if (!s) continue;
      setBtnHandler(s.open, "openBtn");
      setBtnHandler(s.close, "closeBtn");
    }
    // 2) 状态已是目标值时不再转发，避免多发 setChange 造成音效重复播放
    var origOpen = comp.openBtn, origClose = comp.closeBtn;
    comp.openBtn = function (evt, data) {
      var g = switchGroup(this, parseInt(data) === 0 ? 0 : 1);
      if (g && g.open && g.open.__mechaOn) return;
      return origOpen.apply(this, arguments);
    };
    comp.closeBtn = function (evt, data) {
      var g = switchGroup(this, parseInt(data) === 0 ? 0 : 1);
      if (g && g.open && !g.open.__mechaOn) return;
      return origClose.apply(this, arguments);
    };
    // 3) 视觉同步必须紧跟 showSet：showSet 会重新设 active 互斥，晚于它执行才有效。
    //    包一层实例方法并重绑事件（off 原引用 + on 包装），不碰原型。
    var origShowSet = comp.showSet;
    var wrapped = function () {
      origShowSet.call(this);
      captureSwitch(this);
      applySwitchVisual(this);
    };
    comp.showSet = wrapped;
    try { cc.director.off("setChange", origShowSet, comp); } catch (_) {}
    try { cc.director.on("setChange", wrapped, comp); } catch (_) {}
    wrapped.call(comp);
  }
  // 收集子树里所有可见且有尺寸的节点盒子（跳过底图子树），用于算内容的真实范围
  function collectBoxes(node, skip, out) {
    var children = node.children || [];
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      if (child === skip || !child.activeInHierarchy) continue;
      var box = child.getBoundingBoxToWorld();
      if (box && box.width > 0 && box.height > 0) out.push(box);
      collectBoxes(child, skip, out);
    }
  }
  window.__mechaCenterPauseDlg = function (root) {
    try {
      if (!root || !root.parent || !window.cc || !cc.view || !root.convertToWorldSpaceAR) return;
      var visible = cc.winSize || cc.view.getVisibleSize();
      if (!visible || !visible.width || !visible.height) return;
      var center = cc.v2(visible.width / 2, visible.height / 2);
      var bg = root.getChildByName ? root.getChildByName("bg") : null;
      // 1) Widget 会每帧重新对齐，先停用
      disableWidgets(root);
      disableWidgets(bg);
      // 2) 内容整体居中（含面板、设置面板与底部两个按钮）
      var boxes = [];
      collectBoxes(root, bg, boxes);
      if (boxes.length) {
        var x0 = boxes[0].x, y0 = boxes[0].y, x1 = boxes[0].x + boxes[0].width, y1 = boxes[0].y + boxes[0].height;
        for (var i = 1; i < boxes.length; i++) {
          x0 = Math.min(x0, boxes[i].x); y0 = Math.min(y0, boxes[i].y);
          x1 = Math.max(x1, boxes[i].x + boxes[i].width); y1 = Math.max(y1, boxes[i].y + boxes[i].height);
        }
        var delta = cc.v2(center.x - (x0 + x1) / 2, center.y - (y0 + y1) / 2);
        var anchorWorld = root.convertToWorldSpaceAR(cc.v2(0, 0));
        var pos = root.parent.convertToNodeSpaceAR(cc.v2(anchorWorld.x + delta.x, anchorWorld.y + delta.y));
        root.position = cc.v3(pos.x, pos.y, 0);
        log("content box", [Math.round(x0), Math.round(y0), Math.round(x1 - x0), Math.round(y1 - y0)]);
      } else {
        log("no visible content box");
      }
      installSwitchFix(root);
      // 3) 底图铺满屏幕
      if (bg) {
        bg.anchorX = 0.5; bg.anchorY = 0.5;
        bg.setContentSize(visible.width, visible.height);
        var bgPos = bg.parent.convertToNodeSpaceAR(center);
        bg.position = cc.v3(bgPos.x, bgPos.y, 0);
      }
      log("layout done, visible", [Math.round(visible.width), Math.round(visible.height)]);
    } catch (e) {
      log("layout failed", e && e.message);
    }
  };
  // 同义名：DlgPause 与首页的 DlgSet 结构一致，共用同一套排版与开关修正
  window.__mechaCenterDialog = window.__mechaCenterPauseDlg;
}());

// 探针：列出“某个视图坐标点”上命中的所有活跃节点（用来找是谁吃掉了点击）
// 点按需改：pt 用节点世界坐标，例如 cc.find('Canvas/.../btn_pause').getPosition() 或 cc.Camera 换算。
(() => {
  const pt = cc.v2(86, 1167); // 示例：WastelandSurvivor 的 btn_pause 世界坐标
  const hits = [];
  const walk = (n, depth) => {
    if (!n.activeInHierarchy) return;
    let bb = null;
    try { bb = n.getBoundingBoxToWorld(); } catch (_e) { bb = null; }
    if (bb && bb.contains(pt)) {
      const comps = (n._components || []).map((c) => c.__classname__ || (c.constructor && c.constructor.name) || '?');
      hits.push({
        path: (n.parent && n.parent.name ? n.parent.name + '/' : '') + n.name,
        depth,
        size: [Math.round(bb.width), Math.round(bb.height)],
        z: n.zIndex,
        idx: n.getSiblingIndex(),
        touch: !!n._touchListener,
        swallow: !!(n._touchListener && n._touchListener.swallowTouches),
        comps: comps.filter((c) => /Button|Touch|Widget|Layout/.test(String(c))),
      });
    }
    (n.children || []).forEach((c) => walk(c, depth + 1));
  };
  const sc = cc.director.getScene();
  if (sc) walk(sc, 0);
  return { count: hits.length, hits: hits.slice(-25) };
})()

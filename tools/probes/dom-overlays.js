// 探针：列出游戏页里所有可见的 DOM 覆盖层（含位置/层级/pointer-events/HTML），
// 以及指定坐标处最上层的元素，用来定位“按钮点不动”时到底是哪个元素吃了点击。
(() => {
  const out = [];
  const walk = (el, depth) => {
    if (depth > 4) return;
    const r = el.getBoundingClientRect();
    if (r.width > 20 && r.height > 20) {
      const cs = getComputedStyle(el);
      out.push({
        depth,
        tag: el.tagName,
        id: el.id,
        cls: typeof el.className === 'string' ? el.className.slice(0, 40) : '',
        rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)],
        pe: cs.pointerEvents, z: cs.zIndex, pos: cs.position,
        html: String(el.outerHTML || '').slice(0, 120).replace(/\s+/g, ' '),
      });
    }
    Array.prototype.forEach.call(el.children || [], (c) => walk(c, depth + 1));
  };
  walk(document.body, 0);
  // 命中点按需改：默认取画布左上角附近（竖屏 Playables 里 gift / weekly card 就在这一带）
  const at = document.elementFromPoint(80, 100);
  const atInfo = at ? (at.tagName + (at.id ? '#' + at.id : '') + ' cls=' + String(at.className).slice(0, 40)
    + ' rect=' + (() => { const r = at.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)].join(','); })()
    + ' html=' + String(at.outerHTML || '').slice(0, 120).replace(/\s+/g, ' ')) : 'null';
  return { count: out.length, at80_100: atInfo, elements: out.slice(0, 30) };
})()

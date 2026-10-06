// 探针：对比引擎缓存的 canvas 位置与实时位置（位置不一致会让点击整体偏移）
(() => {
  const c = document.getElementById('GameCanvas');
  const r = c.getBoundingClientRect();
  const cached = cc.inputManager && cc.inputManager._canvasBoundingRect;
  const vp = cc.view.getViewportRect();
  return {
    live: { left: Math.round(r.left), top: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height) },
    cached: cached ? { left: Math.round(cached.left), top: Math.round(cached.top), width: Math.round(cached.width), height: Math.round(cached.height) } : null,
    viewport: [Math.round(vp.x), Math.round(vp.y), Math.round(vp.width), Math.round(vp.height)],
    scale: [cc.view.getScaleX(), cc.view.getScaleY()],
    dpr: cc.view._devicePixelRatio,
    canvasBacking: [c.width, c.height],
    winSize: [Math.round(cc.winSize.width), Math.round(cc.winSize.height)],
  };
})()

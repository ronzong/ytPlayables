/* PC 操作提示：只在 Begin 进入场景后显示，遮罩尺寸跟随画布。 */
(function () {
  'use strict';
  // 黑色背景不透明度百分比：0 完全透明，50 半透明，100 完全黑色。
  var BACKGROUND_OPACITY_PERCENT = 72;
  window.__growSunDesktopTip = function (scene, data) {
    if (!data || !data.desktopControlsTip ||
        /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
        !window.matchMedia('(any-pointer: fine)').matches) return;

    scene.events.once('create', function () {
      var canvas = scene.game.canvas;
      var overlay = document.createElement('div');
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', 'Mouse controls');
      overlay.style.cssText = 'position:fixed;z-index:2147483647;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;padding:clamp(16px,4vw,48px);color:#fff;text-align:center;font-family:Arial,sans-serif;overflow:auto;pointer-events:auto;';
      overlay.style.backgroundColor = 'rgba(0,0,0,' + Math.max(0, Math.min(100, BACKGROUND_OPACITY_PERCENT)) / 100 + ')';
      var message = document.createElement('p');
      message.textContent = 'Holding down the left mouse button quickly drains your energy and prevents you from growing. Simply move your mouse to move and devour.';
      message.style.cssText = 'margin:0;max-width:720px;font-size:clamp(16px,2.5vw,28px);line-height:1.5;';
      var button = document.createElement('button');
      button.textContent = 'Got it';
      button.style.cssText = 'flex-shrink:0;padding:12px 28px;border:1px solid #fff;border-radius:8px;background:rgba(255,255,255,.12);color:#fff;font:inherit;font-size:18px;cursor:pointer;';
      overlay.append(message, button);
      // 场景创建时两台相机正在从黑屏淡入；暂停前清除淡入遮罩，
      // 否则动画冻结在黑屏，提示背景即使完全透明也看不到场景。
      scene.cameras.main.fadeEffect.reset();
      scene.uiCamera.fadeEffect.reset();
      // 暂停整个场景，冻结物理、计时器和输入，避免读提示期间损失能量。
      scene.stopBoost();
      scene.adapter.gameplayStop();
      scene.scene.pause();
      document.body.appendChild(overlay);
      var previousFocus = document.activeElement;
      button.focus();
      function layout() {
        var rect = canvas.getBoundingClientRect();
        overlay.style.left = rect.left + 'px';
        overlay.style.top = rect.top + 'px';
        overlay.style.width = rect.width + 'px';
        overlay.style.height = rect.height + 'px';
      }
      layout();
      var observer = new ResizeObserver(layout);
      observer.observe(canvas);
      window.addEventListener('resize', layout);
      function cleanup() {
        observer.disconnect();
        window.removeEventListener('resize', layout);
        overlay.remove();
      }
      scene.events.once('shutdown', cleanup);
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        cleanup();
        scene.events.off('shutdown', cleanup);
        scene.input.resetPointers();
        scene.scene.resume();
        scene.adapter.gameplayStart();
        if (previousFocus && previousFocus.focus) previousFocus.focus();
      }, { once: true });
      // 阻止弹层操作穿透到画布和游戏快捷键。
      ['pointerdown', 'pointerup', 'keydown', 'keyup'].forEach(function (type) {
        overlay.addEventListener(type, function (event) { event.stopPropagation(); });
      });
    });
  };
})();

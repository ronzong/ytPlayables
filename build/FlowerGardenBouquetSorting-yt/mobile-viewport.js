// 移动端直接使用浏览器可用视口；不改变 Cocos 的固定高度策略或原生 UI。
(function () {
  'use strict';
  if (window.parent !== window) {
    // 子 iframe 有独立的 Element 原型，外层平台的全屏拦截不会自动覆盖这里。
    ['requestFullscreen', 'webkitRequestFullscreen', 'webkitRequestFullScreen',
      'mozRequestFullScreen', 'msRequestFullscreen'].forEach(function (key) {
      if (typeof Element.prototype[key] === 'function') {
        Element.prototype[key] = function () { return Promise.resolve(); };
      }
    });
    return;
  }

  var mobile = /iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent) ||
    !!(navigator.userAgentData && navigator.userAgentData.mobile);
  if (!mobile) return;

  var style = document.createElement('style');
  // 覆盖包装器每次 resize 写入的固定尺寸缩放；让子页面收到真实视口宽高。
  style.textContent =
    '#childIframeWrap{position:fixed!important;inset:0!important;' +
    'width:100%!important;height:100%!important;margin:0!important;padding:0!important}' +
    '#childIframe{position:absolute!important;inset:0!important;' +
    'width:100%!important;height:100%!important;transform:none!important;' +
    '-webkit-transform:none!important;outline:none!important}';
  document.head.appendChild(style);
})();

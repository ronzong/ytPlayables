/*
 * Dominators 本地插屏节奏限制（产品层，默认生效、不依赖任何调试参数）。
 *
 * 为什么需要它：本地的 wasm 补丁是"直连 jslib"（mode B），绕过了 PluginYG2 自己的
 * interAdvInterval 计时；Yandex/Facebook 也都要求全屏广告不能连发。所以把"两次插屏之间的
 * 最小间隔"放在页面层，位置在 SDK 适配器入口（ysdk.adv.showFullscreenAdv），
 * 这样无论调用来自 C# 桥还是页面都统一受控。
 *
 * 行为：间隔内来的请求不展示，立即按"未展示"收尾（onClose(false)）——这是平台契约里合法的
 * 一种收尾，插件会收到 CloseInterAdv(false) 并继续等下一次请求，不会卡住任何流程。
 *
 * 参数：advFloor=<秒> 覆盖默认间隔（0 = 关闭限制），默认 30 秒。
 */
(function () {
  'use strict';
  var params = new URLSearchParams(location.search || '');
  var raw = params.get('advFloor');
  var FLOOR_MS = raw === null ? 30000 : Math.max(0, Math.min(3600, parseInt(raw, 10) || 0)) * 1000;
  var lastShownAt = 0;

  function wrap(sdk) {
    if (!sdk || !sdk.adv || sdk.adv.__adFloorWrapped) return sdk;
    var orig = sdk.adv.showFullscreenAdv;
    if (typeof orig !== 'function') return sdk;
    sdk.adv.showFullscreenAdv = function (options) {
      var cb = (options && options.callbacks) || {};
      var now = Date.now();
      if (FLOOR_MS > 0 && lastShownAt && now - lastShownAt < FLOOR_MS) {
        var remain = Math.ceil((FLOOR_MS - (now - lastShownAt)) / 1000);
        console.info('[ad-floor] 距上次插屏 ' + Math.round((now - lastShownAt) / 1000) + 's，跳过本次（还差 ' + remain + 's）');
        try { if (cb.onClose) cb.onClose(false); } catch (e) { /* ignore */ }
        return undefined;
      }
      var proxy = {
        callbacks: {
          onOpen: function () {
            lastShownAt = Date.now();
            if (cb.onOpen) cb.onOpen();
          },
          onClose: function (wasShown) {
            if (wasShown) lastShownAt = Date.now();
            if (cb.onClose) cb.onClose(wasShown);
          },
          onError: function (e) {
            if (cb.onError) cb.onError(e);
          },
        },
      };
      return orig.call(sdk.adv, proxy);
    };
    sdk.adv.__adFloorWrapped = true;
    console.info('[ad-floor] 插屏最小间隔 ' + (FLOOR_MS / 1000) + 's 已生效（advFloor=0 可关闭）');
    return sdk;
  }

  var Y = window.YaGames;
  if (!Y || typeof Y.init !== 'function') {
    console.warn('[ad-floor] 没找到 YaGames.init，节奏限制未安装');
    return;
  }
  var origInit = Y.init;
  Y.init = function () {
    return origInit.apply(this, arguments).then(function (sdk) { return wrap(sdk); });
  };
})();

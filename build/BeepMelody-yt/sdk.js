(function () {
  "use strict";
  // Yandex Games 本地兼容层，覆盖本游戏使用的存档、广告和生命周期能力。
  function readData() {
    try { return JSON.parse(localStorage.getItem("__local_yandex_data__") || "{}"); }
    catch (_error) { return {}; }
  }
  var player = {
    getData: function () { return Promise.resolve(readData()); },
    setData: function (value) { localStorage.setItem("__local_yandex_data__", JSON.stringify(value || {})); return Promise.resolve(); }
  };
  window.YaGames = { init: function () { return Promise.resolve({
    environment: { i18n: { lang: "en", tld: "com" } },
    features: { LoadingAPI: { ready: function () {} }, GameplayAPI: { start: function () {}, stop: function () {} } },
    adv: {
      showFullscreenAdv: function (options) { setTimeout(function () { options.callbacks.onClose(false); }, 0); },
      showRewardedVideo: function (options) { setTimeout(function () {
        if (options.callbacks.onRewarded) options.callbacks.onRewarded();
        if (options.callbacks.onClose) options.callbacks.onClose();
      }, 0); }
    },
    getPlayer: function () { return Promise.resolve(player); }, on: function () {}, off: function () {}
  }); } };
})();

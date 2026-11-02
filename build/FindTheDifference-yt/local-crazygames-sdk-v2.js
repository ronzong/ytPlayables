(function () {
  "use strict";
  // CrazyGames v2 本地兼容层：广告立即结束，游戏流程继续，存档仍使用 localStorage。
  function finish(callbacks) {
    if (callbacks && typeof callbacks.adStarted === "function") callbacks.adStarted();
    setTimeout(function () {
      if (callbacks && typeof callbacks.adFinished === "function") callbacks.adFinished();
    }, 0);
  }
  window.CrazyGames = window.CrazyGames || {};
  window.CrazyGames.SDK = {
    ad: { requestAd: function (_type, callbacks) { finish(callbacks); } },
    banner: {
      requestResponsiveBanner: function () { return Promise.resolve(); },
      requestBanner: function () { return Promise.resolve(); },
      clearBanner: function () {}, clearAllBanners: function () {}
    },
    game: {
      gameplayStart: function () {}, gameplayStop: function () {},
      sdkGameLoadingStart: function () {}, sdkGameLoadingStop: function () {}
    }
  };
})();

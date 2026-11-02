// 本地单机版 Poki 兼容层：仅提供 Construct 入口会调用的方法。
(function () {
    window.PokiSDK = window.PokiSDK || {
        gameLoadingFinished: function () {},
        gameplayStart: function () {},
        gameplayStop: function () {},
        rewardedBreak: function () { return Promise.resolve(false); },
        commercialBreak: function () { return Promise.resolve(); }
    };
})();

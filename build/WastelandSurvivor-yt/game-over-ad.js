/* 游戏结算插屏：胜利、失败、暂停退出都会进入 SettleView。 */
(function () {
    'use strict';

    var attempts = 0;
    var timer = setInterval(function () {
        attempts++;
        try {
            if (typeof window.__require !== 'function') return stopIfExpired();

            var popupModule = window.__require('PopupManager');
            var assetsModule = window.__require('AssetsMap');
            var manager = popupModule && popupModule.PopupManager && popupModule.PopupManager.instance;
            var assets = assetsModule && assetsModule.AssetsMap;
            var settleView = assets && assets.PopUpBundles && assets.PopUpBundles.prefabs &&
                assets.PopUpBundles.prefabs.assetsList.SettleView;

            if (!manager || !settleView || typeof manager.open !== 'function') return stopIfExpired();
            if (manager.__xiaomiGameOverAdPatched) {
                clearInterval(timer);
                return;
            }

            var originalOpen = manager.open;
            manager.open = function (viewPath, params, callbacks) {
                var result = originalOpen.apply(this, arguments);
                var now = Date.now();
                if (viewPath === settleView && (!this.__lastGameOverAdAt || now - this.__lastGameOverAdAt > 3000)) {
                    this.__lastGameOverAdAt = now;
                    console.log('[ad] game over interstitial requested');
                    if (typeof window.showInterstitialAdAsync === 'function') {
                        window.showInterstitialAdAsync().catch(function (error) {
                            console.warn('[ad] game over interstitial failed', error);
                        });
                    }
                }
                return result;
            };
            manager.__xiaomiGameOverAdPatched = true;
            clearInterval(timer);
            console.log('[ad] game over interstitial hook installed');
        } catch (error) {
            stopIfExpired();
        }
    }, 250);

    function stopIfExpired() {
        if (attempts >= 480) {
            clearInterval(timer);
            console.warn('[ad] game over interstitial hook was not installed');
        }
    }
})();

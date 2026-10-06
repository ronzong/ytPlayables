/* 游戏加载页关闭时，通知 VolanSdk 游戏已准备完成。 */
(function () {
    'use strict';

    var attempts = 0;
    var timer = setInterval(function () {
        attempts++;

        try {
            if (typeof window.__require !== 'function') return stopIfExpired();

            var uiModule = window.__require('UIManager');
            var UIManager = uiModule && (uiModule.UIManager || uiModule.default);
            if (!UIManager || !UIManager.prototype || typeof UIManager.prototype.removeLoadingView !== 'function') {
                return stopIfExpired();
            }

            var originalRemoveLoadingView = UIManager.prototype.removeLoadingView;
            UIManager.prototype.removeLoadingView = function () {
                var result = originalRemoveLoadingView.apply(this, arguments);
                console.log('[VolanSdk] game loading view finished');
                if (window.VolanSdk && typeof window.VolanSdk.gameLoadingFinished === 'function') {
                    window.VolanSdk.gameLoadingFinished();
                }
                return result;
            };

            clearInterval(timer);
            console.log('[VolanSdk] loading finish hook installed');
        } catch (error) {
            stopIfExpired();
        }
    }, 10);

    function stopIfExpired() {
        // 最多等待 2 分钟，避免异常页面永久轮询。
        if (attempts >= 12000) {
            clearInterval(timer);
            console.warn('[VolanSdk] game loading finish hook timed out');
        }
    }
})();

/*
 * RewardView 中金币和钻石的 SpriteFrame 元数据偶发反序列化失败。
 * 两个图标实际位于同一张 public 图集，直接加载图集并裁切，绕过 import JSON。
 */
(function () {
    'use strict';

    var attempts = 0;
    var timer = setInterval(function () {
        attempts++;
        try {
            if (typeof window.__require !== 'function') return stopIfExpired();

            var loaderModule = window.__require('AssetsLoader');
            var Loader = loaderModule && loaderModule.default;
            if (!Loader || !Loader.prototype) return stopIfExpired();
            if (Loader.prototype.__rewardIconFixed) {
                clearInterval(timer);
                return;
            }

            var originalLoadRes = Loader.prototype.loadRes;
            var iconRects = {
                '/textures/gem/jinbi': cc.rect(689, 146, 40, 38),
                '/textures/gem/zuanshi': cc.rect(757, 215, 47, 39),
            };
            var atlasPromise = null;

            function loadRewardAtlas() {
                if (atlasPromise) return atlasPromise;
                atlasPromise = new Promise(function (resolve, reject) {
                    var version = window.__ASSET_BUILD_VERSION || 'reward-icons-v1';
                    var url = 'assets/public/native/1b/1b88ee642.png?__asset_v=' + encodeURIComponent(version);
                    cc.assetManager.loadRemote(url, { ext: '.png' }, function (error, texture) {
                        if (error || !texture) {
                            atlasPromise = null;
                            reject(error || new Error('Reward icon atlas is unavailable'));
                            return;
                        }
                        resolve(texture);
                    });
                });
                return atlasPromise;
            }

            Loader.prototype.loadRes = function (bundleName, paths, assetType, progress, complete, finish) {
                var path = paths && paths.length === 1 ? paths[0] : null;
                var rect = bundleName === 'public' && assetType === cc.SpriteFrame && iconRects[path];
                if (!rect) return originalLoadRes.apply(this, arguments);

                loadRewardAtlas().then(function (texture) {
                    var frame = new cc.SpriteFrame(texture, rect);
                    complete && complete(null, [frame]);
                    finish && finish(null, [frame]);
                }).catch(function (error) {
                    console.warn('[reward-icon-fix] atlas fallback failed', error);
                    originalLoadRes.call(Loader.instance, bundleName, paths, assetType, progress, complete, finish);
                });
            };

            Loader.prototype.__rewardIconFixed = true;
            clearInterval(timer);
            console.log('[reward-icon-fix] coin and diamond icons patched');
        } catch (error) {
            stopIfExpired();
        }
    }, 100);

    function stopIfExpired() {
        if (attempts >= 600) {
            clearInterval(timer);
            console.warn('[reward-icon-fix] AssetsLoader was not patched');
        }
    }
})();

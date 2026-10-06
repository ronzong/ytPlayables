/*!
 * Wasteland Survivor 广告入口（构建时**替换** local-game/ad.js）
 *
 * 原 ad.js 是本地广告模拟（默认失败、ads=mock 才成功），会上线会被判“平台外广告/模拟广告”，
 * 这里只保留它与游戏、页面之间的契约：
 *   window.showInterstitialAdAsync / showRewardedAdAsync / showInterstitialAd / showRewardedAd
 * 实际实现由 sdk.js（platform/wasteland-volan-yt.js）接到 ytgame.ads 上。
 *
 * 本文件同时负责把 FBInstant 的广告接口对齐（若 FBInstant 已由 fb-mock 的替代品建好则无需处理）。
 */
(function () {
  'use strict';

  var P = window.__ytPlayables;
  var TAG = '[wasteland-ad]';
  if (!P) {
    console.error(TAG + ' 缺少 platform/lib/yt-runtime.js');
    return;
  }

  // 兜底：万一 sdk.js 里的定义被别的东西覆盖了，这里补回来
  if (typeof window.showInterstitialAdAsync !== 'function') {
    window.showInterstitialAdAsync = function () { return P.ads.showInterstitial(); };
  }
  if (typeof window.showRewardedAdAsync !== 'function') {
    window.showRewardedAdAsync = function () {
      return P.ads.showRewarded('wasteland-rewarded-video').then(function (rewarded) {
        if (!rewarded) throw { code: 'USER_INPUT', message: '广告未看完' };
        return true;
      });
    };
  }
  if (typeof window.showInterstitialAd !== 'function') {
    window.showInterstitialAd = function (done) {
      window.showInterstitialAdAsync().then(function () { done && done(); }, function () { done && done(); });
    };
  }
  if (typeof window.showRewardedAd !== 'function') {
    window.showRewardedAd = function (done, fail) {
      window.showRewardedAdAsync().then(function () { done && done(); }, function (e) { fail && fail(e); });
    };
  }

  // 如果 FBInstant 已经存在但缺广告接口（例如被别的脚本覆盖过），补上
  var F = window.FBInstant;
  if (F && typeof F.getInterstitialAdAsync !== 'function') {
    F.getInterstitialAdAsync = function () {
      return Promise.resolve({ loadAsync: function () { return Promise.resolve(); }, showAsync: window.showInterstitialAdAsync });
    };
  }
  if (F && typeof F.getRewardedVideoAsync !== 'function') {
    F.getRewardedVideoAsync = function () {
      return Promise.resolve({ loadAsync: function () { return Promise.resolve(); }, showAsync: window.showRewardedAdAsync });
    };
  }

  console.log(TAG + ' 广告入口已接到 YouTube Playables SDK（无本地模拟）');
})();

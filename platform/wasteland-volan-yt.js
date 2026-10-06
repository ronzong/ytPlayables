/*!
 * Wasteland Survivor YouTube Playables 适配层（构建时**替换** local-game/sdk.js）
 *
 * 本文件由构建脚本拼在 platform/lib/yt-runtime.js 后面一起写成 sdk.js，
 * 运行时能力（可见性屏蔽 / 暂停闸门 / 音频 / 输入 / 网络 / 内存存储 / 云存档 / 广告）都在 runtime 里，
 * 这里只做“游戏原来的平台面 → ytgame”的映射：
 *
 *   VolanSdk.initVolan()        -> 读 ytgame.system.getLanguage()，把语言填进 GAME_LANGUAGE
 *   VolanSdk.yandexReady()      -> ytgame.game.gameReady()（游戏加载界面关闭后由页面调用）
 *   VolanSdk.showRewarded/...   -> ytgame.ads（激励只有 resolve(true) 才回调成功）
 *   window.showInterstitialAdAsync / showRewardedAdAsync / showInterstitialAd / showRewardedAd
 *                               -> 同上（原 ad.js 的本地模拟入口在这里换成真广告）
 *   存储                        -> cc.sys.localStorage 顶到内存存储（window.localStorage 被平台置为 null）
 *
 * 注意：SDK（https://www.youtube.com/game_api/v1）必须是 index.html 的第一个 <script>，且不带 async/defer。
 */
(function () {
  'use strict';

  var P = window.__ytPlayables;
  var TAG = '[wasteland-yt]';
  if (!P) {
    console.error(TAG + ' 缺少 platform/lib/yt-runtime.js（构建脚本拼接顺序错了）');
    return;
  }

  function log() {
    try {
      var a = Array.prototype.slice.call(arguments);
      a.unshift(TAG);
      console.log.apply(console, a);
    } catch (_e) { /* ignore */ }
  }

  // 游戏进度键（与 local-game/remote-player-save.js 的白名单一致，另加 FBInstant 玩家数据）
  var SAVE_KEYS = [
    'PACK_INFO', 'EQUIPMENT_INFO', 'GEM_LIST_INFO', 'LEVEL_RECORD', 'COIN',
    'SKILL_BOOKS', 'SKILL_STORE', 'EQUIP_BOOKS', 'UPGRADE_STONE', 'GRADE_INFO',
    'POWER', 'DIAMOND', 'BOX_REWARD_RECORD', 'SHOP_RES_REFRESH_TIME',
    'SHOP_RES_RECORD', 'SHOP_DIAMOND_RECORD', 'TAKS_RECORD', 'TASK_TIME',
    'ONLINE_RECORD', 'SKIN_INFO', 'SKINS', 'GUN_SKINS', 'ROBOT_SKINS',
    'EQUIPMENT_ORDER', 'EGG_RECORD', 'HEAD_INDEX', 'SIGN', 'SWEEP', 'MEDIAS',
    'SPEED_RECORD', 'NEW_UNLOCK_EGG_LIST', 'ISGUIDE', 'MEDIAS_VOL', 'AD_COIN',
    'EXCHANGE_RECORD', 'BOX_VIDEO_RECORD', 'RANK_DATA', 'WEEK_CARD',
    'user_open_id', 'isEnc',
    'YT_FB_PLAYER_DATA',
  ];

  // 引擎因为 window.localStorage 为 null 会退回空实现，这里在 cc.sys 出现后立刻换成内存存储
  P.bindEngineStorage();

  function showInterstitial() {
    return P.ads.showInterstitial().then(function () {
      return true;
    });
  }
  function showRewarded() {
    return P.ads.showRewarded('wasteland-rewarded-video').then(function (rewarded) {
      if (!rewarded) throw { code: 'USER_INPUT', message: '广告未看完' };
      return true;
    });
  }

  /* ---------------- 广告全局函数（替代原 ad.js 的本地模拟） ---------------- */
  window.showInterstitialAdAsync = showInterstitial;
  window.showRewardedAdAsync = showRewarded;
  window.showInterstitialAd = function (done) {
    showInterstitial().then(function () { done && done(); }, function () { done && done(); });
  };
  window.showRewardedAd = function (done, fail) {
    showRewarded().then(function () { done && done(); }, function (error) { fail && fail(error); });
  };

  /* ---------------- VolanSdk ---------------- */
  var VolanSdk = {
    GAME_LANGUAGE: 'en',
    GAME_YD_APPID: '587674',
    GAME_NAME: 'mj-dreambattle',
    initVolan: function () {
      return P.system.getLanguage().then(function (tag) {
        // 游戏自己会把含 "zh" 的语言映射到 tw，其它都落回 en（见 game_script 的 language/<Locate> 逻辑）
        var lang = String(tag || 'en').toLowerCase();
        VolanSdk.GAME_LANGUAGE = lang || 'en';
        log('初始化完成 lang =', VolanSdk.GAME_LANGUAGE, ' SDK 版本 =', (window.ytgame && window.ytgame.SDK_VERSION) || '');
        return undefined;
      });
    },
    yandexReady: function () {
      P.system.gameReady();
      // 此时引擎与游戏代码都已加载完，能统计到最终的屏蔽数量
      log(
        '已屏蔽 Page Visibility 类事件注册数 =', P.getVisibilityBlockedCount(),
        '；已拦截外部请求数 =', P.getBlockedExternalRequests().length
      );
    },
    showRewarded: function (ok, fail) {
      showRewarded().then(function () { ok && ok(); }, function (error) { fail && fail(error); });
    },
    showInterstitial: function (ok) {
      showInterstitial().then(function () { ok && ok(); }, function () { ok && ok(); });
    },
    // 兼容旧 remote-player-save.js 的取值方式（本仓库已替换该文件，保留以防其它代码读取）
    YdPlayer: {
      getData: function () {
        return Promise.resolve(P.storage.__snapshot(SAVE_KEYS));
      },
      setData: function (data) {
        if (data && typeof data === 'object') P.storage.__restore(data);
        return P.save.flush(true);
      },
    },
  };
  window.VolanSdk = VolanSdk;

  // 本地 shim 里给 ad.js 用的调试对象，保持存在以免有代码读取
  window.__WASTELAND_LOCAL__ = {
    params: new URLSearchParams(location.search),
    debug: false,
    saveKeys: SAVE_KEYS.slice(),
    ytPlayables: true,
  };

  /* ---------------- Pause 时顺带停 Cocos 2.x 引擎与音频 ---------------- */
  P.pauseGate.onPauseChange(function (paused) {
    try {
      var cc = window.cc;
      if (!cc) return;
      if (paused) {
        if (cc.game && typeof cc.game.pause === 'function') cc.game.pause();
        if (cc.audioEngine && typeof cc.audioEngine.pauseAll === 'function') cc.audioEngine.pauseAll();
      } else {
        if (cc.audioEngine && typeof cc.audioEngine.resumeAll === 'function') cc.audioEngine.resumeAll();
        if (cc.game && typeof cc.game.resume === 'function') cc.game.resume();
      }
    } catch (e) {
      console.warn(TAG + ' 暂停/恢复时操作 cc 失败', e);
    }
  });

  // 一上来就告诉平台“已经在画加载界面了”，保证 firstFrameReady 早于 gameReady
  P.system.firstFrameReady();

  log('Wasteland Survivor YouTube 适配层已注入（inPlayables =', P.inPlayables, '）');
})();

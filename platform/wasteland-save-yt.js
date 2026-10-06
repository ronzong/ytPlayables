/*!
 * Wasteland Survivor 云存档（构建时**替换** local-game/remote-player-save.js）
 *
 * 页面在启动流程里会先 `loadScript("remote-player-save.js")` 再 `window.RemotePlayerSave.init()`，
 * 因此这里保持同名文件与同名接口，但改成走 YouTube 云存档：
 *   - 恢复：ytgame.game.loadData() → 把白名单键写回内存存储（cc.sys.localStorage 指向它）
 *   - 保存：白名单键发生变化后节流上传；onPause 与 gameReady 时强制落盘
 *   - 不再使用 localStorage（Playables 环境里它是 null）
 */
(function () {
  'use strict';

  var P = window.__ytPlayables;
  var TAG = '[wasteland-save]';
  if (!P) {
    console.error(TAG + ' 缺少 platform/lib/yt-runtime.js');
    return;
  }

  // 与 local-game/remote-player-save.js 的白名单一致，另加 FBInstant 玩家数据
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

  var initPromise = null;

  window.RemotePlayerSave = {
    init: function () {
      if (initPromise) return initPromise;
      // 注意：这里传 null = 持久化**全部** storage 键。
      // 只同步固定白名单会导致“外壳/引导/首见”等状态每次重置，玩家每次进来都像新用户
      // （WastelandSurvivor 表现为 battle 页一直挂着新手引导遮罩，左上角按钮全被吞掉）。
      // SAVE_KEYS 仅作为参考清单保留。
      initPromise = P.save.init(null, { intervalMs: 5000 }).then(function (restored) {
        console.log(TAG + (restored ? ' 云存档已恢复（持久化全部键，参考清单 ' + SAVE_KEYS.length + ' 项）' : ' 无云存档，使用空存档'));
        // 首次进入没有云存档时，先写一份，保证平台上确实存在玩家存档
        return P.save.flush(true).then(function () {
          return true;
        });
      });
      return initPromise;
    },
    flush: function () {
      return P.save.flush(true);
    },
  };
})();

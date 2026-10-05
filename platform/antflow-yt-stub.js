/*!
 * 诊断用最小 YaGames 替身（不碰 window.ytgame）：
 * 用于把“游戏在测试套件里卡住”的原因区分为「Playables 环境/沙箱」还是「ytgame 适配层」。
 * 正式提交不要用这个文件。
 */
(function () {
  'use strict';
  var mem = {};
  var player = {
    getMode: function () {
      return 'lite';
    },
    isAuthorized: function () {
      return true;
    },
    getUniqueID: function () {
      return '';
    },
    getName: function () {
      return '';
    },
    getPhoto: function () {
      return '';
    },
    getData: function (keys) {
      var out = {};
      (keys || []).forEach(function (k) {
        if (Object.prototype.hasOwnProperty.call(mem, k)) out[k] = mem[k];
      });
      return Promise.resolve(keys ? out : JSON.parse(JSON.stringify(mem)));
    },
    setData: function (data) {
      Object.assign(mem, data || {});
      return Promise.resolve();
    },
    getStats: function () {
      return Promise.resolve({});
    },
    setStats: function () {
      return Promise.resolve();
    },
  };
  window.YaGames = {
    init: function () {
      console.log('[stub] YaGames.init');
      return Promise.resolve({
        environment: { i18n: { lang: 'en', tld: 'com' }, app: { id: 'stub' } },
        features: {
          LoadingAPI: {
            ready: function () {
              console.log('[stub] LoadingAPI.ready');
            },
          },
          GameplayAPI: { start: function () {}, stop: function () {} },
        },
        adv: {
          showFullscreenAdv: function (o) {
            setTimeout(function () {
              o.callbacks.onClose(true);
            }, 0);
          },
          showRewardedVideo: function (o) {
            setTimeout(function () {
              if (o.callbacks.onRewarded) o.callbacks.onRewarded();
              o.callbacks.onClose(true);
            }, 0);
          },
        },
        leaderboards: {
          setScore: function () {
            return Promise.resolve();
          },
          getEntries: function () {
            return Promise.reject(new Error('stub'));
          },
          getPlayerEntry: function () {
            return Promise.reject(new Error('stub'));
          },
        },
        getPlayer: function () {
          return Promise.resolve(player);
        },
        getFlags: function () {
          return Promise.resolve({});
        },
        on: function () {
          return function () {};
        },
        off: function () {},
        track: function () {},
      });
    },
  };
  console.log('[stub] YaGames 替身已注入');
})();

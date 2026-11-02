/*
 * Yandex Games SDK（YaGames）本地适配层。
 *
 * 目的：PlayHop/Yandex 系网页游戏在本机离线运行时，用这份实现顶掉原
 * `/sdk.js`（官方 SDK loader）。保持原 API 名称、返回 Promise/同步的差异与
 * 回调顺序，只把外部服务换成本地实现：
 *   - YaGames.init() → 本地 sdk 实例（可重复调用，返回同一实例）
 *   - environment.i18n.lang / environment.app.id
 *   - features.LoadingAPI.ready / features.GameplayAPI.start|stop
 *   - on()/off() 事件（game_api_pause / game_api_resume）
 *   - getPlayer()：getData/setData 落 window.__ytStorage，getMode/getName/getUniqueID/isAuthorized
 *     （单机版是"已授权的本地匿名玩家"，getName() 返回"本地玩家"，否则只绘制榜单的
 *     游戏会永远显示 anonymous）
 *   - getLeaderboards()/leaderboards：本地榜单，只存自己一条，但 rank/score/player/
 *     extraData/ranges/userRank 结构与线上一致；同时提供 v2（getEntries/setScore）与
 *     v1（getLeaderboardEntries/setLeaderboardScore/getDescription）两套接口名
 *   - adv：showFullscreenAdv / showRewardedVideo / 横幅（show/hide 会真的改变
 *     getBannerAdvStatus().stickyAdvIsShowing），按 ads 参数决定行为
 *   - getFlags()/getPayments()/feedback/auth：本地安全默认值（auth.openAuthDialog
 *     按"已完成授权"返回，本地没有登录流程）
 *
 * 调试参数：
 *   debug=1            本地 SDK 日志
 *   ads=off            默认；广告不可用，激励不发奖
 *   ads=mock&adsSec=N  弹出模拟广告遮罩，倒计时结束才算看完；中途关闭不发奖
 *   ads=instant        立即成功（本地测试用）；nofill=1 优先无填充
 *   lang=xx            覆盖环境语言（默认取浏览器语言）
 */
(function () {
  'use strict';

  if (window.YaGames && window.YaGames.__localYandexSdk) return;

  var params = new URLSearchParams(location.search || '');
  var DEBUG = params.get('debug') === '1';
  var ADS_MODE = (params.get('ads') || 'off').toLowerCase();
  var NOFILL = params.get('nofill') === '1';
  var adsSecRaw = parseInt(params.get('adsSec') || '3', 10);
  var ADS_SEC = isNaN(adsSecRaw) ? 3 : Math.max(0, Math.min(30, adsSecRaw));
  var LANG = (params.get('lang') || (navigator.language || 'en').slice(0, 2)).toLowerCase();
  var APP_ID = params.get('appId') || 'local';

  var LS = 'ysdk_local:';

  function log() {
    if (DEBUG) console.info.apply(console, ['[YaGames-local]'].concat([].slice.call(arguments)));
  }

  function readJson(key, fallback) {
    try {
      var raw = window.__ytStorage.getItem(LS + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }
  function writeJson(key, value) {
    try {
      window.__ytStorage.setItem(LS + key, JSON.stringify(value));
    } catch (e) {
      /* ignore */
    }
  }

  // ---------------------------------------------------------------- 广告遮罩
  var overlay = null;
  function ensureOverlay() {
    if (overlay) return overlay;
    var box = document.createElement('div');
    box.id = 'ysdk-local-ad-overlay';
    box.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:2147483647', 'display:none',
      'align-items:center', 'justify-content:center', 'flex-direction:column',
      'background:rgba(6,10,20,.92)', 'color:#e8f1ff',
      'font:600 18px/1.6 system-ui,Segoe UI,sans-serif', 'text-align:center',
    ].join(';');
    var title = document.createElement('div');
    title.id = 'ysdk-local-ad-title';
    var count = document.createElement('div');
    count.id = 'ysdk-local-ad-count';
    count.style.cssText = 'font-size:44px;margin:14px 0';
    var btn = document.createElement('button');
    btn.id = 'ysdk-local-ad-close';
    btn.textContent = '关闭';
    btn.style.cssText =
      'padding:10px 26px;border:0;border-radius:8px;cursor:pointer;font:600 16px system-ui;background:#3d7fff;color:#fff';
    box.appendChild(title);
    box.appendChild(count);
    box.appendChild(btn);
    (document.body || document.documentElement).appendChild(box);
    overlay = box;
    return box;
  }

  /**
   * 统一的广告流程执行器。
   * @param {object} cb 回调集合：onOpen/onClose(wasShown)/onRewarded/onError
   * @param {'rewarded'|'fullscreen'} type
   */
  function runAd(cb, type) {
    cb = cb || {};
    function ok() {
      if (cb.onOpen) safe(cb.onOpen);
      if (type === 'rewarded') {
        if (cb.onRewarded) safe(cb.onRewarded);
        if (cb.onClose) safe(cb.onClose, true);
      } else if (cb.onClose) {
        safe(cb.onClose, true);
      }
    }
    if (NOFILL || ADS_MODE === 'off') {
      window.__ytGameTimers.setTimeout(function () {
        if (cb.onError) safe(cb.onError, { code: NOFILL ? 'NO_FILL' : 'ADS_DISABLED' });
      }, 0);
      return;
    }
    if (ADS_MODE === 'instant') {
      window.__ytGameTimers.setTimeout(ok, 0);
      return;
    }
    // mock：真实遮罩 + 倒计时，中途关闭不发奖
    if (cb.onOpen) safe(cb.onOpen);
    var box = ensureOverlay();
    box.querySelector('#ysdk-local-ad-title').textContent =
      type === 'rewarded' ? '广告播放中（激励）' : '广告播放中（插屏）';
    var countEl = box.querySelector('#ysdk-local-ad-count');
    var closeBtn = box.querySelector('#ysdk-local-ad-close');
    var left = ADS_SEC;
    countEl.textContent = String(left);
    box.style.display = 'flex';
    var done = false;
    var finished = false;
    var timer = window.__ytGameTimers.setInterval(function () {
      left -= 1;
      countEl.textContent = String(Math.max(0, left));
      if (left <= 0) {
        window.__ytGameTimers.clearInterval(timer);
        finished = true;
        if (type === 'rewarded' && cb.onRewarded) safe(cb.onRewarded);
        if (cb.onClose) safe(cb.onClose, true);
        box.style.display = 'none';
      }
    }, 1000);
    closeBtn.onclick = function () {
      if (done) return;
      done = true;
      window.__ytGameTimers.clearInterval(timer);
      box.style.display = 'none';
      if (finished) return; // 已按看完处理
      if (cb.onClose) safe(cb.onClose, false); // 中途关闭：不算失败但不发奖
    };
    if (ADS_SEC === 0) {
      window.__ytGameTimers.clearInterval(timer);
      finished = true;
      box.style.display = 'none';
      if (type === 'rewarded' && cb.onRewarded) safe(cb.onRewarded);
      if (cb.onClose) safe(cb.onClose, true);
    }
  }

  function safe(fn, arg) {
    try {
      fn(arg);
    } catch (e) {
      log('callback error', e);
    }
  }

  // ---------------------------------------------------------------- 事件
  var listeners = {};
  function on(evt, fn) {
    (listeners[evt] = listeners[evt] || []).push(fn);
  }
  function off(evt, fn) {
    var arr = listeners[evt];
    if (!arr) return;
    var i = arr.indexOf(fn);
    if (i >= 0) arr.splice(i, 1);
  }
  function emit(evt, payload) {
    (listeners[evt] || []).slice().forEach(function (fn) {
      safe(fn, payload);
    });
  }
  // 页面可见性变化映射成平台的暂停/恢复事件（与 Yandex 语义一致）
  document.addEventListener('visibilitychange', function () {
    emit(document.visibilityState === 'visible' ? 'game_api_resume' : 'game_api_pause');
  });

  // ---------------------------------------------------------------- 玩家
  var PLAYER_KEY = 'player-data';
  var playerData = readJson(PLAYER_KEY, {});

  // 本地视为"已授权"的匿名玩家：云端榜单/昵称在单机离线环境没有对应能力，
  // 但提供稳定的本地身份，才能让依赖 player.getName()/getUniqueID() 的
  // 界面（排行榜、昵称显示）正常出内容。历史实现返回 false + 空名字，
  // 会让 deeeep.io 这种自己绘制榜单的游戏永远只显示 anonymous。
  var LOCAL_PLAYER_NAME = '本地玩家';

  function makePlayer() {
    return {
      getData: function (keys) {
        if (keys === undefined) return Promise.resolve(JSON.parse(JSON.stringify(playerData)));
        if (Array.isArray(keys)) {
          var out = {};
          keys.forEach(function (k) {
            if (Object.prototype.hasOwnProperty.call(playerData, k)) out[k] = playerData[k];
          });
          return Promise.resolve(out);
        }
        return Promise.resolve(playerData[keys] === undefined ? null : playerData[keys]);
      },
      setData: function (obj, flush) {
        Object.keys(obj || {}).forEach(function (k) {
          playerData[k] = obj[k];
        });
        writeJson(PLAYER_KEY, playerData);
        return Promise.resolve();
      },
      getMode: function () {
        return 'lite';
      },
      getName: function () {
        return LOCAL_PLAYER_NAME;
      },
      getUniqueID: function () {
        var id = readJson('player-id', null);
        if (!id) {
          id = 'local-' + Math.random().toString(36).slice(2, 10);
          writeJson('player-id', id);
        }
        return id;
      },
      getPhoto: function () {
        return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
      },
      // 本地是匿名身份：真实 Yandex 环境里 isAuthorized() 只在已登录时为真，
      // 但单机版没有"未登录"这个可用状态（未登录就拿不到玩家数据），
      // 因此这里按"本地玩家"返回真，保持 getData/setData 可用。
      isAuthorized: function () {
        return true;
      },
      getPayingStatus: function () {
        return 'unknown';
      },
      getStats: function () {
        return Promise.resolve(copy(leaderboardStats));
      },
      setStats: function (stats) {
        Object.keys(stats || {}).forEach(function (k) {
          leaderboardStats[k] = stats[k];
        });
        writeJson('player-stats', leaderboardStats);
        return Promise.resolve();
      },
      incrementStats: function (stats) {
        Object.keys(stats || {}).forEach(function (k) {
          var cur = Number(leaderboardStats[k] || 0);
          leaderboardStats[k] = cur + Number(stats[k] || 0);
        });
        writeJson('player-stats', leaderboardStats);
        return Promise.resolve();
      },
      getAvatarSrc: function () {
        return Promise.resolve('');
      },
      scopePermissions: { public_name: 'allow' },
      publicName: LOCAL_PLAYER_NAME,
    };
  }

  function copy(obj) {
    return JSON.parse(JSON.stringify(obj || {}));
  }

  // ---------------------------------------------------------------- 排行榜
  // 支持两套接口名（与官方 SDK 一致）：
  //   v2: getEntries/getPlayerEntry/setScore/getLeaderboard
  //   v1: getLeaderboardEntries/setLeaderboardScore/getDescription/getPlayerEntry
  // 本地榜单只存自己一条，但结构（rank/score/player/extraData/ranges/userRank）
  // 与线上一致，依赖它的界面不会因为字段缺失而崩。
  var localScores = readJson('leaderboard', {});
  var leaderboardStats = readJson('player-stats', {});

  function myEntry(name) {
    var rec = localScores[name];
    var score = rec ? rec.score : 0;
    var player = makePlayer();
    return { score: score, rank: 1, player: player, extraData: rec ? rec.extraData || '' : '' };
  }

  function entriesResult(name, opts) {
    opts = opts || {};
    var rec = localScores[name];
    if (!rec) return { entries: [], userRank: 0, ranges: [] };
    var me = myEntry(name);
    // 本地只有自己一条：自己就在 top 里，不要再按 quantityAround 追加一遍
    // （否则榜单界面会出现两条一模一样的记录）。
    return { entries: [me], userRank: 1, ranges: [] };
  }

  function setScore(name, score, extraData) {
    localScores[name] = {
      score: score,
      extraData: extraData === undefined || extraData === null ? '' : String(extraData),
      updatedAt: Date.now(),
    };
    writeJson('leaderboard', localScores);
    return Promise.resolve();
  }

  var leaderboardApi = {
    // v2
    getLeaderboard: function (name) {
      return Promise.resolve({
        name: name,
        title: name,
        description: { invert_sort_order: false, score_format: { options: { decimal_offset: 0 } }, type: 'numeric' },
        default: true,
      });
    },
    getPlayerEntry: function (name) {
      return Promise.resolve(localScores[name] ? myEntry(name) : { score: 0, rank: 0, player: makePlayer(), extraData: '' });
    },
    setScore: setScore,
    getEntries: function (name, opts) {
      return Promise.resolve(entriesResult(name, opts));
    },
    // v1（旧接口名，deeeep.io 等老构建在用）
    setLeaderboardScore: function (name, score, extraData) {
      return setScore(name, score, extraData);
    },
    getLeaderboardEntries: function (name, opts) {
      return Promise.resolve(entriesResult(name, opts));
    },
    getDescription: function (name) {
      return Promise.resolve({
        default: true,
        description: {
          invert_sort_order: false,
          score_format: { options: { decimal_offset: 0 } },
          type: 'numeric',
          name: name,
        },
      });
    },
  };

  // ---------------------------------------------------------------- 广告对象
  // 横幅状态要真的跟着 show/hide 变：官方 SDK 里 showBannerAdv() 之后
  // getBannerAdvStatus() 返回 stickyAdvIsShowing=true，而
  // PluginYG2 的 StickyAdActivity() 依赖这个状态决定后续 hide 分支。
  var bannerShowing = false;
  var bannerReason = 'local';
  var adv = {
    showFullscreenAdv: function (opts) {
      runAd(opts && opts.callbacks, 'fullscreen');
    },
    showRewardedVideo: function (opts) {
      runAd(opts && opts.callbacks, 'rewarded');
    },
    getBannerAdvStatus: function () {
      // 合并结论（2026-09-29 处理 pull 冲突）：
      //   - 保留上游的要点：**不返回 reason**。本地横幅是"可用的空实现"，
      //     showBannerAdv/hideBannerAdv 都会成功 resolve，按 Yandex 语义 reason 只在
      //     无法展示时出现；带上 reason 会让 mirraSDK 一类集成把它当失败，打 console.error
      //     并把横幅标成未就绪（SaveThePuppy 实测）。
      //   - 保留本地的要点：stickyAdvIsShowing 要反映 show/hide 的真实状态，
      //     PluginYG2 的 StickyAdActivity() 依赖它决定后续分支（Dominators/CrazyOffice 在用）。
      var status = { stickyAdvIsShowing: bannerShowing };
      // 仅在"确实无法展示"（未展示过、且带有不可用原因）时补 reason，展示中不带。
      if (!bannerShowing && bannerReason) status.reason = bannerReason;
      return Promise.resolve(status);
    },
    showBannerAdv: function () {
      bannerShowing = true;
      bannerReason = 'local';
      log('showBannerAdv');
      return Promise.resolve();
    },
    hideBannerAdv: function () {
      bannerShowing = false;
      bannerReason = 'local';
      log('hideBannerAdv');
      return Promise.resolve();
    },
  };

  // ---------------------------------------------------------------- sdk 实例
  var sdk = {
    __localYandexSdk: true,
    environment: {
      i18n: { lang: LANG, tld: 'com' },
      app: { id: APP_ID },
      debug: DEBUG,
    },
    features: {
      LoadingAPI: {
        ready: function () {
          log('LoadingAPI.ready');
        },
        start: function () {},
      },
      GameplayAPI: {
        start: function () {
          log('GameplayAPI.start');
        },
        stop: function () {
          log('GameplayAPI.stop');
        },
      },
    },
    // 兼容两套命名：features2.GameplayAPI（部分构建）与 features.GameplayAPI
    on: on,
    off: off,
    adv: adv,
    auth: {
      // 本地没有登录流程：按"已完成授权"返回，让调用方走 LoggedIn 分支而不是错误分支。
      openAuthDialog: function () {
        log('auth.openAuthDialog');
        return Promise.resolve({ status: 'ok' });
      },
      openPersonalizationDialog: function () {
        return Promise.resolve();
      },
    },
    feedback: {
      canReview: function () {
        return Promise.resolve({ value: false, reason: 'local' });
      },
      requestReview: function () {
        return Promise.resolve({ feedbackSent: false });
      },
    },
    getPlayer: function () {
      return Promise.resolve(makePlayer());
    },
    getStorage: function () {
      var api = {
        get: function (key) {
          return Promise.resolve(readJson('storage', {})[key] === undefined ? null : readJson('storage', {})[key]);
        },
        set: function (key, value) {
          var all = readJson('storage', {});
          all[key] = value;
          writeJson('storage', all);
          return Promise.resolve();
        },
        getStats: function () {
          return Promise.resolve({});
        },
        setStats: function () {
          return Promise.resolve();
        },
        incrementStats: function () {
          return Promise.resolve();
        },
      };
      return Promise.resolve(api);
    },
    getFlags: function () {
      return Promise.resolve(readJson('flags', {}));
    },
    getPayments: function () {
      return Promise.resolve({
        getCatalog: function () {
          return Promise.resolve([]);
        },
        getPurchases: function () {
          return Promise.resolve([]);
        },
        purchase: function () {
          return Promise.resolve({});
        },
        consumePurchase: function () {
          return Promise.resolve({});
        },
      });
    },
    getLeaderboards: function () {
      return Promise.resolve({
        getLeaderboard: leaderboardApi.getLeaderboard,
        getPlayerEntry: leaderboardApi.getPlayerEntry,
        setScore: leaderboardApi.setScore,
        getEntries: leaderboardApi.getEntries,
        setLeaderboardScore: leaderboardApi.setLeaderboardScore,
        getLeaderboardEntries: leaderboardApi.getLeaderboardEntries,
        getDescription: leaderboardApi.getDescription,
      });
    },
    // 部分集成（mirra SDK、老构建）直接访问 sdk.leaderboards 而不是 getLeaderboards()
    leaderboards: leaderboardApi,
    getProductCatalog: function () {
      return Promise.resolve([]);
    },
    getPurchases: function () {
      return Promise.resolve([]);
    },
    screen: {
      fullscreen: {
        request: function () {
          var el = document.documentElement;
          if (el.requestFullscreen) el.requestFullscreen().catch(function () {});
          return Promise.resolve();
        },
        exit: function () {
          if (document.exitFullscreen && document.fullscreenElement) document.exitFullscreen().catch(function () {});
          return Promise.resolve();
        },
        status: 'off',
      },
    },
    isAvailableMethod: function () {
      return Promise.resolve(true);
    },
  };

  sdk.features2 = sdk.features; // 兼容 ah 适配层里读的 features2.GameplayAPI

  window.YaGames = {
    __localYandexSdk: true,
    init: function () {
      log('YaGames.init');
      return Promise.resolve(sdk);
    },
    deviceInfo: { type: 'desktop', isMobile: function () { return false; } },
  };

  log('Yandex 本地 SDK 就绪（ads=' + ADS_MODE + '，lang=' + LANG + '）');
})();

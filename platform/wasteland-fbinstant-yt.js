/*!
 * Wasteland Survivor 的 FBInstant 兼容层（构建时**替换** local-game/fb-mock.js）
 *
 * 游戏逻辑用的是 Facebook Instant Games 风格的接口（玩家数据、广告、内购、社区、锦标赛…）。
 * 这里按 YouTube 的规则重新实现：
 *   - 玩家数据  -> 与云存档同一份内存存储（键 YT_FB_PLAYER_DATA），随云存档一起持久化
 *   - 广告      -> ytgame.ads（激励只有 resolve(true) 才算完成，否则 reject USER_INPUT）
 *   - 内购      -> 不支持（getSupportedAPIs 里不列出 payments.*，游戏会自动隐藏/跳过内购）
 *   - 社区/锦标赛/快捷方式/邀请/分享 -> 静默不可用（can* 返回 false，其它 resolve，避免未捕获的 rejection）
 *   - getPlatform() -> 'WEB'（游戏据此关闭震动等移动端行为）
 *
 * 注意：字符串常量保持与 FBInstant 一致，方便游戏里 `getSupportedAPIs().includes(...)` 判断。
 */
(function () {
  'use strict';

  var P = window.__ytPlayables;
  var TAG = '[wasteland-fb]';
  if (!P) {
    console.error(TAG + ' 缺少 platform/lib/yt-runtime.js');
    return;
  }

  var PLAYER_DATA_KEY = 'YT_FB_PLAYER_DATA';
  var PLAYER_ID = 'yt_playables_player';
  var SUPPORTED_APIS = [
    'getPlatform',
    'player.getID',
    'player.getName',
    'player.getDataAsync',
    'player.setDataAsync',
    'getInterstitialAdAsync',
    'getRewardedVideoAsync',
  ];

  function log() {
    try {
      var a = Array.prototype.slice.call(arguments);
      a.unshift(TAG);
      console.log.apply(console, a);
    } catch (_e) { /* ignore */ }
  }
  function resolve(v) { return Promise.resolve(v); }
  function reject(code, message) { return Promise.reject({ code: code, message: message || code }); }

  function readPlayerData() {
    try {
      return JSON.parse(P.storage.getItem(PLAYER_DATA_KEY) || '{}') || {};
    } catch (_e) {
      return {};
    }
  }
  function writePlayerData(next) {
    var data = readPlayerData();
    Object.keys(next || {}).forEach(function (k) {
      data[k] = next[k];
    });
    // 诊断：记录一次写入的键（帮助判断游戏把进度存在哪，便于映射 sendScore）
    var keys = Object.keys(next || {});
    var sig = keys.slice().sort().join(',');
    if (!writePlayerData.__logged) writePlayerData.__logged = Object.create(null);
    if (keys.length && !writePlayerData.__logged[sig]) {
      writePlayerData.__logged[sig] = true;
      log('player.setDataAsync 键 =', sig, '（值类型示例 =', typeof (next || {})[keys[0]], '）');
    }
    P.storage.setItem(PLAYER_DATA_KEY, JSON.stringify(data));
    return resolve();
  }

  function adInstance(request) {
    return {
      loadAsync: function () {
        return resolve();
      },
      showAsync: function () {
        return request();
      },
    };
  }

  var FBInstant = {
    getPlatform: function () {
      return 'WEB';
    },
    getSDKVersion: function () {
      return '7.0';
    },
    getSupportedAPIs: function () {
      return SUPPORTED_APIS.slice();
    },
    initializeAsync: function () {
      return resolve();
    },
    startGameAsync: function () {
      return resolve();
    },
    setLoadingProgress: function () {
      // YouTube 没有“加载进度”接口，这里只记录一次，避免刷日志
      if (!FBInstant.__progressLogged) {
        FBInstant.__progressLogged = true;
        log('setLoadingProgress 已被平台忽略（Playables 无对应接口）');
      }
      return undefined;
    },
    getEntryPointData: function () {
      return null;
    },
    getEntryPointAsync: function () {
      return resolve(null);
    },
    getInterstitialAdAsync: function () {
      return resolve(adInstance(function () {
        return P.ads.showInterstitial();
      }));
    },
    getRewardedVideoAsync: function () {
      return resolve(adInstance(function () {
        return P.ads.showRewarded('wasteland-rewarded-video').then(function (rewarded) {
          if (!rewarded) throw { code: 'USER_INPUT', message: '广告未看完' };
          return true;
        });
      }));
    },
    shareAsync: function () {
      return resolve();
    },
    updateAsync: function () {
      return resolve();
    },
    inviteAsync: function () {
      return resolve();
    },
    canCreateShortcutAsync: function () {
      return resolve(false);
    },
    createShortcutAsync: function () {
      return resolve();
    },
    canSwitchNativeGameAsync: function () {
      return resolve(false);
    },
    switchNativeGameAsync: function () {
      return resolve();
    },
    performHapticFeedbackAsync: function () {
      return resolve();
    },
    getTournamentAsync: function () {
      return reject('UNSUPPORTED', 'YouTube Playables 不支持锦标赛');
    },
    player: {
      getID: function () {
        return PLAYER_ID;
      },
      getName: function () {
        return 'Player';
      },
      getPhoto: function () {
        return '';
      },
      getASIDAsync: function () {
        return resolve(PLAYER_ID);
      },
      getDataAsync: function (keys) {
        var data = readPlayerData();
        var out = {};
        (keys || []).forEach(function (k) {
          out[k] = data[k];
        });
        return resolve(out);
      },
      setDataAsync: function (obj) {
        return writePlayerData(obj);
      },
      flushDataAsync: function () {
        return P.save.flush(true);
      },
      getConnectedPlayersAsync: function () {
        return resolve([]);
      },
      getStatsAsync: function () {
        return resolve({});
      },
      setStatsAsync: function () {
        return resolve();
      },
    },
    payments: {
      getCatalogAsync: function () {
        return reject('UNSUPPORTED', 'YouTube Playables 不支持应用内购买');
      },
      purchaseAsync: function () {
        return reject('UNSUPPORTED', 'YouTube Playables 不支持应用内购买');
      },
      getPurchasesAsync: function () {
        return resolve([]);
      },
      consumePurchaseAsync: function () {
        return resolve();
      },
      onReady: function () {},
    },
    community: {
      canFollowOfficialPageAsync: function () {
        return resolve(false);
      },
      followOfficialPageAsync: function () {
        return resolve();
      },
      canJoinOfficialGroupAsync: function () {
        return resolve(false);
      },
      joinOfficialGroupAsync: function () {
        return resolve();
      },
    },
    tournament: {
      createAsync: function () {
        return reject('UNSUPPORTED', 'YouTube Playables 不支持锦标赛');
      },
      postScoreAsync: function () {
        return resolve();
      },
      shareAsync: function () {
        return resolve();
      },
      getTournamentsAsync: function () {
        return resolve([]);
      },
    },
    context: {
      createAsync: function () {
        return reject('UNSUPPORTED', 'YouTube Playables 没有 FB 上下文');
      },
      getID: function () {
        return null;
      },
      switchAsync: function () {
        return reject('UNSUPPORTED', 'YouTube Playables 没有 FB 上下文');
      },
    },
  };

  window.FBInstant = FBInstant;
  log('FBInstant 兼容层已注入（内购/社区/锦标赛按平台规则关闭）');

  /* ------------------------------------------------------------------ *
   * 本地后端替身（原 fb-mock.js 里那段的等价实现）
   *
   * 游戏启动流程会请求 IP 探测接口，拿到返回的 hash 才继续（本地化时是原 mock 用
   * fetch/XHR 拦截伪造的）。YouTube 不允许外部调用，所以这里在本地直接应答：
   *   - IP 探测：返回固定的线上值（沿用原 mock 的值，保证走同一条配置分支）
   *   - 统计上报：黑洞（返回空 JSON，不发起网络请求）
   *   - 其它外部地址：交给 runtime 的外部请求闸门，直接失败（不会真的发出去）
   * ------------------------------------------------------------------ */
  var IP_PROBE_HOST = 'na.2loveyou.com';
  var ANALYTICS_HOST = 'fig.brainburst.cloud';
  window.__IP_PROBE_URL = window.__IP_PROBE_URL || IP_PROBE_HOST + '/spin/spin/test/ip/c';
  window.__IP_PROBE_VALUE = window.__IP_PROBE_VALUE || 'aa8f3faa64ff47b0ce9a76682bde924c';

  function stubFor(url) {
    var text = String(url || '');
    if (text.indexOf(IP_PROBE_HOST) >= 0) {
      return { body: window.__IP_PROBE_VALUE, type: 'text/plain', tag: 'ip-probe' };
    }
    if (text.indexOf(ANALYTICS_HOST) >= 0) {
      return { body: '{}', type: 'application/json', tag: 'analytics' };
    }
    return null;
  }

  var RealXHR = window.XMLHttpRequest;
  if (RealXHR && RealXHR.prototype && !RealXHR.prototype.__ytBackendStub) {
    RealXHR.prototype.__ytBackendStub = true;
    var realOpen = RealXHR.prototype.open;
    var realSend = RealXHR.prototype.send;
    RealXHR.prototype.open = function (method, url) {
      this.__ytStub = stubFor(url);
      this.__ytStubUrl = url;
      if (!this.__ytStub) return realOpen.apply(this, arguments);
      // 本地应答不需要真的 open，但保留 URL 以便诊断
      return undefined;
    };
    RealXHR.prototype.send = function () {
      var self = this;
      if (!self.__ytStub) return realSend.apply(this, arguments);
      log('本地应答 ' + self.__ytStub.tag + '（不发起外部请求）');
      setTimeout(function () {
        try {
          Object.defineProperty(self, 'readyState', { configurable: true, value: 4 });
          Object.defineProperty(self, 'status', { configurable: true, value: 200 });
          Object.defineProperty(self, 'responseText', { configurable: true, value: self.__ytStub.body });
          Object.defineProperty(self, 'response', { configurable: true, value: self.__ytStub.body });
          if (typeof self.onreadystatechange === 'function') self.onreadystatechange({ type: 'readystatechange', target: self });
          if (typeof self.onload === 'function') self.onload({ type: 'load', target: self });
          if (typeof self.onloadend === 'function') self.onloadend({ type: 'loadend', target: self });
        } catch (e) {
          console.warn(TAG + ' 伪造 XHR 响应失败', e);
        }
      }, 0);
      return undefined;
    };
  }

  if (typeof window.fetch === 'function' && !window.fetch.__ytBackendStub) {
    var realFetch = window.fetch.bind(window);
    var stubbedFetch = function (input, init) {
      var url = typeof input === 'string' ? input : (input && input.url) || '';
      var stub = stubFor(url);
      if (!stub) return realFetch(input, init);
      log('本地应答 ' + stub.tag + '（不发起外部请求）');
      return Promise.resolve(new Response(stub.body, { status: 200, headers: { 'Content-Type': stub.type } }));
    };
    stubbedFetch.__ytBackendStub = true;
    window.fetch = stubbedFetch;
  }

  log('本地后端替身已安装（IP 探测 = ' + window.__IP_PROBE_VALUE.slice(0, 8) + '…，统计上报黑洞）');
})();

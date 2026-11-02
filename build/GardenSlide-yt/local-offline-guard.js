/*
 * 本地单机版离线守卫（所有本地化游戏共用）。
 *
 * 作用：只放行本机来源的请求，拦掉原平台留下的外部服务（广告、统计、门户、
 * 云存档、SDK CDN）。被拦掉的请求按"网络失败"处理，不抛未捕获异常，
 * 让游戏按自己的降级分支继续跑。
 *
 * 使用：在 index.html 的最前面（其他脚本之前）以普通脚本引入。
 * 参数：debug=1 时把被拦截的地址打到 console。
 */
(function () {
  'use strict';

  var params = new URLSearchParams(location.search || '');
  var DEBUG = params.get('debug') === '1';
  var blocked = [];

  function isLocal(host) {
    return (
      host === location.hostname ||
      host === '127.0.0.1' ||
      host === 'localhost' ||
      host === '[::1]' ||
      host === ''
    );
  }

  function shouldBlock(urlStr) {
    var u;
    try {
      u = new URL(urlStr, location.href);
    } catch (e) {
      return false;
    }
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
    return !isLocal(u.hostname);
  }

  function note(urlStr, how) {
    blocked.push(urlStr);
    if (DEBUG) console.info('[offline-guard] blocked ' + how + ': ' + urlStr);
  }

  // ---- fetch ----
  var origFetch = window.fetch;
  if (origFetch) {
    window.fetch = function (input, init) {
      var url = typeof input === 'string' ? input : input && input.url;
      if (url && shouldBlock(url)) {
        note(url, 'fetch');
        return Promise.reject(new TypeError('Failed to fetch (offline-guard)'));
      }
      return origFetch.apply(this, arguments);
    };
  }

  // ---- XMLHttpRequest ----
  var origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url) {
    if (url && shouldBlock(url)) {
      note(url, 'xhr');
      this.__blocked = true;
    }
    return origOpen.apply(this, arguments);
  };
  var origSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function () {
    if (this.__blocked) {
      var self = this;
      window.__ytGameTimers.setTimeout(function () {
        try {
          self.dispatchEvent(new Event('error'));
        } catch (e) {
          /* ignore */
        }
        if (typeof self.onerror === 'function') {
          try {
            self.onerror(new Event('error'));
          } catch (e) {
            /* ignore */
          }
        }
      }, 0);
      return;
    }
    return origSend.apply(this, arguments);
  };

  // ---- sendBeacon ----
  if (navigator.sendBeacon) {
    var origBeacon = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = function (url, data) {
      if (shouldBlock(url)) {
        note(url, 'beacon');
        return false;
      }
      return origBeacon(url, data);
    };
  }

  // ---- 动态插入的外部 script（例如平台 SDK CDN） ----
  // 不去改 DOM 行为，只在 appendChild/insertBefore 时把外部 script 的 src 清掉，
  // 让它加载失败但保留元素，避免调用方拿到 null。
  function guardNode(node) {
    if (!node || node.tagName !== 'SCRIPT') return;
    var src = node.getAttribute && node.getAttribute('src');
    if (src && shouldBlock(src)) {
      note(src, 'script');
      node.removeAttribute('src');
      node.setAttribute('data-offline-guard-blocked', src);
    }
  }
  var origAppend = Element.prototype.appendChild;
  Element.prototype.appendChild = function (node) {
    guardNode(node);
    return origAppend.call(this, node);
  };
  var origInsert = Element.prototype.insertBefore;
  Element.prototype.insertBefore = function (node, ref) {
    guardNode(node);
    return origInsert.call(this, node, ref);
  };

  // ---- WebSocket（平台实时通道） ----
  var OrigWS = window.WebSocket;
  if (OrigWS) {
    window.WebSocket = function (url, protocols) {
      if (shouldBlock(url)) {
        note(url, 'websocket');
        throw new Error('WebSocket blocked (offline-guard)');
      }
      return new OrigWS(url, protocols);
    };
    window.WebSocket.prototype = OrigWS.prototype;
  }

  window.__offlineGuard = {
    blocked: blocked,
    isLocal: isLocal,
  };
})();

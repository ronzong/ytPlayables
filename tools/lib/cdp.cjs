'use strict';
/**
 * 极简 CDP（Chrome DevTools Protocol）客户端。
 * 只依赖 Node 内置的 WebSocket / fetch，不安装任何 npm 包。
 * 复用 gamePopStar/fb-tools/lib/cdp.js 的实现（已在本仓库验证过的用法）。
 */

const fs = require('fs');
const path = require('path');

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** 给 promise 加超时，避免某个子 target 无响应时卡住整个流程。 */
function withTimeout(promise, ms, label) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('超时(' + ms + 'ms): ' + (label || ''))), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      }
    );
  });
}

async function httpJson(url, timeoutMs = 8000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + url);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function waitDebugPort(port, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  let lastErr = null;
  while (Date.now() < deadline) {
    try {
      return await httpJson('http://127.0.0.1:' + port + '/json/version', 1500);
    } catch (e) {
      lastErr = e;
      await sleep(250);
    }
  }
  throw new Error('Chrome 调试端口 ' + port + ' 未就绪: ' + (lastErr ? lastErr.message : ''));
}

async function listPages(port) {
  const list = await httpJson('http://127.0.0.1:' + port + '/json/list');
  return (list || []).filter((t) => t.type === 'page');
}

class CdpSession {
  constructor(ws, port, sessionId) {
    this.ws = ws;
    this.port = port;
    this.sessionId = sessionId || null; // 非空表示这是 flatten 模式下的子会话（OOPIF 等）
    this.targetInfo = null;
    this.nextId = 1;
    this.pending = new Map();
    this.handlers = new Map();
    this.logs = [];
    this.contexts = new Map();
    this.collecting = false;
    ws.addEventListener('message', (ev) => this._onMessage(ev));
  }

  static async connect(wsUrl) {
    const ws = new WebSocket(wsUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve, { once: true });
      ws.addEventListener('error', () => reject(new Error('WebSocket 连接失败: ' + wsUrl)), { once: true });
    });
    const port = Number(new URL(wsUrl).port) || 0;
    return new CdpSession(ws, port);
  }

  static async attachPage(port, urlFilter) {
    const pages = await listPages(port);
    const page = urlFilter ? pages.find((p) => p.url.includes(urlFilter)) || pages[0] : pages[0];
    if (!page) throw new Error('端口 ' + port + ' 没有可附加的页面');
    const session = await CdpSession.connect(page.webSocketDebuggerUrl);
    session.targetUrl = page.url;
    return session;
  }

  _onMessage(ev) {
    let msg;
    try {
      msg = JSON.parse(ev.data);
    } catch {
      return;
    }
    // flatten 模式下多个会话共用一个 WebSocket，用 sessionId 区分
    if ((msg.sessionId || null) !== this.sessionId) return;
    if (msg.id && this.pending.has(msg.id)) {
      const p = this.pending.get(msg.id);
      this.pending.delete(msg.id);
      if (msg.error) p.reject(new Error('CDP ' + msg.error.message + ' (code ' + msg.error.code + ')'));
      else p.resolve(msg.result);
      return;
    }
    if (msg.method) {
      this._handleEvent(msg.method, msg.params || {});
      const hs = this.handlers.get(msg.method);
      if (hs) {
        for (const h of hs) {
          try {
            h(msg.params || {});
          } catch {
            /* 监听器异常不影响会话 */
          }
        }
      }
    }
  }

  _handleEvent(method, params) {
    if (method === 'Runtime.executionContextCreated') {
      const c = params.context;
      if (c && c.origin) this.contexts.set(c.origin, { contextId: c.id, frameId: c.auxData && c.auxData.frameId });
    }
    const t = Date.now();
    switch (method) {
      case 'Runtime.consoleAPICalled': {
        const text = (params.args || [])
          .map((a) => (a.value !== undefined ? a.value : a.description || a.type))
          .join(' ');
        this.logs.push({ t, kind: 'console', type: params.type, text });
        break;
      }
      case 'Runtime.exceptionThrown': {
        const d = params.exceptionDetails || {};
        const desc = d.exception && (d.exception.description || d.exception.value);
        this.logs.push({ t, kind: 'exception', text: desc || d.text || '页面异常' });
        break;
      }
      case 'Log.entryAdded': {
        const e = params.entry || {};
        this.logs.push({ t, kind: 'log', level: e.level, text: e.text + (e.url ? ' @' + e.url : '') });
        break;
      }
      case 'Network.loadingFailed': {
        this.logs.push({ t, kind: 'net-error', text: (params.errorText || '') + ' ' + (params.blockedReason || '') });
        break;
      }
      case 'Network.responseReceived': {
        const r = params.response || {};
        if (r.status >= 400) this.logs.push({ t, kind: 'http', status: r.status, text: r.status + ' ' + r.url });
        break;
      }
      case 'Page.frameNavigated': {
        const f = params.frame || {};
        if (f.url) {
          this.logs.push({ t, kind: 'nav', text: f.url });
          if (!f.parentId) {
            // 记录 target 自己的 URL：flatten 附加时 targetInfo.url 往往是空的
            this.targetUrl = f.url;
            if (this.targetInfo) this.targetInfo.url = f.url;
          }
        }
        break;
      }
    }
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      this.pending.set(id, { resolve, reject });
      const message = { id, method, params };
      if (this.sessionId) message.sessionId = this.sessionId;
      this.ws.send(JSON.stringify(message));
    });
  }

  /**
   * 自动附加所有子 target（跨域 iframe / OOPIF），用于采集游戏 iframe 内部的
   * console、异常、网络与执行上下文。每个子 target 会回调一个 CdpSession。
   */
  async autoAttachTargets(onChild) {
    this.on('Target.attachedToTarget', (params) => {
      const child = new CdpSession(this.ws, this.port, params.sessionId);
      child.targetInfo = params.targetInfo || {};
      onChild(child, params);
    });
    await this.send('Target.setAutoAttach', {
      autoAttach: true,
      waitForDebuggerOnStart: false,
      flatten: true,
      filter: [{ type: 'page' }, { type: 'iframe' }, { type: 'worker' }, { type: 'other' }],
    });
  }

  on(method, handler) {
    if (!this.handlers.has(method)) this.handlers.set(method, []);
    this.handlers.get(method).push(handler);
  }

  async enableCollect() {
    if (this.collecting) return;
    this.collecting = true;
    await Promise.all([
      this.send('Page.enable'),
      this.send('Runtime.enable'),
      this.send('Log.enable'),
      this.send('Network.enable'),
    ]);
  }

  async navigate(url) {
    await this.send('Page.navigate', { url });
  }

  async eval(expression, opts = {}) {
    const params = {
      expression,
      returnByValue: true,
      awaitPromise: opts.awaitPromise !== false,
      userGesture: true,
    };
    if (opts.contextId) params.contextId = opts.contextId;
    const r = await this.send('Runtime.evaluate', params);
    if (r.exceptionDetails) {
      const d = r.exceptionDetails;
      throw new Error('页面执行异常: ' + ((d.exception && d.exception.description) || d.text));
    }
    return r.result && r.result.value;
  }

  async evalInOrigin(originPart, expression) {
    const entry = [...this.contexts.entries()].find(([origin]) => origin.includes(originPart));
    if (!entry) return undefined;
    return this.eval(expression, { contextId: entry[1].contextId });
  }

  async waitFor(expression, opts = {}) {
    const { timeoutMs = 30000, intervalMs = 300, contextId } = opts;
    const deadline = Date.now() + timeoutMs;
    let last;
    while (Date.now() < deadline) {
      try {
        last = await this.eval(expression, { awaitPromise: true, contextId });
        if (last) return last;
      } catch (e) {
        last = e.message;
      }
      await sleep(intervalMs);
    }
    throw new Error('等待超时: ' + expression + ' (最后结果: ' + last + ')');
  }

  async screenshot(outPath) {
    const shot = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
    return outPath;
  }

  logsText() {
    return this.logs
      .map((l) => '[' + new Date(l.t).toISOString().slice(11, 19) + '][' + l.kind + '] ' + l.text)
      .join('\n');
  }

  close() {
    try {
      this.ws.close();
    } catch {
      /* ignore */
    }
  }
}

module.exports = { CdpSession, httpJson, listPages, waitDebugPort, sleep, withTimeout };

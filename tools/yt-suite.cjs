'use strict';
/**
 * 驱动官方 YouTube Playables 测试套件（Test Suite）做本地预检。
 *
 * 页面: https://developers.google.com/youtube/gaming/playables/test_suite
 * 流程: 打开页面 -> 填入游戏 URL -> 点刷新 -> 读取 MUST/SHOULD 检查结果与运行日志 -> 截图。
 *
 * 用法:
 *   node tools/yt-suite.cjs inspect                     # 打印套件页面 DOM 结构（调试用）
 *   node tools/yt-suite.cjs run --url https://localhost:8000/
 *   node tools/yt-suite.cjs run --url ... --headless --wait 60 --name nonogram
 *
 * 说明:
 * - 本机访问 developers.google.com 必须走 Clash 代理，默认 http://127.0.0.1:7890。
 * - 默认使用有头 Chrome（WebGL 游戏在无头下可能起不来），窗口关闭请用 Ctrl+C 或 --keep 控制。
 */

const fs = require('fs');
const path = require('path');
const { CdpSession, sleep, withTimeout } = require('./lib/cdp.cjs');
const chrome = require('./lib/chrome.cjs');

const ROOT = path.join(__dirname, '..');
const STATE = path.join(ROOT, 'tools', 'state');
const SUITE_URL = 'https://developers.google.com/youtube/gaming/playables/test_suite?hl=zh-cn';
const DEFAULT_PORT = 9230;
const DEFAULT_PROFILE = path.join(STATE, 'profiles', 'yt-suite');
const DEFAULT_PROXY = 'http://127.0.0.1:7890';

/**
 * 套件页面把 UI 渲染在 Shadow DOM 里，所以查询必须穿透 shadowRoot。
 * 下面两段表达式注入到页面执行。
 */
const DEEP_HELPERS = `(() => {
  if (window.__ytDeep) return 'ready';
  const deepAll = (sel, root = document, out = []) => {
    for (const el of root.querySelectorAll('*')) {
      if (el.shadowRoot) deepAll(sel, el.shadowRoot, out);
      if (el.matches && el.matches(sel)) out.push(el);
    }
    return out;
  };
  window.__ytDeep = {
    all: deepAll,
    one(sel) { return deepAll(sel)[0] || null; },
  };
  return 'ready';
})()`;

const READ_REQUIREMENTS = `(() => {
  const d = window.__ytDeep;
  const out = { sections: [], url: '', iframeSrc: '', overlay: '', playableState: '' };
  const input = d.one('#url-input');
  out.url = input ? input.value : '';
  const frame = d.one('#playable-iframe');
  out.iframeSrc = frame ? frame.src : '';
  for (const c of d.all('.requirement-container')) {
    const header = c.querySelector('.requirement-header-container');
    const section = {
      name: header && header.querySelector('.requirement-header') ? header.querySelector('.requirement-header').textContent.trim() : '',
      count: header && header.querySelector('[class*="requirement-"][class*="-checks-text"]')
        ? header.querySelector('[class*="requirement-"][class*="-checks-text"]').textContent.trim() : '',
      entries: [],
    };
    for (const e of c.querySelectorAll('.requirement-entry')) {
      const icon = e.querySelector('.material-icons');
      const cls = icon ? icon.className : '';
      const status = cls.includes('pass') ? 'pass'
        : cls.includes('fail') ? 'fail'
        : cls.includes('warn') ? 'warn'
        : cls.includes('pending') ? 'pending'
        : cls.includes('untested') ? 'untested' : 'unknown';
      const textEl = e.querySelector('.requirement-text');
      section.entries.push({
        status,
        text: textEl ? textEl.textContent.replace(/\\s+/g, ' ').trim() : '',
      });
    }
    out.sections.push(section);
  }
  const log = d.one('.log-content');
  out.log = log ? log.innerText : '';
  out.entries = log ? log.querySelectorAll('.log-entry').length : 0;
  const overlay = d.one('#idle-overlay') || d.one('#loading-overlay') || d.one('#ad-overlay');
  out.overlay = overlay ? (overlay.className || '') : '';
  const state = d.one('.iframe-container .screen-emulator-container');
  out.playableState = state ? 'n/a' : 'n/a';
  return out;
})()`;

function parseArgs(argv) {
  const opts = {
    cmd: argv[0] || 'run',
    url: null,
    port: DEFAULT_PORT,
    proxy: DEFAULT_PROXY,
    headless: false,
    wait: 45,
    name: null,
    keep: false,
    profile: null,
  };
  for (let i = 1; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--url') opts.url = argv[++i];
    else if (a === '--port') opts.port = Number(argv[++i]);
    else if (a === '--proxy') opts.proxy = argv[++i];
    else if (a === '--headless') opts.headless = true;
    else if (a === '--wait') opts.wait = Number(argv[++i]);
    else if (a === '--name') opts.name = argv[++i];
    else if (a === '--profile') opts.profile = argv[++i];
    else if (a === '--keep') opts.keep = true;
    else if (a === '--null-storage') opts.nullStorage = true;
    else if (a === '--full') opts.full = true;
  }
  return opts;
}

async function openSession(opts) {
  if (process.env.YT_DEBUG) console.log('[debug] 启动 Chrome (port=' + opts.port + ', headless=' + opts.headless + ')');
  const info = await chrome.launch({
    userDataDir: opts.profile || DEFAULT_PROFILE,
    port: opts.port,
    headless: opts.headless,
    proxy: opts.proxy,
  });
  if (process.env.YT_DEBUG) console.log('[debug] Chrome 就绪 reused=' + info.reused);
  const session = await CdpSession.attachPage(opts.port);
  await session.enableCollect();
  if (process.env.YT_DEBUG) console.log('[debug] 已附加页面并开启采集');
  // 采集跨域 iframe（游戏本体是 OOPIF）的 console / 异常 / 网络
  const children = [];
  try {
    await session.autoAttachTargets((child) => {
      children.push(child);
      child.enableCollect().catch(() => {});
    });
  } catch (e) {
    console.log('自动附加子 target 失败（只能看到套件页面日志）: ' + e.message);
  }
  return { info, session, children };
}

/**
 * 找出游戏 iframe 的子会话。
 * flatten 附加时 targetInfo.url 常为空，且首帧导航事件可能早于我们 Page.enable，
 * 所以再退回“在子 target 里读 location.href”来识别。
 */
async function findGameSessions(children, urlPart) {
  const key = urlPart || 'localhost';
  const hit = (c) => (((c.targetInfo && c.targetInfo.url) || '') + (c.targetUrl || '')).includes(key);
  let list = children.filter(hit);
  if (list.length) return list;
  // flatten 附加时拿不到 url，且子会话常常不响应命令；退化为按日志内容识别
  // （游戏 iframe 的 console 事件是能正常收到的，见 capture 到的 [antflow-yt] 日志）
  const byLog = children.filter((c) => {
    const t = c.logsText();
    return t.includes(key) || t.includes('antflow-yt');
  });
  if (byLog.length) return byLog;
  for (const c of children) {
    try {
      const href = await withTimeout(c.eval('location.href'), 2000, 'location.href');
      if (typeof href === 'string' && href.includes(key)) {
        c.targetUrl = href;
        if (c.targetInfo) c.targetInfo.url = href;
        list.push(c);
      }
    } catch {
      /* 忽略无法执行的子 target */
    }
  }
  return list;
}

// 打开套件页面并等待 Lit 应用（Shadow DOM）就绪
async function openSuite(session) {
  if (process.env.YT_DEBUG) console.log('[debug] 打开套件页面...');
  await session.navigate(SUITE_URL);
  await session.waitFor(`(() => {
    const has = (root, sel) => {
      for (const el of root.querySelectorAll('*')) {
        if (el.shadowRoot && has(el.shadowRoot, sel)) return true;
        if (el.matches && el.matches(sel)) return true;
      }
      return false;
    };
    return has(document, '#url-input');
  })()`, { timeoutMs: 90000 });
  await session.eval(DEEP_HELPERS);
  if (process.env.YT_DEBUG) console.log('[debug] 套件页面就绪');
}

async function inspect(opts) {
  const { info, session } = await openSession(opts);
  try {
    await openSuite(session);
  } catch (e) {
    console.log('等待 #url-input 超时: ' + e.message);
    const state = await session.eval(`({ url: location.href, title: document.title, ready: document.readyState, body: (document.body ? document.body.innerText : '').slice(0, 1500) })`);
    console.log(JSON.stringify(state, null, 2));
    const res = await session.eval(`({
      resources: performance.getEntriesByType('resource').map((r) => r.name).filter((n) => !/\\.(png|jpg|gif|svg|ico|woff2?)(\\?|$)/.test(n)),
      articleHtml: (document.querySelector('.devsite-article-body') || {}).innerHTML || '',
      rowHtml: (document.querySelector('.devsite-landing-row-html') || {}).innerHTML || '',
    })`);
    console.log('--- 资源 ---');
    console.log((res.resources || []).join('\n'));
    console.log('--- articleBody len=' + (res.articleHtml || '').length + ' rowHtml len=' + (res.rowHtml || '').length + ' ---');
    console.log((res.rowHtml || '').slice(0, 800));
    console.log('--- 浏览器日志 ---');
    console.log(session.logsText().slice(-4000));
    if (!opts.keep) {
      session.close();
      chrome.kill(info.proc);
    }
    return;
  }
  const dom = await session.eval(`(() => {
    const q = (s) => window.__ytDeep.all(s).map((e) => ({
      tag: e.tagName, id: e.id, cls: e.className, type: e.type || '', text: (e.innerText || '').slice(0, 80),
    }));
    return {
      title: document.title,
      inputs: q('input'),
      buttons: q('button'),
      containers: q('.requirement-container, .requirement-section, .overlay, .log-content, iframe'),
    };
  })()`);
  console.log(JSON.stringify(dom, null, 2));
  if (!opts.keep) {
    session.close();
    chrome.kill(info.proc);
  }
}

async function run(opts) {
  // 说明见文件头部：run 会全程采集套件页面 + 游戏 iframe 两个 target 的日志
  if (!opts.url) throw new Error('缺少 --url <本地 https 地址>');
  const { info, session, children } = await openSession(opts);
  await openSuite(session);
  console.log('套件页面已打开: ' + SUITE_URL);

  // 填入游戏 URL（Lit 组件靠 input 事件更新状态）
  await session.eval(`(() => {
    const input = window.__ytDeep.one('#url-input');
    input.focus();
    input.value = ${JSON.stringify(opts.url)};
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return input.value;
  })()`);
  await sleep(300);

  const refresh = await session.eval(`(() => {
    const btn = window.__ytDeep.one('#refresh-button');
    if (!btn) return 'no-button';
    btn.click();
    return 'clicked';
  })()`);
  console.log('刷新按钮: ' + refresh);

  const deadline = Date.now() + opts.wait * 1000;
  let result = null;
  let stableSince = 0;
  let lastSignature = '';
  while (Date.now() < deadline) {
    await sleep(1000);
    result = await session.eval(READ_REQUIREMENTS);
    const signature = JSON.stringify(result.sections);
    if (signature !== lastSignature) lastSignature = signature;
    const anyPassed = result.sections.some((s) => s.entries.some((e) => e.status === 'pass'));
    const noUntested = result.sections.every((s) =>
      s.entries.every((e) => e.status !== 'untested' && e.status !== 'pending')
    );
    if (noUntested && anyPassed) {
      await sleep(2000); // 让最后的日志/检查再落一次
      result = await session.eval(READ_REQUIREMENTS);
      break;
    }
    if (signature === lastSignature) {
      stableSince += 1;
      // 全部检查都出结果且结果稳定 10s 就收尾；还有 untested/pending 时等满 --wait
      if (stableSince >= 10 && noUntested) break;
    } else stableSince = 0;
  }

  result.log = (result.log || '').trim();
  const name = opts.name || 'run';
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outDir = path.join(STATE, 'reports');
  fs.mkdirSync(outDir, { recursive: true });
  const jsonPath = path.join(outDir, 'yt-suite-' + name + '-' + stamp + '.json');
  const logPath = path.join(outDir, 'yt-suite-' + name + '-' + stamp + '.log');
  const shotPath = path.join(STATE, 'screenshots', 'yt-suite-' + name + '-' + stamp + '.png');
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2));
  const hostPart = (() => {
    try {
      return new URL(opts.url).host;
    } catch {
      return 'localhost';
    }
  })();
  const gameLogs = (await findGameSessions(children, hostPart))
    .map((c) => '--- target: ' + (c.targetInfo.url || '') + ' ---\n' + c.logsText())
    .join('\n');
  fs.writeFileSync(
    logPath,
    '=== 套件日志面板 ===\n' + result.log +
      '\n\n=== 套件页面 console/异常/网络 ===\n' + session.logsText() +
      '\n\n=== 游戏 iframe console/异常/网络 ===\n' + (gameLogs || '(未捕获到子 target 日志)') + '\n'
  );
  try {
    await session.screenshot(shotPath);
  } catch (e) {
    console.log('截图失败: ' + e.message);
  }

  console.log('\n===== MUST / SHOULD 检查结果 =====');
  for (const s of result.sections) {
    console.log('[' + s.name + '] ' + (s.count || '').trim());
    for (const e of s.entries) {
      const mark = e.status === 'pass' ? 'PASS'
        : e.status === 'fail' ? 'FAIL'
        : e.status === 'warn' ? 'WARN'
        : e.status === 'pending' ? 'PEND'
        : '????';
      console.log('  ' + mark + '  ' + e.text);
    }
  }
  console.log('\n游戏 iframe: ' + result.iframeSrc);
  console.log('覆盖层: ' + (result.overlay || '(无)'));
  console.log('报告: ' + jsonPath);
  console.log('日志: ' + logPath);
  console.log('截图: ' + shotPath);
  if (result.log) {
    console.log('\n===== 套件日志面板（末尾 2000 字符） =====');
    console.log(result.log.slice(-2000));
  }
  const gameSessions = await findGameSessions(children, hostPart);
  if (gameSessions.length) {
    console.log('\n===== 游戏 iframe 控制台（末尾 3000 字符） =====');
    for (const c of gameSessions) {
      console.log('target: ' + (c.targetInfo.url || ''));
      console.log(c.logsText().slice(-3000));
    }
  }

  if (!opts.keep) {
    session.close();
    chrome.kill(info.proc);
  } else {
    console.log('\n--keep: Chrome 保持打开（调试端口 ' + opts.port + '），用完请手动关闭。');
  }
}

/** 调试用：打开套件并加载游戏，打印 target 列表与每个 target 的日志条数。 */
async function debugTargets(opts) {
  if (!opts.url) throw new Error('缺少 --url');
  const { info, session, children } = await openSession(opts);
  await openSuite(session);
  await session.eval(`(() => {
    const input = window.__ytDeep.one('#url-input');
    input.value = ${JSON.stringify(opts.url)};
    input.dispatchEvent(new Event('input', { bubbles: true }));
    const btn = window.__ytDeep.one('#refresh-button');
    if (btn) btn.click();
    return 'ok';
  })()`);
  await sleep(opts.wait * 1000);
  const targets = await session.send('Target.getTargets');
  console.log('=== Target.getTargets ===');
  for (const t of targets.targetInfos || []) {
    console.log('  ' + t.type + '  ' + t.url);
  }
  console.log('=== 自动附加到的子会话 ===');
  for (const c of children) {
    console.log('  ' + (c.targetInfo.type || '?') + '  ' + (c.targetInfo.url || '') + '  logs=' + c.logs.length);
  }
  console.log('=== 套件页面日志 ===');
  console.log(session.logsText().slice(-3000));
  for (const c of children) {
    console.log('=== 子 target 日志: ' + (c.targetInfo.url || '') + ' ===');
    console.log(c.logsText().slice(-4000));
  }
  session.close();
  chrome.kill(info.proc);
}

/** 调试用：加载游戏后定期采样游戏 iframe 的加载进度（资源数、失败项、日志）。 */
async function diag(opts) {
  if (!opts.url) throw new Error('缺少 --url');
  const { info, session, children } = await openSession(opts);
  await openSuite(session);
  await session.eval(`(() => {
    const input = window.__ytDeep.one('#url-input');
    input.value = ${JSON.stringify(opts.url)};
    input.dispatchEvent(new Event('input', { bubbles: true }));
    const btn = window.__ytDeep.one('#refresh-button');
    if (btn) btn.click();
    return 'ok';
  })()`);
  const gameHost = new URL(opts.url).host;
  const deadline = Date.now() + opts.wait * 1000;
  let lastCount = -1;
  while (Date.now() < deadline) {
    await sleep(5000);
    const g = (await findGameSessions(children, gameHost))[0];
    if (!g) {
      console.log(
        '[diag] 还没有游戏 iframe target；子 target=' + children.length + ' ' +
          JSON.stringify(children.map((c) => (c.targetInfo && c.targetInfo.type) + ':' + (c.targetUrl || (c.targetInfo && c.targetInfo.url) || '')))
      );
      continue;
    }
    let info2 = null;
    try {
      info2 = await withTimeout(g.eval(`(() => {
        const res = performance.getEntriesByType('resource');
        const bad = res.filter((r) => r.responseStatus && r.responseStatus >= 400).map((r) => r.name);
        return {
          count: res.length,
          last: res.slice(-6).map((r) => r.name.split('/').slice(-2).join('/')),
          bad,
          bytes: Math.round(res.reduce((a, r) => a + (r.transferSize || 0), 0) / 1024),
          scene: (typeof cc !== 'undefined' && cc.director && cc.director.getScene && cc.director.getScene()) ? cc.director.getScene().name : '(cc 不可见)',
        };
      })()`), 4000, '资源采样');
    } catch (e) {
      info2 = { error: e.message };
    }
    const g2 = (await findGameSessions(children, gameHost))[0];
    const resBit = info2 && info2.error
      ? '资源采样失败(' + info2.error + ')'
      : '资源=' + info2.count + ' 传输=' + info2.bytes + 'KB 失败=' + JSON.stringify(info2.bad) + ' 最近=' + JSON.stringify(info2.last);
    console.log('[diag] ' + resBit);
    const logs = g2.logsText().split('\n');
    console.log('       游戏日志尾部: ' + logs.slice(-3).join(' | '));
    if (info2 && info2.count === lastCount) {
      console.log('       (资源数不再增长)');
    }
    lastCount = info2 && info2.count;
  }
  const g = (await findGameSessions(children, gameHost))[0];
  console.log('\n=== 最终游戏日志 ===');
  if (g) console.log(g.logsText().slice(-6000));
  console.log('\n=== 套件日志 ===');
  console.log((await session.eval(READ_REQUIREMENTS)).log.slice(-1500));
  session.close();
  chrome.kill(info.proc);
}

/**
 * 调试用：打开任意宿主页，采集其所有子 target（跨域 iframe）的日志。
 * 用于本地对照“游戏放在 iframe/sandbox 里”这一条件，不依赖官方测试套件。
 */
async function harness(opts) {
  if (!opts.url) throw new Error('缺少 --url <宿主页地址>');
  const info = await chrome.launch({
    userDataDir: opts.profile || path.join(STATE, 'profiles', 'yt-harness'),
    port: opts.port,
    headless: opts.headless,
    proxy: opts.proxy,
  });
  const session = await CdpSession.attachPage(opts.port);
  await session.enableCollect();
  const children = [];
  await session.autoAttachTargets((child) => {
    children.push(child);
    child.enableCollect().catch(() => {});
  });
  await session.navigate(opts.url);
  const deadline = Date.now() + opts.wait * 1000;
  while (Date.now() < deadline) {
    await sleep(5000);
    const g = (await findGameSessions(children, 'localhost'))[0];
    if (!g) {
      console.log('[harness] 子 target=' + children.length + '（还没有游戏日志）');
      continue;
    }
    const logs = g.logsText().split('\n');
    console.log('[harness] 游戏日志尾部: ' + logs.slice(-4).join(' | '));
  }
  const g = (await findGameSessions(children, 'localhost'))[0];
  if (g) {
    console.log('\n=== 完整游戏日志 ===\n' + g.logsText());
  }
  console.log('\n=== 宿主页日志 ===\n' + session.logsText().slice(-2000));
  session.close();
  chrome.kill(info.proc);
}

/** 调试用：直接打开游戏 URL（不在测试套件里跑），只采集日志。 */
async function direct(opts) {
  if (!opts.url) throw new Error('缺少 --url');
  const nullStorage = !!opts.nullStorage;
  if (nullStorage) {
    // 复现 Playables 环境：官方 SDK 会把 localStorage/sessionStorage/indexedDB/caches/cookie 置为 null
    const inject = await chrome.launch({
      userDataDir: opts.profile || path.join(STATE, 'profiles', 'yt-direct'),
      port: opts.port,
      headless: opts.headless,
      proxy: opts.proxy,
    });
    const s = await CdpSession.attachPage(opts.port);
    await s.enableCollect();
    await s.send('Page.addScriptToEvaluateOnNewDocument', {
      source: `try {
        Object.defineProperty(window, 'localStorage', { value: null, writable: false });
        Object.defineProperty(window, 'sessionStorage', { value: null, writable: false });
        Object.defineProperty(window, 'indexedDB', { value: null, writable: false });
        Object.defineProperty(window, 'caches', { value: null, writable: false });
      } catch (e) {}`,
    });
    await s.navigate(opts.url);
    const deadline2 = Date.now() + opts.wait * 1000;
    while (Date.now() < deadline2) {
      await sleep(5000);
      console.log(s.logsText().slice(-1500));
    }
    const shot2 = path.join(STATE, 'screenshots', 'direct-nullstorage-' + (opts.name || 'game') + '.png');
    await s.screenshot(shot2).catch(() => {});
    console.log('截图: ' + shot2);
    s.close();
    chrome.kill(inject.proc);
    return;
  }
  const info = await chrome.launch({
    userDataDir: opts.profile || path.join(STATE, 'profiles', 'yt-direct'),
    port: opts.port,
    headless: opts.headless,
    proxy: opts.proxy,
    url: opts.url,
  });
  const session = await CdpSession.attachPage(opts.port);
  await session.enableCollect();
  const deadline = Date.now() + opts.wait * 1000;
  let last = 0;
  while (Date.now() < deadline) {
    await sleep(5000);
    if (session.logs.length !== last) {
      last = session.logs.length;
      console.log('--- 日志 (' + last + ') ---');
      console.log(session.logsText().slice(-1500));
    }
  }
  const shot = path.join(STATE, 'screenshots', 'direct-' + (opts.name || 'game') + '.png');
  await session.screenshot(shot).catch(() => {});
  console.log('截图: ' + shot);
  // 完整日志落盘（排查启动阶段最有用）
  const logDir = path.join(STATE, 'reports');
  fs.mkdirSync(logDir, { recursive: true });
  const logPath = path.join(logDir, 'direct-' + (opts.name || 'game') + '-' + Date.now() + '.log');
  fs.writeFileSync(logPath, session.logsText() + '\n');
  console.log('完整日志: ' + logPath);
  if (opts.full) {
    console.log('--- 日志开头 4000 字符 ---');
    console.log(session.logsText().slice(0, 4000));
  }
  session.close();
  chrome.kill(info.proc);
}

/**
 * 验证暂停：在官方测试套件里点 Pause，确认游戏循环真的停住（帧数不再增长），
 * 再点一次恢复，确认帧数继续增长。
 * 需要适配层打开 #ytdebug 心跳（脚本会自动追加），心跳里带 frames= 计数。
 */
async function verifyPause(opts) {
  if (!opts.url) throw new Error('缺少 --url <本地 https 地址>');
  const target = opts.url.includes('#') ? opts.url + '&ytdebug' : opts.url + '#ytdebug';
  const hostPart = new URL(opts.url).host;
  const { info, session, children } = await openSession(opts);
  await openSuite(session);
  await session.eval(`(() => {
    const input = window.__ytDeep.one('#url-input');
    input.value = ${JSON.stringify(target)};
    input.dispatchEvent(new Event('input', { bubbles: true }));
    const btn = window.__ytDeep.one('#refresh-button');
    if (btn) btn.click();
    return 'ok';
  })()`);
  console.log('已加载: ' + target);

  const findGame = async () => (await findGameSessions(children, hostPart))[0];
  let game = null;
  const waitGame = Date.now() + 60000;
  while (Date.now() < waitGame && !game) {
    await sleep(1000);
    game = await findGame();
  }
  if (!game) throw new Error('没有捕获到游戏 iframe 会话（游戏可能没起来）');

  const framesOf = async () => {
    const g = await findGame();
    if (!g) return null;
    const m = [...g.logsText().matchAll(/frames=(\d+)/g)];
    return m.length ? Number(m[m.length - 1][1]) : null;
  };
  const clickPause = async () =>
    session.eval(`(() => {
      const btn = window.__ytDeep.one('#pause-button');
      if (!btn) return 'no-button';
      btn.click();
      return 'clicked';
    })()`);

  await sleep(9000); // 攒几个心跳（适配层每 3 秒一次）
  const before = await framesOf();
  console.log('暂停前帧数 = ' + before);

  console.log('点击套件 Pause 按钮: ' + (await clickPause()));
  await sleep(3000);
  const justAfterPause = await framesOf();
  await sleep(9000);
  const duringPause = await framesOf();

  console.log('暂停后立刻帧数 = ' + justAfterPause + '，再等 9 秒 = ' + duringPause);

  console.log('再次点击 Pause 按钮（恢复）: ' + (await clickPause()));
  await sleep(9000);
  const afterResume = await framesOf();
  console.log('恢复后帧数 = ' + afterResume);

  const g = await findGame();
  if (g) {
    console.log('\n=== 游戏日志（暂停相关，末尾 1800 字符）===');
    console.log(g.logsText().slice(-1800));
  }

  const frozen = before !== null && duringPause !== null && duringPause - before <= 2;
  const resumed = duringPause !== null && afterResume !== null && afterResume - duringPause >= 10;
  console.log('\n===== 暂停验证结果 =====');
  console.log((frozen ? 'PASS' : 'FAIL') + '  暂停期间游戏循环冻结（帧数 ' + before + ' -> ' + duringPause + '）');
  console.log((resumed ? 'PASS' : 'FAIL') + '  恢复后游戏循环继续（帧数 ' + duringPause + ' -> ' + afterResume + '）');

  if (!opts.keep) {
    session.close();
    chrome.kill(info.proc);
  }
}

/**
 * 本地验证暂停（不依赖官方套件，也不需要能访问 Google）：
 * 直接打开游戏页，等适配层就绪后调用与 SDK 回调完全相同的暂停/恢复路径，
 * 用适配层的帧计数判断游戏循环是否真的停住。
 */
async function verifyPauseLocal(opts) {
  const url = opts.url.includes('#') ? opts.url + '&ytdebug' : (opts.url || 'https://localhost:8001/') + '#ytdebug';
  const info = await chrome.launch({
    userDataDir: opts.profile || path.join(STATE, 'profiles', 'yt-pause-local'),
    port: opts.port,
    headless: opts.headless,
    proxy: opts.proxy,
    url,
  });
  const s = await CdpSession.attachPage(opts.port);
  await s.enableCollect();
  await s.waitFor('!!(window.__ytDebug && window.__ytDebug.getFrameCount)', { timeoutMs: 90000 });
  console.log('适配层已就绪，等待游戏起来...');
  await sleep(10000);

  const frames = () => s.eval('window.__ytDebug.getFrameCount()');
  const shot = async () => (await s.send('Page.captureScreenshot', { format: 'png' })).data;
  const before = await frames();
  console.log('暂停前帧数 = ' + before);

  // 画面冻结证据：暂停前两帧截图应当不同，暂停期间两帧应当完全一致
  const shotA1 = await shot();
  await sleep(1200);
  const shotA2 = await shot();
  const pictureMovingBefore = shotA1 !== shotA2;
  console.log('暂停前两张截图是否不同 = ' + pictureMovingBefore);

  // 输入是否被拦：在 document 上装一个探针，统计实际收到的 pointerdown
  await s.eval(`(() => {
    window.__probeHits = 0;
    document.addEventListener('pointerdown', () => { window.__probeHits++; }, true);
    return 'probe-ready';
  })()`);
  const probeHits = () => s.eval('window.__probeHits');
  const clickCenter = async () => {
    await s.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 600, y: 400, button: 'left', clickCount: 1 });
    await s.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 600, y: 400, button: 'left', clickCount: 1 });
  };
  await clickCenter();
  await sleep(300);
  const hitsBeforePause = await probeHits();
  console.log('暂停前点击一次，探针计数 = ' + hitsBeforePause + '（应 >0）');

  const beforePause = await frames();
  console.log('发起暂停前帧数 = ' + beforePause);
  await s.eval('window.__ytDebug.simulateSdkPause()');
  await sleep(1500);
  const justAfter = await frames();
  const audioWhilePaused = await s.eval('JSON.stringify(window.__ytDebug.getAudioState())');
  const shotB1 = await shot();
  await clickCenter();
  await sleep(500);
  await sleep(1200);
  const shotB2 = await shot();
  const pictureMovingDuringPause = shotB1 !== shotB2;
  const hitsWhilePaused = await probeHits();
  await sleep(6000);
  const during = await frames();
  console.log('暂停后立刻 = ' + justAfter + '，再等 6 秒 = ' + during);
  console.log('暂停期间点击一次，探针计数 = ' + hitsWhilePaused + '（应保持不变）');
  console.log('暂停期间音频状态 = ' + audioWhilePaused);
  console.log('暂停期间两张截图是否不同 = ' + pictureMovingDuringPause);

  await s.eval('window.__ytDebug.simulateSdkResume()');
  await sleep(4000);
  const after = await frames();
  await clickCenter();
  await sleep(300);
  const hitsAfterResume = await probeHits();
  console.log('恢复后帧数 = ' + after);
  console.log('恢复后点击一次，探针计数 = ' + hitsAfterResume + '（应继续增加）');

  // ---- Page Visibility / blur / focus 通路检查（认证要求：只用 SDK 的 onPause/onResume）----
  const blockedCount = await s.eval('window.__ytDebug.getVisibilityBlockedCount()');
  console.log('\n被屏蔽的 visibility/blur/focus 事件注册数 = ' + blockedCount);
  const f1 = await frames();
  await s.eval(`(() => {
    document.dispatchEvent(new Event('visibilitychange'));
    window.dispatchEvent(new Event('blur'));
    window.dispatchEvent(new Event('focus'));
    document.dispatchEvent(new Event('pagehide'));
    document.dispatchEvent(new Event('pageshow'));
    return 'fired';
  })()`);
  await sleep(2000);
  const f2 = await frames();
  const visibilityIgnored = f2 - f1 >= 20; // 事件没有让游戏停住，说明没有被用于暂停
  console.log('触发 visibility/blur/focus 后帧数 = ' + f1 + ' -> ' + f2 + '（应继续增长）');

  // 暂停状态下触发 focus/visibility，不应被“恢复”
  await s.eval('window.__ytDebug.simulateSdkPause()');
  await sleep(1200);
  const g1 = await frames();
  // 暂停期间发起一个 XHR：应当被“扣住”，恢复后才真正发出
  await s.eval(`(() => {
    window.__netProbe = { started: 0, done: 0 };
    var x = new XMLHttpRequest();
    x.open('GET', '/index.html?netprobe=' + Math.random());
    x.onloadend = function () { window.__netProbe.done += 1; };
    x.send();
    window.__netProbe.started += 1;
    return 'sent';
  })()`);
  await sleep(1500);
  const netWhilePaused = await s.eval('JSON.stringify(window.__netProbe)');
  await s.eval(`(() => {
    document.dispatchEvent(new Event('visibilitychange'));
    window.dispatchEvent(new Event('focus'));
    document.dispatchEvent(new Event('pageshow'));
    return 'fired';
  })()`);
  await sleep(2500);
  const g2 = await frames();
  const resumeOnlyBySdk = g2 - g1 <= 2;
  console.log('暂停中触发 focus/visibility 后帧数 = ' + g1 + ' -> ' + g2 + '（应保持不变）');
  console.log('暂停期间发起的 XHR 状态 = ' + netWhilePaused + '（done 应为 0）');
  const stillPaused = await s.eval('window.__ytDebug.isPaused()');
  await s.eval('window.__ytDebug.simulateSdkResume()');
  await sleep(1500);
  const netAfterResume = await s.eval('JSON.stringify(window.__netProbe)');
  console.log('恢复后同一 XHR 状态 = ' + netAfterResume + '（done 应为 1）');

  console.log('\n=== 页面日志（末尾 2000 字符）===');
  console.log(s.logsText().slice(-2000));

  // 注意：用“暂停稳定后”的 justAfter 做基准，beforePause 只作参考
  const frozen = during - justAfter <= 2;
  const resumed = after - during >= 10;
  const inputBlocked = hitsWhilePaused === hitsBeforePause;
  const inputRestored = hitsAfterResume > hitsWhilePaused;
  const audioState = JSON.parse(audioWhilePaused);
  const audioSilenced = audioState.silenced === true &&
    (audioState.masterGains.length === 0 || audioState.masterGains.every((g) => g === 0 || g === null));
  const renderFrozen = !pictureMovingDuringPause;
  console.log('\n===== 暂停验证结果（本地直开）=====');
  console.log((frozen ? 'PASS' : 'FAIL') + '  暂停期间游戏循环冻结（帧数 ' + justAfter + ' -> ' + during + '，暂停前 ' + beforePause + '）');
  console.log((renderFrozen ? 'PASS' : 'FAIL') + '  暂停期间画面不再变化（暂停前画面' + (pictureMovingBefore ? '在动' : '本就静态') + '）');
  console.log((inputBlocked ? 'PASS' : 'FAIL') + '  暂停期间游戏收不到输入（探针 ' + hitsBeforePause + ' -> ' + hitsWhilePaused + '）');
  console.log((audioSilenced ? 'PASS' : 'FAIL') + '  暂停期间音频静音（主音量 ' + JSON.stringify(audioState.masterGains) + '）');
  console.log((resumed ? 'PASS' : 'FAIL') + '  恢复后游戏循环继续（帧数 ' + during + ' -> ' + after + '）');
  console.log((inputRestored ? 'PASS' : 'FAIL') + '  恢复后输入恢复（探针 ' + hitsWhilePaused + ' -> ' + hitsAfterResume + '）');
  console.log((visibilityIgnored ? 'PASS' : 'FAIL') + '  不使用 Page Visibility 类 API 暂停/恢复（屏蔽注册 ' + blockedCount + ' 次）');
  console.log((resumeOnlyBySdk && stillPaused ? 'PASS' : 'FAIL') + '  暂停后只能由 onResume 恢复（focus/visibility 无效）');
  const netStateDuring = JSON.parse(netWhilePaused);
  const netStateAfter = JSON.parse(netAfterResume);
  const networkHeld = netStateDuring.done === 0 && netStateAfter.done === 1;
  console.log((networkHeld ? 'PASS' : 'FAIL') + '  暂停期间不发起网络请求（XHR done ' + netStateDuring.done + ' -> ' + netStateAfter.done + '）');

  if (!opts.keep) {
    s.close();
    chrome.kill(info.proc);
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.cmd === 'inspect') await inspect(opts);
  else if (opts.cmd === 'run') await run(opts);
  else if (opts.cmd === 'targets') await debugTargets(opts);
  else if (opts.cmd === 'diag') await diag(opts);
  else if (opts.cmd === 'direct') await direct(opts);
  else if (opts.cmd === 'harness') await harness(opts);
  else if (opts.cmd === 'pause') await verifyPause(opts);
  else if (opts.cmd === 'pause-local') await verifyPauseLocal(opts);
  else {
    console.error('未知命令: ' + opts.cmd);
    process.exit(2);
  }
}

main().catch((e) => {
  console.error('失败: ' + e.message);
  process.exit(1);
});

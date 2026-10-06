'use strict';
// 抓取「测试套件里游戏 iframe」的 JS 调用栈，用来定位卡死/卡加载。
//
// 原理：先直连游戏 iframe 的调试 target，等游戏跑起来后用 Debugger.pause（走 V8 interrupt，
// 主线程即使卡在长任务里也能中断）拿调用栈，再立刻 resume。
//
// 用法:
//   node tools/yt-stack-probe.cjs --url https://localhost:8002/ --wait-before 25 --probes 6

const fs = require('fs');
const path = require('path');
const { CdpSession, sleep, httpJson } = require('./lib/cdp.cjs');
const chrome = require('./lib/chrome.cjs');

const STATE = path.join(__dirname, 'state');
const SUITE_URL = 'https://developers.google.com/youtube/gaming/playables/test_suite?hl=zh-cn';

function parseArgs(argv) {
  const opts = { url: null, waitBefore: 20, probes: 5, port: 9233, headless: true, evalExpr: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--url') opts.url = argv[++i];
    else if (a === '--wait-before') opts.waitBefore = Number(argv[++i]);
    else if (a === '--probes') opts.probes = Number(argv[++i]);
    else if (a === '--port') opts.port = Number(argv[++i]);
    else if (a === '--headed') opts.headless = false;
    else if (a === '--eval') opts.evalExpr = argv[++i];
  }
  return opts;
}

async function findGameTarget(port, host) {
  const list = await httpJson('http://127.0.0.1:' + port + '/json/list').catch(() => []);
  return (list || []).find((t) => t.url && t.url.includes(host));
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.url) throw new Error('缺少 --url');
  const host = new URL(opts.url).host;

  const info = await chrome.launch({
    userDataDir: path.join(STATE, 'profiles', 'yt-stack-probe'),
    port: opts.port,
    headless: opts.headless,
    proxy: 'http://127.0.0.1:7890',
  });
  const session = await CdpSession.attachPage(opts.port);
  await session.enableCollect();
  await session.navigate(SUITE_URL);
  await session.waitFor(
    `(() => {
      const has = (root, sel) => {
        for (const el of root.querySelectorAll('*')) {
          if (el.shadowRoot && has(el.shadowRoot, sel)) return true;
          if (el.matches && el.matches(sel)) return true;
        }
        return false;
      };
      return has(document, '#url-input');
    })()`,
    { timeoutMs: 90000 }
  );
  await session.eval(`(() => {
    if (!window.__deep) {
      window.__deep = (sel, root = document, out = []) => {
        for (const el of root.querySelectorAll('*')) {
          if (el.shadowRoot) window.__deep(sel, el.shadowRoot, out);
          if (el.matches && el.matches(sel)) out.push(el);
        }
        return out;
      };
    }
    const input = window.__deep('#url-input')[0];
    const btn = window.__deep('#refresh-button')[0];
    input.value = ${JSON.stringify(opts.url)};
    input.dispatchEvent(new Event('input', { bubbles: true }));
    if (btn) btn.click();
    return 'ok';
  })()`);

  let target = null;
  for (let i = 0; i < 150 && !target; i++) {
    await sleep(200);
    target = await findGameTarget(opts.port, host);
  }
  if (!target) throw new Error('没有找到游戏 target');
  const g = await CdpSession.connect(target.webSocketDebuggerUrl);
  console.log('已连上游戏 target: ' + target.url);
  await g.send('Debugger.enable').catch(() => {});
  await g.send('Runtime.enable').catch(() => {});

  let paused = null;
  g.on('Debugger.paused', async (p) => {
    const top = (p.callFrames || [])[0] || null;
    let probeResult = null;
    if (opts.evalExpr && top) {
      try {
        const r = await g.send('Debugger.evaluateOnCallFrame', {
          callFrameId: top.callFrameId,
          expression: opts.evalExpr,
          returnByValue: true,
        });
        probeResult = r.result ? r.result.value : null;
      } catch (e) {
        probeResult = '求值失败: ' + e.message;
      }
    }
    paused = {
      reason: p.reason,
      frames: (p.callFrames || []).map(
        (f) => (f.functionName || '(anon)') + ' @' + String(f.url || '').split('/').slice(-1)[0] + ':' + (f.location ? f.location.lineNumber : '?')
      ),
      scriptId: top && top.location ? top.location.scriptId : null,
      line: top && top.location ? top.location.lineNumber : null,
      probeResult: probeResult,
    };
    try {
      await g.send('Debugger.resume');
    } catch (_e) { /* ignore */ }
  });

  await sleep(opts.waitBefore * 1000);
  const lines = [];
  for (let round = 0; round < opts.probes; round++) {
    paused = null;
    try {
      g.send('Debugger.pause');
    } catch (_e) { /* ignore */ }
    await sleep(2500);
    if (paused) {
      lines.push('--- 第 ' + (round + 1) + ' 次暂停（reason=' + paused.reason + '）');
      if (paused.probeResult !== null && paused.probeResult !== undefined) {
        lines.push('[eval] ' + JSON.stringify(paused.probeResult));
      }
      lines.push(paused.frames.slice(0, 25).join('\n'));
      // 把暂停处所在的脚本源码抓出来，便于确认“卡在哪段代码”
      if (paused.scriptId) {
        try {
          const src = await g.send('Debugger.getScriptSource', { scriptId: paused.scriptId });
          const all = String(src.scriptSource || '').split('\n');
          const from = Math.max(0, (paused.line || 0) - 3);
          const snippet = all.slice(from, from + 7).map((l, i) => (from + i + 1) + ': ' + l.slice(0, 240)).join('\n');
          lines.push('脚本源码片段（' + all.length + ' 行）:\n' + snippet);
        } catch (e) {
          lines.push('取脚本源码失败: ' + e.message);
        }
      }
    } else {
      lines.push('--- 第 ' + (round + 1) + ' 次：没有拿到暂停事件（命令可能未被处理）');
    }
    await sleep(6000);
  }
  const text = lines.join('\n');
  console.log(text);
  const out = path.join(STATE, 'reports', 'stack-probe-' + host.replace(/[^\w.-]/g, '_') + '-' + Date.now() + '.txt');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, text + '\n');
  console.log('报告: ' + out);
  g.close();
  session.close();
  chrome.kill(info.proc);
}

main().catch((e) => {
  console.error('失败: ' + e.message);
  process.exit(1);
});

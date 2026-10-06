'use strict';
// 游戏内 UI 节点探针：列出匹配名字的 Cocos 节点状态，可选真实点击，用来排查
// “某个按钮点不动 / 点了没反应”这类只在换平台后才出现的问题。
//
// 用法:
//   node tools/yt-ui-probe.cjs --url https://localhost:8002/ --name "week|pack|gift"
//   node tools/yt-ui-probe.cjs --url https://localhost:8002/ --name week --click

const path = require('path');
const { CdpSession, sleep, httpJson } = require('./lib/cdp.cjs');
const chrome = require('./lib/chrome.cjs');

const STATE = path.join(__dirname, 'state');
const SUITE_URL = 'https://developers.google.com/youtube/gaming/playables/test_suite?hl=zh-cn';

function parseArgs(argv) {
  const opts = { url: null, name: 'week|gift|pack|shop', wait: 25, click: false, headless: true, port: 9234 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--url') opts.url = argv[++i];
    else if (a === '--name') opts.name = argv[++i];
    else if (a === '--wait') opts.wait = Number(argv[++i]);
    else if (a === '--click') opts.click = true;
    else if (a === '--headed') opts.headless = false;
    else if (a === '--port') opts.port = Number(argv[++i]);
    else if (a === '--eval') opts.evalExpr = argv[++i];
    else if (a === '--eval-file') opts.evalFile = argv[++i];
    else if (a === '--via-suite') opts.viaSuite = true;
    else if (a === '--click-at') opts.clickAt = argv[++i];
    else if (a === '--touch') opts.touch = true;
  }
  return opts;
}

function sceneExpr(pattern) {
  const src = [
    '(() => {',
    '  const out = { nodes: [], scene: null, switchOpenShopDiamond: null };',
    '  try {',
    '    const scene = cc.director.getScene();',
    '    out.scene = scene && scene.name;',
    '    const re = new RegExp(' + JSON.stringify(pattern) + ", 'i');",
    '    const walk = (n, depth, p) => {',
    "      const name = String(n.name || '');",
    "      const path = p + '/' + name;",
    '      if (re.test(name)) {',
    '        const size = n.getContentSize();',
    '        const table = (n._eventProcessor && n._eventProcessor._callbackTable) || {};',
    '        out.nodes.push({ path, depth, active: n.active, inHierarchy: n.activeInHierarchy,',
    '          x: Math.round(n.position.x), y: Math.round(n.position.y),',
    '          w: Math.round(size.width), h: Math.round(size.height),',
    '          opacity: n.opacity, hasButton: !!n.getComponent(cc.Button),',
    "          listeners: Object.keys(table).filter((k) => k === 'click' || k === 'touchstart' || k === 'touchend') });",
    '      }',
    '      const kids = n.children || [];',
    '      for (let i = 0; i < kids.length; i++) walk(kids[i], depth + 1, path);',
    '    };',
    "    if (scene) walk(scene, 0, '');",
    '  } catch (e) { out.err = String(e && e.message); }',
    '  try {',
    "    const m = window.__require && window.__require('ConfigContext');",
    '    const C = m && (m.ConfigContext || m.default);',
    "    if (C && C.instance && C.instance.getAdSwitch2) out.switchOpenShopDiamond = C.instance.getAdSwitch2('open_shop_diamond');",
    '  } catch (e) { out.switchErr = String(e && e.message); }',
    '  return out;',
    '})()',
  ].join('\n');
  return src;
}

function pointExpr(pattern) {
  const src = [
    '(() => {',
    '  const re = new RegExp(' + JSON.stringify(pattern) + ", 'i');",
    '  const found = [];',
    '  const walk = (n) => { if (re.test(String(n.name || "")) && n.activeInHierarchy) found.push(n); (n.children || []).forEach(walk); };',
    '  const scene = cc.director.getScene();',
    '  if (scene) walk(scene);',
    '  return found.map((n) => {',
    '    const world = n.convertToWorldSpaceAR(cc.v2(0, 0));',
    '    const screen = cc.Camera.main.getWorldToScreenPoint(world);',
    '    const canvas = document.getElementById("GameCanvas");',
    '    const rect = canvas.getBoundingClientRect();',
    '    const vp = cc.view.getViewportRect();',
    '    const vs = cc.view.getVisibleSize();',
    '    return { name: n.name,',
    '      world: [Math.round(world.x), Math.round(world.y)], screen: [Math.round(screen.x), Math.round(screen.y)],',
    '      canvas: [canvas.width, canvas.height], rect: [Math.round(rect.left), Math.round(rect.top), Math.round(rect.width), Math.round(rect.height)],',
    '      viewport: [Math.round(vp.x), Math.round(vp.y), Math.round(vp.width), Math.round(vp.height)],',
    '      visible: [Math.round(vs.width), Math.round(vs.height)],',
    '      cssX: Math.round(rect.left + (screen.x / vs.width) * rect.width),',
    '      cssY: Math.round(rect.top + ((vs.height - screen.y) / vs.height) * rect.height),',
    '    };',
    '  });',
    '})()',
  ].join('\n');
  return src;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.url) throw new Error('缺少 --url');
  if (opts.viaSuite) return viaSuite(opts);

  const info = await chrome.launch({
    userDataDir: path.join(STATE, 'profiles', 'yt-ui-probe'),
    port: opts.port,
    headless: opts.headless,
    proxy: 'http://127.0.0.1:7890',
    url: opts.url,
  });
  const s = await CdpSession.attachPage(opts.port);
  await s.enableCollect();
  await s.waitFor('!!(window.cc && cc.director && cc.director.getScene && cc.director.getScene())', { timeoutMs: 90000 });
  console.log('引擎已启动，等 ' + opts.wait + ' 秒让界面稳定...');
  await sleep(opts.wait * 1000);

  if (opts.evalFile) {
    opts.evalExpr = require('fs').readFileSync(path.resolve(opts.evalFile), 'utf8');
  }
  if (opts.evalExpr) {
    try {
      const r = await s.eval(opts.evalExpr);
      console.log('=== 前置 eval 结果 ===');
      console.log(typeof r === 'string' ? r : JSON.stringify(r, null, 2));
      await sleep(2500);
    } catch (e) {
      console.log('前置 eval 失败: ' + e.message);
    }
  }

  const before = await s.eval(sceneExpr(opts.name));
  console.log('=== 场景 ' + before.scene + ' 里匹配 /' + opts.name + '/ 的节点 ===');
  console.log('ConfigContext.getAdSwitch2("open_shop_diamond") = ' + JSON.stringify(before.switchOpenShopDiamond));
  for (const n of before.nodes) {
    console.log('  ' + n.path + '  active=' + n.active + ' inHierarchy=' + n.inHierarchy +
      ' pos=(' + n.x + ',' + n.y + ') size=' + n.w + 'x' + n.h +
      ' opacity=' + n.opacity + ' button=' + n.hasButton + ' listeners=[' + n.listeners.join(',') + ']');
  }
  if (!before.nodes.length) console.log('  （没有匹配节点）');
  if (before.err) console.log('  场景扫描异常: ' + before.err);

  if (opts.click) {
    const points = await s.eval(pointExpr(opts.name));
    console.log('=== 真实点击（' + points.length + ' 个可见候选）===');
    for (const p of points) {
      console.log('  点击 ' + p.name + ' @ css(' + p.cssX + ',' + p.cssY + ')\n    ' + JSON.stringify(p));
      await s.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: p.cssX, y: p.cssY, button: 'left', clickCount: 1 });
      await s.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: p.cssX, y: p.cssY, button: 'left', clickCount: 1 });
      await sleep(1200);
      const names = await s.eval('(() => { const a = []; const w = (n) => { a.push(String(n.name || "")); (n.children || []).forEach(w); }; const sc = cc.director.getScene(); if (sc) w(sc); return a; })()');
      console.log('    点击后场景节点数 = ' + names.length + '；相关: ' +
        names.filter((n) => /week|gift|popup|pass/i.test(n)).slice(0, 12).join(', '));
    }
  }

  console.log('\n=== 页面日志（末尾 1500 字符）===');
  console.log(s.logsText().slice(-1500));
  s.close();
  chrome.kill(info.proc);
}

/**
 * 在官方测试套件里跑同一套探测：套件页 → 加载游戏 → 直连游戏 iframe 做 eval/扫场景，
 * 点击时用「套件页坐标（iframe 偏移 + iframe 内部坐标）」发真实鼠标事件，最接近人工点击。
 */
async function viaSuite(opts) {
  const host = new URL(opts.url).host;
  const info = await chrome.launch({
    userDataDir: path.join(STATE, 'profiles', 'yt-ui-probe-suite'),
    port: opts.port,
    headless: opts.headless,
    proxy: 'http://127.0.0.1:7890',
  });
  const page = await CdpSession.attachPage(opts.port);
  await page.enableCollect();
  await page.navigate(SUITE_URL);
  await page.waitFor(
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
  await page.eval(`(() => {
    const deep = (sel, root = document, out = []) => {
      for (const el of root.querySelectorAll('*')) {
        if (el.shadowRoot) deep(sel, el.shadowRoot, out);
        if (el.matches && el.matches(sel)) out.push(el);
      }
      return out;
    };
    window.__deep = deep;
    const input = deep('#url-input')[0];
    const btn = deep('#refresh-button')[0];
    input.value = ${JSON.stringify(opts.url)};
    input.dispatchEvent(new Event('input', { bubbles: true }));
    if (btn) btn.click();
    return 'loaded';
  })()`);

  // 找到游戏 iframe target（直连用于 eval）
  let target = null;
  for (let i = 0; i < 200 && !target; i++) {
    await sleep(300);
    const list = await httpJson('http://127.0.0.1:' + opts.port + '/json/list').catch(() => []);
    target = (list || []).find((t) => t.url && t.url.includes(host));
  }
  if (!target) throw new Error('没有找到游戏 iframe');
  const game = await CdpSession.connect(target.webSocketDebuggerUrl);
  await game.send('Runtime.enable').catch(() => {});
  console.log('套件里已加载游戏: ' + target.url);
  await sleep(opts.wait * 1000);

  const iframeRectExpr = '(() => { const f = window.__deep("#playable-iframe")[0]; if (!f) return null; const r = f.getBoundingClientRect(); return { left: r.left, top: r.top, width: r.width, height: r.height }; })()';

  if (opts.evalFile) opts.evalExpr = require('fs').readFileSync(path.resolve(opts.evalFile), 'utf8');
  if (opts.evalExpr) {
    const r = await game.eval(opts.evalExpr).catch((e) => '失败: ' + e.message);
    console.log('=== 套件内前置 eval ===\n' + (typeof r === 'string' ? r : JSON.stringify(r)));
    await sleep(2000);
  }

  const before = await game.eval(sceneExpr(opts.name)).catch((e) => ({ err: String(e.message) }));
  console.log('=== 套件内场景节点（/' + opts.name + '/）===');
  console.log('getAdSwitch2(open_shop_diamond) = ' + JSON.stringify(before.switchOpenShopDiamond));
  for (const n of before.nodes || []) {
    console.log('  ' + n.path + ' active=' + n.active + ' inHierarchy=' + n.inHierarchy + ' pos=(' + n.x + ',' + n.y + ') size=' + n.w + 'x' + n.h + ' button=' + n.hasButton);
  }

  const env = await game.eval('(() => { const c = document.getElementById("GameCanvas"); const r = c.getBoundingClientRect(); const vs = cc.view.getVisibleSize(); return { inner: [innerWidth, innerHeight], canvasRect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], canvasBacking: [c.width, c.height], visible: [Math.round(vs.width), Math.round(vs.height)] }; })()');
  const frame = await page.eval(iframeRectExpr);
  console.log('=== 尺寸信息 ===');
  console.log('  游戏 iframe 在套件页里: ' + JSON.stringify(frame));
  console.log('  iframe 内部: ' + JSON.stringify(env));

  if (opts.click) {
    const points = await game.eval(pointExpr(opts.name));
    let beforeAll = null;
    console.log('=== 套件内真实点击（' + points.length + ' 个可见候选）===');
    for (const p of points) {
      const x = Math.round(frame.left + p.cssX);
      const y = Math.round(frame.top + p.cssY);
      console.log('  点击 ' + p.name + ' -> 套件页坐标(' + x + ',' + y + ')，iframe 内(' + p.cssX + ',' + p.cssY + ')');
      // 反向校验：把 CSS 坐标交给引擎自己的换算，看是否回到节点的世界坐标
      const back = await game.eval(`(() => { const v = cc.view.convertToLocationInView(${p.cssX}, ${p.cssY}, cc.v2()); return [Math.round(v.x), Math.round(v.y)]; })()`).catch(() => null);
      console.log('    引擎反算视图坐标 = ' + JSON.stringify(back) + '（节点世界坐标 = ' + JSON.stringify(p.world) + '）');
      if (opts.touch) {
        await page.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] });
        await page.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      } else {
        await page.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
        await page.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
      }
      await sleep(1500);
      const names = await game.eval('(() => { const a = []; const w = (n) => { a.push(String(n.name || "")); (n.children || []).forEach(w); }; const sc = cc.director.getScene(); if (sc) w(sc); return a; })()').catch(() => []);
      if (!beforeAll) beforeAll = names;
      const added = names.filter((n) => beforeAll.indexOf(n) < 0).slice(0, 12);
      console.log('    点击后场景节点数 = ' + names.length + '；新增节点: ' + (added.join(', ') || '(无)'));
    }
  }

  // 固定坐标点击（iframe 内部坐标），用来复现“某个位置点不动”
  if (opts.clickAt) {
    const pts = String(opts.clickAt).split(';').map((s) => s.split(',').map((n) => Number(n)));
    for (const parts of pts) {
      // 套件页面可能滚动，点击前重新测量 iframe 位置
      const liveFrame = await page.eval(iframeRectExpr);
      const x = Math.round(liveFrame.left + parts[0]);
      const y = Math.round(liveFrame.top + parts[1]);
      const what = await game.eval(`(() => { const el = document.elementFromPoint(${parts[0]}, ${parts[1]}); if (!el) return 'null'; return el.tagName + (el.id ? '#' + el.id : '') + ' cls=' + String(el.className).slice(0,40); })()`);
      console.log('=== 固定坐标点击 iframe 内(' + parts[0] + ',' + parts[1] + ') 顶层元素=' + what + ' ===');
      if (opts.touch) {
        await page.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] });
        await page.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      } else {
        await page.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
        await page.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
      }
      await sleep(1500);
      const names = await game.eval('(() => { const a = []; const w = (n) => { a.push(String(n.name || "")); (n.children || []).forEach(w); }; const sc = cc.director.getScene(); if (sc) w(sc); return a; })()').catch(() => []);
      console.log('    点击后场景节点数 = ' + names.length);
      const evLog = await game.eval('JSON.stringify((window.__evLog || []).slice(-3))').catch(() => '[]');
      console.log('    引擎收到的视图坐标(最近3次) = ' + evLog);
    }
  }

  console.log('\n=== 游戏 iframe 日志（末尾 1200 字符）===');
  console.log(game.logsText().slice(-1200));
  game.close();
  page.close();
  chrome.kill(info.proc);
}

main().catch((e) => {
  console.error('失败: ' + e.message);
  process.exit(1);
});

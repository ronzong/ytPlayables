'use strict';
/**
 * AntFlow YouTube Playables 构建：把 gamePopStar/AntFlow/local-game（Yandex 本地单机版）
 * 复制到 staging 目录，并完成 YouTube 化改造。
 *
 * 用法:
 *   node tools/build-antflow-yt.cjs                     # 默认输出 build/AntFlow-yt
 *   node tools/build-antflow-yt.cjs --out build/xxx
 *   node tools/build-antflow-yt.cjs --zip               # 额外打包 zip（提交用）
 *
 * 改造点（游戏本体 src/、assets/、cocos-js/ 一行未改）：
 *   1. index.html 第一个 <script> 换成 https://www.youtube.com/game_api/v1（不带 async/defer）。
 *      —— 测试套件的 “SDK loaded before any game code” 就是按第一个 script 标签校验的。
 *   2. 删除 index.html 里 Yandex 那套 CSP meta（它的 script-src 白名单不含 youtube.com，
 *      会直接把 Playables SDK 拦掉）；本地测试由 tools/serve-https.cjs 注入官方同款 CSP。
 *   3. sdk.js（本地 Yandex 兼容层）替换为 platform/antflow-yandex-yt-bridge.js（ytgame 适配层）。
 *   4. 资源文件名里的 “@”（Cocos 子资源形如 <uuid>@<subId>.json）改成 “_”：
 *      YouTube 认证要求包内文件名只能含字母数字和 _ - .，测试套件会直接判 FAIL。
 *      做法：重命名文件 + 同步改写所有 .json 里的 <22位压缩uuid>@<subId> 引用
 *      + 给引擎的 decodeUuid / uuid 正则补上 “_” 分隔符（补丁带匹配次数校验）。
 *   5. 修 AntCubeBgPattern 背景网格在“画布尚未布局”时的爆炸性循环：
 *      updateSize() 会把 window.screen 尺寸乘进可见尺寸，若此刻帧尺寸还是 1x1，
 *      会算出 ~100 万像素的可见区，rebuildPattern 就要创建 6400x4800 个节点，主线程直接卡死
 *      （YouTube 测试套件里必现，且真实平台 iframe 同样可能触发）。补丁只加一个上限钳制。
 *
 * 每一步都做匹配次数校验，重复执行结果一致（幂等），匹配不上直接报错退出。
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DEFAULT_SRC = 'D:/works/Git/yxl/gamePopStar/AntFlow/local-game';
const DEFAULT_OUT = path.join(ROOT, 'build', 'AntFlow-yt');
const BRIDGE = path.join(ROOT, 'platform', 'antflow-yandex-yt-bridge.js');
const YT_SDK_TAG = '<script src="https://www.youtube.com/game_api/v1"></script>';

function parseArgs(argv) {
  const opts = { src: DEFAULT_SRC, out: DEFAULT_OUT, zip: false, sdk: BRIDGE };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--src') opts.src = argv[++i];
    else if (argv[i] === '--out') opts.out = argv[++i];
    else if (argv[i] === '--zip') opts.zip = true;
    else if (argv[i] === '--sdk') opts.sdk = path.resolve(argv[++i]);
  }
  return opts;
}

function replaceExactly(text, from, to, label, expect) {
  const count = text.split(from).length - 1;
  if (count !== expect) {
    throw new Error('[' + label + '] 期望匹配 ' + expect + ' 处，实际 ' + count + ' 处；源文件可能已变更，已停止');
  }
  return expect === 0 ? text : text.split(from).join(to);
}

function patchIndexHtml(html) {
  let out = html;

  // 1) 去掉 Yandex CSP meta（整段 <meta http-equiv="Content-Security-Policy" ... />）
  if (/Content-Security-Policy/.test(out)) {
    const before = out.length;
    out = out.replace(/<meta http-equiv="Content-Security-Policy"[\s\S]*?\/>\s*/i, '');
    if (out.length === before) throw new Error('[csp] 找到 CSP 关键字但未能整段移除，请检查 index.html');
  }

  // 2) YouTube SDK 必须是第一个 script，且不能带 async/defer
  if (out.includes(YT_SDK_TAG)) {
    throw new Error('[sdk-first] index.html 已包含 YouTube SDK 标签，请勿重复构建到同一目录');
  }
  const anchor = '<script>globalThis.__YANDEX_GAMES_BUILD__ = true;</script>';
  out = replaceExactly(out, anchor, YT_SDK_TAG + '\n' + anchor, 'sdk-first', 1);

  // 3) 说明性注释（便于事后核对构建产物）
  out = replaceExactly(
    out,
    '<!-- 本地单机版使用本地 Yandex SDK 兼容层。 -->',
    '<!-- YouTube Playables 版：sdk.js 是 ytgame 适配层（由 tools/build-antflow-yt.cjs 生成）。 -->',
    'comment',
    1
  );
  return out;
}

/**
 * 修 AntCubeBgPattern.updateSize()：把可见尺寸钳制到 4000 世界单位。
 * 原因：window.screen 尺寸会被乘进可见尺寸，画布还没布局时（帧尺寸 1x1）会算出
 * 约 106万 x 80万 的可见区，rebuildPattern 因此要创建 6476x4859 ≈ 3100 万个节点，
 * 主线程从此卡死（YouTube 测试套件里必现；真实平台 iframe 尺寸异常时同样会触发）。
 * 只有这一处改动，不改变正常分辨率下的行为。
 */
function patchAntCubeBgPattern(outDir) {
  const file = path.join(outDir, 'assets', 'main', 'index.js');
  if (!fs.existsSync(file)) throw new Error('[antcube] 找不到 ' + file);
  const from =
    'i=Math.max(i,u*e.width/t.width),n=Math.max(n,p*e.height/t.height)}if(!(i>this.allocatedVisibleWidth+1||n>this.allocatedVisibleHeight+1))return!1;';
  const to =
    'i=Math.max(i,u*e.width/t.width),n=Math.max(n,p*e.height/t.height),i=Math.min(i,4000),n=Math.min(n,4000)}if(!(i>this.allocatedVisibleWidth+1||n>this.allocatedVisibleHeight+1))return!1;';
  const text = fs.readFileSync(file, 'utf8');
  if (text.includes(to)) {
    console.log('AntCubeBgPattern 补丁: 已存在，跳过');
    return;
  }
  fs.writeFileSync(file, replaceExactly(text, from, to, 'antcube-clamp', 1));
  console.log('AntCubeBgPattern 补丁: 可见尺寸上限 4000（修套件内主线程卡死）');
}

function dirStats(dir) {
  let files = 0;
  let bytes = 0;
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else {
        files += 1;
        bytes += fs.statSync(p).size;
      }
    }
  };
  walk(dir);
  return { files, bytes };
}

/** 递归列出所有文件（返回绝对路径数组）。 */
function walkFiles(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkFiles(p, out);
    else out.push(p);
  }
  return out;
}

/**
 * 消除资源文件名里的 “@”。
 * Cocos 构建产物里子资源叫 <uuid>@<subId>.json；YouTube 只允许字母数字和 _ - . 。
 * 重命名会破坏引用，所以引用侧（压缩 uuid）要同步把 “@” 换成 “_”，引擎的 uuid 解析也要一起改。
 */
function eliminateAtInAssetNames(outDir) {
  // 1) 重命名文件
  let renamed = 0;
  for (const p of walkFiles(outDir)) {
    const base = path.basename(p);
    if (!base.includes('@')) continue;
    const target = path.join(path.dirname(p), base.replace(/@/g, '_'));
    if (fs.existsSync(target)) throw new Error('[at-rename] 目标文件已存在: ' + target);
    fs.renameSync(p, target);
    renamed += 1;
  }
  if (renamed === 0) throw new Error('[at-rename] 没有找到带 @ 的文件，源文件可能已变更');
  console.log('重命名 ' + renamed + ' 个带 @ 的资源文件');

  // 2) 同步改写 .json 里的压缩 uuid 引用：<22位>@<subId> -> <22位>_<subId>
  const refRe = /([0-9A-Za-z+/]{22})@([0-9A-Za-z]+)/g;
  let files = 0;
  let hits = 0;
  for (const p of walkFiles(outDir)) {
    if (path.extname(p).toLowerCase() !== '.json') continue;
    const text = fs.readFileSync(p, 'utf8');
    const matches = text.match(refRe);
    if (!matches || matches.length === 0) continue;
    files += 1;
    hits += matches.length;
    fs.writeFileSync(p, text.replace(refRe, '$1_$2'));
  }
  if (hits === 0) throw new Error('[at-refs] 没有找到 <uuid>@<subId> 引用，源文件可能已变更');
  console.log('改写 ' + files + ' 个 json、共 ' + hits + ' 处 uuid@subId 引用');

  // 3) 引擎补丁：让 uuid 解析接受 “_” 作为子资源分隔符
  const engineFiles = walkFiles(outDir).filter((p) => /_virtual_cc-.*\.js$/.test(path.basename(p)));
  if (engineFiles.length === 0) throw new Error('[engine] 找不到 _virtual_cc-*.js');
  for (const p of engineFiles) {
    let text = fs.readFileSync(p, 'utf8');
    text = replaceExactly(text, 't.split("@")[0]', 't.split(/[@_]/)[0]', 'engine-decodeUuid', 1);
    text = replaceExactly(text, '[0-9a-fA-F-@]', '[0-9a-fA-F-@_]', 'engine-uuidRegex', 2);
    fs.writeFileSync(p, text);
    console.log('引擎补丁: ' + path.basename(p));
  }
  return { renamed, refFiles: files, refHits: hits };
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(opts.src)) throw new Error('源目录不存在: ' + opts.src);
  if (!fs.existsSync(BRIDGE)) throw new Error('适配层不存在: ' + BRIDGE);

  fs.rmSync(opts.out, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(opts.out), { recursive: true });

  console.log('复制 ' + opts.src + '  ->  ' + opts.out);
  fs.cpSync(opts.src, opts.out, { recursive: true });

  const htmlPath = path.join(opts.out, 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  const patched = patchIndexHtml(html);
  fs.writeFileSync(htmlPath, patched);
  console.log('index.html 已打补丁: 移除 Yandex CSP、YouTube SDK 置为第一个 script');

  fs.copyFileSync(opts.sdk, path.join(opts.out, 'sdk.js'));
  console.log('sdk.js 已替换为: ' + opts.sdk);

  const atResult = eliminateAtInAssetNames(opts.out);
  patchAntCubeBgPattern(opts.out);

  const stats = dirStats(opts.out);
  const report = {
    src: opts.src,
    out: opts.out,
    files: stats.files,
    totalMiB: +(stats.bytes / 1048576).toFixed(2),
    atRenamed: atResult.renamed,
    atRefHits: atResult.refHits,
    builtAt: new Date().toISOString(),
  };
  console.log('构建完成: ' + stats.files + ' 个文件, ' + report.totalMiB + ' MiB');

  if (opts.zip) {
    const zipPath = path.join(ROOT, 'build', 'AntFlow-yt-' + Date.now() + '.zip');
    console.log('打包 ' + zipPath + ' ...');
    execFileSync(
      'powershell.exe',
      [
        '-NoProfile',
        '-Command',
        'Compress-Archive -Path "' + opts.out + '\\*" -DestinationPath "' + zipPath + '" -Force',
      ],
      { stdio: 'inherit' }
    );
    report.zip = zipPath;
    console.log('zip: ' + zipPath);
  }

  fs.writeFileSync(path.join(ROOT, 'build', 'antflow-yt-build.json'), JSON.stringify(report, null, 2));
}

main();

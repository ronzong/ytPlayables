'use strict';
/**
 * Wasteland Survivor YouTube Playables 构建
 *
 *   node tools/build-wasteland-yt.cjs                 # 输出 build/WastelandSurvivor-yt
 *   node tools/build-wasteland-yt.cjs --out <目录>    # 换输出目录（诊断构建建议放 %TEMP%\yt-diag\...）
 *   node tools/build-wasteland-yt.cjs --zip           # 额外打 zip（放 build/ 根目录，包内根目录有 index.html）
 *
 * 源目录（只读）：D:/works/Git/yxl/gamePopStar/WastelandSurvivor/local-game
 *
 * 改造点（游戏本体 assets/ 与 js/ 只动两处最小补丁，其余全是替换平台层文件）：
 *   1. index.html：YouTube SDK 置为文档里第一个 <script>（无 async/defer），删除 Volan/Yandex 的 CSP meta
 *   2. sdk.js            ← platform/lib/yt-runtime.js + platform/wasteland-volan-yt.js（拼接）
 *   3. fb-mock.js        ← platform/wasteland-fbinstant-yt.js（FBInstant 兼容层，内购/社区/锦标赛按平台规则关闭）
 *   4. ad.js             ← platform/wasteland-ad-yt.js（去掉本地广告模拟，接 ytgame.ads）
 *   5. remote-player-save.js ← platform/wasteland-save-yt.js（改成 ytgame 云存档）
 *   6. src/settings.js   ：jsList 去掉第三方统计插件 gravityengine（合规：不得使用平台外统计）
 *      并删除该插件文件（去掉后无人引用）
 *   7. js/index.js       ：2 处裸 localStorage 改成 window.__ytStorage（Playables 里 localStorage 为 null）
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { replaceExactly, walkFiles, dirStats } = require('./lib/patch-utils.cjs');

const ROOT = path.join(__dirname, '..');
const DEFAULT_SRC = 'D:/works/Git/yxl/gamePopStar/WastelandSurvivor/local-game';
const DEFAULT_OUT = path.join(ROOT, 'build', 'WastelandSurvivor-yt');
const RUNTIME = path.join(ROOT, 'platform', 'lib', 'yt-runtime.js');
const BRIDGES = {
  'sdk.js': [RUNTIME, path.join(ROOT, 'platform', 'wasteland-volan-yt.js')],
  'fb-mock.js': [path.join(ROOT, 'platform', 'wasteland-fbinstant-yt.js')],
  'ad.js': [path.join(ROOT, 'platform', 'wasteland-ad-yt.js')],
  'remote-player-save.js': [path.join(ROOT, 'platform', 'wasteland-save-yt.js')],
};
const YT_SDK_TAG = '<script src="https://www.youtube.com/game_api/v1"></script>';
const ANALYTICS_PLUGIN = 'assets/scripts/plugins/gravityengine.mg.cocoscreator.min.js';

function parseArgs(argv) {
  const opts = { src: DEFAULT_SRC, out: DEFAULT_OUT, zip: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--src') opts.src = argv[++i];
    else if (argv[i] === '--out') opts.out = argv[++i];
    else if (argv[i] === '--zip') opts.zip = true;
  }
  return opts;
}

function patchIndexHtml(html) {
  let out = html;

  // 1) 去掉 Volan/Yandex 的 CSP meta（它的 script-src 白名单不含 youtube.com，会拦掉 Playables SDK）
  const before = out.length;
  out = out.replace(/<meta http-equiv="Content-Security-Policy"[\s\S]*?\/>\s*/i, '');
  if (out.length === before) throw new Error('[csp] 未找到可移除的 CSP meta，请检查 index.html');

  // 2) YouTube SDK 必须是文档里第一个 script，且不带 async/defer
  const anchor = '<script src="sdk.js"></script>';
  if (out.indexOf('youtube.com/game_api') >= 0) throw new Error('[sdk-first] index.html 里已经有 YouTube SDK 标签，请重新从源目录构建');
  out = replaceExactly(out, anchor, YT_SDK_TAG + '\n' + anchor, 'sdk-first', 1);
  return out;
}

/** 去掉 jsList 里的第三方统计插件，并删除该插件文件 */
function stripAnalyticsPlugin(outDir) {
  const settingsPath = path.join(outDir, 'src', 'settings.js');
  const text = fs.readFileSync(settingsPath, 'utf8');
  const from = ', "' + ANALYTICS_PLUGIN + '"';
  if (text.indexOf(from) >= 0) {
    fs.writeFileSync(settingsPath, replaceExactly(text, from, '', 'jsList-analytics', 1));
    console.log('src/settings.js: jsList 去掉第三方统计插件 gravityengine');
  } else {
    console.log('src/settings.js: 未发现 gravityengine（已处理过），跳过');
  }
  // jsList 里的路径是相对 src/ 的，实际文件在 src/assets/scripts/plugins/...
  const pluginPath = path.join(outDir, 'src', ANALYTICS_PLUGIN.replace(/\//g, path.sep));
  if (fs.existsSync(pluginPath)) {
    fs.unlinkSync(pluginPath);
    console.log('已删除未被引用的第三方统计插件文件 gravityengine.mg.cocoscreator.min.js');
  }
}

/** js/index.js 里两处裸 localStorage（页面事件用的时间戳）改成内存存储 */
function patchIndexJsStorage(outDir) {
  const file = path.join(outDir, 'js', 'index.js');
  const text = fs.readFileSync(file, 'utf8');
  const patched = replaceExactly(text, 'localStorage[', 'window.__ytStorage[', 'js-index-storage', 2);
  if (patched !== text) {
    fs.writeFileSync(file, patched);
    console.log('js/index.js: 2 处裸 localStorage -> window.__ytStorage');
  }
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(opts.src)) throw new Error('源目录不存在: ' + opts.src);
  for (const files of Object.values(BRIDGES)) {
    for (const f of files) {
      if (!fs.existsSync(f)) throw new Error('适配层文件不存在: ' + f);
    }
  }

  fs.rmSync(opts.out, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(opts.out), { recursive: true });
  console.log('复制 ' + opts.src + '  ->  ' + opts.out);
  fs.cpSync(opts.src, opts.out, { recursive: true });

  // 入口页
  const htmlPath = path.join(opts.out, 'index.html');
  fs.writeFileSync(htmlPath, patchIndexHtml(fs.readFileSync(htmlPath, 'utf8')));
  console.log('index.html: 删除 Volan CSP meta，YouTube SDK 置为第一个 script');

  // 平台层替换（runtime 拼接在 sdk.js 前面）
  for (const [target, sources] of Object.entries(BRIDGES)) {
    const parts = sources.map((f) => fs.readFileSync(f, 'utf8'));
    fs.writeFileSync(path.join(opts.out, target), parts.join('\n'));
    console.log(target + '  <- ' + sources.map((f) => path.basename(f)).join(' + '));
  }

  stripAnalyticsPlugin(opts.out);
  patchIndexJsStorage(opts.out);

  const stats = dirStats(opts.out);
  const report = {
    src: opts.src,
    out: opts.out,
    files: stats.files,
    totalMiB: +(stats.bytes / 1048576).toFixed(2),
    builtAt: new Date().toISOString(),
  };
  console.log('构建完成: ' + stats.files + ' 个文件, ' + report.totalMiB + ' MiB');

  if (opts.zip) {
    const zipPath = path.join(ROOT, 'build', 'WastelandSurvivor-yt-' + Date.now() + '.zip');
    console.log('打包 ' + zipPath + ' ...');
    execFileSync('powershell.exe', [
      '-NoProfile',
      '-Command',
      'Compress-Archive -Path "' + opts.out + '\\*" -DestinationPath "' + zipPath + '" -Force',
    ], { stdio: 'inherit' });
    report.zip = zipPath;
    console.log('zip: ' + zipPath);
  }

  fs.writeFileSync(
    path.join(path.dirname(path.resolve(opts.out)), path.basename(path.resolve(opts.out)) + '-build.json'),
    JSON.stringify(report, null, 2)
  );
}

main();

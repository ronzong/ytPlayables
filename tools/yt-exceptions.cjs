'use strict';
/**
 * 捕获游戏里被 try/catch 吞掉的异常。
 *
 * 用途：排查“游戏静默卡住/某段逻辑没生效”这类问题。Cocos 和不少游戏会把异常吞掉，
 * 控制台里看不到任何东西；这个工具直接开 Debugger 的“异常即暂停”，把每一次异常
 * （包括被捕获的）和调用栈打印出来。
 *
 * 用法:
 *   node tools/yt-exceptions.cjs https://localhost:8001/            # 直接开游戏页
 *   node tools/yt-exceptions.cjs https://localhost:8001/#ytdebug    # 顺便开适配层心跳
 *
 * 注意：需要 Chrome（默认走 127.0.0.1:7890 代理，端口 9232，独立 profile）。
 */

const path = require('path');
const { CdpSession, sleep } = require('./lib/cdp.cjs');
const chrome = require('./lib/chrome.cjs');

const GAME = process.argv[2] || 'https://localhost:8001/';

async function main() {
  const info = await chrome.launch({
    userDataDir: path.join(__dirname, 'state', 'profiles', 'yt-exceptions'),
    port: 9232,
    headless: false,
    proxy: 'http://127.0.0.1:7890',
    url: GAME,
  });
  const s = await CdpSession.attachPage(9232);
  await s.enableCollect();
  s.on('Debugger.paused', (p) => {
    if (p.reason !== 'exception') return;
    const d = p.data || {};
    const desc = String(d.description || d.value || '').split('\n').filter(Boolean);
    console.log('[异常] ' + desc.slice(0, 3).join(' | '));
    const frames = (p.callFrames || []).slice(0, 6).map((f) => '      ' + (f.functionName || '(anon)') + ' @ ' + String(f.url || '').split('/').slice(-1)[0]);
    if (frames.length) console.log(frames.join('\n'));
    try {
      s.send('Debugger.resume');
    } catch {
      /* ignore */
    }
  });
  try {
    await s.send('Debugger.enable');
    await s.send('Debugger.setPauseOnExceptions', { state: 'all' });
    console.log('已开启“异常即暂停”，观察 24 秒...');
  } catch (e) {
    console.log('Debugger 启用失败: ' + e.message);
  }
  await sleep(24000);
  console.log('\n--- 页面日志尾部 ---');
  console.log(s.logsText().slice(-2000));
  s.close();
  chrome.kill(info.proc);
}

main().catch((e) => {
  console.error('失败: ' + e.message);
  process.exit(1);
});

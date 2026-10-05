'use strict';
/**
 * Chrome 查找 / 启动 / 关闭（YouTube Playables 测试用）。
 * 与 gamePopStar/fb-tools/lib/chrome.js 的差异：
 *  - 默认带 --proxy-server，因为本机访问 developers.google.com / youtube.com 必须走 Clash 代理；
 *    localhost / 127.0.0.1 默认绕过代理（Chromium 隐式 bypass loopback）。
 *  - 默认带 --ignore-certificate-errors / --allow-insecure-localhost，便于加载自签证书的本地 https。
 */

const { spawn, execFile } = require('child_process');
const fs = require('fs');
const { waitDebugPort } = require('./cdp.cjs');

const DEFAULT_PATHS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
];

function findChrome(explicitPath) {
  for (const p of explicitPath ? [explicitPath] : DEFAULT_PATHS) {
    if (p && fs.existsSync(p)) return p;
  }
  throw new Error('未找到 Chrome/Edge，请用 --chrome <path> 指定');
}

async function launch(opts = {}) {
  const {
    chromePath,
    userDataDir,
    port,
    headless = false,
    url = null,
    proxy = 'http://127.0.0.1:7890',
    extraArgs = [],
  } = opts;
  const exe = findChrome(chromePath);
  fs.mkdirSync(userDataDir, { recursive: true });

  try {
    await waitDebugPort(port, 1200);
    return { proc: null, exe, port, userDataDir, reused: true };
  } catch {
    /* 端口空闲，正常启动 */
  }

  const args = [
    '--remote-debugging-port=' + port,
    '--user-data-dir=' + userDataDir,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-component-update',
    '--disable-sync',
    '--disable-notifications',
    '--ignore-certificate-errors',
    '--allow-insecure-localhost',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--disable-background-timer-throttling',
    '--disable-features=CalculateNativeWinOcclusion',
    '--window-size=1280,900',
  ];
  if (proxy) args.push('--proxy-server=' + proxy, '--proxy-bypass-list=<-loopback>;localhost;127.0.0.1');
  if (headless) args.push('--headless=new', '--disable-gpu', '--no-sandbox');
  args.push(...extraArgs);
  if (url) args.push(url);

  const proc = spawn(exe, args, { stdio: 'ignore' });
  await waitDebugPort(port, 30000);
  return { proc, exe, port, userDataDir, reused: false };
}

function kill(proc) {
  if (!proc || proc.killed) return;
  try {
    if (process.platform === 'win32') execFile('taskkill', ['/pid', String(proc.pid), '/T', '/F']);
    else proc.kill('SIGTERM');
  } catch {
    try {
      proc.kill('SIGKILL');
    } catch {
      /* ignore */
    }
  }
  proc.killed = true;
}

module.exports = { findChrome, launch, kill };

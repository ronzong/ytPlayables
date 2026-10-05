'use strict';
/**
 * 关闭本地 https 测试服务：找到监听指定端口的进程并结束它。
 *
 * 用法:
 *   node tools/stop-https.cjs 8001          # 关闭 8001 端口的服务（只允许 node 进程）
 *   node tools/stop-https.cjs 8001 --any    # 端口被别的程序占用时也强制结束
 *   node tools/stop-https.cjs --list        # 只列出各游戏端口当前的占用情况
 *
 * 安全约束：默认只结束 node.exe（我们的 serve-https.cjs），其它进程会让用户自己处理。
 */

const { execFileSync } = require('child_process');

const GAMES = [
  { label: 'nonogram（参考游戏）', port: 8000 },
  { label: 'AntFlow 油管小游戏版', port: 8001 },
];

function listeners(port) {
  let out = '';
  try {
    out = execFileSync('netstat', ['-ano'], { encoding: 'utf8' });
  } catch {
    return [];
  }
  const pids = new Set();
  for (const line of out.split(/\r?\n/)) {
    if (!/LISTENING/i.test(line)) continue;
    const parts = line.trim().split(/\s+/);
    const local = parts[1] || '';
    const pid = parts[parts.length - 1];
    if (local.endsWith(':' + port) && /^\d+$/.test(pid)) pids.add(Number(pid));
  }
  return [...pids];
}

function processName(pid) {
  try {
    // 注意：某些环境下 tasklist 会因权限输出 "ERROR: Access denied"，这里吞掉 stderr 避免污染输出
    const out = execFileSync('tasklist', ['/FI', 'PID eq ' + pid, '/FO', 'CSV', '/NH'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const m = out.match(/^"([^"]+)"/);
    return m ? m[1] : '';
  } catch {
    return '';
  }
}

function stop(pid) {
  try {
    execFileSync('taskkill', ['/PID', String(pid), '/F'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--list') || args.length === 0) {
    console.log('端口占用情况:');
    for (const g of GAMES) {
      const pids = listeners(g.port);
      const detail = pids.map((p) => p + '(' + (processName(p) || '?') + ')').join(', ');
      console.log('  ' + String(g.port).padEnd(6) + g.label + '  ' + (pids.length ? '占用中: ' + detail : '空闲'));
    }
    console.log('\n关闭某个端口: node tools/stop-https.cjs <端口>');
    return;
  }

  const port = Number(args[0]);
  const any = args.includes('--any');
  if (!Number.isInteger(port)) {
    console.error('用法: node tools/stop-https.cjs <端口> [--any]');
    process.exit(2);
  }
  const pids = listeners(port);
  if (!pids.length) {
    console.log('端口 ' + port + ' 当前没有监听进程。');
    return;
  }
  for (const pid of pids) {
    const name = processName(pid);
    const isNode = /^node(\.exe)?$/i.test(name);
    if (!isNode && !any) {
      console.log('端口 ' + port + ' 被 ' + name + '(PID ' + pid + ') 占用，不是 node 进程，已跳过。');
      console.log('确认要结束它请加 --any。');
      continue;
    }
    console.log((stop(pid) ? '已结束 ' : '结束失败 ') + name + '(PID ' + pid + ')');
  }
}

main();

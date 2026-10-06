'use strict';
/**
 * 按下面的登记表生成每个游戏的启动 bat（CRLF、UTF-8、无多行括号块）。
 *
 * 用法: node tools/gen-start-bats.cjs           # 生成/刷新 start-<id>.bat
 *       node tools/gen-start-bats.cjs --list    # 只打印端口登记表
 *
 * 约定（详见 AGENTS.md）：
 *   - 一个游戏一个固定端口，新增游戏先挑空闲端口再登记到本表，并同步 README 的端口表；
 *   - bat 必须是 CRLF 行尾：cmd.exe 解析 LF-only 批处理时，遇到多行 ( ) 块会错位闪退；
 *   - 这里只用单行命令，不写多行括号块，进一步降低风险。
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// ==== 端口登记表（新增游戏往这里加一行）====
const GAMES = [
  { id: 'nonogram', label: 'nonogram（参考游戏）', dir: 'nonogram', port: 8000 },
  { id: 'AntFlow-yt', label: 'AntFlow 油管小游戏版', dir: 'build/AntFlow-yt', port: 8001 },
  { id: 'WastelandSurvivor-yt', label: 'Wasteland Survivor 油管小游戏版', dir: 'build/WastelandSurvivor-yt', port: 8002 },
];

function batFor(game) {
  const lines = [
    '@echo off',
    'chcp 65001 >nul',
    'rem ' + game.label + ' - 本地 https 测试服务',
    'rem 端口 ' + game.port + ' / 目录 ' + game.dir + ' / 地址 https://localhost:' + game.port + '/',
    'cd /d "%~dp0"',
    'if not exist "tools\\certs\\cert.pem" node tools\\gen-certs.cjs',
    'if not exist "' + game.dir.replace(/\//g, '\\') + '" echo [错误] 缺少目录 ' + game.dir + '，请先构建 & goto :end',
    'echo.',
    'echo ============================================================',
    'echo   ' + game.label,
    'echo   地址   https://localhost:' + game.port + '/',
    'echo   目录   ' + game.dir,
    'echo   首次访问请在浏览器里点 [高级] - [继续前往] 忽略证书提示',
    'echo   停止   本窗口按 Ctrl+C，或另开窗口运行 node tools\\stop-https.cjs ' + game.port,
    'echo ============================================================',
    'echo.',
    'node tools\\serve-https.cjs ' + game.dir + ' ' + game.port,
    'echo.',
    'echo 服务已停止，错误码 %errorlevel%',
    ':end',
    'pause',
  ];
  return lines.join('\r\n') + '\r\n';
}

function main() {
  const onlyList = process.argv.includes('--list');

  console.log('端口登记表（本目录内唯一，改端口请同时更新 README）:');
  console.log('| 游戏 | 目录 | 端口 | 地址 |');
  console.log('| --- | --- | --- | --- |');
  for (const g of GAMES) {
    console.log('| ' + g.label + ' | `' + g.dir + '` | ' + g.port + ' | https://localhost:' + g.port + '/ |');
  }

  const ports = GAMES.map((g) => g.port);
  const dup = ports.filter((p, i) => ports.indexOf(p) !== i);
  if (dup.length) {
    console.error('端口重复: ' + dup.join(', '));
    process.exit(1);
  }
  if (onlyList) return;

  for (const g of GAMES) {
    const file = path.join(ROOT, 'start-' + g.id + '.bat');
    const text = batFor(g);
    // 校验：不允许出现纯 LF（cmd.exe 对 LF-only + 多行括号块会解析错位）
    const lfOnly = (text.match(/(?<!\r)\n/g) || []).length;
    if (lfOnly !== 0) {
      console.error('[gen-start-bats] ' + file + ' 存在 ' + lfOnly + ' 处纯 LF 换行，已中止');
      process.exit(1);
    }
    fs.writeFileSync(file, text, 'utf8');
    console.log('已生成 ' + path.basename(file) + '（CRLF, ' + text.length + ' 字节）');
  }
}

main();

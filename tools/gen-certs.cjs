'use strict';
/**
 * 生成本地 HTTPS 测试用的自签证书（tools/certs/cert.pem + key.pem）。
 * 证书 SAN 覆盖 localhost / 127.0.0.1 / ::1，有效期 825 天。
 *
 * 用法: node tools/gen-certs.cjs
 * 依赖: Git for Windows 自带的 openssl（C:\Program Files\Git\usr\bin\openssl.exe）；
 *       如果 PATH 里已有 openssl 也可以直接用。
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const CERT_DIR = path.join(__dirname, 'certs');
function addGitOpenSslCandidates(target, gitExe) {
  if (!gitExe) return;
  // Git for Windows 的 git.exe 通常位于 <Git>\cmd 或 <Git>\bin，
  // OpenSSL 位于同一安装目录下的 usr\bin。
  const gitRoot = path.dirname(path.dirname(gitExe));
  target.push(path.join(gitRoot, 'usr', 'bin', 'openssl.exe'));
}

const CANDIDATES = ['openssl'];
const programFiles = [
  process.env.ProgramFiles,
  process.env['ProgramFiles(x86)'],
  process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Programs'),
];
for (const base of programFiles.filter(Boolean)) {
  CANDIDATES.push(path.join(base, 'Git', 'usr', 'bin', 'openssl.exe'));
}

// 不假设 Git 一定安装在 C 盘：沿当前机器 PATH 中的 git.exe 推导 OpenSSL 位置。
try {
  const output = execFileSync('where.exe', ['git.exe'], {
    encoding: 'utf8',
    windowsHide: true,
  });
  for (const gitExe of output.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)) {
    addGitOpenSslCandidates(CANDIDATES, gitExe);
  }
} catch {
  /* PATH 中没有 Git 时继续使用常规候选路径 */
}

function findOpenssl() {
  for (const c of CANDIDATES) {
    try {
      execFileSync(c, ['version'], { stdio: 'ignore' });
      return c;
    } catch {
      /* 继续找下一个 */
    }
  }
  return null;
}

const openssl = findOpenssl();
if (!openssl) {
  console.error('没有找到 openssl。请安装 Git for Windows（自带 openssl）后重试。');
  process.exit(1);
}

fs.mkdirSync(CERT_DIR, { recursive: true });
execFileSync(
  openssl,
  [
    'req', '-x509', '-newkey', 'rsa:2048', '-nodes',
    '-keyout', path.join(CERT_DIR, 'key.pem'),
    '-out', path.join(CERT_DIR, 'cert.pem'),
    '-days', '825',
    '-subj', '/C=CN/O=ytPlayables/CN=localhost',
    '-addext', 'subjectAltName=DNS:localhost,IP:127.0.0.1,IP:0:0:0:0:0:0:0:1',
  ],
  { stdio: ['ignore', 'ignore', 'ignore'] }
);
console.log('证书已生成: ' + CERT_DIR);
console.log('  cert.pem / key.pem（已被 .gitignore 忽略，仅本机使用）');

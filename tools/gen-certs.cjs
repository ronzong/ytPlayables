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
const CANDIDATES = [
  'openssl',
  'C:/Program Files/Git/usr/bin/openssl.exe',
  'C:/Program Files (x86)/Git/usr/bin/openssl.exe',
];

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

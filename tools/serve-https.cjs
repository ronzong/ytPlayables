'use strict';
/**
 * YouTube Playables 本地测试用的 HTTPS 静态服务器（自签证书）。
 *
 * Playables 测试套件要求用 https 加载游戏（iframe 里不能是 http）。
 * 用法:
 *   node tools/serve-https.cjs <目录> [端口] [选项]
 *
 * 选项:
 *   --host <host>     绑定主机名，默认 localhost（测试套件输入的 url 必须与之一致）
 *   --no-csp          不注入生产环境同款 CSP（默认注入，便于提前发现 CSP 违规）
 *   --quiet           不打印每个请求
 *
 * 默认端口 8000，对应测试套件输入框示例 https://localhost:8000
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// 线上托管会对文本资源做压缩，本地服务器也开一份，避免本地测试把“未压缩传输”当成真实加载时间。
const GZIP_TYPES = /^(text\/|application\/(json|javascript|xml|manifest\+json)|image\/svg)/;
const gzipCache = new Map();

function maybeGzip(req, filePath, type, buf) {
  if (buf.length < 1024) return null;
  if (!GZIP_TYPES.test(type)) return null;
  const accept = String(req.headers['accept-encoding'] || '');
  if (!accept.includes('gzip')) return null;
  let stat;
  try {
    stat = fs.statSync(filePath);
  } catch {
    return null;
  }
  const key = filePath + ':' + stat.mtimeMs + ':' + buf.length;
  if (gzipCache.has(key)) return gzipCache.get(key);
  const gz = zlib.gzipSync(buf);
  gzipCache.set(key, gz);
  if (gzipCache.size > 200) gzipCache.delete(gzipCache.keys().next().value);
  return gz;
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.cjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.wasm': 'application/wasm',
  '.bin': 'application/octet-stream',
  '.data': 'application/octet-stream',
  '.unityweb': 'application/octet-stream',
  '.bundle': 'application/octet-stream',
  '.ktx2': 'image/ktx2',
  '.basis': 'application/octet-stream',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.fbx': 'application/octet-stream',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.atlas': 'text/plain; charset=utf-8',
  '.fnt': 'text/plain; charset=utf-8',
  '.plist': 'application/xml; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.br': 'application/octet-stream',
};

// 官方测试套件指南给出的生产环境 CSP（本地替换 header 用，提前暴露违规请求）。
const PROD_CSP = [
  "default-src 'none'",
  "script-src 'report-sample' 'self' 'unsafe-eval' 'unsafe-inline' blob: https://www.youtube.com/game_api/v0 https://www.youtube.com/game_api/v0/ https://www.youtube.com/game_api/v1 https://www.youtube.com/game_api/v1/",
  "object-src 'none'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' blob: data:",
  "media-src 'self' blob:",
  "font-src 'self' data: https://fonts.googleapis.com https://fonts.gstatic.com",
  "connect-src 'self' blob: data:",
  'sandbox allow-pointer-lock allow-same-origin allow-scripts',
  "base-uri 'self'",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
].join('; ');

function parseArgs(argv) {
  const opts = { dir: '.', port: 8000, host: 'localhost', csp: true, quiet: false };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--host') opts.host = argv[++i];
    else if (a === '--port') opts.port = Number(argv[++i]);
    else if (a === '--no-csp') opts.csp = false;
    else if (a === '--quiet') opts.quiet = true;
    else rest.push(a);
  }
  if (rest[0]) opts.dir = rest[0];
  if (rest[1]) opts.port = Number(rest[1]);
  return opts;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const root = path.resolve(opts.dir);
  if (!fs.existsSync(root)) {
    console.error('目录不存在: ' + root);
    process.exit(2);
  }
  const certDir = path.join(__dirname, 'certs');
  const server = https.createServer(
    {
      cert: fs.readFileSync(path.join(certDir, 'cert.pem')),
      key: fs.readFileSync(path.join(certDir, 'key.pem')),
    },
    (req, res) => {
      let name;
      try {
        name = decodeURIComponent(req.url.split('?')[0]);
      } catch {
        res.writeHead(400);
        res.end('Bad request');
        return;
      }
      if (name === '/') name = '/index.html';
      const file = path.resolve(root, '.' + name);
      if (file !== root && !file.startsWith(root + path.sep)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      fs.readFile(file, (err, data) => {
        if (err) {
          console.log('[404] ' + req.method + ' ' + name);
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Not found');
          return;
        }
        const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
        const headers = {
          'Content-Type': type,
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': '*',
        };
        if (opts.csp && name.endsWith('.html')) headers['Content-Security-Policy'] = PROD_CSP;
        let body = data;
        const gz = maybeGzip(req, file, type, data);
        if (gz) {
          headers['Content-Encoding'] = 'gzip';
          headers['Vary'] = 'Accept-Encoding';
          body = gz;
        }
        res.writeHead(200, headers);
        res.end(body);
        if (!opts.quiet) console.log('[200] ' + req.method + ' ' + name + ' (' + body.length + 'B)');
      });
    }
  );
  server.on('error', (e) => {
    console.error('服务器启动失败: ' + e.message);
    process.exit(1);
  });
  server.listen(opts.port, opts.host, () => {
    console.log('HTTPS 服务已启动: https://' + opts.host + ':' + opts.port + '/  ->  ' + root);
    console.log('CSP: ' + (opts.csp ? '注入生产环境同款 Content-Security-Policy' : '未注入（--no-csp）'));
    console.log('首次访问浏览器会提示证书不受信任，点“高级 -> 继续前往”忽略即可；Ctrl+C 停止。');
  });
}

main();

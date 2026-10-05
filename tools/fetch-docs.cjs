'use strict';
// 临时工具：抓取 YouTube Playables 官方文档与 SDK 脚本，便于离线阅读接口面。
// 用法: node tools/fetch-docs.cjs
// 输出: .docs/<name>.txt
// 说明：
// 1. 本机 DNS 优先返回不可达 IPv6，直连必须强制 IPv4。
// 2. developers.google.com / youtube.com 直连不可达，必须走本机 Clash 代理
//    （默认 http://127.0.0.1:7890，可用环境变量 YT_FETCH_PROXY 覆盖）。

const fs = require('fs');
const path = require('path');
const net = require('net');
const tls = require('tls');
const https = require('https');
const zlib = require('zlib');
const { Agent } = require('https');

const OUT = path.join(__dirname, '..', '.docs');
const PROXY = process.env.YT_FETCH_PROXY || 'http://127.0.0.1:7890';

const URLS = {
  devsite_suite_module:
    'https://www.gstatic.com/devrel-devsite/prod/vfdb441d2e08dbd9d3e48d8cd72b242388a87bcf7626bf5fb9df50c2bdd4a70fd/developers/js/devsite_devsite_youtube_playables_test_suite_module__zh_cn.js',
  getting_started: 'https://developers.google.com/youtube/gaming/playables/reference/getting_started',
  test_suite: 'https://developers.google.com/youtube/gaming/playables/test_suite',
  sdk_v1: 'https://www.youtube.com/game_api/v1',
  requirements: 'https://developers.google.com/youtube/gaming/playables/certification/requirements',
  req_integration: 'https://developers.google.com/youtube/gaming/playables/certification/requirements_integration',
  req_monetization: 'https://developers.google.com/youtube/gaming/playables/certification/requirements_monetization',
  req_stability: 'https://developers.google.com/youtube/gaming/playables/certification/requirements_stability',
  req_privacydata: 'https://developers.google.com/youtube/gaming/playables/certification/requirements_privacydata',
  req_i18n: 'https://developers.google.com/youtube/gaming/playables/certification/requirements_i18n_l10n',
  sdk_reference: 'https://developers.google.com/youtube/gaming/playables/reference/sdk',
  test_suite_guide: 'https://developers.google.com/youtube/gaming/playables/reference/test_suite_guide',
  monetization: 'https://developers.google.com/youtube/gaming/playables/reference/monetization',
  samples_repo: 'https://raw.githubusercontent.com/google/web-game-samples/main/README.md',
};

// 极简 HTTP CONNECT 代理 Agent（Node 自带 https.Agent 不支持代理）
class ConnectProxyAgent extends Agent {
  constructor(proxyUrl, options) {
    super(options);
    const u = new URL(proxyUrl);
    this.proxyHost = u.hostname;
    this.proxyPort = Number(u.port || 80);
  }

  createConnection(options, cb) {
    const targetHost = options.host;
    const targetPort = options.port || 443;
    const socket = net.connect(this.proxyPort, this.proxyHost);
    let buf = Buffer.alloc(0);
    const fail = (err) => {
      socket.destroy();
      cb(err);
    };
    const onData = (chunk) => {
      buf = Buffer.concat([buf, chunk]);
      const end = buf.indexOf('\r\n\r\n');
      if (end === -1) return;
      socket.removeListener('data', onData);
      const head = buf.slice(0, end).toString('latin1');
      if (!/^HTTP\/1\.[01] 200/.test(head)) {
        fail(new Error('代理 CONNECT 失败: ' + head.split('\r\n')[0]));
        return;
      }
      const rest = buf.slice(end + 4);
      if (rest.length) socket.unshift(rest);
      const tlsSocket = tls.connect({ socket, servername: targetHost });
      tlsSocket.once('secureConnect', () => cb(null, tlsSocket));
      tlsSocket.once('error', fail);
    };
    socket.on('connect', () => {
      socket.write(
        'CONNECT ' + targetHost + ':' + targetPort + ' HTTP/1.1\r\n' +
        'Host: ' + targetHost + ':' + targetPort + '\r\n' +
        'Proxy-Connection: keep-alive\r\n\r\n'
      );
    });
    socket.on('data', onData);
    socket.once('error', fail);
  }
}

const proxyAgent = new ConnectProxyAgent(PROXY);

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function requestOnce(url, agent) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      {
        hostname: u.hostname,
        port: u.port || 443,
        path: u.pathname + u.search,
        method: 'GET',
        family: 4,
        agent,
        headers: {
          'User-Agent': UA,
          Accept: '*/*',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
        },
        timeout: 45000,
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const body = decodeBody(Buffer.concat(chunks), res.headers);
          resolve({ status: res.statusCode, headers: res.headers, body });
        });
      }
    );
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', reject);
    req.end();
  });
}

function decodeBody(body, headers) {
  const enc = String(headers['content-encoding'] || '').toLowerCase();
  try {
    if (enc.includes('gzip')) return zlib.gunzipSync(body);
    if (enc.includes('deflate')) return zlib.inflateSync(body);
    if (enc.includes('br')) return zlib.brotliDecompressSync(body);
  } catch {
    return body;
  }
  return body;
}

async function httpGet(url, agent, retries = 3) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      let current = url;
      for (let hop = 0; hop < 5; hop++) {
        const res = await requestOnce(current, agent);
        if (res.status >= 300 && res.status < 400 && res.headers.location) {
          current = new URL(res.headers.location, current).toString();
          continue;
        }
        return Object.assign({}, res, { url: current });
      }
      throw new Error('重定向过多');
    } catch (e) {
      lastErr = e;
      if (i < retries) await sleep(800 * (i + 1));
    }
  }
  throw lastErr || new Error('request failed');
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const [name, url] of Object.entries(URLS)) {
    try {
      const res = await httpGet(url, proxyAgent);
      fs.writeFileSync(path.join(OUT, name + '.txt'), res.body);
      console.log('OK ' + name + ' status=' + res.status + ' len=' + res.body.length);
    } catch (e) {
      console.log('ERR ' + name + ' ' + e.message);
    }
  }
}

main();

'use strict';
// 把 .docs/*.txt（HTML）转成便于阅读的纯文本 .docs/<name>.plain.txt。
// 用法: node tools/html2txt.cjs [name ...]

const fs = require('fs');
const path = require('path');

const DOCS = path.join(__dirname, '..', '.docs');

function htmlToText(html) {
  let s = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/(p|div|li|tr|h[1-6]|section|article|pre)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '');
  s = s
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
  return s
    .split('\n')
    .map((l) => l.replace(/[ \t\u00a0]+/g, ' ').trim())
    .filter((l, i, arr) => l !== '' || arr[i - 1] !== '')
    .join('\n');
}

const names = process.argv.slice(2);
const files = names.length
  ? names.map((n) => n + '.txt')
  : fs.readdirSync(DOCS).filter((f) => f.endsWith('.txt') && !f.includes('.plain.'));

for (const f of files) {
  const src = path.join(DOCS, f);
  if (!fs.existsSync(src)) {
    console.log('SKIP ' + f);
    continue;
  }
  const out = path.join(DOCS, f.replace(/\.txt$/, '.plain.txt'));
  fs.writeFileSync(out, htmlToText(fs.readFileSync(src, 'utf8')));
  console.log('OK ' + path.basename(out));
}

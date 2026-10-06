'use strict';
/**
 * 构建脚本共用的补丁工具：
 *   - replaceExactly: 按“期望匹配次数”做替换，对不上就抛错（避免源文件变了却静默成功、或重复执行叠加）
 *   - walkFiles / dirStats: 递归遍历与统计
 */

const fs = require('fs');
const path = require('path');

function replaceExactly(text, from, to, label, expect) {
  const count = text.split(from).length - 1;
  if (count !== expect) {
    throw new Error('[' + label + '] 期望匹配 ' + expect + ' 处，实际 ' + count + ' 处；源文件可能已变更，已停止');
  }
  return expect === 0 ? text : text.split(from).join(to);
}

function walkFiles(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkFiles(p, out);
    else out.push(p);
  }
  return out;
}

function dirStats(dir) {
  let files = 0;
  let bytes = 0;
  for (const p of walkFiles(dir)) {
    files += 1;
    bytes += fs.statSync(p).size;
  }
  return { files, bytes };
}

module.exports = { replaceExactly, walkFiles, dirStats };

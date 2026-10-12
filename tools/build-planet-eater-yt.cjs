'use strict';
// 从只读源目录重建；所有补丁均校验匹配次数，禁止手工修改 staging。
const fs = require('fs'), path = require('path'), zlib = require('zlib'), crypto = require('crypto');
const { replaceExactly, walkFiles, dirStats } = require('./lib/patch-utils.cjs');
const ROOT = path.resolve(__dirname, '..');
let src = 'C:/Works/git/yxl/FBIGCrack/FBIGCrack/PlanetEaterEvolution/local-game';
let out = path.join(ROOT, 'build/PlanetEaterEvolution-yt');
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--src') src = args[++i];
  else if (args[i] === '--out') out = args[++i];
  else if (args[i] !== '--zip') throw new Error('未知参数：' + args[i]);
}
src = path.resolve(src); out = path.resolve(out);
// 删除前验证最终绝对路径，不能覆盖源目录或任意上级目录。
if (out === src || src.startsWith(out + path.sep) || !out.startsWith(path.join(ROOT, 'build') + path.sep)) throw new Error('输出必须位于本仓库 build/ 内，且与源目录隔离');
const wasm = fs.readFileSync(path.join(src, 'Build/WebBuild.wasm.unityweb'));
if (crypto.createHash('sha256').update(wasm).digest('hex') !== '7784176ff51bf8c30996ac4146c14f61fd0d3dc90c2d2bda6e703df4f9483956') throw new Error('wasm 已改变，需重新确认菜单就绪地址');
let html = fs.readFileSync(path.join(src, 'index.html'), 'utf8');
html = replaceExactly(html, '<head>', '<head>\n    <script src="https://www.youtube.com/game_api/v1"></script>\n    <script src="yt-bridge.js"></script>', 'SDK-first', 1);
for (const tag of ['    <script src="local-offline-guard.js"></script>', '    <script src="local-sdk.js"></script>']) html = replaceExactly(html, tag, '', '移除本地替身', 1);
html = replaceExactly(html, 'WebBuild.wasm.unityweb', 'WebBuild.wasm.br', 'wasm-br', 1);
let framework = zlib.gunzipSync(fs.readFileSync(path.join(src, 'Build/WebBuild.framework.js.unityweb'))).toString();
const sync = 'syncfs:function(mount,populate,callback){IDBFS.getLocalSet(mount,function(err,local){if(err)return callback(err);IDBFS.getRemoteSet(mount,function(err,remote){if(err)return callback(err);var src=populate?remote:local;var dst=populate?local:remote;IDBFS.reconcile(src,dst,callback)})})}';
framework = replaceExactly(framework, sync, 'syncfs:function(mount,populate,callback){window.__ytUnitySync(FS,mount,populate,callback)}', 'Unity云存档', 1);
// 只替换引擎里的裸调用；Module.setInterval/clearInterval 属于 Unity 生命周期包装。
for (const [name,count] of Object.entries({setTimeout:15,setInterval:2,clearTimeout:2,clearInterval:5})) {
  const re=new RegExp('(?<![a-zA-Z0-9_.$])'+name+'\\(', 'g');
  const matches=framework.match(re)||[];
  if(matches.length!==count) throw new Error('Unity定时器 '+name+' 匹配数变化：'+matches.length);
  framework=framework.replace(re,'window.__ytUnityTimers.'+name+'(');
}
framework=replaceExactly(framework,'Module.setInterval(', 'window.__ytUnityTimers.setInterval(', 'Unity模块定时器',2);
framework=replaceExactly(framework,'Module.clearInterval(', 'window.__ytUnityTimers.clearInterval(', 'Unity模块取消定时器',1);
fs.rmSync(out, {recursive:true, force:true}); fs.mkdirSync(out, {recursive:true});
fs.cpSync(src, out, {recursive:true, filter:p => !p.endsWith('.local-orig') && !p.endsWith('local-sdk.js') && !p.endsWith('local-offline-guard.js')});
fs.writeFileSync(path.join(out,'index.html'),html);
fs.writeFileSync(path.join(out,'yt-bridge.js'), ['platform/lib/yt-runtime.js','platform/planet-eater-instgame-yt.js'].map(p=>fs.readFileSync(path.join(ROOT,p),'utf8')).join('\n'));
// 保留 Unity gzip 标记头，让自带解压器识别补丁后的 framework。
const original = fs.readFileSync(path.join(src,'Build/WebBuild.framework.js.unityweb'));
let offset=10; if(original[3]&4) offset+=2+original.readUInt16LE(offset);
if(original[3]&8) {while(original[offset++]);} if(original[3]&16) {while(original[offset++]);}
const gz = zlib.gzipSync(Buffer.from(framework),{level:9});
fs.writeFileSync(path.join(out,'Build/WebBuild.framework.js.unityweb'),Buffer.concat([original.subarray(0,offset),gz.subarray(10)]));
// Brotli 用浏览器原生解码，避免删资源/改玩法；服务器必须返回 Content-Encoding: br。
const cacheDir=path.join(ROOT,'tools/state/compression'); fs.mkdirSync(cacheDir,{recursive:true});
const cache=path.join(cacheDir,crypto.createHash('sha256').update(wasm).digest('hex')+'.br');
if (!fs.existsSync(cache)) fs.writeFileSync(cache,zlib.brotliCompressSync(zlib.gunzipSync(wasm),{params:{[zlib.constants.BROTLI_PARAM_QUALITY]:11}}));
fs.copyFileSync(cache,path.join(out,'Build/WebBuild.wasm.br'));
fs.unlinkSync(path.join(out,'Build/WebBuild.wasm.unityweb'));
for(const file of walkFiles(out)) if(!/^[a-zA-Z0-9_.-]+$/.test(path.basename(file)) || fs.statSync(file).size>=30*1048576) throw new Error('文件名或单文件体积不合规：'+file);
const stats=dirStats(out); if(stats.files>8000 || stats.bytes>=250*1048576) throw new Error('总包不合规');
fs.writeFileSync(path.join(ROOT,'build/PlanetEaterEvolution-yt-build.json'),JSON.stringify({src,out,...stats,totalMiB:stats.bytes/1048576},null,2));
console.log('构建完成：',stats.files,'文件，',(stats.bytes/1048576).toFixed(2),'MiB');
if(args.includes('--zip')) {
  const zip=path.join(ROOT,'build/PlanetEaterEvolution-yt.zip');
  // 用 .NET ZIP API，避免 PowerShell Archive 模块不可用；根目录直接包含 index.html。
  const command="Add-Type -AssemblyName System.IO.Compression; Add-Type -AssemblyName System.IO.Compression.FileSystem; $source='"+out.replace(/'/g,"''")+"'; $dest='"+zip.replace(/'/g,"''")+"'; if(Test-Path -LiteralPath $dest){Remove-Item -LiteralPath $dest}; $archive=[IO.Compression.ZipFile]::Open($dest,[IO.Compression.ZipArchiveMode]::Create); try { Get-ChildItem -LiteralPath $source -File -Recurse | ForEach-Object { $relative=$_.FullName.Substring($source.Length+1).Replace('\\','/'); [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive,$_.FullName,$relative,[IO.Compression.CompressionLevel]::Optimal) | Out-Null } } finally { $archive.Dispose() }";
  require('child_process').execFileSync('powershell.exe',['-NoProfile','-Command',command],{stdio:'inherit'});
}

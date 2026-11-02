'use strict';
// 五款已接 FB 游戏的 YouTube 转换；源仓库只读，所有文本补丁由版本指纹保护。
const fs=require('fs'),path=require('path'),z=require('zlib'),crypto=require('crypto');
const {walkFiles,replaceExactly,dirStats}=require('./patch-utils.cjs');
const ROOT=path.resolve(__dirname,'../..'),SOURCE='C:/Works/git/yxl/FBIGCrack/FBIGCrack';
const GAMES=['AirportSimulator3D','BeepMelody','BobaBubbleTeaDIY','BubbleMerge','DogsVsAliens'];
function sha(b){return crypto.createHash('sha256').update(b).digest('hex');}
function textSha(p){return sha(fs.readFileSync(p,'utf8').replace(/\r\n/g,'\n'));}
function combine(names){return names.map(n=>fs.readFileSync(path.join(ROOT,n),'utf8')).join('\n');}
function patch(file,from,to,label,count=1){fs.writeFileSync(file,replaceExactly(fs.readFileSync(file,'utf8'),from,to,label,count));}
function timers(s){return s.replace(/(?<![\w.$])((?:set|clear)(?:Timeout|Interval))\(/g,'window.__ytGameTimers.$1(').replace(/Module\.(setInterval|clearInterval)\(/g,'window.__ytGameTimers.$1(');}
function build(id,zip=false){
 if(!GAMES.includes(id))throw Error('未知游戏 '+id);
 const src=path.join(SOURCE,id,'local-game'),out=path.join(ROOT,'build',id+'-yt');
 const manifest=require('../manifests/fb-five-sources.json')[id];
 for(const [rel,expected] of Object.entries(manifest)){const file=path.join(src,rel);const actual=/\.(js|html|json|css)$/.test(rel)?textSha(file):sha(fs.readFileSync(file));if(actual!==expected)throw Error('源版本变化 '+id+'/'+rel);}
 if(!out.startsWith(path.join(ROOT,'build')+path.sep)||out===src)throw Error('输出路径不安全');
 fs.rmSync(out,{recursive:true,force:true});
 fs.cpSync(src,out,{recursive:true,filter:function(p){if(/\.(bak|orig|local-orig)(-|$)|\.online\.bak$|~$/.test(p))return false;if(id==='BubbleMerge'&&/\.(pkm|astc)$/.test(p))return false;return true;}});
 let html=fs.readFileSync(path.join(out,'index.html'),'utf8');
 html=html.replace(/<meta\b[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi,'');
 // 移除旧平台入口，原 JS 模块/引擎不变；兼容各入口使用的 ./ 前缀。
 html=html.replace(/<script\b[^>]*src=["'](?:\.\/)?(?:sdk|local-offline-guard|local-platform|playgama-bridge)\.js["'][^>]*>\s*<\/script>/g,'');
 html=replaceExactly(html,'<head>','<head>\n<script src="https://www.youtube.com/game_api/v1"></script>\n<script src="yt-bridge.js"></script>','SDK第一脚本',1);
 let bridges=['platform/lib/yt-runtime.js','platform/lib/yt-game-helpers.js'];
 if(['BeepMelody','BubbleMerge'].includes(id))bridges.push('platform/yandex-yt-bridge.js');
 if(id==='BobaBubbleTeaDIY')bridges.push('platform/playgama-yt-bridge.js');
 if(id==='DogsVsAliens')bridges.push('platform/lib/unity-cloud-yt.js','platform/dogsvaliens-gamepush-yt.js');
 if(id==='AirportSimulator3D')bridges.push('platform/lib/unity-cloud-yt.js','platform/airport-prime-yt.js');
 const bridgeText=combine(bridges);new(require('vm').Script)(bridgeText);fs.writeFileSync(path.join(out,'yt-bridge.js'),bridgeText);
 if(id==='BeepMelody'||id==='BobaBubbleTeaDIY'){
   let file=walkFiles(path.join(out,'assets')).find(f=>/index-[^.]+\.js$/.test(f));let s=fs.readFileSync(file,'utf8');
   if(id==='BobaBubbleTeaDIY')s=replaceExactly(s,'function sh(){','window.__ytFlushGameSave=sh;function sh(){','暂停提交业务存档',1);
   fs.writeFileSync(file,timers(s));
 }
 if(id==='BubbleMerge'){
   html=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,s=>s.includes('https://mc.yandex.ru/metrika/tag.js')?'':s);
   const main=path.join(out,'assets/main/index.js');let s=fs.readFileSync(main,'utf8');
   const start=s.indexOf('e("IndexedDBLocalStorage",class'),end=s.indexOf('}),r._RF.pop()',start);
   if(start<0||end<0)throw Error('IndexedDBLocalStorage 导出锚点变化');
   s=s.slice(0,start)+'e("IndexedDBLocalStorage",window.__ytAsyncStorage)'+s.slice(end+2);
   s=s.replace(/(?<![\w.])localStorage\b/g,'window.__ytStorage').replaceAll('window.localStorage','window.__ytStorage');fs.writeFileSync(main,timers(s));
   // 复用 FB 已验证的浏览器纹理选择；保留所有关卡与玩法资源。
   patch(path.join(out,'cocos-js/cc.js'),'SUPPORT_TEXTURE_FORMATS:[".astc",".pkm",".pvr",".webp",".jpg",".jpeg",".bmp",".png"]','SUPPORT_TEXTURE_FORMATS:[".webp",".jpg",".jpeg",".bmp",".png"]','浏览器纹理',1);
   patch(path.join(out,'cocos-js/cc.js'),'window.localStorage','window.__ytStorage','引擎存储兜底',1);
   for(const f of walkFiles(out))if(f.endsWith('.png')&&fs.existsSync(f.slice(0,-4)+'.webp'))fs.unlinkSync(f);
   // 本地业务后端响应保持源版结构，禁止回源。
   fs.copyFileSync(path.join(src,'local-platform.js'),path.join(out,'local-platform.js'));
   html=html.replace('<script src="yt-bridge.js"></script>','<script src="yt-bridge.js"></script>\n<script src="local-platform.js"></script>');
   let renamed=0;
   for(const f of walkFiles(out)){if(path.basename(f).includes('@')){fs.renameSync(f,path.join(path.dirname(f),path.basename(f).replace(/@/g,'_')));renamed++;}}
   if(renamed){for(const f of walkFiles(out))if(f.endsWith('.json'))fs.writeFileSync(f,fs.readFileSync(f,'utf8').replace(/([0-9A-Za-z+/]{22})@([0-9A-Za-z]+)/g,'$1_$2'));let engine=path.join(out,'cocos-js/cc.js'),s=fs.readFileSync(engine,'utf8');s=s.replaceAll('t.split("@")[0]','t.split(/[@_]/)[0]').replaceAll('[0-9a-fA-F-@]','[0-9a-fA-F-@_]');fs.writeFileSync(engine,s);}
 }
 if(id==='DogsVsAliens'){
   html=html.replace('<script src="yt-bridge.js"></script>','<script src="yt-bridge.js"></script>\n<script>window.__GS_BOOT_CFG__={sdkSrc:"./gamepush-yt.js"};</script>');
   fs.writeFileSync(path.join(out,'gamepush-yt.js'),'/* 桥在入口已安装；framework 加载本文件后触发 onGPInit。 */');
   let f=walkFiles(path.join(out,'Build')).find(f=>f.includes('.framework.js.'));let raw=fs.readFileSync(f);let compressed=raw[0]===31&&raw[1]===139;
   let s=compressed?z.gunzipSync(raw).toString():raw.toString();s=unityPatch(s);new(require('vm').Script)(s);fs.writeFileSync(f,s);
   html=html.replace('createUnityInstance(canvas, config,','(await window.__ytCloudReady, createUnityInstance)(canvas, config,');
   html=html.replace('loadingCover.style.display = "none";','loadingCover.style.display = "none";');
 }
 if(id==='AirportSimulator3D')html=airport(out,html);
 fs.writeFileSync(path.join(out,'index.html'),html);
 for(const f of walkFiles(out)){if(!/^[\w.-]+$/.test(path.basename(f)))throw Error('非法文件名 '+f);if(fs.statSync(f).size>=30*1048576)throw Error('单文件超限 '+f);}
 const stats=dirStats(out);if(stats.bytes>=250*1048576||stats.files>8000)throw Error('总包超限 '+id+' '+JSON.stringify(stats));
 fs.writeFileSync(path.join(ROOT,'build',id+'-yt-build.json'),JSON.stringify({id,source:src,...stats,totalMiB:stats.bytes/1048576},null,2));
 if(zip)pack(out,path.join(ROOT,'build',id+'-yt.zip'));
 console.log(id+': '+stats.files+' 文件 / '+(stats.bytes/1048576).toFixed(2)+' MiB');return out;
}
function unityPatch(s){
 const pattern=/syncfs:(?:function)?\((\w+),(\w+),(\w+)\)(?:=>)?\{IDBFS.getLocalSet\([\s\S]*?IDBFS.reconcile\([\s\S]*?\}\)\}\)\}/;
 const m=s.match(pattern);if(!m)throw Error('Unity IDBFS.syncfs 签名未知');s=s.replace(pattern,`syncfs:function(${m[1]},${m[2]},${m[3]}){window.__ytUnitySync(FS,${m[1]},${m[2]},${m[3]})}`);return timers(s);
}
function gzipUnity(data){const gz=z.gzipSync(data,{level:9}),head=Buffer.from(gz.subarray(0,10));head[3]=16;return Buffer.concat([head,Buffer.from('UnityWeb Compressed Content (gzip)\0'),gz.subarray(10)]);}
function airport(out,html){
 const dir=path.join(out,'Build'),files=fs.readdirSync(dir),src=path.join(SOURCE,'AirportSimulator3D/local-game');
 const cache=path.join(ROOT,'tools/state/airport-optimized');
 if(!fs.existsSync(path.join(cache,'Airport.data.raw'))){require('child_process').execFileSync('python',[path.join(ROOT,'tools/optimize-airport-assets.py'),'--src',src,'--out',cache],{env:{...process.env,PYTHONPATH:path.join(ROOT,'tools/state/python-libs')},stdio:'inherit'});}
 for(const type of ['data','wasm']){
   const target=path.join(cache,'Airport.'+type+'.brotli.q11');
   if(!fs.existsSync(target)){const raw=type==='data'?fs.readFileSync(path.join(cache,'Airport.data.raw')):fs.readFileSync(path.join(src,'Build',files.find(n=>n.endsWith('.wasm.br'))));fs.writeFileSync(target,z.brotliCompressSync(raw,{params:{[z.constants.BROTLI_PARAM_QUALITY]:11}}));}
   fs.copyFileSync(target,path.join(dir,'Airport.'+type+'.brotli'));
 }
 let framework=fs.readFileSync(path.join(dir,files.find(n=>n.includes('.framework.'))),'utf8');framework=unityPatch(framework);
 framework=replaceExactly(framework,'static{this.Ads=class extends m{async invokeBannerImpl(){r.createText("banner not available")}','static{this.Ads=class extends m{async initialize(){this.isInterstitialAvailable=false;this.isInterstitialReady=false;this.isRewardedAvailable=true;this.isRewardedReady=true;}async invokeBannerImpl(){}','prime广告可用性',1);
 for(const [name,reward,open,close]of [['Interstitial',false,'onInterstitialOpen','onInterstitialClose'],['Rewarded',true,'onRewardedOpen','onRewardedClose']]){
   framework=replaceExactly(framework,`async invoke${name}Impl(){r.createText("${name.toLowerCase()} not available"),this.${close}.invoke(!1)}`,`async invoke${name}Impl(){window.__ytPrimeAd(${reward},()=>this.${open}.invoke(),v=>this.${close}.invoke(v))}`,'prime广告转发'+name,1);
 }
 framework=replaceExactly(framework,'this.gameIsReadyImpl(),this.isGameReadyCalled=!0','this.gameIsReadyImpl(),this.isGameReadyCalled=!0,window.__ytPlayables.system.gameReady()','prime真实就绪信号',1);
 framework=framework.replace(/(?<![\w.])localStorage\b/g,'window.__ytStorage');new(require('vm').Script)(framework);
 fs.writeFileSync(path.join(dir,'Airport.framework.js'),framework);
 const loader=files.find(n=>n.endsWith('.loader.js'));fs.renameSync(path.join(dir,loader),path.join(dir,'Airport.loader.js'));
 let app=fs.readFileSync(path.join(out,'unityApp.js'),'utf8');
 for(const [suffix,newName]of [['loader.js','Airport.loader.js'],['data.br','Airport.data.brotli'],['wasm.br','Airport.wasm.brotli'],['framework.js.br','Airport.framework.js']])app=replaceExactly(app,'AirportSimBoardingRush[4]-primeSDK[5.2.7].'+suffix,newName,'资源名称'+suffix,1);
 app=replaceExactly(app,'const desktopAspectRatio = "16/9";','const desktopAspectRatio = "";','保留竖屏方向',1);
 app=replaceExactly(app,'script.onload = () => {','script.onload = async () => {\n await window.__ytCloudReady;\n [config.dataUrl,config.codeUrl]=await Promise.all([window.__ytDecodeAsset(config.dataUrl),window.__ytDecodeAsset(config.codeUrl)]);','无响应头解压',1);
 fs.writeFileSync(path.join(out,'unityApp.js'),app);
 for(const n of files)if(n.endsWith('.br'))fs.unlinkSync(path.join(dir,n));
 fs.copyFileSync(path.join(ROOT,'platform/lib/brotli-decode.js'),path.join(dir,'brotli-decode.js'));fs.copyFileSync(path.join(ROOT,'platform/lib/brotli-LICENSE.txt'),path.join(dir,'brotli-LICENSE.txt'));
 return html.replace('<script src="yt-bridge.js"></script>','<script src="yt-bridge.js"></script>\n<script src="Build/brotli-decode.js"></script>');
}
function pack(out,zip){const ps="$ErrorActionPreference='Stop';Add-Type -AssemblyName System.IO.Compression;Add-Type -AssemblyName System.IO.Compression.FileSystem;$source='"+out+"';$dest='"+zip+"';if(Test-Path -LiteralPath $dest){Remove-Item -LiteralPath $dest};$a=[IO.Compression.ZipFile]::Open($dest,[IO.Compression.ZipArchiveMode]::Create);try{Get-ChildItem -LiteralPath $source -File -Recurse|ForEach-Object{[IO.Compression.ZipFileExtensions]::CreateEntryFromFile($a,$_.FullName,$_.FullName.Substring($source.Length+1).Replace('\\','/'),[IO.Compression.CompressionLevel]::Optimal)|Out-Null}}finally{$a.Dispose()}";require('child_process').execFileSync('powershell.exe',['-NoProfile','-Command',ps],{stdio:'inherit'});}
module.exports={build,unityPatch,gzipUnity,timers,pack};

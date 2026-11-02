'use strict';
// 第三批：源文件指纹保护、从源重建；源仓库只读。
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {walkFiles,replaceExactly:R,dirStats}=require('./patch-utils.cjs'),{timers,pack}=require('./build-fb-five.cjs');
const ROOT=path.resolve(__dirname,'../..'),SOURCE='C:/Works/git/yxl/FBIGCrack/FBIGCrack';
const GAMES=['FlowerGardenBouquetSorting','FruitCafeMatch3','GardenSlide','GoingBalls3D','GrowIntoTheSun'];
function isText(f,b){return /\.(js|html|css|json)$/.test(f)||/\.(lmat|lh|ls|scene|atlas|txt)$/.test(f)&&/^[\s]*[\[{]/.test(b.toString('utf8',0,30))}
const skip=p=>/(?:\.(?:bak|orig|original|local-orig)(?:[-_.]|$)|~$)/.test(p)||p.includes(path.sep+'sdk-bundle'+path.sep);
function hash(f){let b=fs.readFileSync(f);if(isText(f,b))b=Buffer.from(b.toString().replace(/\r\n/g,'\n'));return crypto.createHash('sha256').update(b).digest('hex')}
function storage(s){return s.replace(/(?<![\w.$])localStorage\b(?!\s*:)/g,'window.__ytStorage').replaceAll('window.localStorage','window.__ytStorage').replaceAll('window["localStorage"]','window.__ytStorage')}
function combine(files){return files.map(f=>fs.readFileSync(path.join(ROOT,f),'utf8')).join('\n')}
function patch(file,a,b,label,n=1){fs.writeFileSync(file,R(fs.readFileSync(file,'utf8'),a,b,label,n))}
function build(id,zip=false){if(!GAMES.includes(id))throw Error('未知游戏');const src=path.join(SOURCE,id,'local-game'),out=path.join(ROOT,'build',id+'-yt');const manifest=require('../manifests/fb-third-sources.json')[id];
 for(const [rel,h]of Object.entries(manifest))if(hash(path.join(src,rel))!==h)throw Error('源版本变化 '+rel);
 if(!out.startsWith(path.join(ROOT,'build')+path.sep)||out===src)throw Error('输出越界');fs.rmSync(out,{recursive:true,force:true});fs.cpSync(src,out,{recursive:true,filter:p=>!skip(p)&&!(id==='GoingBalls3D'&&fs.statSync(p).isFile()&&fs.statSync(p).size===49&&fs.readFileSync(p,'utf8').includes('Not found at origin'))&&!(id==='GoingBalls3D'&&(p.includes(path.sep+'layaPlugin')||/(?:laya\.debugtool|workerloader)\.js$/.test(p)||(fs.statSync(p).isFile()&&!/^[\w.-]+$/.test(path.basename(p))&&!/\.(png|lmat)$/.test(p))))});
 let html=fs.readFileSync(path.join(out,'index.html'),'utf8').replace(/\r\n/g,'\n').replace(/<meta\b[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi,'');
 html=html.replace(/<script\b[^>]*src=["'](?:\.?\/)?(?:sdk|local-offline-guard|local-crazygames-sdk)\.js["'][^>]*>\s*<\/script>/g,'');
 const head=html.slice(0,html.indexOf('<head>')+6);if(!head.endsWith('<head>'))throw Error('head 缺失');html=R(html,head,head+'\n<script src="https://www.youtube.com/game_api/v1"></script>\n<script src="yt-bridge.js"></script>','SDK 第一脚本',1);
 let parts=['platform/lib/yt-runtime.js','platform/lib/yt-game-helpers.js'];if(['FlowerGardenBouquetSorting','GrowIntoTheSun'].includes(id))parts.push('platform/yandex-yt-bridge.js');parts.push('platform/third-batch-yt.js');
 fs.writeFileSync(path.join(out,'yt-bridge.js'),'window.__ytGameId='+JSON.stringify(id)+';\n'+combine(parts));
 if(id==='FruitCafeMatch3'){
  html=html.replace(/<script>[\s\S]*?<\/script>/g,s=>s.includes('本地平台适配层（离线单机版）')?'':s);
  patch(path.join(out,'assets/index-CIx3myyv.js'),'document.addEventListener("DOMContentLoaded",async()=>{','window.__ytWhenLoaded("DOMContentLoaded",async()=>{','延迟模块真实启动',1);
 }
 if(id==='GardenSlide')patch(path.join(out,'assets/index-DfOSjgH0.js'),'window.addEventListener("load",async()=>{','window.__ytWhenLoaded("load",async()=>{','延迟模块真实启动',1);
 if(id==='GoingBalls3D'){
  fs.writeFileSync(path.join(out,'local-gd-sdk.js'),"__ytCloudReady.then(function(){__ytGdEvent('SDK_READY')});");
  patch(path.join(out,'js/bundle.js'),'e.curUI = e.UIType.homeUI, super.Show(),','e.curUI = e.UIType.homeUI, super.Show(), window.__ytPlayables.system.gameReady(),','真实菜单就绪',1);
 }
 if(id==='FlowerGardenBouquetSorting'){
  let b=path.join(out,'bundle.js');patch(b,'i.src="/sdk.js",i.async=!0,e.parentNode.insertBefore(i,e)','i.src="sdk-ready.js",i.async=!0,document.head.appendChild(i)','预装 SDK 不插到官方之前',1);fs.writeFileSync(path.join(out,'sdk-ready.js'),'/* SDK 已由入口安装。 */');
  patch(b,'<iframe id="childIframe" src="','<iframe id="childIframe" data-yt-src="','同源内联子文档',1);
  patch(b,'setProgress(t){console.log("FlashistAdaptation __ GamePreloaderPageMediator | setProgress _ progress: ",t),this.totalProgress=t,','setProgress(t){t>=.999999&&(t=1),console.log("FlashistAdaptation __ GamePreloaderPageMediator | setProgress _ progress: ",t),this.totalProgress=t,','保留 FB 已验证的进度归一化',1);
  html=R(html,'<script src="bundle.js"></script>','<script>__ytCloudReady.then(function(){var s=document.createElement("script");s.src="bundle.js";document.body.appendChild(s)});</script>','先恢复云档后启动',1);
  const child=path.join(out,'flowers-sort'),entry=path.join(child,'iframe.html');let inner=fs.readFileSync(entry,'utf8');inner=R(inner,'<script src="../local-offline-guard.js"></script>','<script src="yt-child.js"></script>','子游戏运行时',1);inner=R(inner,'<script type="text/javascript" src="y8miniplay_1.0.0.44569.js"></script>','','禁用原门户运行时',1);fs.writeFileSync(entry,inner);
  fs.writeFileSync(path.join(child,'sdk.js'),combine(['platform/flower-y8-local.js']));
  fs.writeFileSync(path.join(child,'yt-child.js'),'window.ytgame=parent.ytgame;\n'+combine(['platform/lib/yt-runtime.js','platform/flower-child-yt.js','platform/lib/yt-game-helpers.js']));
  patch(path.join(child,'src/flashist-framework/iframePassingGlobalVars.js'),'new URLSearchParams(window.location.search)','new URLSearchParams(window.__ytOriginalQuery || window.location.search)','内联文档保留启动参数',1);
 }
 fs.writeFileSync(path.join(out,'index.html'),html);
 // 原游戏与引擎均走同一内存存储/定时器闸门，避免库内数据库检测与独立定时器漏网。
 const bridgeFiles=new Set(['yt-bridge.js','yt-child.js','flower-y8-local.js']);
 for(const f of walkFiles(out)){if((f.endsWith('.js')&&!bridgeFiles.has(path.basename(f)))||f.endsWith('.html')){let s=timers(storage(fs.readFileSync(f,'utf8')));if(f.endsWith('.js'))check(s,f);fs.writeFileSync(f,s);}}
 // 模块脚本延迟到云档恢复；保持模块相对 import 基址与真实初始化不变。
 for(const f of [path.join(out,'index.html')]){let s=fs.readFileSync(f,'utf8');s=s.replace(/<script\b([^>]*\btype=["']module["'][^>]*)><\/script>/g,(tag,attrs)=>{const m=attrs.match(/src=["']([^"']+)["']/);if(!m)return tag;return '<script>__ytCloudReady.then(function(){var s=document.createElement("script");s.type="module";s.src='+JSON.stringify(m[1])+';document.head.appendChild(s)});</script>'});fs.writeFileSync(f,s);}
 normalizeNames(out);
 for(const f of walkFiles(out)){if(!/^[\w.-]+$/.test(path.basename(f)))throw Error('非法文件名 '+f);if(fs.statSync(f).size>=30*1048576)throw Error('单文件超限 '+f)}
 const stats=dirStats(out);if(stats.bytes>=250*1048576||stats.files>8000)throw Error('总包超限');fs.writeFileSync(path.join(ROOT,'build',id+'-yt-build.json'),JSON.stringify({id,...stats},null,2));if(zip)pack(out,path.join(ROOT,'build',id+'-yt.zip'));console.log(id,stats.files,(stats.bytes/1048576).toFixed(2)+' MiB');return out;
}
function normalizeNames(out){let renames=new Map();for(const f of walkFiles(out)){let name=path.basename(f);if(/^[\w.-]+$/.test(name))continue;let clean=name.replace(/[^\w.-]/g,c=>c.charCodeAt(0)>127?'_u'+c.codePointAt(0).toString(16):'_'),dest=path.join(path.dirname(f),clean);if(fs.existsSync(dest))throw Error('文件名规范化冲突 '+f);fs.renameSync(f,dest);renames.set(name,clean)}
 if(renames.size)for(const f of walkFiles(out))if(isText(f,fs.readFileSync(f))){let s=fs.readFileSync(f,'utf8');for(const [a,b]of renames)s=s.replaceAll(a,b);s=s.replaceAll('$bar','_bar').replaceAll('$up','_up').replaceAll('$down','_down').replaceAll('$progress','_progress');fs.writeFileSync(f,s)}
}
function check(s,f){try{new(require('vm').Script)(s)}catch(e){if(/import|export/.test(e.message)){try{require('child_process').execFileSync(process.execPath,['--input-type=module','--check'],{input:s,stdio:['pipe','pipe','pipe']});return}catch(x){throw Error('模块语法错误 '+f+' '+String(x.stderr).slice(-700))}}throw Error('脚本语法错误 '+f+' '+e.message)}}
module.exports={build,GAMES,hash,skip};

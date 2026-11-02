'use strict';
// 第二批转换：源仓库只读，指纹校验后从零生成，可重复执行。
const fs=require('fs'),path=require('path'),z=require('zlib'),crypto=require('crypto');
const {walkFiles,replaceExactly:R,dirStats}=require('./patch-utils.cjs');
const {timers,unityPatch,pack}=require('./build-fb-five.cjs');
const ROOT=path.resolve(__dirname,'../..'),SOURCE='C:/Works/git/yxl/FBIGCrack/FBIGCrack';
const GAMES=['Dominators','EggyCar','FallToRescue','FindTheDifference','FloorPlanHomeDesign'];
function hash(f){let b=fs.readFileSync(f);if(/\.(js|html|css|json)$/.test(f))b=Buffer.from(b.toString().replace(/\r\n/g,'\n'));return crypto.createHash('sha256').update(b).digest('hex')}
function storage(s){return s.replace(/(?<![\w.$])localStorage\b/g,'window.__ytStorage').replaceAll('window.localStorage','window.__ytStorage').replaceAll('window["localStorage"]','window.__ytStorage')}
function patch(f,a,b,label,n=1){fs.writeFileSync(f,R(fs.readFileSync(f,'utf8'),a,b,label,n))}
function build(id,zip=false){if(!GAMES.includes(id))throw Error('未知游戏');let src=path.join(SOURCE,id,'local-game'),out=path.join(ROOT,'build',id+'-yt');
 const manifest=require('../manifests/fb-second-sources.json')[id];for(const [p,h]of Object.entries(manifest))if(hash(path.join(src,p))!==h)throw Error('源文件版本变化 '+p);
 if(!out.startsWith(path.join(ROOT,'build')+path.sep)||src===out)throw Error('输出路径越界');fs.rmSync(out,{recursive:true,force:true});fs.cpSync(src,out,{recursive:true,filter:p=>!/(?:\.(?:bak|orig|local-orig)(?:[-_.]|$)|~$)/.test(p)});
 let html=fs.readFileSync(path.join(out,'index.html'),'utf8').replace(/\r\n/g,'\n');html=html.replace(/<meta\b[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi,'');
 html=html.replace(/<script\b[^>]*src=["'](?:\.?\/)?(?:sdk|local-offline-guard|local-ads|adv-probe)\.js["'][^>]*>\s*<\/script>/g,'');
 html=R(html,'<head>','<head>\n<script src="https://www.youtube.com/game_api/v1"></script>\n<script src="yt-bridge.js"></script>','SDK 第一脚本',1);
 let parts=['platform/lib/yt-runtime.js','platform/lib/yt-game-helpers.js'];if(['Dominators','FloorPlanHomeDesign'].includes(id))parts.push('platform/yandex-yt-bridge.js');if(['Dominators','FallToRescue'].includes(id))parts.push('platform/lib/unity-cloud-yt.js');parts.push('platform/second-batch-yt.js');
 let bridge='window.__ytGameId='+JSON.stringify(id)+';\n'+parts.map(p=>fs.readFileSync(path.join(ROOT,p),'utf8')).join('\n');new(require('vm').Script)(bridge);fs.writeFileSync(path.join(out,'yt-bridge.js'),bridge);
 if(id==='FloorPlanHomeDesign'){
  // 动态 SDK 已预装，只保留 load 完成通知，避免插到官方 SDK 之前。
  patch(path.join(out,'bundle.js'),'i.src="/sdk.js"','i.src="sdk-ready.js"','相对 SDK 加载');fs.writeFileSync(path.join(out,'sdk-ready.js'),'/* SDK 在入口就绪。 */');
  patch(path.join(out,'bundle.js'),'i.src="sdk-ready.js",i.async=!0,t.parentNode.insertBefore(i,t)','i.src="sdk-ready.js",i.async=!0,document.head.appendChild(i)','保持官方 SDK 第一脚本');
  fs.writeFileSync(path.join(out,'bundle.js'),timers(storage(fs.readFileSync(path.join(out,'bundle.js'),'utf8'))));
  html=html.replace(/<script\b([^>]*src=["']bundle\.js["'][^>]*)>\s*<\/script>/, '<script>__ytCloudReady.then(function(){var s=document.createElement("script");s.src="bundle.js";document.body.appendChild(s)});</script>');
 }
 if(id==='FindTheDifference'){
  let f=path.join(out,'js/main.js'),s=fs.readFileSync(f,'utf8');s=R(s,'t.src="../local-crazygames-sdk-v2.js",t.async=!0,e.parentNode.insertBefore(t,e),t.onload=()=>this.initialize()','this.initialize()','预装 CrazyGames 桥',1);s=R(s,'window.onload=()=>{','window.__ytStartFindDifferences=()=>{','延迟加载后的真实启动',1);s+=';window.__ytStartFindDifferences();';fs.writeFileSync(f,timers(storage(s)));
  let engine=path.join(out,'js/phaser-no-physics.min.js');fs.writeFileSync(engine,timers(storage(fs.readFileSync(engine,'utf8'))));
  html=R(html,'<script defer="" src="js/main.js"></script>','<script defer src="start-game.js"></script>','先云档后游戏',1);fs.writeFileSync(path.join(out,'start-game.js'),'__ytCloudReady.then(function(){var s=document.createElement("script");s.src="js/main.js";document.body.appendChild(s)});');
 }
 if(id==='EggyCar'){
  const f=path.join(out,'c2runtime.js');fs.writeFileSync(f,timers(storage(fs.readFileSync(f,'utf8'))));
  // 原 localforage 在构造时立即探测浏览器数据库；改为直接使用同调用面的云档接口。
  let lines=fs.readFileSync(f,'utf8').split('\n'),hits=lines.map((s,i)=>s.includes('a.localforage=b()')?i:-1).filter(i=>i>=0);if(hits.length!==1)throw Error('localforage 导出锚点不唯一');lines[hits[0]]='window.__ytInstallForage();';fs.writeFileSync(f,lines.join('\n'));
  html=R(html,'cr_createRuntime("c2canvas");','__ytCloudReady.then(function(){__ytInstallForage();cr_createRuntime("c2canvas");});','云档与异步插件就绪',1);
  for(const f of walkFiles(out)){if(path.basename(f).includes(' ')){const name=path.basename(f),clean=name.replace(/ /g,'_');fs.renameSync(f,path.join(path.dirname(f),clean));for(const p of [path.join(out,'data.js'),path.join(out,'c2runtime.js')]){let s=fs.readFileSync(p,'utf8').replaceAll(name,clean);fs.writeFileSync(p,s);}}}
  patch(path.join(out,'data.js'),'bg music','bg_music','音乐事件与文件同名',2);
 }
 if(['Dominators','FallToRescue'].includes(id)){
  let dir=path.join(out,'Build'),prefix=id==='Dominators'?'Builds':'FallToRescue',isDom=id==='Dominators';
  let f=path.join(dir,prefix+'.framework.js'+(isDom?'.br':''));let s=isDom?z.brotliDecompressSync(fs.readFileSync(f)).toString():fs.readFileSync(f,'utf8');s=storage(unityPatch(s));new(require('vm').Script)(s);fs.writeFileSync(path.join(dir,prefix+'.framework.js'),s);if(isDom)fs.unlinkSync(f);
  for(const [type,key]of [['data','dataUrl'],['wasm','codeUrl']]){let raw=isDom?z.brotliDecompressSync(fs.readFileSync(path.join(dir,prefix+'.'+type+'.br'))):fs.readFileSync(path.join(dir,prefix+'.'+type));
   if(isDom&&type==='data')raw=compressDominators(raw);
   let encoded=isDom?(type==='wasm'?fs.readFileSync(path.join(src,'Build/Builds.wasm.br')):raw):z.brotliCompressSync(raw,{params:{[z.constants.BROTLI_PARAM_QUALITY]:9}});fs.writeFileSync(path.join(dir,prefix+'.'+type+'.brotli'),encoded);fs.unlinkSync(path.join(dir,prefix+'.'+type+(isDom?'.br':'')));html=R(html,'/'+prefix+'.'+type+(isDom?'.br':''),'/'+prefix+'.'+type+'.brotli','压缩资源 '+type,1);
  }
  if(isDom){html=R(html,'/Builds.framework.js.br','/Builds.framework.js','framework 解压',1);html=R(html,'StartUnityInstance = function () {','StartUnityInstance = async function () {\n await __ytCloudReady;[config.dataUrl,config.codeUrl]=await Promise.all([__ytDecodeAsset(config.dataUrl),__ytDecodeAsset(config.codeUrl)]);','启动等待云档/解压',1);}
  else html=R(html,'script.onload = () => {','script.onload = async () => {\n await __ytCloudReady;[config.dataUrl,config.codeUrl]=await Promise.all([__ytDecodeAsset(config.dataUrl),__ytDecodeAsset(config.codeUrl)]);','启动等待云档/解压',1);
  for(const name of ['brotli-decode.js','brotli-LICENSE.txt'])fs.copyFileSync(path.join(ROOT,'platform/lib',name),path.join(dir,name));html=html.replace('<script src="yt-bridge.js"></script>','<script src="yt-bridge.js"></script>\n<script src="Build/brotli-decode.js"></script>');
  if(isDom){for(const f of walkFiles(out)){if(/[()]/.test(f)){let clean=f.replace(/[()]/g,'_');fs.renameSync(f,clean);}}html=html.replace(/localization-string-tables-english\(en\)/g,'localization-string-tables-english_en_').replace(/localization-string-tables-russian\(ru\)/g,'localization-string-tables-russian_ru_');
   // 目录文件不能改二进制长度；请求闸门将旧地址映射到合法文件名。
   html=html.replace('<script src="yt-bridge.js"></script>','<script src="yt-bridge.js"></script>\n<script>var __f=window.fetch;window.fetch=function(u,o){if(typeof u==="string")u=u.replace(/\\(/g,"_").replace(/\\)/g,"_");return __f.call(this,u,o)};</script>');
  }
 }
 html=timers(storage(html));fs.writeFileSync(path.join(out,'index.html'),html);
 for(const f of walkFiles(out)){if(!/^[\w.-]+$/.test(path.basename(f)))throw Error('非法文件名 '+f);if(fs.statSync(f).size>=30*1048576)throw Error('单文件超限 '+f)}let stats=dirStats(out);if(stats.bytes>=250*1048576||stats.files>8000)throw Error('包超限');fs.writeFileSync(path.join(ROOT,'build',id+'-yt-build.json'),JSON.stringify({id,...stats},null,2));if(zip){if(id==='Dominators'&&stats.bytes>=30*1048576)throw Error('Dominators 初始资源超限，不生成正式 ZIP。');pack(out,path.join(ROOT,'build',id+'-yt.zip'));}console.log(id,stats.files,(stats.bytes/1048576).toFixed(2)+' MiB');
}
function compressDominators(raw){
 // 用户已允许 RGBA4444；缓存同时校验输入、优化脚本和成品，避免使用旧配方。
 const cache=path.join(ROOT,'tools/state'),script=path.join(ROOT,'tools/repack-unity-data.py');
 const input=path.join(cache,'dominators.data.raw'),output=path.join(cache,'dominators-rgba4444.raw'),encoded=path.join(cache,'dominators-rgba4444-q10.brotli'),meta=path.join(cache,'dominators-rgba4444-cache.json');
 const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),recipe=sha(Buffer.concat([raw,Buffer.from(fs.readFileSync(script,'utf8').replace(/\r\n/g,'\n')+'rgba4444-brotli-q10')]));
 if(fs.existsSync(meta)&&fs.existsSync(encoded)){const m=JSON.parse(fs.readFileSync(meta));const b=fs.readFileSync(encoded);if(m.recipe===recipe&&m.output===sha(b))return b;}
 fs.mkdirSync(cache,{recursive:true});fs.writeFileSync(input,raw);
 require('child_process').execFileSync('python',[script,'--input',input,'--output',output,'--rgba4444'],{env:{...process.env,PYTHONPATH:path.join(cache,'python-libs')},stdio:'inherit'});
 const optimized=fs.readFileSync(output),prior=path.join(cache,'dominators-rgba4444-preview-q10.brotli');let result;
 if(fs.existsSync(prior)){const b=fs.readFileSync(prior);if(sha(z.brotliDecompressSync(b))===sha(optimized))result=b;}
 if(!result)result=z.brotliCompressSync(optimized,{params:{[z.constants.BROTLI_PARAM_QUALITY]:10}});
 fs.writeFileSync(encoded,result);fs.writeFileSync(meta,JSON.stringify({recipe,output:sha(result)},null,2));return result;
}
module.exports={build,GAMES,hash};

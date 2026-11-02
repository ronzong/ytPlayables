'use strict';
// 第四批：只读来源、逐文件指纹校验、每次从源重建。
const fs=require('fs'),path=require('path'),crypto=require('crypto'),vm=require('vm');
const {walkFiles,replaceExactly:R,dirStats}=require('./patch-utils.cjs');
const {timers,pack}=require('./build-fb-five.cjs');
const ROOT=path.resolve(__dirname,'../..'),SOURCE='C:/Works/git/yxl/FBIGCrack/FBIGCrack';
const GAMES=['HarvestIO','JigsawCards','LumberjackForestEmpire','Mecha','MJBeautySalon'];
const skip=f=>/\.(bak|orig|original|local-orig)([-_.]|$)|~$/.test(f);
function hash(f){let b=fs.readFileSync(f);if(/\.(js|html|css|json)$/.test(f))b=Buffer.from(b.toString().replace(/\r\n/g,'\n'));return crypto.createHash('sha256').update(b).digest('hex')}
function storage(s){return s.replace(/(?<![\w.$])localStorage\b(?!\s*:)/g,'window.__ytStorage').replaceAll('window.localStorage','window.__ytStorage').replaceAll('window["localStorage"]','window.__ytStorage')}
function build(id,zip=false){if(!GAMES.includes(id))throw Error('未知游戏');let src=path.join(SOURCE,id,'local-game'),out=path.join(ROOT,'build',id+'-yt');let manifest=require('../manifests/fb-fourth-sources.json')[id];for(let [f,h]of Object.entries(manifest))if(hash(path.join(src,f))!==h)throw Error('源版本改变 '+f);
 if(!out.startsWith(path.join(ROOT,'build')+path.sep)||out===src)throw Error('输出越界');fs.rmSync(out,{force:true,recursive:true});fs.cpSync(src,out,{recursive:true,filter:f=>!skip(f)});
 function patch(f,a,b,label,n=1){let p=path.join(out,f);fs.writeFileSync(p,R(fs.readFileSync(p,'utf8'),a,b,label,n))}
 let html=fs.readFileSync(path.join(out,'index.html'),'utf8').replace(/\r\n/g,'\n');html=html.replace(/<meta\b[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi,'').replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi,'');
 html=R(html,'<head>','<head>\n<script src="https://www.youtube.com/game_api/v1"></script>\n<script src="yt-bridge.js"></script>','SDK 第一脚本',1);
 let parts=['platform/lib/yt-runtime.js','platform/lib/yt-game-helpers.js'];if(id==='LumberjackForestEmpire')parts.push('platform/yandex-yt-bridge.js');parts.push('platform/fourth-batch-yt.js');let bridge='window.__ytGameId='+JSON.stringify(id)+';\n'+parts.map(f=>fs.readFileSync(path.join(ROOT,f),'utf8')).join('\n');new vm.Script(bridge);fs.writeFileSync(path.join(out,'yt-bridge.js'),bridge);
 if(id==='HarvestIO'){patch('game.js','failIfMajorPerformanceCaveat:W.FAIL_IF_MAJOR_PERFORMANCE_CAVEAT','failIfMajorPerformanceCaveat:false','允许真实软件 WebGL 上下文');fs.writeFileSync(path.join(out,'local-crazygames-sdk-v3.js'),'/* 入口已安装 YouTube 平台桥。 */');patch('game.js','{key:"gameReady",value:function(){}}','{key:"gameReady",value:function(){window.__ytPlayables.system.gameReady()}}','原游戏真实就绪');html=R(html,'window.addEventListener("load", () => window.runGame());','window.addEventListener("load", () => __ytCloudReady.then(() => window.runGame()));','云档后启动',1);}
 if(id==='JigsawCards'){
  patch('game-v1.501.2-5bfc161d40.js','const cleverapps={config:document.ccConfig||cc.game.config};','const cleverapps={config:document.ccConfig||cc.game.config};window.__ytJigsaw=cleverapps;','提供原场景只读就绪观察入口');
  patch('game-v1.501.2-5bfc161d40.js','cc.game.run(function(){cleverapps.onStart()});','window.__ytJigsawState=function(){return {game:Game.currentGame,component:cleverapps.Scenes.GetSceneComponent(JigSolitaireSceneComponent)}};cc.game.run(function(){cleverapps.onStart()});','提供原拼图只读操作取证入口');
  html=html.replace(/<script\b[^>]*src=["']libs\/firebase-[^"']+["'][^>]*><\/script>/g,'');
  // 原构建采用 test/norest，不启动 Firebase、账号、支付或第三方网络；游戏资源与关卡保持完整。
  html=html.replace(/<script\b([^>]*\bsrc=["'][^"']+["'][^>]*)><\/script>/g,(tag,attrs)=>attrs.includes('yt-bridge')||attrs.includes('game_api')?tag:'<script type="application/x-yt-delayed" '+attrs+'></script>');
  html=R(html,'</body>','<script>__ytCloudReady.then(async function(){for(var old of document.querySelectorAll("script[type=\\"application/x-yt-delayed\\"]")){await new Promise(function(resolve,reject){var s=document.createElement("script");for(var a of old.attributes)if(a.name!=="type")s.setAttribute(a.name,a.value);s.onload=resolve;s.onerror=reject;document.body.appendChild(s)})}});</script></body>','依次载入原引擎/连接器',1);
  patch('cleverapps/res/cocoslib-3_17_2-bf2d2f56e0.js','k.localStorage=m.localStorage','k.localStorage=window.__ytStorage','引擎全局别名存储');
  patch('connector-v1.501.2-4b8cd52917.js','showRewardedVideoCallback:function(a){connector._adsManager.showRewarded(b=>{a(b===connector.CODE_SUCCEED)})}','showRewardedVideoCallback:function(a){window.__ytPlayables.ads.showRewarded("jigsaw").then(a,()=>a(false))}','连接器激励只走 YouTube');
  patch('connector-v1.501.2-4b8cd52917.js','showInterstitialCallback:function(a){connector._adsManager.showInterstitial(b=>{a(b===connector.CODE_SUCCEED)})}','showInterstitialCallback:function(a){window.__ytPlayables.ads.showInterstitial().then(a,()=>a(false))}','连接器插屏只走 YouTube');
  patch('connector-v1.501.2-4b8cd52917.js','connector.synchronizer=new Synchronizer;connector.initialize();','connector.synchronizer=new Synchronizer;window.__ytJigsawConnector=connector;connector.initialize();','保留原连接器诊断入口');
 }
 if(id==='LumberjackForestEmpire'){html=R(html,'<script src="/sdk.js"></script>','','移除原平台脚本',1);}
 if(id==='Mecha'){
  fs.writeFileSync(path.join(out,'src/gdAd.js'),'/* 入口已安装 YouTube 广告桥。 */');
  // 原桌面失焦遮罩调用引擎 pause/resume；Playables 的恢复只能由 SDK 负责。
  html=R(html,'<script src="src/click-continue.js" charset="utf-8"></script>','','移除网页可见性恢复通路',1);
  html=R(html,'window.boot();','__ytCloudReady.then(window.boot);','启动前恢复云档',1);
 }
 if(id==='MJBeautySalon'){
  fs.writeFileSync(path.join(out,'sdk.js'),'/* 原 SDK 由 YouTube 入口替换。 */');fs.writeFileSync(path.join(out,'volan-sdk-local.js'),'/* Volan 调用面已预装。 */');
  patch('scripts/c3main.js','self.KVStorageContainer = Kr','self.KVStorageContainer = window.__ytKVStorage','Construct 云档数据库');
  patch('scripts/main.js','_GetWindowInnerWidth(){return Math.max(window.innerWidth,1)}_GetWindowInnerHeight(){return Math.max(window.innerHeight,1)}','_GetWindowInnerWidth(){return Math.max(Math.min(window.innerWidth,window.innerHeight*9/16),1)}_GetWindowInnerHeight(){return Math.max(Math.min(window.innerHeight,window.innerWidth*16/9),1)}','Construct 使用完整 9:16 视口');
  for(let [key,n]of [['clientX:t.clientX',3],['clientY:t.clientY',3],['pageX:t.pageX',3],['pageY:t.pageY',3],['clientX:s.clientX',1],['clientY:s.clientY',1],['pageX:s.pageX',1],['pageY:s.pageY',1]]){let axis=key.includes('X:')?'left':'top';patch('scripts/main.js',key,key+'-document.body.getBoundingClientRect().'+axis,'居中画布输入坐标 '+key,n)}
  // 原 scale-outer 在宽屏裁掉上下；保留竖屏设计，在独立 9:16 视口下运行。
  html=R(html,'</head>','<style>html{overflow:hidden;background:#151224}body{position:absolute!important;margin:0!important;overflow:hidden!important;width:min(100vw,56.25vh)!important;height:min(100vh,177.777778vw)!important;left:50%!important;top:50%!important;transform:translate(-50%,-50%)}canvas{max-width:100%;max-height:100%}</style></head>','竖屏完整画布',1);
 }
 // 模块先恢复云档再加载；保留相对 import 与原始加载回调。
 html=html.replace(/<script\b([^>]*\btype=["']module["'][^>]*)><\/script>|<script\b([^>]*\bsrc=["'][^"']+["'][^>]*\btype=["']module["'][^>]*)><\/script>/g,(tag,a,b)=>{let m=(a||b).match(/src=["']([^"']+)["']/);return '<script>__ytCloudReady.then(function(){var s=document.createElement("script");s.type="module";s.src='+JSON.stringify(m[1])+';document.body.appendChild(s)});</script>'});
 fs.writeFileSync(path.join(out,'index.html'),html);
 for(let f of walkFiles(out))if(/\.(js|html)$/.test(f)&&!f.endsWith('yt-bridge.js')){let s=fs.readFileSync(f,'utf8');s=s.replaceAll('setTimeout(a,b,c){','__ytMethodTimeout(a,b,c){').replaceAll('setInterval(a,b){','__ytMethodInterval(a,b){').replaceAll('clearTimeout(a){','__ytMethodClearTimeout(a){').replaceAll('clearInterval(a){','__ytMethodClearInterval(a){');s=timers(storage(s)).replaceAll('__ytMethodTimeout','setTimeout').replaceAll('__ytMethodInterval','setInterval').replaceAll('__ytMethodClearTimeout','clearTimeout').replaceAll('__ytMethodClearInterval','clearInterval');if(f.endsWith('.js'))try{new vm.Script(s,{filename:f})}catch(e){if(!/import|export/.test(e.message))throw e;}fs.writeFileSync(f,s)}
 // Cocos 子资源命名和引擎解析同步修改。
 let ats=walkFiles(out).filter(f=>path.basename(f).includes('@'));if(ats.length){for(let f of ats)fs.renameSync(f,path.join(path.dirname(f),path.basename(f).replaceAll('@','_')));for(let f of walkFiles(out))if(f.endsWith('.json'))fs.writeFileSync(f,fs.readFileSync(f,'utf8').replace(/([0-9A-Za-z+/]{22})@([0-9A-Za-z]+)/g,'$1_$2'));let engine=walkFiles(out).find(f=>/cocos2d-js-min/.test(f));if(!engine)throw Error('缺少 Cocos 引擎');patch(path.relative(out,engine),'t.split("@")[0]','t.split(/[@_]/)[0]','子资源分隔符');patch(path.relative(out,engine),'[0-9a-fA-F-@]','[0-9a-fA-F-@_]','uuid 正则',2);}
 for(let f of walkFiles(out)){if(!/^[\w.-]+$/.test(path.basename(f)))throw Error('非法文件名 '+f);if(fs.statSync(f).size>=30*1048576)throw Error('单文件超限 '+f)}let stats=dirStats(out);if(stats.bytes>=250*1048576||stats.files>8000)throw Error('总包超限');fs.writeFileSync(path.join(ROOT,'build',id+'-yt-build.json'),JSON.stringify({id,...stats},null,2));if(zip)pack(out,path.join(ROOT,'build',id+'-yt.zip'));console.log(id,stats.files,(stats.bytes/1048576).toFixed(2)+' MiB');return out;
}
module.exports={build,GAMES,hash,skip};

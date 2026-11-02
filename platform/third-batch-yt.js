/* 第三批平台接口：保留同步/Promise 语义，仅由原生就绪信号上报游戏加载完成。 */
(function(){'use strict';var P=window.__ytPlayables,id=window.__ytGameId,events={};
 window.__ytCloudReady=P.save.init(null);
 window.__ytWhenLoaded=function(name,callback){if(name==='load'?document.readyState==='complete':document.readyState!=='loading')callback();else (name==='load'?window:document).addEventListener(name,callback,{once:true})};
 if(id==='FlowerGardenBouquetSorting'){
  // 官方 CSP 不允许 iframe URL 导航；内联同源文档继续遵守继承的 CSP 与原父子消息协议。
  function attach(){document.querySelectorAll('iframe[data-yt-src]').forEach(function(frame){if(frame.__ytAttached)return;frame.__ytAttached=true;var url=frame.getAttribute('data-yt-src');fetch(url).then(r=>{if(!r.ok)throw Error('子游戏入口下载失败');return r.text()}).then(function(html){var query=new URL(url,location.href).search;var base=new URL('./flowers-sort/',location.href).href;html=html.replace(/\b(src|href)=(["'])([^"']+)\2/g,function(all,key,quote,ref){if(/^(?:data:|https?:|#)/.test(ref))return all;return key+'='+quote+new URL(ref,base).href+quote});frame.srcdoc=html.replace('<head>','<head><base href="'+base+'"><script>window.__ytOriginalQuery='+JSON.stringify(query)+';<\/script>')}).catch(console.error)})}
  new MutationObserver(attach).observe(document.documentElement,{childList:true,subtree:true});
 }
 function on(n,cb){(events[n]||(events[n]=[])).push(cb)}function emit(n,v){(events[n]||[]).forEach(fn=>fn(v))}
 if(window.YaGames){var init=YaGames.init;YaGames.init=function(){return init().then(function(s){s.features2={GameplayAPI:s.features.GameplayAPI};return s})};}
 if(id==='GardenSlide'){
  window.CrazyGames={SDK:{init:function(){return __ytCloudReady},environment:'youtube',data:{getItem:k=>P.storage.getItem('cg:'+k),setItem:function(k,v){P.storage.setItem('cg:'+k,v);P.save.flush()},removeItem:function(k){P.storage.removeItem('cg:'+k);P.save.flush()},clear:function(){Object.keys(P.storage.__snapshot()).filter(k=>k.startsWith('cg:')).forEach(k=>P.storage.removeItem(k));P.save.flush()}},game:{loadingStart:function(){},loadingStop:function(){P.system.gameReady()},gameplayStart:function(){},gameplayStop:function(){},happytime:function(){},setGameContext:function(){},clearGameContext:function(){}},user:{isUserAccountAvailable:false,getUser:()=>Promise.resolve(null)},banner:{requestBanner:()=>Promise.resolve(),clearAllBanners:function(){}},ad:{hasAdblock:()=>Promise.resolve(false),requestAd:function(type,cb){cb=cb||{};if(cb.adStarted)cb.adStarted();return (type==='rewarded'?P.ads.showRewarded('garden-reward'):P.ads.showInterstitial()).then(function(ok){if(type!=='rewarded'||ok===true){if(cb.adFinished)cb.adFinished()}else if(cb.adError)cb.adError(new Error('未完整观看'))},function(e){if(cb.adError)cb.adError(e)})}}}};
 }
 if(id==='FruitCafeMatch3'){
  function read(){try{return JSON.parse(P.storage.getItem('gamepush-player')||'{}')}catch(e){return {}}}var data;
  var ready=__ytCloudReady.then(function(){data=read();return data});
  window.gp={projectId:'youtube',language:'en',platform:{type:'YOUTUBE',tag:'',lang:'en'},player:{isLoggedIn:true,hasAnyCredentials:true,ready:ready,get:function(k){return k==='id'?'youtube-player':(data||read())[k]??null},set:function(k,v){data=data||read();data[k]=v;P.storage.setItem('gamepush-player',JSON.stringify(data))},sync:()=>P.save.flush(),load:()=>ready,on:on},variables:{get:()=>undefined},gameStart:function(){P.system.gameReady()},gameplayStart:function(){},gameplayStop:function(){},sounds:{isMuted:()=>!P.audioGate.isEnabled(),isMusicMuted:()=>!P.audioGate.isEnabled(),isSFXMuted:()=>!P.audioGate.isEnabled(),on:on,off:function(){},mute:function(){},unmute:function(){},muteMusic:function(){},unmuteMusic:function(){},muteSFX:function(){},unmuteSFX:function(){}},ads:{isRewardedAvailable:true,showRewardedVideo:()=>P.ads.showRewarded('cafe-reward'),showFullscreen:()=>P.ads.showInterstitial(),on:on,setBannerVisible:function(){},isStickyPlaying:false},analytics:{goal:function(){}},on:on};
  P.pauseGate.onPauseChange(p=>emit(p?'pause':'resume'));ready.then(()=>window.dispatchEvent(new CustomEvent('gp:init',{detail:gp})));
 }
 if(id==='GoingBalls3D'){
  // 原 GD_READY 只负责启动；真实 ready 在 Laya 加载页关闭时由构建补丁触发。
  window.__ytGdEvent=function(n){if(window.GD_OPTIONS&&GD_OPTIONS.onEvent)GD_OPTIONS.onEvent({name:n})};
  window.gdsdk={showAd:function(type){var reward=type==='rewarded';__ytGdEvent('SDK_GAME_PAUSE');return (reward?P.ads.showRewarded('revive'):P.ads.showInterstitial()).then(function(ok){if(reward&&ok===true)__ytGdEvent('SDK_REWARDED_WATCH_COMPLETE');else if(reward)__ytGdEvent('AD_ERROR')},function(){__ytGdEvent('AD_ERROR')}).finally(()=>__ytGdEvent('SDK_GAME_START'))},preloadAd:()=>Promise.resolve(),showBanner:function(){},hideBanner:function(){},openConsole:function(){}};
  P.pauseGate.onPauseChange(function(paused){if(typeof PauseMgr!=='undefined'){if(paused)PauseMgr.pause();else PauseMgr.resume()}});
 }
})();

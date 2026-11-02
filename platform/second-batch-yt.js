/* 第二批平台接口补充：先读云档，保留游戏的原始数据格式与回调契约。 */
(function(){'use strict';var P=window.__ytPlayables;
 window.__ytCloudReady=P.save.init(null);
 if(window.__ytGameId==='FloorPlanHomeDesign'){window.__localApps=[];window.__PIXI_APP_INIT__=function(app){window.__localApps.push(app)};}
 function read(k){try{return JSON.parse(P.storage.getItem(k)||'{}')}catch(e){return {}}}
 function write(k,v){P.storage.setItem(k,JSON.stringify(v));return P.save.flush()}
 if(window.YaGames){var init=YaGames.init;YaGames.init=function(){return init().then(function(s){
  s.isAvailableMethod=function(){return Promise.resolve(false)};s.getServerTime=function(){return Date.now()};
  s.getPlayer().then(function(p){p.getPayingStatus=function(){return 'unknown'};p.getStats=function(keys){var d=read('yandex-stats');return Promise.resolve(keys?Object.fromEntries(keys.map(k=>[k,d[k]||0])):d)};p.setStats=function(v){return write('yandex-stats',Object.assign(read('yandex-stats'),v))};p.incrementStats=function(v){var d=read('yandex-stats');for(var k in v)d[k]=(d[k]||0)+v[k];return write('yandex-stats',d)};});return s;});};}
 if(window.__ytGameId==='FindTheDifference'){
  window.CrazyGames={SDK:{ad:{requestAd:function(type,cb){cb=cb||{};if(cb.adStarted)cb.adStarted();return (type==='rewarded'?P.ads.showRewarded('hint'):P.ads.showInterstitial()).then(function(ok){if(type!=='rewarded'||ok===true){if(cb.adFinished)cb.adFinished()}else if(cb.adError)cb.adError(new Error('未完整观看'));},function(e){if(cb.adError)cb.adError(e)});}},banner:{requestResponsiveBanner:function(){return Promise.resolve()},requestBanner:function(){return Promise.resolve()},clearBanner:function(){},clearAllBanners:function(){}},game:{gameplayStart:function(){},gameplayStop:function(){},sdkGameLoadingStart:function(){},sdkGameLoadingStop:function(){P.system.gameReady()}}}};
 }
 if(window.__ytGameId==='EggyCar'){
  window.__ytInstallForage=function(){var db=new __ytAsyncStorage('construct2');window.localforage={};for(var name of ['getItem','setItem','removeItem','clear','keys','key','length']){(function(n){localforage[n]=function(){var a=[].slice.call(arguments),cb=typeof a[a.length-1]==='function'?a.pop():null;var promise=db[n].apply(db,a);if(cb)promise.then(v=>cb(null,v),e=>cb(e));return promise;};})(name);}localforage.config=function(){return true};};
  window.gdsdk={showBanner:function(){return P.ads.showInterstitial().finally(function(){if(window.vooxe&&vooxe.onResumeGame)vooxe.onResumeGame()})},play:function(){},customLog:function(){}};
  var check=setInterval(function(){var r=window.cr_getC2Runtime&&cr_getC2Runtime();if(r&&r.running_layout){clearInterval(check);P.system.gameReady()}},100);
 }
 if(window.__ytGameId==='FallToRescue'){
  var unity;
  function send(method,value){if(unity)unity.SendMessage('ADManager',method,value)}
  window.__ftrAds={onUnityReady:function(instance){unity=instance;P.system.gameReady()}};
  window.initAds=function(){};window.getAdClient=function(){return '#'};window.getAdSlot=function(){return ''};
  window.playinter=function(){send('InterCallBack','beforeAd');return P.ads.showInterstitial().finally(function(){send('InterCallBack','afterAd')})};
  window.playreward=function(){send('RewardCallBack','beforeAd');return P.ads.showRewarded('rescue').then(function(ok){send('RewardCallBack',ok===true?'adViewed':'adDismissed')},function(){send('RewardCallBack','adDismissed')}).finally(function(){send('RewardCallBack','afterAd')})};
 }
})();

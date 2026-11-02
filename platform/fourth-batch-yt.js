/* 第四批：所有原平台接口只映射 YouTube；云档先读后写。 */
(function(){'use strict';var P=window.__ytPlayables,id=window.__ytGameId;window.__ytCloudReady=P.save.init(null);
 if(id==='HarvestIO'){
  var listener;window.CrazyGames={SDK:{init:()=>__ytCloudReady,ad:{requestAd:function(type,c){c=c||{};if(c.adStarted)c.adStarted();return(type==='rewarded'?P.ads.showRewarded('harvest'):P.ads.showInterstitial()).then(ok=>{if(type!=='rewarded'||ok===true){if(c.adFinished)c.adFinished()}else if(c.adError)c.adError(new Error('未完整观看'))},e=>{if(c.adError)c.adError(e)})}},banner:{requestBanner:()=>Promise.resolve(),requestResponsiveBanner:()=>Promise.resolve(),clearBanner:function(){},clearAllBanners:function(){}},data:{getItem:k=>P.storage.getItem(k),setItem:(k,v)=>{P.storage.setItem(k,v);return P.save.flush()},removeItem:k=>{P.storage.removeItem(k);return P.save.flush()}},game:{gameplayStart:function(){},gameplayStop:function(){},settings:{disableChat:true,muteAudio:!P.audioGate.isEnabled()},addSettingsChangeListener:fn=>listener=fn}}};
  if(window.ytgame)ytgame.system.onAudioEnabledChange(function(){CrazyGames.SDK.game.settings.muteAudio=!P.audioGate.isEnabled();if(listener)listener(CrazyGames.SDK.game.settings)});
 }
 if(id==='JigsawCards'){
  var poll=setInterval(function(){var c=window.__ytJigsaw;if(c&&c.Scenes&&c.Scenes.GetRunningScene){var scene=c.Scenes.GetRunningScene();if(scene&&c.environment&&!c.environment.isLoaderScene()){clearInterval(poll);P.system.gameReady()}}},100);
 }
 if(id==='LumberjackForestEmpire'){
  var init=YaGames.init;YaGames.init=function(){return init().then(s=>{s.deviceInfo={isMobile:()=>/Android|iPhone|iPad|Mobile/.test(navigator.userAgent),isDesktop:()=>!/Android|iPhone|iPad|Mobile/.test(navigator.userAgent)};return s})};
 }
 if(id==='Mecha'){
  var menu=setInterval(function(){var cc=window.cc,scene=cc&&cc.director&&cc.director.getScene();if(scene&&scene.name!=='Login'&&(cc.find('Canvas/MainUI')||cc.find('Canvas/Game'))){clearInterval(menu);P.system.gameReady()}},100);
  window.gameapi={rewardCallback:null,playReward:function(cb){this.rewardCallback=cb;return P.ads.showRewarded('mecha').then(ok=>{if(cb)cb(ok===true)},()=>{if(cb)cb(false)})},playInterstitial:()=>P.ads.showInterstitial()};window.shakePhone_GD=function(){};window.exitGame_GD=function(){};window.videoResult_GD=function(){};
 }
 if(id==='MJBeautySalon'){
  window.__ytFlushGameSave=function(){if(typeof window.c3_callFunction==='function')window.c3_callFunction('save')};
  window.VolanSdk={GAME_LANGUAGE:'en',GAME_YD_APPID:'',GAME_NAME:'mj-beauty-salon',IS_FORCE_RELEASE:false,IsInLevelBatting:false,initVolan:()=>__ytCloudReady,yandexReady:()=>P.system.gameReady(),gameplayStart:function(){},gameplayStop:function(){},showRewarded:function(ok,no){return P.ads.showRewarded('salon').then(v=>{if(v===true){if(ok)ok()}else if(no)no()},()=>{if(no)no()})},showInterstitial:done=>P.ads.showInterstitial().finally(()=>{if(done)done()}),showFullScreenGames:function(){}};
  window.__ytKVStorage=class extends __ytAsyncStorage{async ready(){await __ytCloudReady}get(k){return this.getItem(k)}set(k,v){return this.setItem(k,v)}delete(k){return this.removeItem(k)}};
 }
})();

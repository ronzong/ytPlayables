// Playgama/Yandex 桥需要的本地能力；不请求账号、推广和云服务。
(function(){'use strict';window.ym=function(){};
 // 诊断接口留在本机，不初始化远程 Sentry。
 window.Sentry={captureException:function(e){if(new URLSearchParams(location.search).get('debug')==='1')console.warn(e)},captureMessage:function(){},captureEvent:function(){},addBreadcrumb:function(){},setTag:function(){},setUser:function(){},setContext:function(){},withScope:function(f){f({setTag:function(){},setContext:function(){},setExtra:function(){}})}};
 
 // Bubble 原生 SDK 仍初始化 endpoint；只提供本地 settings，进度沿用其匿名 IndexedDB 分支。
 function crc32(value){var b=new TextEncoder().encode(JSON.stringify(value)),c=-1;for(var v of b){c^=v;for(var i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0)}return (c^-1)>>>0}
 window.localBubbleHttpClient={postRequest:function(url){if(!url.endsWith('/settings'))return Promise.reject(new Error('本地匿名模式不支持远程API: '+url));var response={auth:'local-auth',user:'local-user',client:{settingsRefreshMs:0}};return Promise.resolve({success:true,response:response,c:crc32(response)})}};

 var init=window.YaGames.init;window.YaGames.init=function(){return init.apply(this,arguments).then(function(sdk){
 sdk.environment.browser={lang:sdk.environment.i18n.lang};
 sdk.shortcut={canShowPrompt:function(){return Promise.resolve({canShow:false})},showPrompt:function(){return Promise.resolve({outcome:'dismissed'})}};
 var payments=sdk.getPayments;sdk.getPayments=function(){return payments().then(function(p){p.purchase=function(){return Promise.reject(new Error('本地版不支持付费购买'))};return p})};
 sdk.deviceInfo={type:/Android|iPhone|iPad/i.test(navigator.userAgent)?'mobile':'desktop'};
 sdk.deviceInfo.isMobile=function(){return this.type==='mobile'};sdk.deviceInfo.isDesktop=function(){return this.type==='desktop'};sdk.deviceInfo.isTablet=function(){return false};
 sdk.adv.showBannerAdv=function(){return Promise.resolve({stickyAdvIsShowing:false})};sdk.adv.hideBannerAdv=function(){return Promise.resolve({stickyAdvIsShowing:false})};
 sdk.serverTime=function(){return Date.now()};sdk.getServerTime=function(){return Date.now()};
 sdk.features.GamesAPI={getAllGames:function(){return Promise.resolve({games:[]})},getGameByID:function(){return Promise.resolve({isAvailable:false})}};
 sdk.features.PluginEngineDataReporterAPI={report:function(){return Promise.resolve()}};
 // 同一时刻只允许一条广告流程；完整观看才发奖，每条流程只收尾一次。
 if(!sdk.__localAdsWrapped){sdk.__localAdsWrapped=true;var busy=false;
 ['showRewardedVideo','showFullscreenAdv'].forEach(function(name){var original=sdk.adv[name];sdk.adv[name]=function(options){var callbacks=options&&options.callbacks||{};if(busy){if(callbacks.onError)callbacks.onError({code:'AD_BUSY'});return;}busy=true;var ended=false,rewarded=false;var wrapped=Object.assign({},callbacks,{onRewarded:function(){if(ended||rewarded)return;rewarded=true;if(callbacks.onRewarded)callbacks.onRewarded()},onClose:function(shown){if(ended)return;ended=true;busy=false;if(callbacks.onClose)callbacks.onClose(shown)},onError:function(error){if(ended)return;ended=true;busy=false;if(callbacks.onError)callbacks.onError(error)}});original.call(sdk.adv,Object.assign({},options,{callbacks:wrapped}));};});}
 return sdk;});};
 // SDK 全屏请求只用于门户体验，独立窗口保持普通浏览器布局。
 ['requestFullscreen','webkitRequestFullscreen','webkitRequestFullScreen','mozRequestFullScreen','msRequestFullscreen'].forEach(function(k){if(typeof Element.prototype[k]==='function')Element.prototype[k]=function(){return Promise.resolve()}});
})();

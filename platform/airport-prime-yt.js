/* primeSDK 的平台边界接 YouTube；不启用原平台广告或统计。 */
(function(){'use strict';var P=window.__ytPlayables;window.__ytCloudReady=P.save.init(null);
 window.__ytPrimeAd=function(reward,open,close){if(open)open();return(reward?P.ads.showRewarded('airport-upgrade'):P.ads.showInterstitial()).then(function(ok){if(close)close(reward?ok===true:true);},function(){if(close)close(false);});};
 // primeSDK 存档落在内存键值层；提交时同步云端，不依赖 localStorage。
 var set=P.storage.setItem;P.storage.setItem=function(k,v){set.call(this,k,v);P.save.flush();};
})();

/* 子游戏独立冻结循环/音频/输入，共享父页唯一云档，避免两个快照相互覆盖。 */
(function(){'use strict';var P=window.__ytPlayables,root=parent.__ytPlayables;
 P.storage=root.storage;P.save=root.save;P.system=root.system;P.ads=root.ads;window.__ytStorage=root.storage;
 P.bindEngineStorage=function(){var timer=setInterval(function(){if(window.cc&&cc.sys){cc.sys.localStorage=root.storage;clearInterval(timer)}},10)};
 root.pauseGate.onPauseChange(function(paused){if(paused)P.pauseGate.pause('ytgame.onPause');else P.pauseGate.resume('ytgame.onResume')});
})();

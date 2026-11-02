/* 通用引擎边界：定时器冻结、加载首帧及异步键值云存档。 */
(function () {
  'use strict';
  var P=window.__ytPlayables, waiting=new Map(), seq=1;
  P.bindEngineStorage();
  function timer(fn,ms,repeat,args){var id=seq++,e={fn:fn,args:args,repeat:repeat,due:false};waiting.set(id,e);e.native=(repeat?setInterval:setTimeout)(function(){if(P.isPaused()){e.due=true;return;}if(!repeat)waiting.delete(id);fn.apply(null,args);},ms);return id;}
  function cancel(id){var e=waiting.get(id);if(!e)return;(e.repeat?clearInterval:clearTimeout)(e.native);waiting.delete(id);}
  window.__ytGameTimers={setTimeout:function(fn,ms){return timer(fn,ms,false,[].slice.call(arguments,2));},setInterval:function(fn,ms){return timer(fn,ms,true,[].slice.call(arguments,2));},clearTimeout:cancel,clearInterval:cancel};
  P.pauseGate.onPauseChange(function(paused){if(paused){if(window.__ytFlushGameSave)window.__ytFlushGameSave();return;}waiting.forEach(function(e,id){if(e.due){e.due=false;if(!e.repeat)waiting.delete(id);e.fn.apply(null,e.args);}});});
  function frame(){requestAnimationFrame(function(){P.system.firstFrameReady();});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',frame,{once:true});else frame();
  window.__ytAsyncStorage=class {
    constructor(name){this.prefix='game-db:'+name+':';}
    async init(){} async exists(){return (await this.keys()).length>0;} getStorageName(){return 'YouTube';} async getProfileKeyPrefix(){return '';}
    async getItem(k){var v=P.storage.getItem(this.prefix+k);return v===null?null:JSON.parse(v);}
    async setItem(k,v){P.storage.setItem(this.prefix+k,JSON.stringify(v));return P.save.flush();}
    async removeItem(k){P.storage.removeItem(this.prefix+k);return P.save.flush();}
    async keys(){return Object.keys(P.storage.__snapshot()).filter(k=>k.startsWith(this.prefix)).map(k=>k.slice(this.prefix.length));}
    async length(){return (await this.keys()).length;} async key(i){return (await this.keys())[i]??null;}
    async entries(){var m=new Map();for(var k of await this.keys())m.set(k,await this.getItem(k));return m;}
    async values(){return Array.from((await this.entries()).values());}
    async getItemsByPrefix(prefix){return new Map(Array.from((await this.entries()).entries()).filter(([k])=>k.startsWith(prefix)));}
    async setItems(values){for(var [k,v] of values instanceof Map?values.entries():values)P.storage.setItem(this.prefix+k,JSON.stringify(v));return P.save.flush();}
    async removeItems(keys){for(var k of keys)P.storage.removeItem(this.prefix+k);return P.save.flush();}
    async clear(){return this.removeItems(await this.keys());} close(){}
  };
})();

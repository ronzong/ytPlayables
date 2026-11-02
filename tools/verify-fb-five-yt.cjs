'use strict';
// 官方套件内真实输入、广告授奖/拒奖与云存档刷新检查；不注入假 SDK。
const fs=require('fs'),path=require('path'),chrome=require('./lib/chrome.cjs');
const {CdpSession,httpJson,sleep}=require('./lib/cdp.cjs');
const IDS=['AirportSimulator3D','BeepMelody','BobaBubbleTeaDIY','BubbleMerge','DogsVsAliens'];
async function verify(id){const n=IDS.indexOf(id);if(n<0)throw Error('游戏名错误');const port=9290+n,url='https://127.0.0.1:'+(8004+n)+'/',out=path.join(__dirname,'state/five-acceptance',id);fs.mkdirSync(out,{recursive:true});const report={id,steps:[]};let info,page,game;
 try{info=await chrome.launch({userDataDir:path.join(out,'profile'),port,headless:true});page=await CdpSession.attachPage(port);await page.enableCollect();
 await page.send('Emulation.setDeviceMetricsOverride',{width:1920,height:1500,deviceScaleFactor:1,mobile:false});
 await page.navigate('https://developers.google.com/youtube/gaming/playables/test_suite?hl=en');
 await page.eval(`window.__deep=function(sel,root=document){let a=[];for(let el of root.querySelectorAll('*')){if(el.matches(sel))a.push(el);if(el.shadowRoot)a.push(...__deep(sel,el.shadowRoot));}return a;}`);
 await page.waitFor(`__deep('#url-input').length>0`,{timeoutMs:90000});
 await page.eval(`(()=>{let i=__deep('#url-input')[0];i.value=${JSON.stringify(url)};i.dispatchEvent(new Event('input',{bubbles:true}));})()`);await sleep(3000);
 async function attach(){for(let i=0;i<180;i++){let t=(await httpJson('http://127.0.0.1:'+port+'/json/list')).find(t=>t.type==='iframe'&&t.url.includes('127.0.0.1:'+(8004+n)));if(t){game=await CdpSession.connect(t.webSocketDebuggerUrl);await game.enableCollect();await game.waitFor('!!window.__ytPlayables&&__ytPlayables.save.isLoaded()',{timeoutMs:90000});return;}await sleep(500);}throw Error('没有游戏 frame');}
 await attach();await page.waitFor(`__deep('.requirement-entry').some(e=>e.textContent.includes('gameReady called')&&e.querySelector('.pass'))`,{timeoutMs:90000});
 await page.eval(`(()=>{let f=__deep('#playable-iframe')[0];f.style.width='${id==='BeepMelody'?960:540}px';f.style.height='${id==='BeepMelody'?540:1200}px';f.scrollIntoView();})()`);await sleep(1500);
 report.environment=await game.eval('({inPlayables:__ytPlayables.inPlayables,localStorage:window.localStorage,indexedDB:window.indexedDB})');if(!report.environment.inPlayables||report.environment.localStorage!==null||report.environment.indexedDB!==null)throw Error('未进入官方受限环境');
 async function point(x,y){const r=await page.eval(`(()=>{let r=__deep('#playable-iframe')[0].getBoundingClientRect();return{x:r.x,y:r.y};})()`);return{x:r.x+x,y:r.y+y};}
 async function click(name,x,y,hold=150,wait=700){let p=await point(x,y);await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',...p,button:'none'});await page.send('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',clickCount:1});await sleep(hold);await page.send('Input.dispatchMouseEvent',{type:'mouseReleased',...p,button:'left',clickCount:1});await sleep(wait);if(await page.eval(`__deep('button').some(b=>b.textContent.trim()==='Skip')`)){await page.waitFor(`__deep('button').some(b=>b.textContent.trim()==='Skip'&&!b.disabled)`,{timeoutMs:15000});await page.eval(`__deep('button').find(b=>b.textContent.trim()==='Skip').click()`);await sleep(1000);}report.steps.push(name);}
 async function domClick(sel){let r=await game.eval(`(()=>{let r=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);await click(sel,r.x,r.y);}
 async function key(k,code,hold=150){await page.send('Input.dispatchKeyEvent',{type:'keyDown',key:k,code:k,windowsVirtualKeyCode:code});await sleep(hold);await page.send('Input.dispatchKeyEvent',{type:'keyUp',key:k,code:k,windowsVirtualKeyCode:code});}
 await page.screenshot(path.join(out,'ready.png'));
 if(id==='BeepMelody'){await domClick('#btn-tut-go');await key('ArrowUp',38);await sleep(1500);await domClick('#btn-sound');await sleep(2000);}
 if(id==='BobaBubbleTeaDIY'){await click('make',370,610);await click('pearls',335,1018,2100);await click('liquid',205,1018,6200);await click('finish',460,754,150,6000);}
 if(id==='DogsVsAliens'){await click('sound',45,50);for(let i=0;i<3;i++)await click('continue',270,960,150,1000);await key('w',87,1200);}
 if(id==='AirportSimulator3D'){await key('s',83,1000);await key('d',68,1000);await sleep(1500);}
 if(id==='BubbleMerge'){
  async function find(word){return game.eval(`(async()=>{let cc=await System.import('cc'),l=cc.director.getScene().getComponentsInChildren(cc.Label).find(l=>l.node.activeInHierarchy&&l.string===${JSON.stringify(word)});if(!l)throw Error('未找到 '+${JSON.stringify(word)});let p=l.node.worldPosition,v=cc.view.getVisibleSize();return{x:p.x/v.width*innerWidth,y:innerHeight-p.y/v.height*innerHeight};})()`);}
  for(const [from,to]of [['HOODIE','JEANS'],['T-SHIRT','JEANS'],['SNEAKERS','JEANS'],['FOX','BEAR'],['DEER','BEAR'],['RABBIT','BEAR']]){
   let a=await point(...Object.values(await find(from))),b=await point(...Object.values(await find(to)));await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',...a,button:'none'});await page.send('Input.dispatchMouseEvent',{type:'mousePressed',...a,button:'left',clickCount:1});await sleep(180);for(let i=1;i<=8;i++){await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:a.x+(b.x-a.x)*i/8,y:a.y+(b.y-a.y)*i/8,button:'left',buttons:1});await sleep(30);}await page.send('Input.dispatchMouseEvent',{type:'mouseReleased',...b,button:'left',clickCount:1});await sleep(900);report.steps.push(from+' -> '+to);
  }await sleep(1500);
 }
 await page.screenshot(path.join(out,'played.png'));
 await page.eval(`__deep('#pause-button')[0].click()`);await sleep(500);report.audioPaused=await game.eval('__ytPlayables.getAudioState()');
 report.before=JSON.parse(await game.eval('ytgame.game.loadData()'));report.cloudStatus=await game.eval('__ytPlayables.save.status()');if(!Object.keys(report.before.data||{}).length)throw Error('真实操作后 SDK 存档仍为空');
 await page.eval(`__deep('#pause-button')[0].click()`);await sleep(300);
 async function ad(grant){
   let src;if(id==='BobaBubbleTeaDIY')src=`window.__reward=false;window.__closed=false;bridge.advertisement.on('rewarded',s=>{if(s==='rewarded')__reward=true;if(s==='closed'||s==='failed')__closed=true;});bridge.advertisement.showRewarded();'requested'`;
   else if(id==='DogsVsAliens')src=`window.__reward=false;window.__closed=false;gp.ads.on('rewarded:close',()=>__closed=true);gp.ads.showRewardedVideo({onSuccess:()=>__reward=true});'requested'`;
   else if(id==='AirportSimulator3D')src=`window.__reward=false;window.__closed=false;__ytPrimeAd(true,()=>{},ok=>{__reward=ok===true;__closed=true});'requested'`;
   else src=`window.__reward=false;window.__closed=false;YaGames.init().then(s=>s.adv.showRewardedVideo({callbacks:{onRewarded:()=>__reward=true,onClose:()=>__closed=true,onError:()=>__closed=true}}));'requested'`;
   await game.eval(src);let text=grant?'Grant Reward':'Close without Reward';await page.waitFor(`__deep('button').some(b=>b.textContent.includes(${JSON.stringify(text)}))`,{timeoutMs:15000});await page.eval(`__deep('button').find(b=>b.textContent.includes(${JSON.stringify(text)})).click()`);await game.waitFor('__closed',{timeoutMs:15000});let earned=await game.eval('__reward');if(earned!==grant)throw Error('激励回调不正确');return earned;
 }
 report.rejectedReward=await ad(false);report.grantedReward=await ad(true);
 game.close();game=null;await page.eval(`__deep('#refresh-button')[0].click()`);await sleep(3000);await attach();await page.waitFor(`__deep('.requirement-entry').some(e=>e.textContent.includes('gameReady called')&&e.querySelector('.pass'))`,{timeoutMs:90000});
 report.restoredStatus=await game.eval('__ytPlayables.save.status()');report.after=JSON.parse(await game.eval('ytgame.game.loadData()'));if(report.restoredStatus.loadedBytes===0)throw Error('刷新没有读取 SDK 存档');
 report.restoredKeys=Object.keys(report.before.data).filter(k=>k in report.after.data);if(!report.restoredKeys.length)throw Error('刷新后存档键全部丢失');
 report.requirements=await page.eval(`__deep('.requirement-entry').map(e=>({text:e.textContent.trim(),status:e.querySelector('.material-icons').className}))`);report.gameLogs=game.logsText();report.sdkEvents=await page.eval(`__deep('.log-content')[0].textContent`);await page.screenshot(path.join(out,'restored.png'));report.passed=true;console.log('PASS '+id+' 真实操作 / 云档读取 / 激励拒奖与授奖 / 刷新恢复');
 }catch(e){report.error=String(e.stack||e);throw e;}finally{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));if(game)game.close();if(page)page.close();if(info)chrome.kill(info.proc);}}
verify(process.argv[2]).catch(e=>{console.error(e);process.exitCode=1;});

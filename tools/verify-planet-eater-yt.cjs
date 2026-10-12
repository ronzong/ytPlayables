'use strict';
// 官方套件内真实开局、设置存档与刷新恢复验收；报告不进入 git。
const fs=require('fs'), path=require('path');
const chrome=require('./lib/chrome.cjs');
const {CdpSession,httpJson,sleep}=require('./lib/cdp.cjs');
const ROOT=path.resolve(__dirname,'..'), STATE=path.join(ROOT,'tools/state/planet-acceptance');
const PORT=9245, URL='https://127.0.0.1:8003/';
async function main(){
  fs.mkdirSync(STATE,{recursive:true});
  const resumeOnly=process.argv.includes('--resume-only');
  const migrateOnly=process.argv.includes('--migrate-only');
  const previous=(resumeOnly||migrateOnly)?JSON.parse(fs.readFileSync(path.join(STATE,'report.json'),'utf8')):null;
  const info=await chrome.launch({userDataDir:path.join(STATE,'profile'),port:PORT,headless:true});
  let page,game;
  const report={steps:[]};
  try{
    page=await CdpSession.attachPage(PORT);await page.enableCollect();
    await page.send('Emulation.setDeviceMetricsOverride',{width:1440,height:1600,deviceScaleFactor:1,mobile:false});
    await page.navigate('https://developers.google.com/youtube/gaming/playables/test_suite?hl=en');
    await page.eval(`window.__deep=function(sel,root=document){let out=[];for(const el of root.querySelectorAll('*')){if(el.matches(sel))out.push(el);if(el.shadowRoot)out.push(...__deep(sel,el.shadowRoot));}return out;}`);
    await page.waitFor('__deep("#url-input").length>0',{timeoutMs:90000});
    await page.eval(`(()=>{let i=__deep('#url-input')[0];i.value=${JSON.stringify(URL)};i.dispatchEvent(new Event('input',{bubbles:true}));__deep('#refresh-button')[0].click();})()`);
    // 套件输入即加载，刷新会销毁首个 target；等第二次导航稳定再附加。
    await sleep(4000);
    async function attach(){
      for(let i=0;i<180;i++){
        const list=await httpJson('http://127.0.0.1:'+PORT+'/json/list');
        const t=list.find(t=>t.type==='iframe'&&t.url.includes('127.0.0.1:8003'));
        if(t){game=await CdpSession.connect(t.webSocketDebuggerUrl);await game.enableCollect();await game.waitFor('window.__localBootReady===true',{timeoutMs:90000});return;}
        await sleep(500);
      }throw new Error('没有游戏 iframe');
    }
    await attach(); console.log('正式菜单已就绪');
    report.environment=await game.eval('({localStorage:window.localStorage,indexedDB:window.indexedDB,inPlayables:__ytPlayables.inPlayables})');
    if(migrateOnly){
      // 使用上一轮真实 SDK 存档，检查不同地址目录恢复；不是冷启动云服务认证。
      const payload=JSON.parse(previous.cloudAfterHome),files=JSON.parse(payload.data['unity-files']);
      payload.data['unity-files']=JSON.stringify(Object.fromEntries(Object.entries(files).map(([k,v])=>[k.replace('/idbfs/planet-eater/','/idbfs/553b636efb409d68fb868b601959b886/'),v])));
      await game.eval(`ytgame.game.saveData(${JSON.stringify(JSON.stringify(payload))})`);
      game.close();game=null;await page.eval(`__deep('#refresh-button')[0].click()`);await sleep(4000);await attach();
      report.migrated=progress(await game.eval('__ytStorage.__snapshot()'));
      if(JSON.stringify(report.migrated)!==JSON.stringify(previous.progressBefore))throw new Error('不同网址旧云档未恢复');
      await click('continued-from-cloud',270,640,7000);
      report.continueLogs=game.logsText();
      report.afterContinueSnapshot=await game.eval('__ytStorage.__snapshot()');
      report.cloudStatus=await game.eval('__ytPlayables.save.status()');
      console.log('PASS 真实旧存档迁移；继续游戏日志已记录');return;
    }
    if(resumeOnly){
      report.cloudStatus=await game.eval('__ytPlayables.save.status()');
      const coldSnapshot=await game.eval('__ytStorage.__snapshot()');
      const coldFiles=JSON.parse(coldSnapshot['unity-files']||'{}');
      const hasProgress=Object.values(coldFiles).some(v=>Buffer.from(v,'base64').toString().includes('game_save_data'));
      if(!hasProgress){
        report.coldUnverified=true;
        report.reason='新打开的官方套件 SDK 未恢复玩法存档，不能据此认证正式账号跨设备持久化';
        console.log('UNVERIFIED '+report.reason);return;
      }
      report.reopened=progress(await game.eval('__ytStorage.__snapshot()'));
      report.reopenedCloud=progress(JSON.parse(await game.eval('ytgame.game.loadData()')).data);
      if(JSON.stringify(report.reopened)!==JSON.stringify(previous.progressBefore)||JSON.stringify(report.reopenedCloud)!==JSON.stringify(previous.progressBefore))throw new Error('关闭重开后 SDK 云档未恢复');
      // localhost 与 127.0.0.1 的 Unity MD5 目录不同；模拟旧发布地址的真实文件结构。
      const legacy=JSON.parse(await game.eval('ytgame.game.loadData()'));
      const files=JSON.parse(legacy.data['unity-files']);
      legacy.data['unity-files']=JSON.stringify(Object.fromEntries(Object.entries(files).map(([k,v])=>[k.replace('/idbfs/planet-eater/','/idbfs/553b636efb409d68fb868b601959b886/'),v])));
      await game.eval(`ytgame.game.saveData(${JSON.stringify(JSON.stringify(legacy))})`);
      game.close();game=null;await page.eval(`__deep('#refresh-button')[0].click()`);await sleep(4000);await attach();
      report.changedUrlHashRestored=progress(await game.eval('__ytStorage.__snapshot()'));
      if(JSON.stringify(report.changedUrlHashRestored)!==JSON.stringify(previous.progressBefore))throw new Error('不同 URL 哈希云档未恢复');
      report.sdkEvents=await page.eval(`__deep('.log-content')[0].textContent`);
      console.log('PASS 关闭整个 Chrome 后 SDK 云档恢复一致；不同 URL 哈希旧云档迁移通过');return;
    }
    // 仅清理本工具专用官方套件测试存档，保证预设菜单坐标适用。
    await page.eval(`__deep('button').find(b=>b.textContent.trim()==='Clear save').click()`);
    game.close();game=null;await page.eval(`__deep('#refresh-button')[0].click()`);await sleep(4000);await attach();
    await page.eval(`(()=>{let f=__deep('#playable-iframe')[0];f.style.width='540px';f.style.height='1200px';f.scrollIntoView();})()`);
    await sleep(1500);
    async function click(name,x,y,wait){
      const r=await page.eval(`(()=>{let r=__deep('#playable-iframe')[0].getBoundingClientRect();return {x:r.x,y:r.y};})()`);
      const c=await game.eval(`(()=>{let r=document.querySelector('canvas').getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};})()`);
      const p={x:r.x+c.x+x/540*c.w,y:r.y+c.y+y/960*c.h};
      await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',...p,button:'none'});
      await page.send('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',clickCount:1});
      await sleep(150); // Unity 按帧轮询输入，不能在同一帧内按下又抬起。
      await page.send('Input.dispatchMouseEvent',{type:'mouseReleased',...p,button:'left',clickCount:1});
      await sleep(wait);await page.screenshot(path.join(STATE,name+'.png'));report.steps.push(name);
      console.log('已完成：'+name);
    }
    await page.screenshot(path.join(STATE,'menu.png'));
    await click('start',270,640,7000);
    await click('zen',270,768,2500);
    await page.eval(`__deep('#audio-button')[0].click()`);await sleep(300);
    report.platformMuted=await game.eval('__ytPlayables.getAudioState()');
    if(!report.platformMuted.silenced || report.platformMuted.masterGains.some(g=>g!==0))throw new Error('平台静音失败');
    await page.eval(`__deep('#audio-button')[0].click()`);await sleep(300);
    await page.eval(`__deep('#pause-button')[0].click()`);await sleep(1500);
    const frozenBefore=await game.eval('__ytPlayables.getFrameCount()');await sleep(1500);
    report.officialPause={before:frozenBefore,after:await game.eval('__ytPlayables.getFrameCount()'),paused:await game.eval('__ytPlayables.isPaused()')};
    if(!report.officialPause.paused || report.officialPause.before!==report.officialPause.after)throw new Error('官方暂停按钮没有冻结玩法');
    await page.eval(`__deep('#pause-button')[0].click()`);await sleep(500);
    async function reward(grant){
      await game.eval(`window.__adResult='pending';instgame.showRewardedVideo().then(()=>window.__adResult='resolved',()=>window.__adResult='rejected');'requested'`);
      const text=grant?'Grant Reward':'Close without Reward';
      await page.waitFor(`__deep('button').some(b=>b.textContent.includes(${JSON.stringify(text)}))`,{timeoutMs:15000});
      await page.eval(`__deep('button').find(b=>b.textContent.includes(${JSON.stringify(text)})).click()`);
      await game.waitFor(`window.__adResult!=='pending'`,{timeoutMs:15000});
      const result=await game.eval('__adResult');
      if(result!==(grant?'resolved':'rejected'))throw new Error('激励结果错误：'+result);
      return result;
    }
    report.rewardDeclined=await reward(false);report.rewardGranted=await reward(true);
    await click('pause-menu',36,118,1000);
    await click('music-off',429,384,700);
    await click('home',270,812,2000);
    // 不手动 flush：证明游戏自身保存动作已上传，而不是探针替它保存。
    report.before=await game.eval('__ytStorage.__snapshot()');
    report.cloudAfterHome=await game.eval('ytgame.game.loadData()');
    await sleep(1000);
    game.close();game=null;
    await page.eval(`__deep('#refresh-button')[0].click()`);await sleep(1000);await attach();
    report.after=await game.eval('__ytStorage.__snapshot()');
    function progress(snapshot){
      const encoded=Object.values(JSON.parse(snapshot['unity-files']))[0];
      const text=Buffer.from(encoded,'base64').toString();
      const match=/game_save_data[^{]*({[^}]+})/.exec(text);
      if(!match)throw new Error('没有真实玩法存档');
      return JSON.parse(match[1]);
    }
    report.progressBefore=progress(report.before);report.progressAfter=progress(report.after);
    report.progressCloud=progress(JSON.parse(report.cloudAfterHome).data);
    if(JSON.stringify(report.progressBefore)!==JSON.stringify(report.progressCloud))throw new Error('Home 存档没有上传到 SDK');
    if(JSON.stringify(report.progressBefore)!==JSON.stringify(report.progressAfter))throw new Error('刷新后玩法进度变化');
    // 用真实游戏存档构造旧 URL 哈希路径，验证发布地址变化后的兼容迁移。
    const legacy=JSON.parse(report.cloudAfterHome),files=JSON.parse(legacy.data['unity-files']);
    legacy.data['unity-files']=JSON.stringify(Object.fromEntries(Object.entries(files).map(([k,v])=>[k.replace('/idbfs/planet-eater/','/idbfs/553b636efb409d68fb868b601959b886/'),v])));
    await game.eval(`ytgame.game.saveData(${JSON.stringify(JSON.stringify(legacy))})`);
    game.close();game=null;await page.eval(`__deep('#refresh-button')[0].click()`);await sleep(4000);await attach();
    report.legacyRestored=progress(await game.eval('__ytStorage.__snapshot()'));
    if(JSON.stringify(report.legacyRestored)!==JSON.stringify(report.progressBefore))throw new Error('旧 URL 哈希目录未迁移');
    await click('continued',270,640,7000);
    report.continueLogs=game.logsText();
    report.afterContinueSnapshot=await game.eval('__ytStorage.__snapshot()');
    report.cloudStatus=await game.eval('__ytPlayables.save.status()');
    await page.screenshot(path.join(STATE,'restored.png'));
    report.requirements=await page.eval(`__deep('.requirement-entry').map(e=>({text:e.textContent.trim(),status:e.querySelector('.material-icons').className}))`);
    report.gameLogs=game.logsText();report.pageLogs=page.logsText();
    report.sdkEvents=await page.eval(`__deep('.log-content')[0].textContent`);
    console.log('验收报告：'+path.join(STATE,'report.json'));
  }finally{
    fs.writeFileSync(path.join(STATE,resumeOnly?'cold-report.json':migrateOnly?'migration-report.json':'report.json'),JSON.stringify(report,null,2));
    if(game)game.close();if(page)page.close();chrome.kill(info.proc);
  }
}
main().catch(e=>{console.error(e);process.exitCode=1});

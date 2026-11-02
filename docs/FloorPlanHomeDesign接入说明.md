# FloorPlanHomeDesign 接入说明

状态（2026-11-01）：接入完成，官方 MUST 全 PASS、暂停九项全 PASS、云存档刷新与广告分支通过。

来源：`C:/Works/git/yxl/FBIGCrack/FBIGCrack/FloorPlanHomeDesign/local-game`，已接入 FB 的离线基线，只读引用。产物 `build/FloorPlanHomeDesign-yt/`；服务端口 8013；构建入口 `tools/build-floorplan-yt.cjs`。

## 改造与复现

Flashist/Pixi：保留源 local-platform.js 的完整离线能力、英文与单行标题。bundle 等云档恢复后加载；动态 SDK 根路径改同目录空就绪脚本，并 append 到 head 末尾，确保 YouTube SDK 仍为首 script。全部 localStorage 使用映射为内存云档，保留原 __flashistAppFramework__room-sort 格式与时间戳对账。源构建已有 PIXI 应用引用钩子供真实输入测量，不修改关卡状态。LoadingAPI.ready 使用原加载完成信号；初始插屏自然触发，套件需点 Skip 后继续加载。

公共构建实现 tools/lib/build-fb-second.cjs；源 SHA256（文本 LF 归一化）清单 tools/manifests/fb-second-sources.json。构建从源重来，关键补丁匹配次数校验；源版本变化直接失败。回滚为移除本批构建脚本/适配层后重新生成，不回写源仓库。

复用运行时音频总闸门、SDK pause/resume、输入与网络冻结、可见性屏蔽；游戏定时器改经 __ytGameTimers。SDK 第一个同步 script，firstFrameReady 早于真实 gameReady。存档全键同步，先 loadData 后 saveData，不依赖浏览器 localStorage/indexedDB。

```powershell
node tools/build-floorplan-yt.cjs --zip
node tools/serve-https.cjs build/FloorPlanHomeDesign-yt 8013 --host 127.0.0.1
node tools/yt-suite.cjs run --url https://127.0.0.1:8013/ --name FloorPlanHomeDesign --headless
node tools/yt-suite.cjs pause-local --url https://127.0.0.1:8013/ --headless
node tools/verify-fb-second-yt.cjs FloorPlanHomeDesign
```

## 实测与限制

- 构建目录 55 文件，4.25 MiB；文件名、单文件、总包限制由构建器检查。
- pause-local 九项全 PASS，日志 tools/state/second-pause-FloorPlanHomeDesign.log；覆盖循环、画面、输入、音频、恢复、禁用可见性恢复、仅 SDK 恢复与暂停无新请求。
- 官方受限环境 localStorage/indexedDB 为 null；实际 SDK 读写、暂停提交、刷新读取已通过：1 个键，刷新读取 8836 字节，激励拒奖 false / 授奖 true。报告 tools/state/second-acceptance/FloorPlanHomeDesign/report.json。
- 本地套件接口往返不等于正式账号跨设备认证；未逐一通关全部关卡、未做全部硬件与正式托管验收。sendScore 未自然触发，不伪造分数。
- 广告图 `marketing/FloorPlanHomeDesign/ad-540x756.png`，540×756，无文字/logo；参考图与设计说明见 marketing/README.md，广告图不装入游戏 ZIP。

首屏自然插屏可能使官方 5 秒推荐项变为警告；计时包含广告展示等待，记录真实时间，不绕过广告伪造就绪。

原生房间拖拽已完成首张拼图：nextStageIndex=1，刷新后仍为 1；本次重新读取 11066 字节。首次鼠标输入需建立 iframe 焦点，验收器重试原生拖拽，不直接改进度或调用通关函数。

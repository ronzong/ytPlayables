# HarvestIO 接入说明

2026-11-02，第四批按字母顺序选择已接 FB 的游戏。源目录：`C:/Works/git/yxl/FBIGCrack/FBIGCrack/HarvestIO/local-game`，只读引用。LordlingKeep 仅有 FB 来源离线版本记录，MakeoverCleaningASMR/MakeupKitBeautySalon/MatchColoring 无已接 FB 记录，因此跳过。

## 构建与改造

- 引擎与平台：PixiJS 5.3.3 + Three.js；CrazyGames v3。
- 保留同步 data 接口与广告成对回调，真实 platformApi.gameReady 通知；允许真实软件 WebGL 上下文，不伪造渲染能力。
- 公共构建 `tools/lib/build-fb-fourth.cjs`、平台桥 `platform/fourth-batch-yt.js`；源 SHA256 清单 `tools/manifests/fb-fourth-sources.json`。源版本变化即退出，从源重建不叠加；文本 LF 归一化、二进制原字节。回滚为移除本适配并从源重建，不手改 staging、不回写源。
- 官方 SDK 是首个同步 script；firstFrameReady 来自加载首帧，gameReady 来自实际就绪。统一冻结 RAF、定时器、输入、网络与音频，屏蔽网页 visibility 恢复通路。
- 在 Playables 的 localStorage/indexedDB 为 null 环境运行，先 loadData 成功再 saveData；不使用原平台账号、第三方广告或外部统计服务。

## 验证

官方套件 MUST 全 PASS（SDK 顺序、首包、首帧顺序、真实 gameReady、云档），暂停九项全 PASS；原生输入、平台静音、激励拒奖 false / 授奖 true、SDK 云档跨刷新读取均已验证。证据目录 `tools/state/fourth-acceptance/HarvestIO/`，暂停日志 `tools/state/fourth-pause-HarvestIO.log`。

```powershell
node tools/build-harvestio-yt.cjs --zip
node tools/serve-https.cjs build/HarvestIO-yt 8019 --host 127.0.0.1
node tools/yt-suite.cjs run --url https://127.0.0.1:8019/ --name HarvestIO --headless
node tools/yt-suite.cjs pause-local --url https://127.0.0.1:8019/ --headless
node tools/verify-fb-fourth-yt.cjs HarvestIO
```

产物 `build/HarvestIO-yt/`，ZIP `build/HarvestIO-yt.zip`（根 index.html，不嵌套 ZIP）。广告图独立保存 `marketing/HarvestIO/ad-540x756.png`，540×756、无文字/数字/logo，内置 imagegen 根据实测截图重构；参考截图同目录、提示词见 `marketing/fourth-batch-prompts.json`。

未覆盖：正式账号跨设备云档、全部关卡/全部可选道具和真机长时间运行；不使用假分数满足 sendScore 推荐项。

最终数据：完整资源 41.71 MiB，600 个文件，ZIP 29.58 MiB；Initial bundle size of 6.36 MiB（本次启动/刷新较大值），刷新 loadData 488 字节、恢复 1 个原存档键。重复构建全部文件 SHA256 一致，无未解释异常或 404。汇总见 `docs/第四批FB游戏验收摘要.json`。

5 秒加载是推荐项，冷启动/软件 WebGL/并发/代理环境有时产生警告，报告保留实测时序，不提前发送 ready。SDK 只保存游戏已提交状态，不把在局内尚未结算的状态等同于已提交云档。

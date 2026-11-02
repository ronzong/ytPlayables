# FallToRescue 接入说明

状态（2026-11-01）：接入完成，官方 MUST 全 PASS、暂停九项全 PASS、云存档刷新与广告分支通过。

来源：`C:/Works/git/yxl/FBIGCrack/FBIGCrack/FallToRescue/local-game`，已接入 FB 的离线基线，只读引用。产物 `build/FallToRescue-yt/`；服务端口 8011；构建入口 `tools/build-falltorescue-yt.cjs`。

## 改造与复现

Unity 2021：data/wasm 用 Brotli 压缩并随包解码，framework 修补 IDBFS.syncfs 与定时器冻结。移除 local-ads 本地模拟与页面总静音按钮；ADManager 原 beforeAd/adViewed/adDismissed/afterAd 契约转真实 YouTube 广告，只有观看成功才 adViewed。沿用 Unity 实例就绪及加载条收起的真实信号。

公共构建实现 tools/lib/build-fb-second.cjs；源 SHA256（文本 LF 归一化）清单 tools/manifests/fb-second-sources.json。构建从源重来，关键补丁匹配次数校验；源版本变化直接失败。回滚为移除本批构建脚本/适配层后重新生成，不回写源仓库。

复用运行时音频总闸门、SDK pause/resume、输入与网络冻结、可见性屏蔽；游戏定时器改经 __ytGameTimers。SDK 第一个同步 script，firstFrameReady 早于真实 gameReady。存档全键同步，先 loadData 后 saveData，不依赖浏览器 localStorage/indexedDB。

```powershell
node tools/build-falltorescue-yt.cjs --zip
node tools/serve-https.cjs build/FallToRescue-yt 8011 --host 127.0.0.1
node tools/yt-suite.cjs run --url https://127.0.0.1:8011/ --name FallToRescue --headless
node tools/yt-suite.cjs pause-local --url https://127.0.0.1:8011/ --headless
node tools/verify-fb-second-yt.cjs FallToRescue
```

## 实测与限制

- 构建目录 21 文件，11.60 MiB；文件名、单文件、总包限制由构建器检查。
- pause-local 九项全 PASS，日志 tools/state/second-pause-FallToRescue.log；覆盖循环、画面、输入、音频、恢复、禁用可见性恢复、仅 SDK 恢复与暂停无新请求。
- 官方受限环境 localStorage/indexedDB 为 null；实际 SDK 读写、暂停提交、刷新读取已通过：1 个键，刷新读取 141 字节，激励拒奖 false / 授奖 true。报告 tools/state/second-acceptance/FallToRescue/report.json。
- 本地套件接口往返不等于正式账号跨设备认证；未逐一通关全部关卡、未做全部硬件与正式托管验收。sendScore 未自然触发，不伪造分数。
- 广告图 `marketing/FallToRescue/ad-540x756.png`，540×756，无文字/logo；参考图与设计说明见 marketing/README.md，广告图不装入游戏 ZIP。

实际点击开局并下落，PlayerPrefs 原生启动次数已恢复。未宣称已验证一整关通关进度；无头软件 WebGL 的 INVALID_ENUM 初始化探测提示沿用源构建，后续渲染正常。

已追加原生 playreward → myUnityInstance.SendMessage(ADManager, RewardCallBack, ...) 验收：未完整观看发送 adDismissed，完整观看才 adViewed，二者均 afterAd；实际调用原 SendMessage，无伪造 SDK。最新刷新读取 141 字节。

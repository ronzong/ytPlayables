# FindTheDifference 接入说明

状态（2026-11-01）：接入完成，官方 MUST 全 PASS、暂停九项全 PASS、云存档刷新与广告分支通过。

来源：`C:/Works/git/yxl/FBIGCrack/FBIGCrack/FindTheDifference/local-game`，已接入 FB 的离线基线，只读引用。产物 `build/FindTheDifference-yt/`；服务端口 8012；构建入口 `tools/build-ftd-yt.cjs`。

## 改造与复现

Phaser 2.6.2：预装 CrazyGames 同调用面 YouTube 桥，去掉 main.js 动态插入 SDK 到首脚本之前的行为。游戏脚本等云档读取完成后启动，原 window.onload 改为显式启动，解决延迟脚本错过 load 事件黑屏。Phaser 存储检测与业务 SaveManager 改内存云存储，保留所有关卡素材。LoadingStop 转 gameReady；激励取消/失败走 adError，不发奖励。

公共构建实现 tools/lib/build-fb-second.cjs；源 SHA256（文本 LF 归一化）清单 tools/manifests/fb-second-sources.json。构建从源重来，关键补丁匹配次数校验；源版本变化直接失败。回滚为移除本批构建脚本/适配层后重新生成，不回写源仓库。

复用运行时音频总闸门、SDK pause/resume、输入与网络冻结、可见性屏蔽；游戏定时器改经 __ytGameTimers。SDK 第一个同步 script，firstFrameReady 早于真实 gameReady。存档全键同步，先 loadData 后 saveData，不依赖浏览器 localStorage/indexedDB。

```powershell
node tools/build-ftd-yt.cjs --zip
node tools/serve-https.cjs build/FindTheDifference-yt 8012 --host 127.0.0.1
node tools/yt-suite.cjs run --url https://127.0.0.1:8012/ --name FindTheDifference --headless
node tools/yt-suite.cjs pause-local --url https://127.0.0.1:8012/ --headless
node tools/verify-fb-second-yt.cjs FindTheDifference
```

## 实测与限制

- 构建目录 701 文件，25.89 MiB；文件名、单文件、总包限制由构建器检查。
- pause-local 九项全 PASS，日志 tools/state/second-pause-FindTheDifference.log；覆盖循环、画面、输入、音频、恢复、禁用可见性恢复、仅 SDK 恢复与暂停无新请求。
- 官方受限环境 localStorage/indexedDB 为 null；实际 SDK 读写、暂停提交、刷新读取已通过：1 个键，刷新读取 51 字节，激励拒奖 false / 授奖 true。报告 tools/state/second-acceptance/FindTheDifference/report.json。
- 本地套件接口往返不等于正式账号跨设备认证；未逐一通关全部关卡、未做全部硬件与正式托管验收。sendScore 未自然触发，不伪造分数。
- 广告图 `marketing/FindTheDifference/ad-540x756.png`，540×756，无文字/logo；参考图与设计说明见 marketing/README.md，广告图不装入游戏 ZIP。

真实打开设置并切换音效，云档 user_sound=0，刷新读取一致；进入第一张象群关卡。尚未完整完成一张找不同。

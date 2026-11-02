# EggyCar 接入说明

状态（2026-11-01）：接入完成，官方 MUST 全 PASS、暂停九项全 PASS、云存档刷新与广告分支通过。

来源：`C:/Works/git/yxl/FBIGCrack/FBIGCrack/EggyCar/local-game`，已接入 FB 的离线基线，只读引用。产物 `build/EggyCar-yt/`；服务端口 8010；构建入口 `tools/build-eggycar-yt.cjs`。

## 改造与复现

Construct 2：延迟启动到云档读取完成；原 localforage 自带数据库驱动在受限环境初始化即异常，替换为同 Promise/回调契约的异步云存储。音乐文件 bg music.ogg 改 bg_music.ogg，事件名和资源清单同步，解决非法文件名与音频 404。GD/Vooxe 原广告触发点转真实 YouTube 插屏，沿用 onResumeGame 收尾；ready 由真实 running_layout 触发，无超时假就绪。保留原音效/音乐分项开关。

公共构建实现 tools/lib/build-fb-second.cjs；源 SHA256（文本 LF 归一化）清单 tools/manifests/fb-second-sources.json。构建从源重来，关键补丁匹配次数校验；源版本变化直接失败。回滚为移除本批构建脚本/适配层后重新生成，不回写源仓库。

复用运行时音频总闸门、SDK pause/resume、输入与网络冻结、可见性屏蔽；游戏定时器改经 __ytGameTimers。SDK 第一个同步 script，firstFrameReady 早于真实 gameReady。存档全键同步，先 loadData 后 saveData，不依赖浏览器 localStorage/indexedDB。

```powershell
node tools/build-eggycar-yt.cjs --zip
node tools/serve-https.cjs build/EggyCar-yt 8010 --host 127.0.0.1
node tools/yt-suite.cjs run --url https://127.0.0.1:8010/ --name EggyCar --headless
node tools/yt-suite.cjs pause-local --url https://127.0.0.1:8010/ --headless
node tools/verify-fb-second-yt.cjs EggyCar
```

## 实测与限制

- 构建目录 87 文件，5.78 MiB；文件名、单文件、总包限制由构建器检查。
- pause-local 九项全 PASS，日志 tools/state/second-pause-EggyCar.log；覆盖循环、画面、输入、音频、恢复、禁用可见性恢复、仅 SDK 恢复与暂停无新请求。
- 官方受限环境 localStorage/indexedDB 为 null；实际 SDK 读写、暂停提交、刷新读取已通过：2 个键，刷新读取 112 字节，激励拒奖 false / 授奖 true。报告 tools/state/second-acceptance/EggyCar/report.json。
- 本地套件接口往返不等于正式账号跨设备认证；未逐一通关全部关卡、未做全部硬件与正式托管验收。sendScore 未自然触发，不伪造分数。
- 广告图 `marketing/EggyCar/ad-540x756.png`，540×756，无文字/logo；参考图与设计说明见 marketing/README.md，广告图不装入游戏 ZIP。

真实开局经过 Continue，按方向键行驶并结束一轮，原生 best 已产生非零值；设置/进度通过 Construct 异步存储走云档。传感器 permissions policy 提示是官方 iframe 禁止 accelerometer，无对应必需玩法。

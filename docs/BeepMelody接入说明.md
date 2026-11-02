# BeepMelody YouTube 接入说明

来源：`C:/Works/git/yxl/FBIGCrack/FBIGCrack/BeepMelody/local-game`（已接 FB，只读）。产物：`build/BeepMelody-yt/`；发布：`build/BeepMelody-yt.zip`。端口 8005。

## 改造

构建入口 `tools/build-beepmelody-yt.cjs`，公共实现 `tools/lib/build-fb-five.cjs`。所有源文件经 SHA256 清单校验，重建从源复制，补丁有匹配校验；源变化会报错。只替换入口、平台适配与必要引擎补丁，不改玩法。SDK 第一个同步 script，firstFrameReady 在实际首帧，gameReady 使用游戏原就绪信号。复用合规运行时的音频、输入、网络、可见性与暂停闸门，并将游戏定时器纳入暂停。

Yandex 调用面保持一致，播放器数据走 SDK 云档；模块定时器纳入暂停闸门。保留横屏方向。

存档采用 ytgame.game.loadData/saveData，先 load 后写，浏览器 localStorage/indexedDB 为 null 时仍可运行。暂停触发提交；广告只在 resolve(true) 发奖。

## 验证（2026-11-01）

- 官方套件 MUST 全 PASS；初始下载 4.76 MiB，gameReady 2.138 秒。sendScore 尚未自然触发，不伪造分数。
- pause-local 九项全 PASS：循环、渲染、输入、音频、恢复、恢复输入、无可见性通路、仅 SDK 恢复、暂停无新请求。
- 官方套件真实输入、暂停存档、刷新恢复、激励拒奖与授奖：见 tools/state/five-acceptance/BeepMelody/report.json。该报告为本地套件环境，不代表正式账号跨设备云档认证。
- 未覆盖全部关卡与所有硬件；正式环境仍需账号云档、长时间游玩与移动设备性能验收。

复核命令：

```powershell
node tools/build-beepmelody-yt.cjs --zip
node tools/serve-https.cjs build/BeepMelody-yt 8005 --host 127.0.0.1
node tools/yt-suite.cjs run --url https://127.0.0.1:8005/ --name BeepMelody --headless
node tools/yt-suite.cjs pause-local --url https://127.0.0.1:8005/ --headless
node tools/verify-fb-five-yt.cjs BeepMelody
```

广告图：`marketing/BeepMelody/ad-540x756.png`（540×756，无文字/logo，根据真实截图重新构图）。

云档验收结果：暂停后 1 个键，刷新读取 214 字节；拒奖回调 false、授奖回调 true。

# GrowIntoTheSun 接入说明

2026-11-02，第三批按字母顺序接入。来源 `C:/Works/git/yxl/FBIGCrack/FBIGCrack/GrowIntoTheSun/local-game`（已接 FB，只读）。构建 `tools/build-growintothesun-yt.cjs`，产物 `build/GrowIntoTheSun-yt/`，发布 `build/GrowIntoTheSun-yt.zip`，HTTPS 端口 8018。

## 改造

Phaser 3.90 + Yandex。保留固定英文、本地化与 PC 开局提示；游戏模块在云档恢复后启动。补 features2.GameplayAPI 调用面，LoadingAPI.ready 上报真实就绪；既保存 yandex-player，也同步本地业务 bestiary 键。原生 Begin / Got it / 鼠标移动保持不变。

公共构建实现 tools/lib/build-fb-third.cjs；源文件 SHA256 位于 tools/manifests/fb-third-sources.json。文本 LF 归一化，二进制按原始字节；源版本变化即停止。每次从源复制后应用补丁，新增文件与脚本不回写源仓库。回滚为从源重建并移除本适配，不手改 staging。

SDK 为根页面首个同步 script，firstFrameReady 早于游戏原就绪信号；使用统一音频、输入、网络、RAF/游戏定时器与 visibility 屏蔽运行时。Playables 环境 localStorage/indexedDB 为 null；先 SDK loadData 后写 saveData，全部业务键同步。广告图独立于发布包。

## 验证与范围

- 构建 6 文件，完整资源 1.79 MiB；全部文件名合法，单文件 <30 MiB、总包 <250 MiB、文件数 ≤8000。
- 官方套件 MUST 5/5 PASS：见 tools/state/reports/ 对应报告与 tools/state/third-acceptance/GrowIntoTheSun/report.json；实际游戏 SDK 事件，不伪造分数或 ready。
- pause-local：九项检查全 PASS，日志 tools/state/third-pause-GrowIntoTheSun.log。
- 真实输入、暂停云档、刷新读取、激励拒奖与授奖：已通过。云档往返为本地官方套件，不等于正式账号跨设备验收。
- 未逐一完成所有关卡、皮肤/全部可选分支和真机长时间测试；sendScore 未自然触发，不补假分数。

```powershell
node tools/build-growintothesun-yt.cjs --zip
node tools/serve-https.cjs build/GrowIntoTheSun-yt 8018 --host 127.0.0.1
node tools/yt-suite.cjs run --url https://127.0.0.1:8018/ --name GrowIntoTheSun --headless
node tools/yt-suite.cjs pause-local --url https://127.0.0.1:8018/ --headless
node tools/verify-fb-third-yt.cjs GrowIntoTheSun
```

广告图：`marketing/GrowIntoTheSun/ad-540x756.png`（540×756，无文字/数字/logo）；参考截图同目录保存，构图说明见 marketing/README.md。

真实 Play from the start→Begin、鼠标移动吞噬，首次微生物图鉴记录 yagame.bestiary.v2 与 yandex-player，刷新仍存在；未宣称通关所有七个尺度。

最终验收：平台静音主音量为 0；广告拒奖 false / 授奖 true；刷新 SDK loadData 读取 254 字节，恢复 2 个存档键，无 404 或未解释的运行异常。完整汇总见 `docs/第三批FB游戏验收摘要.json`。

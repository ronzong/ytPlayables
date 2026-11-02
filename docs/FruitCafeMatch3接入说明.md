# FruitCafeMatch3 接入说明

2026-11-02，第三批按字母顺序接入。来源 `C:/Works/git/yxl/FBIGCrack/FBIGCrack/FruitCafeMatch3/local-game`（已接 FB，只读）。构建 `tools/build-fruitcafe-yt.cjs`，产物 `build/FruitCafeMatch3-yt/`，发布 `build/FruitCafeMatch3-yt.zip`，HTTPS 端口 8015。

## 改造

Phaser 3 + GamePush 调用面。替换入口本地 mock，保持 player.ready Promise、get/set/sync、暂停/恢复和广告 Promise 语义；玩家字段保存在 gamepush-player，只有激励 resolve(true) 允许奖励。原模块等待 DOMContentLoaded，云档读取后的动态加载可能错过事件；改为依据真实 document.readyState 调用原启动回调，不派发假 SDK/DOM 事件。保留原离线分析能力：remote-disabled，仅本地日志，无外部统计。

公共构建实现 tools/lib/build-fb-third.cjs；源文件 SHA256 位于 tools/manifests/fb-third-sources.json。文本 LF 归一化，二进制按原始字节；源版本变化即停止。每次从源复制后应用补丁，新增文件与脚本不回写源仓库。回滚为从源重建并移除本适配，不手改 staging。

SDK 为根页面首个同步 script，firstFrameReady 早于游戏原就绪信号；使用统一音频、输入、网络、RAF/游戏定时器与 visibility 屏蔽运行时。Playables 环境 localStorage/indexedDB 为 null；先 SDK loadData 后写 saveData，全部业务键同步。广告图独立于发布包。

## 验证与范围

- 构建 164 文件，完整资源 4.24 MiB；全部文件名合法，单文件 <30 MiB、总包 <250 MiB、文件数 ≤8000。
- 官方套件 MUST 5/5 PASS：见 tools/state/reports/ 对应报告与 tools/state/third-acceptance/FruitCafeMatch3/report.json；实际游戏 SDK 事件，不伪造分数或 ready。
- pause-local：九项检查全 PASS，日志 tools/state/third-pause-FruitCafeMatch3.log。
- 真实输入、暂停云档、刷新读取、激励拒奖与授奖：已通过。云档往返为本地官方套件，不等于正式账号跨设备验收。
- 未逐一完成所有关卡、皮肤/全部可选分支和真机长时间测试；sendScore 未自然触发，不补假分数。

```powershell
node tools/build-fruitcafe-yt.cjs --zip
node tools/serve-https.cjs build/FruitCafeMatch3-yt 8015 --host 127.0.0.1
node tools/yt-suite.cjs run --url https://127.0.0.1:8015/ --name FruitCafeMatch3 --headless
node tools/yt-suite.cjs pause-local --url https://127.0.0.1:8015/ --headless
node tools/verify-fb-third-yt.cjs FruitCafeMatch3
```

广告图：`marketing/FruitCafeMatch3/ad-540x756.png`（540×756，无文字/数字/logo）；参考截图同目录保存，构图说明见 marketing/README.md。

真实点击教程三枚菠萝，画面进度 0/12→3/12、金币 0→25；原生 GamePush 字段云档读取成功。

最终验收：平台静音主音量为 0；广告拒奖 false / 授奖 true；刷新 SDK loadData 读取 1647 字节，恢复 1 个存档键，无 404 或未解释的运行异常。完整汇总见 `docs/第三批FB游戏验收摘要.json`。

教程中实际完成一组三消；当前关卡中途不结算持久化金币，刷新验证的是原游戏已提交的 gamepush-player（会话/设置/教程状态），尚未覆盖通关后的奖励结算。

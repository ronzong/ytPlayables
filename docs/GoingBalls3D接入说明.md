# GoingBalls3D 接入说明

2026-11-02，第三批按字母顺序接入。来源 `C:/Works/git/yxl/FBIGCrack/FBIGCrack/GoingBalls3D/local-game`（已接 FB，只读）。构建 `tools/build-goingballs-yt.cjs`，产物 `build/GoingBalls3D-yt/`，发布 `build/GoingBalls3D-yt.zip`，HTTPS 端口 8017。

## 改造

LayaAir + GD。SDK_READY 只在云档恢复后放行原 index.js；gameReady 来自真实 HomeUI.Show。保留原 PauseMgr、广告 SDK_GAME_PAUSE/START、复活与商店 500 金币修复，只有观看成功发 SDK_REWARDED_WATCH_COMPLETE。规范空格/中文/$ 文件名并同步 JSON、材质与引擎派生皮肤引用。源目录数百个 Not found at origin 下载错误占位和未使用 layaPlugin/debug/workerloader 未装入包，不删有效玩法资源。关键：.ltcb.ls 是二进制 Cubemap，不按 .ls 后缀当 JSON 改写；源指纹与重命名阶段均识别内容，避免破坏纹理头。

公共构建实现 tools/lib/build-fb-third.cjs；源文件 SHA256 位于 tools/manifests/fb-third-sources.json。文本 LF 归一化，二进制按原始字节；源版本变化即停止。每次从源复制后应用补丁，新增文件与脚本不回写源仓库。回滚为从源重建并移除本适配，不手改 staging。

SDK 为根页面首个同步 script，firstFrameReady 早于游戏原就绪信号；使用统一音频、输入、网络、RAF/游戏定时器与 visibility 屏蔽运行时。Playables 环境 localStorage/indexedDB 为 null；先 SDK loadData 后写 saveData，全部业务键同步。广告图独立于发布包。

## 验证与范围

- 构建 107 文件，完整资源 13.47 MiB；全部文件名合法，单文件 <30 MiB、总包 <250 MiB、文件数 ≤8000。
- 官方套件 MUST 5/5 PASS：见 tools/state/reports/ 对应报告与 tools/state/third-acceptance/GoingBalls3D/report.json；实际游戏 SDK 事件，不伪造分数或 ready。
- pause-local：九项检查全 PASS，日志 tools/state/third-pause-GoingBalls3D.log。
- 真实输入、暂停云档、刷新读取、激励拒奖与授奖：已通过。云档往返为本地官方套件，不等于正式账号跨设备验收。
- 未逐一完成所有关卡、皮肤/全部可选分支和真机长时间测试；sendScore 未自然触发，不补假分数。

```powershell
node tools/build-goingballs-yt.cjs --zip
node tools/serve-https.cjs build/GoingBalls3D-yt 8017 --host 127.0.0.1
node tools/yt-suite.cjs run --url https://127.0.0.1:8017/ --name GoingBalls3D --headless
node tools/yt-suite.cjs pause-local --url https://127.0.0.1:8017/ --headless
node tools/verify-fb-third-yt.cjs GoingBalls3D
```

广告图：`marketing/GoingBalls3D/ad-540x756.png`（540×756，无文字/数字/logo）；参考截图同目录保存，构图说明见 marketing/README.md。

最终验收：平台静音主音量为 0；广告拒奖 false / 授奖 true；刷新 SDK loadData 读取 51 字节，恢复 1 个存档键，无 404 或未解释的运行异常。完整汇总见 `docs/第三批FB游戏验收摘要.json`。

已通过原生按钮进入 Level 1 木轨并拖动滚球；本次跨刷新核验的业务键为 soundsound（声音设置）。关卡完成后的等级/金币结算尚未覆盖，不把设置恢复等同于通关进度验收。

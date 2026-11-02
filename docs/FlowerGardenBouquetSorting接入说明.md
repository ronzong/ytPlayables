# FlowerGardenBouquetSorting 接入说明

2026-11-02，第三批按字母顺序接入。来源 `C:/Works/git/yxl/FBIGCrack/FBIGCrack/FlowerGardenBouquetSorting/local-game`（已接 FB，只读）。构建 `tools/build-flowergarden-yt.cjs`，产物 `build/FlowerGardenBouquetSorting-yt/`，发布 `build/FlowerGardenBouquetSorting-yt.zip`，HTTPS 端口 8014。

## 改造

Cocos Creator 2.4.11 + Flashist 父子协议。官方生产 CSP 禁止 iframe URL 导航，改为同源 fetch 子页后以 srcdoc 内联，继承父页 CSP；保留原父子消息、外层菜单、语言与玩法。子文档基址/入口资源由当前同源地址解析，保留启动参数；无外部网络。子页独立安装 RAF、定时器、输入和音频闸门，同时共享父页唯一 storage/save，避免独立云档覆盖。移除实际门户 Y8/miniplay 代码执行，使用只保留启动契约的本地接口。保留 FB 已验证的预加载 0.999999 阈值归一化。SDK、广告、存档仅父页对接。

公共构建实现 tools/lib/build-fb-third.cjs；源文件 SHA256 位于 tools/manifests/fb-third-sources.json。文本 LF 归一化，二进制按原始字节；源版本变化即停止。每次从源复制后应用补丁，新增文件与脚本不回写源仓库。回滚为从源重建并移除本适配，不手改 staging。

SDK 为根页面首个同步 script，firstFrameReady 早于游戏原就绪信号；使用统一音频、输入、网络、RAF/游戏定时器与 visibility 屏蔽运行时。Playables 环境 localStorage/indexedDB 为 null；先 SDK loadData 后写 saveData，全部业务键同步。广告图独立于发布包。

## 验证与范围

- 构建 2598 文件，完整资源 18.22 MiB；全部文件名合法，单文件 <30 MiB、总包 <250 MiB、文件数 ≤8000。
- 官方套件 MUST 5/5 PASS：见 tools/state/reports/ 对应报告与 tools/state/third-acceptance/FlowerGardenBouquetSorting/report.json；实际游戏 SDK 事件，不伪造分数或 ready。
- pause-local：九项检查全 PASS，日志 tools/state/third-pause-FlowerGardenBouquetSorting-final.log。花束额外检查同源子文档真实输入，事件不跨 iframe 冒泡，统一计数并非模拟输入回调。
- 真实输入、暂停云档、刷新读取、激励拒奖与授奖：已通过。云档往返为本地官方套件，不等于正式账号跨设备验收。
- 未逐一完成所有关卡、皮肤/全部可选分支和真机长时间测试；sendScore 未自然触发，不补假分数。

```powershell
node tools/build-flowergarden-yt.cjs --zip
node tools/serve-https.cjs build/FlowerGardenBouquetSorting-yt 8014 --host 127.0.0.1
node tools/yt-suite.cjs run --url https://127.0.0.1:8014/ --name FlowerGardenBouquetSorting --headless
node tools/yt-suite.cjs pause-local --url https://127.0.0.1:8014/ --headless
node tools/verify-fb-third-yt.cjs FlowerGardenBouquetSorting
```

广告图：`marketing/FlowerGardenBouquetSorting/ad-540x756.png`（540×756，无文字/数字/logo）；参考截图同目录保存，构图说明见 marketing/README.md。

实测真实同色合并：handleStep 0→1、元素 6→3，刷新恢复；不使用源 FB 验收工具的体力门绕过。自然初始插屏需在官方套件点击 Skip 后继续，故含广告等待的 5 秒推荐项会警告。套件父页资源计量不含全部子页，应保守以完整资源目录 18.22 MiB 检查首包：仍小于 30 MiB。

最终验收：平台静音主音量为 0；广告拒奖 false / 授奖 true；刷新 SDK loadData 读取 10180 字节，恢复 57 个存档键，无 404 或未解释的运行异常。完整汇总见 `docs/第三批FB游戏验收摘要.json`。

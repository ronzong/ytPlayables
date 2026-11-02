# Dominators 接入说明

状态（2026-11-02）：用户已允许贴图质量压缩，已纳入默认构建并生成正式发布包。

来源：`C:/Works/git/yxl/FBIGCrack/FBIGCrack/Dominators/local-game`，已接入 FB 的离线基线，只读引用。产物 `build/Dominators-yt/`；服务端口 8009；构建入口 `tools/build-dominators-yt.cjs`。

## 改造与复现

Unity 6000.0.67f1 + PluginYG2：保留本地基线已测试的广告间隔与业务桥，替换 Yandex 能力；移除 adv-probe。SDK 数据与统计分别通过 yandex-player/yandex-stats 保存，Unity PlayerPrefs 通过固定 /idbfs/game 快照保存。Brotli 显式解压为 Blob，不依赖响应头；Addressables 中括号文件名改为下划线，请求同步映射。原画质重组 UnityFS、Brotli q11 后完整目录仍为 36.70 MiB，超出首包限制，因此采用用户已允许的 RGBA4444 + Brotli q10。贴图尺寸、全部关卡与玩法资源保留，字体 Alpha8 精度不变；渐变与半透明区域可见更明显色阶。

公共构建实现 tools/lib/build-fb-second.cjs；源 SHA256（文本 LF 归一化）清单 tools/manifests/fb-second-sources.json。构建从源重来，关键补丁匹配次数校验；源版本变化直接失败。回滚为移除本批构建脚本/适配层后重新生成，不回写源仓库。

复用运行时音频总闸门、SDK pause/resume、输入与网络冻结、可见性屏蔽；游戏定时器改经 __ytGameTimers。SDK 第一个同步 script，firstFrameReady 早于真实 gameReady。存档全键同步，先 loadData 后 saveData，不依赖浏览器 localStorage/indexedDB。

```powershell
node tools/build-dominators-yt.cjs --zip
node tools/serve-https.cjs build/Dominators-yt 8009 --host 127.0.0.1
node tools/yt-suite.cjs run --url https://127.0.0.1:8009/ --name Dominators --headless
node tools/yt-suite.cjs pause-local --url https://127.0.0.1:8009/ --headless
node tools/verify-fb-second-yt.cjs Dominators
```

## 实测与限制

- 构建目录 24 文件，28.97 MiB；文件名、单文件、总包限制由构建器检查。
- pause-local 九项全 PASS，日志 tools/state/second-pause-Dominators.log；覆盖循环、画面、输入、音频、恢复、禁用可见性恢复、仅 SDK 恢复与暂停无新请求。
- 官方受限环境 localStorage/indexedDB 为 null；实际 SDK 读写、暂停提交、刷新读取已通过：2 个键，刷新读取 837 字节，激励拒奖 false / 授奖 true。报告 tools/state/second-acceptance/Dominators/report.json。
- 本地套件接口往返不等于正式账号跨设备认证；未逐一通关全部关卡、未做全部硬件与正式托管验收。sendScore 未自然触发，不伪造分数。
- 广告图 `marketing/Dominators/ad-540x756.png`，540×756，无文字/logo；参考图与设计说明见 marketing/README.md，广告图不装入游戏 ZIP。

## 贴图压缩与画面对比

默认构建使用 RGBA4444，保留尺寸、全部贴图和 mip 层，降低每通道颜色精度；不修改字体 Alpha8。依赖 UnityPy 1.25.4：

```powershell
python -m pip install UnityPy==1.25.4 --target tools/state/python-libs
node tools/build-dominators-yt.cjs --zip
```

构建器校验源指纹后从源生成。压缩缓存同时核对源数据、优化脚本配方和输出 SHA256；缓存失效时重新生成，不需要手动删除。最终文件为 build/Dominators-yt.zip。旧 tools/build-dominators-candidate.cjs 命令保留兼容，现也生成同一正式包。

[截图对比](../marketing/Dominators/texture-comparison.png)：左原版、右压缩版，均为真实触摸开局进入 Stage 1；随机场景道具位置差异不属于贴图变化。旧独立候选包保留用于历史对照，正式包以默认构建为准。

## 最终复核（2026-11-02）

默认正式构建 MUST 6/6、pause-local 九项全 PASS；真实输入/云档刷新/激励拒奖与授奖通过。初始下载 28.44 MiB、gameReady 4.127 秒、JS heap 301.58 MiB；刷新读取 837 字节。发布 ZIP 28.28 MiB，24 文件，根 index.html 与合法路径检查通过；重复构建所有文件 SHA256 一致。

报告：tools/state/reports/yt-suite-Dominators-final-2026-11-01T22-37-39.json（文件名为 UTC 时间），tools/state/dom-final-pause.log，tools/state/second-acceptance/Dominators/report.json。

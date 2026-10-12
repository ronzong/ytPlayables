# Planet Eater Evolution 接入说明

接入日期：2026-10-10（Asia/Shanghai）。源目录只读：`C:/Works/git/yxl/FBIGCrack/FBIGCrack/PlanetEaterEvolution/local-game`。
引擎 Unity 2021.3.14f1c1，原平台 Instgame。产物 `build/PlanetEaterEvolution-yt/`，提交包 `build/PlanetEaterEvolution-yt.zip`（根目录直接含 index.html），端口 8003。

## 改造与构建

- `tools/build-planet-eater-yt.cjs`：从源目录重新复制；排除 `.local-orig` 备份和本地模拟 SDK；入口第一个 script 为同步 YouTube SDK，第二个为平台运行时。保留源版本 viewport、方向、玩法、游戏内细分音频开关与禁止自动全屏的补丁。
- `platform/planet-eater-instgame-yt.js` + `platform/lib/yt-runtime.js` → `yt-bridge.js`：保持 instgame 初始化、广告 Promise、context 等调用面；横幅返回不可用，激励仅 SDK 返回 true 时 resolve，false/异常 reject；SDK 负责平台音频、暂停恢复与网络闸门。
- `Build/WebBuild.framework.js.unityweb`：唯一 IDBFS.syncfs 改走内存 FS 与 SDK 存档，真实 `/idbfs` 文件按 base64 保存在版本化云存档中；读取完成后才启动 Unity。源本来用 IndexedDB，Playables 中该接口为 null，不能原样保留。Unity 的裸定时器以及 Module 定时器均接暂停闸门，阻止 RAF 之外的托管回调、音频调度与渲染继续执行。重新 gzip 时保留 Unity 压缩标记头。
- `Build/WebBuild.wasm.br`：原 WASM 解压后只重新 Brotli 压缩，字节内容不改。由服务器返回 `Content-Encoding: br`、`Content-Type: application/wasm`。部署托管须保持这两个头；初始包达标依赖此压缩资源。
- 菜单就绪使用源版本 `HEAPU8[4274455] === 1`，构建前强制校验原 wasm SHA256 `7784176ff51bf8c30996ac4146c14f61fd0d3dc90c2d2bda6e703df4f9483956`。首个加载 UI 绘制后调用 firstFrameReady，正式菜单可操作才调用 gameReady。
- 分数来自真实 PlayerPrefs `game_save_data.mass`，取整后按更高质量上报；没有玩法存档时不会伪造初始分数。原游戏提交 PlayerPrefs 时同步全部文件；SDK 暂停时再次快照已提交的 PlayerPrefs 并强制上传，保留原游戏自身保存时机（Home 保存当前玩法）。
- 共用运行时补强：loadData 未成功不得 saveData；UTF-8 存档达到 3 MiB 拒绝上传；暂停输入阻断默认浏览器行为。代理端口按本机环境配置（2026-10-12 起统一使用 `YT_PROXY`，不内置端口）；Chrome profile 参数统一转绝对路径。

补丁均有匹配次数校验；原源版本变化会报错。重建天然幂等；压缩缓存位于忽略的 `tools/state/compression/`，首次 Brotli 压缩较慢。回滚方法是撤回构建脚本/平台层补丁后从只读源目录重新构建，禁止手工改 staging。

```powershell
node tools/build-planet-eater-yt.cjs --zip
node tools/serve-https.cjs build/PlanetEaterEvolution-yt 8003 --host 127.0.0.1
node tools/yt-suite.cjs run --url https://127.0.0.1:8003/ --name planet-final --headless --wait 40 --port 9244 --profile tools/state/profiles/planet-final
node tools/yt-suite.cjs pause-local --url https://127.0.0.1:8003/ --headless --port 9243 --profile tools/state/profiles/planet-pause3
node tools/verify-planet-eater-yt.cjs
node tools/stop-https.cjs 8003
```

## 验证结果

- 官方 Test Suite MUST **6/6 PASS**：SDK 顺序、初始包、firstFrameReady 顺序、gameReady、云存档、JS heap。最新预检报告 `tools/state/reports/yt-suite-planet-final-2026-10-10T09-41-01.json`，同名日志与截图。
- 初始包 **28.79 MiB**；总目录约 **30.86 MiB / 14 文件**，其中约 1.99 MiB 调试符号非初始加载。单文件最大约 22.56 MiB；无非法文件名、嵌套 ZIP 或源备份。
- 启动到 gameReady：官方无头测得 **6.881 / 7.467 秒**；推荐 5 秒指标 WARN，保留真实菜单门控，不提前虚报就绪。JS heap 实测约 **67.57 MiB**。
- pause-local **9/9 PASS**：循环、截图、输入、音频冻结；恢复循环/输入；不经 visibility；只有 SDK 恢复；暂停扣住 XHR、恢复才发送。修复前 Unity 定时器让画面变化，修复后截图完全一致，帧数 `978 → 978 → 1458`。
- 官方套件环境 `IN_PLAYABLES_ENV=true`、localStorage/indexedDB 均为 null。真实 Start Game → Zen 开局 → 游戏内暂停 → 音乐关闭 → Home → 官方刷新；`game_save_data` 的天体类型、mass、talentIDs、modelPrefabPath 完整恢复，非空 PlayerPrefs 云档仅约 1 KiB。
- 官方激励测试：Close without Reward → 原接口 reject；Grant Reward → 原接口 resolve。没有本地广告模拟或提前发奖。
- 官方平台 Audio 切到静音后主 Gain 为 `[0]`、silenced=true；套件 Pause 按钮在实际玩法中冻结帧数 `1744 → 1744`。刷新后 SHOULD 的整数 sendScore 已 PASS（真实存档 mass=3），启动耗时仍为 WARN。
- 两次重建所有产物 SHA256 完全一致；gzip framework 语法检查、Brotli 解码 WASM 编译通过；ZIP 根入口、14 个条目及标准 `/` 路径校验通过。
- 验收报告/逐步截图：`tools/state/planet-acceptance/report.json`、`menu/start/zen/pause-menu/music-off/home/restored.png`。测试不使用用户日常 Chrome，清档仅作用于该工具专用套件测试存档。

## 已知诊断与范围

Unity 原构建的 ASTC 软件解码提示、Resources 语言提示、菜单场景 `PlayerSafety` 重试、场景切换瞬态空引用已在源游戏说明中登记；保留原行为，不能用删功能掩盖。新版游戏 iframe 验收无网络异常/404。官方套件外壳自身统计与 RPC 的代理错误属于 Google 文档页，不是游戏外部请求。
本次覆盖冷启动、主菜单、开局、保存刷新、平台生命周期和广告桥；未完成所有天体、长时间完整通关及移动真机压力测试。发布后还需在实际托管地址复跑套件，特别确认 Brotli 响应头。

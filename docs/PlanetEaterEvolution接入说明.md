# Planet Eater Evolution 接入说明

接入日期：2026-10-10（Asia/Shanghai）。源目录只读：`C:/Works/git/yxl/FBIGCrack/FBIGCrack/PlanetEaterEvolution/local-game`。
引擎 Unity 2021.3.14f1c1，原平台 Instgame。产物 `build/PlanetEaterEvolution-yt/`，提交包 `build/PlanetEaterEvolution-yt.zip`（根目录直接含 index.html），端口 8003。

## 改造与构建

- `tools/build-planet-eater-yt.cjs`：从源目录重新复制；排除 `.local-orig` 备份和本地模拟 SDK；入口第一个 script 为同步 YouTube SDK，第二个为平台运行时。保留源版本 viewport、方向、玩法、游戏内细分音频开关与禁止自动全屏的补丁。
- `platform/planet-eater-instgame-yt.js` + `platform/lib/yt-runtime.js` → `yt-bridge.js`：保持 instgame 初始化、广告 Promise、context 等调用面；横幅返回不可用，激励仅 SDK 返回 true 时 resolve，false/异常 reject；SDK 负责平台音频、暂停恢复与网络闸门。
- `Build/WebBuild.framework.js.unityweb`：唯一 IDBFS.syncfs 改走内存 FS 与 SDK 存档，真实 `/idbfs` 文件按 base64 保存在版本化云存档中；读取完成后才启动 Unity。源本来用 IndexedDB，Playables 中该接口为 null，不能原样保留。Unity 的裸定时器以及 Module 定时器均接暂停闸门，阻止 RAF 之外的托管回调、音频调度与渲染继续执行。重新 gzip 时保留 Unity 压缩标记头。
- `Build/WebBuild.wasm.brotli`：原 WASM 解压后只重新 Brotli 压缩，字节内容不改。由包内 Google 开源解码器还原，loader 对 codeUrl 做一次格式识别/解码；不依赖托管压缩响应头。旧 `.wasm.br` 原生解码方案因正式托管未设置 Content-Encoding 而废弃，见下方修复记录。
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
本次覆盖冷启动、主菜单、开局、保存刷新、平台生命周期和广告桥；未完成所有天体、长时间完整通关及移动真机压力测试。发布后仍需在实际托管地址复测。

## 2026-10-12：固定 9:16 画布与无滚动布局

按用户要求固定 Unity 逻辑画布为 **540×960**，`matchWebGLToCanvasSize=false`。新增 `platform/planet-eater-layout.css`，由构建脚本复制到 `TemplateData/yt-layout.css` 并插入入口引用；游戏区域取窗口可容纳的最大 9:16 矩形，居中等比缩放，横屏/宽屏留边。使用动态视口高度适配移动浏览器工具栏，html/body 禁止溢出，canvas 为 block 并禁用触摸滚屏，去掉原 inline canvas 基线产生的竖向滚动条。原方向、玩法和引擎主体不改。

离线独立 Chrome 验证 **390×844、844×390、1920×1080、1280×720、320×568** 五种窗口；每次均检查逻辑画布 540×960、CSS 比例 9:16、边界完全位于视口、html/body 无滚动溢出。已实际触摸开局、玩法中旋转到横屏、点击暂停按钮；暂停菜单的 Continue/Restart/Home 完整可见。截图及尺寸报告位于 `tools/state/planet-layout/`。本次没有重跑在线官方套件；前述 SDK 合规数据为之前的验证结果，移动真机浏览器工具栏仍需人工验收。

官方验收脚本坐标同步改按 540×960 换算，包含画布居中偏移。已重新构建目录和 ZIP，当前 **15 文件**（新增布局 CSS），总包仍约 **30.86 MiB**。

## 2026-10-12：正式环境 WASM 压缩解码修复

用户提供的正式日志中，SDK、firstFrameReady 已正常运行，随后报 `WebAssembly.instantiate(): expected magic word 00 61 73 6d, found cb ff ff 3f`。`cb ff ff 3f` 与本包 Brotli 压缩 WASM 的文件头一致，说明 Unity 实际收到未解压的压缩数据。此前本地服务器自动返回 `Content-Encoding: br`，掩盖了上传包对响应头的依赖。

废弃依赖服务器解压的 `.wasm.br` 方案，改名 `.wasm.brotli`，保留压缩体积并使用随包的 `Build/brotli-decode.js`。源码来自 [Google Brotli js/decode.js](https://github.com/google/brotli/blob/master/js/decode.js)，MIT 许可证随包保留为 `Build/brotli-LICENSE.txt`。唯一源码改动是将 ES module 导出替换为浏览器全局 `window.__ytBrotliDecode`；对应平台源文件 SHA256 `1e7a616a5dbab20e88ef9f5dda32eac4255e19dc16b521c49a9c0e58dab0a3df`。它是离线压缩库，不是广告/统计 SDK，不产生网络请求。

构建对 loader 的资源读取 Promise 做一次精确匹配：只处理 codeUrl。已是 WASM 的数据直接使用；未解压的数据调用包内解码器并验证 WASM magic。data/framework/symbols 继续使用 Unity 原有 gzip 客户端解压。源游戏及 WASM 解压字节未变。入口异常分支用 console.error 和页面错误横幅替代正式沙箱不允许的 alert，避免失败后无提示。

验证：本地 `.wasm.brotli` 响应为 `application/octet-stream`，**无 Content-Encoding**；独立 Chrome 冷启动、真实开局、横屏玩法与暂停菜单正常。解码器输出 28,829,868 字节，与 Node 标准 Brotli 解码和源 gzip 解压后的 WASM 完全一致。官方预检 **MUST 6/6 PASS**，初始包 **28.86 MiB**、JS heap **68.18 MiB**；启动 **7.726 秒**，5 秒推荐项仍 WARN。报告 `tools/state/reports/yt-suite-planet-hosting-fix-2026-10-12T07-59-04.json`。

最新包 **17 文件 / 31.07 MiB**，替换发布包仍为 `build/PlanetEaterEvolution-yt.zip`。此次没有更新远端正式版本，需用户上传新 ZIP 后确认线上启动。
最新官方验收报告 `tools/state/planet-acceptance/report.json`：真实开局、刷新后 mass/天体/模型恢复一致，官方暂停帧数 `1748 → 1748`，平台静音主 Gain 为零，激励拒奖/给奖正确，整数 sendScore PASS。

## 2026-10-12：云存档专项检查与目录兼容修复

检查确认当前链路为 **Unity PlayerPrefs → 内存 FS → ytgame.game.saveData**，启动先 **loadData → 恢复 FS → Unity 读取 PlayerPrefs**。正式环境没有使用 localStorage 或 IndexedDB 作为持久化后端；直接本地页面不代表平台云存档成功。

发现此前快照保留 `/idbfs/<URL-MD5>/PlayerPrefs`，同地址刷新可恢复，但换发布地址/版本时 Unity 会读另一个目录。依据 [Unity persistentDataPath 说明](https://docs.unity3d.com/cn/2022.3/ScriptReference/Application-persistentDataPath.html)，已在首次 FS 读写之前将这些目录统一映射到 `/idbfs/planet-eater/`，并兼容旧哈希目录云档。没有改 WASM 玩法逻辑。Unity 提交 PlayerPrefs 后立即上传发生变化的快照，不再仅依赖通用 4 秒节流。

增加 SDK 读写结果诊断：成功读档的字节数、成功/失败上传次数和最近上传字节数，可通过 `window.__ytPlayables.save.status()` 查看；控制台会打印 `SDK 云存档读取成功` / `SDK 云存档写入成功` 或具体失败。不打印原始存档内容。

官方套件专项测试没有手工 flush，Home 后直接调用 SDK loadData，读回内容与游戏内存中真实 `game_save_data` 一致。环境 localStorage/indexedDB=null、IN_PLAYABLES_ENV=true。将真实 SDK 存档的路径改为不同网址的 MD5 目录后，经 SDK 保存和刷新恢复，再点击继续游戏，天体/质量/模型一致；SDK 读取 **817 字节**、上传 **797 字节**，**4 次成功 / 0 次失败**。报告 `tools/state/planet-acceptance/migration-report.json`，截图 `continued-from-cloud.png`。

补充日志的 ASTC 为纹理解码降级；NullReferenceException 紧随场景完成回调的情况也存在于只读源版本。`存档已删除（PlayerPrefs）` 出现在新游戏分支；此次云档继续游戏路径没有该删除日志，且仍保留 game_save_data。没有为了掩盖日志禁止正常新游戏清档。

**验证边界**：关闭整个 Chrome 后新打开套件的恢复测试未成功，不能宣称已验证正式账号云端持久化。套件 SDK 往返测试是模拟平台接口，正式同账号跨设备/冷重开仍需上传本版 ZIP 后实测。原游戏局内 checkpoint 主要在暂停菜单 **Home** 时提交；SDK 暂停会上传已经提交到 PlayerPrefs 的状态，不能保证未提交的最新局内变化都被保存。没有修改玩法存档时机来虚报“全程自动保存”。

```powershell
node tools/verify-planet-eater-yt.cjs
node tools/verify-planet-eater-yt.cjs --migrate-only  # 用上一轮真实存档检验不同目录迁移
node tools/verify-planet-eater-yt.cjs --resume-only   # 冷打开检查；套件返回空档则明确 UNVERIFIED
```

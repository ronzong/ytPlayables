# ytPlayables：本地 H5 游戏 → YouTube Playables 构建约定

本文件是本目录的通用工作约定。**用户给的指令优先于本文档**；本文档只记录跨游戏复用的规则、流程、
工具入口和排障结论。单个游戏的来源、改造点、验证结果放在 `docs/<游戏>接入说明.md`（并在 README 登记）。

## 0. 本目录做什么

核心需求：**把"本地可运行的 H5 游戏"构建成"YouTube Playables（油管小游戏）版本"**，
跑通官方测试套件预检，达到认证要求（SDK 接入 / 暂停恢复 / 存档 / 音频 / 打包体积与命名），最终能提审。

- 游戏来源：主要来自 `D:\works\Git\yxl\gamePopStar\<游戏>\local-game`（**只读引用，不在本目录改动那个仓库**）。
- 具体做哪个游戏、什么时候做，由用户逐个下指令；**没有指令不要主动批量接入**。
- 产物一律落在本目录（`build/<游戏>-yt/`、`docs/`、`tools/`），不回写源仓库。

## 1. 工作前必读

| 文件 | 内容 |
| --- | --- |
| `需求说明.txt` | 用户最初的需求描述 |
| `README.md` | 目录说明 + 快速开始 |
| `docs/SDK必接与推荐清单.md` | 认证要求（必接/推荐、打包指标、容易踩雷的规定）的通俗版 |
| `docs/本地HTTPS测试流程.md` | https 服务、官方测试套件、自动化脚本用法 |
| `docs/<游戏>接入说明.md` | 单游戏的来源、改造点、验证结果、待办 |
| `.docs/` | 抓取下来的官方文档原文（gitignore，可用 `tools/fetch-docs.cjs` 重抓） |

## 2. 目录职责

| 路径 | 用途 |
| --- | --- |
| `YoutubeMgr.js` | 通用 SDK 管理类（Cocos 2.x）：必接能力 + 激励/插屏广告 + 暂停闸门 |
| `platform/` | 各游戏的平台 SDK 适配层（构建时替换游戏自己的 `sdk.js`）；`*-stub.js` 只用于诊断 |
| `tools/` | https 服务、测试套件驱动、构建脚本、证书、排错工具 |
| `tools/lib/` | CDP（Chrome DevTools Protocol）与 Chrome 生命周期封装，无 npm 依赖 |
| `nonogram/` | 打包好的参考游戏，用作测试套件基线 |
| `build/`、`tools/state/`、`.docs/`、`tools/certs/` | 构建产物 / 报告与浏览器 profile / 文档缓存 / 自签证书，**都不入库** |

### 2.1 构建产物的入库规则

- **跟踪**：`build/<游戏>-yt/`（油管小游戏版本，最终要提审的那份，同步进 git）。
- **不跟踪**：`build/` 下其它一切（`build/*.zip`、`build/<游戏>-yt-build.json`、`build/_scratch/`），
  以及 `build/<游戏>-yt/*.zip`（打包产物可随时用 `--zip` 重新生成）。
- **诊断用/普通 h5 构建不要留在本目录**：输出到系统临时目录，用完可整目录删除，例如
  `node tools/build-antflow-yt.cjs --out "%TEMP%\yt-diag\AntFlow-stub" --sdk platform/antflow-yt-stub.js`
  （zsh/PowerShell 下用 `$env:TEMP\yt-diag\...`）。
- 游戏目录里的 zip 不要互相嵌套打包；发布包放 `build/` 根目录，且**包内根目录必须有 `index.html`**。

### 2.2 本地启动与端口登记

- 每个游戏一个固定端口，登记在 `tools/gen-start-bats.cjs` 的表里（**本目录唯一来源**），
  改端口要同步重建 bat 并更新 README 的端口表。
- 每个游戏一个 `start-<游戏>.bat`（根目录，CRLF、UTF-8、无多行括号块），双击即起 https 服务；
  文件由 `node tools/gen-start-bats.cjs` 生成，**不要手工编辑**。
- 关闭服务：服务窗口 Ctrl+C，或 `node tools/stop-https.cjs <端口>`（默认只结束 node 进程）；
  `node tools/stop-https.cjs --list` 可查看各端口占用。
- 目前登记：`nonogram = 8000`、`AntFlow-yt = 8001`。

## 3. 单个游戏的构建流水线

1. **确认源游戏可本地运行**：能起静态服务、能玩一局、运行期无外部请求（有外链要先处理）。
2. **写/复用构建脚本** `tools/build-<游戏>-yt.cjs`，从 `gamePopStar/<游戏>/local-game` 复制到
   `build/<游戏>-yt/`，只改**入口页**、**SDK 适配层**和**必要的合规补丁**：
   - 入口页：`https://www.youtube.com/game_api/v1` 必须是**文档里第一个 `<script>`**，且不带 `async`/`defer`；
     删掉原平台会拦掉 YouTube 的 CSP meta 与平台外链。
   - 平台 SDK：把原 SDK（Yandex / GD / CrazyGames / Poki / GamePush …）替换为
     `platform/<游戏>-*-yt-bridge.js`，**保持原 SDK 的调用面不变**，内部改走 `ytgame`。
   - 合规修补：文件名非法字符、页面里 Page Visibility 类暂停通路、已知会导致卡死/崩溃的引擎缺陷。
3. **每一步都要"匹配次数校验 + 幂等 + 可重复执行"**：源文件变了就报错退出，不能静默成功。
4. 起 https：`node tools/serve-https.cjs build/<游戏>-yt <端口>`（首次先 `node tools/gen-certs.cjs`）。
5. 预检：`node tools/yt-suite.cjs run --url https://localhost:<端口>/ --name <游戏>`。
6. 暂停合规：`node tools/yt-suite.cjs pause-local --url ...`（离线），有网时再跑 `pause`（官方套件按钮）。
7. 收尾：截图/报告存档、更新 `docs/<游戏>接入说明.md` 与 README、关掉不再需要的服务与浏览器。

## 4. 硬性要求（不满足就是没做完）

### 4.1 SDK 接入

- SDK 必须是第一个 script，且 `firstFrameReady()` 早于 `gameReady()`；加载界面还在时不得调 `gameReady()`。
- 必接：`firstFrameReady` / `gameReady` / `IN_PLAYABLES_ENV` / `isAudioEnabled` + `onAudioEnabledChange` /
  `onPause` + `onResume` / `loadData` + `saveData`。
- 推荐：`getLanguage` / `sendScore`（必须整数）/ `openYTContent` / `health.logError|logWarning` /
  `ads.requestInterstitialAd` / `ads.requestRewardedAd`（只有 resolve(true) 才发奖）。

### 4.2 暂停 / 恢复（认证三条）

1. `onPause` 后必须停掉**一切执行**：游戏循环、渲染、音乐、互动、网络调用；
   且**只能**由 `onResume` 恢复。
2. **不得使用 Page Visibility API 或类似 Web API 暂停/恢复**，只能用 SDK 的 `onPause`/`onResume`。
   注意 Cocos 引擎自己就会监听 `visibilitychange`/`pagehide` → `pauseByEngine()/resumeByEngine()`，
   必须在页面层（引擎加载前）把这类事件注册拦掉，并把 `document.hidden`/`visibilityState` 固定为可见。
3. 应该在 `onPause` 时保存用户进度。

实现与验证方法见 `docs/AntFlow接入说明.md` 2.5 节；`tools/yt-suite.cjs pause-local` 的 9 条判据必须全 PASS。

### 4.3 存档

- 只能走 `ytgame.game.loadData/saveData`；**先 loadData 成功才允许 saveData**，单次 < 3 MiB。
- Playables 环境里 `localStorage`/`indexedDB`/`cookie` 都是 `null`，不能依赖。
- 要能读旧版本存档不崩；`isAuthorized` 这类原平台概念要按 YouTube 语义改写（例如恒为已授权，否则会退回 localStorage）。

### 4.4 音频

- 平台静音时不得有任何声音；游戏内只允许音乐/音效等细分开关，不要给"总静音"按钮。
- 建议做法：页面级主音量 GainNode + 媒体元素 muted，外加游戏自身音频模块的暂停/恢复。

### 4.5 打包与命名

- 初始包 < 30 MiB（建议 < 15 MiB）、总包 < 250 MiB、单文件 < 30 MiB、文件数 ≤ 8000、云存档 < 3 MiB。
- **文件名只允许字母数字和 `_ - .`**：Cocos 构建产物的 `<uuid>@<subId>.json` 必须重命名并同步改引用
  （同时给引擎的 uuid 解析补分隔符），否则测试套件直接判 FAIL。
- 只用相对路径；不得向任何外部地址发请求（线上 CSP 只放行 `self` 与 `https://www.youtube.com/game_api/v1`）。
- 打包 zip 放在 `build/` 根目录，**不要放进 staging 目录内部**（下次重建会被删掉，还可能被算进包体）。

### 4.6 产品红线

不得接第三方广告/SDK/统计，不得收集个人信息或出现登录注册界面，必须是单页应用，
不得混淆代码（压缩体积可以）。

## 5. 本目录工具

| 工具 | 用途 |
| --- | --- |
| `tools/gen-certs.cjs` | 生成本地 https 自签证书（首次跑一次） |
| `tools/gen-start-bats.cjs` | 按端口登记表生成各游戏的 `start-<游戏>.bat`（`--list` 只看表） |
| `tools/stop-https.cjs <端口>` | 关闭该端口上的本地服务；`--list` 看占用（默认只结束 node 进程） |
| `tools/serve-https.cjs <目录> <端口>` | 本地 https 静态服务：自签证书、官方同款 CSP、gzip、404 日志（`--no-csp` 可关 CSP） |
| `tools/yt-suite.cjs run` | 跑官方测试套件预检，输出 MUST/SHOULD + 报告/截图/日志 |
| `tools/yt-suite.cjs pause` / `pause-local` | 暂停合规验证（官方套件按钮 / 离线直连同一条 SDK 路径） |
| `tools/yt-suite.cjs diag` / `direct` / `harness` / `targets` / `inspect` | 加载诊断：采样资源与日志、直接开页、本地 iframe/sandbox 对照、target 列表、DOM 结构 |
| `tools/yt-exceptions.cjs <url>` | 捕获被吞掉的异常（排查静默卡死/某段逻辑没生效） |
| `tools/yt-stack-probe.cjs --url <url>` | 抓「套件里游戏 iframe」的 JS 调用栈与暂停点源码（`Debugger.pause`，卡死定位神器） |
| `tools/lib/yt-runtime.js` | 各游戏共用的合规运行时（可见性屏蔽 / 暂停闸门 / 音频 / 输入 / 网络 / 外部请求拦截 / 内存存储 / 云存档 / 广告），新游戏优先复用它 |
| `tools/build-<游戏>-yt.cjs` | 各游戏的 staging 构建（含全部补丁，匹配校验、可重复执行） |
| `tools/fetch-docs.cjs`、`tools/html2txt.cjs` | 抓取/转换官方文档（需要代理） |
| `tools/lib/cdp.cjs`、`tools/lib/chrome.cjs` | CDP 与 Chrome 封装（含 flatten 子会话、代理、自签证书参数） |

## 6. 改动游戏代码的约定

- 优先改入口页与 SDK 适配层；**不改玩法、不删功能、不改屏幕方向**。
- 必须改压缩产物时：记录原因、位置、匹配条件与回滚方式；补丁幂等、构建从源目录重来；新增代码写中文注释。
- 不为了让测试通过而伪造行为（假 SDK 事件、假存档、假暂停）；检查不通过就查真因。
- 源仓库 `gamePopStar` 只读；本目录产物可重复生成，不手工改 staging 里的文件。

## 7. 交付前验证清单

- [ ] 官方测试套件：MUST 全 PASS（初始包 / SDK 顺序 / firstFrameReady 顺序 / gameReady / 云存档）
- [ ] SHOULD：`sendScore` 是整数；`gameReady` 尽量 ≤ 5 秒（本机无头环境偏慢时记录实测值与环境）
- [ ] 暂停 9 条判据全 PASS（循环冻结 / 画面不变 / 输入拦截 / 音频静音 / 恢复 / 输入恢复 /
      不用 visibility 通路 / 只能 onResume 恢复 / 暂停不发新请求）
- [ ] 存档：冷启动能读、暂停会写、跨刷新进度还在、< 3 MiB
- [ ] 音频：平台静音 → 无声；游戏内音乐/音效开关仍正常
- [ ] 能进主菜单并开一局；无未解释的 console error 与 404
- [ ] 交付说明写清：改了哪些文件、行为变化、验证命令与结果、未验证范围

## 8. 环境与已知坑

- **代理**：访问 Google/YouTube 必须走本机 Clash（默认 `127.0.0.1:7890`）；`tools/lib/chrome.cjs`
  启动 Chrome 时自动带该代理并让 localhost 直连。节点不可用时官方套件页打不开，
  用 `pause-local` / `direct` / `harness` 先做离线验证，并如实说明未做在线验证。
- **证书**：`tools/gen-certs.cjs` 生成；手动测试首次要在浏览器里点"高级 → 继续前往"。
- **端口**：一个游戏一个端口，新增游戏先挑空闲端口并登记到 README。
- **已知坑**（都在 AntFlow 上踩过，接新游戏先对照）：
  1. Cocos `<uuid>@<subId>.json` 文件名非法 → 重命名 + 改引用 + 引擎补分隔符；
  2. 引擎/游戏用 `visibilitychange` 暂停/恢复 → 页面层拦掉注册；
  3. 画布未布局时用 `window.screen` 算可见尺寸，导致背景网格循环爆炸卡死主线程 →
     给尺寸加上限（用 `Debugger.pause` 读调用栈定位）；
  4. Playables 里 `localStorage` 为 `null`，引擎与游戏都要有兜底；
  5. 无头 + 软件渲染 + 代理拉 SDK 会让"启动 5 秒"偏慢，记录实测值而不是直接判失败。
  6. **原平台的“本地后端替身”不能丢**：本地化版本常靠 mock 的 fetch/XHR 拦截伪造平台后端响应
     （WastelandSurvivor 的 IP 探测就是启动必需项）。只替换 SDK 而不复刻这层，游戏会在加载页静默卡住，
     且主线程只是“在等”——用 `tools/yt-stack-probe.cjs` 抓栈能确认；处理办法是在适配层里本地应答这些接口。
  7. **混淆的入口脚本里常藏外部接口**（门户壳 / 统计 / 后端）；接新游戏先扫一遍
     `https?://` 与 `\x` 转义字符串，运行时用外部请求闸门兜底，并在文档里记录残留风险。
- 测试完及时关掉本次创建的服务器/浏览器/标签页；留给用户验收的再保留并说明。

## 9. 记忆维护

- 单个游戏的细节（来源、改造点、广告位、验证数据、待办）→ `docs/<游戏>接入说明.md`，并在 README 登记。
- 跨游戏复用的规律、约定、工具入口 → 本文件；新工具同时更新第 5 节表格。
- 废弃方案写明原因与替代做法，不要用旧结论覆盖最新结论。

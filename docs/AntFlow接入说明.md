# AntFlow YouTube Playables 接入说明

## 1. 基本信息

| 项目 | 内容 |
| --- | --- |
| 游戏 | `D:\works\Git\yxl\gamePopStar\AntFlow\local-game`（Yandex Games 本地单机版，2200 文件 / 15.4 MiB） |
| 引擎 | Cocos Creator 3.8.7（SystemJS + import-map 构建产物，设计分辨率 750x1334 竖版） |
| 原平台 SDK | Yandex Games SDK（`YaGames`），本地版由 `local-game/sdk.js` 兼容层替代 |
| 本仓库产物 | `build/AntFlow-yt/`（staging，可重复构建，不入库） |
| 构建命令 | `node tools/build-antflow-yt.cjs`（可选 `--zip` 打包、`--out <目录>` 换输出、`--sdk <文件>` 换适配层） |
| 本地地址 | `node tools/serve-https.cjs build/AntFlow-yt 8001` → <https://localhost:8001/> |
| 预检 | `node tools/yt-suite.cjs run --url https://localhost:8001/ --name antflow` |

**游戏本体（`src/`、`assets/`、`cocos-js/`）只打了 3 处最小补丁，全部由构建脚本自动完成、
带匹配次数校验、可重复执行；`local-game/` 保持原样不动。**

## 2. 改造点（全部在 staging 里完成）

### 2.1 `index.html`

1. **SDK 置顶**：`<script src="https://www.youtube.com/game_api/v1"></script>` 变成文档里第一个
   `<script>`，且不带 `async`/`defer`。测试套件的 “SDK loaded before any game code” 就是按这个判定的。
2. **删掉 Yandex 的 CSP meta**：原 meta 的 `script-src` 白名单里没有 `youtube.com`，
   会把 Playables SDK 直接拦掉。本地测试时由 `tools/serve-https.cjs` 注入官方同款 CSP。
3. `./sdk.js` 的 `data-yandex-games-sdk` 标签保持不变（游戏代码会检查它），只是内容换成了适配层。

### 2.2 `sdk.js`：Yandex → YouTube 适配层

源文件 [`platform/antflow-yandex-yt-bridge.js`](../platform/antflow-yandex-yt-bridge.js)。
游戏调用 `YaGames` 的方式一行没改，适配层内部改走 `ytgame`：

| 游戏侧（YaGames） | 适配层内部（ytgame） |
| --- | --- |
| `features.LoadingAPI.ready()` | `ytgame.game.gameReady()`（并强制落盘一次云存档） |
| `environment.i18n.lang` | `ytgame.system.getLanguage()`（取主语言子标签） |
| `adv.showRewardedVideo({callbacks})` | `ytgame.ads.requestRewardedAd('antflow-revive-reward')`，只有 `true` 才回调 `onRewarded` |
| `adv.showFullscreenAdv({callbacks})` | `ytgame.ads.requestInterstitialAd()` |
| `getPlayer().getData/setData` | `ytgame.game.loadData()/saveData()`（内存合并后整块写入） |
| `on('game_api_pause'/'game_api_resume')` | `ytgame.system.onPause()/onResume()`（暂停时先存档） |
| `leaderboards.setScore` | `ytgame.engagement.sendScore({ value })`（取整） |
| 静音开关 | `ytgame.system.isAudioEnabled()` / `onAudioEnabledChange()` → 页面级主音量钳制 |

另外：

- **`firstFrameReady()`** 在适配层初始化时就调用（早于 `gameReady`）。
- **`isAuthorized()` 恒为 `true`**：YouTube 没有“未授权玩家”，所有玩家都能用云存档；
  返回 `false` 会把游戏推回 `localStorage`，而 Playables 环境里 `localStorage` 是 `null`。
- **存档串行化**：先 `loadData()` 成功才允许 `saveData()`（认证要求）。
- **音频钳制**：拦截 `AudioContext.destination`，所有 WebAudio 输出先过一个主 GainNode；
  `<audio>/<video>` 在 `play()` 时同步 `muted`。只影响 YouTube 侧静音，游戏自身音量设置不受影响。
- **完整暂停闸门**（见 2.5）。
- 诊断开关（URL hash）：`#ytdebug` 打心跳、`#ytnoaudio` 关音频钩子、
  `#ytnoleader` 不提供排行榜、`#ytnosave` 不写云存档。正式包不会用到。

### 2.5 暂停：让 `onPause` 真的停住一切

游戏原本的暂停只做了 `pauseRuntimeAudio("yandex-pause")`——**只停了音频**：
主循环还在跑、画面还在渲染、点击照样能进，达不到审核要求的
“stops all execution, including gameplay, music, interactions, network calls, and rendering”。

适配层在 SDK 回调层补上了「暂停闸门」，一次性覆盖四件事：

| 要求 | 做法 |
| --- | --- |
| 停止 gameplay / rendering | 闸住 `requestAnimationFrame`：暂停期间引擎的帧回调只入队不执行 → Cocos 主循环（update / schedule / 渲染）整体冻结；恢复时把排队的回调交还给真正的 rAF |
| 停止 interactions | 在 `window` 与 `document` 的**捕获阶段**拦下 pointer / mouse / touch / wheel / key 事件并 `stopImmediatePropagation()`，游戏收不到任何输入（不 `preventDefault`，避免影响平台自身交互） |
| 停止 music | 双保险：① 照旧派发 `game_api_pause`，游戏自己的 `pauseRuntimeAudio` 会停 BGM 与所有音效；② 适配层主音量 GainNode 置 0、`<audio>/<video>` 全部 `muted` |
| 停止 network calls | 适配层加了网络闸门：暂停期间新发起的 `XMLHttpRequest` / `fetch` 一律扣住不发出，`onResume` 后再真正发送（在途请求无法撤回，但不会有新的调用） |
| **只能用 SDK 事件** | 页面层屏蔽 `visibilitychange` / `pagehide` / `pageshow` / `blur` / `focus` 的事件注册（实测拦掉 12 次），并把 `document.hidden`、`document.visibilityState` 固定为“可见” |

暂停时还会按认证要求**落一次云存档**（`save.flushNow()`），恢复时先通知游戏再放开闸门，避免恢复瞬间丢帧。

> 为什么要屏蔽 Page Visibility：Cocos 引擎自己会监听 `visibilitychange`/`pagehide` → `emit('hide'/'show')`
> → `Game._onHide/_onShow` → `pauseByEngine()` / `resumeByEngine()`；游戏代码也监听
> `visibilitychange`/`blur`/`focus` 停音频。这属于“用 Page Visibility API 或类似 Web API 暂停/恢复”，
> 而且会在 `onResume` 之外恢复执行，直接违反认证要求，因此必须在页面层切断。

验证方式（不需要访问 Google，可离线复跑）：

```powershell
node tools/yt-suite.cjs pause-local --url https://localhost:8001/ --headless
```

实测结果（2026-10-05）：

```
PASS  暂停期间游戏循环冻结（帧数 821 -> 821）
PASS  暂停期间画面不再变化（前后两张截图逐字节一致）
PASS  暂停期间游戏收不到输入（探针 1 -> 1）
PASS  暂停期间音频静音（主音量 [0]）
PASS  恢复后游戏循环继续（帧数 821 -> 1031）
PASS  恢复后输入恢复（探针 1 -> 2）
PASS  不使用 Page Visibility 类 API 暂停/恢复（屏蔽注册 12 次）
PASS  暂停后只能由 onResume 恢复（focus/visibility 无效）
PASS  暂停期间不发起网络请求（XHR done 0 -> 1）
```

对应的游戏日志（`#ytdebug`）：

```
[antflow-yt] 收到 onPause（YouTube 暂停）
[antflow-yt] 已暂停（冻结游戏循环/渲染/输入/音频） 原因: ytgame.onPause
[antflow-yt] heartbeat frames=392 (+0) [已暂停]
[antflow-yt] 收到 onResume（YouTube 恢复）
[antflow-yt] 已恢复 原因: ytgame.onResume
```

在线版验证（官方套件的 Pause 按钮）：

```powershell
node tools/yt-suite.cjs pause --url https://localhost:8001/ --headless
```

脚本会自动点套件的 `Pause` 按钮两次（暂停 / 恢复），并用同一套帧数判据给出 PASS/FAIL。
> 该命令需要能访问 developers.google.com（本机经 Clash 代理）；代理不可用时用上面的 `pause-local`。

**已知边界**：暂停期间如果有资源加载在途，其回调仍会执行（浏览器层面无法冻结），
但音频已被钳制、主循环冻结，所以画面与声音不会有任何变化，重新开始后也不会跳帧。

### 2.3 资源文件名去掉非法字符 `@`

Cocos 构建产物里子资源叫 `<uuid>@<subId>.json`，而 YouTube 要求文件名只能是
字母数字加 `_ - .`，测试套件会直接判 FAIL。构建脚本做了三件事：

1. 把 63 个带 `@` 的文件重命名为 `_`（例如 `xxx@f9941.json` → `xxx_f9941.json`）；
2. 同步改写 88 个 json 里 735 处 `<22位压缩uuid>@<subId>` 引用；
3. 给引擎 `cocos-js/_virtual_cc-*.js` 打两个小补丁：`decodeUuid` 的分割符、uuid 正则的字符类都接受 `_`。

### 2.4 修 `AntCubeBgPattern` 背景网格的“爆炸性循环”（关键）

```js
// assets/main/index.js 里的 updateSize()
u = Math.max(innerWidth, visualViewport.width, screen.width, screen.availWidth);
p = Math.max(innerHeight, visualViewport.height, screen.height, screen.availHeight);
i = Math.max(i, u * e.width / t.width);   // e=可见尺寸, t=帧尺寸
n = Math.max(n, p * e.height / t.height);
```

当画布还没完成布局（帧尺寸退化成 1x1）时，`screen` 尺寸会被乘进去，算出
**1,067,200 x 800,400** 的“可见区”，紧接着 `rebuildPattern()` 就要按
`ceil(宽度/格宽)+2` 循环创建节点：**6476 x 4859 ≈ 3100 万次**，
每个节点还要 `addComponent` + `setParent` + 参与渲染数据构建 —— 主线程从此卡死，
`gameReady` 永远不会到来。

在官方测试套件里这条必现（套件的 iframe 初始尺寸/时机与普通页面不同），
真实平台上只要 iframe 尺寸异常也会触发。补丁只加了一个上限钳制：

```js
i=Math.max(i,u*e.width/t.width),n=Math.max(n,p*e.height/t.height),i=Math.min(i,4000),n=Math.min(n,4000)
```

正常分辨率（可见区 ~1000x1334）行为不变；极端情况下网格从 6476x4859 降到 33x33。

> 定位方法记录：`node tools/yt-suite.cjs diag` 看到心跳停在启动 4 秒后、
> 再用 `Debugger.pause` 暂停被卡住的主线程读调用栈和局部变量，才拿到上面这组数字。

## 3. 验证结果（2026-10-04，本机）

`node tools/yt-suite.cjs run --url https://localhost:8001/ --name antflow`（官方 Test Suite 预检）：

| 检查 | 结果 |
| --- | --- |
| MUST `SDK loaded before any game code` | PASS |
| MUST `Initial bundle < 30 MiB` | PASS（gzip 后传输 3.07 MiB；未压缩 7.08 MiB） |
| MUST `firstFrameReady called before gameReady` | PASS |
| MUST `gameReady called` | PASS |
| MUST `Cloud save data < 3 MiB` | PASS（存档 253 B） |
| SHOULD `sendScore called with an integer` | PASS（上报 0） |
| SHOULD `gameReady called within 5 seconds` | WARN（本机 8.2~11.2 秒，见下） |
| 游戏内表现 | `[MapManager] load level 1/2 ... preload level 2 config done.`，进入关卡 |
| JS 堆 | 68 → 109 MiB（限 512 MiB） |

参考游戏 nonogram 同样跑通：MUST 5/5 PASS。

**2026-10-06 回归**：共享运行时 `platform/lib/yt-runtime.js` 后来为 WastelandSurvivor 加了「离屏覆盖层中和 /
引擎输入坐标缓存刷新 / UI 诊断」（AntFlow 的横屏布局用不到，但同源）。对**现有产物** `build/AntFlow-yt/`
（内含改动前的 runtime 快照）复测
`node tools/yt-suite.cjs pause-local --url https://localhost:8001/ --headless` → **9/9 PASS**
（帧数 837→837 冻结、画面一致、输入探针 1→1、音频 [0]、恢复后 837→1059、屏蔽注册 12 次、暂停中 XHR 0→1）。
AntFlow 已跑过审核验收，本次**没有重打包**，所以两者的 runtime 快照暂时不同；
若要同步，跑一次 `node tools/build-antflow-yt.cjs` 即可（脚本幂等、从源目录重来）。

### 已知项 / 待办

1. **加载时间**：本机无头软件渲染 + 经代理拉取 SDK 的环境下 8~11 秒，超过 SHOULD 的 5 秒。
   代码体积本身没问题（初始包 3.07 MiB）。建议在真实 YouTube 托管/真机上复测；
   若要进一步压缩，可考虑拆分 `assets` 里未用到的 bundle、给图片做有损压缩。
2. **暂停/恢复**：已按认证要求实现完整冻结（见 2.5）并通过本地验证。
   游戏自身仍注册了 `visibilitychange` / `blur` / `focus`，但它们只影响音频，
   不再承担暂停职责；如果审核要求“不得出现这类监听”，可在页面层选择性屏蔽，属额外改动。
3. **广告实测**：适配层已按契约实现（激励只有 `resolve(true)` 才发奖）。
   套件里可以点 `Grant Reward` / `Close without Reward` 走一遍；真正“看完广告拿到奖励”的
   完整链路建议在提审前的开发者门户测试版本里再验一次。
4. **提交包**：`node tools/build-antflow-yt.cjs --zip` 会输出 zip；
   上传前建议用官方 “Playables 软件包分析器” 再核一遍文件数/单文件大小/文件名。

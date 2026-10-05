# YouTube Playables SDK：必接与推荐接入清单（通俗版）

> 依据：官方《使用入门》《SDK 参考》《认证 - 集成要求 / 稳定性要求》与
> `https://www.youtube.com/game_api/v1` 实际代码（SDK 版本 1.20260928.0100）。
> 抓取下来的原文放在 [`.docs/`](../.docs/)（`getting_started`、`sdk_reference`、`req_*` 等）。

## 0. 先记住一句话

**SDK 必须放在 `index.html` 里所有脚本的最前面，而且不能加 `async` / `defer`。**

```html
<head>
  <!-- 必须是文档里第一个 <script>，且不能带 async/defer -->
  <script src="https://www.youtube.com/game_api/v1"></script>
  <!-- 之后才是游戏自己的脚本 -->
  <script src="src/settings.js"></script>
</head>
```

为什么这么苛刻：官方测试套件的 “SDK loaded before any game code” 检查，就是直接看
**文档里第一个 `<script>` 标签**是不是 SDK。SDK 也只有先加载，才能把游戏沙箱化
（例如把 `localStorage`、`indexedDB`、`cookie` 都置为 `null`）。

> 本地直接开游戏页时 SDK 是“空操作”，不会报错；要验证集成必须用官方测试套件（见
> [本地 HTTPS 测试流程](本地HTTPS测试流程.md)）。

---

## 1. 必接（MUST，不接就过不了审 / 过不了预检）

| # | 接口 | 什么时候调用 | 要点 |
| --- | --- | --- | --- |
| 1 | SDK 脚本 | 页面加载时 | 必须是第一个 `<script>`，非 async/defer |
| 2 | `ytgame.game.firstFrameReady()` | 游戏画出第一帧（加载界面出现）时 | **必须早于 `gameReady`**；不调用平台不会显示游戏 |
| 3 | `ytgame.game.gameReady()` | 游戏真正可交互时（主菜单/可以开玩） | 加载界面还在转时**不能**调；调用后 YouTube 才摘掉转圈 |
| 4 | `ytgame.IN_PLAYABLES_ENV` | 初始化时判断环境 | `true` 表示真的在 Playables 里跑，用来决定走云存档还是本地存档 |
| 5 | `ytgame.system.isAudioEnabled()`<br>`ytgame.system.onAudioEnabledChange(cb)` | 初始化 + 平台静音变化时 | 用它们初始化并遵守 YouTube 的静音按钮；**不能自己再放一个总静音开关**（音乐/音效细分开关可以） |
| 6 | `ytgame.system.onPause(cb)`<br>`ytgame.system.onResume(cb)` | 初始化时注册 | 暂停必须**停掉一切执行**：gameplay、音乐、交互、网络调用、渲染；恢复只认 `onResume`；**不许用 Page Visibility API 自己判断**；暂停时建议存一次档 |
| 7 | `ytgame.game.loadData()`<br>`ytgame.game.saveData(str)` | 读档 / 存档 | 云存档是**一整块字符串**（自己定格式，比如 JSON）。**必须先 `loadData` 成功后才能 `saveData`**，否则请求被拒；单次存档 < 3 MiB；要能兼容旧版本存档 |

### 几条容易被忽略的硬性细节

- **存档**：不要在 Playables 环境里用 `localStorage` / `IndexedDB` / `cookie` —— 它们被 SDK 置成 `null`，写了会抛异常。
- **存档时机**：关键进度（升级、通关）要主动存；退出前的自动保存是尽力而为，最多 64 KiB。
- **暂停**：`onPause` 在“用户退出游戏”时也会触发，且不保证还会 `onResume`，所以暂停时该存就存。
- **暂停怎么才算“停掉一切”**：只停音频不够。审核用的说法是
  “Your game should now be paused. Is your game paused in a way that stops all execution,
  including gameplay, music, interactions, network calls, and rendering?”
  推荐做法（AntFlow 已实现，见 [AntFlow 接入说明](AntFlow接入说明.md#25-暂停让-onpause-真的停住一切)）：
  ① 闸住 `requestAnimationFrame`（引擎主循环 = update/schedule/渲染一起冻结）；
  ② 捕获阶段拦下指针/键盘等输入事件；
  ③ 停音频（游戏自身 BGM/音效 + 页面级主音量归零）；
  ④ 新发起的 `XMLHttpRequest`/`fetch` 扣住不发，`onResume` 后再发；
  ⑤ **切断 Page Visibility 类通路**（见下一条），保证只有 `onResume` 能恢复执行。
  注意：暂停期间已经在途的请求无法撤回，其回调仍可能执行，但不应产生任何可见/可听变化。
- **不许用 Page Visibility / blur / focus 管暂停**：除了“不得使用”，还有一个隐藏坑——
  Cocos 引擎自己监听 `visibilitychange`/`pagehide`（`sys` → `hide/show` → `Game._onHide/_onShow`
  → `pauseByEngine()/resumeByEngine()`），这会在 `onResume` 之外恢复执行。
  做法：在引擎/游戏代码加载**之前**拦掉 `visibilitychange` / `moz(ms|webkit)visibilitychange` /
  `qbrowserVisibilityChange` / `pagehide` / `pageshow` / `blur` / `focus` 的事件注册，
  并把 `document.hidden`、`document.visibilityState` 固定成“可见”。
  注意别拦元素级 `blur`（EditBox 输入框要用）。
- **音频**：YouTube 静音时不能有任何声音，且游戏内的音频控件不能反过来打开声音。

---

## 2. 推荐接（SHOULD / 推荐，接了体验和过审更顺）

| 接口 | 作用 | 要点 |
| --- | --- | --- |
| `ytgame.system.getLanguage()` | 拿用户语言（BCP-47，如 `zh-CN`） | 不要用 `navigator.language`，也不要把语言存进云存档 |
| `ytgame.engagement.sendScore({ value })` | 把最高分报给 YouTube 展示 | **必须是整数**（且 ≤ `Number.MAX_SAFE_INTEGER`）；游戏内的高分要和上报值一致 |
| `ytgame.engagement.openYTContent({ id })` | 打开 YouTube 视频 / 另一个 Playable | 视频 ID 是 11 位；Playable 要带 `contentType: PLAYABLE` |
| `ytgame.health.logError()`<br>`ytgame.health.logWarning()` | 把问题报给 YouTube | 有频控，别刷 |
| `ytgame.ads.requestInterstitialAd()` | 插屏广告 | 在自然停顿点（过关、结算后）调用；**不能用来发奖** |
| `ytgame.ads.requestRewardedAd(rewardId)` | 激励广告 | `rewardId` 是同一种奖励的固定 ID（不能含用户数据）；返回 `Promise<boolean>`，**只有 `true` 才发奖** |

### 关于广告的三条纪律

1. 只能用 YouTube 提供的广告接口，**不能接任何第三方广告**（认证 - 创收要求）。
2. 用了广告就必须继续正确响应 `isAudioEnabled` / `onAudioEnabledChange` 和 `onPause` / `onResume`。
3. 失败要有兜底：`requestRewardedAd` 抛错（无填充、接口不可用）时不要把玩家卡住，也不要发奖。

```js
// 插屏：不保证展示，不能用来发奖
try { await ytgame.ads.requestInterstitialAd(); } catch (e) { /* 兜底 */ }

// 激励：只有 resolved === true 才发奖
try {
  const earned = await ytgame.ads.requestRewardedAd('revive-by-ad');
  if (earned) grantReward();
} catch (e) { /* 失败兜底，不发奖 */ }
```

---

## 3. 打包与性能硬指标（认证 - 稳定性要求）

| 指标 | 必须 | 建议 |
| --- | --- | --- |
| 初始包（到 `gameReady` 为止下载的数据） | < 30 MiB | < 15 MiB |
| 总包 | < 250 MiB | 按需延迟加载 |
| 单个文件 | < 30 MiB | < 512 KiB |
| 云存档 | < 3 MiB | < 500 KiB |
| 启动到可交互 | — | ≤ 5 秒 |
| JS 堆峰值 | < 512 MB | — |
| 文件数 | ≤ 8000 | — |
| 文件名 | 只能是字母数字和 `_ - .` | 注意 Cocos 子资源名里的 `@`（见下） |
| 引用路径 | 只能用相对路径 | 绝对路径在平台上加载不到 |

> **Cocos 特别注意**：构建产物里子资源文件名形如 `<uuid>@<subId>.json`，
> 里面的 `@` 属于非法字符，测试套件会直接判 FAIL。AntFlow 的处理办法见
> [AntFlow 接入说明](AntFlow接入说明.md)（重命名 + 同步改引用 + 给引擎的 uuid 解析补分隔符）。

---

## 4. 其它“不做会踩雷”的规定

- 游戏不能向任何外部地址发请求（包括统计、CDN、第三方 SDK）；线上会下发 CSP：
  `connect-src 'self' blob: data:`，`script-src` 只额外放行 `https://www.youtube.com/game_api/v1`。
- 不能收集任何个人信息、不能出现登录/注册界面、不能显示二维码样式的内容。
- 必须是**单页应用**，不混淆代码（压缩体积可以）。
- `WebAssembly`、`eval()`、Web Worker 由平台自行决定是否接受，尽量少用。
- 代码里不要依赖 `localStorage` / `cookie` / `indexedDB`（Playables 环境里都是 `null`）。

---

## 5. 本文对应代码

- 通用管理类（Cocos 2.x）：[`YoutubeMgr.js`](../YoutubeMgr.js) —— 已包含上面全部必接能力，
  以及激励广告、`getLanguage`、`sendScore`、`openYTContent`、`health` 等推荐能力。
- AntFlow（Cocos 3.x）的等价适配层：[`platform/antflow-yandex-yt-bridge.js`](../platform/antflow-yandex-yt-bridge.js)。

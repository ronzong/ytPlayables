# Wasteland Survivor YouTube Playables 接入说明

## 1. 基本信息

| 项目 | 内容 |
| --- | --- |
| 游戏 | `D:\works\Git\yxl\gamePopStar\WastelandSurvivor\local-game`（PlayHop/Yandex 本地化版，1141 文件 / 28.9 MiB） |
| 引擎 | Cocos Creator **2.4.12**（`cc.ENGINE_VERSION`），设计分辨率竖版，`src/settings.js` 的 `_CCSettings` |
| 原平台 | 门户壳（Volan/Yandex 风格 `VolanSdk`）+ Facebook Instant Games 风格接口（`FBInstant.*`）+ 本地后端替身（`fb-mock.js`） |
| 本仓库产物 | `build/WastelandSurvivor-yt/`（1140 文件 / 28.81 MiB，已入库） |
| 构建命令 | `node tools/build-wasteland-yt.cjs`（`--out` 换目录、`--zip` 打包） |
| 本地地址 | `start-WastelandSurvivor-yt.bat` 或 `node tools/serve-https.cjs build/WastelandSurvivor-yt 8002` → <https://localhost:8002/> |
| 预检 | `node tools/yt-suite.cjs run --url https://localhost:8002/ --name wasteland` |
| 暂停合规 | `node tools/yt-suite.cjs pause-local --url https://localhost:8002/ --headless` |

## 2. 改造点

### 2.1 入口页 `index.html`

1. `https://www.youtube.com/game_api/v1` 放到文档**第一个 script**（不带 async/defer）；
2. 删掉 Volan/Yandex 的 CSP meta（它的 `script-src` 白名单不含 `youtube.com`，会把 SDK 拦掉）。

### 2.2 平台层替换（4 个文件）

`sdk.js` 由 **共享运行时 + 本游戏适配层** 拼接而成：

| 原文件 | 替换为 | 说明 |
| --- | --- | --- |
| `sdk.js` | `platform/lib/yt-runtime.js` + `platform/wasteland-volan-yt.js` | `VolanSdk` 接 ytgame；装上暂停闸门/可见性屏蔽/内存存储/外部请求闸门 |
| `fb-mock.js` | `platform/wasteland-fbinstant-yt.js` | FBInstant 兼容层：玩家数据→云存档；广告→ytgame；内购/社区/锦标赛按平台规则关闭；**并复刻原文件的本地后端替身** |
| `ad.js` | `platform/wasteland-ad-yt.js` | 去掉本地广告模拟（`ads=mock/instant` 那套），`showInterstitial/ShowRewarded` 直接接 ytgame |
| `remote-player-save.js` | `platform/wasteland-save-yt.js` | 云存档：白名单键快照 ↔ `ytgame.game.loadData/saveData`，节流 + 暂停/ready 时强制落盘 |

### 2.3 游戏本体只动两处最小补丁

1. `src/settings.js`：`jsList` 去掉第三方统计插件 `assets/scripts/plugins/gravityengine.mg.cocoscreator.min.js`
   （合规：不得使用平台外统计；该插件在浏览器分支本来就不初始化，但不应该留在启动列表里），并删除该插件文件。
2. `js/index.js`：2 处裸 `localStorage[...]` 改成 `window.__ytStorage[...]`
   （Playables 环境里 `window.localStorage` 是 `null` 且不可改写，见 2.5）。

### 2.4 `cc.sys.localStorage`：进度落盘的关键

游戏的进度读写全部走 `cc.sys.localStorage`（引擎的 `sys.localStorage`）。Playables 里
`window.localStorage` 被官方 SDK 置为 `null`（且 `configurable:false`，**无法重新赋值**），
引擎启动时会退回一个空实现（写什么都不落盘）。

处理：runtime 提供内存存储 `window.__ytStorage`，并在 `cc.sys` 出现后把它**顶到 `cc.sys.localStorage`**，
再通过 `wasteland-save-yt.js` 把白名单键快照同步到 `ytgame.game.saveData`。实测套件里能看到
`Save data size of 371~438 Bytes` 的多次落盘。

### 2.5 本地后端替身（启动流程必需，容易漏）

原 `fb-mock.js` 里除了 FBInstant 模拟，还有一段**本地后端替身**：拦截 `fetch`/`XHR`，
对 `na.2loveyou.com` 的 **IP 探测**返回固定值，并把统计上报黑洞掉。

**游戏启动流程依赖这个 IP 探测的返回值**：只替换 FBInstant 而丢掉这段替身，游戏会在加载页静默卡住
（表现为引擎 banner 不出现、`__require` 永远不生成；用 `tools/yt-stack-probe.cjs` 抓栈可以看到主线程只是在等）。
现在 `platform/wasteland-fbinstant-yt.js` 里按 YouTube 规则复刻了这层：

```
IP 探测：本地直接返回 window.__IP_PROBE_VALUE（沿用原 mock 值 aa8f3faa…，保证配置分支一致）
统计上报：本地返回空 JSON（黑洞），不发外部请求
其它外部地址：交给 runtime 的外部请求闸门 → 直接失败，不会真的发出去
```

> `js/index.js` 是被混淆的门户壳（内含测试题/分享/更多游戏等业务，以及 2loveyou 后端接口）。
> 它属于**代码混淆**（认证建议“不得混淆代码”），且残留外部接口字符串；本版只做了“运行时绝不外呼”的兜底
> （`[yt] 已拦截外部请求数 = 0`，外部请求闸门记录为 0 表示连尝试都没有）。是否进一步清理混淆壳，见第 4 节。

## 3. 验证结果（2026-10-06，官方测试套件）

```
node tools/yt-suite.cjs run --url https://localhost:8002/ --name wasteland
```

| 检查 | 结果 |
| --- | --- |
| MUST `SDK loaded before any game code` | PASS |
| MUST `Initial bundle < 30 MiB` | PASS（8.67 MiB 传输量） |
| MUST `firstFrameReady called before gameReady` | PASS |
| MUST `gameReady called` | PASS |
| MUST `Cloud save data < 3 MiB` | PASS（371~438 B，多次落盘） |
| MUST `JS heap size < 512 MiB` | PASS（32 MiB） |
| SHOULD `gameReady called within 5 seconds` | WARN（本机 8.2 秒，见第 4 节） |
| SHOULD `sendScore called with an integer` | 未使用（本游戏没有分数维度，进度存档是 AES 加密的，见第 4 节） |
| 游戏内表现 | 引擎启动 → `LoadScene Main` → `===加载完毕===` → gameReady |

暂停合规（`pause-local`，9 条全 PASS）：

```
PASS  暂停期间游戏循环冻结（帧数 1417 -> 1417，暂停前 1416）
PASS  暂停期间画面不再变化（暂停前画面在动）
PASS  暂停期间游戏收不到输入（探针 1 -> 1）
PASS  暂停期间音频静音（主音量 [0]）
PASS  恢复后游戏循环继续（帧数 1417 -> 1900）
PASS  恢复后输入恢复（探针 1 -> 2）
PASS  不使用 Page Visibility 类 API 暂停/恢复（屏蔽注册 9 次）
PASS  暂停后只能由 onResume 恢复（focus/visibility 无效）
PASS  暂停期间不发起网络请求（XHR done 0 -> 1）
```

## 4. 已知项 / 待办

1. **加载时间 8.2 秒**（SHOULD ≤ 5 秒）：初始包 8.67 MiB 没问题，慢在本机无头环境 + 引擎/资源解析。
   建议在真实 YouTube 托管/真机复测；若要再压缩，可考虑裁剪 `public_res` 里未用到的界面资源。
2. **`sendScore` 未接入**：认证原文是“游戏**可以**使用 sendScore”；本游戏没有分数维度，
   进度（等级/金币）在存档里是 **CryptoJS AES 加密**的（`isEnc: true`），为了不引入“上报值与游戏内不一致”的风险，
   本版不接。若审核要求必须上报，可从加密存档里解出 bestLevel 再上报（需要游戏自己的密钥，改动较大）。
3. **混淆的 `js/index.js`**（109 KB）：是门户壳（测试题/分享/后端接口）。认证建议“不得混淆代码”。
   本版保证运行时零外呼；若要彻底合规，需要把壳替换成干净的启动器（工作量大，需要先摸清它的启动时序）。
4. **内购/社区/锦标赛**：按 YouTube 规则关闭（`getSupportedAPIs` 不含 `payments.*`，社区/锦标赛返回不可用），
   游戏自身的商店/排行榜会走“不可用”分支；如果审核要求对应 UI 也隐藏，需要改动壳里的入口。

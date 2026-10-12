# 本地 HTTPS 测试流程（官方测试套件）

官方要求本地用 **https** 加载游戏，再用官方 Test Suite 做预检
（<https://developers.google.com/youtube/gaming/playables/test_suite>，MUST / SHOULD 面板 + SDK 事件日志）。
本仓库把这一整套做成了可重复执行的命令。

## 1. 起 https 服务器

```powershell
# 首次使用先生成自签证书（tools/certs/ 已被 .gitignore 忽略）
node tools/gen-certs.cjs

# 语法: node tools/serve-https.cjs <游戏目录> [端口]
node tools/serve-https.cjs nonogram 8000              # 参考游戏
node tools/serve-https.cjs build/AntFlow-yt 8001      # AntFlow YouTube 版
```

服务器特点：

- 自签证书（`tools/certs/`，SAN 含 `localhost` / `127.0.0.1` / `::1`）。
- **默认注入生产环境同款 CSP**（`default-src 'none'` + `script-src` 只放行 `https://www.youtube.com/game_api/v1` 等），
  外链请求、非法脚本会像线上一样被拦下来，便于提前发现问题；调试时可用 `--no-csp` 关掉。
- 文本资源自动 gzip（贴近线上托管），无缓存，404 会打印出来。

## 2. 让浏览器接受自签证书

手动测试时：用 Chrome 打开 `https://localhost:8001/`，会出现“您的连接不是私密连接”，
点【高级】→【继续前往 localhost（不安全）】即可，之后同一个浏览器不会再拦。

自动化脚本用的是带 `--ignore-certificate-errors --allow-insecure-localhost` 的独立 Chrome
profile（`tools/state/profiles/yt-suite`），不需要手动点。

## 3. 用官方测试套件预检（手动）

1. 打开 <https://developers.google.com/youtube/gaming/playables/test_suite>（需要能访问 Google，本机走 Clash 代理）。
2. 在 `Game URL` 输入框填本地地址，例如 `https://localhost:8001/`。
3. 点右侧刷新按钮（`#refresh-button`）。
4. 看左边栏：
   - `MUST`：`SDK loaded before any game code`、`Initial bundle < 30 MiB`、
     `firstFrameReady called before gameReady`、`gameReady called`、`Cloud save data < 3 MiB`；
   - `SHOULD`：`gameReady called within 5 seconds`、`sendScore called with an integer`；
   - `SDK Events` 面板：每次 SDK 调用的结果（存档内容、上报分数、广告、暂停/恢复等）；
   - 右侧画面：游戏本体。插屏/激励广告会显示 `AD BREAK` 覆盖层，激励广告有
     `Grant Reward` / `Close without Reward` 两个按钮，可据此验证发奖逻辑。

> 输入框在**输入时**就会开始加载（套件本身的行为），点刷新相当于再加载一次，属正常现象。

## 4. 用脚本跑同一套预检（推荐，可复现）

```powershell
node tools/yt-suite.cjs run --url https://localhost:8001/ --name antflow --wait 70
```

脚本会自动：起（或复用）调试端口 9230 的 Chrome → 打开套件页 → 填 URL → 点刷新 →
等检查结果稳定 → 打印 MUST/SHOULD 结果与日志，并把报告/截图/日志写到 `tools/state/`。

| 参数 | 说明 |
| --- | --- |
| `--url` | 本地游戏地址（必填） |
| `--name` | 报告文件名前缀 |
| `--wait` | 最长等待秒数（默认 45） |
| `--headless` | 无头模式；要观察画面就不要加 |
| `--port` | 调试端口，默认 9230 |
| `--profile` | 指定 Chrome profile（默认 `tools/state/profiles/yt-suite`） |
| `--keep` | 跑完不关浏览器，方便人工接着操作 |

其它子命令：

| 命令 | 用途 |
| --- | --- |
| `node tools/yt-suite.cjs inspect` | 打印套件页 DOM（调试选择器用） |
| `node tools/yt-suite.cjs targets --url ...` | 打印套件 + 游戏 iframe 的 target 列表 |
| `node tools/yt-suite.cjs diag --url ...` | 定期采样游戏 iframe 的资源与日志，排查加载卡住 |
| `node tools/yt-suite.cjs direct --url ...` | 直接打开游戏页（不在套件里），只看日志/截图 |
| `node tools/yt-suite.cjs direct --url ... --null-storage` | 复现 Playables 的存储限制（localStorage 等为 null） |
| `node tools/yt-suite.cjs harness --url "https://localhost:8300/iframe-host.html?game=..."` | 用本地宿主页把游戏放进跨域 iframe/sandbox 做对照测试 |
| `node tools/yt-suite.cjs pause --url ...` | 用套件的 Pause 按钮验证“暂停是否真的冻住游戏”（需能访问 Google） |
| `node tools/yt-suite.cjs pause-local --url ...` | 同上，但直接开游戏页调 SDK 同一条暂停路径，**不需要访问 Google** |

### 暂停验证怎么看

`pause-local` / `pause` 会打印 5 条判据（都基于适配层的帧计数与输入探针）：

```
PASS  暂停期间游戏循环冻结（帧数 392 -> 392）
PASS  暂停期间游戏收不到输入（探针 1 -> 1）
PASS  暂停期间音频静音（主音量 [0]）
PASS  恢复后游戏循环继续（帧数 392 -> 497）
PASS  恢复后输入恢复（探针 1 -> 2）
```

前提是 URL 带 `#ytdebug`（脚本会自动加）：适配层每 3 秒打一次
`heartbeat … frames=N (+Δ) [已暂停]`，暂停时 `Δ` 应当为 0。

## 5. 环境与排错

- **代理配置按电脑分别设置，不内置地址或端口**：所有 Chrome 测试工具统一读取 `YT_PROXY`；未设置时使用浏览器系统代理配置。显式代理时 `localhost/127.0.0.1/::1` 直连。
  PowerShell 中可用 `$env:YT_PROXY = Read-Host '请输入本机代理 URL（含协议、地址和端口）'`，然后照常执行测试命令。
  `yt-suite.cjs --proxy <代理URL>` 可覆盖本次运行；`--proxy direct` 或 `$env:YT_PROXY = 'direct'` 强制直连。
  用 `Remove-Item Env:YT_PROXY -ErrorAction SilentlyContinue` 清除配置，恢复系统代理。环境变量只影响之后启动的进程；修改后需关闭旧测试 Chrome 再启动。
- **文档抓取代理**：`fetch-docs.cjs` 优先读取 `YT_FETCH_PROXY`，其次 `YT_PROXY`；均未设置时直连。该工具的显式代理支持 HTTP CONNECT（`http://` URL），不自动读取 Windows 系统代理。
- 游戏页里的 SDK 脚本要从 `https://www.youtube.com/game_api/v1` 拉取，
  所以即使游戏在本地，浏览器也必须能访问 youtube.com。
- 控制台里 `playableIframe` / `postMessage` 相关输出是 SDK 与套件之间的正常通讯。
- 端口占用：同一端口只能起一个服务器；先 `netstat -ano | findstr :8001` 确认。
- 想复现“Playables 把存储全部置为 null”的效果：`direct --null-storage`。

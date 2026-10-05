# ytPlayables

YouTube Playables（油管小游戏）SDK 接入与本地测试仓库。

需求与背景见 [`需求说明.txt`](需求说明.txt)；官方文档抓取结果放在 [`.docs/`](.docs/)。
**本目录的工作约定见 [`AGENTS.md`](AGENTS.md)**（构建流程、硬性要求、工具索引、验证清单、已知坑）。

## 目录

| 路径 | 说明 |
| --- | --- |
| [`YoutubeMgr.js`](YoutubeMgr.js) | 通用 SDK 管理类（Cocos 2.x）。必接能力齐全，激励广告 / getLanguage / sendScore / openYTContent / health 等推荐能力已补齐 |
| [`platform/antflow-yandex-yt-bridge.js`](platform/antflow-yandex-yt-bridge.js) | AntFlow 的 Yandex → YouTube 适配层（构建时替换 `sdk.js`） |
| [`platform/antflow-yt-stub.js`](platform/antflow-yt-stub.js) | 诊断用最小替身（不碰 ytgame），用于区分“环境问题”和“适配层问题” |
| [`nonogram/`](nonogram) | 打包好的参考游戏（只有插屏广告），用作测试套件基线 |
| [`tools/serve-https.cjs`](tools/serve-https.cjs) | 本地 HTTPS 静态服务器（自签证书、官方同款 CSP、gzip） |
| [`tools/gen-certs.cjs`](tools/gen-certs.cjs) | 生成自签证书（首次使用跑一次） |
| [`tools/gen-start-bats.cjs`](tools/gen-start-bats.cjs) | 按端口登记表生成各游戏的 `start-<游戏>.bat` |
| [`tools/stop-https.cjs`](tools/stop-https.cjs) | 关闭端口上的本地服务 / 查看端口占用 |
| `start-<游戏>.bat` | 每个游戏一个，双击即起 https 服务（CRLF 批处理，自带证书检查与端口提示） |
| [`tools/yt-suite.cjs`](tools/yt-suite.cjs) | 自动跑官方 Test Suite，输出 MUST/SHOULD 结果与日志 |
| [`tools/build-antflow-yt.cjs`](tools/build-antflow-yt.cjs) | AntFlow YouTube staging 构建（含全部补丁，带匹配校验） |
| [`tools/yt-exceptions.cjs`](tools/yt-exceptions.cjs) | 捕获游戏里被吞掉的异常（排查卡死/静默失败） |
| `build/`、`tools/state/` | 构建产物、报告、截图、浏览器 profile（不入库） |

## 已接入的游戏

| 游戏 | 源目录（只读） | 构建产物 | 接入说明 |
| --- | --- | --- | --- |
| AntFlow | `gamePopStar/AntFlow/local-game` | `build/AntFlow-yt/` | [docs/AntFlow接入说明.md](docs/AntFlow接入说明.md) |
| nonogram | 本目录自带（参考游戏） | — | 仅作测试套件基线 |

## 本地启动与端口登记

一个游戏一个固定端口；新增游戏先挑空闲端口，然后改 `tools/gen-start-bats.cjs` 里的登记表并重新生成 bat。

| 游戏 | 目录 | 端口 | 地址 | 启动 |
| --- | --- | --- | --- | --- |
| nonogram（参考游戏） | `nonogram` | 8000 | https://localhost:8000/ | 双击 `start-nonogram.bat` |
| AntFlow 油管小游戏版 | `build/AntFlow-yt` | 8001 | https://localhost:8001/ | 双击 `start-AntFlow-yt.bat` |

```powershell
node tools/gen-start-bats.cjs --list     # 只打印端口登记表
node tools/stop-https.cjs --list         # 看各端口当前占用
node tools/stop-https.cjs 8001           # 关闭 8001 上的本地服务
```

首次使用需要 `node tools/gen-certs.cjs` 生成自签证书（bat 会自动检查并生成）；
浏览器首次打开会有证书告警，点「高级 → 继续前往」即可。

## 文档

- [SDK 必接与推荐清单（通俗版）](docs/SDK必接与推荐清单.md)
- [本地 HTTPS 测试流程](docs/本地HTTPS测试流程.md)
- [AntFlow 接入说明](docs/AntFlow接入说明.md)

## 快速开始

```powershell
# 0. 首次使用：生成自签证书
node tools/gen-certs.cjs

# 1. 构建 AntFlow 的 YouTube 版（输出到 build/AntFlow-yt）
node tools/build-antflow-yt.cjs

# 2. 起本地 https 服务（首次用浏览器打开一次并忽略证书提示）
node tools/serve-https.cjs build/AntFlow-yt 8001

# 3. 用官方测试套件自动预检
node tools/yt-suite.cjs run --url https://localhost:8001/ --name antflow --wait 70

# 4. 暂停验证（官方套件的 Pause 按钮；需要能访问 Google）
node tools/yt-suite.cjs pause --url https://localhost:8001/ --headless
# 代理不可用时的等价离线验证（直接调 SDK 同一条暂停路径）
node tools/yt-suite.cjs pause-local --url https://localhost:8001/ --headless
```

测试套件页需要能访问 Google（本机走 Clash 代理 `127.0.0.1:7890`）。

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
| Wasteland Survivor | `gamePopStar/WastelandSurvivor/local-game` | `build/WastelandSurvivor-yt/` | [docs/WastelandSurvivor接入说明.md](docs/WastelandSurvivor接入说明.md) |
| Planet Eater Evolution | `C:/Works/git/yxl/FBIGCrack/FBIGCrack/PlanetEaterEvolution/local-game` | `build/PlanetEaterEvolution-yt/` | [docs/PlanetEaterEvolution接入说明.md](docs/PlanetEaterEvolution接入说明.md) |
| AirportSimulator3D | `FBIGCrack/AirportSimulator3D/local-game` | `build/AirportSimulator3D-yt/` | [接入说明](docs/AirportSimulator3D接入说明.md) |
| BeepMelody | `FBIGCrack/BeepMelody/local-game` | `build/BeepMelody-yt/` | [接入说明](docs/BeepMelody接入说明.md) |
| BobaBubbleTeaDIY | `FBIGCrack/BobaBubbleTeaDIY/local-game` | `build/BobaBubbleTeaDIY-yt/` | [接入说明](docs/BobaBubbleTeaDIY接入说明.md) |
| BubbleMerge | `FBIGCrack/BubbleMerge/local-game` | `build/BubbleMerge-yt/` | [接入说明](docs/BubbleMerge接入说明.md) |
| DogsVsAliens | `FBIGCrack/DogsVsAliens/local-game` | `build/DogsVsAliens-yt/` | [接入说明](docs/DogsVsAliens接入说明.md) |
| Dominators | `FBIGCrack/Dominators/local-game` | `build/Dominators-yt/` | [接入说明](docs/Dominators接入说明.md) |
| EggyCar | `FBIGCrack/EggyCar/local-game` | `build/EggyCar-yt/` | [接入说明](docs/EggyCar接入说明.md) |
| FallToRescue | `FBIGCrack/FallToRescue/local-game` | `build/FallToRescue-yt/` | [接入说明](docs/FallToRescue接入说明.md) |
| FindTheDifference | `FBIGCrack/FindTheDifference/local-game` | `build/FindTheDifference-yt/` | [接入说明](docs/FindTheDifference接入说明.md) |
| FloorPlanHomeDesign | `FBIGCrack/FloorPlanHomeDesign/local-game` | `build/FloorPlanHomeDesign-yt/` | [接入说明](docs/FloorPlanHomeDesign接入说明.md) |
| FlowerGardenBouquetSorting | `FBIGCrack/FlowerGardenBouquetSorting/local-game` | `build/FlowerGardenBouquetSorting-yt/` | [接入说明](docs/FlowerGardenBouquetSorting接入说明.md) |
| FruitCafeMatch3 | `FBIGCrack/FruitCafeMatch3/local-game` | `build/FruitCafeMatch3-yt/` | [接入说明](docs/FruitCafeMatch3接入说明.md) |
| GardenSlide | `FBIGCrack/GardenSlide/local-game` | `build/GardenSlide-yt/` | [接入说明](docs/GardenSlide接入说明.md) |
| GoingBalls3D | `FBIGCrack/GoingBalls3D/local-game` | `build/GoingBalls3D-yt/` | [接入说明](docs/GoingBalls3D接入说明.md) |
| GrowIntoTheSun | `FBIGCrack/GrowIntoTheSun/local-game` | `build/GrowIntoTheSun-yt/` | [接入说明](docs/GrowIntoTheSun接入说明.md) |
| HarvestIO | `FBIGCrack/HarvestIO/local-game` | `build/HarvestIO-yt/` | [接入说明](docs/HarvestIO接入说明.md) |
| JigsawCards | `FBIGCrack/JigsawCards/local-game` | `build/JigsawCards-yt/` | [接入说明](docs/JigsawCards接入说明.md) |
| LumberjackForestEmpire | `FBIGCrack/LumberjackForestEmpire/local-game` | `build/LumberjackForestEmpire-yt/` | [接入说明](docs/LumberjackForestEmpire接入说明.md) |
| Mecha | `FBIGCrack/Mecha/local-game` | `build/Mecha-yt/` | [接入说明](docs/Mecha接入说明.md) |
| MJBeautySalon | `FBIGCrack/MJBeautySalon/local-game` | `build/MJBeautySalon-yt/` | [接入说明](docs/MJBeautySalon接入说明.md) |
| nonogram | 本目录自带（参考游戏） | — | 仅作测试套件基线 |

## 本地启动与端口登记

一个游戏一个固定端口；新增游戏先挑空闲端口，然后改 `tools/gen-start-bats.cjs` 里的登记表并重新生成 bat。

| 游戏 | 目录 | 端口 | 地址 | 启动 |
| --- | --- | --- | --- | --- |
| nonogram（参考游戏） | `nonogram` | 8000 | https://localhost:8000/ | 双击 `start-nonogram.bat` |
| AntFlow 油管小游戏版 | `build/AntFlow-yt` | 8001 | https://localhost:8001/ | 双击 `start-AntFlow-yt.bat` |
| Wasteland Survivor 油管小游戏版 | `build/WastelandSurvivor-yt` | 8002 | https://localhost:8002/ | 双击 `start-WastelandSurvivor-yt.bat` |
| Planet Eater Evolution 油管小游戏版 | `build/PlanetEaterEvolution-yt` | 8003 | https://localhost:8003/ | 双击 `start-PlanetEaterEvolution-yt.bat` |

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
- [Planet Eater Evolution 接入说明](docs/PlanetEaterEvolution接入说明.md)

Planet Eater Evolution：`node tools/build-planet-eater-yt.cjs --zip` 生成可重复构建的油管版和 `build/PlanetEaterEvolution-yt.zip`。
启动后可用 `node tools/verify-planet-eater-yt.cjs` 做官方套件内的开局、激励广告与云存档刷新验收（该验收工具使用 `127.0.0.1:8003`，服务需用 `--host 127.0.0.1`）。

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

测试套件页需要能访问 Google。代理地址与端口按本机配置，通过 `YT_PROXY` 环境变量设置；未设置时 Chrome 使用系统代理。详见 [代理配置](docs/本地HTTPS测试流程.md#5-环境与排错)。

## FB 已接入游戏首批五款（2026-11-01）

按字母顺序选择，排除已接入 YouTube 的 AntFlow 与尚未接入 FB 的游戏。构建：

```powershell
node tools/build-airport-yt.cjs --zip
node tools/build-beepmelody-yt.cjs --zip
node tools/build-boba-yt.cjs --zip
node tools/build-bubblemerge-yt.cjs --zip
node tools/build-dogsvaliens-yt.cjs --zip
```

[五款广告图（540×756，无文字与 logo）](marketing/README.md)。正式包在 `build/<游戏>-yt.zip`，广告图不计入游戏包。

`node tools/verify-fb-five-yt.cjs <游戏名>` 在官方套件验证真实输入、云档刷新与激励广告拒奖/授奖；先启动对应 HTTPS 服务（`--host 127.0.0.1`）。源文件指纹由 `tools/manifests/fb-five-sources.json` 校验。Airport 首次构建另需 UnityPy 1.25.4 与 ffmpeg，详见其接入说明。

## 第二批 FB 游戏（2026-11-01）

Dominators、EggyCar、FallToRescue、FindTheDifference、FloorPlanHomeDesign；各游戏的验证状态与限制见接入说明。

```powershell
node tools/build-dominators-yt.cjs --zip
node tools/build-eggycar-yt.cjs --zip
node tools/build-falltorescue-yt.cjs --zip
node tools/build-ftd-yt.cjs --zip
node tools/build-floorplan-yt.cjs --zip
```

`node tools/verify-fb-second-yt.cjs <游戏名>` 检查官方套件真实输入、暂停存档、刷新恢复与广告分支；先启动对应 HTTPS 服务并使用 `--host 127.0.0.1`。

Dominators 已按用户授权采用 RGBA4444 贴图压缩，保留尺寸、全部关卡与玩法；完整资源 28.97 MiB。[画面对比](marketing/Dominators/texture-comparison.png)（左原版/右压缩版），正式包 `build/Dominators-yt.zip`。

## 第三批 FB 游戏（2026-11-02）

FlowerGardenBouquetSorting、FruitCafeMatch3、GardenSlide、GoingBalls3D、GrowIntoTheSun。

```powershell
node tools/build-flowergarden-yt.cjs --zip
node tools/build-fruitcafe-yt.cjs --zip
node tools/build-gardenslide-yt.cjs --zip
node tools/build-goingballs-yt.cjs --zip
node tools/build-growintothesun-yt.cjs --zip
```

`node tools/verify-fb-third-yt.cjs <游戏名>` 在官方套件执行真实玩法、云档刷新与广告分支检查；先启动对应 HTTPS 服务，指定 `--host 127.0.0.1`。各游戏覆盖范围见接入说明；[540×756 无文字广告图](marketing/README.md)。

## 第四批 FB 游戏转换

- HarvestIO：HTTPS 8019，双击 `start-HarvestIO-yt.bat`。
- JigsawCards：HTTPS 8020，双击 `start-JigsawCards-yt.bat`。
- LumberjackForestEmpire：HTTPS 8021，双击 `start-LumberjackForestEmpire-yt.bat`。
- Mecha：HTTPS 8022，双击 `start-Mecha-yt.bat`。
- MJBeautySalon：HTTPS 8023，双击 `start-MJBeautySalon-yt.bat`。

广告图见 [marketing/README.md](marketing/README.md)。验收工具：`node tools/verify-fb-fourth-yt.cjs <游戏名>`。

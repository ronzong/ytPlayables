# YouTube Playables 上传与测试简明流程

本文以 **BeepMelody** 为例，说明本地测试、YouTube 测试环境、图形界面压缩、广告图和游戏表格更新。更完整的接入细节见 `docs/BeepMelody接入说明.md`。

## 1. 本地浏览器直接测试

1. 双击仓库根目录的 `start-BeepMelody-yt.bat`。
2. 浏览器打开 `https://localhost:8005/`。
3. 首次出现证书提示时，选择“高级”，再选择“继续前往”。
4. 检查游戏能否正常加载、进入菜单、开始一局，以及音乐、音效和基本操作是否正常。

这一阶段只验证普通浏览器里的本地运行情况，不等同于 YouTube Playables 环境测试。

## 2. YouTube Playables 测试环境

1. 保持 `start-BeepMelody-yt.bat` 运行。
2. 打开 [YouTube Playables Test Suite](https://developers.google.com/youtube/gaming/playables/test_suite?hl=zh-cn)。
3. 在 Game URL 中填入 `https://localhost:8005/`。
4. 点击刷新按钮，等待测试结果稳定。

重点检查：

- `MUST` 项目是否全部 PASS。
- `firstFrameReady` 是否早于 `gameReady`。
- 暂停后游戏循环、画面、输入和声音是否全部停止。
- 恢复后游戏和输入是否只通过 SDK 恢复。
- 云存档能否写入，刷新后能否恢复。
- 激励广告的拒绝和发奖分支是否正确。

官方测试套件需要访问 Google 和 YouTube SDK。如果页面打不开，先检查 Chrome 的代理设置。

## 3. 上传包测试

前两步通过后再上传 ZIP，并在平台提供的预览或外部测试环境中实际测试开局、暂停恢复、刷新存档和移动端操作。

仓库目前没有记录 Playables 提审后台的具体入口、字段和审核步骤，因此本文不推测后台操作。上传时以平台页面的实际提示为准。

## 4. 用图形界面制作上传 ZIP

以 BeepMelody 为例，游戏目录是：

`E:\ytPlayables\build\BeepMelody-yt`

操作规则：

1. 进入 `BeepMelody-yt` 文件夹。
2. 全选里面的所有文件和子文件夹。
3. 右键选择“添加到压缩包”或“压缩为 ZIP”。
4. 将压缩包保存到 `E:\ytPlayables\build\`，文件名使用 `BeepMelody-yt.zip`。
5. 不要再次压缩已经生成的 ZIP。

**不要直接压缩 `BeepMelody-yt` 文件夹本身。** 应压缩的是该文件夹里面的内容。

正确的 ZIP 根目录结构：

```text
BeepMelody-yt.zip
├─ index.html
├─ yt-bridge.js
├─ assets/
├─ art/
└─ music/
```

错误结构：

```text
BeepMelody-yt.zip
└─ BeepMelody-yt/
   └─ index.html
```

油管要求 ZIP 根目录直接包含 `index.html`。ZIP 文件本身放在 `build` 根目录，不能放进 `BeepMelody-yt` 游戏目录，也不能把广告图打进游戏包。

## 5. 广告图位置

BeepMelody 的广告图：

`E:\ytPlayables\marketing\BeepMelody\ad-540x756.png`

通用目录规则：

`E:\ytPlayables\marketing\<游戏名>\ad-540x756.png`

广告图应为 540×756 PNG，不带文字和 logo。`reference-gameplay.png` 只是参考截图，不作为上传素材。广告图独立保存，不放进游戏 ZIP。

## 6. 更新游戏表格

用 Excel 打开：

`E:\ytPlayables\游戏.xlsx`

在 `Sheet1` 中找到对应游戏行，按实际进度更新：

| 列 | 更新规则 |
| --- | --- |
| `游戏名` | 与构建目录、游戏名称保持一致 |
| `yt构建` | 构建完成后填 `1` |
| `开发者账号` | 填写实际上传该游戏的账号 |
| `线上测试` | 上传包并实际在线测试通过后才填 `1` |
| `提审状态` | 真正提交审核后才填 `1` |

不要把“构建完成”直接记为“线上测试完成”。表格修改后保存并提交到 Git。

## 7. 最小检查清单

- 本地 HTTPS 能进入游戏并实际开局。
- YouTube 测试环境 MUST 全部 PASS。
- 暂停、恢复、音频、输入和云存档检查通过。
- ZIP 根目录直接有 `index.html`。
- 广告图位于 `marketing\<游戏名>\ad-540x756.png`。
- 游戏表格按实际上传和提审进度更新。

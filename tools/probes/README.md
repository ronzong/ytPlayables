# UI / 输入探针（`tools/yt-ui-probe.cjs --eval-file <文件>` 用）

排查“某个按钮点了没反应、也没有日志”时按顺序用：

| 文件 | 干什么 | 什么时候用 |
| --- | --- | --- |
| `dom-overlays.js` | 列出游戏页里所有可见 DOM 覆盖层（位置/层级/`pointer-events`/HTML）与指定坐标处最上层元素 | 怀疑有元素吃掉点击（离屏外壳节点、遮罩、iframe 盖层） |
| `input-rect.js` | 对比引擎缓存的画布位置（`cc.inputManager._canvasBoundingRect`）与实时 `getBoundingClientRect()` | 怀疑“点击坐标整体偏移”（画布被挪动过但没触发 resize） |
| `hit-list.js` | 列出某个视图坐标点上命中的所有活跃节点（含 `swallowTouches`、Button/Touch 组件） | 坐标映射没问题，但游戏内另一个节点把点击吞了（引导遮罩、TouchBlocker） |

用法：

```
# 直接开游戏页（会带 #ytdebug，日志能打出来）
node tools/yt-ui-probe.cjs --url https://localhost:8002/ --eval-file tools/probes/dom-overlays.js
# 通过官方测试套件打开（复现 Playables 真实环境）
node tools/yt-ui-probe.cjs --via-suite --url https://localhost:8002/ --eval-file tools/probes/input-rect.js --click
```

坐标换算（把游戏视图坐标换成页面 CSS 坐标，套件页会滚动，点之前必须重新量 iframe）：

```
cssX = rect.left + screen.x / visible.width  * rect.width
cssY = rect.top  + (visible.height - screen.y) / visible.height * rect.height
```

`screen` 来自 `cc.Camera.main.getWorldToScreenPoint(node.getPosition())`，
`visible` 来自 `cc.view.getVisibleSize()`，`rect` 来自 `#playable-iframe`（或游戏页的 canvas）。
Cocos 2.4.12 的 `cc.view.convertToLocationInView()` 返回 `null`，不要用它做校验；
要确认点击真的进到游戏，用 `cc.eventManager.dispatchEvent` 打点看 `touch.getLocationX/Y`。

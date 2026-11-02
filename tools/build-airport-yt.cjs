'use strict';
// 从已验证的只读 FB 游戏基线生成 YouTube 版。
require('./lib/build-fb-five.cjs').build('AirportSimulator3D',process.argv.includes('--zip'));

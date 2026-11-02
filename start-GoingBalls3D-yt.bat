@echo off
chcp 65001 >nul
rem GoingBalls3D 油管小游戏版 - 本地 https 测试服务
rem 端口 8017 / 目录 build/GoingBalls3D-yt / 地址 https://localhost:8017/
cd /d "%~dp0"
if not exist "tools\certs\cert.pem" node tools\gen-certs.cjs
if not exist "build\GoingBalls3D-yt" echo [错误] 缺少目录 build/GoingBalls3D-yt，请先构建 & goto :end
echo.
echo ============================================================
echo   GoingBalls3D 油管小游戏版
echo   地址   https://localhost:8017/
echo   目录   build/GoingBalls3D-yt
echo   首次访问请在浏览器里点 [高级] - [继续前往] 忽略证书提示
echo   停止   本窗口按 Ctrl+C，或另开窗口运行 node tools\stop-https.cjs 8017
echo ============================================================
echo.
node tools\serve-https.cjs build/GoingBalls3D-yt 8017
echo.
echo 服务已停止，错误码 %errorlevel%
:end
pause

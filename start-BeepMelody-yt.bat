@echo off
chcp 65001 >nul
rem BeepMelody 油管小游戏版 - 本地 https 测试服务
rem 端口 8005 / 目录 build/BeepMelody-yt / 地址 https://localhost:8005/
cd /d "%~dp0"
if not exist "tools\certs\cert.pem" node tools\gen-certs.cjs
if not exist "build\BeepMelody-yt" echo [错误] 缺少目录 build/BeepMelody-yt，请先构建 & goto :end
echo.
echo ============================================================
echo   BeepMelody 油管小游戏版
echo   地址   https://localhost:8005/
echo   目录   build/BeepMelody-yt
echo   首次访问请在浏览器里点 [高级] - [继续前往] 忽略证书提示
echo   停止   本窗口按 Ctrl+C，或另开窗口运行 node tools\stop-https.cjs 8005
echo ============================================================
echo.
node tools\serve-https.cjs build/BeepMelody-yt 8005
echo.
echo 服务已停止，错误码 %errorlevel%
:end
pause

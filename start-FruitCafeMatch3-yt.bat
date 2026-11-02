@echo off
chcp 65001 >nul
rem FruitCafeMatch3 油管小游戏版 - 本地 https 测试服务
rem 端口 8015 / 目录 build/FruitCafeMatch3-yt / 地址 https://localhost:8015/
cd /d "%~dp0"
if not exist "tools\certs\cert.pem" node tools\gen-certs.cjs
if not exist "build\FruitCafeMatch3-yt" echo [错误] 缺少目录 build/FruitCafeMatch3-yt，请先构建 & goto :end
echo.
echo ============================================================
echo   FruitCafeMatch3 油管小游戏版
echo   地址   https://localhost:8015/
echo   目录   build/FruitCafeMatch3-yt
echo   首次访问请在浏览器里点 [高级] - [继续前往] 忽略证书提示
echo   停止   本窗口按 Ctrl+C，或另开窗口运行 node tools\stop-https.cjs 8015
echo ============================================================
echo.
node tools\serve-https.cjs build/FruitCafeMatch3-yt 8015
echo.
echo 服务已停止，错误码 %errorlevel%
:end
pause

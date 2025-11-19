@echo off
chcp 65001 >nul
cd /d "%~dp0\.."
cls
echo ========================================
echo   Snake Game - Local Network
echo   Локальная игра (одна WiFi сеть)
echo ========================================
echo.
echo Stopping old servers (if any)...
taskkill /FI "WindowTitle eq WebSocket Server*" /F >nul 2>&1
taskkill /FI "WindowTitle eq HTTP Server*" /F >nul 2>&1
taskkill /FI "WindowTitle eq Vite Dev*" /F >nul 2>&1
timeout /t 1 /nobreak >nul

echo Starting servers...
echo.

:: Start servers
start "WebSocket Server" cmd /k "title WebSocket Server && cd /d "%~dp0\.." && python server.py"
timeout /t 2 /nobreak >nul

start "Vite Dev Server" cmd /k "title Vite Dev Server && cd /d "%~dp0\.." && npm run dev"
timeout /t 3 /nobreak >nul

:: Get local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do set "LOCAL_IP=%%a"
set "LOCAL_IP=%LOCAL_IP: =%"

cls
echo ========================================
echo   Servers started!
echo ========================================
echo.
echo LOCAL IP ADDRESS: %LOCAL_IP%
echo.
echo ========================================
echo   COPY THESE URLS:
echo ========================================
echo.
echo FOR THIS COMPUTER:
echo   http://localhost:3000
echo   WebSocket: ws://localhost:8765
echo.
echo FOR PHONES/TABLETS:
echo   http://%LOCAL_IP%:3000
echo   WebSocket: ws://%LOCAL_IP%:8765
echo.
echo ========================================
echo   TROUBLESHOOTING:
echo ========================================
echo.
echo If phones can't connect:
echo   1. Run CHECK_FIREWALL.bat (as Administrator)
echo   2. Make sure all devices on same WiFi
echo   3. Check Windows Firewall settings
echo.
echo ========================================
echo   HOW TO PLAY:
echo ========================================
echo.
echo ON THIS COMPUTER:
echo   1. Open: http://localhost:3000
echo   2. Click Multiplayer
echo   3. Test connection (should work)
echo   4. Create or join room
echo.
echo ON OTHER DEVICES (same WiFi):
echo   1. Open: http://%LOCAL_IP%:3000
echo   2. Click Multiplayer -^> Settings
echo   3. Change to: ws://%LOCAL_IP%:8765
echo   4. Click "Test Connection" button
echo   5. If OK - create or join room
echo.
echo ========================================
echo.
echo Press any key to stop servers...
pause >nul

:: Cleanup
echo.
echo Stopping servers...
taskkill /FI "WindowTitle eq WebSocket Server*" /F >nul 2>&1
taskkill /FI "WindowTitle eq Vite Dev*" /F >nul 2>&1
echo Done!
timeout /t 2 /nobreak >nul

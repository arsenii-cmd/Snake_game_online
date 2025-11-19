@echo off
echo Stopping all servers...
echo.

taskkill /FI "WindowTitle eq WebSocket Server*" /F >nul 2>&1
taskkill /FI "WindowTitle eq HTTP Server*" /F >nul 2>&1
taskkill /FI "WindowTitle eq CloudPub*" /F >nul 2>&1
clo.exe stop >nul 2>&1
taskkill /F /IM clo.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1

echo Done! All servers stopped.
timeout /t 2 /nobreak >nul

@echo off
chcp 65001 >nul
cls
echo ========================================
echo   Snake Game - Public Server (AUTO)
echo ========================================
echo.
echo [1/4] Starting local servers...
echo.

:: Start servers
start "WebSocket Server" /MIN cmd /k "title WebSocket Server && python server.py"
timeout /t 2 /nobreak >nul

start "HTTP Server" /MIN cmd /k "title HTTP Server && python -m http.server 8000"
timeout /t 2 /nobreak >nul

echo OK Local servers started
echo.
echo [2/4] Creating CloudPub tunnels...
echo This may take 10-15 seconds...
echo.

:: Create temp files for output
set "WS_OUTPUT=%TEMP%\cloudpub_ws.txt"
set "HTTP_OUTPUT=%TEMP%\cloudpub_http.txt"

:: Start CloudPub for WebSocket and capture output
start /B cmd /c "clo.exe publish http localhost:8765 > "%WS_OUTPUT%" 2>&1"
timeout /t 3 /nobreak >nul

:: Start CloudPub for HTTP and capture output
start /B cmd /c "clo.exe publish http localhost:8000 > "%HTTP_OUTPUT%" 2>&1"

:: Wait for URLs to appear
echo Waiting for CloudPub URLs...
set /a "attempts=0"
set /a "max_attempts=20"

:wait_loop
timeout /t 1 /nobreak >nul
set /a "attempts+=1"

:: Check if files exist and have content
if exist "%WS_OUTPUT%" (
    findstr /C:"Сервис опубликован" "%WS_OUTPUT%" >nul 2>&1
    if not errorlevel 1 (
        if exist "%HTTP_OUTPUT%" (
            findstr /C:"Сервис опубликован" "%HTTP_OUTPUT%" >nul 2>&1
            if not errorlevel 1 goto :urls_ready
        )
    )
)

if %attempts% lss %max_attempts% goto :wait_loop

echo.
echo WARNING: Could not get URLs automatically
echo Please check CloudPub windows manually
echo.
goto :manual_instructions

:urls_ready
echo OK CloudPub tunnels created!
echo.
echo [3/4] Extracting URLs...
echo.

:: Extract WebSocket URL
for /f "tokens=2 delims=->" %%a in ('findstr /C:"Сервис опубликован" "%WS_OUTPUT%"') do (
    set "WS_URL=%%a"
)

:: Extract HTTP URL
for /f "tokens=2 delims=->" %%a in ('findstr /C:"Сервис опубликован" "%HTTP_OUTPUT%"') do (
    set "HTTP_URL=%%a"
)

:: Clean up URLs (remove spaces and port)
set "WS_URL=%WS_URL: =%"
set "HTTP_URL=%HTTP_URL: =%"
set "WS_URL=%WS_URL::443=%"
set "HTTP_URL=%HTTP_URL::443=%"

:: Convert https to wss for WebSocket
set "WSS_URL=%WS_URL:https://=wss://%"

:: Add /index.html to HTTP URL
set "GAME_URL=%HTTP_URL%/index.html"

cls
echo ========================================
echo   [4/4] READY TO PLAY!
echo ========================================
echo.
echo COPY AND SHARE THESE LINKS:
echo.
echo ----------------------------------------
echo GAME URL (share with friends):
echo.
echo   %GAME_URL%
echo.
echo ----------------------------------------
echo WEBSOCKET URL (for settings):
echo.
echo   %WSS_URL%
echo.
echo ----------------------------------------
echo.
echo HOW TO PLAY:
echo.
echo 1. Share GAME URL with friends
echo.
echo 2. Everyone opens the game
echo.
echo 3. Click "Настройки сервера"
echo    Paste WEBSOCKET URL
echo.
echo 4. One person creates room
echo    Others join using room code
echo.
echo ========================================
echo.
echo Press any key to stop all servers...
pause >nul
goto :cleanup

:manual_instructions
echo ========================================
echo   MANUAL INSTRUCTIONS
echo ========================================
echo.
echo Check the CloudPub windows for URLs
echo.
echo 1. CloudPub WebSocket window:
echo    Copy URL and change https:// to wss://
echo.
echo 2. CloudPub HTTP window:
echo    Copy URL and add /index.html
echo.
echo ========================================
echo.
echo Press any key to stop all servers...
pause >nul

:cleanup
:: Cleanup
echo.
echo Stopping servers...
clo.exe stop >nul 2>&1
taskkill /FI "WindowTitle eq WebSocket Server*" /F >nul 2>&1
taskkill /FI "WindowTitle eq HTTP Server*" /F >nul 2>&1
taskkill /F /IM clo.exe >nul 2>&1

:: Clean temp files
if exist "%WS_OUTPUT%" del "%WS_OUTPUT%"
if exist "%HTTP_OUTPUT%" del "%HTTP_OUTPUT%"

echo Done!
timeout /t 2 /nobreak >nul

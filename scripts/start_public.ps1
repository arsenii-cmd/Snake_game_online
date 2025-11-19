# Encoding: UTF-8 with BOM
# Script for automatic server startup with CloudPub

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Snake Game Multiplayer Server" -ForegroundColor Green
Write-Host "  Public access via CloudPub" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Python
Write-Host "[1/5] Checking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "OK Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR Python not found! Install from python.org" -ForegroundColor Red
    pause
    exit
}

# Check CloudPub
Write-Host "[2/5] Checking CloudPub..." -ForegroundColor Yellow
try {
    $cloudpubCheck = Get-Command clo.exe -ErrorAction Stop
    Write-Host "OK CloudPub found" -ForegroundColor Green
} catch {
    Write-Host "ERROR CloudPub (clo.exe) not found!" -ForegroundColor Red
    Write-Host "Download and install from https://cloudpub.ru/" -ForegroundColor Yellow
    Write-Host "Then restart this script" -ForegroundColor Yellow
    pause
    exit
}

Write-Host ""
Write-Host "[3/5] Starting local servers..." -ForegroundColor Yellow

# Start WebSocket server
Write-Host "  -> Starting WebSocket server (port 8765)..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python server.py" -WindowStyle Minimized
Start-Sleep -Seconds 2

# Start HTTP server
Write-Host "  -> Starting HTTP server (port 8000)..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m http.server 8000" -WindowStyle Minimized
Start-Sleep -Seconds 2

Write-Host "OK Local servers started" -ForegroundColor Green
Write-Host ""

Write-Host "[4/5] Creating public tunnels via CloudPub..." -ForegroundColor Yellow
Write-Host ""

# Start CloudPub tunnels in separate windows
Start-Process cmd -ArgumentList "/k", "title CloudPub WebSocket && echo ========================================= && echo CloudPub WebSocket Tunnel && echo ========================================= && echo. && clo.exe publish http localhost:8765"
Start-Sleep -Seconds 2

Start-Process cmd -ArgumentList "/k", "title CloudPub HTTP && echo ========================================= && echo CloudPub HTTP Tunnel && echo ========================================= && echo. && echo Copy the URL from this window! && echo. && clo.exe publish http localhost:8000"

Write-Host "OK CloudPub tunnels started in separate windows" -ForegroundColor Green
Write-Host ""

Write-Host "[5/5] Done! All servers started" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  INSTRUCTIONS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Find 'CloudPub WebSocket' window" -ForegroundColor Yellow
Write-Host "   Copy URL: https://abc-def-ghi.cloudpub.ru" -ForegroundColor White
Write-Host "   Change https:// to wss://" -ForegroundColor Gray
Write-Host "   Result: wss://abc-def-ghi.cloudpub.ru" -ForegroundColor Green
Write-Host ""
Write-Host "2. Find 'CloudPub HTTP' window" -ForegroundColor Yellow
Write-Host "   Copy URL and add /index.html" -ForegroundColor White
Write-Host "   Example: https://your-url.cloudpub.ru/index.html" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Share with friends:" -ForegroundColor Yellow
Write-Host "   - Game URL: https://your-url.cloudpub.ru/index.html" -ForegroundColor White
Write-Host ""
Write-Host "4. Everyone opens game URL" -ForegroundColor Yellow
Write-Host ""
Write-Host "5. Click 'Настройки сервера' and paste:" -ForegroundColor Yellow
Write-Host "   wss://abc-def-ghi.cloudpub.ru" -ForegroundColor White
Write-Host ""
Write-Host "6. One person creates room (gets code like GHJKL)" -ForegroundColor Yellow
Write-Host "   Others join using that room code" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: Do not close CloudPub windows while playing!" -ForegroundColor Red
Write-Host ""
Write-Host "Press any key to stop all servers..." -ForegroundColor Yellow
pause

# Cleanup on exit
Write-Host ""
Write-Host "Stopping servers..." -ForegroundColor Yellow

# Stop CloudPub
clo.exe stop | Out-Null
Get-Process | Where-Object { $_.MainWindowTitle -like "*CloudPub*" } | Stop-Process -Force -ErrorAction SilentlyContinue

# Stop Python processes
Get-Process python -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*server.py*" -or $_.CommandLine -like "*http.server*"
} | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "OK Servers stopped" -ForegroundColor Green
Start-Sleep -Seconds 2

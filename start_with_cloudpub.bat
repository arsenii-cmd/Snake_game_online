@echo off
chcp 65001 >nul
echo ========================================
echo Запуск серверов для мультиплеерной игры
echo с CloudPub туннелем
echo ========================================
echo.

echo Шаг 1: Запуск WebSocket сервера...
start "WebSocket Server" cmd /k "python server.py"
timeout /t 2 /nobreak >nul

echo Шаг 2: Запуск HTTP сервера...
start "HTTP Server" cmd /k "python -m http.server 8000"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo Серверы запущены!
echo ========================================
echo.
echo WebSocket сервер: ws://localhost:8765
echo HTTP сервер: http://localhost:8000
echo.
echo ========================================
echo Следующий шаг: Запустите CloudPub
echo ========================================
echo.
echo Откройте НОВОЕ окно PowerShell/CMD и выполните:
echo.
echo   cloudpub http 8765
echo.
echo CloudPub выдаст публичный URL (например: https://abc123.cloudpub.ru)
echo Используйте этот URL в настройках игры для подключения!
echo.
echo Опционально (для публичного доступа к игре):
echo   cloudpub http 8000
echo.
echo ========================================
echo Инструкция: см. start_with_cloudpub.md
echo ========================================
echo.
pause

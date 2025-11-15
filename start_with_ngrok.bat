@echo off
echo ========================================
echo Запуск серверов для мультиплеерной игры
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
echo Для публичного доступа запустите ngrok:
echo   ngrok http 8765  (для WebSocket)
echo   ngrok http 8000  (для HTTP)
echo.
echo Нажмите любую клавишу для выхода...
pause >nul

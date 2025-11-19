@echo off
:: Запуск публичного сервера через CloudPub
:: Автоматически запускает серверы и создаёт публичные ссылки

echo Запуск публичного сервера...
echo.

:: Запуск PowerShell скрипта с правами выполнения
powershell -ExecutionPolicy Bypass -File "%~dp0start_public.ps1"

pause

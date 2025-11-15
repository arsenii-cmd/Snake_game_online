@echo off
echo ========================================
echo   Checking Firewall Rules
echo ========================================
echo.
echo Adding firewall rules for ports 8000 and 8765...
echo.

netsh advfirewall firewall add rule name="Snake Game HTTP" dir=in action=allow protocol=TCP localport=8000
netsh advfirewall firewall add rule name="Snake Game WebSocket" dir=in action=allow protocol=TCP localport=8765

echo.
echo Done! Firewall rules added.
echo.
echo Now try connecting from your phone again.
echo.
pause

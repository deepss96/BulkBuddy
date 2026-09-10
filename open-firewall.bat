@echo off
echo ================================================
echo   BulkBuddy - Opening Firewall Ports
echo ================================================
echo.

echo [1/2] Opening port 7001 (Frontend)...
netsh advfirewall firewall delete rule name="BulkBuddy Frontend 7001" >nul 2>&1
netsh advfirewall firewall add rule name="BulkBuddy Frontend 7001" dir=in action=allow protocol=TCP localport=7001
if %errorlevel% == 0 (echo     OK: Port 7001 opened!) else (echo     FAILED: Could not open port 7001)

echo.
echo [2/2] Opening port 4000 (Backend)...
netsh advfirewall firewall delete rule name="BulkBuddy Backend 4000" >nul 2>&1
netsh advfirewall firewall add rule name="BulkBuddy Backend 4000" dir=in action=allow protocol=TCP localport=4000
if %errorlevel% == 0 (echo     OK: Port 4000 opened!) else (echo     FAILED: Could not open port 4000)

echo.
echo ================================================
echo   Done! Now open on mobile:
echo   http://192.168.1.23:7001
echo ================================================
echo.
pause

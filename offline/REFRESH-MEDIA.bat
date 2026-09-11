@echo off
setlocal
cd /d "%~dp0.."

echo Refreshing portrait media from current approved online version...
call npm run offline:refresh-media
if errorlevel 1 (
  echo Refresh failed. Check internet connection and run again.
  pause
  exit /b 1
)

echo.
echo Portrait media refreshed.
echo No rebuild is required because the kiosk server reads offline\media directly.
pause

@echo off
setlocal
cd /d "%~dp0.."

echo ==============================================
echo THE PEOPLE WHO SHAPED THE FUTURE - OFFLINE BUILD
echo ==============================================

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js not found. Install Node.js LTS first.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm not found.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo [1/4] Installing dependencies...
  call npm install
  if errorlevel 1 goto :fail
) else (
  echo [1/4] Dependencies already installed.
)

echo [2/4] Preparing local portraits...
call npm run offline:prepare
if errorlevel 1 (
  echo.
  echo Portrait preparation failed. Connect to the internet and run this file again.
  goto :fail
)

echo [3/4] Building kiosk app...
call npm run offline:build
if errorlevel 1 goto :fail

echo [4/4] Running health check...
call npm run offline:check
if errorlevel 1 goto :fail

echo.
echo OFFLINE PACKAGE READY.
echo You can disconnect Wi-Fi and run offline\START-EXHIBITION.bat
pause
exit /b 0

:fail
echo.
echo BUILD FAILED. Review the messages above.
pause
exit /b 1

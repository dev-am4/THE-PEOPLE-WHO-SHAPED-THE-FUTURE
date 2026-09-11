@echo off
setlocal
cd /d "%~dp0.."

if exist "offline\.server.pid" (
  for /f %%p in (offline\.server.pid) do (
    taskkill /PID %%p /F >nul 2>nul
  )
  del /q "offline\.server.pid" >nul 2>nul
  echo Exhibition local server stopped.
) else (
  echo No offline server PID file found.
)

echo Close the kiosk browser with Alt+F4 if it is still open.
pause

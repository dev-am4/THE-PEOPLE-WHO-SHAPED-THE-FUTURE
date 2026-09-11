@echo off
setlocal
cd /d "%~dp0.."

if not exist "offline\dist\index.html" (
  echo Offline build not found. Running BUILD-OFFLINE first...
  call "offline\BUILD-OFFLINE.bat"
  if errorlevel 1 exit /b 1
)

if exist "offline\.server.pid" (
  for /f %%p in (offline\.server.pid) do taskkill /PID %%p /F >nul 2>nul
  del /q "offline\.server.pid" >nul 2>nul
)

start "Exhibition Local Server" /min cmd /c "node offline\server.mjs"
timeout /t 2 /nobreak >nul

set URL=http://127.0.0.1:4173
set FLAGS=--kiosk --app=%URL% --no-first-run --disable-pinch --overscroll-history-navigation=0 --disable-session-crashed-bubble --autoplay-policy=no-user-gesture-required --disable-features=Translate,MediaRouter

if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
  start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" %FLAGS%
  exit /b 0
)

if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
  start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" %FLAGS%
  exit /b 0
)

if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
  start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" %FLAGS%
  exit /b 0
)

if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
  start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" %FLAGS%
  exit /b 0
)

echo No Chrome or Edge installation found.
echo Open %URL% manually in a browser.
pause

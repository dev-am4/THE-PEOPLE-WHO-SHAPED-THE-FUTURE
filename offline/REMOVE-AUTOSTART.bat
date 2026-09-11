@echo off
setlocal
set "LINK=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\PeopleWhoShapedTheFuture-Kiosk.lnk"
if exist "%LINK%" del /q "%LINK%"
if exist "%LINK%" (
  echo Could not remove auto-start shortcut.
) else (
  echo Auto-start shortcut removed.
)
pause

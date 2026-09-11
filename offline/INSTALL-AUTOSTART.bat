@echo off
setlocal
set "STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "TARGET=%~dp0START-EXHIBITION.bat"
set "LINK=%STARTUP%\PeopleWhoShapedTheFuture-Kiosk.lnk"

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws=New-Object -ComObject WScript.Shell; $s=$ws.CreateShortcut('%LINK%'); $s.TargetPath='%TARGET%'; $s.WorkingDirectory='%~dp0..'; $s.WindowStyle=7; $s.Save()"

if exist "%LINK%" (
  echo Auto-start shortcut installed.
  echo The exhibition will launch after this Windows account signs in.
) else (
  echo Could not create the Startup shortcut.
)
pause

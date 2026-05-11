@echo off
setlocal

set "APP_URL=file:///C:/Users/Kyu/Desktop/claude/supply-fireapp/index.html"
set "WINDOW_SIZE=390,844"
set "PREVIEW_PROFILE=%TEMP%\supply-fireapp-mobile-preview"

set "CHROME_64=C:\Program Files\Google\Chrome\Application\chrome.exe"
set "CHROME_32=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
set "EDGE_64=C:\Program Files\Microsoft\Edge\Application\msedge.exe"
set "EDGE=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

if exist "%CHROME_64%" (
  start "" "%CHROME_64%" --user-data-dir="%PREVIEW_PROFILE%" --app="%APP_URL%" --window-size=%WINDOW_SIZE%
  exit /b
)

if exist "%CHROME_32%" (
  start "" "%CHROME_32%" --user-data-dir="%PREVIEW_PROFILE%" --app="%APP_URL%" --window-size=%WINDOW_SIZE%
  exit /b
)

if exist "%EDGE_64%" (
  start "" "%EDGE_64%" --user-data-dir="%PREVIEW_PROFILE%" --app="%APP_URL%" --window-size=%WINDOW_SIZE%
  exit /b
)

if exist "%EDGE%" (
  start "" "%EDGE%" --user-data-dir="%PREVIEW_PROFILE%" --app="%APP_URL%" --window-size=%WINDOW_SIZE%
  exit /b
)

echo Chrome or Edge executable was not found.
pause

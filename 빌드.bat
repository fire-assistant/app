@echo off
chcp 65001 > nul
title Build APK

cd /d "%~dp0"

echo.
echo ================================
echo  APK Build Start
echo ================================
echo.

:: [가드] 원격 로드 구조 보호 — server.url 없으면 번들 빌드가 되어 APK가 ~283MB로 커지고
::        웹배포가 앱에 안 먹혀 재설치 지옥이 된다. 반드시 server.url 이 있어야 빌드 진행.
findstr /C:"github.io/fireapp" capacitor.config.json >nul
if errorlevel 1 (
    echo [ERROR] capacitor.config.json 에 server.url ^(github.io/fireapp^) 이 없습니다!
    echo         원격 로드 구조가 깨졌습니다. server.url 복구 후 다시 빌드하세요.
    echo         ^(번들 빌드는 APK ~283MB + 웹배포가 앱에 반영 안 됨^)
    pause
    exit /b 1
)
echo [OK] server.url 확인됨 ^(원격 로드 구조^)
echo.

set "NODE_PATH=C:\Program Files\nodejs"
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "ANDROID_HOME=C:\Users\Kyu\AppData\Local\Android\Sdk"
set "PATH=%NODE_PATH%;%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%PATH%"

if not exist "%NODE_PATH%\node.exe" (
    echo [ERROR] Node.js not found
    pause
    exit /b 1
)

if not exist "%JAVA_HOME%\bin\java.exe" (
    echo [ERROR] Java not found
    pause
    exit /b 1
)

if not exist "%ANDROID_HOME%\platform-tools\adb.exe" (
    echo [ERROR] Android SDK not found
    pause
    exit /b 1
)

echo Node  : %NODE_PATH%
echo Java  : %JAVA_HOME%
echo SDK   : %ANDROID_HOME%
echo.

if not exist "node_modules" (
    echo Installing packages...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed
        pause
        exit /b 1
    )
)

echo [1/4] Copying web files...
if not exist "www" mkdir www
copy /Y index.html  www\index.html  > nul
copy /Y styles.css  www\styles.css  > nul
copy /Y app.js      www\app.js      > nul
if exist ilgu.ico copy /Y ilgu.ico www\ilgu.ico > nul
echo       Done

echo [2/4] Generating icons...
call node make_icons.js
if %errorlevel% neq 0 (
    echo [ERROR] Icon generation failed
    pause
    exit /b 1
)

echo [3/4] Capacitor sync...
call npx cap sync android 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Capacitor sync failed
    pause
    exit /b 1
)
echo       Done

echo [4/4] Building APK...
cd android
call gradlew.bat assembleDebug 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] APK build failed
    cd ..
    pause
    exit /b 1
)
cd ..

copy /Y "android\app\build\outputs\apk\debug\app-debug.apk" "apk\apk.apk" > nul 2>&1
copy /Y "android\app\build\outputs\apk\debug\app-debug.apk" "����GPT.apk" > nul 2>&1

echo.
echo ================================
echo  Done!  -^> apk/apk.apk
echo ================================
echo.
pause
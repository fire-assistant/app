@echo off
title GitHub Download

echo.
echo ================================
echo  GitHub Download (supply-fireapp)
echo ================================
echo.
echo  [주의] 이 작업은 기존 파일을 덮어쓸 수 있습니다.
echo  계속하려면 '다운로드' 를 입력하세요.
echo.
set /p CONFIRM=입력: 
if not "%CONFIRM%"=="다운로드" (
    echo.
    echo [취소] 입력이 일치하지 않아 종료합니다.
    pause
    exit /b 0
)
echo.

set REPO_URL=https://github.com/carrotcakehope/supply-fireapp.git

if exist ".git" (
    echo [INFO] Already exists. Updating...
    git pull
) else (
    echo [INFO] Downloading...
    git clone "%REPO_URL%" .
)

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed - Check internet connection and git installation
    pause
    exit /b 1
)

echo.
echo ================================
echo  Done!
echo  https://github.com/carrotcakehope/supply-fireapp
echo ================================
echo.
pause

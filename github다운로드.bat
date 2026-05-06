@echo off
title GitHub Download

echo.
echo ================================
echo  GitHub Download (supply-fireapp)
echo ================================
echo.

set "REPO_URL=https://github.com/carrotcakehope/supply-fireapp.git"

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
echo  Done! Saved in %FOLDER_NAME% folder
echo  https://github.com/carrotcakehope/supply-fireapp
echo ================================
echo.
pause

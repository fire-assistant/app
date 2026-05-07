@echo off
title GitHub Upload

cd /d "%~dp0"

echo.
echo ================================
echo  GitHub Auto Upload (supply-fireapp)
echo ================================
echo.

if not exist .gitignore (
    echo node_modules/> .gitignore
    echo *.apk>> .gitignore
    echo .claude/>> .gitignore
)

if not exist .git (
    git init
    git branch -M main
)

git config user.name "carrotcakehope" > nul 2>&1
git config user.email "carrotcakehpe@gmail.com" > nul 2>&1

git remote add origin https://github.com/carrotcakehope/supply-fireapp.git 2>nul

echo [1/3] Checking changes...
git status --short
echo.

echo [2/3] Staging files...
git add -A

echo [3/3] Uploading to GitHub...
for /f "tokens=*" %%i in ('powershell -NoProfile -Command "Get-Date -Format 'yyyy-MM-dd HH:mm:ss'"') do set TIMESTAMP=%%i
git commit -m "upload: %TIMESTAMP%"
if %errorlevel% neq 0 (
    echo [INFO] No changes to upload.
    pause
    exit /b 0
)

git push origin main
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Push failed - check git login status
    pause
    exit /b 1
)

echo.
echo ================================
echo  Done! Uploaded to GitHub
echo  https://github.com/carrotcakehope/supply-fireapp
echo ================================
echo.
pause

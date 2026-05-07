@echo off
chcp 65001 > nul
title Web Deploy

cd /d "%~dp0"

echo.
echo ================================
echo  Web Deploy Start
echo ================================
echo.

:: Copy source files to docs/ and www/
echo [1/3] Copying files to docs/ and www/...
if not exist docs mkdir docs
if not exist www  mkdir www

copy /Y index.html   docs\index.html   > nul  &  copy /Y index.html   www\index.html   > nul
copy /Y styles.css   docs\styles.css   > nul  &  copy /Y styles.css   www\styles.css   > nul
copy /Y app.js       docs\app.js       > nul  &  copy /Y app.js       www\app.js       > nul
copy /Y manifest.json docs\manifest.json > nul &  copy /Y manifest.json www\manifest.json > nul
copy /Y sw.js        docs\sw.js        > nul  &  copy /Y sw.js        www\sw.js        > nul
if exist icon-192.png      copy /Y icon-192.png       docs\icon-192.png       > nul  &  copy /Y icon-192.png       www\icon-192.png       > nul
if exist icon-512.png      copy /Y icon-512.png       docs\icon-512.png       > nul  &  copy /Y icon-512.png       www\icon-512.png       > nul
if exist facilities.js     copy /Y facilities.js       docs\facilities.js      > nul  &  copy /Y facilities.js       www\facilities.js      > nul
if exist facilities-data.js copy /Y facilities-data.js docs\facilities-data.js > nul  &  copy /Y facilities-data.js www\facilities-data.js > nul
if exist pdf.min.js        copy /Y pdf.min.js          docs\pdf.min.js         > nul  &  copy /Y pdf.min.js          www\pdf.min.js         > nul
if exist pdf.worker.min.js copy /Y pdf.worker.min.js  docs\pdf.worker.min.js  > nul  &  copy /Y pdf.worker.min.js  www\pdf.worker.min.js  > nul
if exist report-guide.pdf  copy /Y report-guide.pdf   docs\report-guide.pdf   > nul  &  copy /Y report-guide.pdf   www\report-guide.pdf   > nul
if exist image xcopy /Y /E /I image docs\image > nul
if exist image xcopy /Y /E /I image www\image  > nul
if not exist .nojekyll     type nul > .nojekyll
if not exist docs\.nojekyll type nul > docs\.nojekyll
if not exist www\.nojekyll  type nul > www\.nojekyll
echo       Done

:: Bump service worker cache version
echo [2/3] Updating cache version...
powershell -NoProfile -Command "$f='sw.js'; $c=Get-Content $f -Raw; if($c -match 'fireapp-v(\d+)'){$n=[int]$matches[1]+1; $r='fireapp-v'+$n; $c=$c -replace 'fireapp-v\d+', $r; Set-Content $f $c -NoNewline; Write-Host (' sw.js -> ' + $r)}"
powershell -NoProfile -Command "$f='docs\sw.js'; $c=Get-Content $f -Raw; if($c -match 'fireapp-v(\d+)'){$n=[int]$matches[1]+1; $r='fireapp-v'+$n; $c=$c -replace 'fireapp-v\d+', $r; Set-Content $f $c -NoNewline; Write-Host (' docs\sw.js -> ' + $r)}"
powershell -NoProfile -Command "$f='www\sw.js'; if(Test-Path $f){$c=Get-Content $f -Raw; if($c -match 'fireapp-v(\d+)'){$n=[int]$matches[1]+1; $r='fireapp-v'+$n; $c=$c -replace 'fireapp-v\d+', $r; Set-Content $f $c -NoNewline; Write-Host (' www\sw.js -> ' + $r)}}"
echo       Done

:: Git commit and push
echo [3/3] Pushing to GitHub...

:: Git 사용자 정보 자동 설정
git config user.name "carrotcakehope" > nul 2>&1
git config user.email "carrotcakehpe@gmail.com" > nul 2>&1

:: fireapp remote 없으면 자동 추가
git remote get-url fireapp > nul 2>&1
if %errorlevel% neq 0 (
    git remote add fireapp https://github.com/carrotcakehope/fireapp.git
    echo  fireapp remote added
)

git fetch origin
git reset --soft origin/main
git add docs/
git add www/
git add sw.js
git add capacitor.config.json
git add index.html styles.css app.js manifest.json
if exist facilities.js     git add facilities.js
if exist facilities-data.js git add facilities-data.js
git commit -m "update: web deploy" --allow-empty
git push origin main
if %errorlevel% neq 0 (
    echo [ERROR] supply-fireapp push failed
    pause
    exit /b 1
)
git push fireapp main --force
if %errorlevel% neq 0 (
    echo [ERROR] fireapp push failed
    pause
    exit /b 1
)

echo.
echo ================================
echo  Done! Reflected in 1-2 min
echo  https://carrotcakehope.github.io/fireapp
echo ================================
echo.
pause
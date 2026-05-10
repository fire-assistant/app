@echo off
chcp 65001 > nul
cd /d "%~dp0"

echo [1/4] Bumping introVideoSeen version...
powershell -NoProfile -Command "$f='app.js'; $c=[System.IO.File]::ReadAllText($f); $m=[regex]::Match($c,'introVideoSeen_v(\d+)'); $v=[int]$m.Groups[1].Value; $n=$v+1; $c=$c -replace 'introVideoSeen_v\d+',('introVideoSeen_v'+$n); [System.IO.File]::WriteAllText((Resolve-Path $f).Path,$c); Write-Host ('  v'+$v+' to v'+$n)"
echo Done

echo [2/4] Copying files to docs/ and www/...
if not exist docs mkdir docs
if not exist www  mkdir www
copy /Y index.html    docs\index.html    > nul  &  copy /Y index.html    www\index.html    > nul
copy /Y styles.css    docs\styles.css    > nul  &  copy /Y styles.css    www\styles.css    > nul
copy /Y app.js        docs\app.js        > nul  &  copy /Y app.js        www\app.js        > nul
copy /Y manifest.json docs\manifest.json > nul  &  copy /Y manifest.json www\manifest.json > nul
copy /Y sw.js         docs\sw.js         > nul  &  copy /Y sw.js         www\sw.js         > nul
if exist facilities.js      copy /Y facilities.js      docs\facilities.js      > nul  &  copy /Y facilities.js      www\facilities.js      > nul
if exist facilities-data.js copy /Y facilities-data.js docs\facilities-data.js > nul  &  copy /Y facilities-data.js www\facilities-data.js > nul
if exist layout-learn.js    copy /Y layout-learn.js    docs\layout-learn.js    > nul  &  copy /Y layout-learn.js    www\layout-learn.js    > nul
if exist video xcopy /Y /E /I video docs\video > nul
if exist video xcopy /Y /E /I video www\video  > nul
echo Done

echo [3/4] Updating SW cache version...
powershell -NoProfile -Command "$f='sw.js'; $c=Get-Content $f -Raw; if($c -match 'fireapp-v(\d+)'){$n=[int]$matches[1]+1; $r='fireapp-v'+$n; $c=$c -replace 'fireapp-v\d+',$r; Set-Content $f $c -NoNewline; Write-Host ('  sw.js -> '+$r)}"
powershell -NoProfile -Command "$f='docs\sw.js'; $c=Get-Content $f -Raw; if($c -match 'fireapp-v(\d+)'){$n=[int]$matches[1]+1; $r='fireapp-v'+$n; $c=$c -replace 'fireapp-v\d+',$r; Set-Content $f $c -NoNewline; Write-Host ('  docs\sw.js -> '+$r)}"
powershell -NoProfile -Command "$f='www\sw.js'; if(Test-Path $f){$c=Get-Content $f -Raw; if($c -match 'fireapp-v(\d+)'){$n=[int]$matches[1]+1; $r='fireapp-v'+$n; $c=$c -replace 'fireapp-v\d+',$r; Set-Content $f $c -NoNewline; Write-Host ('  www\sw.js -> '+$r)}}"
echo Done

echo [4/4] Pushing to GitHub...
git config user.name "carrotcakehope" > nul 2>&1
git config user.email "carrotcakehpe@gmail.com" > nul 2>&1
git remote get-url fireapp > nul 2>&1
if %errorlevel% neq 0 (
    git remote add fireapp https://github.com/carrotcakehope/fireapp.git
)
git fetch origin
git reset --soft origin/main
git add docs/ www/ sw.js app.js index.html styles.css manifest.json
if exist facilities.js      git add facilities.js
if exist facilities-data.js git add facilities-data.js
if exist layout-learn.js    git add layout-learn.js
if exist video              git add video/
git commit -m "update: reset intro video for all users" --allow-empty
git push origin main
if %errorlevel% neq 0 ( echo [ERROR] push to supply-fireapp failed & pause & exit /b 1 )
git push fireapp main --force
if %errorlevel% neq 0 ( echo [ERROR] push to fireapp failed & pause & exit /b 1 )

echo.
echo ================================
echo  Done! Reflected in 1-2 min
echo  https://carrotcakehope.github.io/fireapp
echo ================================
echo.
pause

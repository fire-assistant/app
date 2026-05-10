@echo off
cd /d "%~dp0"

powershell -NoProfile -Command "$f='app.js'; $c=[System.IO.File]::ReadAllText($f); $m=[regex]::Match($c,'introVideoSeen_v(\d+)'); $v=[int]$m.Groups[1].Value; $n=$v+1; $c=$c -replace 'introVideoSeen_v\d+',('introVideoSeen_v'+$n); [System.IO.File]::WriteAllText((Resolve-Path $f).Path,$c); Write-Host ('v'+$v+' to v'+$n)"

git add app.js
git commit -m "update: reset intro video"
git push

echo Done! Video will replay for all visitors in 1-2 minutes.
pause

@echo off
cd /d "%~dp0"

powershell -NoProfile -Command "$f='app.js'; $c=[System.IO.File]::ReadAllText($f); $m=[regex]::Match($c,'introVideoSeen_v(\d+)'); $v=[int]$m.Groups[1].Value; $n=$v+1; $c=$c -replace 'introVideoSeen_v\d+',('introVideoSeen_v'+$n); [System.IO.File]::WriteAllText((Resolve-Path $f).Path,$c); Write-Host ('v'+$v+' to v'+$n+' 변경 완료')"

git add app.js
git commit -m "update: reset intro video for all users"
git push

echo.
echo 완료! 1~2분 후 모든 방문자에게 영상이 다시 재생됩니다.
pause

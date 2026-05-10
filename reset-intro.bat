@echo off
cd /d "%~dp0"

powershell -NoProfile -Command "$f='app.js'; $c=[System.IO.File]::ReadAllText($f); $m=[regex]::Match($c,'introVideoSeen_v(\d+)'); $v=[int]$m.Groups[1].Value; $n=$v+1; $c=$c -replace 'introVideoSeen_v\d+',('introVideoSeen_v'+$n); [System.IO.File]::WriteAllText((Resolve-Path $f).Path,$c); Write-Host ('v'+$v+' to v'+$n)"

call "%~dp0웹배포.bat"

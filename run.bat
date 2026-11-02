@echo off
:: @kiavashmax
setlocal EnableExtensions
cd /d "%~dp0"
set "PORT=8080"
where python >nul 2>&1 && goto :p
where py >nul 2>&1 && goto :py
where npx >nul 2>&1 && goto :npx
start "" "%~dp0index.html"
exit /b 0
:p
start "preview" cmd /k "python -m http.server %PORT%"
timeout /t 2 /nobreak >nul
start "" "http://localhost:%PORT%/"
exit /b 0
:py
start "preview" cmd /k "py -m http.server %PORT%"
timeout /t 2 /nobreak >nul
start "" "http://localhost:%PORT%/"
exit /b 0
:npx
start "preview" cmd /k "npx --yes serve -l %PORT% ."
timeout /t 6 /nobreak >nul
start "" "http://localhost:%PORT%/"
exit /b 0
@echo off
title Case Report Server
echo.
echo ============================================
echo   Starting Case Report...
echo   Do NOT close this window while viewing.
echo ============================================
echo.

set PORT=8080

:: Check if port is already in use
netstat -an | findstr ":%PORT% " >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Port %PORT% is already in use. Trying port 8081...
    set PORT=8081
)

:: Try Python 3 first
where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Starting server on http://localhost:%PORT%
    echo Waiting for server to start...
    start /b python -m http.server %PORT%
    timeout /t 2 /nobreak >nul
    start http://localhost:%PORT%/index.html
    echo.
    echo Server is running. Press Ctrl+C or close this window to stop.
    pause >nul
    goto :eof
)

:: Try Python via py launcher
where py >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Starting server on http://localhost:%PORT%
    echo Waiting for server to start...
    start /b py -3 -m http.server %PORT%
    timeout /t 2 /nobreak >nul
    start http://localhost:%PORT%/index.html
    echo.
    echo Server is running. Press Ctrl+C or close this window to stop.
    pause >nul
    goto :eof
)

echo.
echo ERROR: Python is not installed.
echo.
echo Options:
echo   1. Install Python from https://www.python.org/downloads/
echo   2. Open index.html directly with Firefox (it works without a server)
echo.
pause

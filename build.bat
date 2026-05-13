@echo off
title Build Report
echo.
echo Building self-contained report...
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0build.ps1" %*
echo.
pause

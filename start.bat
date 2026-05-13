@echo off
title Case Report Server
echo.
echo ============================================
echo   Starting Case Report...
echo   Do NOT close this window while viewing.
echo ============================================
echo.

set PORT=8080

:: Try Python 3 first
where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Starting server on http://localhost:%PORT%
    start http://localhost:%PORT%/index.html
    python -m http.server %PORT%
    goto :eof
)

:: Try Python via py launcher
where py >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Starting server on http://localhost:%PORT%
    start http://localhost:%PORT%/index.html
    py -3 -m http.server %PORT%
    goto :eof
)

:: Try PowerShell as fallback
echo Python not found. Using PowerShell...
echo Starting server on http://localhost:%PORT%
start http://localhost:%PORT%/index.html
powershell -ExecutionPolicy Bypass -Command "$listener = [System.Net.HttpListener]::new(); $listener.Prefixes.Add('http://localhost:%PORT%/'); $listener.Start(); Write-Host 'Server running on http://localhost:%PORT% - Press Ctrl+C to stop'; while ($listener.IsListening) { $ctx = $listener.GetContext(); $path = $ctx.Request.Url.LocalPath; if ($path -eq '/') { $path = '/index.html' }; $file = Join-Path (Get-Location) ($path -replace '/', '\'); if (Test-Path $file -PathType Leaf) { $bytes = [System.IO.File]::ReadAllBytes($file); $ext = [System.IO.Path]::GetExtension($file).ToLower(); $mime = @{'.html'='text/html';'.css'='text/css';'.js'='application/javascript';'.wasm'='application/wasm';'.json'='application/json';'.png'='image/png';'.jpg'='image/jpeg';'.svg'='image/svg+xml';'.sqlite'='application/octet-stream';'.db'='application/octet-stream'}; if ($mime.ContainsKey($ext)) { $ctx.Response.ContentType = $mime[$ext] } else { $ctx.Response.ContentType = 'application/octet-stream' }; $ctx.Response.ContentLength64 = $bytes.Length; $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length) } else { $ctx.Response.StatusCode = 404 }; $ctx.Response.Close() }"

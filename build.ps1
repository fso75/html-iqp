<#
.SYNOPSIS
  Build a self-contained report HTML file.

.DESCRIPTION
  Reads all JS, CSS, WASM, and SQLite files and produces a single HTML file
  that can be opened directly in any browser (double-click, no server needed).

.EXAMPLE
  .\build.ps1
  .\build.ps1 -SqlitePath "data\my_report.sqlite" -OutputPath "dist\my_report.html"
#>

param(
    [string]$SqlitePath = "data\report.sqlite",
    [string]$OutputPath = "dist\report.html"
)

$ErrorActionPreference = "Stop"

# Resolve all paths relative to the script's own directory
$root = $PSScriptRoot

function Resolve([string]$relativePath) {
    return Join-Path $root $relativePath
}

function FileToBase64([string]$relativePath) {
    $fullPath = Resolve $relativePath
    $bytes = [System.IO.File]::ReadAllBytes($fullPath)
    return [System.Convert]::ToBase64String($bytes)
}

function ReadText([string]$relativePath) {
    $fullPath = Resolve $relativePath
    return [System.IO.File]::ReadAllText($fullPath, [System.Text.Encoding]::UTF8)
}

function ImageToDataUri([string]$relativePath) {
    $fullPath = Resolve $relativePath
    $bytes = [System.IO.File]::ReadAllBytes($fullPath)
    $b64 = [System.Convert]::ToBase64String($bytes)
    $ext = [System.IO.Path]::GetExtension($fullPath).TrimStart('.').ToLower()
    $mime = switch ($ext) {
        'png'  { 'image/png' }
        'jpg'  { 'image/jpeg' }
        'jpeg' { 'image/jpeg' }
        'svg'  { 'image/svg+xml' }
        'gif'  { 'image/gif' }
        'ico'  { 'image/x-icon' }
        'webp' { 'image/webp' }
        default { 'image/png' }
    }
    return "data:$mime;base64,$b64"
}

# Resolve input/output paths relative to script root
$SqlitePath = Resolve $SqlitePath
$OutputPath = Resolve $OutputPath

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Building self-contained report..." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[build] Root:    $root"
Write-Host "[build] SQLite:  $SqlitePath"
Write-Host "[build] Output:  $OutputPath"
Write-Host ""

# Verify required files
$requiredFiles = @(
    "js\vendor\sql-wasm.js",
    "js\vendor\sql-wasm.wasm",
    "js\vendor\ag-grid-community.min.js",
    "js\vendor\chart.umd.min.js",
    "js\vendor\ol.js",
    "css\vendor\ol.css",
    "css\main.css",
    "css\dashboard.css",
    "js\db.js",
    "js\charts.js",
    "js\dashboard.js",
    "js\grids.js",
    "js\map.js",
    "js\app.js",
    "img\logo.png",
    "img\clientlogo.png"
)

$missing = $requiredFiles | Where-Object { -not (Test-Path (Resolve $_)) }
if ($missing) {
    Write-Host "[build] ERROR: Missing files:" -ForegroundColor Red
    $missing | ForEach-Object { Write-Host "         - $(Resolve $_)" -ForegroundColor Red }
    exit 1
}

if (-not (Test-Path $SqlitePath)) {
    Write-Host "[build] ERROR: SQLite file not found: $SqlitePath" -ForegroundColor Red
    exit 1
}

# Encode binary files
Write-Host "[build] Encoding logo..."
$logoDataUri = ImageToDataUri "img\logo.png"
Write-Host "         $($logoDataUri.Length.ToString('N0')) chars"

Write-Host "[build] Encoding client logo..."
$clientLogoDataUri = ImageToDataUri "img\clientlogo.png"
Write-Host "         $($clientLogoDataUri.Length.ToString('N0')) chars"

Write-Host "[build] Encoding WASM..."
$wasmB64 = FileToBase64 "js\vendor\sql-wasm.wasm"
Write-Host "         $($wasmB64.Length.ToString('N0')) chars"

Write-Host "[build] Encoding SQLite..."
$bytes = [System.IO.File]::ReadAllBytes($SqlitePath)
$sqliteB64 = [System.Convert]::ToBase64String($bytes)
Write-Host "         $($sqliteB64.Length.ToString('N0')) chars"

# Read all text assets
Write-Host "[build] Reading assets..."
$cssMain      = ReadText "css\main.css"
$cssDashboard = ReadText "css\dashboard.css"
$cssOl        = ReadText "css\vendor\ol.css"

$jsSqlWasm    = ReadText "js\vendor\sql-wasm.js"
$jsAgGrid     = ReadText "js\vendor\ag-grid-community.min.js"
$jsChartJs    = ReadText "js\vendor\chart.umd.min.js"
$jsOl         = ReadText "js\vendor\ol.js"

$jsDb         = ReadText "js\db.js"
$jsCharts     = ReadText "js\charts.js"
$jsDashboard  = ReadText "js\dashboard.js"
$jsGrids      = ReadText "js\grids.js"
$jsMap        = ReadText "js\map.js"
$jsApp        = ReadText "js\app.js"

# Build HTML
Write-Host "[build] Assembling HTML..."

$html = @"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Case Report</title>
  <style>
$cssOl
  </style>
  <style>
$cssMain
  </style>
  <style>
$cssDashboard
  </style>
</head>
<body>

  <!-- Loading overlay -->
  <div id="loader">
    <div class="loader-content">
      <div class="spinner"></div>
      <p>Loading report data&hellip;</p>
    </div>
  </div>

  <!-- Sidebar -->
  <aside class="sidebar" id="sidebar">
    <button class="sidebar-toggle" id="sidebar-toggle" title="Toggle menu">
      <span id="sidebar-toggle-icon">&#9776;</span>
    </button>

    <nav class="sidebar-nav" id="main-nav">
      <button data-tab="section-dashboard" class="active">
        <span class="nav-icon">&#9632;</span>
        <span class="nav-label">Dashboard</span>
      </button>
      <button data-tab="section-data">
        <span class="nav-icon">&#9776;</span>
        <span class="nav-label">Data</span>
      </button>
      <button data-tab="section-map">
        <span class="nav-icon">&#9873;</span>
        <span class="nav-label">Map</span>
      </button>
    </nav>

    <div class="sidebar-footer">
      <span class="theme-toggle-label" title="Light mode">&#9728;</span>
      <label class="theme-switch">
        <input type="checkbox" id="theme-checkbox">
        <span class="theme-slider"></span>
      </label>
      <span class="theme-toggle-label theme-label-text" title="Dark mode">&#9790;</span>
    </div>
  </aside>

  <!-- Header -->
  <header>
    <div class="header-top">
      <div class="branding">
        <img src="$logoDataUri" alt="Gladiator Forensics" class="branding-logo">
        <span class="branding-company">Gladiator Forensics</span>
      </div>

      <div class="case-title">
        <span class="case-title-label">Case Report</span>
        <span class="case-title-name" id="case-name">Loading&hellip;</span>
      </div>

      <div class="client-branding">
        <span class="client-name" id="client-name">Loading&hellip;</span>
        <img src="$clientLogoDataUri" alt="Client" class="client-logo" id="client-logo">
      </div>
    </div>
  </header>

  <main>
    <section id="section-dashboard" class="tab-content">
      <div class="kpi-row">
        <div class="kpi-card">
          <h3>Total Items</h3>
          <span id="kpi-total" class="kpi-value">&mdash;</span>
        </div>
        <div class="kpi-card">
          <h3>Open</h3>
          <span id="kpi-open" class="kpi-value">&mdash;</span>
        </div>
        <div class="kpi-card">
          <h3>Closed</h3>
          <span id="kpi-closed" class="kpi-value">&mdash;</span>
        </div>
        <div class="kpi-card">
          <h3>Total Amount</h3>
          <span id="kpi-amount" class="kpi-value">&mdash;</span>
        </div>
      </div>
      <div class="chart-row">
        <div class="chart-container">
          <h3>Status Distribution</h3>
          <canvas id="chart-status"></canvas>
        </div>
        <div class="chart-container">
          <h3>Timeline</h3>
          <canvas id="chart-timeline"></canvas>
        </div>
      </div>
    </section>

    <section id="section-data" class="tab-content" hidden>
      <h2>Case Items</h2>
      <div id="grid-cases" class="ag-theme-alpine" style="width:100%; height:600px;"></div>
    </section>

    <section id="section-map" class="tab-content" hidden>
      <h2>Locations</h2>
      <div id="map-container" style="width:100%; height:600px;"></div>
    </section>
  </main>

  <footer>
    <p>Report generated on <span id="report-date"></span></p>
  </footer>

  <script>
    window.__INLINE_WASM_BASE64 = "$wasmB64";
    window.__INLINE_SQLITE_BASE64 = "$sqliteB64";
  </script>

  <script>
$jsSqlWasm
  </script>
  <script>
$jsAgGrid
  </script>
  <script>
$jsChartJs
  </script>
  <script>
$jsOl
  </script>

  <script>
$jsDb
  </script>
  <script>
$jsCharts
  </script>
  <script>
$jsDashboard
  </script>
  <script>
$jsGrids
  </script>
  <script>
$jsMap
  </script>
  <script>
$jsApp
  </script>
</body>
</html>
"@

# Ensure output directory exists
$outDir = Split-Path -Parent $OutputPath
if ($outDir -and -not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

# Write output
[System.IO.File]::WriteAllText($OutputPath, $html, [System.Text.Encoding]::UTF8)

$sizeMB = (Get-Item $OutputPath).Length / 1MB
Write-Host ""
Write-Host "[build] Done! $OutputPath ($([math]::Round($sizeMB, 1)) MB)" -ForegroundColor Green
Write-Host "[build] Client just opens this file in any browser - no server needed." -ForegroundColor Green
Write-Host ""

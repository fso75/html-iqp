# Client Report

Offline HTML report that runs entirely in the browser - no server required.
The build script produces a **single self-contained HTML file** that works by double-clicking it.

## Stack

| Purpose | Library |
|---|---|
| SQLite in browser | [sql.js](https://github.com/sql-js/sql.js) (WebAssembly) |
| Data grid | [AG Grid Community](https://www.ag-grid.com/) (free) |
| Charts | [Chart.js](https://www.chartjs.org/) |
| Maps | [OpenLayers](https://openlayers.org/) |

## Quick Start

### 1. Setup (one-time)

```bash
git clone https://github.com/fso75/html-iqp.git
cd html-iqp
```

Download vendor libraries (see [SETUP.md](SETUP.md)).

### 2. Development

Use VS Code with the **Live Server** extension:
- Place your `report.sqlite` in `data/`
- Right-click `index.html` > **Open with Live Server**

### 3. Build for Distribution

```bash
python build.py --sqlite data/report.sqlite --output dist/report.html
```

This produces a **single HTML file** with everything embedded:
- All JavaScript libraries
- All CSS styles
- The WASM engine (base64)
- The SQLite data (base64)

The client receives **one file**. They double-click it. Done.

## Project Structure

```
index.html              Dev entry point (loads files via XHR)
build.py                Builds self-contained report.html
dist/                   Build output (git-ignored)
  report.html           Single-file report for distribution
css/
  main.css              Global styles
  dashboard.css         Dashboard-specific styles
  vendor/               Third-party CSS
js/
  app.js                Bootstrap & tab navigation
  db.js                 Database layer (auto-detects inline vs XHR mode)
  dashboard.js          KPI cards & summary charts
  grids.js              AG Grid configurations
  charts.js             Chart.js helpers
  map.js                OpenLayers map
  vendor/               Third-party JS & WASM
data/
  report.sqlite         SQLite database (dev)
start.bat               Launcher for dev (Windows)
start.sh                Launcher for dev (macOS/Linux)
```

## Expected Database Schema

```sql
CREATE TABLE case_items (
  id          INTEGER PRIMARY KEY,
  date        TEXT,        -- ISO 8601 (YYYY-MM-DD)
  status      TEXT,        -- 'open', 'closed', etc.
  category    TEXT,
  description TEXT,
  amount      REAL,
  latitude    REAL,        -- nullable
  longitude   REAL         -- nullable
);

-- Optional metadata
CREATE TABLE case_meta (
  case_name   TEXT,
  case_id     TEXT,
  generated   TEXT
);
```

## How It Works

`db.js` auto-detects which mode to use:

- **Inline mode** (distribution): If `window.__INLINE_WASM_BASE64` and `window.__INLINE_SQLITE_BASE64` exist, it decodes them from base64. No file loading, no server, works everywhere.
- **XHR mode** (development): Falls back to loading files via XMLHttpRequest. Requires a local server (Live Server or `start.bat`).

## Key Design Decisions

- **Single-file output** - client gets one `.html` file, no install, no server.
- **Dual-mode loading** - same codebase for dev (XHR) and distribution (inline).
- **SQL-first** - data aggregated via SQL before rendering charts.
- **Lazy tab init** - grids/maps initialised only when their tab is first shown.
- **Print-friendly** - `@media print` styles for PDF export.

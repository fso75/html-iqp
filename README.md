# Client Report

Offline HTML report that runs entirely in the browser - no server required.
Designed to be downloaded as a `.zip` and opened via `file://`.

## Stack

| Purpose | Library |
|---|---|
| SQLite in browser | [sql.js](https://github.com/sql-js/sql.js) (WebAssembly) |
| Data grid | [AG Grid Community](https://www.ag-grid.com/) (free) |
| Charts | [Chart.js](https://www.chartjs.org/) |
| Maps | [OpenLayers](https://openlayers.org/) |

## Project Structure

```
index.html              Main entry point
css/
  main.css              Global styles
  dashboard.css         Dashboard-specific styles
  vendor/               Third-party CSS (e.g. ol.css)
js/
  app.js                Bootstrap & tab navigation
  db.js                 Database access layer (sql.js + XHR)
  dashboard.js          KPI cards & summary charts
  grids.js              AG Grid configurations
  charts.js             Chart.js helpers
  map.js                OpenLayers map
  vendor/               Third-party JS & WASM (bundled for offline)
data/
  report.sqlite         SQLite database with case data
```

## Setup

See [SETUP.md](SETUP.md) for commands to download all vendor dependencies.

## Expected Database Schema

The report expects at minimum a `case_items` table:

```sql
CREATE TABLE case_items (
  id          INTEGER PRIMARY KEY,
  date        TEXT,        -- ISO 8601 format (YYYY-MM-DD)
  status      TEXT,        -- e.g. 'open', 'closed'
  category    TEXT,
  description TEXT,
  amount      REAL,
  latitude    REAL,        -- nullable, for map
  longitude   REAL         -- nullable, for map
);
```

Optionally, a `case_meta` table for report metadata:

```sql
CREATE TABLE case_meta (
  case_name   TEXT,
  case_id     TEXT,
  generated   TEXT         -- ISO 8601 datetime
);
```

## Usage

1. Download vendor libraries (see SETUP.md).
2. Put your `report.sqlite` file in the `data/` folder.
3. Open `index.html` in a browser.

## Key Design Decisions

- **100% offline** - all assets bundled, no CDN links.
- **`file://` compatible** - uses XHR and classic scripts (no ES modules, no `fetch()`).
- **SQL-first** - data is aggregated via SQL before rendering.
- **Lazy tab init** - grids and maps initialised only when their tab is first opened.
- **Print-friendly** - `@media print` styles included for PDF export.
# Vendor Library Setup

Run the following commands from the project root to download all vendor dependencies.

## Quick Setup (curl)

```bash
# sql.js
SQL_JS_VERSION="1.11.0"
curl -L -o js/vendor/sql-wasm.js "https://cdnjs.cloudflare.com/ajax/libs/sql.js/${SQL_JS_VERSION}/sql-wasm.js"
curl -L -o js/vendor/sql-wasm.wasm "https://cdnjs.cloudflare.com/ajax/libs/sql.js/${SQL_JS_VERSION}/sql-wasm.wasm"

# AG Grid Community
AG_GRID_VERSION="32.3.3"
curl -L -o js/vendor/ag-grid-community.min.js "https://cdn.jsdelivr.net/npm/ag-grid-community@${AG_GRID_VERSION}/dist/ag-grid-community.min.js"

# Chart.js
CHARTJS_VERSION="4.4.7"
curl -L -o js/vendor/chart.umd.min.js "https://cdn.jsdelivr.net/npm/chart.js@${CHARTJS_VERSION}/dist/chart.umd.min.js"

# OpenLayers
OL_VERSION="10.3.1"
curl -L -o js/vendor/ol.js "https://cdn.jsdelivr.net/npm/ol@${OL_VERSION}/dist/ol.js"
curl -L -o css/vendor/ol.css "https://cdn.jsdelivr.net/npm/ol@${OL_VERSION}/ol.css"
```

## Verify

After running the commands you should have:

```
js/vendor/
  sql-wasm.js
  sql-wasm.wasm
  ag-grid-community.min.js
  chart.umd.min.js
  ol.js

css/vendor/
  ol.css
```

Then open `index.html` in your browser.
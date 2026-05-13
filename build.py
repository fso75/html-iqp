#!/usr/bin/env python3
"""
build.py - Build a self-contained report HTML file.

Reads all JS, CSS, WASM, and SQLite files and produces a single HTML file
that can be opened directly in any browser (double-click, no server needed).

Usage:
    python build.py
    python build.py --sqlite data/my_report.sqlite --output my_report.html
"""

import argparse
import base64
import os
import sys


def read_file(path, mode='r'):
    """Read a file and return its contents."""
    with open(path, mode) as f:
        return f.read()


def file_to_base64(path):
    """Read a binary file and return base64-encoded string."""
    with open(path, 'rb') as f:
        return base64.b64encode(f.read()).decode('ascii')


def build_report(sqlite_path, output_path):
    """Build the self-contained HTML report."""

    print(f"[build] SQLite:  {sqlite_path}")
    print(f"[build] Output:  {output_path}")

    # Verify required files exist
    required_files = [
        'js/vendor/sql-wasm.js',
        'js/vendor/sql-wasm.wasm',
        'js/vendor/ag-grid-community.min.js',
        'js/vendor/chart.umd.min.js',
        'js/vendor/ol.js',
        'css/vendor/ol.css',
        'css/main.css',
        'css/dashboard.css',
        'js/db.js',
        'js/charts.js',
        'js/dashboard.js',
        'js/grids.js',
        'js/map.js',
        'js/app.js',
    ]

    missing = [f for f in required_files if not os.path.isfile(f)]
    if missing:
        print("[build] ERROR: Missing files:")
        for f in missing:
            print(f"         - {f}")
        sys.exit(1)

    if not os.path.isfile(sqlite_path):
        print(f"[build] ERROR: SQLite file not found: {sqlite_path}")
        sys.exit(1)

    # Encode binary files as base64
    print("[build] Encoding WASM...")
    wasm_b64 = file_to_base64('js/vendor/sql-wasm.wasm')
    print(f"         {len(wasm_b64):,} chars")

    print("[build] Encoding SQLite...")
    sqlite_b64 = file_to_base64(sqlite_path)
    print(f"         {len(sqlite_b64):,} chars")

    # Read all text assets
    print("[build] Reading assets...")
    css_main = read_file('css/main.css')
    css_dashboard = read_file('css/dashboard.css')
    css_ol = read_file('css/vendor/ol.css')

    js_sqlwasm = read_file('js/vendor/sql-wasm.js')
    js_aggrid = read_file('js/vendor/ag-grid-community.min.js')
    js_chartjs = read_file('js/vendor/chart.umd.min.js')
    js_ol = read_file('js/vendor/ol.js')

    js_db = read_file('js/db.js')
    js_charts = read_file('js/charts.js')
    js_dashboard = read_file('js/dashboard.js')
    js_grids = read_file('js/grids.js')
    js_map = read_file('js/map.js')
    js_app = read_file('js/app.js')

    # Build the HTML
    print("[build] Assembling HTML...")

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Case Report</title>
  <style>
{css_ol}
  </style>
  <style>
{css_main}
  </style>
  <style>
{css_dashboard}
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

  <header>
    <div class="header-inner">
      <h1>Case Report &mdash; <span id="case-name">Loading&hellip;</span></h1>
      <nav id="main-nav">
        <button data-tab="section-dashboard" class="active">Dashboard</button>
        <button data-tab="section-data">Data</button>
        <button data-tab="section-map">Map</button>
      </nav>
    </div>
  </header>

  <main>
    <!-- DASHBOARD -->
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

    <!-- DATA GRIDS -->
    <section id="section-data" class="tab-content" hidden>
      <h2>Case Items</h2>
      <div id="grid-cases" class="ag-theme-alpine" style="width:100%; height:600px;"></div>
    </section>

    <!-- MAP -->
    <section id="section-map" class="tab-content" hidden>
      <h2>Locations</h2>
      <div id="map-container" style="width:100%; height:600px;"></div>
    </section>
  </main>

  <footer>
    <p>Report generated on <span id="report-date"></span></p>
  </footer>

  <!-- Inline base64 data -->
  <script>
    window.__INLINE_WASM_BASE64 = "{wasm_b64}";
    window.__INLINE_SQLITE_BASE64 = "{sqlite_b64}";
  </script>

  <!-- Vendor libraries -->
  <script>
{js_sqlwasm}
  </script>
  <script>
{js_aggrid}
  </script>
  <script>
{js_chartjs}
  </script>
  <script>
{js_ol}
  </script>

  <!-- App modules -->
  <script>
{js_db}
  </script>
  <script>
{js_charts}
  </script>
  <script>
{js_dashboard}
  </script>
  <script>
{js_grids}
  </script>
  <script>
{js_map}
  </script>
  <script>
{js_app}
  </script>
</body>
</html>"""

    # Write output
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html)

    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"[build] Done! {output_path} ({size_mb:.1f} MB)")
    print(f"[build] Client just opens this file in any browser - no server needed.")


def main():
    parser = argparse.ArgumentParser(
        description='Build a self-contained HTML report file.'
    )
    parser.add_argument(
        '--sqlite',
        default='data/report.sqlite',
        help='Path to the SQLite database (default: data/report.sqlite)'
    )
    parser.add_argument(
        '--output', '-o',
        default='dist/report.html',
        help='Output HTML file path (default: dist/report.html)'
    )
    args = parser.parse_args()

    # Ensure output directory exists
    out_dir = os.path.dirname(args.output)
    if out_dir and not os.path.exists(out_dir):
        os.makedirs(out_dir)

    build_report(args.sqlite, args.output)


if __name__ == '__main__':
    main()

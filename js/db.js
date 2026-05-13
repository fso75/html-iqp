/**
 * Database Access Layer
 * Uses sql.js (WebAssembly) to read the SQLite file entirely client-side.
 *
 * Supports two modes:
 *   1. INLINE mode  - WASM and SQLite are embedded as base64 in the HTML (for distribution)
 *   2. XHR mode     - files loaded via XMLHttpRequest (for development with Live Server)
 *
 * The build script (build.py) sets window.__INLINE_WASM_BASE64 and window.__INLINE_SQLITE_BASE64.
 */
window.ReportApp = window.ReportApp || {};

ReportApp.db = (function () {
  'use strict';

  var _db = null;

  /**
   * Decode a base64 string to a Uint8Array.
   */
  function base64ToUint8Array(base64) {
    var raw = atob(base64);
    var arr = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) {
      arr[i] = raw.charCodeAt(i);
    }
    return arr;
  }

  /**
   * Load a file as an ArrayBuffer using XMLHttpRequest.
   * Works on file:// protocol in most browsers (except .wasm in Chrome).
   */
  function loadFileAsArrayBuffer(path) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', path, true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = function () {
        if (xhr.status === 0 || xhr.status === 200) {
          resolve(xhr.response);
        } else {
          reject(new Error('Failed to load ' + path + ' (status ' + xhr.status + ')'));
        }
      };
      xhr.onerror = function () {
        reject(new Error('Network error loading ' + path));
      };
      xhr.send();
    });
  }

  /**
   * Initialise the database.
   * Automatically detects inline mode vs XHR mode.
   */
  async function initDB(sqlitePath) {
    sqlitePath = sqlitePath || 'data/report.sqlite';

    var wasmBinary, sqliteData;
    var isInline = window.__INLINE_WASM_BASE64 && window.__INLINE_SQLITE_BASE64;

    if (isInline) {
      // INLINE MODE: decode base64 data embedded in the HTML
      console.log('[ReportApp] Using inline mode (base64 embedded data)');
      wasmBinary = base64ToUint8Array(window.__INLINE_WASM_BASE64).buffer;
      sqliteData = base64ToUint8Array(window.__INLINE_SQLITE_BASE64);
    } else {
      // XHR MODE: load files from disk (development)
      console.log('[ReportApp] Using XHR mode (loading files from disk)');
      wasmBinary = await loadFileAsArrayBuffer('js/vendor/sql-wasm.wasm');
      var sqliteBuffer = await loadFileAsArrayBuffer(sqlitePath);
      sqliteData = new Uint8Array(sqliteBuffer);
    }

    var SQL = await initSqlJs({ wasmBinary: wasmBinary });
    _db = new SQL.Database(sqliteData);

    return _db;
  }

  /**
   * Run a SQL query and return an array of row objects.
   */
  function query(sql, params) {
    params = params || [];
    var stmt = _db.prepare(sql);
    if (params.length) stmt.bind(params);
    var rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
  }

  /**
   * Run a SQL query and return the first row or null.
   */
  function queryOne(sql, params) {
    return query(sql, params)[0] || null;
  }

  /**
   * Return the raw database handle (for advanced usage).
   */
  function getDB() {
    return _db;
  }

  return {
    initDB: initDB,
    query: query,
    queryOne: queryOne,
    getDB: getDB
  };
})();

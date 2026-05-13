/**
 * Database Access Layer
 * Uses sql.js (WebAssembly) to read the SQLite file entirely client-side.
 * All file loading uses XMLHttpRequest for file:// compatibility.
 */
window.ReportApp = window.ReportApp || {};

ReportApp.db = (function () {
  'use strict';

  var _db = null;

  /**
   * Load a file as an ArrayBuffer using XMLHttpRequest.
   * Works on file:// protocol (fetch does NOT).
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
   * Loads the WASM binary manually so sql.js never calls fetch() internally.
   */
  async function initDB(sqlitePath) {
    sqlitePath = sqlitePath || 'data/report.sqlite';

    // Load WASM binary via XHR (file:// safe)
    var wasmBinary = await loadFileAsArrayBuffer('js/vendor/sql-wasm.wasm');

    var SQL = await initSqlJs({ wasmBinary: wasmBinary });

    var sqliteBuffer = await loadFileAsArrayBuffer(sqlitePath);
    _db = new SQL.Database(new Uint8Array(sqliteBuffer));

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
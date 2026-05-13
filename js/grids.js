/**
 * AG Grid configurations.
 * Uses AG Grid Community (free) with built-in row virtualisation.
 */
window.ReportApp = window.ReportApp || {};

ReportApp.grids = (function () {
  'use strict';

  var db = function () { return ReportApp.db; };
  var _gridApi = null;

  /**
   * Initialise the main case-items grid.
   */
  function initCaseGrid(containerEl) {
    if (!containerEl) return;

    var rowData = db().query('SELECT * FROM case_items ORDER BY date DESC');

    var gridOptions = {
      columnDefs: [
        { field: 'id',          headerName: 'ID',          width: 90, sortable: true, filter: true },
        { field: 'date',        headerName: 'Date',        width: 130, sortable: true, filter: true },
        { field: 'status',      headerName: 'Status',      width: 110, sortable: true, filter: true },
        { field: 'category',    headerName: 'Category',    width: 140, sortable: true, filter: true },
        { field: 'description', headerName: 'Description', flex: 1,   sortable: true, filter: true },
        { field: 'amount',      headerName: 'Amount',      width: 120, sortable: true, filter: 'agNumberColumnFilter',
          valueFormatter: function (params) {
            if (params.value == null) return '';
            return '$' + Number(params.value).toLocaleString();
          }
        },
        { field: 'latitude',    headerName: 'Lat',         width: 100, hide: true },
        { field: 'longitude',   headerName: 'Lon',         width: 100, hide: true }
      ],
      rowData: rowData,
      pagination: true,
      paginationPageSize: 100,
      paginationPageSizeSelector: [50, 100, 500, 1000],
      defaultColDef: {
        resizable: true
      },
      animateRows: true
    };

    _gridApi = agGrid.createGrid(containerEl, gridOptions);
  }

  // ------ Analysis grid ------
  function initAnalysisGrid(containerEl, analysisId) {
    if (!containerEl) return;
    // Get SQL from analysis table
    var analysis = db().queryOne('SELECT sql FROM call_analyses WHERE analysis_id=?', [analysisId]);
    if (!analysis || !analysis.sql) {
      containerEl.innerHTML = '<div style="color:red">Analysis SQL not found!</div>';
      return;
    }
    var rows = db().queryAll(analysis.sql);
    if (!rows || rows.length === 0) {
      containerEl.innerHTML = '<div>No data for this analysis.</div>';
      return;
    }
    var columnDefs = Object.keys(rows[0]).map(function (k) {
      return {
        headerName: k.replace(/_/g, ' ').replace(/\b\w/g, function (l) { return l.toUpperCase(); }),
        field: k,
        sortable: true,
        filter: true,
        resizable: true
      };
    });
    containerEl.innerHTML = '';
    var gridDiv = document.createElement('div');
    gridDiv.style.width = '100%';
    gridDiv.style.height = '100%';
    containerEl.appendChild(gridDiv);
    new agGrid.Grid(gridDiv, {
      columnDefs: columnDefs,
      rowData: rows,
      defaultColDef: { flex: 1 }
    });
  }

  function getGridApi() {
    return _gridApi;
  }

  return {
    initCaseGrid: initCaseGrid,
    initAnalysisGrid: initAnalysisGrid,
    getGridApi: getGridApi
  };
})();

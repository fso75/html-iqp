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

  function getGridApi() {
    return _gridApi;
  }

  return {
    initCaseGrid: initCaseGrid,
    getGridApi: getGridApi
  };
})();
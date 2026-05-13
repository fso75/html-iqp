/**
 * Dashboard - KPI cards and summary charts.
 * All data is aggregated via SQL before being passed to Chart.js.
 */
window.ReportApp = window.ReportApp || {};

ReportApp.dashboard = (function () {
  'use strict';

  var db = function () { return ReportApp.db; };
  var charts = function () { return ReportApp.charts; };

  function init() {
    renderKPIs();
    renderStatusChart();
    renderTimelineChart();
  }

  function renderKPIs() {
    var stats = db().queryOne(
      'SELECT ' +
      '  COUNT(*) AS total_items, ' +
      '  SUM(CASE WHEN status = \'open\' THEN 1 ELSE 0 END) AS open_count, ' +
      '  SUM(CASE WHEN status = \'closed\' THEN 1 ELSE 0 END) AS closed_count, ' +
      '  COALESCE(SUM(amount), 0) AS total_amount ' +
      'FROM case_items'
    );

    if (!stats) return;

    document.getElementById('kpi-total').textContent = Number(stats.total_items).toLocaleString();
    document.getElementById('kpi-open').textContent = Number(stats.open_count).toLocaleString();
    document.getElementById('kpi-closed').textContent = Number(stats.closed_count).toLocaleString();
    document.getElementById('kpi-amount').textContent = '$' + Number(stats.total_amount).toLocaleString();
  }

  function renderStatusChart() {
    var rows = db().query(
      'SELECT status, COUNT(*) AS cnt FROM case_items GROUP BY status ORDER BY cnt DESC'
    );
    if (!rows.length) return;

    charts().renderPieChart(
      'chart-status',
      rows.map(function (r) { return r.status; }),
      rows.map(function (r) { return r.cnt; })
    );
  }

  function renderTimelineChart() {
    var rows = db().query(
      'SELECT strftime(\'%Y-%m\', date) AS month, COUNT(*) AS cnt ' +
      'FROM case_items ' +
      'WHERE date IS NOT NULL ' +
      'GROUP BY month ORDER BY month'
    );
    if (!rows.length) return;

    charts().renderBarChart(
      'chart-timeline',
      rows.map(function (r) { return r.month; }),
      rows.map(function (r) { return r.cnt; }),
      { label: 'Items' }
    );
  }

  return { init: init };
})();
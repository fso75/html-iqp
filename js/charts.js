/**
 * Chart.js helpers
 * Thin wrappers for building the most common chart types.
 */
window.ReportApp = window.ReportApp || {};

ReportApp.charts = (function () {
  'use strict';

  var defaultColors = [
    '#1a73e8', '#e8710a', '#0d652d', '#c5221f',
    '#9334e6', '#185abc', '#e37400', '#137333',
    '#a50e0e', '#7627bb'
  ];

  /**
   * Render a pie / doughnut chart.
   */
  function renderPieChart(canvasId, labels, values, opts) {
    opts = opts || {};
    var ctx = document.getElementById(canvasId).getContext('2d');
    return new Chart(ctx, {
      type: opts.doughnut ? 'doughnut' : 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: opts.colors || defaultColors.slice(0, labels.length)
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right' }
        }
      }
    });
  }

  /**
   * Render a bar chart.
   */
  function renderBarChart(canvasId, labels, values, opts) {
    opts = opts || {};
    var ctx = document.getElementById(canvasId).getContext('2d');
    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: opts.label || 'Count',
          data: values,
          backgroundColor: opts.color || defaultColors[0]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  /**
   * Render a line chart.
   */
  function renderLineChart(canvasId, labels, values, opts) {
    opts = opts || {};
    var ctx = document.getElementById(canvasId).getContext('2d');
    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: opts.label || 'Value',
          data: values,
          borderColor: opts.color || defaultColors[0],
          backgroundColor: (opts.color || defaultColors[0]) + '20',
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  return {
    renderPieChart: renderPieChart,
    renderBarChart: renderBarChart,
    renderLineChart: renderLineChart
  };
})();
/**
 * Application bootstrap and tab navigation.
 */
window.ReportApp = window.ReportApp || {};

ReportApp.init = async function () {
  'use strict';

  var loader = document.getElementById('loader');
  var tabsInitialised = {};

  try {
    // 1. Load the database
    await ReportApp.db.initDB('data/report.db');

    // 2. Set report metadata
    var meta = ReportApp.db.queryOne(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='case_meta'"
    );
    if (meta) {
      var caseMeta = ReportApp.db.queryOne('SELECT * FROM case_meta LIMIT 1');
      if (caseMeta && caseMeta.case_name) {
        document.getElementById('case-name').textContent = caseMeta.case_name;
        document.title = 'Report - ' + caseMeta.case_name;
      }
    }

    // 3. Init the default tab (dashboard)
    ReportApp.dashboard.init();
    tabsInitialised['section-dashboard'] = true;

    // 4. Set report date
    document.getElementById('report-date').textContent = new Date().toLocaleDateString();

    // 5. Hide loader
    loader.style.display = 'none';

    // 6. Tab navigation with lazy initialisation
    var buttons = document.querySelectorAll('[data-tab]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function () {
        var targetId = this.dataset.tab;

        // Hide all sections
        var sections = document.querySelectorAll('.tab-content');
        for (var j = 0; j < sections.length; j++) sections[j].hidden = true;

        // Show target
        document.getElementById(targetId).hidden = false;

        // Update active button
        var allBtns = document.querySelectorAll('[data-tab]');
        for (var k = 0; k < allBtns.length; k++) allBtns[k].classList.remove('active');
        this.classList.add('active');

        // Lazy init
        if (!tabsInitialised[targetId]) {
          tabsInitialised[targetId] = true;
          if (targetId === 'section-data') {
            ReportApp.grids.initCaseGrid(document.getElementById('grid-cases'));
          } else if (targetId === 'section-map') {
            ReportApp.map.init('map-container');
          }
        }

        // OpenLayers needs a size recalc when its container becomes visible
        if (targetId === 'section-map' && ReportApp.map.getMap()) {
          ReportApp.map.getMap().updateSize();
        }
      });
    }

  } catch (err) {
    loader.querySelector('p').textContent = 'Error loading report: ' + err.message;
    loader.querySelector('.spinner').style.display = 'none';
    console.error(err);
  }
};

document.addEventListener('DOMContentLoaded', function () {
  ReportApp.init();
});
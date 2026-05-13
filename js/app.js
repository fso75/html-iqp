/**
 * Application bootstrap, tab navigation, sidebar, and theme switching.
 */
window.ReportApp = window.ReportApp || {};

ReportApp.init = async function () {
  'use strict';

  var loader = document.getElementById('loader');
  var tabsInitialised = {};

  // ===== Theme Toggle =====
  var themeCheckbox = document.getElementById('theme-checkbox');
  var savedTheme = localStorage.getItem('report-theme');

  function applyTheme(dark) {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    themeCheckbox.checked = dark;
    try { localStorage.setItem('report-theme', dark ? 'dark' : 'light'); } catch(e) {}
  }

  if (savedTheme) {
    applyTheme(savedTheme === 'dark');
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    applyTheme(true);
  } else {
    applyTheme(false);
  }

  themeCheckbox.addEventListener('change', function () {
    applyTheme(this.checked);
  });

  // ===== Sidebar Toggle =====
  var sidebar = document.getElementById('sidebar');
  var sidebarToggle = document.getElementById('sidebar-toggle');
  var toggleIcon = document.getElementById('sidebar-toggle-icon');
  var savedSidebar = localStorage.getItem('report-sidebar');

  function setSidebarState(collapsed) {
    if (collapsed) {
      sidebar.classList.add('collapsed');
      document.body.classList.add('sidebar-collapsed-state');
      toggleIcon.innerHTML = '&#9776;';
    } else {
      sidebar.classList.remove('collapsed');
      document.body.classList.remove('sidebar-collapsed-state');
      toggleIcon.innerHTML = '&#10005;';
    }
    try { localStorage.setItem('report-sidebar', collapsed ? 'collapsed' : 'expanded'); } catch(e) {}

    setTimeout(function () {
      if (ReportApp.map && ReportApp.map.getMap()) {
        ReportApp.map.getMap().updateSize();
      }
    }, 350);
  }

  setSidebarState(savedSidebar === 'collapsed');

  sidebarToggle.addEventListener('click', function () {
    setSidebarState(!sidebar.classList.contains('collapsed'));
  });

  try {
    // 1. Load the database
    await ReportApp.db.initDB('data/report.db');

    // 2. Set report metadata
    var meta = ReportApp.db.queryOne(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='case_meta'"
    );
    if (meta) {
      var caseMeta = ReportApp.db.queryOne('SELECT * FROM case_meta LIMIT 1');
      if (caseMeta) {
        if (caseMeta.case_name) {
          document.getElementById('case-name').textContent = caseMeta.case_name;
          document.title = 'Report - ' + caseMeta.case_name;
        }
        if (caseMeta.customer_name) {
          document.getElementById('client-name').textContent = caseMeta.customer_name;
        } else {
          document.getElementById('client-name').textContent = '';
        }
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

        var sections = document.querySelectorAll('.tab-content');
        for (var j = 0; j < sections.length; j++) sections[j].hidden = true;

        document.getElementById(targetId).hidden = false;

        var allBtns = document.querySelectorAll('[data-tab]');
        for (var k = 0; k < allBtns.length; k++) allBtns[k].classList.remove('active');
        this.classList.add('active');

        if (!tabsInitialised[targetId]) {
          tabsInitialised[targetId] = true;
          if (targetId === 'section-data') {
            ReportApp.grids.initCaseGrid(document.getElementById('grid-cases'));
          } else if (targetId === 'section-map') {
            ReportApp.map.init('map-container');
          } else if (targetId === 'section-analysis') {
              ReportApp.analysis && ReportApp.analysis.init();
          }
        }

        if (targetId === 'section-map' && ReportApp.map.getMap()) {
          ReportApp.map.getMap().updateSize();
        }
      });
    }

      // Initialize the analysis module in ReportApp namespace
      ReportApp.analysis = {
          async init() {
              // Get all analyses from DB and populate the dropdown
              const analyses = ReportApp.db.queryAll('SELECT analysis_id, analysis_name FROM call_analyses');
              const select = document.getElementById('analysis-select');
              select.innerHTML = '';
              analyses.forEach(anl =>
                  select.innerHTML += `<option value="${anl.analysis_id}">${anl.analysis_name}</option>`
              );
              // Load grid for the first analysis by default, if present
              if (analyses.length > 0) {
                  ReportApp.grids.initAnalysisGrid(document.getElementById('analysis-grid'), analyses[0].analysis_id);
              }
              // Event to change grid on selection
              select.onchange = function () {
                  ReportApp.grids.initAnalysisGrid(document.getElementById('analysis-grid'), this.value);
              };
          }
      };

  } catch (err) {
    loader.querySelector('p').textContent = 'Error loading report: ' + err.message;
    loader.querySelector('.spinner').style.display = 'none';
    console.error(err);
  }
};

document.addEventListener('DOMContentLoaded', function () {
  ReportApp.init();
});

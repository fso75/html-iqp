/**
 * OpenLayers map - plots case items that have lat/lon data.
 */
window.ReportApp = window.ReportApp || {};

ReportApp.map = (function () {
  'use strict';

  var db = function () { return ReportApp.db; };
  var _map = null;

  function init(containerId) {
    var rows = db().query(
      'SELECT id, description, latitude, longitude ' +
      'FROM case_items ' +
      'WHERE latitude IS NOT NULL AND longitude IS NOT NULL'
    );

    var features = rows.map(function (row) {
      return new ol.Feature({
        geometry: new ol.geom.Point(
          ol.proj.fromLonLat([Number(row.longitude), Number(row.latitude)])
        ),
        name: row.description || 'Item #' + row.id,
        itemId: row.id
      });
    });

    var vectorSource = new ol.source.Vector({ features: features });

    var clusterSource = new ol.source.Cluster({
      distance: 40,
      source: vectorSource
    });

    var clusterStyle = function (feature) {
      var size = feature.get('features').length;
      return new ol.style.Style({
        image: new ol.style.Circle({
          radius: size > 1 ? 14 : 8,
          fill: new ol.style.Fill({ color: size > 1 ? '#1a73e8' : '#e8710a' }),
          stroke: new ol.style.Stroke({ color: '#fff', width: 2 })
        }),
        text: size > 1 ? new ol.style.Text({
          text: size.toString(),
          fill: new ol.style.Fill({ color: '#fff' }),
          font: 'bold 12px sans-serif'
        }) : undefined
      });
    };

    var clusterLayer = new ol.layer.Vector({
      source: clusterSource,
      style: clusterStyle
    });

    _map = new ol.Map({
      target: containerId,
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM()
        }),
        clusterLayer
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([0, 20]),
        zoom: 2
      })
    });

    // Fit view to data extent
    if (features.length) {
      _map.getView().fit(vectorSource.getExtent(), {
        padding: [50, 50, 50, 50],
        maxZoom: 15
      });
    }

    // Popup on click
    var popupEl = document.createElement('div');
    popupEl.className = 'ol-popup';
    var popup = new ol.Overlay({
      element: popupEl,
      positioning: 'bottom-center',
      offset: [0, -15],
      autoPan: true
    });
    _map.addOverlay(popup);

    _map.on('click', function (evt) {
      var feature = _map.forEachFeatureAtPixel(evt.pixel, function (f) { return f; });
      if (!feature) {
        popup.setPosition(undefined);
        return;
      }
      var items = feature.get('features');
      var html = items.slice(0, 10).map(function (f) {
        return '<div class="popup-item">' + (f.get('name') || 'Item') + '</div>';
      }).join('');
      if (items.length > 10) {
        html += '<div class="popup-item">... and ' + (items.length - 10) + ' more</div>';
      }
      popupEl.innerHTML = html;
      popup.setPosition(evt.coordinate);
    });
  }

  function getMap() {
    return _map;
  }

  return { init: init, getMap: getMap };
})();
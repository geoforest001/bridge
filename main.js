const fallbackLocation = [35.8294, 137.9536]; // 伊那市
const fallbackZoom = 13;
const currentLocationZoom = 15;
const gsiAttribution =
  '<a href="https://maps.gsi.go.jp/development/ichiran.html">地理院タイル</a>';

const map = L.map("map", {
  zoomControl: true
}).setView(fallbackLocation, fallbackZoom);

const gsiStandard = L.tileLayer(
  "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
  {
    attribution: gsiAttribution,
    maxZoom: 18,
    className: "grayscale-layer bm-multiply"
  }
);

const gsiAirPhoto = L.tileLayer(
  "https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg",
  {
    attribution: gsiAttribution,
    maxZoom: 18,
    className: "bm-multiply"
  }
);

const naganoCsMap = L.tileLayer(
  "https://tile.geospatial.jp/CS/VER2/{z}/{x}/{y}.png",
  {
    attribution:
      '<a href="https://www.geospatial.jp/ckan/dataset/nagano-csmap">長野県CS立体図</a>',
    maxZoom: 18,
    className: "bm-multiply"
  }
);

const ishikawaCsMap = L.tileLayer(
  "https://www2.ffpri.go.jp/soilmap/tile/cs_noto/{z}/{x}/{y}.png",
  {
    attribution: '森林総合研究所 石川県CS立体図',
    maxZoom: 18,
    className: "bm-multiply"
  }
);

gsiStandard.addTo(map);
gsiAirPhoto.addTo(map); gsiAirPhoto.setOpacity(0);
naganoCsMap.addTo(map); naganoCsMap.setOpacity(0);
ishikawaCsMap.addTo(map); ishikawaCsMap.setOpacity(0);

const MORIDO_URL = "https://geoforest001.github.io/bridge_data/data/morido.pmtiles";

const moridoTiles = protomapsL.leafletLayer({
  url: MORIDO_URL,
  attribution: '© ジオ・フォレスト',
  maxDataZoom: 16,
  paintRules: [
    {
      dataLayer: "morido",
      symbolizer: new protomapsL.PolygonSymbolizer({
        fill: "rgba(255,245,60,0.75)",
        stroke: "rgb(200,170,0)",
        width: 1
      })
    }
  ],
  labelRules: []
});
moridoTiles.addTo(map);

/* attribution: OSMを除去してジオ・フォレストに統一 */
map.on('layeradd layerremove', () => {
  const ctrl = map.attributionControl;
  if (ctrl) {
    const el = ctrl.getContainer();
    if (el) el.innerHTML = el.innerHTML
      .replace(/©?\s*<a[^>]*openstreetmap[^>]*>OpenStreetMap<\/a>\s*(contributors)?[,\s]*/gi, '')
      .replace(/©?\s*<a[^>]*protomaps[^>]*>Protomaps<\/a>\s*[,\s]*/gi, '');
  }
});

const NOTO_MORIDO_URL = "https://geoforest001.github.io/bridge_data/data/noto_morido.pmtiles";

const notoMoridoTiles = protomapsL.leafletLayer({
  url: NOTO_MORIDO_URL,
  attribution: '© ジオ・フォレスト',
  maxDataZoom: 16,
  paintRules: [
    {
      dataLayer: "noto_morido",
      symbolizer: new protomapsL.PolygonSymbolizer({
        fill: "rgba(255,245,60,0.75)",
        stroke: "rgb(200,170,0)",
        width: 1
      })
    }
  ],
  labelRules: []
});
notoMoridoTiles.addTo(map);

const D8_5M_URL = "https://geoforest001.github.io/bridge_data/data/d8_5m.pmtiles";

const d8_5mTiles = protomapsL.leafletLayer({
  url: D8_5M_URL,
  attribution: '© ジオ・フォレスト',
  maxDataZoom: 16,
  paintRules: [
    {
      dataLayer: "d8_5m",
      symbolizer: new protomapsL.LineSymbolizer({
        color: "#29B6F6",
        width: 1.5
      })
    }
  ],
  labelRules: []
});
d8_5mTiles.addTo(map);

/* ─── 森林計画図（上伊那地域）─────────────────── */
const RINPAN_URL   = "https://geoforest001.github.io/bridge_data/data/rinpan.pmtiles";
const SHOHAN_URL   = "https://geoforest001.github.io/bridge_data/data/shohan.pmtiles";
const SEGYOHAN_URL = "https://geoforest001.github.io/bridge_data/data/segyohan.pmtiles";

const rinpanTiles = protomapsL.leafletLayer({
  url: RINPAN_URL,
  attribution: '© 林野庁',
  maxDataZoom: 14,
  paintRules: [
    {
      dataLayer: "rinpan",
      symbolizer: new protomapsL.PolygonSymbolizer({
        fill: "rgba(46,125,50,0.08)",
        stroke: "#2E7D32",
        width: 2.5
      })
    }
  ],
  labelRules: []
});

const shohanTiles = protomapsL.leafletLayer({
  url: SHOHAN_URL,
  attribution: '© 林野庁',
  maxDataZoom: 14,
  paintRules: [
    {
      dataLayer: "shohan",
      symbolizer: new protomapsL.PolygonSymbolizer({
        fill: "rgba(21,101,192,0.06)",
        stroke: "#1565C0",
        width: 1.5
      })
    }
  ],
  labelRules: []
});

const segyohanTiles = protomapsL.leafletLayer({
  url: SEGYOHAN_URL,
  attribution: '© 林野庁',
  maxDataZoom: 14,
  paintRules: [
    {
      dataLayer: "segyohan",
      symbolizer: new protomapsL.PolygonSymbolizer({
        fill: "rgba(198,40,40,0.05)",
        stroke: "#C62828",
        width: 0.8
      })
    }
  ],
  labelRules: []
});

/* 施業班クリックで属性ポップアップ */
map.on('click', function(e) {
  if (!map.hasLayer(segyohanTiles)) return;
  if (map.getZoom() < 11) return;
  const results = segyohanTiles.queryTileFeaturesDebug(e.latlng.lng, e.latlng.lat, 5);
  const features = results && results.get('segyohan');
  if (!features || features.length === 0) return;
  const p = features[0].feature.props;
  const html =
    '<b>施業班情報</b><br>' +
    '林班: ' + (p.RIN || '--') + '<br>' +
    '小班: ' + (p.SHO || '--') + '<br>' +
    '施業班: ' + (p.SEGYO || '--') + '<br>' +
    '枝番: ' + (p.EDA || '--') + '<br>' +
    '承認: ' + (p.SHONIN || '--');
  L.popup().setLatLng(e.latlng).setContent(html).openOn(map);
});

const baseLayers = {};

const overlays = {
  "伊那谷盛り土": moridoTiles,
  "能登盛り土": notoMoridoTiles,
  "流向ライン5m": d8_5mTiles,
  "林班（上伊那）": rinpanTiles,
  "小班（上伊那）": shohanTiles,
  "施業班（上伊那）": segyohanTiles
};

let layerControl;

function renderLayerControl() {
  if (layerControl) {
    map.removeControl(layerControl);
  }

  layerControl = L.control.layers(baseLayers, overlays, {
    position: "topright",
    collapsed: false
  });

  layerControl.addTo(map);
}

renderLayerControl();

/* ─── スケール・ズームレベル ─────────────────── */
L.control.scale({ metric: true, imperial: false, position: 'bottomleft' }).addTo(map);

const ZoomDisplay = L.Control.extend({
  options: { position: 'bottomleft' },
  onAdd: function(m) {
    const el = L.DomUtil.create('div', 'leaflet-control zoom-display');
    el.style.cssText = 'padding:3px 8px;background:rgba(255,255,255,0.9);border:2px solid rgba(0,0,0,0.2);border-radius:4px;font-size:13px;font-weight:700;color:#333;line-height:1.5;pointer-events:none;';
    const update = function() { el.textContent = 'Z ' + m.getZoom(); };
    update();
    m.on('zoomend', update);
    return el;
  }
});
new ZoomDisplay().addTo(map);

/* ─── 現在地ボタン ─────────────────────────────── */
  let currentLocationMarker = null;

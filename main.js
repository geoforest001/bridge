const fallbackLocation = [35.8294, 137.9536]; // 伊那市
const fallbackZoom = 13;
const currentLocationZoom = 15;
const gsiAttribution =
  '<a href="https://maps.gsi.go.jp/development/ichiran.html">地理院タイル</a>';

const map = L.map("map", {
  zoomControl: true,
  maxZoom: 20
}).setView(fallbackLocation, fallbackZoom);

const gsiStandard = L.tileLayer(
  "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
  {
    attribution: gsiAttribution,
    maxNativeZoom: 18, maxZoom: 20,
    className: "grayscale-layer bm-multiply"
  }
);

const gsiAirPhoto = L.tileLayer(
  "https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg",
  {
    attribution: gsiAttribution,
    maxNativeZoom: 18, maxZoom: 20,
    className: "bm-multiply"
  }
);

const naganoCsMap = L.tileLayer(
  "https://tile.geospatial.jp/CS/VER2/{z}/{x}/{y}.png",
  {
    attribution:
      '<a href="https://www.geospatial.jp/ckan/dataset/nagano-csmap">長野県CS立体図</a>',
    maxNativeZoom: 18, maxZoom: 20,
    className: "bm-multiply"
  }
);

const ishikawaCsMap = L.tileLayer(
  "https://www2.ffpri.go.jp/soilmap/tile/cs_noto/{z}/{x}/{y}.png",
  {
    attribution: '森林総合研究所 石川県CS立体図',
    maxNativeZoom: 18, maxZoom: 20,
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
        width: 3.5
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
        width: 0.6
      })
    }
  ],
  labelRules: []
});

/* ─── 施業班ハイライト + ポップアップ ─────────── */
var segyoHighlight = L.layerGroup().addTo(map);

function querySegyohan(lng, lat, zoom) {
  var picked = null;
  if (typeof segyohanTiles.queryTileFeaturesDebug === 'function') {
    var r = segyohanTiles.queryTileFeaturesDebug(lng, lat, 16);
    if (r instanceof Map) r.forEach(function(f) { if (!picked && f && f.length) picked = f[0]; });
  }
  if (!picked && segyohanTiles.views) {
    segyohanTiles.views.forEach(function(view) {
      if (picked || typeof view.queryFeatures !== 'function') return;
      var f = view.queryFeatures(lng, lat, zoom, 16);
      if (f && f.length) picked = f[0];
    });
  }
  return picked;
}

function drawHighlight(e, geom) {
  segyoHighlight.clearLayers();
  if (!geom || !geom.length) return;

  // protomapsはlevelDiff=1デフォルト: データタイルはdisplayZoom-1
  // TileCache.tileSize = 256 * 2^levelDiff = 512
  var displayZoom = map.getZoom();
  var dataZoom  = Math.min(Math.round(displayZoom) - 1, 14);
  var dataScale = Math.pow(2, dataZoom);
  var ts = 512;  // 256 << levelDiff(1)

  var lng = e.latlng.lng, lat = e.latlng.lat;
  var mx = (lng + 180) / 360;
  var my = 0.5 - Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)) / (2 * Math.PI);
  var tx = Math.floor(mx * dataScale);
  var ty = Math.floor(my * dataScale);

  function px2ll(px, py) {
    var mx2 = (tx + px / ts) / dataScale;
    var my2 = (ty + py / ts) / dataScale;
    return [Math.atan(Math.sinh(Math.PI * (1 - 2 * my2))) * 180 / Math.PI, mx2 * 360 - 180];
  }

  var rings = [];
  for (var ri = 0; ri < geom.length; ri++) {
    var ring = geom[ri], pts = [];
    for (var i = 0; i < ring.length; i++) {
      var pt = ring[i];
      pts.push(px2ll(pt.x, pt.y));
    }
    if (pts.length >= 3) rings.push(pts);
  }
  if (rings.length) {
    L.polygon(rings, {
      color: '#FF6600', weight: 2.5,
      fillColor: '#FF8800', fillOpacity: 0.35,
      interactive: false
    }).addTo(segyoHighlight);
  }
}

var IROHA = {
  A:'い', B:'ろ', C:'は', D:'に', E:'ほ', F:'へ', G:'と', H:'ち', I:'り',
  J:'ぬ', K:'る', L:'を', M:'わ', N:'か', O:'よ', P:'た', Q:'れ', R:'そ',
  S:'つ', T:'ね', U:'な', V:'ら', W:'む', X:'う', Y:'ゐ', Z:'の'
};
function shoLabel(v) {
  var s = String(v).trim().toUpperCase();
  return IROHA[s] || v;
}

map.on('click', function(e) {
  segyoHighlight.clearLayers();
  var zoom = map.getZoom();

  // 立木クリック判定（施業班より優先）
  if (map.hasLayer(tachikiTiles) && zoom >= 13) {
    var pt = null;
    if (tachikiTiles.views) {
      tachikiTiles.views.forEach(function(view) {
        if (pt || typeof view.queryFeatures !== 'function') return;
        var r = view.queryFeatures(e.latlng.lng, e.latlng.lat, zoom, 17);
        if (r && r.length) pt = r[0];
      });
    }
    if (pt) {
      var p = (pt.feature || pt).props || {};
      if (p.SP) {
        L.popup().setLatLng(e.latlng).setContent(
          '<b>立木情報</b><br>樹種: ' + p.SP + '<br>樹高: ' + p.H + 'm'
        ).openOn(map);
        return;
      }
    }
  }

  // 施業班クリック判定
  if (!map.hasLayer(segyohanTiles) || zoom < 11) return;
  var picked = querySegyohan(e.latlng.lng, e.latlng.lat, zoom);
  if (!picked) return;

  drawHighlight(e, picked.feature && picked.feature.geom);

  var p2 = (picked.feature || picked).props || {};
  var rows = [
    ['林班',  p2.RIN],
    ['小班',  shoLabel(p2.SHO)],
    ['施業班', p2.SEGYO],
    ['枝番',  p2.EDA],
    ['樹種',  p2.JUSHU]
  ].filter(function(r) {
    var v = String(r[1] != null ? r[1] : '');
    return v !== '' && !/^0+$/.test(v);
  }).map(function(r) {
    return [r[0], String(r[1]).replace(/^0+(\d)/, '$1')];
  });
  L.popup().setLatLng(e.latlng).setContent(
    '<b>施業班情報</b><br>' +
    rows.map(function(r) { return r[0] + ': ' + r[1]; }).join('<br>')
  ).openOn(map);
});

map.on('popupclose', function() { segyoHighlight.clearLayers(); });

/* ─── 施業区域内立木（15m以上）─────────────────── */
var TACHIKI_SP_COLOR = {
  'アカマツ': '#F00E0E',
  'カラマツ': '#6BA825',
  'スギ':     '#1509F3',
  'ヒノキ':   '#33A02C'
};

// 高さ(m)→半径px: scale_polynomial(H, 10, 35, 0.1, 1, 0.57) を4段階で近似
var TACHIKI_H_BINS = [
  [30, 7.5],
  [25, 5.5],
  [20, 4.0],
  [15, 2.8]
];

(function() {
  var rules = [];
  Object.entries(TACHIKI_SP_COLOR).forEach(function(sp_color) {
    var sp = sp_color[0], fill = sp_color[1];
    TACHIKI_H_BINS.forEach(function(bin) {
      var hMin = bin[0], r = bin[1];
      rules.push({
        dataLayer: "tachiki",
        filter: function(hMin) {
          return function(z, f) { return f.props.SP === sp && f.props.H >= hMin; };
        }(hMin),
        symbolizer: new protomapsL.CircleSymbolizer({
          radius: r, fill: fill, stroke: '#FFF', width: 0.6, opacity: 0.9
        })
      });
    });
  });
  window._tachikiPaintRules = rules;
})();

var tachikiTiles = protomapsL.leafletLayer({
  url: "https://geoforest001.github.io/bridge_data/data/tachiki.pmtiles",
  attribution: '© ジオ・フォレスト',
  maxDataZoom: 17,
  paintRules: window._tachikiPaintRules,
  labelRules: []
});

/* ─── 施業班 樹種別カラーレイヤー ──────────────── */
function HatchPolygonSymbolizer(opts) {
  this.fill        = opts.fill        || 'rgba(0,0,0,0)';
  this.stroke      = opts.stroke;
  this.strokeWidth = opts.strokeWidth || 0.6;
  this.hatchColor  = opts.hatchColor;
  this.hatchSpacing = opts.hatchSpacing || 7;
}
HatchPolygonSymbolizer.prototype.draw = function(ctx, geom) {
  if (!geom || !geom.length) return;
  ctx.beginPath();
  for (var ri = 0; ri < geom.length; ri++) {
    var ring = geom[ri];
    if (!ring.length) continue;
    ctx.moveTo(ring[0].x, ring[0].y);
    for (var i = 1; i < ring.length; i++) ctx.lineTo(ring[i].x, ring[i].y);
    ctx.closePath();
  }
  ctx.fillStyle = this.fill;
  ctx.fill();
  if (this.hatchColor) {
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = this.hatchColor;
    ctx.lineWidth = 1.2;
    var minX=Infinity, minY=Infinity, maxX=-Infinity, maxY=-Infinity;
    for (var ri = 0; ri < geom.length; ri++) {
      for (var i = 0; i < geom[ri].length; i++) {
        var pt = geom[ri][i];
        if (pt.x < minX) minX = pt.x; if (pt.y < minY) minY = pt.y;
        if (pt.x > maxX) maxX = pt.x; if (pt.y > maxY) maxY = pt.y;
      }
    }
    var sp = this.hatchSpacing, h = maxY - minY + 1, w = maxX - minX;
    ctx.beginPath();
    for (var d = -h; d < w + h; d += sp) {
      ctx.moveTo(minX + d, minY);
      ctx.lineTo(minX + d + h, maxY);
    }
    ctx.stroke();
    ctx.restore();
  }
  if (this.stroke) {
    ctx.strokeStyle = this.stroke;
    ctx.lineWidth = this.strokeWidth;
    ctx.beginPath();
    for (var ri = 0; ri < geom.length; ri++) {
      var ring = geom[ri];
      if (!ring.length) continue;
      ctx.moveTo(ring[0].x, ring[0].y);
      for (var i = 1; i < ring.length; i++) ctx.lineTo(ring[i].x, ring[i].y);
      ctx.closePath();
    }
    ctx.stroke();
  }
};

var SP_DEFS = [
  { key:'アカマツ',      fill:'rgba(220,0,0,0.5)',      stroke:'#DD0000',  match:['アカマツ'] },
  { key:'カラマツ',      fill:'rgba(80,200,0,0.5)',     stroke:'#50C800',  match:['カラマツ'] },
  { key:'スギ',          fill:'rgba(0,100,255,0.5)',    stroke:'#0064FF',  match:['スギ'] },
  { key:'ヒノキ・サワラ', fill:'rgba(0,110,45,0.5)',    stroke:'#006E2D',  match:['ヒノキ','サワラ'] },
  { key:'ナラ類',        fill:'rgba(255,140,0,0.5)',    stroke:'#FF8C00',  match:['ナラ類','クヌギ','ブナ'] },
  { key:'その他広葉樹',  fill:'rgba(255,200,100,0.12)', stroke:'#CC7000',
    hatch:'rgba(255,140,0,0.7)', match:['その他広'] },
  { key:'その他針',      fill:'rgba(100,150,255,0.12)', stroke:'#0050CC',
    hatch:'rgba(0,100,255,0.7)',  match:['その他針'] },
];

var spLayers = {};
SP_DEFS.forEach(function(def) {
  var sym = def.hatch
    ? new HatchPolygonSymbolizer({
        fill: def.fill, stroke: def.stroke, strokeWidth: 0.6,
        hatchColor: def.hatch, hatchSpacing: 7
      })
    : new protomapsL.PolygonSymbolizer({ fill: def.fill, stroke: def.stroke, width: 0.6 });
  spLayers[def.key] = protomapsL.leafletLayer({
    url: SEGYOHAN_URL,
    attribution: '© 林野庁',
    maxDataZoom: 14,
    paintRules: [{
      dataLayer: "segyohan",
      filter: (function(match) {
        return function(z, f) {
          var dom = (f.props.JUSHU || '').split('・')[0];
          return match.indexOf(dom) !== -1;
        };
      })(def.match),
      symbolizer: sym
    }],
    labelRules: []
  });
});

/* ─── 保安林レイヤー ─────────────────────────── */
// 1つのレイヤーに全種別をまとめて色分け表示
var horinLayer = protomapsL.leafletLayer({
  url: SEGYOHAN_URL,
  attribution: '© 林野庁',
  maxDataZoom: 14,
  paintRules: [
    {
      dataLayer: "segyohan",
      filter: function(z, f) { var h=(f.props.HORIN||'').split('・')[0]; return h==='水かん'; },
      symbolizer: new protomapsL.PolygonSymbolizer({ fill:'rgba(0,180,240,0.45)', stroke:'#0099CC', width:0.7 })
    },
    {
      dataLayer: "segyohan",
      filter: function(z, f) { var h=(f.props.HORIN||'').split('・')[0]; return h==='土流'||h==='土崩'||h==='土保'; },
      symbolizer: new protomapsL.PolygonSymbolizer({ fill:'rgba(150,90,30,0.45)', stroke:'#8B5A1E', width:0.7 })
    },
    {
      dataLayer: "segyohan",
      filter: function(z, f) { var h=(f.props.HORIN||'').split('・')[0]; return h==='保健'; },
      symbolizer: new protomapsL.PolygonSymbolizer({ fill:'rgba(0,160,80,0.45)', stroke:'#009950', width:0.7 })
    },
    {
      dataLayer: "segyohan",
      filter: function(z, f) {
        var h=(f.props.HORIN||'').split('・')[0];
        return h!=='' && ['水かん','土流','土崩','土保','保健'].indexOf(h)===-1;
      },
      symbolizer: new protomapsL.PolygonSymbolizer({ fill:'rgba(140,0,200,0.45)', stroke:'#8000BB', width:0.7 })
    }
  ],
  labelRules: []
});

const baseLayers = {};

const overlays = {
  "伊那谷盛り土": moridoTiles,
  "能登盛り土": notoMoridoTiles,
  "流向ライン5m": d8_5mTiles,
  "林班（上伊那）": rinpanTiles,
  "小班（上伊那）": shohanTiles,
  "施業班（上伊那）": segyohanTiles,
  "　└ アカマツ": spLayers['アカマツ'],
  "　└ カラマツ": spLayers['カラマツ'],
  "　└ スギ": spLayers['スギ'],
  "　└ ヒノキ・サワラ": spLayers['ヒノキ・サワラ'],
  "　└ ナラ類": spLayers['ナラ類'],
  "　└ その他広葉樹": spLayers['その他広葉樹'],
  "　└ その他針": spLayers['その他針'],
  "保安林（上伊那）": horinLayer,
  "施業区域内立木": tachikiTiles
};

let layerControl;

function renderLayerControl() {
  if (layerControl) map.removeControl(layerControl);

  layerControl = L.control.layers(baseLayers, overlays, {
    position: "topright",
    collapsed: false
  });
  layerControl.addTo(map);

  // GeoJSON / GPKG ツールバー
  var panel = document.querySelector('.leaflet-control-layers');
  if (panel) {
    var lcList = panel.querySelector('.leaflet-control-layers-list');
    if (lcList) {
      var tbDiv = document.createElement('div');
      tbDiv.className = 'lc-toolbar';

      var geojsonLbl = document.createElement('label');
      geojsonLbl.className = 'tb-btn';
      geojsonLbl.innerHTML = '<span class="ico">📋</span><span>GeoJSON</span>';
      var geojsonInp = document.createElement('input');
      geojsonInp.type = 'file'; geojsonInp.accept = '.geojson,.json'; geojsonInp.style.display = 'none';
      geojsonInp.onchange = function(e) { _loadGeoJSON(e.target.files[0]); e.target.value = ''; };
      geojsonLbl.appendChild(geojsonInp);

      var gpkgLbl = document.createElement('label');
      gpkgLbl.className = 'tb-btn';
      gpkgLbl.innerHTML = '<span class="ico">📦</span><span>GPKG</span>';
      var gpkgInp = document.createElement('input');
      gpkgInp.type = 'file'; gpkgInp.accept = '.gpkg'; gpkgInp.style.display = 'none';
      gpkgInp.onchange = function(e) { _loadGPKG(e.target.files[0]); e.target.value = ''; };
      gpkgLbl.appendChild(gpkgInp);

      tbDiv.appendChild(geojsonLbl);
      tbDiv.appendChild(gpkgLbl);
      lcList.insertBefore(tbDiv, lcList.firstChild);
    }
  }

  // 山地レイヤを明示的2列に配置
  // 左列: 林班[3], 小班[4], 保安林[13]
  // 右列: 施業班[5]〜その他針[12], 施業区域内立木[14]
  var sec = document.querySelector('.leaflet-control-layers-overlays');
  if (!sec) return;
  var labels = Array.from(sec.querySelectorAll('label'));
  if (labels.length < 15) return;

  var grid = document.createElement('div');
  grid.className = 'lc-mountain-cols';
  var col1 = document.createElement('div');
  col1.className = 'lc-col';
  var col2 = document.createElement('div');
  col2.className = 'lc-col';
  grid.appendChild(col1);
  grid.appendChild(col2);
  sec.insertBefore(grid, labels[3]);

  col1.appendChild(labels[3]);   // 林班
  col1.appendChild(labels[4]);   // 小班

  col2.appendChild(labels[5]);   // 施業班
  for (var i = 6; i <= 12; i++) col2.appendChild(labels[i]);  // └サブ7種
  col2.appendChild(labels[13]);  // 保安林
  col2.appendChild(labels[14]);  // 施業区域内立木
}

renderLayerControl();

/* ─── GeoJSON / GeoPackage 読込 ─── */
let _vectorDropLayer = null;

function _loadScript(url) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = url; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

function _renderVectorLayer(geojson, filename) {
  if (_vectorDropLayer) { map.removeLayer(_vectorDropLayer); }
  _vectorDropLayer = L.geoJSON(geojson, {
    style: { color: '#9c27b0', weight: 2, fillOpacity: 0.15, opacity: 0.9 },
    pointToLayer: (f, ll) => L.circleMarker(ll, { radius: 5, color: '#9c27b0', fillOpacity: 0.8 }),
    onEachFeature: (f, layer) => {
      if (!f.properties) return;
      const rows = Object.entries(f.properties)
        .filter(([, v]) => v !== null && v !== undefined)
        .map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('');
      if (rows) layer.bindPopup(`<table class="forest-popup">${rows}</table>`);
    }
  }).addTo(map);
  const bounds = _vectorDropLayer.getBounds();
  if (bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40] });
  _showVectorCard(filename);
}

function _showVectorCard(name) {
  let card = document.getElementById('vectorDropCard');
  if (!card) {
    card = document.createElement('div');
    card.id = 'vectorDropCard';
    document.body.appendChild(card);
  }
  const short = name.length > 24 ? name.slice(0, 21) + '...' : name;
  card.innerHTML = `<span>📋 ${short}</span><button id="vectorDropClose">✕ 解除</button>`;
  document.getElementById('vectorDropClose').onclick = () => {
    if (_vectorDropLayer) { map.removeLayer(_vectorDropLayer); _vectorDropLayer = null; }
    card.remove();
  };
}

async function _loadGeoJSON(file) {
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const count = data.features ? data.features.length : '?';
    _renderVectorLayer(data, file.name);
    toast(`GeoJSON読み込み完了（${count}件）`, 2000);
  } catch (e) {
    toast('GeoJSONの読み込みに失敗しました', 2500);
  }
}

const _JP_PLANE = {
  6669:[129.5,33],  6670:[131,33],          6671:[132+10/60,36],
  6672:[133.5,33],  6673:[134+20/60,36],    6674:[136,36],
  6675:[137+10/60,36], 6676:[138.5,36],     6677:[139+50/60,36],
  6678:[140+50/60,40], 6679:[140.25,44],    6680:[142.25,44],
  6681:[144.25,44], 6682:[142,26],
  2443:[129.5,33],  2444:[131,33],          2445:[132+10/60,36],
  2446:[133.5,33],  2447:[134+20/60,36],    2448:[136,36],
  2449:[137+10/60,36], 2450:[138.5,36],     2451:[139+50/60,36],
  2452:[140+50/60,40], 2453:[140.25,44],    2454:[142.25,44],
  2455:[144.25,44], 2456:[142,26],
};

function _applyCoordTransform(geom, fn) {
  const t = coords => typeof coords[0] === 'number' ? fn(coords) : coords.map(t);
  return { ...geom, coordinates: t(geom.coordinates) };
}

async function _loadGPKG(file) {
  if (!file) return;
  toast('GeoPackage読み込み中...', 10000);
  try {
    if (!window.initSqlJs) {
      await _loadScript('https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.js');
    }
    if (!window._sqlJs) {
      window._sqlJs = await window.initSqlJs({
        locateFile: f => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${f}`
      });
    }
    const db = new window._sqlJs.Database(new Uint8Array(await file.arrayBuffer()));
    let gcRes;
    try { gcRes = db.exec('SELECT table_name, column_name, srs_id FROM gpkg_geometry_columns'); }
    catch(e) { toast('GeoPackage形式が不正です', 2500); db.close(); return; }
    if (!gcRes.length || !gcRes[0].values.length) {
      toast('フィーチャレイヤが見つかりません', 2500); db.close(); return;
    }
    const features = [];
    for (const [tbl, geomCol, srsId] of gcRes[0].values) {
      const res = db.exec(`SELECT * FROM "${tbl}"`);
      if (!res.length) continue;
      const cols = res[0].columns;
      const gi = cols.indexOf(geomCol);
      for (const row of res[0].values) {
        if (!row[gi]) continue;
        try {
          const bytes = row[gi] instanceof Uint8Array ? row[gi] : new Uint8Array(row[gi]);
          const geom = _gpkgGeomToGeoJSON(bytes);
          if (!geom) continue;
          const props = { _srs_id: srsId };
          cols.forEach((c, i) => { if (i !== gi) props[c] = row[i]; });
          features.push({ type: 'Feature', geometry: geom, properties: props });
        } catch(e) { /* skip */ }
      }
    }
    db.close();
    if (!features.length) { toast('ジオメトリが見つかりません', 2500); return; }

    const srsId = gcRes[0].values[0][2];
    const firstGeom = features[0].geometry;
    let testCoord = firstGeom.coordinates;
    while (Array.isArray(testCoord[0])) testCoord = testCoord[0];
    const isProjected = Math.abs(testCoord[0]) > 180 || Math.abs(testCoord[1]) > 90;

    if (isProjected) {
      const zone = _JP_PLANE[srsId];
      if (!zone) {
        toast(`⚠ 座標系(EPSG:${srsId})に対応していません。WGS84/JGD2011に変換してから読み込んでください。`, 6000);
        return;
      }
      if (!window.proj4) {
        await _loadScript('https://unpkg.com/proj4@2.9.0/dist/proj4.js');
      }
      const pstr = `+proj=tmerc +lat_0=${zone[1]} +lon_0=${zone[0]} +k=0.9999 +x_0=0 +y_0=0 +ellps=GRS80 +units=m +no_defs`;
      const tryOrder = (xy) => proj4(pstr, '+proj=longlat +datum=WGS84').forward(xy);
      const t1 = tryOrder([testCoord[0], testCoord[1]]);
      const inJapan = lon => lon > 120 && lon < 155;
      const transformFn = inJapan(t1[0])
        ? coords => tryOrder([coords[0], coords[1]])
        : coords => tryOrder([coords[1], coords[0]]);
      for (let f of features) {
        f.geometry = _applyCoordTransform(f.geometry, transformFn);
      }
      toast(`GeoPackage読み込み完了（${features.length}件, EPSG:${srsId}→WGS84）`, 2500);
    } else {
      toast(`GeoPackage読み込み完了（${features.length}件）`, 2000);
    }
    _renderVectorLayer({ type: 'FeatureCollection', features }, file.name);
  } catch (e) {
    toast('GeoPackageの読み込みに失敗しました', 2500);
    console.error(e);
  }
}

function _gpkgGeomToGeoJSON(bytes) {
  if (bytes[0] !== 0x47 || bytes[1] !== 0x50) return null;
  const flags = bytes[3];
  if ((flags >> 4) & 1) return null;
  const envSizes = [0, 32, 48, 48, 64];
  const wkbOff = 8 + (envSizes[(flags >> 1) & 7] || 0);
  const dv = new DataView(bytes.buffer, bytes.byteOffset + wkbOff);
  return _wkbParse(dv, { o: 0 }).geom;
}

function _wkbParse(dv, s) {
  const le = dv.getUint8(s.o) === 1; s.o++;
  const tc = le ? dv.getUint32(s.o, true) : dv.getUint32(s.o, false); s.o += 4;
  if (tc & 0x20000000) s.o += 4;
  const raw = tc & 0xFFFF;
  let bt = raw > 3000 ? raw - 3000 : raw > 2000 ? raw - 2000 : raw > 1000 ? raw - 1000 : raw;
  const nd = raw > 3000 ? 4 : (raw > 1000 || (tc & 0x80000000) || (tc & 0x40000000)) ? 3 : 2;
  const st = nd * 8;
  const rf = o => le ? dv.getFloat64(o, true) : dv.getFloat64(o, false);
  const ri = o => le ? dv.getUint32(o, true) : dv.getUint32(o, false);
  const rPt  = () => { const p = [rf(s.o), rf(s.o + 8)]; s.o += st; return p; };
  const rPts = () => { const n = ri(s.o); s.o += 4; const a = []; for(let i=0;i<n;i++) a.push(rPt()); return a; };
  switch (bt) {
    case 1: return { geom: { type: 'Point', coordinates: rPt() } };
    case 2: return { geom: { type: 'LineString', coordinates: rPts() } };
    case 3: { const n = ri(s.o); s.o += 4; const rings = []; for(let i=0;i<n;i++) rings.push(rPts()); return { geom: { type: 'Polygon', coordinates: rings } }; }
    case 4: { const n = ri(s.o); s.o += 4; const pts = []; for(let i=0;i<n;i++) pts.push(_wkbParse(dv,s).geom.coordinates); return { geom: { type: 'MultiPoint', coordinates: pts } }; }
    case 5: { const n = ri(s.o); s.o += 4; const ls = []; for(let i=0;i<n;i++) ls.push(_wkbParse(dv,s).geom.coordinates); return { geom: { type: 'MultiLineString', coordinates: ls } }; }
    case 6: { const n = ri(s.o); s.o += 4; const ps = []; for(let i=0;i<n;i++) ps.push(_wkbParse(dv,s).geom.coordinates); return { geom: { type: 'MultiPolygon', coordinates: ps } }; }
    default: return { geom: null };
  }
}

/* ─── ファイルドロップ（PC）─── */
(function() {
  const mapEl = map.getContainer();
  mapEl.addEventListener('dragover', e => { e.preventDefault(); mapEl.classList.add('drag-over'); });
  mapEl.addEventListener('dragleave', e => {
    if (!mapEl.contains(e.relatedTarget)) mapEl.classList.remove('drag-over');
  });
  mapEl.addEventListener('drop', e => {
    e.preventDefault();
    mapEl.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const name = file.name.toLowerCase();
    if (name.endsWith('.geojson') || name.endsWith('.json')) {
      _loadGeoJSON(file);
    } else if (name.endsWith('.gpkg')) {
      _loadGPKG(file);
    } else {
      toast('対応形式: GeoJSON / GeoPackage', 3000);
    }
  });
})();

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




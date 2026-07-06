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
          radius: r, fill: fill, stroke: '#333', width: 0.4, opacity: 0.9
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




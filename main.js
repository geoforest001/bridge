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
    className: "grayscale-layer"
  }
);

const gsiAirPhoto = L.tileLayer(
  "https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg",
  {
    attribution: gsiAttribution,
    maxZoom: 18
  }
);

const naganoCsMap = L.tileLayer(
  "https://tile.geospatial.jp/CS/VER2/{z}/{x}/{y}.png",
  {
    attribution:
      '<a href="https://www.geospatial.jp/ckan/dataset/nagano-csmap">長野県CS立体図</a>',
    maxZoom: 18
  }
);

gsiStandard.addTo(map);

const FARM_POLYGON_URL = "https://geoforest001.github.io/ina_farm_test/data/%E8%BE%B2%E5%9C%B0%E7%AD%86%E3%83%9D%E3%83%AA%E3%82%B4%E3%83%B3.pmtiles";

/* 山地レイヤ: データ準備後に追加予定 */

const baseLayers = {
  "地理院標準地図": gsiStandard,
  "地理院航空写真": gsiAirPhoto,
  "長野県CS立体図": naganoCsMap
};

const overlays = {
  "農地筆ポリゴン": farmPolygonTiles,
  /* 山地レイヤをここに追加予定 */
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

/* ─── 現在地ボタン ─────────────────────────────── */
  let currentLocationMarker = null;

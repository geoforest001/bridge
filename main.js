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
gsiAirPhoto.addTo(map); gsiAirPhoto.setOpacity(0);
naganoCsMap.addTo(map); naganoCsMap.setOpacity(0);

const MORIDO_URL = "https://geoforest001.github.io/bridge_data/data/morido.pmtiles";

const moridoTiles = protomapsL.leafletLayer({
  url: MORIDO_URL,
  maxDataZoom: 15,
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

const baseLayers = {};

const overlays = {
  "伊那谷盛り土": moridoTiles
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

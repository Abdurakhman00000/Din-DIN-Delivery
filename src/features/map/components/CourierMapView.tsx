import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import { BISHKEK_CENTER } from '@/features/map/constants/bishkek';
import type { MapCoordinate } from '@/features/map/types';

export type CourierMapViewRef = {
  zoomIn: () => void;
  zoomOut: () => void;
  centerOnBishkek: () => void;
  showRoute: (from: MapCoordinate, to: MapCoordinate, endLabel?: string) => void;
  clearRoute: () => void;
};

type CourierMapViewProps = {
  /** false — WebView и Leaflet не реагируют на жесты (шторки поверх карты). */
  interactionEnabled?: boolean;
};

function buildMockMapHtml() {
  const { latitude, longitude } = BISHKEK_CENTER;

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
      html, body, #map {
        height: 100%;
        width: 100%;
        margin: 0;
        padding: 0;
        background: #e5e7eb;
      }
      .leaflet-control-container { display: none !important; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      window.map = L.map('map', {
        zoomControl: false,
        attributionControl: false,
      }).setView([${latitude}, ${longitude}], 13);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '',
      }).addTo(window.map);

      window.routeLayer = null;

      window.clearRoute = function () {
        if (window.routeLayer) {
          window.map.removeLayer(window.routeLayer);
          window.routeLayer = null;
        }
      };

      window.showRoute = function (from, to, endLabel) {
        window.clearRoute();
        window.routeLayer = L.layerGroup().addTo(window.map);
        endLabel = endLabel || 'A';

        var mid = [
          (from[0] + to[0]) / 2 + 0.004,
          (from[1] + to[1]) / 2 - 0.003
        ];

        L.polyline([from, mid, to], {
          color: '#16A34A',
          weight: 4,
          dashArray: '10 10',
        }).addTo(window.routeLayer);

        function pointIcon(label) {
          return L.divIcon({
            className: '',
            html: '<div style="width:28px;height:28px;border-radius:14px;background:#fff;border:2px solid #16A34A;display:flex;align-items:center;justify-content:center;font:700 13px sans-serif;color:#111827">' + label + '</div>',
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });
        }

        var courierIcon = L.divIcon({
          className: '',
          html: '<div style="width:36px;height:36px;border-radius:18px;background:#16A34A;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;"><div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:10px solid #fff;"></div></div>',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        if (endLabel === 'B') {
          L.marker(from, { icon: pointIcon('A') }).addTo(window.routeLayer);
          L.marker(to, { icon: pointIcon('B') }).addTo(window.routeLayer);
        } else {
          L.marker(to, { icon: pointIcon('A') }).addTo(window.routeLayer);
          L.marker(from, { icon: courierIcon }).addTo(window.routeLayer);
        }

        window.map.fitBounds([from, to], { padding: [50, 50] });
      };

      window.setMapInteractive = function (enabled) {
        if (!window.map) {
          return;
        }
        var parts = [
          window.map.dragging,
          window.map.touchZoom,
          window.map.doubleClickZoom,
          window.map.scrollWheelZoom,
          window.map.boxZoom,
        ];
        parts.forEach(function (handler) {
          if (!handler) {
            return;
          }
          if (enabled) {
            handler.enable();
          } else {
            handler.disable();
          }
        });
      };
    </script>
  </body>
</html>
`;
}

export const CourierMapView = forwardRef<CourierMapViewRef, CourierMapViewProps>(
  function CourierMapView({ interactionEnabled = true }, ref) {
  const webViewRef = useRef<WebView>(null);
  const mapHtml = useMemo(() => buildMockMapHtml(), []);

  useEffect(() => {
    webViewRef.current?.injectJavaScript(
      `window.setMapInteractive(${interactionEnabled ? 'true' : 'false'}); true;`,
    );
  }, [interactionEnabled]);

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      webViewRef.current?.injectJavaScript('window.map.zoomIn(); true;');
    },
    zoomOut: () => {
      webViewRef.current?.injectJavaScript('window.map.zoomOut(); true;');
    },
    centerOnBishkek: () => {
      webViewRef.current?.injectJavaScript(
        `window.map.setView([${BISHKEK_CENTER.latitude}, ${BISHKEK_CENTER.longitude}], 13); true;`,
      );
    },
    showRoute: (from, to, endLabel) => {
      const label = JSON.stringify(endLabel ?? 'A');
      webViewRef.current?.injectJavaScript(
        `window.showRoute([${from.latitude},${from.longitude}],[${to.latitude},${to.longitude}],${label}); true;`,
      );
    },
    clearRoute: () => {
      webViewRef.current?.injectJavaScript(
        `window.clearRoute(); window.map.setView([${BISHKEK_CENTER.latitude}, ${BISHKEK_CENTER.longitude}], 13); true;`,
      );
    },
  }));

  return (
    <WebView
      ref={webViewRef}
      source={{ html: mapHtml }}
      style={styles.map}
      pointerEvents={interactionEnabled ? 'auto' : 'none'}
      scrollEnabled={false}
      bounces={false}
      overScrollMode="never"
      javaScriptEnabled
      domStorageEnabled
      originWhitelist={['*']}
      setBuiltInZoomControls={false}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
    />
  );
},
);

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#E5E7EB',
  },
});

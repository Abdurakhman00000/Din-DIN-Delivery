import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { BISHKEK_CENTER } from '@/features/map/constants/bishkek';
import { MAPGL_API_KEY, MAPGL_ROUTING_URL } from '@/features/map/constants/mapgl';
import type { MapCoordinate } from '@/features/map/types';

export type CourierMapViewRef = {
  zoomIn: () => void;
  zoomOut: () => void;
  centerOnBishkek: () => void;
  /** Центрирует карту на реальных координатах (например, живая позиция
   * курьера) — в отличие от centerOnBishkek выше, который всегда ведёт
   * на захардкоженный центр города. Зум не трогает, если уже ближе 15 —
   * не выталкивает курьера, который сам приблизил карту. */
  centerOn: (coordinate: MapCoordinate) => void;
  showRoute: (from: MapCoordinate, to: MapCoordinate, endLabel?: string) => void;
  clearRoute: () => void;
};

/** Реальные distance/duration от 2ГИС Routing API для текущего
 * показанного маршрута — null, пока не пришёл ответ (см. showRoute) или
 * если запрос не удался (тогда экран остаётся на приближении "по
 * прямой", см. utils/geo.ts). */
export type RouteInfo = { distanceM: number; durationS: number };

type CourierMapViewProps = {
  /** false — WebView и карта не реагируют на жесты (шторки поверх карты). */
  interactionEnabled?: boolean;
  /** Тип транспорта курьера — определяет, каким видом маршрута
   * (пешеходным/самокатным) 2ГИС Routing API считает путь. Меняется
   * практически никогда (это профильное поле курьера, не переключатель
   * в моменте) — HTML карты пересобирается при смене, это ожидаемо. */
  vehicle: 'foot' | 'scooter';
  /** Зовётся при каждом обновлении реального маршрута — null, если ответ
   * ещё не пришёл или не удался (см. RouteInfo). */
  onRouteInfo?: (info: RouteInfo | null) => void;
};

function buildMapHtml(vehicle: 'foot' | 'scooter') {
  const { latitude, longitude } = BISHKEK_CENTER;
  // 2ГИС принимает pedestrian/scooter (не "foot" — проверено напрямую,
  // "foot" отдаёт 400 "transports is incorrect").
  const transport = vehicle === 'scooter' ? 'scooter' : 'pedestrian';

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <style>
      html, body, #map {
        height: 100%;
        width: 100%;
        margin: 0;
        padding: 0;
        background: #e5e7eb;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://mapgl.2gis.com/api/js/v1?callback=__initMap" async defer></script>
    <script>
      var MAPGL_KEY = ${JSON.stringify(MAPGL_API_KEY)};
      var ROUTING_URL = ${JSON.stringify(MAPGL_ROUTING_URL)};
      var TRANSPORT = ${JSON.stringify(transport)};
      var CENTER = [${longitude}, ${latitude}];

      // Карта грузится асинхронно (внешний скрипт по сети) — RN может
      // вызвать showRoute/clearRoute через ref раньше, чем __initMap
      // отработает. Пока карты нет, любой вызов откладывается и
      // проигрывается один раз, как только она готова (только самый
      // последний — более ранний всё равно устарел).
      window.__mapReady = false;
      window.__pendingCall = null;
      function callWhenReady(fn, args) {
        if (window.__mapReady) {
          fn.apply(null, args);
        } else {
          window.__pendingCall = { fn: fn, args: args };
        }
      }

      function svgIcon(svg) {
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      }
      var COURIER_ICON = svgIcon(
        '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">' +
        '<circle cx="18" cy="18" r="15" fill="#16A34A" stroke="#fff" stroke-width="3"/>' +
        '<path d="M18 9 L25 25 L18 20.5 L11 25 Z" fill="#fff"/>' +
        '</svg>'
      );
      var POINT_ICON = svgIcon(
        '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">' +
        '<circle cx="14" cy="14" r="12" fill="#fff" stroke="#16A34A" stroke-width="2.5"/>' +
        '</svg>'
      );

      window.pointMarkers = [];
      function clearMarkers() {
        window.pointMarkers.forEach(function (m) {
          try { m.destroy(); } catch (e) {}
        });
        window.pointMarkers = [];
      }
      function makePointMarker(lon, lat, text) {
        return new mapgl.Marker(window.map, {
          coordinates: [lon, lat],
          icon: POINT_ICON,
          label: { text: text, fontSize: 13, color: '#111827' },
        });
      }
      function makeCourierMarker(lon, lat) {
        return new mapgl.Marker(window.map, { coordinates: [lon, lat], icon: COURIER_ICON });
      }

      // Слой на карте существует только внутри текущего "style" — при
      // первой загрузке карты style ещё пуст и подгружается с сервера
      // асинхронно; addLayer до этого либо ничего не даёт, либо слой
      // тут же затирается, когда style всё-таки приходит (см. доку 2ГИС,
      // "Adding layer after style load" — предупреждение прямым текстом).
      // Поэтому линию маршрута рисуем не раньше события 'styleload', а
      // если запрос пришёл раньше — просто запоминаем координаты и
      // отрисовываем их, когда styleload наконец случится.
      window.__styleReady = false;
      window.__lastRouteCoords = null;

      window.routeSource = null;
      function clearRouteLine() {
        if (window.routeSource) {
          try { window.map.removeLayer('route-line'); } catch (e) {}
          try { window.map.removeLayer('route-line-halo'); } catch (e) {}
          try { window.routeSource.destroy(); } catch (e) {}
          window.routeSource = null;
        }
      }
      function drawRouteLineNow(coords) {
        clearRouteLine();
        var data = {
          type: 'Feature',
          properties: { routeId: 'active' },
          geometry: { type: 'LineString', coordinates: coords },
        };
        try {
          window.routeSource = new mapgl.GeoJsonSource(window.map, { data: data });
          var filter = ['match', ['sourceAttr', 'routeId'], ['active'], true, false];
          // Белая подложка снизу + зелёная линия сверху — тот же приём,
          // что раньше давал dashArray в Leaflet-варианте, просто другой
          // визуальный язык (сплошная линия с halo вместо пунктира).
          window.map.addLayer({
            id: 'route-line-halo',
            type: 'line',
            filter: filter,
            style: { color: '#ffffff', width: 8 },
          });
          window.map.addLayer({
            id: 'route-line',
            type: 'line',
            filter: filter,
            style: { color: '#16A34A', width: 4 },
          });
        } catch (e) {
          console.warn('drawRouteLine failed', e);
        }
      }
      function drawRouteLine(coords) {
        window.__lastRouteCoords = coords;
        if (!window.__styleReady) {
          return; // отрисуется в обработчике 'styleload' ниже
        }
        drawRouteLineNow(coords);
      }

      // Точки из ответа Routing API приходят как WKT LINESTRING внутри
      // maneuvers[].outcoming_path.geometry[].selection — склеиваем все
      // сегменты подряд в один путь.
      function parseLineString(wkt) {
        var inner = wkt.slice(wkt.indexOf('(') + 1, wkt.lastIndexOf(')'));
        return inner.split(',').map(function (pair) {
          var xy = pair.trim().split(' ');
          return [parseFloat(xy[0]), parseFloat(xy[1])];
        });
      }
      function extractRouteCoords(result) {
        var coords = [];
        var maneuvers = result.maneuvers || [];
        for (var i = 0; i < maneuvers.length; i++) {
          var path = maneuvers[i].outcoming_path;
          if (!path || !path.geometry) continue;
          for (var j = 0; j < path.geometry.length; j++) {
            var wkt = path.geometry[j].selection;
            if (!wkt) continue;
            coords = coords.concat(parseLineString(wkt));
          }
        }
        return coords;
      }

      function fetchRoute(fromLon, fromLat, toLon, toLat) {
        return fetch(ROUTING_URL + '?key=' + MAPGL_KEY, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            points: [
              { type: 'stop', lon: fromLon, lat: fromLat },
              { type: 'stop', lon: toLon, lat: toLat },
            ],
            transport: TRANSPORT,
            route_mode: 'fastest',
            locale: 'ru',
          }),
        }).then(function (res) { return res.json(); });
      }

      function postToRN(message) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(message));
        }
      }

      // Грубая, но предсказуемая оценка уровня зума по охвату между двумя
      // точками в градусах — гарантированная подстраховка перед
      // (необязательным) fitBounds, см. realShowRoute ниже.
      function zoomForSpan(lonSpan, latSpan) {
        var span = Math.max(lonSpan, latSpan);
        if (span < 0.003) return 16;
        if (span < 0.006) return 15;
        if (span < 0.012) return 14;
        if (span < 0.025) return 13;
        if (span < 0.05) return 12;
        if (span < 0.1) return 11;
        if (span < 0.2) return 10;
        return 9;
      }

      window.__routeRequestId = 0;

      function realShowRoute(fromLon, fromLat, toLon, toLat, endLabel) {
        var requestId = ++window.__routeRequestId;
        endLabel = endLabel || 'A';
        clearMarkers();

        // Новый запрос маршрута — прошлые distance/duration (например, от
        // предыдущей фазы to_pickup) больше не про эту пару точек. Сразу
        // сбрасываем их в RN, чтобы экран откатился на честное "по прямой"
        // на время загрузки, а не показывал одну-две секунды чужое число.
        postToRN({ type: 'routeInfo', distanceM: null, durationS: null });

        // Мгновенная линия "по прямой" для обратной связи, пока настоящий
        // маршрут не пришёл — так же, как и раньше делал мок.
        drawRouteLine([[fromLon, fromLat], [toLon, toLat]]);

        if (endLabel === 'B') {
          window.pointMarkers.push(makePointMarker(fromLon, fromLat, 'A'));
          window.pointMarkers.push(makePointMarker(toLon, toLat, 'B'));
        } else {
          window.pointMarkers.push(makePointMarker(toLon, toLat, 'A'));
          window.pointMarkers.push(makeCourierMarker(fromLon, fromLat));
        }

        // Гарантированная базовая рамка — не зависит от fitBounds (ниже),
        // считаем сами по охвату между точками, чтобы обе точки точно
        // попали в кадр, даже если по какой-то причине fitBounds на
        // конкретном устройстве не сработает (см. zoomForSpan).
        window.map.setCenter([(fromLon + toLon) / 2, (fromLat + toLat) / 2]);
        window.map.setZoom(zoomForSpan(Math.abs(fromLon - toLon), Math.abs(fromLat - toLat)));

        try {
          // Уточняет рамку с отступами под карточку сверху/кнопку снизу —
          // необязательный бонус поверх гарантированной рамки выше.
          // fitBounds ждёт объект {southWest, northEast}, не вложенный
          // массив — и padding объектом {top,right,bottom,left}, не
          // числом (проверено по официальным типам @2gis/mapgl).
          window.map.fitBounds(
            {
              southWest: [Math.min(fromLon, toLon), Math.min(fromLat, toLat)],
              northEast: [Math.max(fromLon, toLon), Math.max(fromLat, toLat)],
            },
            { padding: { top: 140, right: 50, bottom: 160, left: 50 } },
          );
        } catch (e) {
          console.warn('fitBounds failed, staying on the manual center/zoom above', e);
        }

        fetchRoute(fromLon, fromLat, toLon, toLat)
          .then(function (json) {
            if (requestId !== window.__routeRequestId) return; // курьер уже пошёл дальше
            var result = json && json.result && json.result[0];
            if (!result) throw new Error((json && json.message) || 'no route result');
            var coords = extractRouteCoords(result);
            if (coords.length > 1) {
              drawRouteLine(coords);
            }
            postToRN({
              type: 'routeInfo',
              distanceM: result.total_distance,
              durationS: result.total_duration,
            });
          })
          .catch(function (e) {
            if (requestId !== window.__routeRequestId) return;
            console.warn('2GIS routing failed, staying on straight-line fallback', e);
            postToRN({ type: 'routeError' });
          });
      }

      function realClearRoute() {
        window.__routeRequestId++; // гасит ответ ещё летящего запроса
        window.__lastRouteCoords = null;
        clearRouteLine();
        clearMarkers();
        window.map.setCenter(CENTER);
        window.map.setZoom(13);
        postToRN({ type: 'routeInfo', distanceM: null, durationS: null });
      }

      window.showRoute = function (fromLon, fromLat, toLon, toLat, endLabel) {
        callWhenReady(realShowRoute, [fromLon, fromLat, toLon, toLat, endLabel]);
      };
      window.clearRoute = function () {
        callWhenReady(realClearRoute, []);
      };
      window.zoomIn = function () {
        callWhenReady(function () { window.map.setZoom(window.map.getZoom() + 1); }, []);
      };
      window.zoomOut = function () {
        callWhenReady(function () { window.map.setZoom(window.map.getZoom() - 1); }, []);
      };
      window.centerOnBishkek = function () {
        callWhenReady(function () {
          window.map.setCenter(CENTER);
          window.map.setZoom(13);
        }, []);
      };
      window.centerOn = function (lon, lat) {
        callWhenReady(function () {
          window.map.setCenter([lon, lat]);
          // Не выталкиваем зум ниже 15 (уровень "видно свою улицу"), но и
          // не откатываем назад, если курьер сам уже приблизил карту сильнее.
          if (window.map.getZoom() < 15) {
            window.map.setZoom(15);
          }
        }, []);
      };
      window.setMapInteractive = function () {
        // Основная защита от жестов под шторками — pointerEvents="none"
        // на самом WebView, RN-уровня (см. CourierMapView.tsx) — она
        // блокирует тачи независимо от карты под ним. Дополнительного
        // API карты для точечного включения/выключения жестов здесь
        // сознательно не задействуем — RN-барьера достаточно.
      };

      window.__initMap = function () {
        try {
          window.map = new mapgl.Map('map', {
            center: CENTER,
            zoom: 13,
            key: MAPGL_KEY,
          });
          window.map.on('styleload', function () {
            window.__styleReady = true;
            if (window.__lastRouteCoords) {
              drawRouteLineNow(window.__lastRouteCoords);
            }
          });
          window.__mapReady = true;
          if (window.__pendingCall) {
            var call = window.__pendingCall;
            window.__pendingCall = null;
            call.fn.apply(null, call.args);
          }
        } catch (e) {
          console.warn('2GIS map init failed', e);
        }
      };
    </script>
  </body>
</html>
`;
}

export const CourierMapView = forwardRef<CourierMapViewRef, CourierMapViewProps>(
  function CourierMapView({ interactionEnabled = true, vehicle, onRouteInfo }, ref) {
    const webViewRef = useRef<WebView>(null);
    const mapHtml = useMemo(() => buildMapHtml(vehicle), [vehicle]);

    useEffect(() => {
      webViewRef.current?.injectJavaScript(
        `window.setMapInteractive(${interactionEnabled ? 'true' : 'false'}); true;`,
      );
    }, [interactionEnabled]);

    useImperativeHandle(ref, () => ({
      zoomIn: () => {
        webViewRef.current?.injectJavaScript('window.zoomIn(); true;');
      },
      zoomOut: () => {
        webViewRef.current?.injectJavaScript('window.zoomOut(); true;');
      },
      centerOnBishkek: () => {
        webViewRef.current?.injectJavaScript('window.centerOnBishkek(); true;');
      },
      centerOn: (coordinate) => {
        webViewRef.current?.injectJavaScript(
          `window.centerOn(${coordinate.longitude},${coordinate.latitude}); true;`,
        );
      },
      showRoute: (from, to, endLabel) => {
        const label = JSON.stringify(endLabel ?? 'A');
        webViewRef.current?.injectJavaScript(
          `window.showRoute(${from.longitude},${from.latitude},${to.longitude},${to.latitude},${label}); true;`,
        );
      },
      clearRoute: () => {
        webViewRef.current?.injectJavaScript('window.clearRoute(); true;');
      },
    }));

    function handleMessage(event: WebViewMessageEvent) {
      if (!onRouteInfo) {
        return;
      }
      try {
        const data = JSON.parse(event.nativeEvent.data) as {
          type?: string;
          distanceM?: number | null;
          durationS?: number | null;
        };
        if (
          data.type === 'routeInfo' &&
          typeof data.distanceM === 'number' &&
          typeof data.durationS === 'number'
        ) {
          onRouteInfo({ distanceM: data.distanceM, durationS: data.durationS });
        } else if (data.type === 'routeError' || data.type === 'routeInfo') {
          // routeError, или routeInfo с distanceM/durationS: null (clearRoute) —
          // в обоих случаях откатываемся на приближение "по прямой" в
          // ActiveTripCard, а не показываем устаревшее число.
          onRouteInfo(null);
        }
      } catch {
        // Сообщение не по протоколу — игнорируем, не роняем карту из-за него.
      }
    }

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
        onMessage={handleMessage}
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

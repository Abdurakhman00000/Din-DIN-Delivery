import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActiveTripCard } from '../components/ActiveTripCard';
import { CompletedOrderSheet } from '../components/CompletedOrderSheet';
import { CourierMapView, type CourierMapViewRef } from '../components/CourierMapView';
import { CourierMarker } from '../components/CourierMarker';
import { GoOnlineButton } from '../components/GoOnlineButton';
import { IncomingOrderSheet } from '../components/IncomingOrderSheet';
import { MapHeader } from '../components/MapHeader';
import { MapSearchSheet } from '../components/MapSearchSheet';
import { MapLeftControls, MapRightControls } from '../components/MapSideControls';
import { OnlineToast } from '../components/OnlineToast';
import { useCourierShift } from '../hooks/useCourierShift';

export function MapScreen() {
  const mapRef = useRef<CourierMapViewRef>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const shift = useCourierShift();
  const showRouteOnMap = shift.isToPickup || shift.isToDropoff;
  const showIdleControls = !shift.isIncoming && !shift.isActiveTrip && !shift.isCompleted;

  useEffect(() => {
    if (!shift.order) {
      mapRef.current?.clearRoute();
      return;
    }

    if (shift.isToPickup) {
      mapRef.current?.showRoute(shift.order.courier, shift.order.pickup, 'A');
      return;
    }

    if (shift.isToDropoff) {
      mapRef.current?.showRoute(shift.order.pickup, shift.order.dropoff, 'B');
      return;
    }

    mapRef.current?.clearRoute();
  }, [shift.isToDropoff, shift.isToPickup, shift.order]);

  const action = getTripAction(shift);

  return (
    <View style={styles.container}>
      <CourierMapView ref={mapRef} />
      {showRouteOnMap ? null : <CourierMarker />}

      <SafeAreaView style={styles.topOverlay} edges={['top']}>
        {shift.isActiveTrip && shift.order ? (
          <ActiveTripCard
            order={shift.order}
            phase={
              shift.isToPickup
                ? 'toPickup'
                : shift.isAtPickup
                  ? 'atPickup'
                  : shift.isToDropoff
                    ? 'toDropoff'
                    : 'awaitingPayment'
            }
            paymentStatus={shift.paymentStatus}
          />
        ) : (
          <MapHeader />
        )}
      </SafeAreaView>

      <OnlineToast visible={shift.toastVisible} />

      {showIdleControls ? (
        <>
          <View style={styles.leftControls}>
            <MapLeftControls onSearchPress={() => setSearchOpen(true)} />
          </View>
          <View style={styles.rightControls}>
            <MapRightControls
              onZoomIn={() => mapRef.current?.zoomIn()}
              onZoomOut={() => mapRef.current?.zoomOut()}
              onLocatePress={() => mapRef.current?.centerOnBishkek()}
            />
          </View>
          <View style={styles.bottomOverlay}>
            <GoOnlineButton
              label={shift.isWaiting ? 'На линии' : 'На линию'}
              blinking={shift.blinking}
              disabled={shift.isWaiting}
              onPress={shift.goOnline}
            />
          </View>
        </>
      ) : null}

      {action ? (
        <View style={styles.bottomOverlay}>
          <GoOnlineButton label={action.label} onPress={action.onPress} />
        </View>
      ) : null}

      {shift.isIncoming && shift.order ? (
        <IncomingOrderSheet
          order={shift.order}
          onAccept={shift.acceptOrder}
          onDecline={shift.declineOrder}
        />
      ) : null}

      {shift.isCompleted && shift.order ? (
        <CompletedOrderSheet order={shift.order} onComplete={shift.completeOrder} />
      ) : null}

      <MapSearchSheet visible={searchOpen} onClose={() => setSearchOpen(false)} />
    </View>
  );
}

function getTripAction(shift: ReturnType<typeof useCourierShift>) {
  if (shift.isToPickup) {
    return { label: 'Я на месте', onPress: shift.arriveAtPickup };
  }
  if (shift.isAtPickup) {
    return { label: 'Забрал еду', onPress: shift.confirmPickup };
  }
  if (shift.isToDropoff) {
    return { label: 'Я прибыл', onPress: shift.arriveAtDropoff };
  }
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E7EB',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
    zIndex: 10,
  },
  leftControls: {
    position: 'absolute',
    left: 16,
    top: '32%',
  },
  rightControls: {
    position: 'absolute',
    right: 16,
    top: '32%',
  },
  bottomOverlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 12,
  },
});

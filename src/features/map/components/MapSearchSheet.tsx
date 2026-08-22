/* Reanimated shared values are mutated on the UI thread. */
/* eslint-disable react-hooks/immutability */
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { COLORS } from '@/constants/theme';

import { MOCK_PLACES } from '../constants/mockData';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.5;

type MapSearchSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function MapSearchSheet({ visible, onClose }: MapSearchSheetProps) {
  const [query, setQuery] = useState('');
  const translateY = useSharedValue(SHEET_HEIGHT);

  const places = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return MOCK_PLACES;
    }

    return MOCK_PLACES.filter(
      (place) =>
        place.name.toLowerCase().includes(normalized) ||
        place.address.toLowerCase().includes(normalized),
    );
  }, [query]);

  useEffect(() => {
    translateY.value = withTiming(visible ? 0 : SHEET_HEIGHT, { duration: visible ? 280 : 220 });
  }, [translateY, visible]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY(12)
        .onUpdate((event) => {
          translateY.value = Math.max(0, event.translationY);
        })
        .onEnd((event) => {
          const shouldClose = event.translationY > 90 || event.velocityY > 900;
          if (shouldClose) {
            translateY.value = withTiming(SHEET_HEIGHT, { duration: 200 }, (finished) => {
              if (finished) {
                runOnJS(onClose)();
              }
            });
          } else {
            translateY.value = withTiming(0, { duration: 200 });
          }
        }),
    [onClose, translateY],
  );

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, SHEET_HEIGHT], [0.35, 0]),
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <Animated.View style={[styles.backdrop, backdropStyle]} pointerEvents="none" />
      </Pressable>

      <Animated.View style={[styles.sheet, sheetStyle]}>
          <GestureDetector gesture={pan}>
            <View style={styles.handleWrap}>
              <View style={styles.handle} />
            </View>
          </GestureDetector>

          <View style={styles.searchRow}>
            <Ionicons name="search-outline" size={18} color={COLORS.gray400} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Поиск места"
              placeholderTextColor={COLORS.gray400}
              style={styles.input}
              autoCorrect={false}
            />
          </View>

          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {places.map((place) => (
              <View key={place.id} style={styles.placeRow}>
                <View style={styles.placeIcon}>
                  <Ionicons name="location-outline" size={18} color={COLORS.primary} />
                </View>
                <View style={styles.placeInfo}>
                  <Text style={styles.placeName}>{place.name}</Text>
                  <Text style={styles.placeAddress}>{place.address}</Text>
                </View>
              </View>
            ))}
            {places.length === 0 ? <Text style={styles.empty}>Ничего не найдено</Text> : null}
          </ScrollView>
        </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#000',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SHEET_HEIGHT,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: COLORS.white,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.gray900,
    paddingVertical: 0,
  },
  list: {
    flex: 1,
    marginTop: 12,
  },
  listContent: {
    paddingBottom: 8,
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  placeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeInfo: {
    flex: 1,
    gap: 2,
  },
  placeName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  placeAddress: {
    fontSize: 13,
    color: COLORS.gray400,
  },
  empty: {
    paddingTop: 24,
    textAlign: 'center',
    color: COLORS.gray400,
  },
});

// Цвета и размеры приложения.
//
// 03.09.2026 — редизайн: экраны над картой (MapScreen и всё, что на ней
// плавает — карточка поездки, плавающие кнопки, тосты, шторки) перешли
// на тёмную «pro-tool» подачу (в духе Uber Driver/Bolt Driver — не
// светлый consumer-стиль) — см. DARK ниже. Карта у 2ГИС светлая
// (управлять её темой мы не можем, это MapGL), поэтому тёмное стекло
// поверх неё даёт как раз тот контраст, который выглядит дорого, а не
// плоскую белую карточку на светлой карте.
//
// Существующие ключи COLORS/SHADOW ниже — НЕ трогаем: их значения и
// роль используются в 20+ файлах, которые в этот проход редизайна не
// входили (Login/Profile/History/т.д.) — смена их смысла тут сломала бы
// эти экраны молча. Новый тёмный набор добавлен рядом, не взамен.
export const COLORS = {
  primary: '#16A34A',
  primaryDark: '#15803D',
  primaryLight: '#22C55E',
  accent: '#F97316',
  white: '#FFFFFF',
  milky: '#FAFAF8',
  border: '#E5E7EB',
  gray100: '#F3F4F6',
  gray400: '#9CA3AF',
  gray600: '#4B5563',
  gray900: '#111827',
  shadow: 'rgba(0, 0, 0, 0.12)',
} as const;

export const SHADOW = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

/**
 * Тёмная «pro-tool» палитра — не чистый OLED-чёрный (#000 «мажет» на
 * OLED и читается дёшево/резко), а тёплый почти-чёрный с холодным
 * подтоном, как у зрелых профессиональных инструментов. Зелёный бренд
 * не меняем (та же идентичность, что у админки и во всей экосистеме
 * «Дин Дин») — он остаётся единственным ярким акцентом на нейтральном
 * тёмном фоне, поэтому и читается как акцент, а не теряется в цвете.
 */
export const DARK = {
  bg: '#0B0E13',
  surface: '#12161D',
  surfaceElevated: '#1B212B',
  // Для BlurView (expo-blur, tint="dark") — полупрозрачная подложка
  // поверх размытия, не самостоятельный сплошной фон.
  glass: 'rgba(15, 18, 24, 0.78)',
  hairline: 'rgba(255, 255, 255, 0.08)',
  hairlineStrong: 'rgba(255, 255, 255, 0.14)',

  textPrimary: '#F5F7FA',
  textSecondary: '#9AA5B4',
  // 03.09.2026: посчитал контраст по формуле WCAG для всех пар этой
  // палитры — исходный #5B6472 давал 3.0-3.2:1 к surface/bg, ниже
  // порога 4.5:1 для обычного текста (капшены/таймстемпы/плейсхолдеры
  // реально мелкие, не "крупный текст", под который годится 3:1).
  // #808080 — 4.59:1 к surface, 4.89:1 к bg, проходит AA на обоих.
  textMuted: '#808080',

  primaryGlow: 'rgba(34, 197, 94, 0.32)',
  danger: '#F87171',
  dangerGlow: 'rgba(248, 113, 113, 0.28)',
} as const;

/** Тени для тёмных поверхностей — плавающих над картой карточек и
 * кнопок. На тёмном фоне обычная лёгкая тень (см. SHADOW выше)
 * незаметна, поэтому глубже и темнее — плюс hairline-обводка в самом
 * компоненте (DARK.hairline) добавляет чёткости края там, где тень
 * сама по себе не отделяет тёмную карточку от тёмных объектов карты. */
export const DARK_SHADOW = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  button: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  }),
} as const;

/** 4pt-сетка — единый ритм отступов вместо разрозненных чисел. */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/** Скругления — единая шкала вместо произвольных 12/14/16/18/20. */
export const RADIUS = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

/**
 * Inter — тот же выбор, что у большинства «дорогих» pro-инструментов
 * (Linear, Vercel, Stripe): нейтральный, очень читаемый на мелких
 * кеглях гротеск, свободный шрифт, есть готовый пакет
 * @expo-google-fonts/inter. Системный шрифт (San Francisco/Roboto) —
 * то, что стоит по умолчанию у всех и не даёт вообще никакого
 * ощущения «сделанного» продукта; замена на Inter — один из самых
 * дешёвых по усилиям и заметных по эффекту шагов к premium-ощущению.
 * Имена ключей — ровно то, что экспортирует @expo-google-fonts/inter,
 * используются как fontFamily после загрузки шрифтов (см.
 * hooks/useAppFonts.ts).
 */
export const FONTS = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
} as const;

/** Единая шкала кеглей — вместо произвольных 12/13/14/15/16/17/18/20/22. */
export const TYPE_SCALE = {
  caption: 12,
  label: 13,
  body: 15,
  bodyLarge: 16,
  title: 20,
  headline: 24,
  display: 32,
} as const;

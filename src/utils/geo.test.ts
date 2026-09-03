import { formatDistanceKm, formatDurationMin, straightLineDistanceKm } from './geo';

describe('straightLineDistanceKm', () => {
  it('возвращает 0 для одной и той же точки', () => {
    const point = { latitude: 42.8746, longitude: 74.6122 };
    expect(straightLineDistanceKm(point, point)).toBeCloseTo(0, 6);
  });

  it('для разницы ровно в 0.01° широты (долгота та же) даёт ~1.112 км', () => {
    // R=6371км: 1° широты ≈ 111.19км, 0.01° ≈ 1.1119км — не зависит от
    // широты (в отличие от долготы), удобная эталонная точка.
    const from = { latitude: 42.87, longitude: 74.61 };
    const to = { latitude: 42.88, longitude: 74.61 };
    expect(straightLineDistanceKm(from, to)).toBeCloseTo(1.1119, 2);
  });

  it('симметрична: from->to и to->from дают одно и то же расстояние', () => {
    const a = { latitude: 42.8746, longitude: 74.6122 };
    const b = { latitude: 42.8823, longitude: 74.6193 };
    expect(straightLineDistanceKm(a, b)).toBeCloseTo(straightLineDistanceKm(b, a), 10);
  });
});

describe('formatDistanceKm', () => {
  it('меньше 1 км — округляет до метров', () => {
    expect(formatDistanceKm(0.85)).toBe('850 м');
    expect(formatDistanceKm(0.001)).toBe('1 м');
  });

  it('0 км — тоже метры (граница снизу)', () => {
    expect(formatDistanceKm(0)).toBe('0 м');
  });

  it('ровно 1 км и больше — километры с одним знаком после запятой', () => {
    expect(formatDistanceKm(1)).toBe('1.0 км');
    expect(formatDistanceKm(3.98)).toBe('4.0 км');
    expect(formatDistanceKm(12.34)).toBe('12.3 км');
  });
});

describe('formatDurationMin', () => {
  it('меньше 30 секунд всё равно округляется минимум до 1 минуты, не до 0', () => {
    expect(formatDurationMin(10)).toBe('1 мин');
    expect(formatDurationMin(0)).toBe('1 мин');
  });

  it('обычные значения меньше часа', () => {
    expect(formatDurationMin(717)).toBe('12 мин'); // реальный ответ 2ГИС из живого теста
    expect(formatDurationMin(59 * 60)).toBe('59 мин');
  });

  it('округляет до ближайшей минуты', () => {
    expect(formatDurationMin(90)).toBe('2 мин'); // 1.5 мин -> 2
    expect(formatDurationMin(89)).toBe('1 мин'); // 1.48 мин -> 1
  });

  it('ровно 60 минут — переходит в часы, не "60 мин"', () => {
    expect(formatDurationMin(60 * 60)).toBe('1 ч 0 мин');
  });

  it('больше часа — часы и минуты вместе', () => {
    expect(formatDurationMin(65 * 60)).toBe('1 ч 5 мин');
    expect(formatDurationMin(125 * 60)).toBe('2 ч 5 мин');
  });
});

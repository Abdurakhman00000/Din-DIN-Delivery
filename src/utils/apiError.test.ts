import { extractApiErrorMessage } from './apiError';

const FALLBACK = 'запасной текст';

describe('extractApiErrorMessage', () => {
  it('возвращает detail-строку из тела ответа (409/422/403 от /deliveries, /shifts)', () => {
    const error = { status: 409, data: { detail: 'заказ уже не в том статусе' } };
    expect(extractApiErrorMessage(error, FALLBACK)).toBe('заказ уже не в том статусе');
  });

  it('падает на fallback, если error — null', () => {
    expect(extractApiErrorMessage(null, FALLBACK)).toBe(FALLBACK);
  });

  it('падает на fallback, если error — не объект (например, строка или число)', () => {
    expect(extractApiErrorMessage('boom', FALLBACK)).toBe(FALLBACK);
    expect(extractApiErrorMessage(42, FALLBACK)).toBe(FALLBACK);
  });

  it('падает на fallback, если у объекта вообще нет поля data (например, сетевая ошибка FetchBaseQueryError)', () => {
    expect(extractApiErrorMessage({ status: 'FETCH_ERROR' }, FALLBACK)).toBe(FALLBACK);
  });

  it('падает на fallback, если data есть, но в нём нет detail', () => {
    expect(extractApiErrorMessage({ status: 500, data: {} }, FALLBACK)).toBe(FALLBACK);
  });

  it('падает на fallback, если data — не объект (например, голая строка)', () => {
    expect(extractApiErrorMessage({ status: 500, data: 'Internal Server Error' }, FALLBACK)).toBe(
      FALLBACK,
    );
  });

  it('падает на fallback, если detail — не строка (форма /auth/* с массивом ошибок валидации, не эта функция)', () => {
    const authStyleError = {
      status: 422,
      data: { detail: [{ loc: ['body', 'phone'], msg: 'обязательное поле', type: 'missing' }] },
    };
    expect(extractApiErrorMessage(authStyleError, FALLBACK)).toBe(FALLBACK);
  });

  it('падает на fallback, если detail — пустая строка', () => {
    expect(extractApiErrorMessage({ status: 422, data: { detail: '' } }, FALLBACK)).toBe(FALLBACK);
  });
});

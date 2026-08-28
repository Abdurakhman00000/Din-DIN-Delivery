const KG_COUNTRY_CODE = '996';
const KG_LOCAL_LENGTH = 9;

/** Только локальные 9 цифр после +996 */
export function extractLocalDigits(input: string): string {
  let digits = input.replace(/\D/g, '');

  if (digits.startsWith(KG_COUNTRY_CODE)) {
    digits = digits.slice(KG_COUNTRY_CODE.length);
  }

  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  return digits.slice(0, KG_LOCAL_LENGTH);
}

/** Отображение: 555 11 22 33 */
export function formatLocalDigits(digits: string): string {
  const local = extractLocalDigits(digits);
  const parts: string[] = [];

  if (local.length > 0) parts.push(local.slice(0, 3));
  if (local.length > 3) parts.push(local.slice(3, 5));
  if (local.length > 5) parts.push(local.slice(5, 7));
  if (local.length > 7) parts.push(local.slice(7, 9));

  return parts.join(' ');
}

/** Отправка на API: +996555112233 */
export function normalizePhoneForApi(localDigits: string): string {
  return `+996${extractLocalDigits(localDigits)}`;
}

export function isValidKgPhone(localDigits: string): boolean {
  return extractLocalDigits(localDigits).length === KG_LOCAL_LENGTH;
}

export const KG_PHONE_PLACEHOLDER = '555 11 22 33';

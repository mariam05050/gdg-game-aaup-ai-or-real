export const NAME_LIMIT = 30;

export function cleanName(value) {
  return value.normalize('NFC').replace(/\s+/gu, ' ').trim();
}

export function limitName(value) {
  return Array.from(cleanName(value)).slice(0, NAME_LIMIT).join('');
}

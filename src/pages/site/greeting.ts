import type { Locale, PlainMessageKey } from '../../shared/i18n/message';

export function greetingKeyFor(date: Date): PlainMessageKey {
  const hour = date.getHours();
  if (hour < 5) return 'greeting.lateNight';
  if (hour < 11) return 'greeting.morning';
  if (hour < 13) return 'greeting.noon';
  if (hour < 18) return 'greeting.afternoon';
  return 'greeting.evening';
}

export function formatToday(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, { month: 'long', day: 'numeric', weekday: 'long' }).format(date);
}

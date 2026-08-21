import { useEffect, useState } from 'react';
import { useLocale } from './i18n/LocaleContext';
import type { DictionaryKey } from './i18n/dictionaries/en';

function greetingKeyForHour(hour: number): DictionaryKey {
  if (hour < 5) return 'greeting.night';
  if (hour < 12) return 'greeting.morning';
  if (hour < 18) return 'greeting.afternoon';
  return 'greeting.evening';
}

// Ticks every minute so a greeting shown across an hour boundary (e.g.
// 11:59am -> 12:00pm) updates on its own instead of freezing at whatever
// was true when the page first rendered.
export function useGreeting(): string {
  const { t } = useLocale();
  const [hour, setHour] = useState(() => new Date().getHours());

  useEffect(() => {
    const id = setInterval(() => setHour(new Date().getHours()), 60_000);
    return () => clearInterval(id);
  }, []);

  return t(greetingKeyForHour(hour));
}

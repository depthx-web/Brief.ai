import { useEffect, useState } from 'react';

export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 5) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// Ticks every minute so a greeting shown across an hour boundary (e.g.
// 11:59am -> 12:00pm) updates on its own instead of freezing at whatever
// was true when the page first rendered.
export function useGreeting(): string {
  const [greeting, setGreeting] = useState(() => getGreeting());

  useEffect(() => {
    const id = setInterval(() => setGreeting(getGreeting()), 60_000);
    return () => clearInterval(id);
  }, []);

  return greeting;
}

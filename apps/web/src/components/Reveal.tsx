'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
}

// Fade-in + 12px upward slide, triggered once via IntersectionObserver when
// ~20% visible — not a scroll-position calculation. Skips straight to the
// final state for prefers-reduced-motion. Not used on the Hero or the
// closing CTA (both should render immediately) — see the homepage's UI
// polish spec.
export default function Reveal({ children, delayMs = 0, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const timer = setTimeout(() => setVisible(true), delayMs);
          observer.disconnect();
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delayMs]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 400ms ease-out, transform 400ms ease-out',
      }}
    >
      {children}
    </div>
  );
}

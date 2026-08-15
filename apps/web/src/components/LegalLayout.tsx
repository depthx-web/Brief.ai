'use client';

import { useEffect, useRef, useState } from 'react';

export interface LegalSection {
  id: string;
  title: string;
  body: React.ReactNode;
}

interface Props {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
}

// Deliberately different from the rest of the platform — this is a
// long-form reading page, so the priority is reading comfort, not
// interaction. `--paper` ground, a single narrow column, and Newsreader
// throughout (the app's usual Inter body face is set aside on purpose).
export default function LegalLayout({ title, lastUpdated, sections }: Props) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '');
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-15% 0px -70% 0px' }
    );
    sections.forEach((s) => {
      const el = sectionRefs.current[s.id];
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className="bg-paper">
      <div className="mx-auto flex max-w-5xl gap-16 px-6 py-16 lg:px-12">
        <article className="mx-auto max-w-[720px] font-serif text-[16px] leading-[1.8] text-ink">
          <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">Last updated {lastUpdated}</p>
          <h1 className="mt-3 font-serif text-3xl font-medium text-navy">{title}</h1>

          <div className="mt-10 space-y-10">
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                ref={(el) => {
                  sectionRefs.current[section.id] = el;
                }}
                className="scroll-mt-24"
              >
                <h2 className="font-serif text-xl font-semibold text-navy">{section.title}</h2>
                <div className="mt-3 space-y-4 text-ink">{section.body}</div>
              </section>
            ))}
          </div>
        </article>

        <nav className="sticky top-16 hidden h-fit w-56 shrink-0 border-l border-paper-line pl-6 lg:block">
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">On this page</p>
          <ul className="mt-3 space-y-2.5">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className={`block text-[13px] transition-colors ${
                    activeId === section.id ? 'font-medium text-emerald' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

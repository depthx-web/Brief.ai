'use client';

import { useState } from 'react';
import { useLocale } from '@/lib/i18n/LocaleContext';
import { getDocumentDemoContent, type DemoSegmentKey } from '@/lib/i18n/documentDemoContent';

const ORDER: DemoSegmentKey[] = ['law', 'acc', 'res'];

export default function DocumentDemo() {
  const { locale } = useLocale();
  const content = getDocumentDemoContent(locale);
  const [active, setActive] = useState<DemoSegmentKey>('acc');
  const d = content[active];

  return (
    <div className="relative z-[2] flex justify-center">
      <div className="absolute -top-[18px] start-9 z-[3] flex gap-1">
        {ORDER.map((key) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`rounded-t-lg px-4 pb-3 pt-2.5 font-mono text-xs tracking-wide transition-all ${
              active === key
                ? 'bg-paper font-semibold text-navy opacity-100 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]'
                : 'bg-[#E9E2CE] text-[#6B6250] opacity-70 hover:opacity-90'
            }`}
          >
            {content[key].tabLabel}
          </button>
        ))}
      </div>

      <div
        className="relative w-full max-w-[420px] rotate-[-2.2deg] rounded-tl-[3px] rounded-tr-xl rounded-b-xl bg-paper p-9 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:-translate-y-1 hover:rotate-[-0.6deg]"
        style={{
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #E8E2D4 28px)',
          backgroundBlendMode: 'multiply',
        }}
      >
        <div className="mb-4 flex justify-between font-mono text-[10.5px] uppercase tracking-wide text-[#9A8F76]">
          <span>{d.filename}</span>
          <span>{d.page}</span>
        </div>
        <div className="mb-4 font-serif text-lg font-semibold text-navy">{d.title}</div>
        <div className="space-y-3.5 text-[13.5px] leading-loose text-[#3A3527]">
          {d.lines.map((line, i) => (
            // eslint-disable-next-line react/no-danger
            <p key={i} className="demo-line relative" dangerouslySetInnerHTML={{ __html: line.html }} />
          ))}
        </div>
      </div>

      <style jsx global>{`
        .demo-line mark.hl {
          background: #fce8a8;
          border-radius: 2px;
          padding: 0 2px;
        }
        .demo-line mark.strike {
          text-decoration: line-through;
          text-decoration-color: #c24444;
          color: #8a8a8a;
          background: none;
        }
        .demo-line mark.insert {
          color: #1e9d75;
          font-weight: 600;
          background: none;
        }
        .demo-line .circ {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          border: 1.5px solid #1e9d75;
          border-radius: 50%;
          font-family: var(--font-plex-mono), monospace;
          font-size: 10px;
          color: #1e9d75;
          margin: 0 2px;
        }
        .demo-line .note {
          position: absolute;
          right: -14px;
          transform: translateX(100%);
          font-family: var(--font-plex-mono), monospace;
          font-size: 10px;
          background: #0f2340;
          color: #fff;
          padding: 4px 8px;
          border-radius: 4px;
          white-space: nowrap;
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
        }
        .demo-line:hover .note {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}

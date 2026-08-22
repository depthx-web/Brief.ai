'use client';

import { useRef, useState } from 'react';
import { useLocale } from '@/lib/i18n/LocaleContext';

export interface ThumbnailPage {
  id: string;
  originalIndex: number;
  thumbnailUrl: string;
  dimmed?: boolean;
  rotationDeg?: number;
}

interface Props {
  pages: ThumbnailPage[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReorder?: (pages: ThumbnailPage[]) => void;
  renderBadge?: (page: ThumbnailPage) => React.ReactNode;
}

// Left column of every page-level editing tool (numbering, reorder, rotate —
// Batch 3, Section 5). Presentational + drag-reorder only; each tool owns
// what "selecting" or "reordering" a page actually means to it.
export default function PageThumbnailStrip({ pages, selectedId, onSelect, onReorder, renderBadge }: Props) {
  const { t } = useLocale();
  const dragIndex = useRef<number | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  function handleDrop(index: number) {
    const from = dragIndex.current;
    dragIndex.current = null;
    setDraggingId(null);
    if (!onReorder || from === null || from === index) return;
    const next = [...pages];
    const [moved] = next.splice(from, 1);
    next.splice(index, 0, moved);
    onReorder(next);
  }

  return (
    <div className="h-full w-[180px] shrink-0 overflow-y-auto bg-surface p-3">
      <div className="flex flex-col gap-3">
        {pages.map((page, index) => {
          const selected = page.id === selectedId;
          const dragging = page.id === draggingId;
          return (
            <button
              key={page.id}
              type="button"
              draggable={!!onReorder}
              onDragStart={() => {
                dragIndex.current = index;
                setDraggingId(page.id);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              onDragEnd={() => {
                dragIndex.current = null;
                setDraggingId(null);
              }}
              onClick={() => onSelect(page.id)}
              className={`relative flex flex-col items-center gap-1 rounded-md p-1.5 transition-opacity ${
                page.dimmed ? 'opacity-40' : ''
              } ${dragging ? 'shadow-level-3' : ''}`}
            >
              <div
                className={`w-full overflow-hidden rounded-sm bg-white p-1 [transform:rotate(-1deg)] ${
                  selected ? 'border-2 border-emerald' : 'border border-paper-line'
                }`}
              >
                <img
                  src={page.thumbnailUrl}
                  alt={t('common.pageNumber').replace('{n}', String(page.originalIndex + 1))}
                  style={page.rotationDeg ? { transform: `rotate(${page.rotationDeg}deg)` } : undefined}
                  className="w-full"
                />
              </div>
              <span className="font-mono text-[10px] text-ink-soft">{page.originalIndex + 1}</span>
              {renderBadge?.(page)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

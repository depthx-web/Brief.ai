export interface PageRange {
  label: string;
  pages: number[]; // 0-indexed
}

/**
 * Parses input like "1-3, 5, 8-9" (1-indexed, inclusive) into zero-indexed
 * page groups, one output file per comma-separated segment.
 */
export function parsePageRanges(input: string, pageCount: number): PageRange[] {
  const segments = input
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (segments.length === 0) {
    throw new Error('Enter at least one page or page range.');
  }

  return segments.map((segment) => {
    const match = segment.match(/^(\d+)(?:-(\d+))?$/);
    if (!match) {
      throw new Error(`"${segment}" is not a valid page or range.`);
    }
    const start = Number(match[1]);
    const end = match[2] ? Number(match[2]) : start;
    if (start < 1 || end < 1 || start > pageCount || end > pageCount) {
      throw new Error(`"${segment}" is out of range (document has ${pageCount} pages).`);
    }
    if (start > end) {
      throw new Error(`"${segment}" starts after it ends.`);
    }
    const pages: number[] = [];
    for (let p = start; p <= end; p++) pages.push(p - 1);
    return { label: start === end ? `${start}` : `${start}-${end}`, pages };
  });
}

export function everyPageIndividually(pageCount: number): PageRange[] {
  return Array.from({ length: pageCount }, (_, i) => ({ label: `${i + 1}`, pages: [i] }));
}

import { PDFDocument, PDFFont, StandardFonts, rgb } from 'pdf-lib';

const PAGE_WIDTH = 612; // US Letter
const PAGE_HEIGHT = 792;
const MARGIN = 56;
const TITLE_SIZE = 18;
const BODY_SIZE = 11;
const LINE_HEIGHT = 16;

function wrapLine(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && font.widthOfTextAtSize(candidate, size) > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// Renders an AI-generated chat reply (title + plain-text body) as a simple
// paginated PDF — used by the mini file card in the chat tab.
export async function generateFilePdf(title: string, content: string): Promise<Blob> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const maxWidth = PAGE_WIDTH - MARGIN * 2;

  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  for (const line of wrapLine(title, boldFont, TITLE_SIZE, maxWidth)) {
    page.drawText(line, { x: MARGIN, y, size: TITLE_SIZE, font: boldFont, color: rgb(0.06, 0.14, 0.25) });
    y -= TITLE_SIZE + 6;
  }
  y -= 12;

  const paragraphs = content.split(/\n\s*\n/);
  for (const paragraph of paragraphs) {
    for (const rawLine of paragraph.split('\n')) {
      const lines = rawLine.trim() ? wrapLine(rawLine, font, BODY_SIZE, maxWidth) : [''];
      for (const line of lines) {
        if (y < MARGIN) {
          page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
          y = PAGE_HEIGHT - MARGIN;
        }
        if (line) {
          page.drawText(line, { x: MARGIN, y, size: BODY_SIZE, font, color: rgb(0.06, 0.09, 0.15) });
        }
        y -= LINE_HEIGHT;
      }
    }
    y -= LINE_HEIGHT * 0.5;
  }

  const bytes = await doc.save();
  return new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

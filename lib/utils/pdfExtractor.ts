// Polyfill ReadableStream async iterator for environments/browsers lacking native support
if (typeof ReadableStream !== 'undefined' && !ReadableStream.prototype[Symbol.asyncIterator]) {
  (ReadableStream.prototype as any)[Symbol.asyncIterator] = function () {
    const reader = this.getReader();
    return {
      next() {
        return reader.read().then(({ value, done }: { value: any; done: boolean }) => {
          if (done) return { value: undefined, done: true };
          return { value, done: false };
        });
      },
      return() {
        reader.releaseLock();
        return Promise.resolve({ value: undefined, done: true });
      },
      [Symbol.asyncIterator]() { return this; },
    };
  };
}

import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

// Helper to separate Hindi and English strings
export function splitHindiAndEnglish(text: string): { hindi: string; english: string } {
  if (!text) return { hindi: '', english: '' };
  const cleanedText = text.replace(/[:：\-–—/]/g, ' ').replace(/\s+/g, ' ').trim();
  const words = cleanedText.split(' ');
  const hindiWords: string[] = [];
  const englishWords: string[] = [];
  for (const word of words) {
    if (/[\u0900-\u097F]/.test(word)) hindiWords.push(word);
    else englishWords.push(word);
  }
  return {
    hindi: hindiWords.join(' ').trim(),
    english: englishWords.join(' ').trim(),
  };
}

// Clean and format Aadhaar
export function formatAadhaar(aadhaar: string): string {
  if (!aadhaar) return '';
  const cleaned = aadhaar.replace(/[^X\d]/g, '');
  if (cleaned.length === 12) {
    return `${cleaned.substring(0, 4)} ${cleaned.substring(4, 8)} ${cleaned.substring(8, 12)}`;
  }
  return aadhaar;
}

export interface PDFTextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  pageNum: number;
}

export async function extractTextFromPdf(
  pdf: pdfjsLib.PDFDocumentProxy
): Promise<{ fullText: string; lines: string[]; pdfItems: PDFTextItem[] }> {
  console.log('extractTextFromPdf: pages =', pdf.numPages);

  const allLines: string[] = [];
  const pdfItems: PDFTextItem[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const items = (textContent.items as any[]).filter(
      (item) => typeof item.str === 'string' && item.str.trim()
    );

    if (items.length === 0) continue;

    // Save items with coordinates
    for (const item of items) {
      pdfItems.push({
        str: item.str,
        x: item.transform[4],
        y: item.transform[5],
        width: item.width ?? 0,
        pageNum
      });
    }

    // ── Sort items: top-to-bottom (desc Y), then left-to-right (asc X) ─────
    items.sort((a, b) => {
      const yDiff = b.transform[5] - a.transform[5];
      if (Math.abs(yDiff) > 3) return yDiff;
      return a.transform[4] - b.transform[4];
    });

    // ── Group items into visual lines by Y proximity ──────────────────────
    interface TextItem { str: string; x: number; y: number; width: number }
    const typedItems: TextItem[] = items.map((item) => ({
      str: item.str,
      x: item.transform[4],
      y: item.transform[5],
      width: item.width ?? 0,
    }));

    const lineGroups: TextItem[][] = [];
    let currentGroup: TextItem[] = [typedItems[0]];

    for (let i = 1; i < typedItems.length; i++) {
      const prev = typedItems[i - 1];
      const cur = typedItems[i];
      if (Math.abs(cur.y - prev.y) <= 4) {
        currentGroup.push(cur);
      } else {
        lineGroups.push(currentGroup);
        currentGroup = [cur];
      }
    }
    lineGroups.push(currentGroup);

    // ── Build each line: join items, inserting "  " (two spaces) when the
    //    horizontal gap between items is large (>= 8 pts), else single space ─
    for (const group of lineGroups) {
      // Sort within the group by X
      group.sort((a, b) => a.x - b.x);

      let line = group[0].str;
      for (let j = 1; j < group.length; j++) {
        const prev = group[j - 1];
        const cur = group[j];
        const gap = cur.x - (prev.x + prev.width);
        if (gap >= 8) {
          line += '  ' + cur.str;
        } else if (gap >= 1.0) {
          line += ' ' + cur.str;
        } else {
          line += cur.str;
        }
      }

      const trimmed = line.trim();
      if (trimmed) allLines.push(trimmed);
    }
  }

  const fullText = allLines.join('\n');
  console.log('extractTextFromPdf: lines =', allLines.length, 'chars =', fullText.length);
  return { fullText, lines: allLines, pdfItems };
}

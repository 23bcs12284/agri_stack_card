import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';

export async function runOcrOnPdf(
  pdf: pdfjsLib.PDFDocumentProxy,
  onProgress?: (progress: number) => void
): Promise<{ fullText: string; lines: string[] }> {
  console.log("runOcrOnPdf: Initializing OCR engine. Total pages:", pdf.numPages);
  
  let ocrTextAccumulator = '';
  let worker: any = null;

  try {
    const numPages = pdf.numPages;

    // Initialize Tesseract.js Worker with English and Hindi
    console.log("runOcrOnPdf: Creating Tesseract worker (eng+hin)...");
    worker = await createWorker('eng+hin', undefined, {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(Math.round(m.progress * 100));
        }
      },
    });

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      try {
        console.log(`runOcrOnPdf: Rendering page ${pageNum}/${numPages} to canvas for OCR...`);
        const page = await pdf.getPage(pageNum);
        
        // Render page to canvas at higher resolution for better OCR accuracy
        const scale = 2.0;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
          console.warn(`runOcrOnPdf: Failed to get 2d context for page ${pageNum}`);
          continue;
        }
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Render the page contents into canvas context
        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        console.log(`runOcrOnPdf: Running OCR character recognition on page ${pageNum}...`);
        // Run recognition on canvas
        const response = await worker.recognize(canvas);
        ocrTextAccumulator += response.data.text + '\n';
        console.log(`runOcrOnPdf: Page ${pageNum} OCR text extracted. Length:`, response.data.text.length);
      } catch (pageOcrErr) {
        console.error(`runOcrOnPdf: Failed to run OCR on page ${pageNum}:`, pageOcrErr);
      }
    }
  } catch (err: any) {
    console.error("runOcrOnPdf: Master try-catch caught exception:", err);
    throw new Error(`OCR processing engine failed: ${err?.message || err}`);
  } finally {
    if (worker) {
      console.log("runOcrOnPdf: Terminating Tesseract worker...");
      await worker.terminate();
    }
  }

  const ocrLines = ocrTextAccumulator
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  console.log("runOcrOnPdf: Completed. Total lines extracted via OCR:", ocrLines.length);
  return {
    fullText: ocrTextAccumulator,
    lines: ocrLines,
  };
}

import fs from 'fs';
import path from 'path';
import * as pdfjs from 'pdfjs-dist/build/pdf.mjs';

pdfjs.GlobalWorkerOptions.workerSrc = path.resolve('./node_modules/pdfjs-dist/build/pdf.worker.mjs');

async function main() {
  const filePath = '/Users/prabhakarkumarjha/Downloads/Farmer registry Enrollement Data.pdf';
  const data = new Uint8Array(fs.readFileSync(filePath));
  const loadingTask = pdfjs.getDocument({ data });
  const pdf = await loadingTask.promise;
  
  console.log(`PDF pages: ${pdf.numPages}`);
  for (let i = 1; i <= pdf.numPages; i++) {
    console.log(`\n--- PAGE ${i} ---`);
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items;
    
    // Sort items visually: top-to-bottom, left-to-right
    items.sort((a, b) => {
      const yDiff = b.transform[5] - a.transform[5];
      if (Math.abs(yDiff) < 3) {
        return a.transform[4] - b.transform[4];
      }
      return yDiff;
    });
    
    for (const item of items) {
      console.log(`x=${item.transform[4].toFixed(1)}, y=${item.transform[5].toFixed(1)}, w=${item.width.toFixed(1)}: "${item.str}"`);
    }
  }
}

main().catch(console.error);

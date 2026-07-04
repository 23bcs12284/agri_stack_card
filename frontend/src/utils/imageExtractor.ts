import * as pdfjsLib from 'pdfjs-dist';
import jsQR from 'jsqr';

export interface ExtractedImages {
  passportPhoto: string;
  qrCodeText: string;
  qrCodeImage: string;
  allImages: { src: string; width: number; height: number; isQr: boolean }[];
}

/**
 * Image extractor for Farmer Registry PDFs.
 *
 * Coordinates are based on the fixed government document layout:
 * - Passport photo is always at the top-right quadrant.
 * - QR code is always at the bottom-right quadrant.
 *
 * Approach:
 * 1. Render Page 1 to an offscreen canvas at high resolution (scale 2.0).
 * 2. Crop the precise passport photograph coordinates.
 * 3. Crop and decode the QR code from the bottom-right quadrant.
 */
export async function extractImagesFromPdf(
  pdf: pdfjsLib.PDFDocumentProxy
): Promise<ExtractedImages> {
  const result: ExtractedImages = {
    passportPhoto: '',
    qrCodeText: '',
    qrCodeImage: '',
    allImages: [],
  };

  console.log('extractImagesFromPdf: starting. pages =', pdf.numPages);

  try {
    const page = await pdf.getPage(1);
    console.log('extractImagesFromPdf: Page 1 loaded.');

    // Render Page 1 at high resolution (scale 2.0)
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('extractImagesFromPdf: Cannot get 2D context');
      return result;
    }
    await page.render({ canvasContext: ctx, viewport }).promise;
    console.log('extractImagesFromPdf: High-resolution Page 1 rendered.');

    // 1. Crop Passport Photo (top-right region of Page 1)
    // const photoX = Math.floor(viewport.width * 0.73);
    // const photoY = Math.floor(viewport.height * 0.08);
    // const photoW = Math.floor(viewport.width * 0.19);
    // const photoH = Math.floor(viewport.height * 0.20);
    const photoX = Math.floor(viewport.width * 0.871);
    const photoY = Math.floor(viewport.height * 0.088);
    const photoW = Math.floor(viewport.width * 0.070);
    const photoH = Math.floor(viewport.height * 0.110);

    const photoCanvas = document.createElement('canvas');
    photoCanvas.width = photoW;
    photoCanvas.height = photoH;
    const photoCtx = photoCanvas.getContext('2d');
    if (photoCtx) {
      photoCtx.drawImage(canvas, photoX, photoY, photoW, photoH, 0, 0, photoW, photoH);
      result.passportPhoto = photoCanvas.toDataURL('image/jpeg', 0.93);
      result.allImages.push({
        src: result.passportPhoto,
        width: photoW,
        height: photoH,
        isQr: false,
      });
      console.log(`extractImagesFromPdf: ✓ Passport photo cropped (${photoW}x${photoH})`);
    }

    // 2. Crop and Scan QR Code (bottom-right region of Page 1)
    const qrX = Math.floor(viewport.width * 0.70);
    const qrY = Math.floor(viewport.height * 0.70);
    const qrW = Math.floor(viewport.width * 0.25);
    const qrH = Math.floor(viewport.height * 0.25);

    const qrCanvas = document.createElement('canvas');
    qrCanvas.width = qrW;
    qrCanvas.height = qrH;
    const qrCtx = qrCanvas.getContext('2d');
    if (qrCtx) {
      qrCtx.drawImage(canvas, qrX, qrY, qrW, qrH, 0, 0, qrW, qrH);
      
      try {
        const qrImgData = qrCtx.getImageData(0, 0, qrW, qrH);
        const decoded = jsQR(qrImgData.data, qrW, qrH);
        if (decoded) {
          console.log('extractImagesFromPdf: ✓ QR code decoded:', decoded.data.slice(0, 80));
          result.qrCodeText = decoded.data;
          result.qrCodeImage = qrCanvas.toDataURL('image/png');
          result.allImages.push({
            src: result.qrCodeImage,
            width: qrW,
            height: qrH,
            isQr: true,
          });
        } else {
          console.log('extractImagesFromPdf: No QR code found in bottom-right region.');
        }
      } catch (qrErr) {
        console.warn('extractImagesFromPdf: QR decode failed:', qrErr);
      }
    }

    console.log('extractImagesFromPdf: ✓ Completed successfully.');
  } catch (err) {
    console.error('extractImagesFromPdf: Error:', err);
  }

  return result;
}

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
 * Strategy:
 * 1. Get the operator list for Page 1 to find embedded image object names.
 * 2. Render Page 1 to an offscreen canvas at scale 0.5 to trigger PDF.js object resolution.
 * 3. Extract the embedded image directly via page.objs.get() — supporting both Raw Pixels (Node)
 *    and ImageBitmap/HTMLImageElement/HTMLCanvasElement (Browser).
 * 4. Fallback to rendering Page 1 at scale 2.0 and cropping the fixed passport photograph region
 *    if direct resource extraction did not yield a valid photo.
 * 5. Scan the rendered canvas for a QR code (using a cropped region to avoid slow full-page scans).
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

    // Step 1: Get operator list to find image object names
    const opList = await page.getOperatorList();
    const imageNames: string[] = [];
    for (let i = 0; i < opList.fnArray.length; i++) {
      // fn 85 = paintImageXObject, fn 86 = paintImageMaskXObject
      if (opList.fnArray[i] === 85 || opList.fnArray[i] === 86) {
        const name = opList.argsArray[i]?.[0];
        if (typeof name === 'string' && !imageNames.includes(name)) {
          imageNames.push(name);
        }
      }
    }
    console.log('extractImagesFromPdf: Found image objects:', imageNames);

    // Step 2: Render page at low scale to trigger object resolution
    const viewport = page.getViewport({ scale: 0.5 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('extractImagesFromPdf: Cannot get 2D context');
      return result;
    }
    await page.render({ canvasContext: ctx, viewport }).promise;
    console.log('extractImagesFromPdf: Page rendered (low-res) to trigger object loading.');

    // Step 3: Extract each embedded image directly
    for (const imgName of imageNames) {
      try {
        const imgData = await new Promise<any>((resolve, reject) => {
          const timeout = setTimeout(
            () => reject(new Error(`Timeout getting ${imgName}`)),
            2000
          );
          page.objs.get(imgName, (img: any) => {
            clearTimeout(timeout);
            resolve(img);
          });
        });

        if (!imgData) {
          console.warn(`extractImagesFromPdf: ${imgName} data is empty`);
          continue;
        }

        // Draw to a canvas based on type of imgData (ImageBitmap, HTMLImageElement, Canvas, or Raw Pixels)
        const imgCanvas = document.createElement('canvas');
        const imgCtx = imgCanvas.getContext('2d');
        if (!imgCtx) continue;

        let width = imgData.width || 0;
        let height = imgData.height || 0;
        let drawn = false;

        try {
          if (imgData.bitmap) {
            // Some versions of PDF.js wrap ImageBitmap in an object
            width = imgData.bitmap.width;
            height = imgData.bitmap.height;
            imgCanvas.width = width;
            imgCanvas.height = height;
            imgCtx.drawImage(imgData.bitmap, 0, 0);
            drawn = true;
          } else if (imgData instanceof ImageBitmap || (typeof ImageBitmap !== 'undefined' && imgData instanceof ImageBitmap)) {
            width = imgData.width;
            height = imgData.height;
            imgCanvas.width = width;
            imgCanvas.height = height;
            imgCtx.drawImage(imgData, 0, 0);
            drawn = true;
          } else if (imgData instanceof HTMLImageElement || (typeof HTMLImageElement !== 'undefined' && imgData instanceof HTMLImageElement)) {
            width = imgData.width;
            height = imgData.height;
            imgCanvas.width = width;
            imgCanvas.height = height;
            imgCtx.drawImage(imgData, 0, 0);
            drawn = true;
          } else if (imgData instanceof HTMLCanvasElement || (typeof HTMLCanvasElement !== 'undefined' && imgData instanceof HTMLCanvasElement)) {
            width = imgData.width;
            height = imgData.height;
            imgCanvas.width = width;
            imgCanvas.height = height;
            imgCtx.drawImage(imgData, 0, 0);
            drawn = true;
          }
        } catch (drawErr) {
          console.warn(`extractImagesFromPdf: Failed direct draw for ${imgName}:`, drawErr);
        }

        // Fallback for Node.js / raw data buffers
        if (!drawn && imgData.data && imgData.width && imgData.height) {
          imgCanvas.width = imgData.width;
          imgCanvas.height = imgData.height;
          const pixelCount = imgData.width * imgData.height;
          let imageDataObj: ImageData;

          if (imgData.kind === 2 || imgData.data.length === pixelCount * 4) {
            const clamped = new Uint8ClampedArray(imgData.data.buffer || imgData.data);
            imageDataObj = new ImageData(clamped, imgData.width, imgData.height);
          } else {
            const rgba = new Uint8ClampedArray(pixelCount * 4);
            const src = imgData.data;
            for (let i = 0, j = 0; i < src.length; i += 3, j += 4) {
              rgba[j] = src[i];
              rgba[j + 1] = src[i + 1];
              rgba[j + 2] = src[i + 2];
              rgba[j + 3] = 255;
            }
            imageDataObj = new ImageData(rgba, imgData.width, imgData.height);
          }
          imgCtx.putImageData(imageDataObj, 0, 0);
          drawn = true;
        }

        if (drawn && width > 0 && height > 0) {
          const dataUrl = imgCanvas.toDataURL('image/jpeg', 0.92);
          const aspectRatio = width / height;
          const isPassportPhoto =
            width >= 80 &&
            height >= 80 &&
            aspectRatio >= 0.5 &&
            aspectRatio <= 1.2;

          if (isPassportPhoto && !result.passportPhoto) {
            result.passportPhoto = dataUrl;
            result.allImages.push({
              src: dataUrl,
              width,
              height,
              isQr: false,
            });
            console.log(
              `extractImagesFromPdf: ✓ Passport photo extracted directly (${width}x${height})`
            );
          } else {
            result.allImages.push({
              src: dataUrl,
              width,
              height,
              isQr: false,
            });
          }
        }
      } catch (err) {
        console.warn(`extractImagesFromPdf: Failed to extract ${imgName}:`, err);
      }
    }

    // Step 4: Fallback to high-res canvas crop if direct extraction didn't yield a photo
    if (!result.passportPhoto) {
      console.log('extractImagesFromPdf: Direct extraction did not yield photo. Cropping from canvas...');
      const renderViewport = page.getViewport({ scale: 2.0 });
      const renderCanvas = document.createElement('canvas');
      renderCanvas.width = renderViewport.width;
      renderCanvas.height = renderViewport.height;
      const renderCtx = renderCanvas.getContext('2d');
      if (renderCtx) {
        await page.render({ canvasContext: renderCtx, viewport: renderViewport }).promise;
        
        // Precise crop coordinates for passport photo (from verified layout coordinates)
        const cropX = Math.floor(renderViewport.width * 0.73);
        const cropY = Math.floor(renderViewport.height * 0.08);
        const cropW = Math.floor(renderViewport.width * 0.19);
        const cropH = Math.floor(renderViewport.height * 0.20);
        
        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = cropW;
        cropCanvas.height = cropH;
        const cropCtx = cropCanvas.getContext('2d');
        if (cropCtx) {
          cropCtx.drawImage(renderCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
          result.passportPhoto = cropCanvas.toDataURL('image/jpeg', 0.93);
          result.allImages.push({
            src: result.passportPhoto,
            width: cropW,
            height: cropH,
            isQr: false
          });
          console.log(`extractImagesFromPdf: ✓ Passport photo cropped from canvas (${cropW}x${cropH})`);
        }
      }
    }

    // Step 5: Scan for QR code in the cropped QR region
    console.log('extractImagesFromPdf: Scanning for QR code...');
    try {
      const qrViewport = page.getViewport({ scale: 2.0 });
      const qrCanvas = document.createElement('canvas');
      const qrCtx = qrCanvas.getContext('2d');
      
      const qrX = Math.floor(qrViewport.width * 0.70);
      const qrY = Math.floor(qrViewport.height * 0.70);
      const qrW = Math.floor(qrViewport.width * 0.25);
      const qrH = Math.floor(qrViewport.height * 0.25);

      qrCanvas.width = qrW;
      qrCanvas.height = qrH;

      if (qrCtx) {
        // Draw only the cropped QR region from page to save memory and CPU
        // We render page 1 at scale 2.0 to a temporary canvas and copy the region
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = qrViewport.width;
        tempCanvas.height = qrViewport.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          await page.render({ canvasContext: tempCtx, viewport: qrViewport }).promise;
          qrCtx.drawImage(tempCanvas, qrX, qrY, qrW, qrH, 0, 0, qrW, qrH);
          
          const imgData = qrCtx.getImageData(0, 0, qrW, qrH);
          const decoded = jsQR(imgData.data, qrW, qrH);
          if (decoded) {
            console.log('extractImagesFromPdf: ✓ QR decoded from crop:', decoded.data.slice(0, 80));
            result.qrCodeText = decoded.data;
            result.qrCodeImage = qrCanvas.toDataURL('image/png');
            result.allImages.push({
              src: result.qrCodeImage,
              width: qrW,
              height: qrH,
              isQr: true,
            });
          } else {
            console.log('extractImagesFromPdf: QR code not found in crop.');
          }
        }
      }
    } catch (qrErr) {
      console.warn('extractImagesFromPdf: QR scan error:', qrErr);
    }

    console.log('extractImagesFromPdf: ✓ Completed successfully.');
  } catch (err) {
    console.error('extractImagesFromPdf: Error:', err);
  }

  return result;
}

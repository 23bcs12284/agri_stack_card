import * as pdfjsLib from 'pdfjs-dist';
import { useFarmer } from '../context/FarmerContext';
import type { FarmerData } from '../context/FarmerContext';
import { extractTextFromPdf } from '../utils/pdfExtractor';
import { parseFarmerRegistryPDF } from '../utils/parser';
import { extractImagesFromPdf } from '../utils/imageExtractor';
import type { ExtractedImages } from '../utils/imageExtractor';
import { runOcrOnPdf } from '../utils/ocr';

export function usePdfParser() {
  const { setFarmerData, setLoadingStatus, addToast } = useFarmer();

  const parsePdf = async (file: File) => {
    console.log("PDF Selected", file.name);
    
    // Phase 1: Start Loading / Reading text
    setLoadingStatus({
      step: 'reading',
      progress: 10,
      message: 'Reading PDF document structure...',
    });

    let pdf: pdfjsLib.PDFDocumentProxy | null = null;
    let loadingTask: any = null;

    try {
      // Clone arrayBuffer before passing to avoid detachment issues
      const originalBuffer = await file.arrayBuffer();
      const arrayBuffer = originalBuffer.slice(0);
      console.log("ArrayBuffer", arrayBuffer.byteLength);

      console.log("Loading PDF");
      // Load PDF exactly once
      try {
        loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        pdf = await loadingTask.promise;
      } catch (loadErr: any) {
        console.error("usePdfParser: Failed to load PDF via pdfjsLib:", loadErr);
        throw new Error(`PDF Worker failed in pdfjsLib.getDocument(): ${loadErr.message || loadErr}`);
      }
      if (!pdf) {
        throw new Error("PDF Worker failed: Loaded PDF instance is null");
      }
      console.log("PDF Loaded");
      console.log("Total pages:", pdf.numPages);

      // Extract raw text from PDF directly
      console.log("Extracting Text");
      let fullText = '';
      let lines: string[] = [];
      let pdfItems: any[] = [];
      
      try {
        const textResult = await extractTextFromPdf(pdf);
        fullText = textResult.fullText;
        lines = textResult.lines;
        pdfItems = textResult.pdfItems || [];
        console.log("Text extracted:", fullText.length);
      } catch (textErr: any) {
        console.error("usePdfParser: Text extraction failed:", textErr);
        throw new Error(`Text extraction failed in pdfExtractor.ts / extractTextFromPdf(): ${textErr.message || textErr}`);
      }
      
      // Determine if document is scanned (less than 30 characters of text found)
      const isScanned = fullText.trim().length < 30;
      console.log("isScanned (OCR needed?):", isScanned);

      if (isScanned) {
        setLoadingStatus({
          step: 'ocr',
          progress: 25,
          message: 'Selectable text not found. Running English + Hindi OCR engine...',
        });

        console.log("Running OCR");
        try {
          // Run OCR on PDF pages (only for scanned documents)
          const ocrResult = await runOcrOnPdf(pdf, (ocrProgress) => {
            const calculatedProgress = 25 + Math.round(ocrProgress * 0.55);
            setLoadingStatus({
              step: 'ocr',
              progress: Math.min(calculatedProgress, 80),
              message: `OCR character scanning in progress... (${ocrProgress}%)`,
            });
          });

          fullText = ocrResult.fullText;
          lines = ocrResult.lines;
          console.log("OCR text extracted:", fullText.length);
        } catch (ocrErr: any) {
          console.error("usePdfParser: OCR execution failed:", ocrErr);
          throw new Error(`OCR failed in ocr.ts / runOcrOnPdf(): ${ocrErr.message || ocrErr}`);
        }
      }

      // Phase 2: Extract embedded images
      setLoadingStatus({
        step: 'extracting-photo',
        progress: 85,
        message: 'Locating passport photograph and scanning QR verification grids...',
      });

      console.log("Extracting Images");
      let imagesResult: ExtractedImages = { passportPhoto: '', qrCodeText: '', qrCodeImage: '', allImages: [] };
      try {
        imagesResult = await extractImagesFromPdf(pdf);
      } catch (imgErr: any) {
        // We log image failures but DO NOT crash the entire parsing flow
        console.error("usePdfParser: Image extraction failed (continuing without images):", imgErr);
        addToast(`Image extraction failed in imageExtractor.ts / extractImagesFromPdf(): ${imgErr.message || imgErr}`, 'info');
      }

      // Phase 3: Map details
      setLoadingStatus({
        step: 'generating',
        progress: 95,
        message: 'Mapping land schedules and auto-formatting card layout...',
      });

      console.log("Parsing Farmer Details");
      let parsedDetails: Partial<FarmerData> = {};
      try {
        parsedDetails = parseFarmerRegistryPDF(fullText, lines, pdfItems);
      } catch (parseErr: any) {
        console.error("usePdfParser: Parsing fields failed:", parseErr);
        throw new Error(`Parser failed in parser.ts / parseFarmerRegistryPDF(): ${parseErr.message || parseErr}`);
      }

      console.log("Generating Card");
      // Assemble final data structure
      const enrollmentId = parsedDetails.enrollmentId || '';
      const finalData: FarmerData = {
        farmerName: parsedDetails.farmerName || '',
        hindiName: parsedDetails.hindiName || '',
        dob: parsedDetails.dob || '',
        gender: parsedDetails.gender || '',
        age: parsedDetails.age || '',
        category: parsedDetails.category || 'General',
        mobile: parsedDetails.mobile || '',
        aadhaar: parsedDetails.aadhaar || '',
        farmerId: parsedDetails.farmerId || enrollmentId,
        enrollmentId: enrollmentId,
        address: parsedDetails.address || '',
        landRecords: parsedDetails.landRecords && parsedDetails.landRecords.length > 0
          ? parsedDetails.landRecords
          : [
              {
                state: parsedDetails.landRecords?.[0]?.state || '',
                district: parsedDetails.landRecords?.[0]?.district || '',
                subDistrict: parsedDetails.landRecords?.[0]?.subDistrict || '',
                village: '',
                surveyNumber: '',
                ownerName: parsedDetails.farmerName || '',
                identifierType: '',
                ownerType: 'Owner',
                shareType: '1/1',
                landArea: '',
                extentAssigned: '',
              },
            ],
        photo: imagesResult.passportPhoto || '',
        // Use extracted QR image, or decoded QR text, or fallback to generating from enrollment ID
        qr: imagesResult.qrCodeImage || imagesResult.qrCodeText || enrollmentId,
      };

      console.log("=== USEPDFPARSER DEBUG ===");
      console.table(finalData.landRecords);
      console.log("State records:", finalData.landRecords.length);

      setFarmerData(finalData);
      console.log("Completed Successfully");

      // Trigger user toast feedback
      if (!imagesResult.passportPhoto) {
        addToast('Embedded image not found. Passport photo could not be auto-extracted.', 'info');
      } else {
        addToast('Farmer photo extracted successfully!', 'success');
      }

      if (isScanned) {
        addToast('Scanned document processed via OCR successfully.', 'success');
      } else {
        addToast('Document data extracted successfully in under 1s!', 'success');
      }

      // Done
      setLoadingStatus({
        step: 'done',
        progress: 100,
        message: 'Extraction completed!',
      });

    } catch (error: any) {
      console.error('PDF Parser Flow Exception:', error);
      if (error && error.stack) {
        console.error(error.stack);
      }
      
      // Display the specific error details to the user
      addToast(`Error: ${error.message || 'Failed to parse PDF document.'}`, 'error');
      
      setLoadingStatus({
        step: 'idle',
        progress: 0,
        message: '',
      });
    } finally {
      if (pdf) {
        console.log("Cleaning up PDF page-cache resources");
        pdf.cleanup();
      }
      if (loadingTask) {
        console.log("Destroying PDF loading task worker instance");
        loadingTask.destroy();
      }
    }
  };

  return { parsePdf };
}

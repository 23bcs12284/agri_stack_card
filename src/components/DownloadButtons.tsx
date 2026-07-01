import React, { useState } from 'react';
import { useFarmer } from '../context/FarmerContext';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { HiArrowDownTray, HiPrinter } from 'react-icons/hi2';

export const DownloadButtons: React.FC = () => {
  const { farmerData, addToast, setLoadingStatus } = useFarmer();
  const [isExporting, setIsExporting] = useState(false);

  if (!farmerData) return null;

  const sanitizeFilename = (name: string) => {
    return name.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  };

  const exportPng = async () => {
    const frontEl = document.getElementById('card-front-side');
    const backEl = document.getElementById('card-back-side');

    if (!frontEl || !backEl) {
      addToast('Card elements not found. Please upload a PDF first.', 'error');
      return;
    }

    setIsExporting(true);
    setLoadingStatus({ step: 'generating', progress: 50, message: 'Rendering high-resolution card images...' });

    try {
      const filename = sanitizeFilename(farmerData.farmerName || 'farmer');

      // Export Front Side PNG
      const frontCanvas = await html2canvas(frontEl, {
        scale: 3, // High resolution ~300 DPI
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });
      const frontLink = document.createElement('a');
      frontLink.download = `${filename}_AgriStack_Card_Front.png`;
      frontLink.href = frontCanvas.toDataURL('image/png');
      frontLink.click();

      // Export Back Side PNG
      const backCanvas = await html2canvas(backEl, {
        scale: 3, // High resolution ~300 DPI
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });
      const backLink = document.createElement('a');
      backLink.download = `${filename}_AgriStack_Card_Back.png`;
      backLink.href = backCanvas.toDataURL('image/png');
      backLink.click();

      addToast('Front & Back card PNGs downloaded!', 'success');
    } catch (error) {
      console.error('PNG export failed:', error);
      addToast('Failed to export PNG. Try again.', 'error');
    } finally {
      setIsExporting(false);
      setLoadingStatus({ step: 'done', progress: 100, message: '' });
    }
  };

  const exportPdf = async () => {
    const frontEl = document.getElementById('card-front-side');
    const backEl = document.getElementById('card-back-side');

    if (!frontEl || !backEl) {
      addToast('Card elements not found. Please upload a PDF first.', 'error');
      return;
    }

    setIsExporting(true);
    setLoadingStatus({ step: 'generating', progress: 50, message: 'Generating print-ready PDF layout...' });

    try {
      const filename = sanitizeFilename(farmerData.farmerName || 'farmer');

      // Render cards to high-quality images
      const frontCanvas = await html2canvas(frontEl, { scale: 3, useCORS: true, allowTaint: true });
      const frontImg = frontCanvas.toDataURL('image/png');

      const backCanvas = await html2canvas(backEl, { scale: 3, useCORS: true, allowTaint: true });
      const backImg = backCanvas.toDataURL('image/png');

      // Create PDF in A4 Portrait mode (dimensions in mm: 210 x 297)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Card dimensions in mm on print sheet (Standard CR80 size: 85.6mm x 54mm)
      const cardWidth = 85.6;
      const cardHeight = 54;
      const xOffset = (210 - cardWidth) / 2; // Center horizontally

      // Add Titles and Guides
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(22, 101, 52); // Green shade
      pdf.text('AgriStack Farmer ID Card', 105, 25, { align: 'center' });
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text(`Farmer ID: ${farmerData.farmerId || 'N/A'}  |  Enrollment ID: ${farmerData.enrollmentId || 'N/A'}`, 105, 31, { align: 'center' });

      // Add Front Card
      pdf.addImage(frontImg, 'PNG', xOffset, 40, cardWidth, cardHeight);
      pdf.setDrawColor(226, 232, 240);
      pdf.rect(xOffset, 40, cardWidth, cardHeight); // Border card

      // Dotted Fold Indicator Line
      pdf.setDrawColor(148, 163, 184);
      pdf.setLineDashPattern([2, 2], 0);
      pdf.line(20, 102, 190, 102);
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(6.5);
      pdf.setTextColor(148, 163, 184);
      pdf.text('FOLD LINE / यहाँ से मोड़ें', 105, 100.5, { align: 'center' });

      // Add Back Card
      pdf.addImage(backImg, 'PNG', xOffset, 110, cardWidth, cardHeight);
      pdf.setLineDashPattern([], 0); // Reset
      pdf.setDrawColor(226, 232, 240);
      pdf.rect(xOffset, 110, cardWidth, cardHeight); // Border card

      // Assembly Instructions
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(71, 85, 105);
      pdf.text('Instructions for printing:', 30, 185);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(100, 116, 139);
      pdf.text('1. Print this A4 sheet on high-quality paper or cardstock (100% scale).', 30, 191);
      pdf.text('2. Cut along the solid outer border lines of the front and back cards.', 30, 196);
      pdf.text('3. Fold along the dotted center fold-line.', 30, 201);
      pdf.text('4. Paste the two sides together and laminate for a professional ID card.', 30, 206);

      // Footer branding
      pdf.setFontSize(7);
      pdf.setTextColor(148, 163, 184);
      pdf.text('Generated by AgriStack Farmer ID Generator app', 105, 275, { align: 'center' });

      // Save PDF file
      pdf.save(`${filename}_AgriStack_Card.pdf`);
      addToast('Print-ready PDF downloaded!', 'success');
    } catch (error) {
      console.error('PDF export failed:', error);
      addToast('Failed to generate PDF. Try again.', 'error');
    } finally {
      setIsExporting(false);
      setLoadingStatus({ step: 'done', progress: 100, message: '' });
    }
  };

  const handlePrint = () => {
    // We trigger standard window.print(). In index.css, print rules
    // handle isolating the card elements on an A4 layout.
    window.print();
    addToast('Opening print dialog...', 'info');
  };

  return (
    <div className="w-full flex flex-col sm:flex-row gap-3 items-center justify-center p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 no-print">
      <button
        onClick={exportPng}
        disabled={isExporting}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs dark:bg-slate-850 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800 transition-all active:scale-97 disabled:opacity-50"
      >
        <HiArrowDownTray className="h-4.5 w-4.5" />
        Download PNG
      </button>

      <button
        onClick={exportPdf}
        disabled={isExporting}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 rounded-xl text-sm font-bold text-white cursor-pointer shadow-md transition-all active:scale-97 disabled:opacity-50"
      >
        <HiArrowDownTray className="h-4.5 w-4.5" />
        Download PDF
      </button>

      <button
        onClick={handlePrint}
        disabled={isExporting}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-650 rounded-xl text-sm font-bold text-white cursor-pointer shadow-md transition-all active:scale-97 disabled:opacity-50"
      >
        <HiPrinter className="h-4.5 w-4.5" />
        Print Card
      </button>
    </div>
  );
};

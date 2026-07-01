import React, { useState, useEffect } from 'react';
import { useFarmer } from '../context/FarmerContext';
import { generateQrCode } from '../utils/qrGenerator';
import { motion, AnimatePresence } from 'framer-motion';
import { HiClipboard, HiClipboardDocumentCheck, HiMagnifyingGlassPlus } from 'react-icons/hi2';

/* ─── Small leaf SVG decoration ─────────────────────────────────────────── */
const LeafDecor: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 40 40" fill="currentColor">
    <path d="M20 2C14 10 6 14 2 14c1 8 5 16 18 24C33 30 37 22 38 14c-4 0-12-4-18-12z" />
    <line x1="20" y1="14" x2="20" y2="38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const CardFront: React.FC = () => {
  const { farmerData, addToast } = useFarmer();
  const [generatedQr, setGeneratedQr] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);

  useEffect(() => {
    if (!farmerData) return;
    if (farmerData.qr) {
      if (farmerData.qr.startsWith('data:') || farmerData.qr.startsWith('http')) {
        setGeneratedQr(farmerData.qr);
      } else {
        generateQrCode(farmerData.qr).then(setGeneratedQr);
      }
    } else {
      const content = farmerData.enrollmentId || farmerData.farmerId || 'AgriStack Farmer';
      generateQrCode(content).then(setGeneratedQr);
    }
  }, [farmerData]);

  if (!farmerData) return null;

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (farmerData.farmerId) {
      navigator.clipboard.writeText(farmerData.farmerId);
      setCopied(true);
      addToast('Farmer ID copied!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const displayAadhaar = (s: string) => {
    if (!s) return 'XXXX XXXX XXXX';
    const c = s.replace(/\s/g, '');
    if (c.length === 12) return `${c.slice(0,4)} ${c.slice(4,8)} ${c.slice(8,12)}`;
    return s;
  };

  return (
    <>
      {/* ── CARD ─────────────────────────────────────────────────────────── */}
      <div
        id="card-front-side"
        className="relative w-full select-none overflow-hidden rounded-xl bg-white shadow-2xl"
        style={{ fontFamily: "'Segoe UI', Arial, sans-serif", maxWidth: 700 }}
      >
        {/* ── HEADER ───────────────────────────────────────────────────── */}
        <div
          className="relative flex items-center justify-between px-4 py-2 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1a5c28 0%, #2d8a45 50%, #1a5c28 100%)' }}
        >
          {/* Left: Year + International badge */}
          <div className="flex flex-col items-center text-white z-10" style={{ minWidth: 56 }}>
            <div className="text-[11px] font-black leading-none" style={{ color: '#f9e04b' }}>2026</div>
            <div className="text-[7px] font-semibold text-center leading-tight opacity-90" style={{ color: '#a7f3d0' }}>
              International Year<br />of Cooperatives
            </div>
          </div>

          {/* Center: AgriStack title */}
          <div className="flex-1 flex flex-col items-center z-10">
            <div className="flex items-center gap-1">
              {/* AgriStack logo-style text */}
              <span className="font-black text-white text-xl tracking-tight leading-none">Agri</span>
              <div
                className="flex items-center justify-center rounded-full text-white font-black text-xl leading-none"
                style={{ background: '#2d8a45', border: '2px solid #f9e04b', width: 26, height: 26 }}
              >
                $
              </div>
              <span className="font-black text-white text-xl tracking-tight leading-none">tack</span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-black text-lg leading-none" style={{ color: '#f9e04b', fontFamily: 'serif' }}>
                फार्मर आईडी कार्ड
              </span>
            </div>
            <div className="text-[11px] font-bold italic" style={{ color: '#f9e04b' }}>
              (Farmer ID Card)
            </div>
          </div>

          {/* Right: Farmer illustration decorative */}
          <div className="flex items-center z-10" style={{ minWidth: 60 }}>
            <LeafDecor className="h-10 w-10 text-green-300 opacity-80" />
          </div>

          {/* Background leaf watermark */}
          <div className="absolute right-16 top-0 h-full flex items-center opacity-10 pointer-events-none">
            <LeafDecor className="h-16 w-16 text-white" />
          </div>
        </div>

        {/* ── BODY ─────────────────────────────────────────────────────── */}
        <div className="relative flex gap-3 px-4 py-3 bg-white" style={{ minHeight: 200 }}>
          {/* Background watermark */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]"
            style={{ zIndex: 0 }}
          >
            <LeafDecor className="h-52 w-52 text-green-800" />
          </div>

          {/* ── Photo ───────────────────────────────────────────────── */}
          <div className="flex flex-col items-center gap-1 z-10 flex-none">
            <div
              onClick={() => setIsPhotoZoomed(true)}
              className="relative overflow-hidden cursor-pointer group"
              style={{
                width: 110,
                height: 130,
                border: '3px solid #1a5c28',
                background: '#f1f5f9',
              }}
            >
              {farmerData.photo ? (
                <img
                  src={farmerData.photo}
                  alt="Farmer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1">
                  <svg className="h-10 w-10 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                  </svg>
                  <span className="text-[9px] font-semibold text-slate-400 text-center">Photo Not<br/>Available</span>
                </div>
              )}
              {farmerData.photo && (
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <HiMagnifyingGlassPlus className="h-6 w-6 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* ── Details ─────────────────────────────────────────────── */}
          <div className="flex-1 z-10 flex flex-col justify-center gap-1.5">
            {/* Name */}
            <div>
              <div className="font-black text-slate-800 leading-tight" style={{ fontSize: 18 }}>
                {farmerData.farmerName || 'Farmer Name'}
              </div>
              {farmerData.hindiName && (
                <div className="font-bold leading-tight mt-0.5" style={{ fontSize: 15, color: '#1a5c28', fontFamily: 'serif' }}>
                  {farmerData.hindiName}
                </div>
              )}
            </div>

            {/* Info rows */}
            {[
              { label: 'DOB', value: farmerData.dob },
              { label: 'Gender', value: farmerData.gender },
              { label: 'Age', value: farmerData.age },
              { label: 'Caste Category', value: farmerData.category },
              { label: 'Mobile No.', value: farmerData.mobile },
              { label: 'Aadhar No.', value: displayAadhaar(farmerData.aadhaar) },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-baseline gap-1 leading-tight">
                <span className="font-black text-slate-700" style={{ fontSize: 11, minWidth: 90 }}>
                  {label} :
                </span>
                <span className="font-semibold text-slate-700" style={{ fontSize: 11 }}>
                  {value || '—'}
                </span>
              </div>
            ))}
          </div>

          {/* ── QR Code ─────────────────────────────────────────────── */}
          <div className="flex flex-col items-center justify-center z-10 flex-none">
            <div
              className="flex items-center justify-center bg-white"
              style={{ width: 90, height: 90, border: '2px solid #1a5c28', padding: 3 }}
            >
              {generatedQr ? (
                <img src={generatedQr} alt="QR" className="w-full h-full" />
              ) : (
                <div className="w-full h-full bg-slate-100 animate-pulse rounded-sm" />
              )}
            </div>
            <span className="text-[8px] font-bold text-slate-500 mt-1 uppercase tracking-wide">
              Scan to Verify
            </span>
          </div>
        </div>

        {/* ── FOOTER – large Farmer ID banner ──────────────────────── */}
        <div
          className="relative flex items-center justify-center px-4 py-2 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1a5c28 0%, #2d8a45 50%, #1a5c28 100%)' }}
        >
          <div className="flex items-center gap-2 z-10">
            <span
              className="font-black tracking-widest"
              style={{ color: '#f9e04b', fontSize: 22, textShadow: '0 2px 4px rgba(0,0,0,0.4)', letterSpacing: '0.08em' }}
            >
              Farmer ID : {farmerData.farmerId || 'PENDING'}
            </span>
            {farmerData.farmerId && (
              <button
                onClick={handleCopyId}
                className="p-1 rounded opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                title="Copy ID"
              >
                {copied
                  ? <HiClipboardDocumentCheck className="h-4 w-4 text-yellow-300" />
                  : <HiClipboard className="h-4 w-4 text-yellow-200" />
                }
              </button>
            )}
          </div>

          {/* Watermark leaves */}
          <div className="absolute left-2 top-0 h-full flex items-center opacity-20 pointer-events-none">
            <LeafDecor className="h-10 w-10 text-green-300" />
          </div>
          <div className="absolute right-2 top-0 h-full flex items-center opacity-20 pointer-events-none">
            <LeafDecor className="h-10 w-10 text-green-300" />
          </div>
        </div>
      </div>

      {/* ── ZOOM MODAL ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isPhotoZoomed && farmerData.photo && (
          <div
            onClick={() => setIsPhotoZoomed(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm cursor-zoom-out p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              onClick={e => e.stopPropagation()}
              className="relative max-w-xs w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-4 flex flex-col items-center"
            >
              <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <img src={farmerData.photo} alt="Farmer portrait" className="w-full h-full object-cover" />
              </div>
              <div className="mt-3 text-sm font-bold text-slate-800">{farmerData.farmerName}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5 font-semibold">
                AgriStack Portrait
              </div>
              <button
                onClick={() => setIsPhotoZoomed(false)}
                className="absolute top-3 right-3 h-7 w-7 bg-slate-900/60 text-white rounded-full flex items-center justify-center hover:bg-slate-900/80 transition-colors cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

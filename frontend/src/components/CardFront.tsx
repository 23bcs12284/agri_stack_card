import React, { useState, useEffect } from 'react';
import { useFarmer } from '../context/FarmerContext';
import { generateQrCode } from '../utils/qrGenerator';

// Import local assets
import farmerSpade from '../assets/farmer_spade.png';

// Realistic 2026 IYC Logo (Pink/Teal Ribbon)
const CoopEmblem: React.FC = () => (
  <div className="flex flex-col items-center justify-center z-10 shrink-0 mt-0.5">
    <div className="relative w-10 h-7 flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 80">
        {/* Teal Swoosh */}
        <path d="M40 20 C60 10, 80 20, 85 40 C90 60, 75 75, 60 75 C45 75, 30 65, 30 50 C30 40, 40 30, 50 30" fill="none" stroke="#14b8a6" strokeWidth="8" strokeLinecap="round" />
        {/* Pink Swoosh */}
        <path d="M60 70 C40 80, 20 70, 15 50 C10 30, 25 15, 40 15 C55 15, 70 25, 70 40 C70 50, 60 60, 50 60" fill="none" stroke="#ec4899" strokeWidth="8" strokeLinecap="round" />
        {/* Yellow 2026 */}
        <text x="50" y="52" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="900" fill="#fef08a" textAnchor="middle">2026</text>
      </svg>
    </div>
    <div className="flex flex-col text-center leading-[1.1] mt-0.5">
      <span className="text-[5px] font-bold text-white uppercase">International Year</span>
      <span className="text-[5px] font-bold text-white uppercase">of Cooperatives</span>
    </div>
  </div>
);

// Leaf Watermark Component
const BackgroundLeaf: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = '', style }) => (
  <svg className={className} style={{ ...style, pointerEvents: 'none' }} viewBox="0 0 100 100">
    <path fill="currentColor" d="M50 15 C35 30, 30 50, 50 85 C70 50, 65 30, 50 15 Z" />
    <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M50 85 L50 20 M50 50 L38 40 M50 60 L62 50 M50 70 L40 62 M50 40 L60 30" />
  </svg>
);

// Bottom Left Solid Leaves + Wheat
const BottomLeftDecoration: React.FC = () => (
  <div className="absolute bottom-6 left-0 w-20 h-14 pointer-events-none z-10">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
      {/* Dark Green Leaves */}
      <path d="M0 100 L30 100 C30 80, 20 60, 0 50 Z" fill="#14532d" />
      <path d="M0 100 L50 100 C50 70, 30 50, 0 40 Z" fill="#166534" />
      <path d="M20 100 L60 100 C60 80, 50 60, 30 60 Z" fill="#15803d" />
      <path d="M0 80 C20 80, 40 60, 40 40 C20 40, 0 60, 0 80 Z" fill="#16a34a" />
      <path d="M20 90 C40 90, 60 70, 60 50 C40 50, 20 70, 20 90 Z" fill="#22c55e" />
      
      {/* White Wheat Silhouette */}
      <g transform="translate(15, 45) rotate(45) scale(0.6)" fill="#ffffff" opacity="0.8">
        <path d="M10 50 L15 40 L20 50 Z" />
        <path d="M15 40 L20 30 L25 40 Z" />
        <path d="M20 30 L25 20 L30 30 Z" />
        <path d="M25 20 L30 10 L35 20 Z" />
        <path d="M30 10 L35 0 L40 10 Z" />
        <path d="M10 50 L5 40 L15 35 Z" />
        <path d="M15 40 L10 30 L20 25 Z" />
        <path d="M20 30 L15 20 L25 15 Z" />
        <path d="M25 20 L20 10 L30 5 Z" />
        {/* Stem */}
        <path d="M5 50 L15 60 L13 62 L3 52 Z" />
      </g>
    </svg>
  </div>
);

export const CardFront: React.FC = () => {
  const { farmerData } = useFarmer();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    if (farmerData?.farmerId) {
      generateQrCode(farmerData.farmerId).then(setQrCodeDataUrl);
    }
  }, [farmerData?.farmerId]);

  if (!farmerData) return null;

  return (
    <div id="card-front-side" className="w-[620px] h-[391px] bg-white rounded-xl shadow-2xl overflow-hidden relative flex flex-col font-outfit border border-gray-200 animate-fade-in">
      
      {/* ── HEADER ── */}
      <div className="bg-[#166534] h-[74px] w-full flex items-center px-4 relative z-20 justify-between shrink-0">
        <CoopEmblem />
        
        {/* Center Titles */}
        <div className="flex flex-col items-center justify-center flex-grow -mt-0.5 ml-4 mr-16">
          <div className="flex items-center">
            <span className="text-[24px] font-black tracking-tight text-[#0f172a] mr-1">Agri</span>
            <svg className="w-5 h-6 text-[#22c55e] -mt-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C7.5 2 4 5.5 4 10C4 16 12 22 12 22C12 22 20 16 20 10C20 5.5 16.5 2 12 2Z" />
            </svg>
            <span className="text-[24px] font-black tracking-tight text-[#facc15]">Stack</span>
          </div>
          {/* Taglines */}
          <div className="flex flex-col items-center mt-[-4px]">
            <span className="text-[18px] font-bold text-white leading-tight">फार्मर आईडी कार्ड</span>
            <span className="text-[14px] font-bold text-[#facc15] leading-tight">(Farmer ID Card)</span>
          </div>
        </div>

        {/* Farmer Avatar - Integrated seamlessly using blend mode and no shadow */}
        <div className="absolute right-2 top-0 h-[80px] w-[80px] flex items-end justify-center z-30">
          <img src={farmerSpade} alt="Farmer" className="h-[95%] object-contain mix-blend-multiply opacity-90 pointer-events-none bg-transparent" />
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="flex-grow flex pt-4 pb-2 px-5 relative bg-white overflow-hidden">
        {/* Watermark leaf behind photo columns */}
        <BackgroundLeaf className="absolute -left-2 top-8 text-green-800 opacity-[0.07] w-28 h-28 rotate-[-15deg] pointer-events-none" />
        <BackgroundLeaf className="absolute right-24 top-6 text-green-800 opacity-[0.05] w-24 h-24 rotate-[25deg] pointer-events-none" />

        {/* Faint Background Logo / Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
          <svg viewBox="0 0 100 100" className="w-64 h-64">
            <path d="M50 10 L90 90 L10 90 Z" fill="#166534" />
          </svg>
        </div>

        <div className="flex w-full z-10 relative">
          {/* Photo Column */}
          <div className="w-[110px] flex flex-col pt-1 shrink-0">
            {/* Transparent background so watermark leaf/inner background is visible */}
            <div className="w-[96px] h-[122px] border-2 border-gray-300 rounded overflow-hidden bg-transparent relative">
              {farmerData.photo ? (
                <div className="relative w-full h-full bg-transparent">
                  <img src={farmerData.photo} alt="Farmer" className="w-full h-full object-cover bg-transparent" />
                  {/* Security watermark overlay to blend the photo into the card */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#166534]/10 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 opacity-[0.12] pointer-events-none" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, #166534 0, #166534 1px, transparent 0, transparent 8px)',
                    backgroundSize: '8px 8px'
                  }} />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Details Column */}
          <div className="flex-grow pl-1 flex flex-col justify-start">
            <h2 className="text-[#166534] text-[20px] font-bold leading-none tracking-tight">{farmerData.farmerName}</h2>
            <h2 className="text-[#22c55e] text-[17px] font-bold leading-tight mt-0.5 mb-1.5">{farmerData.hindiName}</h2>
            
            <div className="grid grid-cols-[115px_1fr] gap-y-1 text-[14px] font-bold text-[#0f172a]">
              <div className="text-gray-900">DOB</div>
              <div>: {farmerData.dob}</div>
              
              <div className="text-gray-900">Gender</div>
              <div>: {farmerData.gender}</div>
              
              <div className="text-gray-900">Age</div>
              <div>: {farmerData.age}</div>
              
              <div className="text-gray-900">Caste Category</div>
              <div>: {farmerData.category}</div>
              
              <div className="text-gray-900">Mobile No.</div>
              <div>: {farmerData.mobile}</div>
              
              <div className="text-gray-900">Aadhar No.</div>
              <div>: {farmerData.aadhaar}</div>

              {/* Farmer ID - Moved into the details grid (bold, green, and readable) */}
              <div className="text-[#166534] font-black text-[15px] mt-1">Farmer ID</div>
              <div className="text-[#166534] font-black text-[15px] mt-1 tracking-wider">: {farmerData.farmerId}</div>
            </div>
          </div>

          {/* QR Code Column */}
          <div className="w-[110px] flex flex-col justify-end items-end pb-1 shrink-0 relative z-30">
            {qrCodeDataUrl && (
              <div className="flex flex-col items-center">
                <div className="bg-white p-1 border-2 border-gray-800 rounded shadow-sm relative">
                  <img src={qrCodeDataUrl} alt="QR Code" className="w-[75px] h-[75px]" />
                  {/* Faint overlay on QR code border */}
                  <div className="absolute inset-0 border border-white/50 pointer-events-none" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomLeftDecoration />

      {/* ── FOOTER (Thin premium green strip with yellow accent border) ── */}
      <div className="bg-[#166534] h-[25px] w-full shrink-0 border-t-2 border-yellow-400 relative z-20" />
      
    </div>
  );
};

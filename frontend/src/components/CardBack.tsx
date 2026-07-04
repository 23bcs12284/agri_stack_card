import React from 'react';
import { useFarmer } from '../context/FarmerContext';

// Import local assets
import farmerCrops from '../assets/farmer_crops.png';

// Bottom Left Solid Leaves
const BottomLeftDecoration: React.FC = () => (
  <div className="absolute bottom-6 left-0 w-24 h-16 pointer-events-none z-10">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
      {/* Dark Green Leaves */}
      <path d="M0 100 L30 100 C30 80, 20 60, 0 50 Z" fill="#14532d" />
      <path d="M0 100 L50 100 C50 70, 30 50, 0 40 Z" fill="#166534" />
      <path d="M20 100 L60 100 C60 80, 50 60, 30 60 Z" fill="#15803d" />
      <path d="M0 80 C20 80, 40 60, 40 40 C20 40, 0 60, 0 80 Z" fill="#16a34a" />
      <path d="M20 90 C40 90, 60 70, 60 50 C40 50, 20 70, 20 90 Z" fill="#22c55e" />
    </svg>
  </div>
);

export const CardBack: React.FC = () => {
  const { farmerData } = useFarmer();

  if (!farmerData) return null;

  const recordsCount = farmerData.landRecords?.length || 0;
  
  // Dynamic Sizing Map based on number of land records (optimized for better readability)
  const addressFontSize = recordsCount >= 3 ? '13px' : '14px';
  const titleFontSize = recordsCount >= 3 ? '15px' : '16px';
  const tableFontSize = recordsCount >= 3 ? '8.5px' : recordsCount === 2 ? '9.5px' : '10px';
  const annexureTitleFontSize = recordsCount >= 3 ? '10px' : '11px';
  const annexureTextFontSize = recordsCount >= 3 ? '5.8px' : '6.5px';
  const annexureLineHeight = recordsCount >= 3 ? '1.15' : '1.25';

  const bodyPadding = recordsCount >= 3 ? 'p-2.5' : 'p-3';
  const addressMargin = recordsCount >= 3 ? 'mb-1.5' : 'mb-2.5';
  const tableHeaderPadding = recordsCount >= 3 ? 'py-0.5 px-0.5' : 'py-1 px-1';
  const tableCellPadding = recordsCount >= 3 ? 'py-0.5 px-0.5' : 'py-0.8 px-0.8';
  const annexureMarginTop = recordsCount >= 3 ? 'mt-1' : 'mt-2';

  return (
    <div id="card-back-side" className="w-[620px] h-[391px] bg-white rounded-xl shadow-2xl overflow-hidden relative flex flex-col font-outfit border border-gray-200">
      
      {/* ── HEADER ── */}
      <div className="bg-[#166534] h-[65px] w-full flex flex-col items-center justify-center shrink-0 border-b-2 border-yellow-400 relative z-20">
        <span className="text-xl font-bold text-white tracking-wide">Farmer Enrollment Id</span>
        <span className="text-[22px] font-black tracking-widest text-[#4ade80]" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.4)' }}>
          {farmerData.farmerId}
        </span>
      </div>

      {/* ── BODY ── */}
      <div className={`flex-grow flex flex-col relative z-10 ${bodyPadding}`}>
        
        {/* Address */}
        <div className={`text-gray-800 font-bold px-2 ${addressMargin}`} style={{ fontSize: addressFontSize }}>
          <span className="text-[#166534]">Address .:</span> {farmerData.address}
        </div>

        {/* Table Title */}
        <h3 className="text-[#166534] font-bold px-2" style={{ fontSize: titleFontSize, marginBottom: recordsCount >= 3 ? '2px' : '4px' }}>
          Land Ownership Details
        </h3>

        {/* Table */}
        <div className="w-full border border-gray-300 rounded overflow-hidden">
          <table className="w-full text-center leading-tight">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-300">
                <th className={`${tableHeaderPadding} border-r border-gray-300 font-bold text-gray-700`} style={{ fontSize: tableFontSize }}>State</th>
                <th className={`${tableHeaderPadding} border-r border-gray-300 font-bold text-gray-700`} style={{ fontSize: tableFontSize }}>District</th>
                <th className={`${tableHeaderPadding} border-r border-gray-300 font-bold text-gray-700`} style={{ fontSize: tableFontSize }}>Sub<br/>District</th>
                <th className={`${tableHeaderPadding} border-r border-gray-300 font-bold text-gray-700`} style={{ fontSize: tableFontSize }}>Village</th>
                <th className={`${tableHeaderPadding} border-r border-gray-300 font-bold text-gray-700`} style={{ fontSize: tableFontSize }}>SNo.</th>
                <th className={`${tableHeaderPadding} border-r border-gray-300 font-bold text-gray-700`} style={{ fontSize: tableFontSize }}>S/Sno.</th>
                <th className={`${tableHeaderPadding} border-r border-gray-300 font-bold text-gray-700`} style={{ fontSize: tableFontSize }}>Owner<br/>Name</th>
                <th className={`${tableHeaderPadding} border-r border-gray-300 font-bold text-gray-700`} style={{ fontSize: tableFontSize }}>Identifier<br/>name & Type</th>
                <th className={`${tableHeaderPadding} border-r border-gray-300 font-bold text-gray-700`} style={{ fontSize: tableFontSize }}>Owner<br/>Type</th>
                <th className={`${tableHeaderPadding} border-r border-gray-300 font-bold text-gray-700`} style={{ fontSize: tableFontSize }}>Owner<br/>ShareType</th>
                <th className={`${tableHeaderPadding} border-r border-gray-300 font-bold text-gray-700`} style={{ fontSize: tableFontSize }}>Extent Total<br/>Area<br/>(Acre,Hectare.)</th>
                <th className={`${tableHeaderPadding} font-bold text-gray-700`} style={{ fontSize: tableFontSize }}>Extent Assigned<br/>Area<br/>(Acre,Hectare.)</th>
              </tr>
            </thead>
            <tbody>
              {farmerData.landRecords && farmerData.landRecords.length > 0 ? (
                farmerData.landRecords.map((land, index) => (
                  <tr key={index} className="border-b border-gray-200 last:border-b-0">
                    <td className={`${tableCellPadding} border-r border-gray-200 font-bold text-gray-900`} style={{ fontSize: tableFontSize }}>{land.state || '-'}</td>
                    <td className={`${tableCellPadding} border-r border-gray-200 font-bold text-gray-900 break-words`} style={{ wordBreak: 'break-word', whiteSpace: 'normal', fontSize: tableFontSize }}>{land.district || '-'}</td>
                    <td className={`${tableCellPadding} border-r border-gray-200 font-bold text-gray-900 break-words`} style={{ wordBreak: 'break-word', whiteSpace: 'normal', fontSize: tableFontSize }}>{land.subDistrict || '-'}</td>
                    <td className={`${tableCellPadding} border-r border-gray-200 font-bold text-gray-900 break-words`} style={{ wordBreak: 'break-word', whiteSpace: 'normal', fontSize: tableFontSize }}>{land.village || '-'}</td>
                    <td className={`${tableCellPadding} border-r border-gray-200 font-bold text-gray-900`} style={{ fontSize: tableFontSize }}>{land.surveyNumber || '-'}</td>
                    <td className={`${tableCellPadding} border-r border-gray-200 font-bold text-gray-900`} style={{ fontSize: tableFontSize }}>-</td>
                    <td className={`${tableCellPadding} border-r border-gray-200 font-bold text-gray-900 break-words`} style={{ wordBreak: 'break-word', whiteSpace: 'normal', fontSize: tableFontSize }}>{land.ownerName || '-'}</td>
                    <td className={`${tableCellPadding} border-r border-gray-200 font-bold text-gray-900 break-words`} style={{ wordBreak: 'break-word', whiteSpace: 'normal', fontSize: tableFontSize }}>{land.identifierType || '-'}</td>
                    <td className={`${tableCellPadding} border-r border-gray-200 font-bold text-gray-900`} style={{ fontSize: tableFontSize }}>{land.ownerType || '-'}</td>
                    <td className={`${tableCellPadding} border-r border-gray-200 font-bold text-gray-900 break-words`} style={{ wordBreak: 'break-word', whiteSpace: 'normal', fontSize: tableFontSize }}>{land.shareType || '-'}</td>
                    <td className={`${tableCellPadding} border-r border-gray-200 font-bold text-gray-900`} style={{ fontSize: tableFontSize }}>{land.landArea || '-'}</td>
                    <td className={`${tableCellPadding} font-bold text-gray-900`} style={{ fontSize: tableFontSize }}>{land.extentAssigned || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="py-4 text-gray-400 font-bold">No Land Details Available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Annexure & Disclaimer */}
        <div className={`px-2 flex-grow flex flex-col justify-end ${annexureMarginTop}`}>
          <h4 className="text-center font-bold text-gray-800" style={{ fontSize: annexureTitleFontSize }}>Annexure</h4>
          <p className="text-gray-500 text-justify pb-1" style={{ fontSize: annexureTextFontSize, lineHeight: annexureLineHeight }}>
            I also give my consent to State and Central Governments to use my aadhaar, my identity information and my data available into Pradhan Mantri Kisan SammanNidhi, Pradhan Mantri Fasal Bima Yojana, State Direct Benefit Transfer project, Nanaji Deshmukh Krishi Sanjivani Prakalp (NDKSP - PoCRA) and variousSchemes under MahaDBT for creation of required registries to be used for the crop survey project.
            <br/>
            I agree to share my identity Information along with Aadhaar number with State and Central Governments for the purpose of e-KYC or Yes/No Authenticationwith the Unique Identification Authority of India for the purpose of the "Farmer Registry" project. I also give consent to the State and Central Government to seedmy data into the Farmer Registry and other relevant registries to be used for the implementation of this project, for delivering various services and welfarebenefits of State and Central Government for making payment through Direct Benefit Transfer. I also give my consent to the State and Central Governments touse my Aadhaar, my identity information, and my data available in Pradhan Mantri Kisan Samman Nidhi, Pradhan Mantri Fasal Bima Yojana, State DirectBenefit Transfer project, and various Schemes under Bihar Agriculture Welfare for creation of Farmer Registry and other required registries to be used forthe Agri Stack project. I agree to share my identity Information along with my Aadhaar number with the State Government to seed my Aadhaar data with mylandholding in the Record of Rights maintained by the Revenue Department of the State. I understand that Aadhaar seeded land holding data across the statewill be available to Revenue Department for various purposes of Good Governance.
          </p>
        </div>

      </div>

      <BottomLeftDecoration />

      {/* Bottom Right Graphic */}
      <div className="absolute bottom-[25px] -right-2 h-[80px] w-[90px] flex items-end justify-center z-10 pointer-events-none">
        <img src={farmerCrops} alt="Farmer with crops" className="h-[95%] object-contain mix-blend-multiply opacity-90" />
      </div>

      {/* ── FOOTER ── */}
      <div className="bg-[#f0fdf4] h-[25px] w-full flex items-center justify-center shrink-0 border-t border-[#86efac] relative z-20">
        <span className="text-[11px] font-bold text-[#166534] tracking-wide">
          Department of Agriculture
        </span>
      </div>

    </div>
  );
};

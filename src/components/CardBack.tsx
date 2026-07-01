import React, { useState } from 'react';
import { useFarmer } from '../context/FarmerContext';
import { HiClipboard, HiClipboardDocumentCheck } from 'react-icons/hi2';

/* ─── Decorative leaf ───────────────────────────────────────────────────────── */
const Leaf: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 40 40" fill="currentColor">
    <path d="M20 2C14 10 6 14 2 14c1 8 5 16 18 24C33 30 37 22 38 14c-4 0-12-4-18-12z" />
    <line x1="20" y1="14" x2="20" y2="38" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const ANNEXURE = `I give my consent to State and Central Governments to use my Aadhaar, identity information and data available in Pradhan Mantri Kisan Samman Nidhi (PM-KISAN), Pradhan Mantri Fasal Bima Yojana (PMFBY), State Direct Benefit Transfer (DBT) projects, and various Schemes for creation of required registries for the crop survey and AgriStack project.

I agree to share my Identity Information along with Aadhaar number with State and Central Governments for the purpose of e-KYC or Verified Authentication with the Unique Identification Authority of India (UIDAI) for the purpose of the "Farmer Registry" project. I also give consent to the State and Central Government to seed data into the Farmer Registry and other relevant registries to be used for the implementation of this project, for delivering various schemes and welfare benefits of State and Central Government for making payment through Direct Benefit Transfer (DBT).

I understand that Aadhaar-seeded land holding data across the state will be available to Revenue Department for various purposes of Government Governance.`;

export const CardBack: React.FC = () => {
  const { farmerData, addToast } = useFarmer();
  const [copied, setCopied] = useState(false);

  if (!farmerData) return null;

  const handleCopyEnrollment = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (farmerData.enrollmentId) {
      navigator.clipboard.writeText(farmerData.enrollmentId);
      setCopied(true);
      addToast('Enrollment ID copied!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      id="card-back-side"
      className="relative w-full select-none overflow-hidden bg-white shadow-2xl"
      style={{ fontFamily: "'Segoe UI', Arial, sans-serif", maxWidth: 700 }}
    >
      {/* ── HEADER: Enrollment ID ──────────────────────────────────────────── */}
      <div
        className="relative flex flex-col items-center justify-center px-4 py-3 text-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a5c28 0%, #2d8a45 50%, #1a5c28 100%)' }}
      >
        <div className="text-white font-bold z-10" style={{ fontSize: 13, opacity: 0.9 }}>
          Farmer Enrollment Id
        </div>
        <div className="flex items-center gap-2 z-10">
          <span
            className="font-black tracking-widest"
            style={{ color: '#f9e04b', fontSize: 17, letterSpacing: '0.04em' }}
          >
            {farmerData.enrollmentId || 'N/A'}
          </span>
          {farmerData.enrollmentId && (
            <button
              onClick={handleCopyEnrollment}
              className="p-0.5 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
              title="Copy Enrollment ID"
            >
              {copied
                ? <HiClipboardDocumentCheck className="h-4 w-4 text-yellow-300" />
                : <HiClipboard className="h-4 w-4 text-yellow-200" />
              }
            </button>
          )}
        </div>
        {/* Decorative leaves */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
          <Leaf className="h-8 w-8 text-green-300" />
        </div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
          <Leaf className="h-8 w-8 text-green-300" />
        </div>
      </div>

      {/* ── BODY ──────────────────────────────────────────────────────────── */}
      <div className="relative px-4 pt-3 pb-2 bg-white">
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]" style={{ zIndex: 0 }}>
          <Leaf className="h-48 w-48 text-green-800" />
        </div>

        {/* ── Address ──────────────────────────────────────────────────── */}
        <p className="text-slate-800 font-semibold mb-2 z-10 relative" style={{ fontSize: 11 }}>
          <span className="font-black">Address .:</span>{' '}
          {farmerData.address || 'Address not available'}
        </p>

        {/* ── Land Ownership Table ─────────────────────────────────────── */}
        <div className="z-10 relative">
          <p className="font-black text-slate-800 mb-1" style={{ fontSize: 13 }}>
            Land Ownership Details
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 8,
                border: '1px solid #bbb',
              }}
            >
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  {[
                    'State',
                    'District',
                    'Sub\nDistrict',
                    'Village',
                    'Survey\nNo.',
                    'Owner Name',
                    'Identifier\nName & Type',
                    'Owner\nType',
                    'Owner\nShare Type',
                    'Extent\nTotal Area',
                    'Extent\nAssigned Area',
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        border: '1px solid #bbb',
                        padding: '3px 4px',
                        whiteSpace: 'pre-line',
                        lineHeight: '1.25',
                        textAlign: 'center',
                        fontWeight: 700,
                        color: '#374151',
                        minWidth: 34,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {farmerData.landRecords.length > 0
                  ? farmerData.landRecords.map((rec, idx) => (
                      <tr
                        key={idx}
                        style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}
                      >
                        <td style={tdStyle}>{rec.state || '—'}</td>
                        <td style={tdStyle}>{rec.district || '—'}</td>
                        <td style={tdStyle}>{rec.subDistrict || '—'}</td>
                        <td style={tdStyle}>{rec.village || '—'}</td>
                        <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{rec.surveyNumber || '—'}</td>
                        <td style={tdStyle}>{rec.ownerName || '—'}</td>
                        <td style={tdStyle}>{rec.identifierType || '—'}</td>
                        <td style={tdStyle}>{rec.ownerType || '—'}</td>
                        <td style={tdStyle}>{rec.shareType || '—'}</td>
                        <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{rec.landArea || '—'}</td>
                        <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{rec.extentAssigned || '0.000000'}</td>
                      </tr>
                    ))
                  : /* Empty rows placeholder */
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 11 }).map((__, j) => (
                          <td key={j} style={{ ...tdStyle, height: 22 }} />
                        ))}
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Annexure ─────────────────────────────────────────────────── */}
        <div className="mt-2 z-10 relative">
          <p className="font-black text-slate-700 text-center mb-1" style={{ fontSize: 11 }}>
            Annexure
          </p>
          <p
            className="text-slate-600 leading-relaxed"
            style={{ fontSize: 7.5, lineHeight: '1.45', textAlign: 'justify' }}
          >
            {ANNEXURE}
          </p>
        </div>
      </div>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <div
        className="relative flex items-center justify-center px-4 py-2 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a5c28 0%, #2d8a45 50%, #1a5c28 100%)' }}
      >
        {/* <p
          className="text-center font-bold z-10"
          style={{ color: '#f9e04b', fontSize: 10 }}
        >
          This Card is For Personal Use Only and is not a government-issued identity document.
        </p> */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-25 pointer-events-none">
          <Leaf className="h-7 w-7 text-green-300" />
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-25 pointer-events-none">
          <Leaf className="h-7 w-7 text-green-300" />
        </div>
      </div>
    </div>
  );
};

const tdStyle: React.CSSProperties = {
  border: '1px solid #bbb',
  padding: '3px 4px',
  textAlign: 'center',
  verticalAlign: 'middle',
  fontWeight: 600,
  color: '#1f2937',
};

import React from 'react';
import { CardFront } from './CardFront';
import { CardBack } from './CardBack';
import { useFarmer } from '../context/FarmerContext';

export const Preview: React.FC = () => {
  const { farmerData } = useFarmer();
  if (!farmerData) return null;

  return (
    <div className="w-full flex flex-col items-center gap-6">

      {/* Section header */}
      <div className="text-center no-print">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Live Card Preview</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Front and back of the generated AgriStack Farmer ID Card
        </p>
      </div>

      {/* Cards — side by side on ≥lg, stacked on mobile */}
      <div className="w-full flex flex-col xl:flex-row gap-8 items-start justify-center">

        {/* Front */}
        <div className="w-full flex flex-col gap-2 items-center" style={{ maxWidth: 700 }}>
          <div className="w-full flex justify-between px-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider no-print">
            <span>Front Side / मुख भाग</span>
          </div>
          <CardFront />
        </div>

        {/* Back */}
        <div className="w-full flex flex-col gap-2 items-center" style={{ maxWidth: 700 }}>
          <div className="w-full flex justify-between px-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider no-print">
            <span>Back Side / पृष्ठ भाग</span>
          </div>
          <CardBack />
        </div>

      </div>
    </div>
  );
};

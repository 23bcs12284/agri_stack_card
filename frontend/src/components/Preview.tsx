import React, { useRef, useState, useEffect } from 'react';
import { CardFront } from './CardFront';
import { CardBack } from './CardBack';
import { useFarmer } from '../context/FarmerContext';

// Custom wrapper to scale the cards to fit their containers visually on smaller viewports
const ResponsiveScaleWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const newScale = Math.min(1, width / 620);
        setScale(newScale);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    // Extra timeout resize trigger to handle lazy loading layouts
    const timer = setTimeout(handleResize, 150);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full flex-1 min-w-0 flex justify-center overflow-hidden print-wrapper" style={{ height: 391 * scale }}>
      <div 
        className="print-card-scale"
        style={{ 
          transform: `scale(${scale})`, 
          transformOrigin: 'top center',
          width: 620,
          height: 391,
          flexShrink: 0
        }}
      >
        {children}
      </div>
    </div>
  );
};

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

      {/* Cards — side by side on ≥xl, stacked on mobile */}
      <div className="w-full flex flex-col xl:flex-row gap-6 items-center xl:items-start justify-center">

        {/* Front */}
        <div className="w-full flex flex-col gap-2 items-center" style={{ maxWidth: 620 }}>
          <div className="w-full flex justify-between px-2 text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider no-print">
            <span>Front Side / मुख भाग</span>
          </div>
          <div className="w-full flex justify-center py-1.5">
            <ResponsiveScaleWrapper>
              <CardFront />
            </ResponsiveScaleWrapper>
          </div>
        </div>

        {/* Back */}
        <div className="w-full flex flex-col gap-2 items-center" style={{ maxWidth: 620 }}>
          <div className="w-full flex justify-between px-2 text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider no-print">
            <span>Back Side / पृष्ठ भाग</span>
          </div>
          <div className="w-full flex justify-center py-1.5">
            <ResponsiveScaleWrapper>
              <CardBack />
            </ResponsiveScaleWrapper>
          </div>
        </div>

      </div>
    </div>
  );
};

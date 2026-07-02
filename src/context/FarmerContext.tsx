import React, { createContext, useContext, useState, useEffect } from 'react';

export interface LandRecord {
  state: string;
  district: string;
  subDistrict: string;
  village: string;
  surveyNumber: string;
  surveySubNumber?: string;
  ownerName: string;
  identifierType: string;   // Identifier name & Type
  identifierName?: string;
  ownerType: string;
  shareType: string;
  ownerShareType?: string;
  landArea: string;         // Extent Total Area
  extentTotalArea?: string;
  extentAssigned: string;   // Extent Assigned Area
  extentAssignedArea?: string;
}

export interface FarmerData {
  farmerName: string;
  hindiName: string;
  dob: string;
  gender: string;
  age: string;
  category: string;
  mobile: string;
  aadhaar: string;
  farmerId: string;
  enrollmentId: string;
  address: string;
  landRecords: LandRecord[];
  photo: string;
  qr: string;
}

export type LoaderStep = 'idle' | 'reading' | 'extracting-photo' | 'ocr' | 'generating' | 'done';

export interface LoadingStatus {
  step: LoaderStep;
  progress: number;
  message: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface FarmerContextType {
  farmerData: FarmerData | null;
  setFarmerData: React.Dispatch<React.SetStateAction<FarmerData | null>>;
  updateFarmerField: (field: keyof FarmerData, value: any) => void;
  updateLandRecord: (index: number, field: keyof LandRecord, value: string) => void;
  addLandRecord: () => void;
  removeLandRecord: (index: number) => void;
  loadingStatus: LoadingStatus;
  setLoadingStatus: React.Dispatch<React.SetStateAction<LoadingStatus>>;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toasts: Toast[];
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  resetAll: () => void;
}



const FarmerContext = createContext<FarmerContextType | undefined>(undefined);

export const FarmerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [farmerData, setFarmerData] = useState<FarmerData | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>({
    step: 'idle',
    progress: 0,
    message: '',
  });
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
      if (savedTheme) return savedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Apply Theme class to document root
  useEffect(() => {
    if (farmerData) {
      console.log("=== CONTEXT DEBUG ===");
      console.table(farmerData.landRecords);
      console.log("Context records:", farmerData.landRecords.length);
    }
  }, [farmerData]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
  };

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const updateFarmerField = (field: keyof FarmerData, value: any) => {
    setFarmerData((prev) => {
      if (!prev) return null;
      
      // Calculate age if DOB changes
      let updatedAge = prev.age;
      if (field === 'dob' && typeof value === 'string') {
        const calculatedAge = calculateAgeFromDob(value);
        if (calculatedAge) {
          updatedAge = calculatedAge;
        }
      }

      const updated = { ...prev, [field]: value };
      if (field === 'dob') {
        updated.age = updatedAge;
      }
      return updated;
    });
  };

  const updateLandRecord = (index: number, field: keyof LandRecord, value: string) => {
    setFarmerData((prev) => {
      if (!prev) return null;
      const updatedRecords = [...prev.landRecords];
      updatedRecords[index] = { ...updatedRecords[index], [field]: value };
      return { ...prev, landRecords: updatedRecords };
    });
  };

  const addLandRecord = () => {
    setFarmerData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        landRecords: [
          ...prev.landRecords,
          {
            state: prev.landRecords[0]?.state || '',
            district: prev.landRecords[0]?.district || '',
            subDistrict: prev.landRecords[0]?.subDistrict || '',
            village: '',
            surveyNumber: '',
            ownerName: prev.farmerName || '',
            identifierType: '',
            ownerType: '',
            shareType: '',
            landArea: '',
            extentAssigned: '',
          },
        ],
      };
    });
    addToast('New land record added', 'success');
  };

  const removeLandRecord = (index: number) => {
    setFarmerData((prev) => {
      if (!prev) return null;
      if (prev.landRecords.length <= 1) {
        addToast('At least one land record is required', 'error');
        return prev;
      }
      const updatedRecords = prev.landRecords.filter((_, idx) => idx !== index);
      return { ...prev, landRecords: updatedRecords };
    });
    addToast('Land record removed', 'info');
  };

  const calculateAgeFromDob = (dobString: string): string => {
    try {
      let parts: string[] = [];
      if (dobString.includes('/')) {
        parts = dobString.split('/');
      } else if (dobString.includes('-')) {
        parts = dobString.split('-');
      }
      if (parts.length !== 3) return '';

      let birthDate: Date;
      if (parts[0].length === 4) {
        birthDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      } else if (parts[2].length === 4) {
        birthDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      } else {
        return '';
      }

      if (isNaN(birthDate.getTime())) return '';

      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 0 ? age.toString() : '';
    } catch {
      return '';
    }
  };

  const resetAll = () => {
    setFarmerData(null);
    setLoadingStatus({ step: 'idle', progress: 0, message: '' });
    addToast('Application reset', 'info');
  };

  return (
    <FarmerContext.Provider
      value={{
        farmerData,
        setFarmerData,
        updateFarmerField,
        updateLandRecord,
        addLandRecord,
        removeLandRecord,
        loadingStatus,
        setLoadingStatus,
        theme,
        setTheme,
        toasts,
        addToast,
        removeToast,
        resetAll,
      }}
    >
      {children}
    </FarmerContext.Provider>
  );
};

export const useFarmer = () => {
  const context = useContext(FarmerContext);
  if (!context) {
    throw new Error('useFarmer must be used within a FarmerProvider');
  }
  return context;
};

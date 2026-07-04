import React, { useState } from 'react';
import { useFarmer } from '../context/FarmerContext';
import { HiUser, HiMap, HiPhoto, HiPlusCircle, HiTrash } from 'react-icons/hi2';

export const EditableForm: React.FC = () => {
  const { 
    farmerData, 
    updateFarmerField, 
    updateLandRecord, 
    addLandRecord, 
    removeLandRecord, 
    addToast 
  } = useFarmer();
  const [activeTab, setActiveTab] = useState<'personal' | 'land' | 'photo'>('personal');

  if (!farmerData) return null;

  // Handle local photo upload override
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        addToast('Please upload an image file.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        updateFarmerField('photo', base64);
        addToast('Farmer photo updated successfully!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-md p-6 dark:bg-slate-900 dark:border-slate-800">
      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
        Edit Card Details
      </h3>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 mb-6 gap-2">
        <button
          onClick={() => setActiveTab('personal')}
          className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 px-1.5 transition-all cursor-pointer ${
            activeTab === 'personal'
              ? 'border-green-600 text-green-700 dark:border-green-400 dark:text-green-400'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <HiUser className="h-4 w-4" />
          Personal Details
        </button>
        <button
          onClick={() => setActiveTab('land')}
          className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 px-1.5 transition-all cursor-pointer ${
            activeTab === 'land'
              ? 'border-green-600 text-green-700 dark:border-green-400 dark:text-green-400'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <HiMap className="h-4 w-4" />
          Land Records ({farmerData.landRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('photo')}
          className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 px-1.5 transition-all cursor-pointer ${
            activeTab === 'photo'
              ? 'border-green-600 text-green-700 dark:border-green-400 dark:text-green-400'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <HiPhoto className="h-4 w-4" />
          Photo & QR
        </button>
      </div>

      {/* Form Content */}
      <div className="min-h-[350px]">
        {activeTab === 'personal' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 dark:text-slate-400">
                  Farmer Name (English)
                </label>
                <input
                  type="text"
                  value={farmerData.farmerName}
                  onChange={(e) => updateFarmerField('farmerName', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold outline-hidden focus:border-green-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-green-400 transition-all text-slate-800 dark:text-white"
                  placeholder="Farmer Name in English"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 dark:text-slate-400">
                  Farmer Name (Hindi)
                </label>
                <input
                  type="text"
                  value={farmerData.hindiName}
                  onChange={(e) => updateFarmerField('hindiName', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold outline-hidden focus:border-green-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-green-400 transition-all text-slate-800 dark:text-white"
                  placeholder="कृषक का नाम (हिन्दी में)"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 dark:text-slate-400">
                  Date of Birth (DOB)
                </label>
                <input
                  type="text"
                  value={farmerData.dob}
                  onChange={(e) => updateFarmerField('dob', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold outline-hidden focus:border-green-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-green-400 transition-all text-slate-800 dark:text-white"
                  placeholder="DD/MM/YYYY or YYYY-MM-DD"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 dark:text-slate-400">
                  Gender
                </label>
                <select
                  value={farmerData.gender}
                  onChange={(e) => updateFarmerField('gender', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold outline-hidden focus:border-green-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-green-400 transition-all text-slate-800 dark:text-white"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 dark:text-slate-400">
                  Age
                </label>
                <input
                  type="text"
                  value={farmerData.age}
                  onChange={(e) => updateFarmerField('age', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold outline-hidden focus:border-green-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-green-400 transition-all text-slate-800 dark:text-white"
                  placeholder="Age in years"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 dark:text-slate-400">
                  Category
                </label>
                <input
                  type="text"
                  value={farmerData.category}
                  onChange={(e) => updateFarmerField('category', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold outline-hidden focus:border-green-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-green-400 transition-all text-slate-800 dark:text-white"
                  placeholder="Gen / OBC / SC / ST"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 dark:text-slate-400">
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={farmerData.mobile}
                  onChange={(e) => updateFarmerField('mobile', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold outline-hidden focus:border-green-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-green-400 transition-all text-slate-800 dark:text-white"
                  placeholder="10 digit mobile number"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 dark:text-slate-400">
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  value={farmerData.aadhaar}
                  onChange={(e) => updateFarmerField('aadhaar', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold outline-hidden focus:border-green-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-green-400 transition-all text-slate-800 dark:text-white"
                  placeholder="XXXX XXXX XXXX"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 dark:text-slate-400">
                  Farmer ID
                </label>
                <input
                  type="text"
                  value={farmerData.farmerId}
                  onChange={(e) => updateFarmerField('farmerId', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold outline-hidden focus:border-green-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-green-400 transition-all text-slate-800 dark:text-white"
                  placeholder="AgriStack Farmer Registration ID"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 dark:text-slate-400">
                  Enrollment ID
                </label>
                <input
                  type="text"
                  value={farmerData.enrollmentId}
                  onChange={(e) => updateFarmerField('enrollmentId', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold outline-hidden focus:border-green-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-green-400 transition-all text-slate-800 dark:text-white"
                  placeholder="Enrollment ID"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 dark:text-slate-400">
                Residential Address
              </label>
              <textarea
                value={farmerData.address}
                onChange={(e) => updateFarmerField('address', e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold outline-hidden focus:border-green-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-green-400 transition-all text-slate-800 dark:text-white"
                placeholder="Full address of farmer residence"
              />
            </div>
          </div>
        )}

        {activeTab === 'land' && (
          <div className="space-y-6">
            {farmerData.landRecords.map((record, index) => (
              <div 
                key={index} 
                className="relative rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/20"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wide">
                    Land Record #{index + 1}
                  </h4>
                  {farmerData.landRecords.length > 1 && (
                    <button
                      onClick={() => removeLandRecord(index)}
                      className="text-red-500 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                    >
                      <HiTrash className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-800 dark:text-white">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">State</label>
                    <input
                      type="text"
                      value={record.state}
                      onChange={(e) => updateLandRecord(index, 'state', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">District</label>
                    <input
                      type="text"
                      value={record.district}
                      onChange={(e) => updateLandRecord(index, 'district', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Sub District / Tehsil</label>
                    <input
                      type="text"
                      value={record.subDistrict}
                      onChange={(e) => updateLandRecord(index, 'subDistrict', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Village</label>
                    <input
                      type="text"
                      value={record.village}
                      onChange={(e) => updateLandRecord(index, 'village', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Survey / Khasra No.</label>
                    <input
                      type="text"
                      value={record.surveyNumber}
                      onChange={(e) => updateLandRecord(index, 'surveyNumber', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Owner Name</label>
                    <input
                      type="text"
                      value={record.ownerName}
                      onChange={(e) => updateLandRecord(index, 'ownerName', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Identifier Name &amp; Type</label>
                    <input
                      type="text"
                      value={record.identifierType}
                      onChange={(e) => updateLandRecord(index, 'identifierType', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Owner Type</label>
                    <input
                      type="text"
                      value={record.ownerType}
                      onChange={(e) => updateLandRecord(index, 'ownerType', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Share Type</label>
                    <input
                      type="text"
                      value={record.shareType}
                      onChange={(e) => updateLandRecord(index, 'shareType', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Extent Total Area</label>
                    <input
                      type="text"
                      value={record.landArea}
                      onChange={(e) => updateLandRecord(index, 'landArea', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Extent Assigned Area</label>
                    <input
                      type="text"
                      value={record.extentAssigned}
                      onChange={(e) => updateLandRecord(index, 'extentAssigned', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={addLandRecord}
              className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-green-500 py-3 text-sm font-bold text-green-700 hover:bg-green-50/50 dark:text-green-400 dark:hover:bg-green-950/20 cursor-pointer transition-all active:scale-99"
            >
              <HiPlusCircle className="h-5 w-5" />
              Add Land Record Row
            </button>
          </div>
        )}

        {activeTab === 'photo' && (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative h-32 w-28 rounded-xl border-2 border-slate-200 bg-slate-50 dark:border-slate-850 dark:bg-slate-950 overflow-hidden shadow-inner flex items-center justify-center">
                {farmerData.photo ? (
                  <img src={farmerData.photo} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[10px] font-bold text-slate-400 uppercase text-center px-1">No Image</span>
                )}
              </div>
              
              <div className="flex flex-col items-center">
                <label className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700 shadow-md cursor-pointer transition-all active:scale-95">
                  <HiPhoto className="h-4 w-4" />
                  Upload Custom Portrait
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 text-center max-w-[240px]">
                  Override the photo extracted from the PDF. Upload a vertical passport photo for the best card alignment.
                </p>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 dark:text-slate-400">
                Verification QR Code Text (Optional Override)
              </label>
              <input
                type="text"
                value={farmerData.qr && !farmerData.qr.startsWith('data:') ? farmerData.qr : ''}
                onChange={(e) => updateFarmerField('qr', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold outline-hidden focus:border-green-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-green-400 transition-all text-slate-800 dark:text-white"
                placeholder={farmerData.farmerId || 'AgriStack Verification Data'}
              />
              <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">
                Changing this updates the text encoded within the QR code. Useful if you want the QR code to point to a specific government URL or reference string.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

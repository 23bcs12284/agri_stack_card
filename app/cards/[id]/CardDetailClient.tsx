"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFarmer } from '@/context/FarmerContext';
import type { FarmerData, LandRecord } from '@/context/FarmerContext';
import { getCardByIdApi, deleteCardApi, updateCardApi } from '@/lib/api/card.api';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Preview } from '@/components/Preview';
import { EditableForm } from '@/components/EditableForm';
import { DownloadButtons } from '@/components/DownloadButtons';
import { motion } from 'framer-motion';
import { HiArrowLeft, HiTrash, HiArrowPath, HiCheckCircle } from 'react-icons/hi2';

interface CardDetailClientProps {
  id: string;
}

export default function CardDetailClient({ id }: CardDetailClientProps) {
  const router = useRouter();
  const { farmerData, setFarmerData, addToast, setLoadingStatus } = useFarmer();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchCard = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await getCardByIdApi(id);
        const card = response.data.data;

        // Map backend card data to FarmerData format
        const mapped: FarmerData = {
          farmerName: card.farmerName || '',
          hindiName: card.hindiName || '',
          dob: card.dob || '',
          gender: card.gender || '',
          age: card.age || '',
          category: card.category || 'General',
          mobile: card.mobile || '',
          aadhaar: card.aadhaar || '',
          farmerId: card.farmerId || '',
          enrollmentId: card.enrollmentId || '',
          address: card.address || '',
          photo: card.photo || '',
          qr: card.qr || '',
          landRecords: (card.landRecords || []).map((lr: any): LandRecord => ({
            state: lr.state || '',
            district: lr.district || '',
            subDistrict: lr.subDistrict || '',
            village: lr.village || '',
            surveyNumber: lr.surveyNumber || '',
            surveySubNumber: lr.surveySubNumber || '',
            ownerName: lr.ownerName || '',
            identifierType: lr.identifierName || '',
            identifierName: lr.identifierName || '',
            ownerType: lr.ownerType || '',
            shareType: lr.shareType || '',
            ownerShareType: lr.shareType || '',
            landArea: lr.totalArea || '',
            extentTotalArea: lr.totalArea || '',
            extentAssigned: lr.assignedArea || '',
            extentAssignedArea: lr.assignedArea || '',
          })),
        };

        setFarmerData(mapped);
        setLoadingStatus({ step: 'done', progress: 100, message: '' });
      } catch (err: any) {
        console.error('Failed to fetch card:', err);
        setError(err.response?.data?.message || 'Failed to load card');
        addToast('Failed to load card details', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCard();

    return () => {
      // Clean up farmer data when leaving
      setFarmerData(null);
      setLoadingStatus({ step: 'idle', progress: 0, message: '' });
    };
  }, [id]);

  const handleSave = async () => {
    if (!id || !farmerData) return;
    setIsSaving(true);
    try {
      await updateCardApi(id, {
        farmerName: farmerData.farmerName,
        hindiName: farmerData.hindiName,
        dob: farmerData.dob,
        gender: farmerData.gender,
        age: farmerData.age,
        category: farmerData.category,
        mobile: farmerData.mobile,
        aadhaar: farmerData.aadhaar,
        farmerId: farmerData.farmerId,
        enrollmentId: farmerData.enrollmentId,
        address: farmerData.address,
        photo: farmerData.photo,
        qr: farmerData.qr,
        landRecords: farmerData.landRecords.map((lr) => ({
          state: lr.state,
          district: lr.district,
          subDistrict: lr.subDistrict,
          village: lr.village,
          surveyNumber: lr.surveyNumber,
          surveySubNumber: lr.surveySubNumber || '',
          ownerName: lr.ownerName,
          identifierName: lr.identifierType || lr.identifierName || '',
          ownerType: lr.ownerType,
          shareType: lr.shareType,
          totalArea: lr.landArea || lr.extentTotalArea || '',
          assignedArea: lr.extentAssigned || lr.extentAssignedArea || '',
        })),
      });
      addToast('Card saved successfully!', 'success');
    } catch (err: any) {
      console.error('Failed to save card:', err);
      addToast('Failed to save changes', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await deleteCardApi(id);
      addToast('Card deleted successfully', 'success');
      router.push('/');
    } catch (err: any) {
      console.error('Failed to delete card:', err);
      addToast('Failed to delete card', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading card details...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="text-lg font-bold text-red-500 mb-4">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors cursor-pointer"
            >
              <HiArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      <Header />

      <main className="flex-1 flex flex-col justify-start">
        <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">

          {/* Top action bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 no-print">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <HiArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 active:scale-95"
              >
                {isSaving ? (
                  <HiArrowPath className="h-4 w-4 animate-spin" />
                ) : (
                  <HiCheckCircle className="h-4 w-4" />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-sm font-bold transition-all cursor-pointer dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/50 active:scale-95"
              >
                <HiTrash className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>

          {/* Card Preview + Editor */}
          {farmerData && (
            <div className="w-full flex flex-col gap-8 items-stretch justify-start">
              <div className="flex flex-col gap-6 items-center">
                <Preview />
                <DownloadButtons />
              </div>

              <hr className="border-slate-200 dark:border-slate-800 no-print" />

              <div className="w-full max-w-4xl mx-auto no-print">
                <EditableForm />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Delete Card?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              This action cannot be undone. The farmer card and all associated land records will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      <Footer />
    </div>
  );
}

'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface PromotionModalProps {
  studentId: string;
  currentClass: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PromotionModal({ studentId, currentClass, onClose, onSuccess }: PromotionModalProps) {
  const [newClass, setNewClass] = useState(currentClass);
  const [isSaving, setIsSaving] = useState(false);

  const handlePromote = async () => {
    setIsSaving(true);
    try {
      const studentRef = doc(db, 'students', studentId);
      await updateDoc(studentRef, { class: newClass });
      onSuccess();
    } catch (error) {
      console.error('Error promoting student:', error);
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  const classes = ['Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6', 'Graduated'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Promote Student</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="newClass" className="block text-sm font-medium text-gray-700">New Class</label>
            <select
              id="newClass"
              value={newClass}
              onChange={(e) => setNewClass(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              {classes.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handlePromote}
            disabled={isSaving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {isSaving ? 'Promoting...' : 'Promote'}
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import PromotionModal from '@/components/student/PromotionModal';
import DocumentManager from '@/components/student/DocumentManager';

interface Student {
  id: string;
  name: string;
  class: string;
  admissionNumber: string;
  gender: string;
  dateOfBirth?: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail?: string;
  address?: string;
  healthInformation?: string;
  status?: string;
  createdAt?: any;
}

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchStudentDetails();
  }, [params.id]);

  async function fetchStudentDetails() {
    setLoading(true);
    try {
      const docRef = doc(db, 'students', params.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setStudent({ id: docSnap.id, ...docSnap.data() } as Student);
      } else {
        setError('Student not found');
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
      setError('Failed to load student details');
    } finally {
      setLoading(false);
    }
  }

  const handlePromotionSuccess = () => {
    setShowPromotionModal(false);
    fetchStudentDetails(); // Refetch data to show updated class
  };

  const handleTransfer = async () => {
    if (!student) return;
    if (confirm('Are you sure you want to transfer this student? This action cannot be undone.')) {
      try {
        const studentRef = doc(db, 'students', student.id);
        await updateDoc(studentRef, { status: 'transferred', updatedAt: new Date() });
        alert('Student transferred successfully!');
        router.push('/dashboard/students');
      } catch (error) {
        console.error('Error transferring student:', error);
        alert('Failed to transfer student.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <p className="text-red-700">{error || 'Student not found'}</p>
        <button
          onClick={() => router.push('/dashboard/students')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Back to Students
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{student.name}</h2>
        <div className="flex space-x-4">
          import { generateStudentIdCard } from '@/lib/pdf';

// ... (rest of the component)

          <button
            onClick={handleTransfer}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Transfer
          </button>
          <button
            onClick={() => generateStudentIdCard(student)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Generate ID Card
          </button>
          <button
            onClick={() => setShowPromotionModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Promote/Graduate
          </button>
          <button
            onClick={() => router.push(`/dashboard/students/${student.id}/edit`)}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
          >
            Edit
          </button>
          <button
            onClick={() => router.push('/dashboard/students')}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Student Status Badge */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-500">Admission Number</span>
              <h3 className="text-lg font-medium">{student.admissionNumber}</h3>
            </div>
            <div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {student.status === 'active' ? 'Active' : student.status}
              </span>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="text-sm text-gray-500">Full Name</span>
              <p>{student.name}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Class</span>
              <p>{student.class}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Gender</span>
              <p>{student.gender}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Date of Birth</span>
              <p>{student.dateOfBirth || 'Not provided'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Admission Date</span>
              <p>{student.createdAt ? student.createdAt.toDate().toLocaleDateString() : 'Not available'}</p>
            </div>
          </div>
        </div>

        {/* Guardian Information */}
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium mb-4">Guardian Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="text-sm text-gray-500">Guardian Name</span>
              <p>{student.guardianName}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Guardian Phone</span>
              <p>{student.guardianPhone}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Guardian Email</span>
              <p>{student.guardianEmail || 'Not provided'}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-sm text-gray-500">Address</span>
              <p>{student.address || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Health Information */}
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">Health Information</h3>
          <div>
            <span className="text-sm text-gray-500">Health Notes</span>
            <p>{student.healthInformation || 'No health information provided'}</p>
          </div>
        </div>

        {/* Documents Section */}
        <div className="p-6 border-t">
          <h3 className="text-lg font-medium mb-4">Documents</h3>
          <DocumentManager studentId={student.id} />
        </div>
      </div>

      {showPromotionModal && (
        <PromotionModal
          studentId={student.id}
          currentClass={student.class}
          onClose={() => setShowPromotionModal(false)}
          onSuccess={handlePromotionSuccess}
        />
      )}
    </div>
  );
}

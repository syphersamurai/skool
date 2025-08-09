'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function ParentDashboard() {
  const { user } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchParentData() {
      if (!user) return;

      try {
        const q = query(collection(db, "students"), where("guardian_id", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const childrenData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setChildren(childrenData);
      } catch (error) {
        console.error('Error fetching parent data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchParentData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Parent Dashboard</h2>
      {children.length > 0 ? (
        <div className="space-y-4">
          {children.map(child => (
            <div key={child.id} className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold">{child.name}</h3>
              <p>Class: {child.class}</p>
              {/* Add more child-specific info here */}
            </div>
          ))}
        </div>
      ) : (
        <p>No children found.</p>
      )}
    </div>
  );
}

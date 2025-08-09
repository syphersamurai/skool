'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

interface Notification {
  id: string;
  message: string;
  timestamp: any;
  read: boolean;
}

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      if (!user) return;

      try {
        const q = query(
          collection(db, 'notifications'),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc'),
          limit(10)
        );
        const querySnapshot = await getDocs(q);
        const notificationsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Notification[];
        setNotifications(notificationsData);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, [user]);

  if (loading) {
    return <div className="p-4">Loading notifications...</div>;
  }

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-20">
      <div className="p-4 font-bold border-b">Notifications</div>
      <div className="divide-y">
        {notifications.length > 0 ? (
          notifications.map(notif => (
            <div key={notif.id} className={`p-4 ${notif.read ? 'bg-gray-50' : 'bg-white'}`}>
              <p className="text-sm">{notif.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(notif.timestamp?.toDate()).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <div className="p-4 text-sm text-gray-500">No new notifications.</div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import api from '../api/client';

const Notification = () => {
  const [notification, setNotification] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) return;

    // Poll for notifications every 30 seconds
    const fetchNotification = async () => {
      try {
        const res = await api.get(`/api/notifications.php?user_id=${user.id}`);
        const data = res.data;
        if (data && !data.read) {
          setNotification(data);
        }
      } catch {
        // Notifications endpoint may not exist yet; fail silently
      }
    };

    fetchNotification();
    const interval = setInterval(fetchNotification, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleClose = async () => {
    if (!user || !notification) return;
    try {
      await api.put(`/api/notifications.php?user_id=${user.id}`, { read: true });
    } catch {
      // fail silently
    }
    setNotification(null);
  };

  if (!notification) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`p-4 rounded-lg shadow-lg max-w-md ${
        notification.type === 'approval' ? 'bg-green-50' : 'bg-red-50'
      }`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {notification.type === 'approval' ? (
              <FaCheckCircle className="h-6 w-6 text-green-500" />
            ) : (
              <FaTimesCircle className="h-6 w-6 text-red-500" />
            )}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-light-text dark:text-dark-text">
              {notification.type === 'approval' ? 'Account Approved!' : 'Account Rejected'}
            </p>
            <p className="mt-1 text-sm text-light-textMuted dark:text-dark-textMuted">
              {notification.message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleClose}
              className="inline-flex text-light-textMuted dark:text-dark-textMuted hover:text-light-textMuted dark:text-dark-textMuted focus:outline-none"
            >
              <span className="sr-only">Close</span>
              <FaTimesCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification;
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { notesAPI } from '@/api/services';

const NotificationContext = createContext({ unreadCount: 0, refresh: () => {} });

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef(null);

  const fetchCount = useCallback(async () => {
    if (!user || user.role !== 'student') { setUnreadCount(0); return; }
    try {
      // Lightweight dedicated endpoint (just counts) instead of fetching the
      // full notes list every poll just to read one field off it.
      const data = await notesAPI.unreadCount();
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // silent fail
    }
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== 'student') { setUnreadCount(0); return; }
    fetchCount();
    intervalRef.current = setInterval(fetchCount, 60_000); // poll every 60s
    return () => clearInterval(intervalRef.current);
  }, [user, fetchCount]);

  return (
    <NotificationContext.Provider value={{ unreadCount, refresh: fetchCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
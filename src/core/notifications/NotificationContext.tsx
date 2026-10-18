import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ToastNotification } from '@carbon/react';
import { createPortal } from 'react-dom';

export type NotificationKind = 'error' | 'info' | 'info-square' | 'success' | 'warning' | 'warning-alt';

export interface Notification {
  id: string;
  kind: NotificationKind;
  title: string;
  subtitle: ReactNode;
  caption?: string;
  timeout?: number;
}

export interface Alert {
  id: string;
  kind: NotificationKind;
  title: string;
  subtitle: ReactNode;
  timestamp: Date;
  read: boolean;
}

interface NotificationContextType {
  notify: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 'mock-1',
      kind: 'info',
      title: 'System Update',
      subtitle: 'The system has been updated to version 2.4.0.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
    },
    {
      id: 'mock-2',
      kind: 'warning',
      title: 'Scheduled Maintenance',
      subtitle: 'Maintenance scheduled for tonight at 2:00 AM UTC.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false,
    }
  ]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications((prev) => [...prev, newNotification]);

    if (notification.timeout !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.timeout || 5000);
    }
  }, [removeNotification]);

  const addAlert = useCallback((alert: Omit<Alert, 'id' | 'timestamp' | 'read'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newAlert: Alert = { ...alert, id, timestamp: new Date(), read: false };
    setAlerts((prev) => [newAlert, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  }, []);

  const markAllAsRead = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  }, []);

  return (
    <NotificationContext.Provider value={{ notify, removeNotification, alerts, addAlert, markAsRead, markAllAsRead }}>
      {children}
      {createPortal(
        <div style={{ position: 'fixed', top: '3rem', right: '1rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {notifications.map((n) => (
            <div key={n.id}>
              <ToastNotification
                kind={n.kind as any}
                title={n.title}
                subtitle={n.subtitle as any}
                caption={n.caption}
                timeout={n.timeout || 5000}
                onCloseButtonClick={() => removeNotification(n.id)}
              />
            </div>
          ))}
        </div>,
        document.body
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

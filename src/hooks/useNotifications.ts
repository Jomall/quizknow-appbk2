import { useState, useEffect, useCallback } from 'react';
import { Bell, MessageCircle, UserPlus, Award, AlertCircle } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'message' | 'connection' | 'achievement' | 'system' | 'course';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  imageUrl?: string;
  metadata?: Record<string, any>;
}

interface UseNotificationsProps {
  userId: string;
  limit?: number;
}

export function useNotifications({ userId, limit = 20 }: UseNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Mock notifications for demo
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'message',
      title: 'New Message',
      message: 'Sarah sent you a message about your course',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      read: false,
      actionUrl: '/messages/sarah',
    },
    {
      id: '2',
      type: 'connection',
      title: 'Connection Request',
      message: 'John wants to connect with you',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
      actionUrl: '/connections/requests',
    },
    {
      id: '3',
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: 'You completed 100 quizzes!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: true,
      actionUrl: '/achievements',
    },
    {
      id: '4',
      type: 'course',
      title: 'Course Update',
      message: 'New content added to Advanced React',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      read: true,
      actionUrl: '/courses/react-advanced',
    },
  ];

  const loadNotifications = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newNotifications = page === 1 
        ? mockNotifications 
        : [...mockNotifications].reverse().slice(0, limit);
      
      setNotifications(prev => page === 1 ? newNotifications : [...prev, ...newNotifications]);
      setUnreadCount(newNotifications.filter(n => !n.read).length);
      setHasMore(page < 3); // Mock pagination
    } catch (err) {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const markAsRead = useCallback(async (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return MessageCircle;
      case 'connection':
        return UserPlus;
      case 'achievement':
        return Award;
      case 'course':
        return Bell;
      case 'system':
        return AlertCircle;
      default:
        return Bell;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const randomNotification: Notification = {
        id: Date.now().toString(),
        type: ['message', 'connection', 'achievement', 'course'][Math.floor(Math.random() * 4)] as Notification['type'],
        title: 'New Notification',
        message: 'This is a real-time notification',
        timestamp: new Date(),
        read: false,
      };
      
      setNotifications(prev => [randomNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    }, 30000); // Add new notification every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationIcon,
    formatTimeAgo,
  };
}

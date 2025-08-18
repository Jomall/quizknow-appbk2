import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UserPresence {
  userId: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen?: Date;
}

interface TypingIndicator {
  userId: string;
  conversationId: string;
  isTyping: boolean;
}

interface RealTimeNotification {
  id: string;
  type: 'message' | 'connection' | 'achievement' | 'course' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  count?: number;
}

export const useRealTime = (userId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [userPresence, setUserPresence] = useState<Map<string, UserPresence>>(new Map());
  const [typingIndicators, setTypingIndicators] = useState<Map<string, TypingIndicator>>(new Map());
  const [realTimeNotifications, setRealTimeNotifications] = useState<RealTimeNotification[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) return;

    const newSocket = io('http://localhost:3001', {
      auth: { userId },
      transports: ['websocket']
    });

    newSocket.on('connect', () => {
      console.log('Connected to real-time server');
    });

    newSocket.on('user-presence', (presence: UserPresence[]) => {
      const presenceMap = new Map<string, UserPresence>();
      presence.forEach(p => presenceMap.set(p.userId, p));
      setUserPresence(presenceMap);
    });

    newSocket.on('typing-indicator', (indicator: TypingIndicator) => {
      setTypingIndicators(prev => {
        const newMap = new Map(prev);
        if (indicator.isTyping) {
          newMap.set(indicator.userId, indicator);
        } else {
          newMap.delete(indicator.userId);
        }
        return newMap;
      });
    });

    newSocket.on('real-time-notification', (notification: RealTimeNotification) => {
      setRealTimeNotifications(prev => [notification, ...prev]);
    });

    newSocket.on('online-users', (users: string[]) => {
      setOnlineUsers(users);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  const updatePresence = useCallback((status: UserPresence['status']) => {
    if (socket) {
      socket.emit('update-presence', { userId, status });
    }
  }, [socket, userId]);

  const sendTypingIndicator = useCallback((conversationId: string, isTyping: boolean) => {
    if (socket) {
      socket.emit('typing-indicator', { userId, conversationId, isTyping });
    }
  }, [socket, userId]);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    if (socket) {
      socket.emit('mark-notification-read', { userId, notificationId });
    }
    setRealTimeNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, [socket, userId]);

  return {
    socket,
    userPresence,
    typingIndicators,
    realTimeNotifications,
    onlineUsers,
    updatePresence,
    sendTypingIndicator,
    markNotificationAsRead
  };
};

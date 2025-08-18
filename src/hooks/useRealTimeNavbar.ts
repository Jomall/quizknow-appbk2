import { useState, useEffect, useCallback } from 'react';
import { useNavbarStore } from '@/stores/navbarStore';
import { Notification, UserRole } from '@/types/navbar.types';

interface UserPresence {
  userId: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen?: Date;
}

interface TypingIndicator {
  userId: string;
  conversationId: string;
  isTyping: boolean;
  timestamp: number;
}

interface LiveQuizUpdate {
  id: string;
  quizId: string;
  type: 'active_players' | 'time_remaining' | 'activity';
  message?: string;
  count?: number;
  time?: string;
  timestamp: Date;
}

interface RealTimeNavbarState {
  // Real-time features
  userPresence: Map<string, UserPresence>;
  typingIndicators: Map<string, TypingIndicator>;
  liveQuizUpdates: LiveQuizUpdate[];
  
  // Connection state
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  
  // Actions
  updatePresence: (status: 'online' | 'away' | 'busy' | 'offline') => void;
  sendTypingIndicator: (conversationId: string, isTyping: boolean) => void;
  markNotificationAsRead: (notificationId: string) => void;
  addRealTimeNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  updateLiveQuiz: (quizId: string, update: Omit<LiveQuizUpdate, 'id' | 'quizId' | 'timestamp'>) => void;
}

export const useRealTimeNavbar = (userId?: string) => {
  const {
    notifications,
    unreadCount,
    addNotification,
    markNotificationAsRead: markStoreNotificationAsRead,
    updateUnreadCount
  } = useNavbarStore();

  const [realTimeState, setRealTimeState] = useState<Map<string, UserPresence>>(new Map());
  const [typingIndicators, setTypingIndicators] = useState<Map<string, TypingIndicator>>(new Map());
  const [liveQuizUpdates, setLiveQuizUpdates] = useState<LiveQuizUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');

  // Initialize real-time features
  useEffect(() => {
    if (!userId) {
      setConnectionStatus('disconnected');
      return;
    }

    // Simulate WebSocket connection
    const connectWebSocket = () => {
      setConnectionStatus('connecting');
      
      // Simulate connection delay
      setTimeout(() => {
        setIsConnected(true);
        setConnectionStatus('connected');
        
        // Initialize mock presence data
        const mockPresence = new Map<string, UserPresence>([
          [userId, { userId, status: 'online' as const }],
          ['user2', { userId: 'user2', status: 'away' as const, lastSeen: new Date(Date.now() - 300000) }],
          ['user3', { userId: 'user3', status: 'online' as const }],
        ]);
        setRealTimeState(mockPresence);
        
        // Simulate initial notifications
        const mockNotifications: Notification[] = [
          {
            id: 'rt-1',
            type: 'course',
            title: 'New Course Available',
            message: 'Advanced React Patterns just launched!',
            timestamp: new Date(),
            read: false,
          },
          {
            id: 'rt-2',
            type: 'achievement',
            title: 'Achievement Unlocked',
            message: 'You completed 10 quizzes this week!',
            timestamp: new Date(Date.now() - 3600000),
            read: false,
          },
        ];
        
        mockNotifications.forEach(notification => {
          addNotification(notification);
        });
        
        updateUnreadCount();
      }, 1000);
    };

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      setIsConnected(false);
      setConnectionStatus('disconnected');
    };
  }, [userId, addNotification, updateUnreadCount]);

  // Handle typing indicators cleanup
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setTypingIndicators(prev => {
        const newMap = new Map(prev);
        newMap.forEach((value, key) => {
          if (Date.now() - value.timestamp > 3000) {
            newMap.delete(key);
          }
        });
        return newMap;
      });
    }, 1000);

    return () => clearInterval(cleanupInterval);
  }, []);

  // Update presence status
  const updatePresence = useCallback((status: 'online' | 'away' | 'busy' | 'offline') => {
    if (!userId) return;
    
    setRealTimeState(prev => {
      const newMap = new Map(prev);
      newMap.set(userId, {
        userId,
        status,
        lastSeen: status === 'offline' ? new Date() : undefined,
      });
      return newMap;
    });
    
    // In real implementation, emit to WebSocket
    console.log(`User ${userId} presence updated to: ${status}`);
  }, [userId]);

  // Send typing indicator
  const sendTypingIndicator = useCallback((conversationId: string, isTyping: boolean) => {
    if (!userId) return;
    
    const key = `${userId}_${conversationId}`;
    setTypingIndicators(prev => {
      const newMap = new Map(prev);
      if (isTyping) {
        newMap.set(key, {
          userId,
          conversationId,
          isTyping,
          timestamp: Date.now(),
        });
      } else {
        newMap.delete(key);
      }
      return newMap;
    });
    
    // In real implementation, emit to WebSocket
    console.log(`Typing indicator: ${isTyping ? 'started' : 'stopped'} in ${conversationId}`);
  }, [userId]);

  // Mark notification as read
  const markNotificationAsRead = useCallback((notificationId: string) => {
    markStoreNotificationAsRead(notificationId);
  }, [markStoreNotificationAsRead]);

  // Add real-time notification
  const addRealTimeNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `rt-${Date.now()}`,
      timestamp: new Date(),
    };
    addNotification(newNotification);
  }, [addNotification]);

  // Update live quiz
  const updateLiveQuiz = useCallback((quizId: string, update: Omit<LiveQuizUpdate, 'id' | 'quizId' | 'timestamp'>) => {
    const newUpdate: LiveQuizUpdate = {
      id: `quiz-${Date.now()}`,
      quizId,
      ...update,
      timestamp: new Date(),
    };
    setLiveQuizUpdates(prev => [newUpdate, ...prev.slice(0, 9)]);
  }, []);

  // Clear live quiz updates
  const clearLiveQuizUpdates = useCallback(() => {
    setLiveQuizUpdates([]);
  }, []);

  // Get typing users for a conversation
  const getTypingUsers = useCallback((conversationId: string) => {
    return Array.from(typingIndicators.values())
      .filter(indicator => indicator.conversationId === conversationId && indicator.isTyping)
      .map(indicator => indicator.userId);
  }, [typingIndicators]);

  // Get online users
  const getOnlineUsers = useCallback(() => {
    return Array.from(realTimeState.values())
      .filter(presence => presence.status === 'online')
      .map(presence => presence.userId);
  }, [realTimeState]);

  return {
    // State
    userPresence: realTimeState,
    typingIndicators,
    liveQuizUpdates,
    notifications,
    unreadCount,
    isConnected,
    connectionStatus,
    
    // Actions
    updatePresence,
    sendTypingIndicator,
    markNotificationAsRead,
    addRealTimeNotification,
    updateLiveQuiz,
    clearLiveQuizUpdates,
    getTypingUsers,
    getOnlineUsers,
  };
};

// Type exports
export type { RealTimeNavbarState };
export type { Notification, UserRole } from '@/types/navbar.types';

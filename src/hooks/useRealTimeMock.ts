import { useState, useEffect, useCallback } from 'react';

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

interface RealTimeNotification {
  id: string;
  type: 'message' | 'connection' | 'achievement' | 'course' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  count?: number;
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

interface QuizLeaderboardEntry {
  quizId: string;
  userId: string;
  userName: string;
  score: number;
  recentScore: number;
  rank: number;
}

// Mock implementation for real-time features
export const useRealTime = (userId: string) => {
  const [userPresence, setUserPresence] = useState<Map<string, UserPresence>>(new Map());
  const [typingIndicators, setTypingIndicators] = useState<Map<string, TypingIndicator>>(new Map());
  const [realTimeNotifications, setRealTimeNotifications] = useState<RealTimeNotification[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [liveQuizUpdates, setLiveQuizUpdates] = useState<LiveQuizUpdate[]>([]);
  const [quizLeaderboard, setQuizLeaderboard] = useState<QuizLeaderboardEntry[]>([]);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    if (!userId) return;

    // Simulate initial presence data
    const mockPresence = new Map<string, UserPresence>([
      ['user1', { userId: 'user1', status: 'online' }],
      ['user2', { userId: 'user2', status: 'away' }],
      ['user3', { userId: 'user3', status: 'busy' }],
    ]);
    setUserPresence(mockPresence);
    setOnlineUsers(['user1', 'user2', 'user3']);

    // Simulate real-time notifications
    const mockNotifications: RealTimeNotification[] = [
      {
        id: '1',
        type: 'message',
        title: 'New Message',
        message: 'John sent you a message',
        timestamp: new Date(),
        read: false,
      },
      {
        id: '2',
        type: 'connection',
        title: 'Connection Request',
        message: 'Sarah wants to connect',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false,
      },
    ];
    setRealTimeNotifications(mockNotifications);

    // Simulate typing indicators cleanup
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
  }, [userId]);

  const updatePresence = useCallback((status: UserPresence['status']) => {
    // Mock implementation - in real app, this would emit to server
    console.log('Updating presence to:', status);
  }, []);

  const sendTypingIndicator = useCallback((conversationId: string, isTyping: boolean) => {
    // Mock implementation - in real app, this would emit to server
    console.log('Typing indicator:', { conversationId, isTyping });
    
    // Simulate local typing indicator
    setTypingIndicators(prev => {
      const newMap = new Map(prev);
      if (isTyping) {
        newMap.set(userId, { userId, conversationId, isTyping, timestamp: Date.now() });
      } else {
        newMap.delete(userId);
      }
      return newMap;
    });
  }, [userId]);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setRealTimeNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  const addRealTimeNotification = useCallback((notification: RealTimeNotification) => {
    setRealTimeNotifications(prev => [notification, ...prev]);
  }, []);

  const updateLiveQuiz = useCallback((quizId: string, update: Omit<LiveQuizUpdate, 'id' | 'quizId' | 'timestamp'>) => {
    const newUpdate: LiveQuizUpdate = {
      id: `update_${Date.now()}`,
      quizId,
      ...update,
      timestamp: new Date()
    };
    setLiveQuizUpdates(prev => [newUpdate, ...prev.slice(0, 9)]);
    setActiveQuizId(quizId);
  }, []);

  const updateQuizLeaderboard = useCallback((quizId: string, entry: Omit<QuizLeaderboardEntry, 'quizId'>) => {
    const newEntry: QuizLeaderboardEntry = {
      quizId,
      ...entry
    };
    setQuizLeaderboard(prev => {
      const filtered = prev.filter(e => e.quizId !== quizId || e.userId !== entry.userId);
      return [...filtered, newEntry].sort((a, b) => b.score - a.score).map((e, index) => ({
        ...e,
        rank: index + 1
      }));
    });
  }, []);

  const clearLiveQuizUpdates = useCallback(() => {
    setLiveQuizUpdates([]);
    setActiveQuizId(null);
  }, []);

  const getQuizLeaderboard = useCallback((quizId: string) => {
    return quizLeaderboard.filter(entry => entry.quizId === quizId);
  }, [quizLeaderboard]);

  return {
    userPresence,
    typingIndicators,
    realTimeNotifications,
    onlineUsers,
    liveQuizUpdates,
    quizLeaderboard,
    activeQuizId,
    updatePresence,
    sendTypingIndicator,
    markNotificationAsRead,
    addRealTimeNotification,
    updateLiveQuiz,
    updateQuizLeaderboard,
    clearLiveQuizUpdates,
    getQuizLeaderboard
  };
};

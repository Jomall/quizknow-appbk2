import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Mock socket implementation for now
interface Socket {
  connected: boolean;
  disconnect: () => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  emit: (event: string, data?: any) => void;
}

const createMockSocket = (): Socket => ({
  connected: false,
  disconnect: () => {},
  on: () => {},
  emit: () => {},
});

// Mock io function
const io = (url: string, options: any): Socket => {
  console.log(`Mock socket connection to ${url}`);
  return createMockSocket();
};

interface RealTimeUpdate {
  type: 'dashboard_update' | 'instructor_approval' | 'quiz_submission' | 'analytics_update';
  data: any;
  timestamp: number;
}

interface UseRealTimeUpdatesOptions {
  enabled?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export const useRealTimeUpdates = (
  options: UseRealTimeUpdatesOptions = {}
) => {
  const {
    enabled = true,
    reconnectAttempts = 5,
    reconnectDelay = 1000,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [connectionError, setConnectionError] = useState<Error | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const queryClient = useQueryClient();

  const connect = () => {
    if (!enabled || socketRef.current?.connected) return;

    try {
      // Initialize WebSocket connection
      socketRef.current = io(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001', {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: reconnectAttempts,
        reconnectionDelay: reconnectDelay,
        timeout: 10000,
      });

      const socket = socketRef.current;

      // Connection events
      socket.on('connect', () => {
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0;
        onConnect?.();
        
        // Subscribe to dashboard updates
        socket.emit('subscribe', { channel: 'dashboard' });
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
        onDisconnect?.();
      });

      socket.on('connect_error', (error: Error) => {
        setConnectionError(error);
        onError?.(error);
        
        if (reconnectAttemptsRef.current < reconnectAttempts) {
          reconnectAttemptsRef.current++;
          setTimeout(() => connect(), reconnectDelay * reconnectAttemptsRef.current);
        }
      });

      // Handle real-time updates
      socket.on('dashboard_update', (update: RealTimeUpdate) => {
        setLastUpdate(new Date());
        
        // Invalidate relevant queries based on update type
        switch (update.type) {
          case 'dashboard_update':
            queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
            break;
          case 'instructor_approval':
            queryClient.invalidateQueries({ queryKey: ['instructor-approvals'] });
            break;
          case 'quiz_submission':
            queryClient.invalidateQueries({ queryKey: ['quiz-submissions'] });
            break;
          case 'analytics_update':
            queryClient.invalidateQueries({ queryKey: ['analytics-data'] });
            break;
        }
      });

      // Handle batch updates
      socket.on('batch_update', (updates: RealTimeUpdate[]) => {
        updates.forEach(update => {
          setLastUpdate(new Date());
          
          // Process each update
          switch (update.type) {
            case 'dashboard_update':
              queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
              break;
            // Add other cases as needed
          }
        });
      });

    } catch (error) {
      setConnectionError(error as Error);
      onError?.(error as Error);
    }
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  };

  const sendMessage = (event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  };

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled]);

  // Auto-reconnect on window focus
  useEffect(() => {
    if (!enabled) return;

    const handleFocus = () => {
      if (!isConnected && !socketRef.current?.connected) {
        connect();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isConnected, enabled]);

  return {
    isConnected,
    lastUpdate,
    connectionError,
    connect,
    disconnect,
    sendMessage,
  };
};

// Hook for specific dashboard real-time updates
export const useDashboardRealTimeUpdates = () => {
  const queryClient = useQueryClient();
  
  return useRealTimeUpdates({
    onConnect: () => {
      console.log('Dashboard real-time updates connected');
    },
    onDisconnect: () => {
      console.log('Dashboard real-time updates disconnected');
    },
    onError: (error) => {
      console.error('Dashboard real-time error:', error);
    },
  });
};

// Hook for instructor approval real-time updates
export const useInstructorApprovalRealTimeUpdates = () => {
  const queryClient = useQueryClient();
  
  return useRealTimeUpdates({
    onConnect: () => {
      console.log('Instructor approval real-time updates connected');
    },
    onError: (error) => {
      console.error('Instructor approval real-time error:', error);
    },
  });
};

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, MessageCircle, UserPlus, Award, Clock, AlertCircle } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

interface NavNotificationsProps {
  isMobile?: boolean;
}

export function NavNotifications({ isMobile = false }: NavNotificationsProps) {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications({ userId: 'current-user' });
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = (type: 'message' | 'connection' | 'achievement' | 'system' | 'course') => {
    switch (type) {
      case 'message':
        return <MessageCircle className="w-4 h-4" />;
      case 'connection':
        return <UserPlus className="w-4 h-4" />;
      case 'achievement':
        return <Award className="w-4 h-4" />;
      case 'course':
        return <Bell className="w-4 h-4" />;
      case 'system':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getIconColor = (type: 'message' | 'connection' | 'achievement' | 'system' | 'course') => {
    switch (type) {
      case 'message':
        return 'bg-blue-100 text-blue-600';
      case 'connection':
        return 'bg-purple-100 text-purple-600';
      case 'achievement':
        return 'bg-green-100 text-green-600';
      case 'course':
        return 'bg-orange-100 text-orange-600';
      case 'system':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const containerClasses = isMobile
    ? 'w-full'
    : 'absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg hover:bg-gray-100 transition-colors ${
          isMobile ? 'w-full flex items-center justify-between' : ''
        }`}
        aria-label="View notifications"
      >
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          {isMobile && <span className="text-sm font-medium">Notifications</span>}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={containerClasses}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Mark all as read
                  </button>
                  {!isMobile && (
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1 rounded hover:bg-gray-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No notifications</p>
                ) : (
                  notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${getIconColor(notification.type)}`}>
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

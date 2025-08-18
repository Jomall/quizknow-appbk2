import React from 'react';
import { useRealTime } from '../../hooks/useRealTimeMock';

interface UserPresenceIndicatorProps {
  userId: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const UserPresenceIndicator: React.FC<UserPresenceIndicatorProps> = ({
  userId,
  showLabel = false,
  size = 'md'
}) => {
  const { userPresence } = useRealTime(userId);

  const presence = userPresence.get(userId);
  const status = presence?.status || 'offline';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-2 h-2';
      case 'md': return 'w-3 h-3';
      case 'lg': return 'w-4 h-4';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <div className={`${getSizeClasses()} rounded-full ${getStatusColor(status)}`} />
        <div className={`absolute inset-0 ${getSizeClasses()} rounded-full ${getStatusColor(status)} animate-ping opacity-75`} />
      </div>
      {showLabel && (
        <span className="text-sm text-gray-600 capitalize">{status}</span>
      )}
    </div>
  );
};

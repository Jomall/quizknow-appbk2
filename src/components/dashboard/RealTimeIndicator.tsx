import React from 'react';

interface RealTimeIndicatorProps {
  isActive?: boolean;
  lastUpdate?: string;
}

export const RealTimeIndicator: React.FC<RealTimeIndicatorProps> = ({ 
  isActive = true, 
  lastUpdate 
}) => {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'} ${isActive ? 'animate-pulse' : ''}`} />
        <span>{isActive ? 'Live' : 'Offline'}</span>
      </div>
      {lastUpdate && (
        <span className="text-xs text-gray-500">
          Updated: {new Date(lastUpdate).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useRealTime } from '../../hooks/useRealTimeMock';

interface TypingIndicatorProps {
  conversationId: string;
  currentUserId: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  conversationId,
  currentUserId
}) => {
  const { typingIndicators } = useRealTime(currentUserId);
  const [visibleTypers, setVisibleTypers] = useState<string[]>([]);

  useEffect(() => {
    const typers = Array.from(typingIndicators.values())
      .filter(indicator => 
        indicator.conversationId === conversationId && 
        indicator.userId !== currentUserId &&
        indicator.isTyping
      )
      .map(indicator => indicator.userId);

    setVisibleTypers(typers);
  }, [typingIndicators, conversationId, currentUserId]);

  if (visibleTypers.length === 0) return null;

  const getTypingText = () => {
    if (visibleTypers.length === 1) {
      return `${visibleTypers[0]} is typing...`;
    } else if (visibleTypers.length === 2) {
      return `${visibleTypers[0]} and ${visibleTypers[1]} are typing...`;
    } else {
      return `${visibleTypers.length} people are typing...`;
    }
  };

  return (
    <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-sm text-gray-600">{getTypingText()}</span>
    </div>
  );
};

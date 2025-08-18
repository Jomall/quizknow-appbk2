import React from 'react';
import { useRealTime } from '../../hooks/useRealTimeMock';
import { Trophy, Clock, Users, TrendingUp } from 'lucide-react';

interface LiveQuizUpdatesProps {
  quizId: string;
  userId: string;
}

export const LiveQuizUpdates: React.FC<LiveQuizUpdatesProps> = ({ quizId, userId }) => {
  const { liveQuizUpdates, quizLeaderboard } = useRealTime(userId);

  const currentQuizUpdates = liveQuizUpdates.filter(update => update.quizId === quizId);
  const currentLeaderboard = quizLeaderboard.filter(entry => entry.quizId === quizId);

  return (
    <div className="space-y-4">
      {/* Live Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium">Active Players</span>
          </div>
          <p className="text-2xl font-bold mt-2">
            {currentQuizUpdates.find(u => u.type === 'active_players')?.count || 0}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">Time Remaining</span>
          </div>
          <p className="text-2xl font-bold mt-2">
            {currentQuizUpdates.find(u => u.type === 'time_remaining')?.time || '00:00'}
          </p>
        </div>
      </div>

      {/* Live Leaderboard */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold flex items-center">
            <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
            Live Leaderboard
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {currentLeaderboard.slice(0, 5).map((entry, index) => (
            <div key={entry.userId} className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  index === 0 ? 'bg-yellow-500' : 
                  index === 1 ? 'bg-gray-400' : 
                  index === 2 ? 'bg-orange-400' : 'bg-gray-300'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium">{entry.userName}</p>
                  <p className="text-sm text-gray-600">{entry.score} points</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">+{entry.recentScore}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {currentQuizUpdates
            .filter(u => u.type === 'activity')
            .slice(0, 5)
            .map((update, index) => (
              <div key={index} className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <p className="text-sm text-gray-600">{update.message}</p>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {update.timestamp.toLocaleTimeString()}
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

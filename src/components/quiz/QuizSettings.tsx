'use client';

import { QuizSettings as QuizSettingsType } from '@/lib/types/quiz-types';
import { formatTimeLimit } from '@/lib/utils/quiz-helpers';

interface QuizSettingsProps {
  settings: QuizSettingsType;
  onSettingsChange: (settings: QuizSettingsType) => void;
}

export default function QuizSettings({ settings, onSettingsChange }: QuizSettingsProps) {
  const handleSettingChange = (key: keyof QuizSettingsType, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Quiz Settings</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Time Limit</label>
          <input
            type="number"
            value={settings.timeLimit}
            onChange={(e) => handleSettingChange('timeLimit', parseInt(e.target.value) || 0)}
            className="w-20 p-2 border rounded"
            min="0"
          />
          <span className="text-sm text-gray-600">{formatTimeLimit(settings.timeLimit)}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.shuffleQuestions}
                onChange={(e) => handleSettingChange('shuffleQuestions', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Shuffle questions</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.shuffleOptions}
                onChange={(e) => handleSettingChange('shuffleOptions', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Shuffle options</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.showCorrectAnswers}
                onChange={(e) => handleSettingChange('showCorrectAnswers', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Show correct answers</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.showCorrectAnswers}
                onChange={(e) => handleSettingChange('showCorrectAnswers', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Show correct answers</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.allowMultipleAttempts}
                onChange={(e) => handleSettingChange('allowMultipleAttempts', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Allow multiple attempts</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.showResults}
                onChange={(e) => handleSettingChange('showResults', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults', e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Show results</span>
            </label>

            <label className="flex items-center">
              type="checkbox"
                checked={settings.showResults}
              onChange={(e) => handleSettingChange('showResults

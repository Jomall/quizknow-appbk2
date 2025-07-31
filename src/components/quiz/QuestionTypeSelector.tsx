'use client';

import { QuestionType } from '@/lib/types/quiz-types';
import { useState } from 'react';

interface QuestionTypeSelectorProps {
  selectedType: QuestionType;
  onTypeChange: (type: QuestionType) => void;
}

export default function QuestionTypeSelector({ selectedType, onTypeChange }: QuestionTypeSelectorProps) {
  const questionTypes = [
    { type: 'multiple-choice' as QuestionType, label: 'Multiple Choice', icon: '○', description: 'Single or multiple correct answers' },
    { type: 'short-answer' as QuestionType, label: 'Short Answer', icon: '✏️', description: 'Text input response' },
    { type: 'true-false' as QuestionType, label: 'True/False', icon: '✓', description: 'True or false statement' },
    { type: 'matching' as QuestionType, label: 'Matching', icon: '🔗', description: 'Match pairs of items' },
    { type: 'fill-blank' as QuestionType, label: 'Fill in the Blank', icon: '▢', description: 'Complete the sentence' },
    { type: 'essay' as QuestionType, label: 'Essay', icon: '📝', description: 'Long-form written response' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {questionTypes.map((type) => (
        <button
          key={type.type}
          onClick={() => onTypeChange(type.type)}
          className={`p-4 rounded-lg border-2 transition-all ${
            selectedType === type.type
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-2xl mb-2">{type.icon}</div>
          <div className="font-medium text-sm">{type.label}</div>
          <div className="text-xs text-gray-600 mt-1">{type.description}</div>
        </button>
      ))}
    </div>
  );
}

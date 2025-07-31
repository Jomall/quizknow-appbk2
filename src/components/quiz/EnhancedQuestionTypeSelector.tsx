'use client';

import { QuestionType } from '@/lib/types/quiz-types';
import { useState } from 'react';

interface EnhancedQuestionTypeSelectorProps {
  selectedType: QuestionType;
  onTypeChange: (type: QuestionType) => void;
}

export default function EnhancedQuestionTypeSelector({ selectedType, onTypeChange }: EnhancedQuestionTypeSelectorProps) {
  const questionTypes = [
    { 
      type: 'multiple-choice' as QuestionType, 
      label: 'Multiple Choice', 
      icon: '🎯', 
      description: 'Single or multiple correct answers',
      examples: 'A, B, C, D options'
    },
    { 
      type: 'short-answer' as QuestionType, 
      label: 'Short Answer', 
      icon: '✏️', 
      description: 'Text input response',
      examples: 'One word or short phrase'
    },
    { 
      type: 'true-false' as QuestionType, 
      label: 'True/False', 
      icon: '✓', 
      description: 'True or false statement',
      examples: 'True/False questions'
    },
    { 
      type: 'matching' as QuestionType, 
      label: 'Matching', 
      icon: '🔗', 
      description: 'Match pairs of items',
      examples: 'Terms to definitions'
    },
    { 
      type: 'fill-blank' as QuestionType, 
      label: 'Fill in Blank', 
      icon: '▢', 
      description: 'Complete the sentence',
      examples: 'Missing word questions'
    },
    { 
      type: 'essay' as QuestionType, 
      label: 'Essay', 
      icon: '📝', 
      description: 'Long-form written response',
      examples: 'Detailed explanations'
    },
    { 
      type: 'ranking' as QuestionType, 
      label: 'Ranking', 
      icon: '📊', 
      description: 'Order items by priority',
      examples: 'Rank from 1-5'
    },
    { 
      type: 'matrix' as QuestionType, 
      label: 'Matrix', 
      icon: '🧮', 
      description: 'Multiple rows and columns',
      examples: 'Rating scales'
    },
    { 
      type: 'file-upload' as QuestionType, 
      label: 'File Upload', 
      icon: '📁', 
      description: 'Upload documents/images',
      examples: 'PDF, images, docs'
    },
    { 
      type: 'code-editor' as QuestionType, 
      label: 'Code Editor', 
      icon: '💻', 
      description: 'Write and test code',
      examples: 'Python, JavaScript, etc.'
    },
    { 
      type: 'drag-drop' as QuestionType, 
      label: 'Drag & Drop', 
      icon: '🎯', 
      description: 'Interactive ordering',
      examples: 'Sequence items'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {questionTypes.map((type) => (
        <button
          key={type.type}
          onClick={() => onTypeChange(type.type)}
          className={`p-4 rounded-lg border-2 transition-all text-left ${
            selectedType === type.type
              ? 'border-blue-500 bg-blue-50 shadow-md'
              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
          }`}
        >
          <div className="text-2xl mb-2">{type.icon}</div>
          <div className="font-medium text-sm mb-1">{type.label}</div>
          <div className="text-xs text-gray-600 mb-1">{type.description}</div>
          <div className="text-xs text-gray-500 italic">{type.examples}</div>
        </button>
      ))}
    </div>
  );
}

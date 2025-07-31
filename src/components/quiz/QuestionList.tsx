'use client';

import { QuizQuestion } from '@/lib/types/quiz-types';
import { calculateTotalPoints } from '@/lib/utils/quiz-helpers';

interface QuestionListProps {
  questions: QuizQuestion[];
  onEdit: (question: QuizQuestion) => void;
  onDelete: (questionId: string) => void;
  onReorder: (questions: QuizQuestion[]) => void;
}

export default function QuestionList({ questions, onEdit, onDelete, onReorder }: QuestionListProps) {
  const totalPoints = calculateTotalPoints(questions);

  const getQuestionTypeLabel = (type: string) => {
    const labels = {
      'multiple-choice': 'Multiple Choice',
      'short-answer': 'Short Answer',
      'true-false': 'True/False',
      'matching': 'Matching',
      'fill-blank': 'Fill in Blank',
      'essay': 'Essay'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Questions ({questions.length})</h3>
          <div className="text-sm text-gray-600">
            Total Points: <span className="font-medium">{totalPoints}</span>
          </div>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <div className="text-4xl mb-2">📋</div>
          <p>No questions added yet. Click "Add Question" to get started.</p>
        </div>
      ) : (
        <div className="divide-y">
          {questions.map((question, index) => (
            <div key={question.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-500">
                      Q{index + 1}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {getQuestionTypeLabel(question.type)}
                    </span>
                    <span className="text-xs text-gray-600">
                      {question.points} pt{question.points !== 1 ? 's' : ''}
                    </span>
                    {question.required && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-gray-800">{question.question}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => onEdit(question)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(question.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

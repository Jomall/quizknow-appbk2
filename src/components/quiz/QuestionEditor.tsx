'use client';

import { useState } from 'react';
import { QuizQuestion } from '@/lib/types/quiz-types';

interface QuestionEditorProps {
  question: QuizQuestion;
  onSave: (question: QuizQuestion) => void;
  onCancel: () => void;
}

export default function QuestionEditor({ question, onSave, onCancel }: QuestionEditorProps) {
  const [editedQuestion, setEditedQuestion] = useState<QuizQuestion>(question);

  const handleSave = () => {
    onSave(editedQuestion);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Edit Question</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Question Text</label>
          <textarea
            value={editedQuestion.question}
            onChange={(e) => setEditedQuestion({ ...editedQuestion, question: e.target.value })}
            className="w-full p-2 border rounded"
            rows={3}
            placeholder="Enter your question"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Points</label>
          <input
            type="number"
            value={editedQuestion.points}
            onChange={(e) => setEditedQuestion({ ...editedQuestion, points: parseInt(e.target.value) || 0 })}
            className="w-full p-2 border rounded"
            min="0"
          />
        </div>
        
        {editedQuestion.type === 'multiple-choice' && (
          <div>
            <label className="block text-sm font-medium mb-2">Options</label>
            {editedQuestion.options?.map((option, index) => (
              <input
                key={index}
                type="text"
                value={option}
                onChange={(e) => {
                  const newOptions = [...(editedQuestion.options || [])];
                  newOptions[index] = e.target.value;
                  setEditedQuestion({ ...editedQuestion, options: newOptions });
                }}
                className="w-full p-2 border rounded mb-2"
                placeholder={`Option ${index + 1}`}
              />
            ))}
            <button
              onClick={() => {
                const newOptions = [...(editedQuestion.options || []), ''];
                setEditedQuestion({ ...editedQuestion, options: newOptions });
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Option
            </button>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium mb-2">Correct Answer</label>
          <input
            type="text"
            value={editedQuestion.correctAnswer as string}
            onChange={(e) => setEditedQuestion({ ...editedQuestion, correctAnswer: e.target.value })}
            className="w-full p-2 border rounded"
            placeholder="Enter correct answer"
          />
        </div>
        
        <div className="flex gap-4 pt-6">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Question
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

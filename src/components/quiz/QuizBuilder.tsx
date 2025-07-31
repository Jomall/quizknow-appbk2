'use client';

import { useState } from 'react';
import { Quiz, QuizQuestion } from '@/lib/types/quiz-types';
import { defaultQuizSettings, createEmptyQuestion, calculateTotalPoints, generateQuestionId } from '@/lib/utils/quiz-helpers';
import EnhancedQuestionTypeSelector from './EnhancedQuestionTypeSelector';
import QuestionEditor from './QuestionEditor';
import QuestionList from './QuestionList';
import QuizSettingsComponent from './QuizSettings';

interface QuizBuilderProps {
  onSave: (quiz: Quiz) => void;
  onCancel: () => void;
}

export default function QuizBuilder({ onSave, onCancel }: QuizBuilderProps) {
  const [quiz, setQuiz] = useState<Quiz>({
    id: '',
    title: '',
    description: '',
    courseId: '',
    instructorId: '',
    questions: [],
    settings: defaultQuizSettings,
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      totalPoints: 0,
      questionCount: 0,
      published: false,
      version: 1
    }
  });

  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [selectedQuestionType, setSelectedQuestionType] = useState<QuizQuestion['type']>('multiple-choice');

  const handleSave = () => {
    onSave(quiz);
  };

  const handleCancel = () => {
    onCancel();
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      ...createEmptyQuestion(selectedQuestionType),
      id: generateQuestionId(),
      order: quiz.questions.length
    };
    setQuiz({
      ...quiz,
      questions: [...quiz.questions, newQuestion],
      metadata: {
        ...quiz.metadata,
        questionCount: quiz.questions.length + 1,
        totalPoints: calculateTotalPoints([...quiz.questions, newQuestion])
      }
    });
  };

  const handleEditQuestion = (question: QuizQuestion) => {
    setEditingQuestion(question);
  };

  const handleSaveQuestion = (question: QuizQuestion) => {
    const updatedQuestions = quiz.questions.map((q) => (q.id === question.id ? question : q));
    setQuiz({
      ...quiz,
      questions: updatedQuestions,
      metadata: {
        ...quiz.metadata,
        totalPoints: calculateTotalPoints(updatedQuestions)
      }
    });
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (questionId: string) => {
    const updatedQuestions = quiz.questions.filter((q) => q.id !== questionId);
    setQuiz({
      ...quiz,
      questions: updatedQuestions,
      metadata: {
        ...quiz.metadata,
        questionCount: updatedQuestions.length,
        totalPoints: calculateTotalPoints(updatedQuestions)
      }
    });
  };

  const handleReorderQuestions = (questions: QuizQuestion[]) => {
    setQuiz({
      ...quiz,
      questions: questions,
      metadata: {
        ...quiz.metadata,
        totalPoints: calculateTotalPoints(questions)
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Quiz Builder</h2>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Quiz Title</label>
            <input
              type="text"
              value={quiz.title}
              onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Enter quiz title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={quiz.description}
              onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
              className="w-full p-2 border rounded"
              rows={3}
              placeholder="Enter quiz description"
            />
          </div>
        </div>

        <QuizSettingsComponent settings={quiz.settings} onSettingsChange={(newSettings) => setQuiz({ ...quiz, settings: newSettings })} />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Questions</h3>
          <div className="flex gap-2 mb-4">
            <EnhancedQuestionTypeSelector
              selectedType={selectedQuestionType}
              onTypeChange={setSelectedQuestionType}
            />
            <button
              onClick={handleAddQuestion}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Question
            </button>
          </div>

          <QuestionList
            questions={quiz.questions}
            onEdit={handleEditQuestion}
            onDelete={handleDeleteQuestion}
            onReorder={handleReorderQuestions}
          />
        </div>

        <div className="flex gap-4 pt-6">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Quiz
          </button>
          <button
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

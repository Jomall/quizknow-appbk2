'use client';

import { useState, useEffect } from 'react';
import { Quiz, QuizQuestion } from '@/lib/types/quiz-types';
import { defaultQuizSettings, createEmptyQuestion, calculateTotalPoints, generateQuestionId } from '@/lib/utils/quiz-helpers';
import EnhancedQuestionTypeSelector from './EnhancedQuestionTypeSelector';
import EnhancedQuestionEditor from './EnhancedQuestionEditor';
import EnhancedQuizSettings from './EnhancedQuizSettings';
import { storage } from '@/lib/data/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Save, Trash2, Edit3, Copy } from 'lucide-react';

interface CompleteQuizBuilderProps {
  onSave: (quiz: Quiz) => void;
  onCancel: () => void;
}

export default function CompleteQuizBuilder({ onSave, onCancel }: CompleteQuizBuilderProps) {
  const [quiz, setQuiz] = useState<Quiz>({
    id: '',
    title: '',
    description: '',
    instructions: '',
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
    },
    categories: [],
    tags: []
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [selectedQuestionType, setSelectedQuestionType] = useState<QuizQuestion['type']>('multiple-choice');

  useEffect(() => {
    const user = storage.getCurrentUser();
    if (user) {
      setQuiz(prev => ({ ...prev, instructorId: user.id }));
    }
  }, []);

  const handleSave = () => {
    const finalQuiz = {
      ...quiz,
      metadata: {
        ...quiz.metadata,
        totalPoints: calculateTotalPoints(quiz.questions),
        questionCount: quiz.questions.length,
        updatedAt: new Date()
      }
    };
    
    onSave(finalQuiz);
  };

  const handleAddQuestion = () => {
    const newQuestion: QuizQuestion = {
      ...createEmptyQuestion(selectedQuestionType),
      id: generateQuestionId(),
      order: quiz.questions.length
    };
    
    setQuiz({
      ...quiz,
      questions: [...quiz.questions, newQuestion]
    });
  };

  const handleSaveQuestion = (updatedQuestion: QuizQuestion) => {
    const updatedQuestions = quiz.questions.map((q) => 
      q.id === updatedQuestion.id ? updatedQuestion : q
    );
    
    setQuiz({
      ...quiz,
      questions: updatedQuestions
    });
    
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (questionId: string) => {
    const updatedQuestions = quiz.questions.filter((q) => q.id !== questionId);
    setQuiz({
      ...quiz,
      questions: updatedQuestions
    });
  };

  const getQuestionIcon = (type: QuestionType) => {
    const icons = {
      'multiple-choice': '🎯',
      'short-answer': '✏️',
      'true-false': '✓',
      'matching': '🔗',
      'fill-blank': '▢',
      'essay': '📝',
      'ranking': '📊',
      'matrix': '🧮',
      'file-upload': '📁',
      'code-editor': '💻',
      'drag-drop': '🎯'
    };
    return icons[type] || '❓';
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Create Comprehensive Quiz</h1>
        <p className="text-gray-600">Build interactive quizzes with 11+ question types</p>
      </div>

      {editingQuestion ? (
        <EnhancedQuestionEditor
          question={editingQuestion}
          onSave={handleSaveQuestion}
          onCancel={() => setEditingQuestion(null)}
        />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quiz Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Quiz Title</Label>
                  <Input
                    value={quiz.title}
                    onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                    placeholder="Enter quiz title"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={quiz.description}
                    onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
                    placeholder="Describe your quiz"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Instructions</Label>
                  <Textarea
                    value={quiz.instructions || ''}
                    onChange={(e) => setQuiz({ ...quiz, instructions: e.target.value })}
                    placeholder="Special instructions for students"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Categories</Label>
                    <Input
                      value={quiz.categories?.join(', ') || ''}
                      onChange={(e) => setQuiz({ ...quiz, categories: e.target.value.split(',').map(c => c.trim()) })}
                      placeholder="math, science, history"
                    />
                  </div>
                  <div>
                    <Label>Tags</Label>
                    <Input
                      value={quiz.tags?.join(', ') || ''}
                      onChange={(e) => setQuiz({ ...quiz, tags: e.target.value.split(',').map(t => t.trim()) })}
                      placeholder="algebra, equations, formulas"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Questions ({quiz.questions.length})</CardTitle>
                <p className="text-sm text-gray-600">Total Points: {calculateTotalPoints(quiz.questions)}</p>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <EnhancedQuestionTypeSelector
                    selectedType={selectedQuestionType}
                    onTypeChange={setSelectedQuestionType}
                  />
                  <Button onClick={handleAddQuestion} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" /> Add Question
                  </Button>
                </div>

                <div className="space-y-4">
                  {quiz.questions.map((question, index) => (
                    <Card key={question.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getQuestionIcon(question.type)}</span>
                          <div>
                            <p className="font-medium">{question.question.substring(0, 50)}...</p>
                            <p className="text-sm text-gray-600">
                              {question.type} • {question.points} points
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingQuestion(question)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteQuestion(question.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <EnhancedQuizSettings
              settings={quiz.settings}
              onSettingsChange={(newSettings) => setQuiz({ ...quiz, settings: newSettings })}
            />
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quiz Preview</CardTitle>
                <p className="text-sm text-gray-600">See how your quiz will appear to students</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">{quiz.title}</h3>
                  <p className="text-gray-600">{quiz.description}</p>
                  {quiz.instructions && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm">{quiz.instructions}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">{quiz.questions.length}</p>
                      <p className="text-sm text-gray-600">Questions</p

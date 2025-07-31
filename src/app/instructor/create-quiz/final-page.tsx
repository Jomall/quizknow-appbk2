'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Quiz, QuizQuestion, QuizSettings } from '@/lib/types/enhanced';
import { storage } from '@/lib/data/storage';
import { QuizStorage } from '@/lib/data/quiz-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import EnhancedQuestionTypeSelector from '@/components/quiz/EnhancedQuestionTypeSelector';
import StudentSelector from '@/components/instructor/StudentSelector';
import { Plus, Save, Trash2, Edit3 } from 'lucide-react';

export default function FinalCreateQuizPage() {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>>({
    courseId: '',
    title: '',
    description: '',
    instructions: '',
    questions: [],
    settings: {
      shuffleQuestions: false,
      showCorrectAnswers: true,
      allowMultipleAttempts: false,
      immediateFeedback: true,
      timeLimitEnabled: false
    },
    instructorId: '',
    isPublished: false,
    timeLimit: 30,
    maxAttempts: 1,
    passingScore: 70,
    assignedStudents: []
  });

  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [selectedQuestionType, setSelectedQuestionType] = useState<'multiple-choice' | 'true-false' | 'short-answer' | 'essay' | 'matching' | 'fill-blank' | 'selection'>('multiple-choice');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  useEffect(() => {
    const user = storage.getCurrentUser();
    if (user) {
      setQuiz(prev => ({ ...prev, instructorId: user.id }));
      // Set a default courseId if user has courses
      const courses = storage.getCourses();
      const instructorCourses = courses.filter(course => course.instructorId === user.id);
      if (instructorCourses.length > 0) {
        setQuiz(prev => ({ ...prev, courseId: instructorCourses[0].id }));
      }
    }
  }, []);

  const handleSave = () => {
    const quizWithStudents = {
      ...quiz,
      assignedStudents: selectedStudents
    };
    const savedQuiz = QuizStorage.saveQuiz(quizWithStudents);
    router.push('/instructor');
  };

  const handleAddQuestion = () => {
    // Create a basic question structure based on the selected type
    const newQuestion: QuizQuestion = {
      id: Date.now().toString(),
      type: selectedQuestionType,
      question: '',
      options: selectedQuestionType === 'multiple-choice' ? ['', ''] : undefined,
      correctAnswer: '',
      points: 1,
      order: quiz.questions.length,
      explanation: ''
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

  if (editingQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Edit Question</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Question Text</Label>
                  <Textarea
                    value={editingQuestion.question}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label>Points</Label>
                  <Input
                    type="number"
                    value={editingQuestion.points}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, points: parseInt(e.target.value) || 1 })}
                    min="1"
                  />
                </div>

                {editingQuestion.type === 'multiple-choice' && (
                  <div>
                    <Label>Options</Label>
                    {editingQuestion.options?.map((option, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...(editingQuestion.options || [])];
                            newOptions[index] = e.target.value;
                            setEditingQuestion({ ...editingQuestion, options: newOptions });
                          }}
                          placeholder={`Option ${index + 1}`}
                        />
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newOptions = [...(editingQuestion.options || []), ''];
                        setEditingQuestion({ ...editingQuestion, options: newOptions });
                      }}
                    >
                      Add Option
                    </Button>
                  </div>
                )}

                <div>
                  <Label>Correct Answer</Label>
                  <Input
                    value={String(editingQuestion.correctAnswer)}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, correctAnswer: e.target.value })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => handleSaveQuestion(editingQuestion)}>
                    Save Question
                  </Button>
                  <Button variant="outline" onClick={() => setEditingQuestion(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Create Quiz</h1>
          <p className="text-gray-600">Build an interactive quiz for your students</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Questions ({quiz.questions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <EnhancedQuestionTypeSelector
                    selectedType={selectedQuestionType as any}
                    onTypeChange={setSelectedQuestionType as any}
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
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quiz Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Time Limit (minutes)</Label>
                  <Input
                    type="number"
                    value={quiz.timeLimit || 30}
                    onChange={(e) => setQuiz({ ...quiz, timeLimit: parseInt(e.target.value) || 30 })}
                    className="w-20"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Passing Score (%)</Label>
                  <Input
                    type="number"
                    value={quiz.passingScore || 70}
                    onChange={(e) => setQuiz({ ...quiz, passingScore: parseInt(e.target.value) || 70 })}
                    className="w-20"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Max Attempts</Label>
                  <Input
                    type="number"
                    value={quiz.maxAttempts || 1}
                    onChange={(e) => setQuiz({ ...quiz, maxAttempts: parseInt(e.target.value) || 1 })}
                    className="w-20"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Shuffle Questions</Label>
                  <Switch
                    checked={quiz.settings.shuffleQuestions}
                    onCheckedChange={(checked) => 
                      setQuiz({ 
                        ...quiz, 
                        settings: { ...quiz.settings, shuffleQuestions: checked } 
                      })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Show Correct Answers</Label>
                  <Switch
                    checked={quiz.settings.showCorrectAnswers}
                    onCheckedChange={(checked) => 
                      setQuiz({ 
                        ...quiz, 
                        settings: { ...quiz.settings, showCorrectAnswers: checked } 
                      })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Allow Multiple Attempts</Label>
                  <Switch
                    checked={quiz.settings.allowMultipleAttempts}
                    onCheckedChange={(checked) => 
                      setQuiz({ 
                        ...quiz, 
                        settings: { ...quiz.settings, allowMultipleAttempts: checked } 
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <StudentSelector 
              courseId={quiz.courseId}
              selectedStudents={selectedStudents}
              onStudentSelectionChange={setSelectedStudents}
            />

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={handleSave} className="w-full">
                  <Save className="h-4 w-4 mr-2" /> Save Quiz
                </Button>
                <Button variant="outline" onClick={() => router.push('/instructor')} className="w-full">
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

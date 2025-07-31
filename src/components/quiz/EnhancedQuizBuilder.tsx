'use client';

import { useState, useEffect } from 'react';
import { Quiz, QuizQuestion } from '@/lib/types/quiz-types';
import { defaultQuizSettings, createEmptyQuestion, calculateTotalPoints, generateQuestionId } from '@/lib/utils/quiz-helpers';
import EnhancedQuestionTypeSelector from './EnhancedQuestionTypeSelector';
import EnhancedQuestionEditor from './EnhancedQuestionEditor';
import EnhancedQuizSettings from './EnhancedQuizSettings';
import { storage } from '@/lib/data/storage';
import { QuizStorage } from '@/lib/data/quiz-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Plus, Save, Eye, Download, Upload, Trash2, Edit3, Copy, CheckCircle, XCircle } from 'lucide-react';

interface EnhancedQuizBuilderProps {
  onSave: (quiz: Quiz) => void;
  onCancel: () => void;
  initialQuiz?: Quiz;
}

export default function EnhancedQuizBuilder({ onSave, onCancel, initialQuiz }: EnhancedQuizBuilderProps) {
  const [quiz, setQuiz] = useState<Quiz>(initialQuiz || {
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
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [currentPreviewQuestion, setCurrentPreviewQuestion] = useState(0);

  useEffect(() => {
    const user = storage.getCurrentUser();
    if (user) {
      setQuiz(prev => ({ ...prev, instructorId: user.id }));
    }
  }, []);

  const validateQuiz = (): string[] => {
    const errors: string[] = [];
    
    if (!quiz.title.trim()) {
      errors.push('Quiz title is required');
    }
    
    if (!quiz.description.trim()) {
      errors.push('Quiz description is required');
    }
    
    if (quiz.questions.length === 0) {
      errors.push('At least one question is required');
    }
    
    if (quiz.settings.timeLimit < 1) {
      errors.push('Time limit must be at least 1 minute');
    }
    
    if (quiz.settings.passingScore < 0 || quiz.settings.passingScore > 100) {
      errors.push('Passing score must be between 0 and 100');
    }
    
    quiz.questions.forEach((question, index) => {
      if (!question.question.trim()) {
        errors.push(`Question ${index + 1} text is required`);
      }
      
      if (question.points <= 0) {
        errors.push(`Question ${index + 1} must have positive points`);
      }
      
      if (question.type === 'multiple-choice' && (!question.options || question.options.filter(o => o.trim()).length < 2)) {
        errors.push(`Question ${index + 1} must have at least 2 options`);
      }
    });
    
    return errors;
  };

  const handleSave = () => {
    const errors = validateQuiz();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
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
    
    // Initialize type-specific properties
    if (selectedQuestionType === 'code-editor') {
      newQuestion.codeEditor = {
        language: 'javascript',
        starterCode: '',
        testCases: []
      };
    }
    
    if (selectedQuestionType === 'file-upload') {
      newQuestion.fileUpload = {
        allowedTypes: ['pdf', 'jpg', 'png', 'doc', 'docx'],
        maxSize: 10,
        maxFiles: 1
      };
    }
    
    setQuiz({
      ...quiz,
      questions: [...quiz.questions, newQuestion]
    });
  };

  const handleEditQuestion = (question: QuizQuestion) => {
    setEditingQuestion(question);
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

  const handleDuplicateQuestion = (questionId: string) => {
    const questionToDuplicate = quiz.questions.find(q => q.id === questionId);
    if (questionToDuplicate) {
      const duplicatedQuestion = {
        ...questionToDuplicate,
        id: generateQuestionId(),
        order: quiz.questions.length
      };
      
      setQuiz({
        ...quiz,
        questions: [...quiz.questions, duplicatedQuestion]
      });
    }
  };

  const handleReorderQuestions = (startIndex: number, endIndex: number) => {
    const questions = [...quiz.questions];
    const [removed] = questions.splice(startIndex, 1);
    questions.splice(endIndex, 0, removed);
    
    const reorderedQuestions = questions.map((q, index) => ({
      ...q,
      order: index
    }));
    
    setQuiz({
      ...quiz,
      questions: reorderedQuestions
    });
  };

  const handleImportQuestions = (questions: QuizQuestion[]) => {
    const importedQuestions = questions.map((q, index) => ({
      ...q,
      id: generateQuestionId(),
      order: quiz.questions.length + index
    }));
    
    setQuiz({
      ...quiz,
      questions: [...quiz.questions, ...importedQuestions]
    });
  };

  const handleExportQuiz = () => {
    const exportData = {
      quiz: {
        title: quiz.title,

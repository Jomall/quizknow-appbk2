import { QuestionType, QuizQuestion, QuizSettings } from '@/lib/types/quiz-types';

export const questionTemplates: QuestionType[] = [
  'multiple-choice',
  'short-answer',
  'true-false',
  'matching',
  'fill-blank',
  'essay'
];

export const defaultQuizSettings: QuizSettings = {
  timeLimit: 30,
  shuffleQuestions: false,
  shuffleOptions: false,
  showCorrectAnswers: true,
  allowMultipleAttempts: false,
  maxAttempts: 1,
  passingScore: 70,
  showResults: true,
  showFeedback: true,
  allowReview: true,
  requirePassingGrade: false
};

export const createEmptyQuestion = (type: QuestionType): Omit<QuizQuestion, 'id' | 'order'> => {
  const base = {
    type,
    question: '',
    points: 1,
    required: true,
    explanation: '',
    correctAnswer: '' as string | string[]
  };

  switch (type) {
    case 'multiple-choice':
      return {
        ...base,
        options: ['', '', '', ''],
        correctAnswer: ''
      };
    case 'true-false':
      return {
        ...base,
        correctAnswer: 'true'
      };
    case 'short-answer':
    case 'essay':
      return {
        ...base,
        correctAnswer: ''
      };
    case 'matching':
      return {
        ...base,
        options: ['', '', ''],
        correctAnswer: [] as string[]
      };
    case 'fill-blank':
      return {
        ...base,
        correctAnswer: ''
      };
    default:
      return base;
  }
};

export const validateQuestion = (question: QuizQuestion): string[] => {
  const errors: string[] = [];

  if (!question.question.trim()) {
    errors.push('Question text is required');
  }

  if (question.points <= 0) {
    errors.push('Points must be greater than 0');
  }

  switch (question.type) {
    case 'multiple-choice':
      if (!question.options || question.options.filter(opt => opt.trim()).length < 2) {
        errors.push('Multiple choice questions must have at least 2 options');
      }
      if (!question.correctAnswer || !question.correctAnswer.toString().trim()) {
        errors.push('Correct answer is required');
      }
      break;
    case 'short-answer':
    case 'essay':
      if (!question.correctAnswer || !question.correctAnswer.toString().trim()) {
        errors.push('Correct answer is required');
      }
      break;
    case 'true-false':
      if (!['true', 'false'].includes(question.correctAnswer.toString())) {
        errors.push('Correct answer must be true or false');
      }
      break;
    case 'matching':
      if (!question.options || question.options.filter(opt => opt.trim()).length < 2) {
        errors.push('Matching questions must have at least 2 pairs');
      }
      break;
    case 'fill-blank':
      if (!question.correctAnswer || !question.correctAnswer.toString().trim()) {
        errors.push('Correct answer is required');
      }
      break;
  }

  return errors;
};

export const calculateTotalPoints = (questions: QuizQuestion[]): number => {
  return questions.reduce((total, question) => total + question.points, 0);
};

export const generateQuestionId = (): string => {
  return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const formatTimeLimit = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours} hour${hours !== 1 ? 's' : ''}${remainingMinutes > 0 ? ` ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}` : ''}`;
};

export const sanitizeQuizData = (data: any) => {
  return {
    ...data,
    title: data.title?.trim() || '',
    description: data.description?.trim() || '',
    questions: (data.questions || []).map((q: any) => ({
      ...q,
      question: q.question?.trim() || '',
      options: q.options?.map((opt: string) => opt.trim()).filter(Boolean) || [],
      correctAnswer: Array.isArray(q.correctAnswer) 
        ? q.correctAnswer.map((ans: string) => ans.trim()).filter(Boolean)
        : q.correctAnswer?.toString().trim() || ''
    }))
  };
};

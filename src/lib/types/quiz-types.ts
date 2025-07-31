// Enhanced quiz types for comprehensive quiz creation system

export type QuestionType = 
  | 'multiple-choice' 
  | 'short-answer' 
  | 'true-false' 
  | 'matching' 
  | 'fill-blank'
  | 'essay'
  | 'ranking'
  | 'matrix'
  | 'file-upload'
  | 'code-editor'
  | 'drag-drop';

export interface MediaAttachment {
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  alt?: string;
  caption?: string;
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[]; // For multiple choice, matching, ranking
  correctAnswer: string | string[] | number[] | FileUploadAnswer;
  points: number;
  explanation?: string;
  media?: MediaAttachment[];
  order: number;
  required: boolean;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  feedback?: {
    correct?: string;
    incorrect?: string;
    partial?: string;
  };
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    caseSensitive?: boolean;
    tolerance?: number; // For numerical answers
  };
  codeEditor?: {
    language: string;
    starterCode?: string;
    testCases?: CodeTestCase[];
  };
  fileUpload?: {
    allowedTypes: string[];
    maxSize: number; // in MB
    maxFiles: number;
  };
}

export interface FileUploadAnswer {
  filename: string;
  size: number;
  type: string;
  url: string;
}

export interface CodeTestCase {
  input: string;
  expectedOutput: string;
  description?: string;
  points: number;
}

export interface QuestionPool {
  id: string;
  name: string;
  description?: string;
  questions: QuizQuestion[];
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizSettings {
  timeLimit: number; // minutes
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showCorrectAnswers: boolean;
  allowMultipleAttempts: boolean;
  maxAttempts?: number;
  passingScore: number;
  showResults: boolean;
  showFeedback: boolean;
  allowReview: boolean;
  requirePassingGrade: boolean;
  questionPool?: {
    enabled: boolean;
    poolId?: string;
    questionCount?: number;
  };
  scheduling?: {
    startDate?: Date;
    endDate?: Date;
    timeZone?: string;
  };
  proctoring?: {
    enabled: boolean;
    webcamRequired?: boolean;
    screenRecording?: boolean;
    tabSwitching?: boolean;
  };
  accessibility?: {
    extendedTime?: boolean;
    screenReader?: boolean;
    highContrast?: boolean;
    fontSize?: 'normal' | 'large' | 'extra-large';
  };
}

export interface QuizMetadata {
  createdAt: Date;
  updatedAt: Date;
  totalPoints: number;
  questionCount: number;
  published: boolean;
  version: number;
  lastPublished?: Date;
  statistics?: {
    averageScore: number;
    totalAttempts: number;
    completionRate: number;
    averageTime: number;
  };
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  courseId: string;
  instructorId: string;
  questions: QuizQuestion[];
  settings: QuizSettings;
  metadata: QuizMetadata;
  categories?: string[];
  tags?: string[];
  prerequisites?: string[];
  estimatedDuration?: number;
  assignedStudents?: string[]; // Array of student IDs this quiz is assigned to
}

export interface QuizCreationForm {
  title: string;
  description: string;
  instructions?: string;
  courseId: string;
  questions: Omit<QuizQuestion, 'id' | 'order'>[];
  settings: QuizSettings;
  categories?: string[];
  tags?: string[];
}

export interface QuestionTemplate {
  id: string;
  type: QuestionType;
  name: string;
  description: string;
  defaultPoints: number;
  icon: string;
  example?: string;
  fields: QuestionField[];
}

export interface QuestionField {
  name: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'file';
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  validation?: any;
}

export interface QuizValidationError {
  field: string;
  message: string;
  type: 'error' | 'warning';
  suggestion?: string;
}

export interface QuizPreview {
  quiz: Quiz;
  currentQuestion: number;
  answers: Record<string, any>;
  timeRemaining?: number;
  isPreview: boolean;
}

export interface ImportExportFormat {
  version: string;
  quiz: Quiz;
  questions: QuizQuestion[];
  metadata: {
    exportedAt: Date;
    exportedBy: string;
    format: 'json' | 'csv' | 'xml';
  };
}

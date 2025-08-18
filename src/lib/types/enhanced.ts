// Enhanced type definitions for instructor dashboard features

export interface ContentItem {
  id: string;
  courseId: string;
  type: 'video' | 'document' | 'image' | 'audio' | 'notes' | 'voice-note';
  title: string;
  description?: string;
  fileUrl?: string;
  externalUrl?: string;
  fileSize?: number;
  fileType?: string;
  uploadedAt: Date;
  instructorId: string;
  isPublic: boolean;
  order: number;
  assignedStudents?: string[]; // Array of student IDs this content is assigned to
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  instructions?: string;
  questions: QuizQuestion[];
  settings: QuizSettings;
  createdAt: Date;
  updatedAt: Date;
  instructorId: string;
  isPublished: boolean;
  timeLimit?: number; // in minutes
  maxAttempts?: number;
  passingScore?: number;
  assignedStudents?: string[]; // Array of student IDs this quiz is assigned to
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay' | 'matching' | 'fill-blank' | 'selection';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  order: number;
  explanation?: string;
  mediaUrl?: string;
}

export interface QuizSettings {
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
  allowMultipleAttempts: boolean;
  immediateFeedback: boolean;
  timeLimitEnabled: boolean;
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  answers: QuizAnswer[];
  submittedAt: Date;
  startedAt: Date;
  gradedAt?: Date;
  totalScore?: number;
  maxScore: number;
  status: 'in-progress' | 'submitted' | 'graded' | 'auto-graded';
  attemptNumber: number;
  timeSpent?: number; // in minutes
}

export interface QuizAnswer {
  questionId: string;
  answer: string | string[];
  points?: number;
  feedback?: string;
  isCorrect?: boolean;
}

export interface GradeBookEntry {
  id: string;
  courseId: string;
  courseTitle: string;
  instructorId: string;
  instructorName: string;
  studentId: string;
  studentName: string;
  quizId: string;
  quizTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  submittedAt: Date;
  gradedAt: Date;
  status: 'pending' | 'graded';
}

export interface InstructorAnalytics {
  totalCourses: number;
  totalStudents: number;
  totalQuizzes: number;
  averageQuizScore: number;
  activeSubmissions: number;
  pendingGrades: number;
  
  // Enhanced metrics
  activeStudents: number;
  quizAttempts: number;
  contentViews: number;
  avgSessionTime: number;
  totalContent: number;
  
  // Performance tracking
  topPerformers: Array<{
    id: string;
    name: string;
    averageScore: number;
    completionRate: number;
    lastActivity: Date;
  }>;
  
  studentsNeedingAttention: Array<{
    id: string;
    name: string;
    averageScore: number;
    lastSubmission: Date;
    daysSinceLastActivity: number;
  }>;
  
  // Content analytics
  mostViewedContent: Array<{
    id: string;
    title: string;
    type: string;
    views: number;
    engagementRate: number;
  }>;
  
  highestCompletionContent: Array<{
    id: string;
    title: string;
    completionRate: number;
    averageScore: number;
  }>;
  
  contentTypeDistribution: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  
  // Quiz performance trends
  quizPerformanceTrends: Array<{
    date: string;
    averageScore: number;
    completionRate: number;
    participationRate: number;
  }>;
  
  // Engagement metrics
  engagementLevels: Array<{
    level: string;
    count: number;
    percentage: number;
  }>;
  
  // Real-time updates
  lastUpdated: Date;
  isLive: boolean;
}

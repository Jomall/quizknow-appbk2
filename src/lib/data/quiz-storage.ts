import { Quiz, QuizSubmission, GradeBookEntry, InstructorAnalytics } from '@/lib/types/enhanced';

export class QuizStorage {
  private static readonly QUIZZES_KEY = 'instructor_quizzes';
  private static readonly SUBMISSIONS_KEY = 'quiz_submissions';
  private static readonly GRADEBOOK_KEY = 'gradebook_entries';

  static getQuizzesByCourse(courseId: string): Quiz[] {
    const quizzes = this.getAllQuizzes();
    return quizzes.filter(quiz => quiz.courseId === courseId);
  }

  static getQuizzesByInstructor(instructorId: string): Quiz[] {
    const quizzes = this.getAllQuizzes();
    return quizzes.filter(quiz => quiz.instructorId === instructorId && quiz.isPublished);
  }

  static getQuizzesForStudent(studentId: string): Quiz[] {
    const quizzes = this.getAllQuizzes();
    return quizzes.filter(quiz => 
      quiz.isPublished && 
      (!quiz.assignedStudents || quiz.assignedStudents.length === 0 || quiz.assignedStudents.includes(studentId))
    );
  }

  static getAllQuizzes(): Quiz[] {
    if (typeof window === 'undefined') return [];
    const quizzes = localStorage.getItem(this.QUIZZES_KEY);
    return quizzes ? JSON.parse(quizzes) : [];
  }

  static saveQuiz(quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>): Quiz {
    const quizzes = this.getAllQuizzes();
    const newQuiz: Quiz = {
      ...quiz,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    quizzes.push(newQuiz);
    localStorage.setItem(this.QUIZZES_KEY, JSON.stringify(quizzes));
    return newQuiz;
  }

  static updateQuiz(id: string, updates: Partial<Quiz>): Quiz | null {
    const quizzes = this.getAllQuizzes();
    const index = quizzes.findIndex(quiz => quiz.id === id);
    if (index === -1) return null;
    
    quizzes[index] = { ...quizzes[index], ...updates, updatedAt: new Date() };
    localStorage.setItem(this.QUIZZES_KEY, JSON.stringify(quizzes));
    return quizzes[index];
  }

  static deleteQuiz(id: string): boolean {
    const quizzes = this.getAllQuizzes();
    const filtered = quizzes.filter(quiz => quiz.id !== id);
    if (filtered.length === quizzes.length) return false;
    
    localStorage.setItem(this.QUIZZES_KEY, JSON.stringify(filtered));
    return true;
  }

  static getQuizById(id: string): Quiz | null {
    const quizzes = this.getAllQuizzes();
    return quizzes.find(quiz => quiz.id === id) || null;
  }

  static submitQuiz(submission: Omit<QuizSubmission, 'id' | 'submittedAt' | 'startedAt'>): QuizSubmission {
    const submissions = this.getAllSubmissions();
    const newSubmission: QuizSubmission = {
      ...submission,
      id: Date.now().toString(),
      submittedAt: new Date(),
      startedAt: new Date()
    };
    submissions.push(newSubmission);
    localStorage.setItem(this.SUBMISSIONS_KEY, JSON.stringify(submissions));
    return newSubmission;
  }

  static getSubmissionsByQuiz(quizId: string): QuizSubmission[] {
    const submissions = this.getAllSubmissions();
    return submissions.filter(sub => sub.quizId === quizId);
  }

  static getSubmissionsByStudent(studentId: string): QuizSubmission[] {
    const submissions = this.getAllSubmissions();
    return submissions.filter(sub => sub.studentId === studentId);
  }

  static getAllSubmissions(): QuizSubmission[] {
    if (typeof window === 'undefined') return [];
    const submissions = localStorage.getItem(this.SUBMISSIONS_KEY);
    return submissions ? JSON.parse(submissions) : [];
  }

  static gradeSubmission(submissionId: string, answers: any[], totalScore: number): QuizSubmission | null {
    const submissions = this.getAllSubmissions();
    const index = submissions.findIndex(sub => sub.id === submissionId);
    if (index === -1) return null;
    
    submissions[index] = {
      ...submissions[index],
      answers,
      totalScore,
      status: 'graded',
      gradedAt: new Date()
    };
    
    localStorage.setItem(this.SUBMISSIONS_KEY, JSON.stringify(submissions));
    
    // Create gradebook entry
    this.createGradebookEntry(submissions[index]);
    
    return submissions[index];
  }

  static autoGradeSubmission(submissionId: string): QuizSubmission | null {
    const submissions = this.getAllSubmissions();
    const submission = submissions.find(sub => sub.id === submissionId);
    if (!submission) return null;
    
    const quiz = this.getQuizById(submission.quizId);
    if (!quiz) return null;
    
    let totalScore = 0;
      const gradedAnswers = submission.answers.map(answer => {
        const question = quiz.questions.find(q => q.id === answer.questionId);
        if (!question) return answer;
        
        let isCorrect = false;
        if (Array.isArray(answer.answer) && Array.isArray(question.correctAnswer)) {
          isCorrect = JSON.stringify(answer.answer.sort()) === JSON.stringify(question.correctAnswer.sort());
        } else if (!Array.isArray(answer.answer) && !Array.isArray(question.correctAnswer)) {
          isCorrect = answer.answer === question.correctAnswer;
        }
        
        const points = isCorrect ? question.points : 0;
        totalScore += points;
        
        return {
          ...answer,
          points,
          isCorrect,
          feedback: isCorrect ? 'Correct!' : 'Incorrect'
        };
      });
    
    return this.gradeSubmission(submissionId, gradedAnswers, totalScore);
  }

  private static createGradebookEntry(submission: QuizSubmission): void {
    const gradebook = this.getGradebook();
    const quiz = this.getQuizById(submission.quizId);
    if (!quiz) return;
    
    // Import storage module dynamically to avoid circular dependencies
    const storageModule = require('./storage');
    const storage = storageModule.storage;
    
    // Get course information
    const courses = storage.getCourses();
    const course = courses.find((c: any) => c.id === quiz.courseId);
    
    const entry: GradeBookEntry = {
      id: Date.now().toString(),
      courseId: quiz.courseId,
      courseTitle: course ? course.title : 'Unknown Course',
      instructorId: quiz.instructorId,
      instructorName: course ? course.instructorName : 'Unknown Instructor',
      studentId: submission.studentId,
      studentName: submission.studentName,
      quizId: submission.quizId,
      quizTitle: quiz.title,
      score: submission.totalScore || 0,
      maxScore: submission.maxScore,
      percentage: ((submission.totalScore || 0) / submission.maxScore) * 100,
      submittedAt: submission.submittedAt,
      gradedAt: submission.gradedAt!,
      status: 'graded'
    };
    
    gradebook.push(entry);
    localStorage.setItem(this.GRADEBOOK_KEY, JSON.stringify(gradebook));
  }

  static getGradebookByCourse(courseId: string): GradeBookEntry[] {
    const gradebook = this.getGradebook();
    return gradebook.filter(entry => entry.courseId === courseId);
  }

  static getGradebookByStudent(studentId: string): GradeBookEntry[] {
    const gradebook = this.getGradebook();
    return gradebook.filter(entry => entry.studentId === studentId);
  }

  static getGradebook(): GradeBookEntry[] {
    if (typeof window === 'undefined') return [];
    const gradebook = localStorage.getItem(this.GRADEBOOK_KEY);
    return gradebook ? JSON.parse(gradebook) : [];
  }

  static getInstructorAnalytics(instructorId: string): InstructorAnalytics {
    const quizzes = this.getAllQuizzes();
    const submissions = this.getAllSubmissions();
    const gradebook = this.getGradebook();
    
    // Import storage module dynamically to avoid circular dependencies
    const storageModule = require('./storage');
    const storage = storageModule.storage;
    
    const instructorQuizzes = quizzes.filter(q => q.instructorId === instructorId);
    const instructorSubmissions = submissions.filter(sub => 
      instructorQuizzes.some(q => q.id === sub.quizId)
    );
    
    // Get all courses taught by this instructor
    const allCourses = storage.getCourses();
    const instructorCourses = allCourses.filter((course: any) => course.instructorId === instructorId);
    
    // Count unique enrolled students across all instructor courses
    const enrolledStudents = new Set<string>();
    instructorCourses.forEach((course: any) => {
      course.enrolledStudents.forEach((studentId: string) => enrolledStudents.add(studentId));
    });
    
    const gradedSubmissions = instructorSubmissions.filter(sub => sub.status === 'graded');
    const totalScore = gradedSubmissions.reduce((sum, sub) => sum + (sub.totalScore || 0), 0);
    const maxScore = gradedSubmissions.reduce((sum, sub) => sum + sub.maxScore, 0);
    
    return {
      totalCourses: instructorCourses.length,
      totalStudents: enrolledStudents.size,
      totalQuizzes: instructorQuizzes.length,
      averageQuizScore: maxScore > 0 ? (totalScore / maxScore) * 100 : 0,
      activeSubmissions: instructorSubmissions.filter(sub => sub.status === 'submitted').length,
      pendingGrades: instructorSubmissions.filter(sub => sub.status === 'submitted').length
    };
  }
}

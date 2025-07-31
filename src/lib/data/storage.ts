import { User, Course } from '@/lib/types';
import { ContentItem, Quiz } from '@/lib/types/enhanced';

const STORAGE_KEYS = {
  USERS: 'tec_net_solutions_quizknow_users',
  COURSES: 'tec_net_solutions_quizknow_courses',
  CURRENT_USER: 'tec_net_solutions_quizknow_current_user',
  PENDING_STUDENTS: 'tec_net_solutions_quizknow_pending_students',
};

// Add this interface for pending students
interface PendingStudent {
  studentId: string;
  courseId: string;
  reason?: string;
  createdAt: Date;
}

export const storage = {
  // User management
  getUsers: (): User[] => {
    if (typeof window === 'undefined') return [];
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    return users ? JSON.parse(users) : [];
  },

  saveUsers: (users: User[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  },

  setCurrentUser: (user: User | null) => {
    if (typeof window === 'undefined') return;
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  // Course management
  getCourses: (): Course[] => {
    if (typeof window === 'undefined') return [];
    const courses = localStorage.getItem(STORAGE_KEYS.COURSES);
    return courses ? JSON.parse(courses) : [];
  },

  saveCourses: (courses: Course[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  },

  // Student enrollment management
  removeStudentFromCourse(studentId: string, courseId: string): boolean {
    const courses: Course[] = this.getCourses();
    const courseIndex = courses.findIndex((c: Course) => c.id === courseId);
    
    if (courseIndex === -1) return false;
    
    // Remove student from course
    const studentIndex = courses[courseIndex].enrolledStudents.indexOf(studentId);
    if (studentIndex === -1) return false;
    
    courses[courseIndex].enrolledStudents.splice(studentIndex, 1);
    this.saveCourses(courses);
    
    // Also remove course from student's enrolled courses
    const users: User[] = this.getUsers();
    const studentIndexInUsers = users.findIndex((u: User) => u.id === studentId);
    
    if (studentIndexInUsers !== -1) {
      const courseIndexInStudent = users[studentIndexInUsers].enrolledCourses.indexOf(courseId);
      if (courseIndexInStudent !== -1) {
        users[studentIndexInUsers].enrolledCourses.splice(courseIndexInStudent, 1);
        this.saveUsers(users);
      }
    }
    
    return true;
  },

  // Get students for a course (enrolled and pending)
  // Pending student management
  getPendingStudents(): PendingStudent[] {
    if (typeof window === 'undefined') return [];
    const pending = localStorage.getItem(STORAGE_KEYS.PENDING_STUDENTS);
    return pending ? JSON.parse(pending) : [];
  },

  savePendingStudents(pending: PendingStudent[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PENDING_STUDENTS, JSON.stringify(pending));
  },

  addPendingStudent(studentId: string, courseId: string, reason?: string): boolean {
    // First remove student from course
    const removed = this.removeStudentFromCourse(studentId, courseId);
    if (!removed) return false;
    
    // Then add to pending students list
    const pending = this.getPendingStudents();
    pending.push({
      studentId,
      courseId,
      reason,
      createdAt: new Date()
    });
    this.savePendingStudents(pending);
    
    return true;
  },

  getPendingStudentsForCourse(courseId: string): PendingStudent[] {
    const pending = this.getPendingStudents();
    return pending.filter(p => p.courseId === courseId);
  },

  approvePendingStudent(studentId: string, courseId: string): boolean {
    // Remove from pending list
    const pending = this.getPendingStudents();
    const filtered = pending.filter(p => !(p.studentId === studentId && p.courseId === courseId));
    
    if (filtered.length === pending.length) return false; // Not found in pending list
    
    this.savePendingStudents(filtered);
    
    // Re-enroll student in course
    const courses: Course[] = this.getCourses();
    const courseIndex = courses.findIndex((c: Course) => c.id === courseId);
    
    if (courseIndex === -1) return false;
    
    // Add student back to course
    courses[courseIndex].enrolledStudents.push(studentId);
    this.saveCourses(courses);
    
    // Also add course back to student's enrolled courses
    const users: User[] = this.getUsers();
    const studentIndex = users.findIndex((u: User) => u.id === studentId);
    
    if (studentIndex !== -1) {
      users[studentIndex].enrolledCourses.push(courseId);
      this.saveUsers(users);
    }
    
    return true;
  },

  removePendingStudent(studentId: string, courseId: string): boolean {
    // Remove from pending list
    const pending = this.getPendingStudents();
    const filtered = pending.filter(p => !(p.studentId === studentId && p.courseId === courseId));
    
    if (filtered.length === pending.length) return false; // Not found in pending list
    
    this.savePendingStudents(filtered);
    return true;
  },

  getStudentsForCourse(courseId: string) {
    const courses: Course[] = this.getCourses();
    const course: Course | undefined = courses.find((c: Course) => c.id === courseId);
    
    if (!course) return { enrolled: [], pending: [] };
    
    const users: User[] = this.getUsers();
    const enrolledStudents = users.filter((u: User) => 
      u.role === 'student' && course.enrolledStudents.includes(u.id)
    );
    
    // Get pending students for this course
    const pendingStudents = this.getPendingStudentsForCourse(courseId);
    
    return {
      enrolled: enrolledStudents,
      pending: pendingStudents
    };
  },

  // Initialize with demo data
  initializeDemoData: () => {
    if (typeof window === 'undefined') return;
    
    const existingUsers = storage.getUsers();
    if (existingUsers.length === 0) {
      const demoUsers: User[] = [
        {
          id: '1',
          email: 'student@lms.com',
          name: 'Demo Student',
          role: 'student',
          enrolledCourses: ['1', '2'],
          createdCourses: [],
          createdAt: new Date(),
        },
        {
          id: '2',
          email: 'instructor@lms.com',
          name: 'Demo Instructor',
          role: 'instructor',
          enrolledCourses: [],
          createdCourses: ['1', '2'],
          createdAt: new Date(),
        },
        {
          id: '3',
          email: 'admin@lms.com',
          name: 'Demo Admin',
          role: 'admin',
          enrolledCourses: [],
          createdCourses: [],
          createdAt: new Date(),
        },
      ];
      storage.saveUsers(demoUsers);
    }

    const existingCourses = storage.getCourses();
    if (existingCourses.length === 0) {
      const demoCourses: Course[] = [
        {
          id: '1',
          title: 'Introduction to Web Development',
          description: 'Learn the fundamentals of web development including HTML, CSS, and JavaScript.',
          instructorId: '2',
          instructorName: 'Demo Instructor',
          modules: [
            {
              id: 'm1',
              title: 'Getting Started',
              lessons: [
                {
                  id: 'l1',
                  title: 'Welcome to Web Development',
                  content: 'Welcome to the world of web development! In this course, you will learn...',
                  type: 'text',
                  order: 1,
                },
                {
                  id: 'l2',
                  title: 'Setting Up Your Environment',
                  content: 'Let\'s set up your development environment...',
                  type: 'video',
                  duration: 15,
                  order: 2,
                },
              ],
            },
          ],
          enrolledStudents: ['1'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          title: 'Advanced React Development',
          description: 'Master React with advanced concepts including hooks, context, and performance optimization.',
          instructorId: '2',
          instructorName: 'Demo Instructor',
          modules: [
            {
              id: 'm2',
              title: 'Advanced Concepts',
              lessons: [
                {
                  id: 'l3',
                  title: 'React Hooks Deep Dive',
                  content: 'Explore advanced React hooks and patterns...',
                  type: 'text',
                  order: 1,
                },
              ],
            },
          ],
          enrolledStudents: ['1'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      storage.saveCourses(demoCourses);
    }

    // Initialize demo content and quizzes
    try {
      // Dynamically import the storage classes to avoid circular dependencies
      const contentStorageModule = require('./content-storage');
      const quizStorageModule = require('./quiz-storage');
      const ContentStorage = contentStorageModule.ContentStorage;
      const QuizStorage = quizStorageModule.QuizStorage;
      
      const existingContent = ContentStorage.getAllContent();
      if (existingContent.length === 0) {
        // Create demo content items
        const demoContent: Omit<ContentItem, 'id' | 'uploadedAt'>[] = [
          {
            courseId: '1',
            type: 'document',
            title: 'HTML Basics Cheatsheet',
            description: 'A comprehensive cheatsheet for HTML basics',
            fileUrl: 'data:text/plain;base64,PEhUTUw+CjxoZWFkPgogIDx0aXRsZT5IVE1MIEJhc2ljczwvdGl0bGU+CjwvaGVhZD4KPGJvZHk+CiAgPGgxPkhlbGxvIFdvcmxkITwvaDE+CiAgPHA+VGhpcyBpcyBhIHNpbXBsZSBIVE1MIGRvY3VtZW50LjwvcD4KPC9ib2R5Pgo8L0hUTUw+',
            fileSize: 1200,
            fileType: 'text/plain',
            instructorId: '2',
            isPublic: true,
            order: 1
          },
          {
            courseId: '1',
            type: 'video',
            title: 'CSS Fundamentals Tutorial',
            description: 'Learn CSS fundamentals with practical examples',
            fileUrl: 'data:video/mp4;base64,AAAAIGZ0eXBtcDQyAAAAAG1wNDJpc29tYXZjMQAAAAhnZW5lcmFsAA==',
            fileSize: 5400000,
            fileType: 'video/mp4',
            instructorId: '2',
            isPublic: true,
            order: 2
          },
          {
            courseId: '2',
            type: 'document',
            title: 'React Hooks Reference Guide',
            description: 'Complete reference guide for all React hooks',
            fileUrl: 'data:text/plain;base64,UmVhY3QgSG9va3MgUmVmZXJlbmNlIEd1aWRlCgp1c2VFZmZlY3QKCnVzZUNvbnRleHQKCnVzZVN0YXRlCgp1c2VSZWY',
            fileSize: 2500,
            fileType: 'text/plain',
            instructorId: '2',
            isPublic: true,
            order: 1
          }
        ];

        demoContent.forEach(item => {
          ContentStorage.saveContent(item);
        });
      }

      const existingQuizzes = QuizStorage.getAllQuizzes();
      if (existingQuizzes.length === 0) {
        // Create demo quizzes
        const demoQuizzes: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>[] = [
          {
            courseId: '1',
            title: 'HTML Fundamentals Quiz',
            description: 'Test your knowledge of HTML basics',
            instructions: 'Answer all questions to the best of your ability',
            questions: [
              {
                id: 'q1',
                type: 'multiple-choice',
                question: 'What does HTML stand for?',
                options: [
                  'Hyper Text Markup Language',
                  'High Tech Modern Language',
                  'Home Tool Markup Language',
                  'Hyperlink and Text Markup Language'
                ],
                correctAnswer: 'Hyper Text Markup Language',
                points: 10,
                order: 1
              },
              {
                id: 'q2',
                type: 'true-false',
                question: 'HTML is a programming language.',
                options: ['True', 'False'],
                correctAnswer: 'False',
                points: 10,
                order: 2
              }
            ],
            settings: {
              shuffleQuestions: true,
              showCorrectAnswers: true,
              allowMultipleAttempts: true,
              immediateFeedback: true,
              timeLimitEnabled: false
            },
            instructorId: '2',
            isPublished: true,
            timeLimit: 30,
            maxAttempts: 3,
            passingScore: 70
          },
          {
            courseId: '2',
            title: 'React Hooks Quiz',
            description: 'Assess your understanding of React Hooks',
            instructions: 'This quiz tests your knowledge of React Hooks',
            questions: [
              {
                id: 'q3',
                type: 'multiple-choice',
                question: 'Which hook is used to manage state in functional components?',
                options: [
                  'useEffect',
                  'useState',
                  'useContext',
                  'useReducer'
                ],
                correctAnswer: 'useState',
                points: 10,
                order: 1
              },
              {
                id: 'q4',
                type: 'multiple-choice',
                question: 'What is the purpose of the useEffect hook?',
                options: [
                  'To manage component state',
                  'To handle side effects in functional components',
                  'To create context providers',
                  'To optimize component performance'
                ],
                correctAnswer: 'To handle side effects in functional components',
                points: 10,
                order: 2
              }
            ],
            settings: {
              shuffleQuestions: true,
              showCorrectAnswers: true,
              allowMultipleAttempts: true,
              immediateFeedback: true,
              timeLimitEnabled: false
            },
            instructorId: '2',
            isPublished: true,
            timeLimit: 45,
            maxAttempts: 2,
            passingScore: 80
          }
        ];

        demoQuizzes.forEach(quiz => {
          QuizStorage.saveQuiz(quiz);
        });
      }
    } catch (error) {
      console.log('Demo content/quizzes already initialized or error occurred:', error);
    }
  },
};

import { EnrollmentRequest, EnrollmentSettings, EnrollmentHistory } from '@/lib/types/enrollment';
import { Course } from '@/lib/types';

const ENROLLMENT_REQUESTS_KEY = 'enrollment_requests';
const ENROLLMENT_SETTINGS_KEY = 'enrollment_settings';
const ENROLLMENT_HISTORY_KEY = 'enrollment_history';

export const enrollmentStorage = {
  // Enrollment Requests
  getEnrollmentRequests: (): EnrollmentRequest[] => {
    const requests = localStorage.getItem(ENROLLMENT_REQUESTS_KEY);
    return requests ? JSON.parse(requests) : [];
  },

  saveEnrollmentRequests: (requests: EnrollmentRequest[]): void => {
    localStorage.setItem(ENROLLMENT_REQUESTS_KEY, JSON.stringify(requests));
  },

  addEnrollmentRequest: (request: EnrollmentRequest): void => {
    const requests = enrollmentStorage.getEnrollmentRequests();
    requests.push(request);
    enrollmentStorage.saveEnrollmentRequests(requests);
  },

  updateEnrollmentRequest: (requestId: string, updates: Partial<EnrollmentRequest>): void => {
    const requests = enrollmentStorage.getEnrollmentRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index !== -1) {
      requests[index] = { ...requests[index], ...updates };
      enrollmentStorage.saveEnrollmentRequests(requests);
    }
  },

  getPendingRequests: (instructorId: string): EnrollmentRequest[] => {
    const requests = enrollmentStorage.getEnrollmentRequests();
    return requests.filter(r => r.instructorId === instructorId && r.status === 'pending');
  },

  getStudentRequests: (studentId: string): EnrollmentRequest[] => {
    const requests = enrollmentStorage.getEnrollmentRequests();
    return requests.filter(r => r.studentId === studentId);
  },

  // Enrollment Settings
  getEnrollmentSettings: (): EnrollmentSettings[] => {
    const settings = localStorage.getItem(ENROLLMENT_SETTINGS_KEY);
    return settings ? JSON.parse(settings) : [];
  },

  saveEnrollmentSettings: (settings: EnrollmentSettings[]): void => {
    localStorage.setItem(ENROLLMENT_SETTINGS_KEY, JSON.stringify(settings));
  },

  getCourseEnrollmentSettings: (courseId: string): EnrollmentSettings | undefined => {
    const settings = enrollmentStorage.getEnrollmentSettings();
    return settings.find(s => s.courseId === courseId);
  },

  updateCourseEnrollmentSettings: (settings: EnrollmentSettings): void => {
    const allSettings = enrollmentStorage.getEnrollmentSettings();
    const index = allSettings.findIndex(s => s.courseId === settings.courseId);
    
    if (index !== -1) {
      allSettings[index] = settings;
    } else {
      allSettings.push(settings);
    }
    
    enrollmentStorage.saveEnrollmentSettings(allSettings);
  },

  // Enrollment History
  getEnrollmentHistory: (): EnrollmentHistory[] => {
    const history = localStorage.getItem(ENROLLMENT_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  },

  saveEnrollmentHistory: (history: EnrollmentHistory[]): void => {
    localStorage.setItem(ENROLLMENT_HISTORY_KEY, JSON.stringify(history));
  },

  addEnrollmentHistory: (entry: EnrollmentHistory): void => {
    const history = enrollmentStorage.getEnrollmentHistory();
    history.push(entry);
    enrollmentStorage.saveEnrollmentHistory(history);
  },

  // Utility functions
  generateEnrollmentId: (): string => {
    return `enrollment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Initialize demo data
  initializeDemoEnrollmentData: (): void => {
    const existingRequests = enrollmentStorage.getEnrollmentRequests();
    if (existingRequests.length === 0) {
      // Add demo enrollment requests
      const demoRequests: EnrollmentRequest[] = [
        {
          id: enrollmentStorage.generateEnrollmentId(),
          studentId: 'student1',
          studentName: 'Demo Student',
          studentEmail: 'student@example.com',
          courseId: 'course1',
          courseTitle: 'Introduction to Web Development',
          instructorId: 'instructor1',
          status: 'pending',
          createdAt: new Date(),
        }
      ];
      enrollmentStorage.saveEnrollmentRequests(demoRequests);
    }

    const existingSettings = enrollmentStorage.getEnrollmentSettings();
    if (existingSettings.length === 0) {
      const demoSettings: EnrollmentSettings[] = [
        {
          courseId: 'course1',
          requiresApproval: true,
          maxStudents: 50,
          allowWaitlist: true,
        }
      ];
      enrollmentStorage.saveEnrollmentSettings(demoSettings);
    }
  }
};

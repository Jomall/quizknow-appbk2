export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'instructor' | 'admin';
  enrolledCourses: string[];
  password?: string; // Add password field
  phone?: string; // Add phone number property
  avatar?: string; // Add avatar URL property
  createdCourses: string[];
  createdAt: Date;
  // For instructors
  isApproved?: boolean; // For instructor approval system
  // For students
  instructorRequests?: string[]; // IDs of instructors the student has requested to connect with
  connectedInstructors?: string[]; // IDs of instructors the student is connected to
  // For instructors
  studentRequests?: InstructorRequest[]; // Requests from students
  connectedStudents?: string[]; // IDs of students the instructor is connected to
}

export interface InstructorApprovalRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  message?: string;
  status: 'pending' | 'approved' | 'declined';
  createdAt: Date;
  respondedAt?: Date;
}

export interface InstructorRequest {
  id: string;
  studentId: string;
  studentName: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  respondedAt?: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName: string;
  modules: Module[];
  enrolledStudents: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  type: 'video' | 'text' | 'assignment';
  duration?: number;
  order: number;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: Date;
  submissions: Submission[];
}

export interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  content: string;
  submittedAt: Date;
  grade?: number;
  feedback?: string;
}

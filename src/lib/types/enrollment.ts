export interface EnrollmentRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  instructorId: string;
  message?: string;
  status: 'pending' | 'approved' | 'declined';
  createdAt: Date;
  respondedAt?: Date;
  respondedBy?: string;
}

export interface EnrollmentSettings {
  courseId: string;
  requiresApproval: boolean;
  maxStudents?: number;
  prerequisites?: string[];
  allowWaitlist: boolean;
}

export interface EnrollmentHistory {
  id: string;
  studentId: string;
  courseId: string;
  action: 'enrolled' | 'unenrolled' | 'approved' | 'declined';
  timestamp: Date;
  performedBy: string;
}

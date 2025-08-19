// LMS Integration API for quizknow-appbk2
// This file provides the interface between the quizknow-appbk2 Next.js app and the LMS demo accounts system

const LMS_API_BASE_URL = process.env.NEXT_PUBLIC_LMS_API_URL || 'http://localhost:3000/api';

// Types for LMS integration
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'super_admin' | 'instructor' | 'student';
  status: 'pending' | 'approved' | 'rejected';
}

export interface StudentRequest {
  id: number;
  student_id: number;
  instructor_id: number;
  status: 'pending' | 'accepted' | 'rejected';
  request_message: string;
  created_at: string;
  updated_at: string;
  student_name?: string;
  student_email?: string;
}

export interface InstructorStudent {
  instructor_id: number;
  student_id: number;
  connected_at: string;
  student?: User;
}

export interface ContentAssignment {
  id: number;
  instructor_id: number;
  student_id: number;
  content_type: string;
  content_id: number;
  assigned_at: string;
  completed_at?: string;
  status: 'assigned' | 'completed';
}

// Authentication
export async function login(email: string, password: string): Promise<User | null> {
  try {
    const response = await fetch(`${LMS_API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

// Student Request Management
export async function getStudentRequests(instructorId: number): Promise<StudentRequest[]> {
  try {
    const response = await fetch(`${LMS_API_BASE_URL}/student-requests/${instructorId}`);
    if (!response.ok) throw new Error('Failed to fetch requests');
    return await response.json();
  } catch (error) {
    console.error('Error fetching student requests:', error);
    return [];
  }
}

export async function submitStudentRequest(
  studentId: number,
  instructorId: number,
  requestMessage: string
): Promise<boolean> {
  try {
    const response = await fetch(`${LMS_API_BASE_URL}/student-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        student_id: studentId,
        instructor_id: instructorId,
        request_message: requestMessage,
      }),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error submitting request:', error);
    return false;
  }
}

export async function acceptStudentRequest(requestId: number): Promise<boolean> {
  try {
    const response = await fetch(`${LMS_API_BASE_URL}/student-requests/${requestId}/accept`, {
      method: 'POST',
    });
    return response.ok;
  } catch (error) {
    console.error('Error accepting request:', error);
    return false;
  }
}

export async function rejectStudentRequest(requestId: number): Promise<boolean> {
  try {
    const response = await fetch(`${LMS_API_BASE_URL}/student-requests/${requestId}/reject`, {
      method: 'POST',
    });
    return response.ok;
  } catch (error) {
    console.error('Error rejecting request:', error);
    return false;
  }
}

// Instructor-Student Relationships
export async function getInstructorStudents(instructorId: number): Promise<User[]> {
  try {
    const response = await fetch(`${LMS_API_BASE_URL}/instructor-students/${instructorId}`);
    if (!response.ok) throw new Error('Failed to fetch students');
    return await response.json();
  } catch (error) {
    console.error('Error fetching instructor students:', error);
    return [];
  }
}

export async function getStudentInstructors(studentId: number): Promise<User[]> {
  try {
    const response = await fetch(`${LMS_API_BASE_URL}/student-instructors/${studentId}`);
    if (!response.ok) throw new Error('Failed to fetch instructors');
    return await response.json();
  } catch (error) {
    console.error('Error fetching student instructors:', error);
    return [];
  }
}

// Content Assignment Management
export async function assignContent(
  instructorId: number,
  studentId: number,
  contentType: string,
  contentId: number
): Promise<boolean> {
  try {
    const response = await fetch(`${LMS_API_BASE_URL}/assign-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instructor_id: instructorId,
        student_id: studentId,
        content_type: contentType,
        content_id: contentId,
      }),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error assigning content:', error);
    return false;
  }
}

export async function getAssignedContent(studentId: number): Promise<ContentAssignment[]> {
  try {
    const response = await fetch(`${LMS_API_BASE_URL}/assigned-content/${studentId}`);
    if (!response.ok) throw new Error('Failed to fetch assignments');
    return await response.json();
  } catch (error) {
    console.error('Error fetching assigned content:', error);
    return [];
  }
}

export async function completeContentAssignment(assignmentId: number): Promise<boolean> {
  try {
    const response = await fetch(`${LMS_API_BASE_URL}/assigned-content/${assignmentId}/complete`, {
      method: 'POST',
    });
    return response.ok;
  } catch (error) {
    console.error('Error completing assignment:', error);
    return false;
  }
}

// User Management
export async function getAllUsers(): Promise<User[]> {
  try {
    const response = await fetch(`${LMS_API_BASE_URL}/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

// Helper function to check if user is connected to instructor
export async function isStudentConnectedToInstructor(
  studentId: number,
  instructorId: number
): Promise<boolean> {
  try {
    const students = await getInstructorStudents(instructorId);
    return students.some(student => student.id === studentId);
  } catch (error) {
    console.error('Error checking connection:', error);
    return false;
  }
}

// Helper function to get user role
export function getUserRole(user: User | null): string {
  return user?.role || 'guest';
}

// Helper function to check if user can access content
export async function canAccessContent(
  userId: number,
  contentType: string,
  contentId: number,
  userRole: string
): Promise<boolean> {
  if (userRole === 'admin' || userRole === 'super_admin') {
    return true;
  }
  
  if (userRole === 'instructor') {
    return true; // Instructors can access their own content
  }
  
  if (userRole === 'student') {
    // Check if content is assigned to this student
    const assignments = await getAssignedContent(userId);
    return assignments.some(
      assignment => 
        assignment.content_type === contentType && 
        assignment.content_id === contentId &&
        assignment.status === 'assigned'
    );
  }
  
  return false;
}

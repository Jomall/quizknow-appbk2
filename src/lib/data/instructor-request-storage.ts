import { User, InstructorRequest } from '@/lib/types';
import { storage } from './storage';

export class InstructorRequestStorage {
  static getRequestById(requestId: string): InstructorRequest | null {
    const users = storage.getUsers();
    for (const user of users) {
      if (user.role === 'instructor' && user.studentRequests) {
        const request = user.studentRequests.find(req => req.id === requestId);
        if (request) return request;
      }
    }
    return null;
  }

  static getRequestsForInstructor(instructorId: string): InstructorRequest[] {
    const instructor = storage.getUsers().find(user => user.id === instructorId && user.role === 'instructor');
    return instructor?.studentRequests || [];
  }

  static createRequest(studentId: string, instructorId: string, message?: string): InstructorRequest | null {
    const users = storage.getUsers();
    const student = users.find(user => user.id === studentId && user.role === 'student');
    const instructor = users.find(user => user.id === instructorId && user.role === 'instructor');
    
    if (!student || !instructor) return null;
    
    // Check if request already exists
    if (instructor.studentRequests?.some(req => req.studentId === studentId && req.status === 'pending')) {
      return null; // Request already exists
    }
    
    const request: InstructorRequest = {
      id: Date.now().toString(),
      studentId,
      studentName: student.name,
      message,
      status: 'pending',
      createdAt: new Date()
    };
    
    // Add request to instructor
    if (!instructor.studentRequests) {
      instructor.studentRequests = [];
    }
    instructor.studentRequests.push(request);
    
    // Add instructor to student's requests
    if (!student.instructorRequests) {
      student.instructorRequests = [];
    }
    if (!student.instructorRequests.includes(instructorId)) {
      student.instructorRequests.push(instructorId);
    }
    
    storage.saveUsers(users);
    return request;
  }

  static updateRequestStatus(requestId: string, status: 'accepted' | 'declined', instructorId: string): InstructorRequest | null {
    const users = storage.getUsers();
    const instructor = users.find(user => user.id === instructorId && user.role === 'instructor');
    
    if (!instructor || !instructor.studentRequests) return null;
    
    const requestIndex = instructor.studentRequests.findIndex(req => req.id === requestId);
    if (requestIndex === -1) return null;
    
    instructor.studentRequests[requestIndex] = {
      ...instructor.studentRequests[requestIndex],
      status,
      respondedAt: new Date()
    };
    
    const request = instructor.studentRequests[requestIndex];
    
    // If accepted, establish connection
    if (status === 'accepted') {
      const student = users.find(user => user.id === request.studentId);
      if (student) {
        // Add student to instructor's connected students
        if (!instructor.connectedStudents) {
          instructor.connectedStudents = [];
        }
        if (!instructor.connectedStudents.includes(request.studentId)) {
          instructor.connectedStudents.push(request.studentId);
        }
        
        // Add instructor to student's connected instructors
        if (!student.connectedInstructors) {
          student.connectedInstructors = [];
        }
        if (!student.connectedInstructors.includes(instructorId)) {
          student.connectedInstructors.push(instructorId);
        }
      }
    }
    
    storage.saveUsers(users);
    return request;
  }

  static getPendingRequestsForInstructor(instructorId: string): InstructorRequest[] {
    const requests = this.getRequestsForInstructor(instructorId);
    return requests.filter(req => req.status === 'pending');
  }

  static getAcceptedRequestsForInstructor(instructorId: string): InstructorRequest[] {
    const requests = this.getRequestsForInstructor(instructorId);
    return requests.filter(req => req.status === 'accepted');
  }

  static getRequestsForStudent(studentId: string): InstructorRequest[] {
    const users = storage.getUsers();
    const student = users.find(user => user.id === studentId);
    if (!student) return [];
    
    const requests: InstructorRequest[] = [];
    student.instructorRequests?.forEach(instructorId => {
      const instructor = users.find(user => user.id === instructorId);
      if (instructor && instructor.studentRequests) {
        const studentRequests = instructor.studentRequests.filter(req => req.studentId === studentId);
        requests.push(...studentRequests);
      }
    });
    
    return requests;
  }
}

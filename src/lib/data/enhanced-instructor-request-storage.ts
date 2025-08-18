import { User } from '@/lib/types';
import { EnhancedInstructorRequest, InstructorRequestFilters, PaginationOptions, PaginatedInstructorRequests, BulkOperationResult, InstructorRequestStats } from '@/lib/types/enhanced-instructor-request';
import { storage } from './storage';

export class EnhancedInstructorRequestStorage {
  private static instance: EnhancedInstructorRequestStorage;
  
  static getInstance(): EnhancedInstructorRequestStorage {
    if (!this.instance) {
      this.instance = new EnhancedInstructorRequestStorage();
    }
    return this.instance;
  }

  // Get all requests for an instructor with filtering and pagination
  getRequestsForInstructor(
    instructorId: string,
    filters?: InstructorRequestFilters,
    pagination?: PaginationOptions
  ): PaginatedInstructorRequests {
    const instructor = storage.getUsers().find(user => 
      user.id === instructorId && user.role === 'instructor'
    );
    
    if (!instructor || !instructor.studentRequests) {
      return {
        requests: [],
        total: 0,
        page: pagination?.page || 1,
        limit: pagination?.limit || 10,
        totalPages: 0
      };
    }

    let requests = instructor.studentRequests as EnhancedInstructorRequest[];

    // Apply filters
    if (filters) {
      requests = this.applyFilters(requests, filters);
    }

    // Calculate total before pagination
    const total = requests.length;

    // Apply pagination
    if (pagination) {
      const startIndex = (pagination.page - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      
      // Sort
      if (pagination.sortBy) {
        requests.sort((a, b) => {
          let aVal: any, bVal: any;
          
          if (pagination.sortBy === 'createdAt') {
            aVal = a.createdAt;
            bVal = b.createdAt;
          } else if (pagination.sortBy === 'priority') {
            aVal = a.priority || 'medium';
            bVal = b.priority || 'medium';
          } else {
            aVal = a.createdAt;
            bVal = b.createdAt;
          }
          
          if (aVal instanceof Date && bVal instanceof Date) {
            return pagination.sortOrder === 'desc' 
              ? bVal.getTime() - aVal.getTime()
              : aVal.getTime() - bVal.getTime();
          }
          
          return pagination.sortOrder === 'desc' 
            ? String(bVal).localeCompare(String(aVal))
            : String(aVal).localeCompare(String(bVal));
        });
      }
      
      requests = requests.slice(startIndex, endIndex);
    }

    return {
      requests,
      total,
      page: pagination?.page || 1,
      limit: pagination?.limit || 10,
      totalPages: Math.ceil(total / (pagination?.limit || 10))
    };
  }

  // Get all requests for a student
  getRequestsForStudent(
    studentId: string,
    filters?: InstructorRequestFilters,
    pagination?: PaginationOptions
  ): PaginatedInstructorRequests {
    const users = storage.getUsers();
    const student = users.find(user => user.id === studentId && user.role === 'student');
    
    if (!student) {
      return {
        requests: [],
        total: 0,
        page: pagination?.page || 1,
        limit: pagination?.limit || 10,
        totalPages: 0
      };
    }

    let requests: EnhancedInstructorRequest[] = [];
    
    student.instructorRequests?.forEach(instructorId => {
      const instructor = users.find(user => user.id === instructorId);
      if (instructor && instructor.studentRequests) {
        const studentRequests = instructor.studentRequests.filter(
          req => req.studentId === studentId
        ) as EnhancedInstructorRequest[];
        requests.push(...studentRequests);
      }
    });

    // Apply filters
    if (filters) {
      requests = this.applyFilters(requests, filters);
    }

    const total = requests.length;

    // Apply pagination
    if (pagination) {
      const startIndex = (pagination.page - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      
      if (pagination.sortBy) {
        requests.sort((a, b) => {
          const aVal = a[pagination.sortBy!];
          const bVal = b[pagination.sortBy!];
          
          if (aVal instanceof Date && bVal instanceof Date) {
            return pagination.sortOrder === 'desc' 
              ? bVal.getTime() - aVal.getTime()
              : aVal.getTime() - bVal.getTime();
          }
          
          return pagination.sortOrder === 'desc' 
            ? String(bVal).localeCompare(String(aVal))
            : String(aVal).localeCompare(String(bVal));
        });
      }
      
      requests = requests.slice(startIndex, endIndex);
    }

    return {
      requests,
      total,
      page: pagination?.page || 1,
      limit: pagination?.limit || 10,
      totalPages: Math.ceil(total / (pagination?.limit || 10))
    };
  }

  // Create a new enhanced instructor request
  createRequest(
    studentId: string,
    instructorId: string,
    options: {
      message?: string;
      courseId?: string;
      courseName?: string;
      priority?: 'low' | 'medium' | 'high';
      category?: 'academic' | 'career' | 'personal';
      attachments?: string[];
      notes?: string;
    } = {}
  ): EnhancedInstructorRequest | null {
    const users = storage.getUsers();
    const student = users.find(user => user.id === studentId && user.role === 'student');
    const instructor = users.find(user => user.id === instructorId && user.role === 'instructor');
    
    if (!student || !instructor) return null;
    
    // Check for existing pending request
    const existingRequest = instructor.studentRequests?.find(
      req => req.studentId === studentId && req.status === 'pending'
    );
    
    if (existingRequest) return null;

    const request: EnhancedInstructorRequest = {
      id: Date.now().toString(),
      studentId,
      studentName: student.name,
      message: options.message,
      status: 'pending',
      createdAt: new Date(),
      lastUpdatedAt: new Date(),
      courseId: options.courseId,
      courseName: options.courseName,
      priority: options.priority || 'medium',
      category: options.category || 'academic',
      attachments: options.attachments || [],
      notes: options.notes
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

  // Update request status (accept/decline)
  updateRequestStatus(
    requestId: string,
    status: 'accepted' | 'declined',
    instructorId: string
  ): EnhancedInstructorRequest | null {
    const users = storage.getUsers();
    const instructor = users.find(user => 
      user.id === instructorId && user.role === 'instructor'
    );
    
    if (!instructor || !instructor.studentRequests) return null;
    
    const requestIndex = instructor.studentRequests.findIndex(
      req => req.id === requestId
    );
    
    if (requestIndex === -1) return null;
    
    const request = instructor.studentRequests[requestIndex] as EnhancedInstructorRequest;
    
    if (request.status !== 'pending') return null;
    
    instructor.studentRequests[requestIndex] = {
      ...request,
      status,
      respondedAt: new Date(),
      lastUpdatedAt: new Date()
    };
    
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
    return instructor.studentRequests[requestIndex] as EnhancedInstructorRequest;
  }

  // Cancel a request (student can cancel their own request)
  cancelRequest(
    requestId: string,
    studentId: string,
    reason?: string
  ): EnhancedInstructorRequest | null {
    const users = storage.getUsers();
    const student = users.find(user => user.id === studentId && user.role === 'student');
    
    if (!student) return null;
    
    // Find the instructor who has this request
    let targetInstructor = null;
    let requestIndex = -1;
    
    for (const user of users) {
      if (user.role === 'instructor' && user.studentRequests) {
        const index = user.studentRequests.findIndex(
          req => req.id === requestId && req.studentId === studentId
        );
        if (index !== -1) {
          targetInstructor = user;
          requestIndex = index;
          break;
        }
      }
    }
    
    if (!targetInstructor || requestIndex === -1) return null;
    
    const request = targetInstructor.studentRequests[requestIndex] as EnhancedInstructorRequest;
    
    if (request.status !== 'pending') return null;
    
    targetInstructor.studentRequests[requestIndex] = {
      ...request,
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelledBy: studentId,
      cancellationReason: reason,
      lastUpdatedAt: new Date()
    };
    
    storage.saveUsers(users);
    return targetInstructor.studentRequests[requestIndex] as EnhancedInstructorRequest;
  }

  // Bulk operations for instructors
  bulkUpdateStatus(
    requestIds: string[],
    status: 'accepted' | 'declined',
    instructorId: string
  ): BulkOperationResult {
    const users = storage.getUsers();
    const instructor = users.find(user => 
      user.id === instructorId && user.role === 'instructor'
    );
    
    if (!instructor || !instructor.studentRequests) {
      return {
        success: false,
        processed: 0,
        failed: requestIds.length,
        errors: ['Instructor not found or no requests']
      };
    }
    
    let processed = 0;
    let failed = 0;
    const errors: string[] = [];
    
    for (const requestId of requestIds) {
      const requestIndex = instructor.studentRequests.findIndex(
        req => req.id === requestId && req.status === 'pending'
      );
      
      if (requestIndex === -1) {
        failed++;
        errors.push(`Request ${requestId} not found or not pending`);
        continue;
      }
      
      const request = instructor.studentRequests[requestIndex] as EnhancedInstructorRequest;
      
      instructor.studentRequests[requestIndex] = {
        ...request,
        status,
        respondedAt: new Date(),
        lastUpdatedAt: new Date()
      };
      
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
      
      processed++;
    }
    
    storage.saveUsers(users);
    
    return {
      success: failed === 0,
      processed,
      failed,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  // Get all connections for a user (both student and instructor perspectives)
  getInstructorConnections(userId: string): EnhancedInstructorRequest[] {
    const users = storage.getUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) return [];
    
    const connections: EnhancedInstructorRequest[] = [];
    
    if (user.role === 'student') {
      // Get all requests where this student is the requester
      users.forEach(instructor => {
        if (instructor.role === 'instructor' && instructor.studentRequests) {
          const studentRequests = instructor.studentRequests.filter(
            (req: EnhancedInstructorRequest) => req.studentId === userId
          );
          connections.push(...studentRequests);
        }
      });
    } else if (user.role === 'instructor') {
      // Get all requests for this instructor
      if (user.studentRequests) {
        connections.push(...user.studentRequests);
      }
    }
    
    return connections.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Get statistics for an instructor
  getStats(instructorId: string): InstructorRequestStats {
    const requests = this.getRequestsForInstructor(instructorId).requests;
    
    const stats: InstructorRequestStats = {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      accepted: requests.filter(r => r.status === 'accepted').length,
      declined: requests.filter(r => r.status === 'declined').length,
      cancelled: requests.filter(r => r.status === 'cancelled').length,
      byCourse: {},
      byPriority: {},
      byCategory: {}
    };
    
    // Calculate by course
    requests.forEach(request => {
      if (request.courseName) {
        stats.byCourse[request.courseName] = (stats.byCourse[request.courseName] || 0) + 1;
      }
    });
    
    // Calculate by priority
    requests.forEach(request => {
      const priority = request.priority || 'medium';
      stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;
    });
    
    // Calculate by category
    requests.forEach(request => {
      const category = request.category || 'academic';
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
    });
    
    return stats;
  }

  // Private helper method to apply filters
  private applyFilters(
    requests: EnhancedInstructorRequest[],
    filters: InstructorRequestFilters
  ): EnhancedInstructorRequest[] {
    return requests.filter(request => {
      if (filters.status && request.status !== filters.status) return false;
      if (filters.courseId && request.courseId !== filters.courseId) return false;
      if (filters.priority && request.priority !== filters.priority) return false;
      if (filters.category && request.category !== filters.category) return false;
      
      if (filters.dateFrom && request.createdAt < filters.dateFrom) return false;
      if (filters.dateTo && request.createdAt > filters.dateTo) return false;
      
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const searchableText = [
          request.studentName,
          request.message,
          request.courseName,
          request.notes
        ].filter(Boolean).join(' ').toLowerCase();
        
        if (!searchableText.includes(searchLower)) return false;
      }
      
      return true;
    });
  }
}

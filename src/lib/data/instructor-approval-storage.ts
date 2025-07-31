import { InstructorApprovalRequest } from '@/lib/types';
import { storage } from './storage';

export class InstructorApprovalStorage {
  private static readonly APPROVAL_REQUESTS_KEY = 'instructor_approval_requests';

  static getAllRequests(): InstructorApprovalRequest[] {
    if (typeof window === 'undefined') return [];
    const requests = localStorage.getItem(this.APPROVAL_REQUESTS_KEY);
    return requests ? JSON.parse(requests) : [];
  }

  static saveRequests(requests: InstructorApprovalRequest[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.APPROVAL_REQUESTS_KEY, JSON.stringify(requests));
  }

  static createRequest(userId: string, userName: string, userEmail: string, message?: string): InstructorApprovalRequest {
    const requests = this.getAllRequests();
    
    const request: InstructorApprovalRequest = {
      id: Date.now().toString(),
      userId,
      userName,
      userEmail,
      message,
      status: 'pending',
      createdAt: new Date()
    };
    
    requests.push(request);
    this.saveRequests(requests);
    return request;
  }

  static getPendingRequests(): InstructorApprovalRequest[] {
    const requests = this.getAllRequests();
    return requests.filter(req => req.status === 'pending');
  }

  static updateRequestStatus(requestId: string, status: 'approved' | 'declined'): InstructorApprovalRequest | null {
    const requests = this.getAllRequests();
    const requestIndex = requests.findIndex(req => req.id === requestId);
    
    if (requestIndex === -1) return null;
    
    requests[requestIndex] = {
      ...requests[requestIndex],
      status,
      respondedAt: new Date()
    };
    
    this.saveRequests(requests);
    
    // If approved, update the user's approval status
    if (status === 'approved') {
      const users = storage.getUsers();
      const userIndex = users.findIndex(u => u.id === requests[requestIndex].userId);
      if (userIndex !== -1) {
        users[userIndex].isApproved = true;
        storage.saveUsers(users);
      }
    }
    
    return requests[requestIndex];
  }

  static getRequestById(requestId: string): InstructorApprovalRequest | null {
    const requests = this.getAllRequests();
    return requests.find(req => req.id === requestId) || null;
  }
}

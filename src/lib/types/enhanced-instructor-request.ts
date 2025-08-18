import { InstructorRequest } from './index';

export interface EnhancedInstructorRequest extends InstructorRequest {
  courseId?: string;
  courseName?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: 'academic' | 'career' | 'personal';
  attachments?: string[];
  notes?: string;
  lastUpdatedAt?: Date;
  cancelledAt?: Date;
  cancelledBy?: string;
  cancellationReason?: string;
}

export interface InstructorRequestFilters {
  status?: 'pending' | 'accepted' | 'declined' | 'cancelled';
  courseId?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: 'academic' | 'career' | 'personal';
  dateFrom?: Date;
  dateTo?: Date;
  searchTerm?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedInstructorRequests {
  requests: EnhancedInstructorRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BulkOperationResult {
  success: boolean;
  processed: number;
  failed: number;
  errors?: string[];
}

export interface InstructorRequestStats {
  total: number;
  pending: number;
  accepted: number;
  declined: number;
  cancelled: number;
  byCourse: Record<string, number>;
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
}

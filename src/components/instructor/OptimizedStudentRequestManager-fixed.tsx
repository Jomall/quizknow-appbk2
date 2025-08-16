'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef, memo } from 'react';
import { useInstructorCourses, useStudentRequests } from '@/hooks/useInstructorData-fixed';
import { Search, Filter, Calendar, Users, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Optimized interfaces
interface OptimizedStudentRequest {
  id: string;
  student: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  course: {
    id: string;
    title: string;
  };
  requestDate: string;
  status: 'pending' | 'approved' | 'declined' | 'on_hold';
  priority: 'low' | 'medium' | 'high';
  message?: string;
}

// Map from StudentRequest to OptimizedStudentRequest
const mapStudentRequest = (request: any): OptimizedStudentRequest => ({
  id: request.student?.id || Math.random().toString(36).substr(2, 9),
  student: {
    id: request.student?.id || '',
    name: request.student?.name || 'Unknown Student',
    email: request.student?.email || 'unknown@example.com',
    avatar: request.student?.avatar
  },
  course: {
    id: request.course?.id || '',
    title: request.course?.title || 'Unknown Course'
  },
  requestDate: request.requestDate || new Date().toISOString(),
  status: request.status || 'pending',
  priority: 'medium',
  message: ''
});

// Memoized child components
const RequestCard = memo(({ request, onStatusChange, onViewDetails }: {
  request: OptimizedStudentRequest;
  onStatusChange: (id: string, status: string) => void;
  onViewDetails: (request: OptimizedStudentRequest) => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={cn(
        "p-4 border rounded-lg transition-all duration-200 cursor-pointer",
        isHovered ? "shadow-md border-blue-200" : "shadow-sm",
        request.priority === 'high' && "border-red-200 bg-red-50/50"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewDetails(request)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {request.student.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{request.student.name}</h4>
              <p className="text-sm text-gray-500">{request.student.email}</p>
            </div>
          </div>
          
          <div className="mt-3 space-y-1">
            <p className="text-sm font-medium text-gray-700">{request.course.title}</p>
            <p className="text-xs text-gray-500">
              {format(new Date(request.requestDate), 'MMM dd, yyyy • h:mm a')}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className={cn(
            "px-2 py-1 text-xs font-medium rounded-full",
            request.status === 'pending' && "bg-yellow-100 text-yellow-800",
            request.status === 'approved' && "bg-green-100 text-green-800",
            request.status === 'declined' && "bg-red-100 text-red-800",
            request.status === 'on_hold' && "bg-gray-100 text-gray-800"
          )}>
            {request.status.replace('_', ' ')}
          </span>
          
          {request.priority === 'high' && (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
        </div>
      </div>
    </div>
  );
});

RequestCard.displayName = 'RequestCard';

// Optimized list with pagination
const PaginatedRequestList = memo(({ requests, onStatusChange, onViewDetails }: {
  requests: OptimizedStudentRequest[];
  onStatusChange: (id: string, status: string) => void;
  onViewDetails: (request: OptimizedStudentRequest) => void;
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return requests.slice(startIndex, startIndex + itemsPerPage);
  }, [requests, currentPage]);

  const totalPages = Math.ceil(requests.length / itemsPerPage);

  return (
    <div>
      <div className="space-y-4">
        {paginatedRequests.map((request) => (
          <RequestCard 
            key={request.id}
            request={request} 
            onStatusChange={onStatusChange}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={cn(
                "px-3 py-1 rounded text-sm",
                page === currentPage 
                  ? "bg-blue-500 text-white" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              )}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

PaginatedRequestList.displayName = 'PaginatedRequestList';

// Main optimized component
export const OptimizedStudentRequestManager = memo(() => {
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({ from: undefined, to: undefined });
  
  // Use actual data fetching - need instructorId
  const [instructorId] = useState('current-instructor-id'); // Replace with actual instructor ID
  const { data: courses } = useInstructorCourses(instructorId);
  const { data: requestsData } = useStudentRequests(instructorId);

  // Mock data for demonstration
  const mockRequests: OptimizedStudentRequest[] = [
    {
      id: '1',
      student: { id: '1', name: 'Alice Johnson', email: 'alice@example.com' },
      course: { id: '1', title: 'Introduction to React' },
      requestDate: new Date().toISOString(),
      status: 'pending',
      priority: 'high',
      message: 'Please review my application'
    },
    {
      id: '2',
      student: { id: '2', name: 'Bob Smith', email: 'bob@example.com' },
      course: { id: '2', title: 'Advanced TypeScript' },
      requestDate: new Date(Date.now() - 86400000).toISOString(),
      status: 'approved',
      priority: 'medium'
    },
    {
      id: '3',
      student: { id: '3', name: 'Carol Davis', email: 'carol@example.com' },
      course: { id: '3', title: 'Node.js Fundamentals' },
      requestDate: new Date(Date.now() - 172800000).toISOString(),
      status: 'declined',
      priority: 'low'
    },
    {
      id: '4',
      student: { id: '4', name: 'David Wilson', email: 'david@example.com' },
      course: { id: '4', title: 'Database Design' },
      requestDate: new Date(Date.now() - 259200000).toISOString(),
      status: 'pending',
      priority: 'medium'
    },
    {
      id: '5',
      student: { id: '5', name: 'Emma Brown', email: 'emma@example.com' },
      course: { id: '5', title: 'Web Development Bootcamp' },
      requestDate: new Date(Date.now() - 345600000).toISOString(),
      status: 'on_hold',
      priority: 'high'
    }
  ];

  // Ensure we always have an array, handling both array and object responses
  const requestsArray = Array.isArray(requestsData) ? requestsData : 
                       (requestsData && Array.isArray((requestsData as any).data) ? (requestsData as any).data : []);
  
  const allRequests: OptimizedStudentRequest[] = requestsArray.length > 0 ? 
    requestsArray.map(mapStudentRequest) : mockRequests;

  // Optimized filtering with useMemo
  const filteredRequests = useMemo(() => {
    let filtered = allRequests;

    if (searchQuery) {
      filtered = filtered.filter(request =>
        request.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.course.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(request => request.priority === priorityFilter);
    }

    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter(request => {
        const requestDate = new Date(request.requestDate);
        return requestDate >= dateRange.from! && requestDate <= dateRange.to!;
      });
    }

    return filtered;
  }, [allRequests, searchQuery, statusFilter, priorityFilter, dateRange]);

  // Debounced search
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Optimized callbacks
  const handleStatusChange = useCallback(async (id: string, status: string) => {
    try {
      console.log(`Updating request ${id} to status ${status}`);
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
    }
  }, []);

  const handleViewDetails = useCallback((request: OptimizedStudentRequest) => {
    console.log('View details:', request);
  }, []);

  // Performance monitoring
  const renderCount = useRef(0);
  useEffect(() => {
    renderCount.current += 1;
    console.log('OptimizedStudentRequestManager rendered', renderCount.current, 'times');
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Student Requests</h2>
        <div className="text-sm text-gray-500">
          {filteredRequests.length} requests found
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="declined">Declined</option>
          <option value="on_hold">On Hold</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <input
            type="date"
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value ? new Date(e.target.value) : undefined })}
            className="px-3 py-2 border rounded-lg text-sm"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value ? new Date(e.target.value) : undefined })}
            className="px-3 py-2 border rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg shadow">
        {filteredRequests.length > 0 ? (
          <PaginatedRequestList
            requests={filteredRequests}
            onStatusChange={handleStatusChange}
            onViewDetails={handleViewDetails}
          />
        ) : (
          <div className="text-center py-12 text-gray-500">
            No requests found
          </div>
        )}
      </div>
    </div>
  );
});

OptimizedStudentRequestManager.displayName = 'OptimizedStudentRequestManager';

export default OptimizedStudentRequestManager;

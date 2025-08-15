'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useInstructorCourses, useStudentRequests, useApproveStudent, useDeclineStudent, useBulkApproveStudents } from '@/hooks/useInstructorData-fixed';
import { User, Course } from '@/lib/types';
import { useQueryClient } from '@tanstack/react-query';
import { Check, X, Users, Clock, AlertCircle, Search, Calendar, MessageSquare, Filter, Download, Save, Trash2, RefreshCw, ChevronLeft, ChevronRight, Eye, FileText, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface StudentRequest {
  student: User;
  course: Course;
  requestDate: Date;
  status: 'pending' | 'approved' | 'declined';
  notes?: string;
}

interface CourseWithId extends Course {
  id: string;
}

interface EnhancedStudentRequestManagerProps {
  instructorId: string;
}

export function EnhancedStudentRequestManager({ instructorId }: EnhancedStudentRequestManagerProps) {
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' });
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<StudentRequest | null>(null);
  const [requestNotes, setRequestNotes] = useState('');
  const [showBulkNotesModal, setShowBulkNotesModal] = useState(false);
  const [bulkNotes, setBulkNotes] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'course'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data: courses = [] } = useInstructorCourses(instructorId);
  const { data: requestsData, isLoading, error } = useStudentRequests(instructorId);
  const requests = (requestsData as StudentRequest[]) || [];
  const approveMutation = useApproveStudent();
  const declineMutation = useDeclineStudent();
  const bulkApproveMutation = useBulkApproveStudents();

  // Enhanced filtering and sorting
  const filteredAndSortedRequests = useMemo(() => {
    let filtered = selectedCourse === 'all' 
      ? requests 
      : requests.filter((req: StudentRequest) => req.course.id === selectedCourse);

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((req: StudentRequest) =>
        req.student.name.toLowerCase().includes(term) ||
        req.student.email.toLowerCase().includes(term) ||
        req.course.title.toLowerCase().includes(term)
      );
    }

    // Date range filter
    if (dateRange.from && dateRange.to) {
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter((req: StudentRequest) => {
        const requestDate = new Date(req.requestDate);
        return requestDate >= fromDate && requestDate <= toDate;
      });
    }

    // Sorting
    filtered.sort((a: StudentRequest, b: StudentRequest) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.student.name.localeCompare(b.student.name);
          break;
        case 'course':
          comparison = a.course.title.localeCompare(b.course.title);
          break;
        case 'date':
        default:
          comparison = new Date(a.requestDate).getTime() - new Date(b.requestDate).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [requests, selectedCourse, searchTerm, dateRange, sortBy, sortOrder]);

  const pendingRequests = filteredAndSortedRequests.filter((req: StudentRequest) => req.status === 'pending');
  const approvedRequests = filteredAndSortedRequests.filter((req: StudentRequest) => req.status === 'approved');
  const declinedRequests = filteredAndSortedRequests.filter((req: StudentRequest) => req.status === 'declined');

  const handleSelectRequest = (requestId: string) => {
    const newSelected = new Set(selectedRequests);
    if (newSelected.has(requestId)) {
      newSelected.delete(requestId);
    } else {
      newSelected.add(requestId);
    }
    setSelectedRequests(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRequests.size === pendingRequests.length) {
      setSelectedRequests(new Set());
    } else {
      setSelectedRequests(new Set(pendingRequests.map(req => `${req.student.id}-${req.course.id}`)));
    }
  };

  const handleApprove = async (studentId: string, courseId: string, notes?: string) => {
    try {
      await approveMutation.mutateAsync({ studentId, courseId, notes });
      toast.success('Student approved successfully');
      setShowNotesModal(false);
      setSelectedRequest(null);
      setRequestNotes('');
    } catch (error) {
      toast.error('Failed to approve student');
    }
  };

  const handleDecline = async (studentId: string, courseId: string, notes?: string) => {
    try {
      await declineMutation.mutateAsync({ studentId, courseId, notes });
      toast.success('Student declined successfully');
      setShowNotesModal(false);
      setSelectedRequest(null);
      setRequestNotes('');
    } catch (error) {
      toast.error('Failed to decline student');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedRequests.size === 0) return;
    
    try {
      const requestsToApprove = Array.from(selectedRequests).map(id => {
        const [studentId, courseId] = id.split('-');
        return { studentId, courseId, notes: bulkNotes };
      });
      
      await bulkApproveMutation.mutateAsync(requestsToApprove);
      toast.success(`Approved ${selectedRequests.size} students successfully`);
      setSelectedRequests(new Set());
      setShowBulkNotesModal(false);
      setBulkNotes('');
    } catch (error) {
      toast.error('Failed to approve selected students');
    }
  };

  const openNotesModal = (request: StudentRequest, isApprove: boolean) => {
    setSelectedRequest(request);
    setRequestNotes('');
    setShowNotesModal(true);
  };

  const openBulkNotesModal = () => {
    if (selectedRequests.size === 0) {
      toast.error('Please select at least one request');
      return;
    }
    setBulkNotes('');
    setShowBulkNotesModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">Error loading student requests</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Requests</h2>
          <p className="text-gray-600">Manage student enrollment requests with advanced filtering</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{pendingRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Check className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold">{approvedRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <X className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Declined</p>
                <p className="text-2xl font-bold">{declinedRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{filteredAndSortedRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students or courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>From Date</Label>
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              />
            </div>

            <div>
              <Label>To Date</Label>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={(value: 'date' | 'name' | 'course') => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Request Date</SelectItem>
                  <SelectItem value="name">Student Name</SelectItem>
                  <SelectItem value="course">Course Title</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Sort Order</Label>
              <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedRequests.size > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedRequests.size} request{selectedRequests.size > 1 ? 's' : ''} selected
              </span>
              <div className="flex space-x-2">
                <Button
                  onClick={openBulkNotesModal}
                  disabled={bulkApproveMutation.isPending}
                  className="flex items-center"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequests.length > 0 && (
            <div className="mb-4">
              <label className="flex items-center">
                <Checkbox
                  checked={selectedRequests.size === pendingRequests.length}
                  onCheckedChange={handleSelectAll}
                  className="mr-3"
                />
                <span className="text-sm font-medium">Select all pending requests</span>
              </label>
            </div>
          )}

          <div className="space-y-4">
            {pendingRequests.map((request) => {
              const requestId = `${request.student.id}-${request.course.id}`;
              const isSelected = selectedRequests.has(requestId);
              
              return (
                <div key={requestId} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleSelectRequest(requestId)}
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {request.student.name}
                          </h3>
                          <Badge variant="outline">{request.course.title}</Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600">{request.student.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Requested on: {format(request.requestDate, 'MMM d, yyyy at h:mm a')}
                        </p>
                        
                        {request.notes && (
                          <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                            <strong>Previous notes:</strong> {request.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => openNotesModal(request, true)}
                        disabled={approveMutation.isPending}
                        className="flex items-center"
                        size="sm"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      
                      <Button
                        onClick={() => openNotesModal(request, false)}
                        disabled={declineMutation.isPending}
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {pendingRequests.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No pending student requests</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes Modal for Single Request */}
      <Dialog open={showNotesModal} onOpenChange={setShowNotesModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Notes</DialogTitle>
            <DialogDescription>
              Add optional notes for this approval/decline decision
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Student</Label>
              <p className="text-sm text-gray-600">{selectedRequest?.student.name}</p>
            </div>
            
            <div>
              <Label>Course</Label>
              <p className="text-sm text-gray-600">{selectedRequest?.course.title}</p>
            </div>
            
            <div>
              <Label>Notes (optional)</Label>
              <Textarea
                value={requestNotes}
                onChange={(e) => setRequestNotes(e.target.value)}
                placeholder="Add any relevant notes..."
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              onClick={() => {
                if (selectedRequest) {
                  handleApprove(selectedRequest.student.id, selectedRequest.course.id, requestNotes);
                }
              }}
              disabled={approveMutation.isPending}
            >
              Approve with Notes
            </Button>
            <Button
              onClick={() => {
                if (selectedRequest) {
                  handleDecline(selectedRequest.student.id, selectedRequest.course.id, requestNotes);
                }
              }}
              variant="outline"
              disabled={declineMutation.isPending}
            >
              Decline with Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Notes Modal */}
      <Dialog open={showBulkNotesModal} onOpenChange={setShowBulkNotesModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Approval Notes</DialogTitle>
            <DialogDescription>
              Add optional notes for bulk approval of {selectedRequests.size} student{selectedRequests.size > 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>
          
          <div>
            <Label>Notes (optional)</Label>
            <Textarea
              value={bulkNotes}
              onChange={(e) => setBulkNotes(e.target.value)}
              placeholder="Add notes for all selected approvals..."
              rows={4}
            />
          </div>
          
          <DialogFooter>
            <Button
              onClick={handleBulkApprove}
              disabled={bulkApproveMutation.isPending}
            >
              Approve {selectedRequests.size} Student{selectedRequests.size > 1 ? 's' : ''}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowBulkNotesModal(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

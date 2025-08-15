'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useInstructorCourses, useStudentRequests, useApproveStudent, useDeclineStudent, useBulkApproveStudents } from '@/hooks/useInstructorData-fixed';
import { User, Course } from '@/lib/types';
import { useQueryClient } from '@tanstack/react-query';
import { Check, X, Users, Clock, AlertCircle, Search, Calendar, MessageSquare, Filter, Download, Save, Trash2, RefreshCw, ChevronLeft, ChevronRight, Eye, FileText, BarChart3, TrendingUp, Mail, Phone, MapPin, CalendarDays, Star, Tag, AlertTriangle, CheckCircle2, Clock3 } from 'lucide-react';
import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';

interface StudentRequest {
  student: User;
  course: Course;
  requestDate: Date;
  status: 'pending' | 'approved' | 'declined' | 'on-hold';
  notes?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  lastActivity?: Date;
  previousRequests?: number;
  source?: 'direct' | 'referral' | 'search' | 'promotion';
}

interface CourseWithId extends Course {
  id: string;
}

interface EnhancedStudentRequestManagerProps {
  instructorId: string;
}

interface RequestStats {
  total: number;
  pending: number;
  approved: number;
  declined: number; // Define the type for declined
  onHold: number;
  highPriority: number;
  thisWeek: number;
  thisMonth: number;
  averageResponseTime: string;
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
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'course' | 'priority'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'declined' | 'on-hold' | 'all'>('pending');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'direct' | 'referral' | 'search' | 'promotion'>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [selectedRequestDetails, setSelectedRequestDetails] = useState<StudentRequest | null>(null);

  const { data: courses = [] } = useInstructorCourses(instructorId);
  const { data: requestsData, isLoading, error, refetch } = useStudentRequests(instructorId);
  const requests = (requestsData as StudentRequest[]) || [];
  const approveMutation = useApproveStudent();
  const declineMutation = useDeclineStudent();
  const bulkApproveMutation = useBulkApproveStudents();
  const queryClient = useQueryClient();

  // Enhanced filtering and sorting
  const filteredAndSortedRequests = useMemo(() => {
    let filtered = selectedCourse === 'all' 
      ? requests 
      : requests.filter((req: StudentRequest) => req.course.id === selectedCourse);

    // Tab filtering
    if (activeTab !== 'all') {
      filtered = filtered.filter((req: StudentRequest) => req.status === activeTab);
    }

    // Priority filtering
    if (priorityFilter !== 'all') {
      filtered = filtered.filter((req: StudentRequest) => req.priority === priorityFilter);
    }

    // Source filtering
    if (sourceFilter !== 'all') {
      filtered = filtered.filter((req: StudentRequest) => req.source === sourceFilter);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((req: StudentRequest) =>
        req.student.name.toLowerCase().includes(term) ||
        req.student.email.toLowerCase().includes(term) ||
        req.course.title.toLowerCase().includes(term) ||
        (req.tags && req.tags.some(tag => tag.toLowerCase().includes(term)))
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
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          comparison = (priorityOrder[a.priority || 'medium'] || 0) - (priorityOrder[b.priority || 'medium'] || 0);
          break;
        case 'date':
        default:
          comparison = new Date(a.requestDate).getTime() - new Date(b.requestDate).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [requests, selectedCourse, activeTab, priorityFilter, sourceFilter, searchTerm, dateRange, sortBy, sortOrder]);

  // Calculate statistics
  const stats = useMemo<RequestStats>(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const pending = requests.filter(r => r.status === 'pending').length;
    const approved = requests.filter(r => r.status === 'approved').length;
    const declined = requests.filter(r => r.status === 'declined').length;
    const onHold = requests.filter(r => r.status === 'on-hold').length;
    const highPriority = requests.filter(r => r.priority === 'high' || r.priority === 'urgent').length;
    const thisWeek = requests.filter(r => new Date(r.requestDate) >= weekAgo).length;
    const thisMonth = requests.filter(r => new Date(r.requestDate) >= monthAgo).length;

    // Calculate average response time
    const approvedRequests = requests.filter(r => r.status === 'approved' || r.status === 'declined');
    const avgResponseTime = approvedRequests.length > 0 
      ? `${Math.round(approvedRequests.reduce((sum, r) => {
          const responseTime = new Date().getTime() - new Date(r.requestDate).getTime();
          return sum + responseTime;
        }, 0) / approvedRequests.length / (1000 * 60 * 60 * 24))} days`
      : 'N/A';

    return {
      total: requests.length,
      pending,
      approved,
      declined,
      onHold,
      highPriority,
      thisWeek,
      thisMonth,
      averageResponseTime: avgResponseTime
    };
  }, [requests]);

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
    const currentTabRequests = filteredAndSortedRequests.filter(r => r.status === activeTab);
    if (selectedRequests.size === currentTabRequests.length) {
      setSelectedRequests(new Set());
    } else {
      setSelectedRequests(new Set(currentTabRequests.map(req => `${req.student.id}-${req.course.id}`)));
    }
  };

  const handleApprove = async (studentId: string, courseId: string, notes?: string) => {
    try {
      await approveMutation.mutateAsync({ studentId, courseId, notes });
      toast.success('Student approved successfully');
      setShowNotesModal(false);
      setSelectedRequest(null);
      setRequestNotes('');
      refetch();
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
      refetch();
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
      refetch();
    } catch (error) {
      toast.error('Failed to approve selected students');
    }
  };

  const handleExport = () => {
    const dataToExport = filteredAndSortedRequests.map(req => ({
      studentName: req.student.name,
      studentEmail: req.student.email,
      courseTitle: req.course.title,
      requestDate: format(req.requestDate, 'yyyy-MM-dd HH:mm:ss'),
      status: req.status,
      priority: req.priority || 'medium',
      notes: req.notes || '',
      tags: req.tags?.join(', ') || '',
      source: req.source || 'direct'
    }));

    if (exportFormat === 'csv') {
      const csv = [
        ['Student Name', 'Email', 'Course', 'Request Date', 'Status', 'Priority', 'Notes', 'Tags', 'Source'],
        ...dataToExport.map(row => Object.values(row))
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `student-requests-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
    } else if (exportFormat === 'json') {
      const json = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `student-requests-${format(new Date(), 'yyyy-MM-dd')}.json`;
      a.click();
    }
    
    setShowExportModal(false);
    toast.success('Export completed successfully');
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

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock3 className="h-4 w-4" />;
      case 'approved': return <CheckCircle2 className="h-4 w-4" />;
      case 'declined': return <X className="h-4 w-4" />;
      case 'on-hold': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock3 className="h-4 w-4" />;
    }
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    
    if (isToday(new Date(date))) {
      return `Today at ${format(new Date(date), 'h:mm a')}`;
    } else if (isYesterday(new Date(date))) {
      return `Yesterday at ${format(new Date(date), 'h:mm a')}`;
    } else if (isThisWeek(new Date(date))) {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } else {
      return format(new Date(date), 'MMM d, yyyy');
    }
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
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Error loading student requests. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Student Request Management</h2>
          <p className="text-gray-600 mt-1">Manage and track all student enrollment requests</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowExportModal(true)}
            variant="outline"
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock3 className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold">{stats.thisWeek}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
          <TabsTrigger value="declined">Declined ({stats.declined})</TabsTrigger>
          <TabsTrigger value="on-hold">On Hold ({stats.onHold})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Filters & Search</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  {showAdvancedFilters ? 'Simple' : 'Advanced'}
                  <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${showAdvancedFilters ? 'rotate-90' : ''}`} />
                </Button>
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
                      placeholder="Search students, courses, tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label>Sort By</Label>
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Request Date</SelectItem>
                      <SelectItem value="name">Student Name</SelectItem>
                      <SelectItem value="course">Course Title</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Order</Label>
                  <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Newest First</SelectItem>
                      <SelectItem value="asc">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {showAdvancedFilters && (
                  <>
                    <div>
                      <Label>Priority</Label>
                      <Select value={priorityFilter} onValueChange={(value: any) => setPriorityFilter(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priorities</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Source</Label>
                      <Select value={sourceFilter} onValueChange={(value: any) => setSourceFilter(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Sources</SelectItem>
                          <SelectItem value="direct">Direct</SelectItem>
                          <SelectItem value="referral">Referral</SelectItem>
                          <SelectItem value="search">Search</SelectItem>
                          <SelectItem value="promotion">Promotion</SelectItem>
                        </SelectContent>
                      </Select>
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
                  </>
                )}
              </div>

              {selectedRequests.size > 0 && (
                <div className="mt-4 flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                  <span className="text-sm font-medium">
                    {selectedRequests.size} request{selectedRequests.size > 1 ? 's' : ''} selected
                  </span>
                  <Button
                    onClick={openBulkNotesModal}
                    disabled={bulkApproveMutation.isPending}
                    size="sm"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve Selected
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Requests List */}
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'all' ? 'All Requests' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Requests`}
                <span className="text-sm font-normal text-gray-600 ml-2">({filteredAndSortedRequests.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {filteredAndSortedRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No requests found</p>
                    </div>
                  ) : (
                    filteredAndSortedRequests.map((request) => {
                      const requestId = `${request.student.id}-${request.course.id}`;
                      const isSelected = selectedRequests.has(requestId);
                      
                      return (
                        <div key={requestId} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => handleSelectRequest(requestId)}
                                disabled={request.status !== 'pending'}
                              />
                              
                              <Avatar>
                                <AvatarImage src={request.student.avatar} />
                                <AvatarFallback>{request.student.name.charAt(0)}</AvatarFallback>
                              </Avatar>

                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h4 className="font-medium text-gray-900">{request.student.name}</h4>
                                  <Badge variant="outline">{request.course.title}</Badge>
                                  {request.priority && (
                                    <Badge className={getPriorityColor(request.priority)}>
                                      {request.priority}
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="space-y-1 text-sm text-gray-600">
                                  <p>{request.student.email}</p>
                                  <p>Requested {getRelativeTime(request.requestDate)}</p>
                                  {request.source && <p>Source: {request.source}</p>}
                                </div>

                                {request.tags && request.tags.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {request.tags.map(tag => (
                                      <Badge key={tag} variant="secondary" className="text-xs">
                                        <Tag className="h-3 w-3 mr-1" />
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}

                                {request.notes && (
                                  <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                                    <strong>Notes:</strong> {request.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedRequestDetails(request);
                                  setShowRequestDetails(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              
                              {request.status === 'pending' && (
                                <>
                                  <Button
                                    onClick={() => handleApprove(request.student.id, request.course.id)}
                                    disabled={approveMutation.isPending}
                                    size="sm"
                                    className="flex items-center"
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  
                                  <Button
                                    onClick={() => handleDecline(request.student.id, request.course.id)}
                                    disabled={declineMutation.isPending}
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center"
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Decline
                                  </Button>
                                </>
                              )}
                              
                              <Badge variant={request.status === 'approved' ? 'default' : request.status === 'declined' ? 'destructive' : 'secondary'}>
                                {getStatusIcon(request.status)}
                                <span className="ml-1">{request.status}</span>
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Modal */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Requests</DialogTitle>
            <DialogDescription>
              Choose the format to export the filtered requests
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <RadioGroup value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv">CSV (Spreadsheet)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json">JSON (Data)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf">PDF (Report)</Label>
              </div>
            </RadioGroup>
          </div>
          
          <DialogFooter>
            <Button onClick={handleExport}>Export</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Details Modal */}
      <Dialog open={showRequestDetails} onOpenChange={setShowRequestDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          
          {selectedRequestDetails && (
            <ScrollArea className="max-h-[600px]">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedRequestDetails.student.avatar} />
                    <AvatarFallback className="text-2xl">
                      {selectedRequestDetails.student.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedRequestDetails.student.name}</h3>
                    <p className="text-gray-600">{selectedRequestDetails.student.email}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Course</Label>
                    <p className="font-medium">{selectedRequestDetails.course.title}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge className={getPriorityColor(selectedRequestDetails.status)}>
                      {selectedRequestDetails.status}
                    </Badge>
                  </div>
                  <div>
                    <Label>Request Date</Label>
                    <p>{format(selectedRequestDetails.requestDate, 'MMM d, yyyy')}</p>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Badge className={getPriorityColor(selectedRequestDetails.priority)}>
                      {selectedRequestDetails.priority || 'Medium'}
                    </Badge>
                  </div>
                  {selectedRequestDetails.source && (
                    <div>
                      <Label>Source</Label>
                      <p className="capitalize">{selectedRequestDetails.source}</p>
                    </div>
                  )}
                </div>

                {selectedRequestDetails.tags && selectedRequestDetails.tags.length > 0 && (
                  <div>
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedRequestDetails.tags.map(tag => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRequestDetails.notes && (
                  <div>
                    <Label>Notes</Label>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                      {selectedRequestDetails.notes}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

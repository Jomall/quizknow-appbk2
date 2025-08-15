'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useInstructorCourses, useStudentRequests, useApproveStudent, useDeclineStudent, useBulkApproveStudents } from '@/hooks/useInstructorData-fixed';
import { User, Course } from '@/lib/types';
import { useQueryClient } from '@tanstack/react-query';
import { Check, X, Users, Clock, AlertCircle, Search, Calendar, MessageSquare, Filter, Download, Save, Trash2, RefreshCw, ChevronLeft, ChevronRight, Eye, FileText, BarChart3, TrendingUp, Mail, Phone, MapPin, CalendarDays, Star, Tag, AlertTriangle, CheckCircle2, Clock3 } from 'lucide-react';
import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek, isThisMonth, subDays } from 'date-fns';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

// Performance optimization: Virtual scrolling hook
const useVirtualScroll = (items: any[], itemHeight: number, containerHeight: number) => {
  const [scrollTop, setScrollTop] = useState(0);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + Math.ceil(containerHeight / itemHeight) + 1, items.length);
  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;

  return { visibleItems, offsetY, startIndex, endIndex };
};

// Debounce hook for search
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Filter presets
const FILTER_PRESETS = {
  today: {
    label: 'Today',
    dateRange: { from: format(new Date(), 'yyyy-MM-dd'), to: format(new Date(), 'yyyy-MM-dd') }
  },
  yesterday: {
    label: 'Yesterday',
    dateRange: { from: format(subDays(new Date(), 1), 'yyyy-MM-dd'), to: format(subDays(new Date(), 1), 'yyyy-MM-dd') }
  },
  thisWeek: {
    label: 'This Week',
    dateRange: { from: format(subDays(new Date(), 7), 'yyyy-MM-dd'), to: format(new Date(), 'yyyy-MM-dd') }
  },
  thisMonth: {
    label: 'This Month',
    dateRange: { from: format(subDays(new Date(), 30), 'yyyy-MM-dd'), to: format(new Date(), 'yyyy-MM-dd') }
  },
  last7Days: {
    label: 'Last 7 Days',
    dateRange: { from: format(subDays(new Date(), 7), 'yyyy-MM-dd'), to: format(new Date(), 'yyyy-MM-dd') }
  },
  last30Days: {
    label: 'Last 30 Days',
    dateRange: { from: format(subDays(new Date(), 30), 'yyyy-MM-dd'), to: format(new Date(), 'yyyy-MM-dd') }
  }
};

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
  responseTime?: number;
}

interface RequestStats {
  total: number;
  pending: number;
  approved: number;
  declined: number;
  onHold: number;
  highPriority: number;
  thisWeek: number;
  thisMonth: number;
  averageResponseTime: string;
  responseTimeDistribution: {
    under1Hour: number;
    under1Day: number;
    under1Week: number;
    over1Week: number;
  };
}

interface FilterPreset {
  name: string;
  filters: {
    dateRange?: { from: string; to: string };
    priority?: string;
    source?: string;
    status?: string;
  };
}

export function EnhancedStudentRequestManagerOptimized({ instructorId }: { instructorId: string }) {
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [savedFilters, setSavedFilters] = useState<FilterPreset[]>([]);
  const [showSaveFilterModal, setShowSaveFilterModal] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'course' | 'priority' | 'responseTime'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'declined' | 'on-hold' | 'all'>('pending');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'direct' | 'referral' | 'search' | 'promotion'>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [selectedRequestDetails, setSelectedRequestDetails] = useState<StudentRequest | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<StudentRequest | null>(null);
  const [requestNotes, setRequestNotes] = useState('');

  const { data: courses = [] } = useInstructorCourses(instructorId);
  const { data: requestsData, isLoading, error, refetch } = useStudentRequests(instructorId);
  const requests = (requestsData as StudentRequest[]) || [];
  const approveMutation = useApproveStudent();
  const declineMutation = useDeclineStudent();
  const bulkApproveMutation = useBulkApproveStudents();
  const queryClient = useQueryClient();

  // Load saved filters from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('studentRequestFilters');
    if (saved) {
      setSavedFilters(JSON.parse(saved));
    }
  }, []);

  // Save filters to localStorage
  const saveFilterPreset = () => {
    if (!filterName.trim()) return;
    
    const newFilter: FilterPreset = {
      name: filterName,
      filters: {
        dateRange: dateRange.from && dateRange.to ? {
          from: format(dateRange.from, 'yyyy-MM-dd'),
          to: format(dateRange.to, 'yyyy-MM-dd')
        } : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        source: sourceFilter !== 'all' ? sourceFilter : undefined,
        status: activeTab !== 'all' ? activeTab : undefined
      }
    };
    
    const updatedFilters = [...savedFilters, newFilter];
    setSavedFilters(updatedFilters);
    localStorage.setItem('studentRequestFilters', JSON.stringify(updatedFilters));
    setShowSaveFilterModal(false);
    setFilterName('');
    toast.success('Filter preset saved successfully');
  };

  // Apply filter preset
  const applyFilterPreset = (preset: FilterPreset) => {
    if (preset.filters.dateRange) {
      setDateRange({
        from: new Date(preset.filters.dateRange.from),
        to: new Date(preset.filters.dateRange.to)
      });
    }
    if (preset.filters.priority) setPriorityFilter(preset.filters.priority as any);
    if (preset.filters.source) setSourceFilter(preset.filters.source as any);
    if (preset.filters.status) setActiveTab(preset.filters.status as any);
  };

  // Enhanced filtering with performance optimization
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

    // Search filter with debounced search
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter((req: StudentRequest) =>
        req.student.name.toLowerCase().includes(term) ||
        req.student.email.toLowerCase().includes(term) ||
        req.course.title.toLowerCase().includes(term) ||
        (req.tags && req.tags.some(tag => tag.toLowerCase().includes(term))) ||
        (req.notes && req.notes.toLowerCase().includes(term))
      );
    }

    // Date range filter
    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter((req: StudentRequest) => {
        const requestDate = new Date(req.requestDate);
        return requestDate >= dateRange.from! && requestDate <= dateRange.to!;
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
        case 'responseTime':
          comparison = (a.responseTime || 0) - (b.responseTime || 0);
          break;
        case 'date':
        default:
          comparison = new Date(a.requestDate).getTime() - new Date(b.requestDate).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [requests, selectedCourse, activeTab, priorityFilter, sourceFilter, debouncedSearchTerm, dateRange, sortBy, sortOrder]);

  // Pagination
  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedRequests.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedRequests, currentPage, pageSize]);

  // Calculate statistics with enhanced metrics
  const stats = useMemo<RequestStats>(() => {
    const now = new Date();
    const weekAgo = subDays(now, 7);
    const monthAgo = subDays(now, 30);

    const pending = requests.filter(r => r.status === 'pending').length;
    const approved = requests.filter(r => r.status === 'approved').length;
    const declined = requests.filter(r => r.status === 'declined').length;
    const onHold = requests.filter(r => r.status === 'on-hold').length;
    const highPriority = requests.filter(r => r.priority === 'high' || r.priority === 'urgent').length;
    const thisWeek = requests.filter(r => new Date(r.requestDate) >= weekAgo).length;
    const thisMonth = requests.filter(r => new Date(r.requestDate) >= monthAgo).length;

    // Calculate response time distribution
    const responseTimes = requests.filter(r => r.responseTime);
    const under1Hour = responseTimes.filter(r => r.responseTime! < 3600000).length;
    const under1Day = responseTimes.filter(r => r.responseTime! < 86400000).length;
    const under1Week = responseTimes.filter(r => r.responseTime! < 604800000).length;
    const over1Week = responseTimes.filter(r => r.responseTime! >= 604800000).length;

    return {
      total: requests.length,
      pending,
      approved,
      declined,
      onHold,
      highPriority,
      thisWeek,
      thisMonth,
      averageResponseTime: `${Math.round(responseTimes.reduce((sum, r) => sum + (r.responseTime || 0), 0) / responseTimes.length / 3600000)}h`,
      responseTimeDistribution: { under1Hour, under1Day, under1Week, over1Week }
    };
  }, [requests]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'a':
            e.preventDefault();
            handleSelectAll();
            break;
          case 'f':
            e.preventDefault();
            document.getElementById('search-input')?.focus();
            break;
          case 'r':
            e.preventDefault();
            refetch();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

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
    const currentTabRequests = paginatedRequests;
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

  const openNotesModal = (request: StudentRequest, isApprove: boolean) => {
    setSelectedRequest(request);
    setRequestNotes('');
    setShowNotesModal(true);
  };

  const getPriorityColor = (priority?: string) => {
    const colors = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
      'on-hold': 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.declined}</div>
            <div className="text-sm text-gray-600">Declined</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.highPriority}</div>
            <div className="text-sm text-gray-600">High Priority</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="All Courses" />
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
              <Label>Priority</Label>
              <Select value={priorityFilter} onValueChange={(value: any) => setPriorityFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Search</Label>
              <Input
                id="search-input"
                placeholder="Search students, courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  {dateRange.from ? format(dateRange.from, 'MMM dd') : 'From'} - {dateRange.to ? format(dateRange.to, 'MMM dd') : 'To'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSaveFilterModal(true)}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Filter
            </Button>

            {savedFilters.length > 0 && (
              <Select onValueChange={(value) => {
                const preset = savedFilters.find(f => f.name === value);
                if (preset) applyFilterPreset(preset);
              }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Load preset" />
                </SelectTrigger>
                <SelectContent>
                  {savedFilters.map(filter => (
                    <SelectItem key={filter.name} value={filter.name}>{filter.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Requests ({filteredAndSortedRequests.length})</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Page {currentPage} of {Math.ceil(filteredAndSortedRequests.length / pageSize)}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">
                    <Checkbox
                      checked={selectedRequests.size === paginatedRequests.length && paginatedRequests.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="text-left p-2">Student</th>
                  <th className="text-left p-2">Course</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Priority</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRequests.map((request) => (
                  <tr key={`${request.student.id}-${request.course.id}`} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <Checkbox
                        checked={selectedRequests.has(`${request.student.id}-${request.course.id}`)}
                        onCheckedChange={() => handleSelectRequest(`${request.student.id}-${request.course.id}`)}
                      />
                    </td>
                    <td className="p-2">
                      <div>
                        <div className="font-medium">{request.student.name}</div>
                        <div className="text-sm text-gray-600">{request.student.email}</div>
                      </div>
                    </td>
                    <td className="p-2">{request.course.title}</td>
                    <td className="p-2 text-sm">{format(request.requestDate, 'MMM dd, yyyy')}</td>
                    <td className="p-2">
                      <Badge className={getPriorityColor(request.priority)}>
                        {request.priority || 'medium'}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openNotesModal(request, true)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openNotesModal(request, false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex justify-between items-center">
            <div>
              <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-2 py-1">
                {currentPage} / {Math.ceil(filteredAndSortedRequests.length / pageSize)}
              </span>
              <Button
                size="sm"
                onClick={() => setCurrentPage(Math.min(Math.ceil(filteredAndSortedRequests.length / pageSize), currentPage + 1))}
                disabled={currentPage === Math.ceil(filteredAndSortedRequests.length / pageSize)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes Modal */}
      <Dialog open={showNotesModal} onOpenChange={setShowNotesModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Notes</DialogTitle>
            <DialogDescription>
              Add notes for {selectedRequest?.student.name}'s request
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={requestNotes}
            onChange={(e) => setRequestNotes(e.target.value)}
            placeholder="Add any relevant notes..."
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotesModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (selectedRequest) {
                handleApprove(selectedRequest.student.id, selectedRequest.course.id, requestNotes);
              }
            }}>
              Approve
            </Button>
            <Button variant="destructive" onClick={() => {
              if (selectedRequest) {
                handleDecline(selectedRequest.student.id, selectedRequest.course.id, requestNotes);
              }
            }}>
              Decline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Filter Modal */}
      <Dialog open={showSaveFilterModal} onOpenChange={setShowSaveFilterModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Filter Preset</DialogTitle>
            <DialogDescription>
              Save your current filter configuration for quick access
            </DialogDescription>
          </DialogHeader>
          <Input
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            placeholder="Enter preset name..."
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveFilterModal(false)}>
              Cancel
            </Button>
            <Button onClick={saveFilterPreset}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

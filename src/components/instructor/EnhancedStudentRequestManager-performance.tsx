'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef, memo, useTransition } from 'react';
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

// Performance optimization: Advanced virtual scrolling with dynamic heights
interface VirtualScrollOptions {
  itemHeight: number;
  overscan: number;
  containerHeight: number;
}

interface VirtualScrollState {
  startIndex: number;
  endIndex: number;
  offsetY: number;
  totalHeight: number;
}

const useAdvancedVirtualScroll = (
  items: any[],
  options: VirtualScrollOptions,
  itemHeightCallback?: (index: number) => number
) => {
  const [scrollState, setScrollState] = useState<VirtualScrollState>(() => ({
    startIndex: 0,
    endIndex: 0,
    offsetY: 0,
    totalHeight: 0,
  }));

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<number>(0);
  const rafRef = useRef<number>();

  // Calculate total height with dynamic item heights
  const totalHeight = useMemo(() => {
    if (itemHeightCallback) {
      return items.reduce((sum, _, index) => sum + itemHeightCallback(index), 0);
    }
    return items.length * options.itemHeight;
  }, [items, itemHeightCallback, options.itemHeight]);

  // Get item position and height
  const getItemPosition = useCallback((index: number) => {
    if (itemHeightCallback) {
      let offset = 0;
      for (let i = 0; i < index; i++) {
        offset += itemHeightCallback(i);
      }
      return { offset, height: itemHeightCallback(index) };
    }
    return { offset: index * options.itemHeight, height: options.itemHeight };
  }, [itemHeightCallback, options.itemHeight]);

  // Update visible items based on scroll position
  const updateVisibleItems = useCallback(() => {
    if (!containerRef.current) return;

    const scrollTop = containerRef.current.scrollTop;
    scrollRef.current = scrollTop;

    let startIndex = 0;
    let accumulatedHeight = 0;

    // Find start index
    for (let i = 0; i < items.length; i++) {
      const { height } = getItemPosition(i);
      if (accumulatedHeight + height > scrollTop) {
        startIndex = Math.max(0, i - options.overscan);
        break;
      }
      accumulatedHeight += height;
    }

    // Find end index
    let visibleHeight = 0;
    let endIndex = startIndex;
    for (let i = startIndex; i < items.length && visibleHeight < options.containerHeight; i++) {
      const { height } = getItemPosition(i);
      visibleHeight += height;
      endIndex = i;
    }
    endIndex = Math.min(items.length, endIndex + options.overscan);

    const { offset } = getItemPosition(startIndex);

    setScrollState({
      startIndex,
      endIndex,
      offsetY: offset,
      totalHeight,
    });
  }, [items, options, totalHeight, getItemPosition]);

  // Throttled scroll handler
  const handleScroll = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(updateVisibleItems);
  }, [updateVisibleItems]);

  // Initialize and cleanup
  useEffect(() => {
    updateVisibleItems();
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [updateVisibleItems, handleScroll]);

  const visibleItems = items.slice(scrollState.startIndex, scrollState.endIndex);

  return {
    containerRef,
    visibleItems,
    scrollState,
    totalHeight,
  };
};

// Performance optimization: Memoized debounce
const useMemoizedDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(() => value);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
};

// Performance optimization: Memoized filtering
const useMemoizedFilters = <T,>(
  items: T[],
  filterFn: (item: T) => boolean,
  sortFn?: (a: T, b: T) => number
) => {
  const [isPending, startTransition] = useTransition();
  
  const filteredAndSorted = useMemo(() => {
    let filtered = items.filter(filterFn);
    if (sortFn) {
      filtered.sort(sortFn);
    }
    return filtered;
  }, [items, filterFn, sortFn]);

  return { items: filteredAndSorted, isPending };
};

// Performance optimization: Intersection observer for lazy loading
const useIntersectionObserver = (
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
) => {
  const observerRef = useRef<IntersectionObserver>();
  const elementRef = useRef<HTMLElement>();

  useEffect(() => {
    if (!elementRef.current) return;

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(callback);
    }, options);

    observerRef.current.observe(elementRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [callback, options]);

  return { elementRef, observerRef };
};

// Performance optimization: Request caching
const useRequestCache = <T,>(key: string, fetcher: () => Promise<T>) => {
  const cacheRef = useRef<Map<string, T>>(new Map());
  const [data, setData] = useState<T | null>(() => null);
  const [loading, setLoading] = useState(() => false);
  const [error, setError] = useState<Error | null>(() => null);

  const fetchData = useCallback(async () => {
    if (cacheRef.current.has(key)) {
      setData(cacheRef.current.get(key)!);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      cacheRef.current.set(key, result);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [key, fetcher]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const invalidate = useCallback(() => {
    cacheRef.current.delete(key);
    fetchData();
  }, [key, fetchData]);

  return { data, loading, error, refetch: invalidate };
};

// Performance optimization: Render time tracking
const usePerformanceMetrics = (componentName: string) => {
  const renderCountRef = useRef(0);
  const renderTimeRef = useRef<number[]>([]);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    renderCountRef.current++;
    const endTime = performance.now();
    const renderTime = endTime - startTimeRef.current;
    
    renderTimeRef.current.push(renderTime);
    
    // Keep only last 100 measurements
    if (renderTimeRef.current.length > 100) {
      renderTimeRef.current.shift();
    }

    console.log(`${componentName} - Render #${renderCountRef.current}: ${renderTime.toFixed(2)}ms`);
  });

  const getMetrics = useCallback(() => ({
    renderCount: renderCountRef.current,
    averageRenderTime: renderTimeRef.current.reduce((a, b) => a + b, 0) / renderTimeRef.current.length,
    lastRenderTime: renderTimeRef.current[renderTimeRef.current.length - 1],
  }), []);

  return { getMetrics, startTimeRef };
};

// Enhanced interfaces
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
  estimatedHeight?: number;
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

// Memoized components
const RequestCard = memo(({ request, onSelect, isSelected }: {
  request: StudentRequest;
  onSelect: (id: string) => void;
  isSelected: boolean;
}) => {
  const { getMetrics, startTimeRef } = usePerformanceMetrics('RequestCard');
  
  useEffect(() => {
    startTimeRef.current = performance.now();
  });

  return (
    <Card 
      className={cn(
        "mb-2 transition-all duration-200",
        isSelected ? "ring-2 ring-blue-500" : ""
      )}
      style={{ height: request.estimatedHeight || 120 }}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(`${request.student.id}-${request.course.id}`)}
            />
            <Avatar>
              <AvatarFallback>{request.student.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{request.student.name}</p>
              <p className="text-sm text-gray-600">{request.student.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={cn(
              "px-2 py-1 text-xs",
              request.status === 'pending' && "bg-yellow-100 text-yellow-800",
              request.status === 'approved' && "bg-green-100 text-green-800",
              request.status === 'declined' && "bg-red-100 text-red-800",
              request.status === 'on-hold' && "bg-gray-100 text-gray-800"
            )}>
              {request.status}
            </Badge>
            {request.priority && (
              <Badge className={cn(
                "px-2 py-1 text-xs",
                request.priority === 'urgent' && "bg-red-100 text-red-800",
                request.priority === 'high' && "bg-orange-100 text-orange-800",
                request.priority === 'medium' && "bg-yellow-100 text-yellow-800",
                request.priority === 'low' && "bg-green-100 text-green-800"
              )}>
                {request.priority}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

RequestCard.displayName = 'RequestCard';

// Main component with performance optimizations
export function EnhancedStudentRequestManagerPerformance({ instructorId }: { instructorId: string }) {
  const { getMetrics, startTimeRef } = usePerformanceMetrics('EnhancedStudentRequestManager');
  startTimeRef.current = performance.now();

  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useMemoizedDebounce(searchTerm, 300);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'declined' | 'on-hold' | 'all'>('pending');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'direct' | 'referral' | 'search' | 'promotion'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'course' | 'priority' | 'responseTime'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [pageSize, setPageSize] = useState(50);

  const { data: courses = [] } = useInstructorCourses(instructorId);
  const { data: requestsData, isLoading, error, refetch } = useStudentRequests(instructorId);
  const requests = (requestsData as StudentRequest[]) || [];

  // Memoized filtering logic
  const filterFn = useCallback((request: StudentRequest) => {
    // Course filter
    if (selectedCourse !== 'all' && request.course.id !== selectedCourse) return false;
    
    // Tab filter
    if (activeTab !== 'all' && request.status !== activeTab) return false;
    
    // Priority filter
    if (priorityFilter !== 'all' && request.priority !== priorityFilter) return false;
    
    // Source filter
    if (sourceFilter !== 'all' && request.source !== sourceFilter) return false;
    
    // Search filter
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      return (
        request.student.name.toLowerCase().includes(term) ||
        request.student.email.toLowerCase().includes(term) ||
        request.course.title.toLowerCase().includes(term) ||
        (request.tags && request.tags.some(tag => tag.toLowerCase().includes(term))) ||
        (request.notes && request.notes.toLowerCase().includes(term))
      );
    }
    
    // Date range filter
    if (dateRange.from && dateRange.to) {
      const requestDate = new Date(request.requestDate);
      return requestDate >= dateRange.from && requestDate <= dateRange.to;
    }
    
    return true;
  }, [selectedCourse, activeTab, priorityFilter, sourceFilter, debouncedSearchTerm, dateRange]);

  // Memoized sorting
  const sortFn = useCallback((a: StudentRequest, b: StudentRequest) => {
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
  }, [sortBy, sortOrder]);

  // Use memoized filters
  const { items: filteredAndSortedRequests, isPending } = useMemoizedFilters(
    requests,
    filterFn,
    sortFn
  );

  // Virtual scrolling setup
  const virtualScrollOptions: VirtualScrollOptions = {
    itemHeight: 120,
    overscan: 5,
    containerHeight: 600,
  };

  const { containerRef, visibleItems, scrollState } = useAdvancedVirtualScroll(
    filteredAndSortedRequests,
    virtualScrollOptions,
    (index) => filteredAndSortedRequests[index]?.estimatedHeight || 120
  );

  // Memoized statistics
  const stats = useMemo(() => {
    const now = new Date();
    const weekAgo = subDays(now, 7);
    const monthAgo = subDays(now, 30);

    const pending = filteredAndSortedRequests.filter(r => r.status === 'pending').length;
    const approved = filteredAndSortedRequests.filter(r => r.status === 'approved').length;
    const declined = filteredAndSortedRequests.filter(r => r.status === 'declined').length;
    const onHold = filteredAndSortedRequests.filter(r => r.status === 'on-hold').length;
    const highPriority = filteredAndSortedRequests.filter(r => r.priority === 'high' || r.priority === 'urgent').length;
    const thisWeek = filteredAndSortedRequests.filter(r => new Date(r.requestDate) >= weekAgo).length;
    const thisMonth = filteredAndSortedRequests.filter(r => new Date(r.requestDate) >= monthAgo).length;

    return {
      total: filteredAndSortedRequests.length,
      pending,
      approved,
      declined,
      onHold,
      highPriority,
      thisWeek,
      thisMonth,
    };
  }, [filteredAndSortedRequests]);

  const handleSelectRequest = useCallback((requestId: string) => {
    setSelectedRequests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
  }, []);

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
      </div>

      {/* Statistics */}
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
              <Label>Search</Label>
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
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
                  <SelectValue placeholder="All Status" />
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
          </div>
        </CardContent>
      </Card>

      {/* Virtualized Request List */}
      <Card>
        <CardHeader>
          <CardTitle>Requests ({filteredAndSortedRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={containerRef}
            className="h-[600px] overflow-y-auto border rounded-md"
            style={{ position: 'relative' }}
          >
            <div style={{ height: scrollState.totalHeight, position: 'relative' }}>
              <div style={{ transform: `translateY(${scrollState.offsetY}px)` }}>
                {visibleItems.map((request) => (
                  <RequestCard
                    key={`${request.student.id}-${request.course.id}`}
                    request={request}
                    onSelect={handleSelectRequest}
                    isSelected={selectedRequests.has(`${request.student.id}-${request.course.id}`)}
                  />
                ))}
              </div>
            </div>
          </div>
          {isPending && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600">Filtering requests...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

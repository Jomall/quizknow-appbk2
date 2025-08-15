import { useMemo, useCallback } from 'react';
import { StudentRequest, RequestStatus, RequestPriority } from '@/types/student-request';
import { FilterState } from '@/types/filters';

interface UseRequestFiltersProps {
  requests: StudentRequest[];
  filters: FilterState;
  searchTerm: string;
}

interface UseRequestFiltersReturn {
  filteredRequests: StudentRequest[];
  activeFiltersCount: number;
  resetFilters: () => void;
}

export const useRequestFilters = ({
  requests,
  filters,
  searchTerm,
}: UseRequestFiltersProps): UseRequestFiltersReturn => {
  const filteredRequests = useMemo(() => {
    let filtered = [...requests];

    // Search filtering
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (request) =>
          request.studentName.toLowerCase().includes(searchLower) ||
          request.studentEmail.toLowerCase().includes(searchLower) ||
          request.courseTitle.toLowerCase().includes(searchLower) ||
          request.message.toLowerCase().includes(searchLower)
      );
    }

    // Status filtering
    if (filters.status.length > 0) {
      filtered = filtered.filter((request) => filters.status.includes(request.status));
    }

    // Priority filtering
    if (filters.priority.length > 0) {
      filtered = filtered.filter((request) => filters.priority.includes(request.priority));
    }

    // Date range filtering
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter((request) => {
        const requestDate = new Date(request.createdAt);
        const start = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
        const end = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

        if (start && requestDate < start) return false;
        if (end && requestDate > end) return false;
        return true;
      });
    }

    // Course filtering
    if (filters.courses.length > 0) {
      filtered = filtered.filter((request) => filters.courses.includes(request.courseId));
    }

    return filtered;
  }, [requests, filters, searchTerm]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.status.length > 0) count += filters.status.length;
    if (filters.priority.length > 0) count += filters.priority.length;
    if (filters.courses.length > 0) count += filters.courses.length;
    if (filters.dateRange.start || filters.dateRange.end) count += 1;
    return count;
  }, [filters]);

  const resetFilters = useCallback(() => {
    // This will be handled by the parent component
  }, []);

  return {
    filteredRequests,
    activeFiltersCount,
    resetFilters,
  };
};

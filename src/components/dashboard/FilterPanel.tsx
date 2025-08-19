'use client';

import { useState } from 'react';
import { Calendar, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface FilterPanelProps {
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
}

export interface FilterState {
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  userType: string;
  assignmentStatus: string;
  assignmentType: string;
}

export function FilterPanel({ onFilterChange, onReset }: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: {
      from: undefined,
      to: undefined,
    },
    userType: 'all',
    assignmentStatus: 'all',
    assignmentType: 'all',
  });

  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const defaultFilters: FilterState = {
      dateRange: { from: undefined, to: undefined },
      userType: 'all',
      assignmentStatus: 'all',
      assignmentType: 'all',
    };
    setFilters(defaultFilters);
    onReset();
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'dateRange') {
      return value.from || value.to;
    }
    return value !== 'all';
  }).length;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h3 className="font-semibold">Filters</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount} active
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="text-sm"
        >
          {isOpen ? 'Hide' : 'Show'} Filters
        </Button>
      </div>

      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Date Range</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {filters.dateRange.from ? (
                    filters.dateRange.to ? (
                      <>
                        {format(filters.dateRange.from, 'LLL dd, y')} -{' '}
                        {format(filters.dateRange.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(filters.dateRange.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={filters.dateRange.from}
                  selected={filters.dateRange}
                  onSelect={(range) => handleFilterChange('dateRange', range || { from: undefined, to: undefined })}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">User Type</label>
            <Select
              value={filters.userType}
              onValueChange={(value) => handleFilterChange('userType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="instructor">Instructors</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Assignment Status</label>
            <Select
              value={filters.assignmentStatus}
              onValueChange={(value) => handleFilterChange('assignmentStatus', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Assignment Type</label>
            <Select
              value={filters.assignmentType}
              onValueChange={(value) => handleFilterChange('assignmentType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
                <SelectItem value="assignment">Assignment</SelectItem>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="reading">Reading</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-full flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              <X className="h-4 w-4 mr-2" />
              Reset Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

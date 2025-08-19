import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';

export interface DashboardMetrics {
  totalStudents: number;
  totalAssignments: number;
  averageScore: number;
  completionRate: number;
  recentActivity: any[];
  assignmentStats: any[];
  scoreDistribution: any[];
}

export interface FilterOptions {
  dateRange?: { from: Date; to: Date };
  course?: string;
  assignmentType?: string;
  scoreRange?: { min: number; max: number };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Fetch dashboard metrics
async function fetchDashboardMetrics(filters?: FilterOptions): Promise<DashboardMetrics> {
  const params = new URLSearchParams();
  
  if (filters?.dateRange) {
    params.append('from', filters.dateRange.from.toISOString());
    params.append('to', filters.dateRange.to.toISOString());
  }
  if (filters?.course) params.append('course', filters.course);
  if (filters?.assignmentType) params.append('type', filters.assignmentType);
  if (filters?.scoreRange) {
    params.append('minScore', filters.scoreRange.min.toString());
    params.append('maxScore', filters.scoreRange.max.toString());
  }

  const response = await fetch(`${API_BASE_URL}/dashboard/metrics?${params}`);
  if (!response.ok) throw new Error('Failed to fetch metrics');
  return response.json();
}

// Update dashboard settings
async function updateDashboardSettings(settings: any) {
  const response = await fetch(`${API_BASE_URL}/dashboard/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!response.ok) throw new Error('Failed to update settings');
  return response.json();
}

// Custom hooks
export function useDashboardMetrics(filters?: FilterOptions) {
  return useQuery({
    queryKey: ['dashboard-metrics', filters],
    queryFn: () => fetchDashboardMetrics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchInterval: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
  });
}

export function useDashboardSettings() {
  return useQuery({
    queryKey: ['dashboard-settings'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/dashboard/settings`);
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    },
  });
}

export function useUpdateDashboardSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateDashboardSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-settings'] });
    },
  });
}

// Real-time updates hook
export function useRealTimeUpdates(enabled: boolean = true) {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['real-time-updates'],
    queryFn: async () => {
      // This will be implemented with WebSocket
      return { connected: false };
    },
    enabled,
    refetchInterval: false,
  });
}

// Export data hook
export function useExportData(format: 'csv' | 'pdf' | 'excel', filters?: FilterOptions) {
  return useMutation({
    mutationFn: async () => {
      const params = new URLSearchParams({ format });
      
      if (filters?.dateRange) {
        params.append('from', filters.dateRange.from.toISOString());
        params.append('to', filters.dateRange.to.toISOString());
      }
      
      const response = await fetch(`${API_BASE_URL}/dashboard/export?${params}`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-export-${new Date().toISOString()}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    },
  });
}

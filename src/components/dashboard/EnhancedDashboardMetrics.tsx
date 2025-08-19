'use client';

import { useState, useEffect, useCallback } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { User } from '@/lib/lms-integration';
import { FilterPanel } from './FilterPanel';
import { ExportModal } from './ExportModal';
import { RealTimeIndicator } from './RealTimeIndicator';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';
import { useDashboardData } from '@/hooks/useDashboardData';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface EnhancedDashboardMetricsProps {
  currentUser: User;
}

interface FilterOptions {
  dateRange: { start: Date; end: Date };
  assignmentTypes: string[];
  status: string[];
  searchTerm: string;
}

interface DashboardStats {
  totalStudents: number;
  totalInstructors: number;
  pendingRequests: number;
  activeAssignments: number;
  completedAssignments: number;
  connectionRate: number;
  weeklyActivity: number[];
  assignmentTypes: { type: string; count: number }[];
  completionTrend: { date: string; completed: number; assigned: number }[];
  lastUpdated: string;
}

export default function EnhancedDashboardMetrics({ currentUser }: EnhancedDashboardMetricsProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalInstructors: 0,
    pendingRequests: 0,
    activeAssignments: 0,
    completedAssignments: 0,
    connectionRate: 0,
    weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
    assignmentTypes: [],
    completionTrend: [],
    lastUpdated: new Date().toISOString(),
  });
  
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: {
      start: subDays(new Date(), 30),
      end: new Date()
    },
    assignmentTypes: [],
    status: [],
    searchTerm: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Use custom hooks for data management
  const { data: dashboardData, loading: dataLoading, error: dataError } = useDashboardData(filters, refreshKey);
  const { isConnected, lastUpdate } = useRealTimeUpdates();

  // Load dashboard metrics with real API
  const loadDashboardMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        startDate: filters.dateRange.start.toISOString(),
        endDate: filters.dateRange.end.toISOString(),
        ...(filters.assignmentTypes.length > 0 && { assignmentTypes: filters.assignmentTypes.join(',') }),
        ...(filters.status.length > 0 && { status: filters.status.join(',') }),
        ...(filters.searchTerm && { search: filters.searchTerm }),
      });

      const response = await fetch(`/api/dashboard/metrics?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading dashboard metrics:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadDashboardMetrics();
  }, [loadDashboardMetrics]);

  // Handle real-time updates
  useEffect(() => {
    if (dashboardData) {
      setStats(dashboardData);
    }
  }, [dashboardData]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleExport = async (format: 'pdf' | 'csv' | 'excel') => {
    try {
      const queryParams = new URLSearchParams({
        format,
        startDate: filters.dateRange.start.toISOString(),
        endDate: filters.dateRange.end.toISOString(),
      });

      const response = await fetch(`/api/dashboard/export?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-report-${format}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setShowExportModal(false);
    } catch (error) {
      console.error('Export error:', error);
      setError('Failed to export data');
    }
  };

  const StatCard = ({ title, value, subtitle, color, trend, isLoading }: {
    title: string;
    value: number | string;
    subtitle?: string;
    color: string;
    trend?: number;
    isLoading?: boolean;
  }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color} hover:shadow-lg transition-shadow`}>
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          {subtitle && <div className="h-3 bg-gray-200 rounded w-2/3"></div>}
        </div>
      ) : (
        <>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <p className={`text-xs mt-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last week
            </p>
          )}
        </>
      )}
    </div>
  );

  // Chart configurations
  const weeklyActivityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Activity',
        data: stats.weeklyActivity,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const assignmentTypesData = {
    labels: stats.assignmentTypes.map(t => t.type),
    datasets: [
      {
        data: stats.assignmentTypes.map(t => t.count),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const completionTrendData = {
    labels: stats.completionTrend.map(t => t.date),
    datasets: [
      {
        label: 'Completed',
        data: stats.completionTrend.map(t => t.completed),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Assigned',
        data: stats.completionTrend.map(t => t.assigned),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading || dataLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || dataError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Dashboard</h3>
          <p className="text-sm text-red-600">{error || dataError}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Analytics</h1>
          <p className="text-sm text-gray-600 mt-1">
            Real-time insights and metrics for your learning platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RealTimeIndicator isConnected={isConnected} lastUpdate={lastUpdate} />
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={() => setShowExportModal(false)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <FilterPanel
        onFilterChange={(newFilters: any) => setFilters(newFilters)}
        onReset={() => setFilters({
          dateRange: { start: subDays(new Date(), 30), end: new Date() },
          assignmentTypes: [],
          status: [],
          searchTerm: ''
        })}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          color="border-blue-500"
          isLoading={loading}
        />
        <StatCard
          title="Total Instructors"
          value={stats.totalInstructors}
          color="border-green-500"
          isLoading={loading}
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingRequests}
          color="border-yellow-500"
          isLoading={loading}
        />
        <StatCard
          title="Connection Rate"
          value={`${stats.connectionRate}%`}
          color="border-purple-500"
          isLoading={loading}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Weekly Activity</h3>
          <div className="h-64">
            <Line data={weeklyActivityData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Assignment Types</h3>
          <div className="h-64">
            <Doughnut data={assignmentTypesData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                },
              },
            }} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Completion Trends</h3>
          <div className="h-64">
            <Line data={completionTrendData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
      />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
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
import { format, subDays } from 'date-fns';
import { User } from '@/lib/lms-integration';

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

interface DashboardMetricsProps {
  currentUser: User;
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
}

export default function DashboardMetrics({ currentUser }: DashboardMetricsProps) {
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
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardMetrics();
  }, [currentUser]);

  const loadDashboardMetrics = async () => {
    try {
      // Mock data generation for demo
      const mockStats = {
        totalStudents: currentUser.role === 'instructor' ? Math.floor(Math.random() * 50) + 10 : 0,
        totalInstructors: currentUser.role === 'student' ? Math.floor(Math.random() * 5) + 1 : 0,
        pendingRequests: Math.floor(Math.random() * 10),
        activeAssignments: Math.floor(Math.random() * 20) + 5,
        completedAssignments: Math.floor(Math.random() * 30) + 10,
        connectionRate: Math.floor(Math.random() * 40) + 60,
        weeklyActivity: Array.from({ length: 7 }, () => Math.floor(Math.random() * 20) + 1),
        assignmentTypes: [
          { type: 'Quiz', count: Math.floor(Math.random() * 15) + 5 },
          { type: 'Assignment', count: Math.floor(Math.random() * 10) + 3 },
          { type: 'Project', count: Math.floor(Math.random() * 8) + 2 },
          { type: 'Reading', count: Math.floor(Math.random() * 12) + 4 },
        ],
        completionTrend: Array.from({ length: 30 }, (_, i) => ({
          date: format(subDays(new Date(), 29 - i), 'MMM dd'),
          completed: Math.floor(Math.random() * 10) + 1,
          assigned: Math.floor(Math.random() * 8) + 1,
        })),
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading dashboard metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, color, trend }: {
    title: string;
    value: number | string;
    subtitle?: string;
    color: string;
    trend?: number;
  }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color} hover:shadow-lg transition-shadow`}>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        {trend !== undefined && (
          <p className={`text-xs mt-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last week
          </p>
        )}
      </div>
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
            Export Report
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
            Refresh
          </button>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {currentUser.role === 'instructor' && (
          <>
            <StatCard
              title="Total Students"
              value={stats.totalStudents}
              color="border-blue-500"
              subtitle="Connected students"
              trend={12}
            />
            <StatCard
              title="Active Assignments"
              value={stats.activeAssignments}
              color="border-yellow-500"
              subtitle="Currently assigned"
              trend={-5}
            />
            <StatCard
              title="Completed"
              value={stats.completedAssignments}
              color="border-green-500"
              subtitle="Finished assignments"
              trend={8}
            />
            <StatCard
              title="Completion Rate"
              value={`${stats.connectionRate}%`}
              color="border-purple-500"
              subtitle="Assignment completion"
              trend={15}
            />
          </>
        )}
        
        {currentUser.role === 'student' && (
          <>
            <StatCard
              title="My Instructors"
              value={stats.totalInstructors}
              color="border-blue-500"
              subtitle="Connected instructors"
              trend={5}
            />
            <StatCard
              title="Active Assignments"
              value={stats.activeAssignments}
              color="border-yellow-500"
              subtitle="To complete"
              trend={-2}
            />
            <StatCard
              title="Completed"
              value={stats.completedAssignments}
              color="border-green-500"
              subtitle="Finished assignments"
              trend={10}
            />
            <StatCard
              title="Progress Rate"
              value={`${stats.connectionRate}%`}
              color="border-purple-500"
              subtitle="Assignment completion"
              trend={7}
            />
          </>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Weekly Activity</h3>
          <div className="h-64">
            <Line data={weeklyActivityData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Assignment Types</h3>
          <div className="h-64">
            <Doughnut data={assignmentTypesData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Completion Trend (30 days)</h3>
        <div className="h-64">
          <Line data={completionTrendData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}

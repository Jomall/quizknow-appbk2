'use client';

import { useState, useEffect } from 'react';
import { FilterPanel } from '@/components/dashboard/FilterPanel';
import { ExportModal } from '@/components/dashboard/ExportModal';
import { RealTimeIndicator } from '@/components/dashboard/RealTimeIndicator';
import { EnhancedDashboardMetrics } from '@/components/dashboard/EnhancedDashboardMetrics';
import { DashboardMetrics } from '@/components/DashboardMetrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';

interface DashboardData {
  totalUsers: number;
  totalAssignments: number;
  completionRate: number;
  averageScore: number;
  recentActivity: any[];
  topPerformers: any[];
}

export default function DashboardPage() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isRealTime, setIsRealTime] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalUsers: 1250,
    totalAssignments: 3420,
    completionRate: 78.5,
    averageScore: 85.2,
    recentActivity: [],
    topPerformers: []
  });
  const [filters, setFilters] = useState({
    dateRange: { from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() },
    userType: 'all',
    assignmentStatus: 'all',
    assignmentType: 'all'
  });

  const handleExport = (format: string) => {
    console.log(`Exporting data as ${format}`);
    // Implement actual export logic here
    setIsExportModalOpen(false);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    // Implement filter logic here
  };

  const refreshData = () => {
    // Simulate data refresh
    setDashboardData(prev => ({
      ...prev,
      totalUsers: Math.floor(Math.random() * 100) + 1200,
      totalAssignments: Math.floor(Math.random() * 200) + 3400,
      completionRate: Math.floor(Math.random() * 20) + 70,
      averageScore: Math.floor(Math.random() * 15) + 80
    }));
  };

  useEffect(() => {
    // Simulate real-time updates
    if (isRealTime) {
      const interval = setInterval(() => {
        refreshData();
      }, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isRealTime]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor your quiz performance and analytics</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <RealTimeIndicator isActive={isRealTime} onToggle={setIsRealTime} />
            <Button onClick={refreshData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setIsExportModalOpen(true)} size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
          </CardContent>
        </Card>

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Enhanced Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedDashboardMetrics data={dashboardData} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Basic Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <DashboardMetrics data={dashboardData} />
            </CardContent>
          </Card>
        </div>

        {/* Additional Dashboard Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>User John completed Quiz A</span>
                  <span className="text-sm text-gray-500">2 min ago</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>New assignment created</span>
                  <span className="text-sm text-gray-500">5 min ago</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>Score updated for Quiz B</span>
                  <span className="text-sm text-gray-500">10 min ago</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>Alice Johnson</span>
                  <span className="font-semibold">98%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>Bob Smith</span>
                  <span className="font-semibold">95%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span>Carol White</span>
                  <span className="font-semibold">92%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Modal */}
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          onExport={handleExport}
        />
      </div>
    </div>
  );
}

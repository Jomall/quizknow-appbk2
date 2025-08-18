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
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInstructorAnalytics } from '@/hooks/useInstructorAnalytics';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AnalyticsChartsProps {
  courseId?: string;
  dateRange?: string;
}

export function AnalyticsCharts({ courseId, dateRange = '7d' }: AnalyticsChartsProps) {
  const [selectedTab, setSelectedTab] = useState('performance');
  const [timeRange, setTimeRange] = useState('7d');
  const { analytics, loading } = useInstructorAnalytics(courseId, timeRange);

  const performanceData = {
    labels: analytics.dates || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Average Score',
        data: analytics.scores || [75, 82, 78, 85, 90, 88, 92],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Completion Rate',
        data: analytics.completionRates || [65, 70, 68, 75, 80, 78, 85],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const quizPerformanceData = {
    labels: analytics.quizTitles || ['Quiz 1', 'Quiz 2', 'Quiz 3', 'Quiz 4', 'Quiz 5'],
    datasets: [
      {
        label: 'Average Score',
        data: analytics.quizScores || [78, 85, 72, 90, 88],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Participation Rate',
        data: analytics.participationRates || [85, 90, 75, 95, 88],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
      },
    ],
  };

  const studentEngagementData = {
    labels: ['Highly Engaged', 'Moderately Engaged', 'Low Engagement', 'Not Engaged'],
    datasets: [
      {
        data: analytics.engagementLevels || [45, 30, 15, 10],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 2,
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
        max: 100,
      },
    },
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="h-64 animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <Line data={performanceData} options={chartOptions} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quiz Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <Bar data={quizPerformanceData} options={chartOptions} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Student Engagement Levels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <Doughnut data={studentEngagementData} options={chartOptions} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Active Students</span>
                    <span className="font-bold">{analytics.activeStudents || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quiz Attempts</span>
                    <span className="font-bold">{analytics.quizAttempts || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Content Views</span>
                    <span className="font-bold">{analytics.contentViews || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Session Time</span>
                    <span className="font-bold">{analytics.avgSessionTime || 0} min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Content Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Most Viewed</span>
                    <span className="font-bold">{analytics.mostViewedContent || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Highest Completion</span>
                    <span className="font-bold">{analytics.highestCompletionContent || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Content</span>
                    <span className="font-bold">{analytics.totalContent || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <Doughnut
                    data={{
                      labels: ['Videos', 'Documents', 'Quizzes', 'Other'],
                      datasets: [
                        {
                          data: analytics.contentTypeDistribution || [40, 30, 20, 10],
                          backgroundColor: [
                            'rgba(59, 130, 246, 0.8)',
                            'rgba(16, 185, 129, 0.8)',
                            'rgba(245, 158, 11, 0.8)',
                            'rgba(239, 68, 68, 0.8)',
                          ],
                        },
                      ],
                    }}
                    options={chartOptions}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement by Content Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <Bar
                    data={{
                      labels: ['Videos', 'Documents', 'Quizzes'],
                      datasets: [
                        {
                          label: 'Average Engagement',
                          data: analytics.contentEngagement || [85, 70, 90],
                          backgroundColor: 'rgba(59, 130, 246, 0.8)',
                        },
                      ],
                    }}
                    options={chartOptions}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.topPerformers?.slice(0, 5).map((student: any, index: number) => (
                    <div key={student.id} className="flex justify-between items-center">
                      <span>{index + 1}. {student.name}</span>
                      <span className="font-bold">{student.averageScore}%</span>
                    </div>
                  )) || <p>No data available</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Students Needing Attention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.studentsNeedingAttention?.slice(0, 5).map((student: any, index: number) => (
                    <div key={student.id} className="flex justify-between items-center">
                      <span>{student.name}</span>
                      <span className="text-red-600 font-bold">{student.averageScore}%</span>
                    </div>
                  )) || <p>No data available</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

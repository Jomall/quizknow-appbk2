'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  Star,
  Target,
  Activity,
  Eye,
  Award,
  UserPlus,
  MessageSquare,
  Zap
} from 'lucide-react';
import { useInstructorAnalytics } from '@/hooks/useInstructorAnalytics';
import { useInstructorConnections } from '@/hooks/useInstructorConnections';
import { cn } from '@/lib/utils';

interface EnhancedAnalyticsSummaryProps {
  courseId?: string;
}

export function EnhancedAnalyticsSummary({ courseId }: EnhancedAnalyticsSummaryProps) {
  const { analytics, loading } = useInstructorAnalytics(courseId);
  const { connections, pendingRequests } = useInstructorConnections(courseId);

  const enhancedSummaryCards = [
    // Basic Metrics
    {
      title: 'Total Courses',
      value: analytics.totalCourses,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: '+12%',
      trendColor: 'text-green-600',
    },
    {
      title: 'Total Students',
      value: analytics.totalStudents,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: '+8%',
      trendColor: 'text-green-600',
    },
    {
      title: 'Active Connections',
      value: connections.length,
      icon: UserPlus,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: `+${pendingRequests.length} pending`,
      trendColor: 'text-orange-600',
    },
    
    // Performance Metrics
    {
      title: 'Average Quiz Score',
      value: `${analytics.averageQuizScore}%`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      trend: '+5.2%',
      trendColor: 'text-green-600',
    },
    {
      title: 'Active Students',
      value: analytics.activeStudents,
      icon: Activity,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      trend: `${Math.round((analytics.activeStudents / analytics.totalStudents) * 100)}%`,
      trendColor: 'text-blue-600',
    },
    {
      title: 'Quiz Attempts',
      value: analytics.quizAttempts,
      icon: Target,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
      trend: '+23%',
      trendColor: 'text-green-600',
    },
    
    // Engagement Metrics
    {
      title: 'Content Views',
      value: analytics.contentViews,
      icon: Eye,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
      trend: '+15%',
      trendColor: 'text-green-600',
    },
    {
      title: 'Avg Session Time',
      value: `${analytics.avgSessionTime}m`,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      trend: '+3m',
      trendColor: 'text-green-600',
    },
    {
      title: 'Total Content',
      value: analytics.totalContent,
      icon: BookOpen,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
      trend: '+7 new',
      trendColor: 'text-green-600',
    },
  ];

  const topPerformers = analytics.topPerformers.slice(0, 3);
  const studentsNeedingAttention = analytics.studentsNeedingAttention.slice(0, 3);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(9)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </CardTitle>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {enhancedSummaryCards.map((card) => (
          <Card key={card.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`p-2 rounded-full ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={card.trendColor}>{card.trend}</span> from last week
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Performers Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topPerformers.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{student.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Last active: {new Date(student.lastActivity).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{student.averageScore}%</p>
                  <p className="text-xs text-muted-foreground">{student.completionRate}% completion</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Students Needing Attention */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Students Needing Attention
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {studentsNeedingAttention.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{student.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Last submission: {new Date(student.lastSubmission).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="destructive" className="text-xs">
                    {student.averageScore}%
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {student.daysSinceLastActivity} days inactive
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Connection Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              Connection Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {pendingRequests.length} pending connection requests
              </p>
              <div className="flex gap-2">
                <Badge variant="secondary" className="cursor-pointer">
                  View All
                </Badge>
                <Badge variant="outline" className="cursor-pointer">
                  Quick Accept
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-green-500" />
            Real-time Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{analytics.activeStudents}</p>
              <p className="text-xs text-muted-foreground">Active Now</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{analytics.quizAttempts}</p>
              <p className="text-xs text-muted-foreground">Quiz Attempts Today</p>
            </div>
          </div>
          {analytics.isLive && (
            <div className="mt-3 flex items-center justify-center">
              <Badge variant="default" className="bg-green-500">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
                  Live
                </div>
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

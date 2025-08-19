import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const course = searchParams.get('course');
    const type = searchParams.get('type');
    const minScore = searchParams.get('minScore');
    const maxScore = searchParams.get('maxScore');

    // Mock data - in real implementation, fetch from database
    const mockMetrics = {
      totalStudents: 1250,
      totalAssignments: 3420,
      averageScore: 84.5,
      completionRate: 92.3,
      recentActivity: [
        {
          id: 1,
          studentName: 'John Doe',
          action: 'completed',
          assignment: 'Quiz 1 - Algebra Basics',
          timestamp: new Date().toISOString(),
          score: 85
        },
        {
          id: 2,
          studentName: 'Jane Smith',
          action: 'submitted',
          assignment: 'Lab Report - Physics',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          score: null
        },
        {
          id: 3,
          studentName: 'Mike Johnson',
          action: 'graded',
          assignment: 'Essay - Literature',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          score: 92
        }
      ],
      assignmentStats: [
        {
          type: 'quiz',
          count: 45,
          averageScore: 82.5,
          completionRate: 95.2
        },
        {
          type: 'assignment',
          count: 28,
          averageScore: 87.3,
          completionRate: 89.7
        },
        {
          type: 'exam',
          count: 12,
          averageScore: 79.8,
          completionRate: 94.1
        }
      ],
      scoreDistribution: [
        { range: '90-100', count: 450, percentage: 36 },
        { range: '80-89', count: 380, percentage: 30.4 },
        { range: '70-79', count: 275, percentage: 22 },
        { range: '60-69', count: 125, percentage: 10 },
        { range: '0-59', count: 20, percentage: 1.6 }
      ]
    };

    // Apply filtering based on parameters
    let filteredMetrics = mockMetrics;
    
    if (from && to) {
      // Filter by date range
      const fromDate = new Date(from);
      const toDate = new Date(to);
      filteredMetrics.recentActivity = filteredMetrics.recentActivity.filter(
        activity => {
          const activityDate = new Date(activity.timestamp);
          return activityDate >= fromDate && activityDate <= toDate;
        }
      );
    }

    if (course) {
      // Filter by course
      filteredMetrics.recentActivity = filteredMetrics.recentActivity.filter(
        activity => activity.assignment.toLowerCase().includes(course.toLowerCase())
      );
    }

    if (type) {
      // Filter by assignment type
      filteredMetrics.assignmentStats = filteredMetrics.assignmentStats.filter(
        stat => stat.type === type
      );
    }

    if (minScore && maxScore) {
      // Filter by score range
      const min = parseInt(minScore);
      const max = parseInt(maxScore);
      filteredMetrics.scoreDistribution = filteredMetrics.scoreDistribution.filter(
        dist => {
          const range = dist.range.split('-').map(Number);
          return range[0] >= min && range[1] <= max;
        }
      );
    }

    return NextResponse.json(filteredMetrics);
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    );
  }
}

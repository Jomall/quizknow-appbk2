import { NextRequest, NextResponse } from 'next/server';
import { DashboardMetrics } from '@/types/dashboard';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const course = searchParams.get('course');
    const assignmentType = searchParams.get('type');
    const minScore = searchParams.get('minScore');
    const maxScore = searchParams.get('maxScore');

    // Mock dashboard metrics data matching DashboardMetrics interface
    const mockMetrics: DashboardMetrics = {
      totalStudents: 1247,
      totalAssignments: 1048,
      averageScore: 78.5,
      completionRate: 85.3,
      recentActivity: [
        {
          id: 1,
          studentName: "Alice Johnson",
          action: "completed",
          assignment: "Chapter 3 Quiz",
          timestamp: "2024-01-15T14:30:00Z",
          score: 92,
          course: "Mathematics 101"
        },
        {
          id: 2,
          studentName: "Bob Smith",
          action: "submitted",
          assignment: "Lab Report 2",
          timestamp: "2024-01-15T13:45:00Z",
          score: null,
          course: "Physics 201"
        },
        {
          id: 3,
          studentName: "Carol Williams",
          action: "graded",
          assignment: "Essay Assignment",
          timestamp: "2024-01-15T12:15:00Z",
          score: 87,
          course: "English 101"
        },
        {
          id: 4,
          studentName: "David Brown",
          action: "started",
          assignment: "Midterm Exam",
          timestamp: "2024-01-15T11:00:00Z",
          score: null,
          course: "History 150"
        },
        {
          id: 5,
          studentName: "Eva Davis",
          action: "completed",
          assignment: "Problem Set 4",
          timestamp: "2024-01-15T10:30:00Z",
          score: 95,
          course: "Chemistry 101"
        }
      ],
      assignmentStats: [
        {
          type: "quiz",
          count: 342,
          averageScore: 82.4,
          completionRate: 89.2
        },
        {
          type: "assignment",
          count: 298,
          averageScore: 76.8,
          completionRate: 84.1
        },
        {
          type: "exam",
          count: 156,
          averageScore: 74.2,
          completionRate: 78.9
        },
        {
          type: "lab",
          count: 252,
          averageScore: 81.5,
          completionRate: 91.3
        }
      ],
      scoreDistribution: [
        {
          range: "90-100",
          count: 287,
          percentage: 27.4
        },
        {
          range: "80-89",
          count: 356,
          percentage: 34.0
        },
        {
          range: "70-79",
          count: 234,
          percentage: 22.3
        },
        {
          range: "60-69",
          count: 123,
          percentage: 11.7
        },
        {
          range: "0-59",
          count: 48,
          percentage: 4.6
        }
      ]
    };

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json(mockMetrics);
  } catch (error) {
    console.error('Error in dashboard metrics API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock dashboard settings
    const mockSettings = {
      refreshInterval: 30000,
      defaultDateRange: {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString()
      },
      visibleMetrics: [
        'totalStudents',
        'totalAssignments',
        'averageScore',
        'completionRate',
        'recentActivity',
        'assignmentStats',
        'scoreDistribution'
      ],
      chartPreferences: {
        showScoreDistribution: true,
        showAssignmentStats: true,
        showRecentActivity: true
      },
      exportSettings: {
        defaultFormat: 'csv',
        includeStudentDetails: true,
        includeAssignmentDetails: true
      },
      notifications: {
        enabled: true,
        threshold: 80,
        email: 'instructor@example.com'
      }
    };

    return NextResponse.json(mockSettings);
  } catch (error) {
    console.error('Dashboard settings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json();
    
    // In real implementation, save to database
    console.log('Updating dashboard settings:', settings);
    
    return NextResponse.json({
      success: true,
      message: 'Dashboard settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Dashboard settings update error:', error);
    return NextResponse.json(
      { error: 'Failed to update dashboard settings' },
      { status: 500 }
    );
  }
}

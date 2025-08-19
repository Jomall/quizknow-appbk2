import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock dashboard settings data
    const mockSettings = {
      display: {
        showRealTimeUpdates: true,
        refreshInterval: 30,
        showNotifications: true,
        theme: 'light',
        dateFormat: 'MM/dd/yyyy',
        timeFormat: '24h'
      },
      notifications: {
        emailAlerts: true,
        pushNotifications: false,
        alertTypes: ['newAssignments', 'scoreUpdates', 'deadlineReminders'],
        quietHours: {
          enabled: true,
          start: '22:00',
          end: '07:00'
        }
      },
      export: {
        defaultFormat: 'csv',
        includeMetadata: true,
        autoExport: {
          enabled: false,
          frequency: 'weekly',
          email: ''
        }
      },
      filters: {
        defaultDateRange: {
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
          to: new Date().toISOString()
        },
        defaultCourses: [],
        defaultAssignmentTypes: [],
        defaultScoreRange: {
          min: 0,
          max: 100
        }
      },
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(mockSettings);
  } catch (error) {
    console.error('Error in dashboard settings API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // In a real implementation, this would save the settings to a database
    console.log('Received dashboard settings update:', body);
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Dashboard settings updated successfully',
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating dashboard settings:', error);
    return NextResponse.json(
      { error: 'Failed to update dashboard settings' },
      { status: 500 }
    );
  }
}

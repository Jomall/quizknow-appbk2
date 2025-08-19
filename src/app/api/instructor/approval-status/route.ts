import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get email from query params for now (in real app, use session)
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || 'instructor@lms.com';

    // Mock approval status - in real app, check database
    const mockApprovalStatus = {
      status: 'pending', // 'pending', 'approved', 'rejected'
      requestedAt: new Date(Date.now() - 86400000).toISOString(),
      estimatedApprovalTime: '24-48 hours',
      adminNotes: 'Under review by academic team'
    };

    // Simulate different statuses for testing
    if (email === 'approved@lms.com') {
      mockApprovalStatus.status = 'approved';
    } else if (email === 'rejected@lms.com') {
      mockApprovalStatus.status = 'rejected';
    }

    return NextResponse.json(mockApprovalStatus);
  } catch (error) {
    console.error('Error checking approval status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

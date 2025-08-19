import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // In real app, get user from session and send email to admin
    const body = await request.json();
    const { email } = body;

    // Mock email sending - in real app, use email service
    console.log(`Resending approval request for: ${email || 'instructor@lms.com'}`);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({ 
      success: true, 
      message: 'Approval request resent successfully' 
    });
  } catch (error) {
    console.error('Error resending approval request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

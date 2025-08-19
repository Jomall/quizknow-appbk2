import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'csv';
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const course = searchParams.get('course');
    const assignmentType = searchParams.get('type');
    const minScore = searchParams.get('minScore');
    const maxScore = searchParams.get('maxScore');

    // Mock export data based on format
    let content: string;
    let contentType: string;
    let filename: string;

    const mockData = [
      { student: 'John Doe', course: 'Mathematics', assignment: 'Quiz 1', score: 85, date: '2024-01-15' },
      { student: 'Jane Smith', course: 'Science', assignment: 'Lab Report', score: 92, date: '2024-01-14' },
      { student: 'Bob Johnson', course: 'History', assignment: 'Essay', score: 78, date: '2024-01-13' },
      { student: 'Alice Brown', course: 'English', assignment: 'Reading Quiz', score: 95, date: '2024-01-12' },
      { student: 'Charlie Wilson', course: 'Physics', assignment: 'Problem Set', score: 88, date: '2024-01-11' }
    ];

    switch (format) {
      case 'csv':
        content = 'Student,Course,Assignment,Score,Date\n' + 
          mockData.map(row => `${row.student},${row.course},${row.assignment},${row.score},${row.date}`).join('\n');
        contentType = 'text/csv';
        filename = 'dashboard-export.csv';
        break;
      
      case 'excel':
        // For Excel, we'll create a simple CSV that Excel can open
        content = 'Student\tCourse\tAssignment\tScore\tDate\n' + 
          mockData.map(row => `${row.student}\t${row.course}\t${row.assignment}\t${row.score}\t${row.date}`).join('\n');
        contentType = 'application/vnd.ms-excel';
        filename = 'dashboard-export.xls';
        break;
      
      case 'pdf':
        // For PDF, create a simple text format
        content = mockData.map(row => 
          `Student: ${row.student}\nCourse: ${row.course}\nAssignment: ${row.assignment}\nScore: ${row.score}\nDate: ${row.date}\n---`
        ).join('\n');
        contentType = 'application/pdf';
        filename = 'dashboard-export.pdf';
        break;
      
      default:
        return NextResponse.json(
          { error: 'Unsupported format' },
          { status: 400 }
        );
    }

    // Create response with appropriate headers
    const response = new NextResponse(content);
    response.headers.set('Content-Type', contentType);
    response.headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    
    return response;
  } catch (error) {
    console.error('Error in dashboard export API:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

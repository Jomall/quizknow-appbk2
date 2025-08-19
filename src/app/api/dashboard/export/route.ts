import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'json2csv';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'csv';
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    
    // Mock data - in real implementation, fetch from database
    const mockData = [
      {
        studentName: 'John Doe',
        course: 'Mathematics 101',
        assignment: 'Quiz 1',
        score: 85,
        completionDate: '2024-01-15',
        timeSpent: '45 minutes',
        attempts: 2
      },
      {
        studentName: 'Jane Smith',
        course: 'Physics 201',
        assignment: 'Lab Report',
        score: 92,
        completionDate: '2024-01-14',
        timeSpent: '2 hours',
        attempts: 1
      },
      {
        studentName: 'Mike Johnson',
        course: 'Chemistry 101',
        assignment: 'Midterm Exam',
        score: 78,
        completionDate: '2024-01-13',
        timeSpent: '1.5 hours',
        attempts: 1
      }
    ];

    // Apply date filtering if provided
    let filteredData = mockData;
    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      filteredData = mockData.filter(item => {
        const itemDate = new Date(item.completionDate);
        return itemDate >= fromDate && itemDate <= toDate;
      });
    }

    switch (format.toLowerCase()) {
      case 'csv':
        const csv = parse(filteredData);
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="dashboard-export-${new Date().toISOString()}.csv"`,
          },
        });

      case 'json':
        return NextResponse.json(filteredData, {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="dashboard-export-${new Date().toISOString()}.json"`,
          },
        });

      case 'pdf':
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text('Dashboard Export Report', 20, 20);
        
        doc.setFontSize(12);
        let yPosition = 40;
        
        filteredData.forEach((item, index) => {
          doc.text(`${index + 1}. ${item.studentName} - ${item.course}`, 20, yPosition);
          doc.text(`   Assignment: ${item.assignment}`, 20, yPosition + 10);
          doc.text(`   Score: ${item.score}/100`, 20, yPosition + 20);
          doc.text(`   Date: ${item.completionDate}`, 20, yPosition + 30);
          doc.text(`   Time Spent: ${item.timeSpent}`, 20, yPosition + 40);
          yPosition += 60;
          
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
        });

        const pdfBuffer = doc.output('arraybuffer');
        return new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="dashboard-export-${new Date().toISOString()}.pdf"`,
          },
        });

      case 'excel':
      case 'xlsx':
        const ws = XLSX.utils.json_to_sheet(filteredData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Dashboard Data');
        
        const excelBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
        return new NextResponse(excelBuffer, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="dashboard-export-${new Date().toISOString()}.xlsx"`,
          },
        });

      default:
        return NextResponse.json(
          { error: 'Unsupported format. Use csv, json, pdf, or excel' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

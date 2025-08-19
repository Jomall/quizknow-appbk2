'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, Mail, User } from 'lucide-react';
import { format } from 'date-fns';

interface InstructorApplication {
  id: string;
  email: string;
  name: string;
  department: string;
  qualifications: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
}

export default function InstructorApprovalsPage() {
  const [applications, setApplications] = useState<InstructorApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - in real app, fetch from database
    const mockApplications: InstructorApplication[] = [
      {
        id: '1',
        email: 'instructor@lms.com',
        name: 'John Doe',
        department: 'Computer Science',
        qualifications: 'PhD in Computer Science, 5 years teaching experience',
        requestedAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'pending'
      },
      {
        id: '2',
        email: 'jane.smith@university.edu',
        name: 'Jane Smith',
        department: 'Mathematics',
        qualifications: 'MSc Mathematics, 3 years teaching experience',
        requestedAt: new Date(Date.now() - 172800000).toISOString(),
        status: 'pending'
      }
    ];

    setTimeout(() => {
      setApplications(mockApplications);
      setLoading(false);
    }, 1000);
  }, []);

  const handleApprove = async (id: string) => {
    // In real app, update database and send email
    console.log(`Approving instructor: ${id}`);
    
    // Update local state
    setApplications(prev => 
      prev.map(app => 
        app.id === id ? { ...app, status: 'approved' } : app
      )
    );
    
    // Show success message
    alert('Instructor approved successfully!');
  };

  const handleReject = async (id: string) => {
    // In real app, update database and send email
    console.log(`Rejecting instructor: ${id}`);
    
    // Update local state
    setApplications(prev => 
      prev.map(app => 
        app.id === id ? { ...app, status: 'rejected' } : app
      )
    );
    
    // Show success message
    alert('Instructor rejected successfully!');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-center mt-2">Loading applications...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Instructor Account Approvals</CardTitle>
            <CardDescription>
              Review and approve pending instructor account applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No pending instructor applications at this time.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <Card key={application.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-gray-500" />
                          <h3 className="font-semibold">{application.name}</h3>
                          {getStatusBadge(application.status)}
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><Mail className="inline h-4 w-4 mr-1" />{application.email}</p>
                          <p><strong>Department:</strong> {application.department}</p>
                          <p><strong>Requested:</strong> {format(new Date(application.requestedAt), 'MMM dd, yyyy HH:mm')}</p>
                          <p><strong>Qualifications:</strong> {application.qualifications}</p>
                        </div>
                      </div>
                      
                      {application.status === 'pending' && (
                        <div className="flex gap-2 ml-4">
                          <Button 
                            onClick={() => handleApprove(application.id)} 
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            onClick={() => handleReject(application.id)} 
                            size="sm"
                            variant="destructive"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

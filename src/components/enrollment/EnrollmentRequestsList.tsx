import React from 'react';
import { useEnrollmentManagement } from '@/hooks/useEnrollmentManagement';
import { EnrollmentStatusBadge } from './EnrollmentStatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

interface EnrollmentRequestsListProps {
  courseId: string;
  instructorId: string;
}

export const EnrollmentRequestsList: React.FC<EnrollmentRequestsListProps> = ({
  courseId,
  instructorId,
}) => {
  const { getPendingRequests, approveEnrollment, declineEnrollment } = useEnrollmentManagement();
  
  const pendingRequests = getPendingRequests(instructorId).filter(
    request => request.courseId === courseId
  );

  if (pendingRequests.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">No pending enrollment requests</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrollment Requests ({pendingRequests.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingRequests.map((request) => (
            <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${request.studentName}`} />
                  <AvatarFallback>{request.studentName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{request.studentName}</h4>
                  <p className="text-sm text-gray-500">{request.studentEmail}</p>
                  <p className="text-xs text-gray-400">
                    Requested on {format(new Date(request.createdAt), 'MMM dd, yyyy')}
                  </p>
                  {request.message && (
                    <p className="text-sm text-gray-600 mt-1">{request.message}</p>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => approveEnrollment(request.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => declineEnrollment(request.id)}
                  className="border-red-600 text-red-600 hover:bg-red-50"
                >
                  Decline
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

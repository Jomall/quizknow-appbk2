import React, { useState } from 'react';
import { useEnrollmentManagement } from '@/hooks/useEnrollmentManagement';
import { useAuth } from '@/hooks/useAuth';
import { EnrollmentStatusBadge } from './EnrollmentStatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Users, CheckCircle, XCircle, Clock } from 'lucide-react';

export const EnrollmentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { enrollmentRequests, getPendingRequests } = useEnrollmentManagement();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user || user.role !== 'instructor') {
    return <div>Access denied. Only instructors can view this dashboard.</div>;
  }

  const instructorRequests = enrollmentRequests.filter(r => r.instructorId === user.id);
  const pendingRequests = getPendingRequests(user.id);

  const stats = {
    total: instructorRequests.length,
    pending: pendingRequests.length,
    approved: instructorRequests.filter(r => r.status === 'approved').length,
    declined: instructorRequests.filter(r => r.status === 'declined').length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Declined</p>
                <p className="text-2xl font-bold">{stats.declined}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="all">All Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {instructorRequests.slice(0, 5).map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{request.studentName}</p>
                      <p className="text-sm text-gray-500">{request.courseTitle}</p>
                    </div>
                    <EnrollmentStatusBadge status={request.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.map((request) => (
            <Card key={request.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback>{request.studentName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{request.studentName}</h4>
                      <p className="text-sm text-gray-500">{request.studentEmail}</p>
                      <p className="text-sm text-gray-600">{request.courseTitle}</p>
                      {request.message && (
                        <p className="text-sm text-gray-500 mt-1">{request.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Badge variant="outline">{format(new Date(request.createdAt), 'MMM dd')}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Enrollment Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {instructorRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{request.studentName}</p>
                      <p className="text-sm text-gray-500">{request.courseTitle}</p>
                      <p className="text-xs text-gray-400">
                        {format(new Date(request.createdAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <EnrollmentStatusBadge status={request.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

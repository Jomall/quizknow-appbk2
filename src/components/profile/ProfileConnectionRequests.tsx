'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, InstructorRequest } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserPlus, 
  Check, 
  X, 
  Clock, 
  Send,
  AlertCircle
} from 'lucide-react';
import { authSync } from '@/lib/data/auth-sync';

interface ProfileConnectionRequestsProps {
  user: User;
}

export default function ProfileConnectionRequests({ user }: ProfileConnectionRequestsProps) {
  const [incomingRequests, setIncomingRequests] = useState<InstructorRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<InstructorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadConnectionRequests();
    
    // Subscribe to auth changes to refresh requests
    const unsubscribe = authSync.subscribe(() => {
      loadConnectionRequests();
    });

    return () => {
      unsubscribe();
    };
  }, [user.id]);

  const loadConnectionRequests = async () => {
    try {
      // Simulate loading connection requests from API
      // In real implementation, this would fetch from your backend
      const mockIncomingRequests: InstructorRequest[] = user.role === 'instructor' 
        ? [
            {
              id: 'req1',
              studentId: 'student1',
              studentName: 'Alice Johnson',
              message: 'I would like to connect with you for your advanced mathematics course',
              status: 'pending',
              createdAt: new Date('2024-01-15')
            },
            {
              id: 'req2',
              studentId: 'student2',
              studentName: 'Bob Smith',
              message: 'Interested in learning from your programming expertise',
              status: 'pending',
              createdAt: new Date('2024-01-14')
            }
          ]
        : [];

      const mockOutgoingRequests: InstructorRequest[] = user.role === 'student'
        ? [
            {
              id: 'req3',
              studentId: user.id,
              studentName: user.name,
              message: 'Request to connect for learning',
              status: 'pending',
              createdAt: new Date('2024-01-13')
            }
          ]
        : [];

      setIncomingRequests(mockIncomingRequests);
      setOutgoingRequests(mockOutgoingRequests);
      setLoading(false);
    } catch (error) {
      console.error('Error loading connection requests:', error);
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      // In real implementation, this would call your API
      setIncomingRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'accepted' }
            : req
        )
      );
      
      // Refresh user data to update connections
      const updatedUser = { ...user };
      if (user.role === 'instructor') {
        updatedUser.connectedStudents = [...(user.connectedStudents || []), requestId];
      } else {
        updatedUser.connectedInstructors = [...(user.connectedInstructors || []), requestId];
      }
      
      authSync.setUser(updatedUser);
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      // In real implementation, this would call your API
      setIncomingRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'declined' }
            : req
        )
      );
    } catch (error) {
      console.error('Error declining request:', error);
    }
  };

  const handleSendRequest = async (targetUserId: string) => {
    try {
      // In real implementation, this would call your API
      const newRequest: InstructorRequest = {
        id: `req_${Date.now()}`,
        studentId: user.id,
        studentName: user.name,
        message: 'Request to connect for learning',
        status: 'pending',
        createdAt: new Date()
      };
      
      setOutgoingRequests(prev => [...prev, newRequest]);
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'accepted':
        return 'default';
      case 'declined':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'accepted':
        return <Check className="h-4 w-4" />;
      case 'declined':
        return <X className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Incoming Requests (for instructors) */}
      {user.role === 'instructor' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5" />
              <span>Incoming Connection Requests</span>
              {incomingRequests.filter(r => r.status === 'pending').length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {incomingRequests.filter(r => r.status === 'pending').length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {incomingRequests.length > 0 ? (
              <div className="space-y-4">
                {incomingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="text-sm">
                          {getInitials(request.studentName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{request.studentName}</h4>
                        <p className="text-sm text-gray-600">{request.message}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge 
                            variant={getStatusBadgeVariant(request.status)}
                            className="flex items-center space-x-1"
                          >
                            {getStatusIcon(request.status)}
                            <span className="capitalize">{request.status}</span>
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {request.createdAt.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {request.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleAcceptRequest(request.id)}
                          className="flex items-center space-x-1"
                        >
                          <Check className="h-4 w-4" />
                          <span>Accept</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeclineRequest(request.id)}
                          className="flex items-center space-x-1"
                        >
                          <X className="h-4 w-4" />
                          <span>Decline</span>
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  No incoming connection requests at the moment.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Outgoing Requests (for students) */}
      {user.role === 'student' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="h-5 w-5" />
              <span>Your Connection Requests</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {outgoingRequests.length > 0 ? (
              <div className="space-y-4">
                {outgoingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div>
                        <h4 className="font-medium">Request to Instructor</h4>
                        <p className="text-sm text-gray-600">{request.message}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge 
                            variant={getStatusBadgeVariant(request.status)}
                            className="flex items-center space-x-1"
                          >
                            {getStatusIcon(request.status)}
                            <span className="capitalize">{request.status}</span>
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {request.createdAt.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {request.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setOutgoingRequests(prev => prev.filter(r => r.id !== request.id))}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Withdraw
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  You haven't sent any connection requests yet.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/connections')}
                  className="mt-4"
                >
                  Find Instructors
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/connections')}
              className="flex items-center justify-center space-x-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>Find New Connections</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/profile')}
              className="flex items-center justify-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>View All Connections</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

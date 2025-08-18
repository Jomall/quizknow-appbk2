'use client';

import { User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ProfileConnectionsProps {
  user: User;
}

export default function ProfileConnections({ user }: ProfileConnectionsProps) {
  const router = useRouter();

  const getConnectionsTitle = () => {
    if (user.role === 'student') {
      return 'Connected Instructors';
    }
    return 'Connected Students';
  };

  const connections = user.role === 'student' 
    ? user.connectedInstructors || [] 
    : user.connectedStudents || [];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{getConnectionsTitle()}</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/connections')}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Find New Connections
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {connections.length > 0 ? (
          <div className="space-y-4">
            {connections.slice(0, 4).map((connection) => (
              <div
                key={connection.id}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={connection.avatar || ''} alt={connection.name} />
                  <AvatarFallback className="text-sm">
                    {getInitials(connection.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{connection.name}</h4>
                  <p className="text-sm text-gray-600">{connection.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/profile/${connection.id}`)}
                >
                  View Profile
                </Button>
              </div>
            ))}
            {connections.length > 4 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => router.push('/connections')}
              >
                View all {connections.length} connections
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {user.role === 'student' 
                ? 'No instructors connected yet. Start building your learning network!'
                : 'No students connected yet. Start building your teaching network!'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

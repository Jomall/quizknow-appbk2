'use client';

import { User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Award, CheckCircle, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ProfileStatsProps {
  user: User;
}

export default function ProfileStats({ user }: ProfileStatsProps) {
  const router = useRouter();
  const stats = [
    {
      title: 'Enrolled Courses',
      value: user.enrolledCourses?.length || 0,
      icon: BookOpen,
      color: 'text-blue-600',
    },
    {
      title: 'Created Courses',
      value: user.createdCourses?.length || 0,
      icon: Award,
      color: 'text-green-600',
    },
    {
      title: 'Connected Instructors',
      value: user.connectedInstructors?.length || 0,
      icon: Users,
      color: 'text-purple-600',
    },
    {
      title: 'Connected Students',
      value: user.connectedStudents?.length || 0,
      icon: Users,
      color: 'text-orange-600',
    },
  ];

  const filteredStats = stats.filter(stat => {
    if (user.role === 'student') {
      return ['Enrolled Courses', 'Connected Instructors'].includes(stat.title);
    }
    if (user.role === 'instructor') {
      return ['Created Courses', 'Connected Students'].includes(stat.title);
    }
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Statistics</CardTitle>
          {user.role === 'instructor' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/instructor/analytics')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {filteredStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="text-center">
                <div className={`inline-flex items-center justify-center p-3 rounded-full bg-gray-100 mb-2`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.title}</div>
              </div>
            );
          })}
        </div>
        
        {user.role === 'instructor' && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Instructor Status</span>
              <div className="flex items-center space-x-2">
                <CheckCircle className={`h-4 w-4 ${user.isApproved ? 'text-green-600' : 'text-yellow-600'}`} />
                <span className={`text-sm font-medium ${user.isApproved ? 'text-green-600' : 'text-yellow-600'}`}>
                  {user.isApproved ? 'Approved' : 'Pending Approval'}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

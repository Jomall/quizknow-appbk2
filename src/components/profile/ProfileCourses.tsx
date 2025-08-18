'use client';

import { User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ProfileCoursesProps {
  user: User;
}

export default function ProfileCourses({ user }: ProfileCoursesProps) {
  const router = useRouter();

  const handleCreateCourse = () => {
    router.push('/instructor/courses/create');
  };

  const handleBrowseCourses = () => {
    router.push('/courses');
  };

  const getCourseTitle = () => {
    if (user.role === 'instructor') {
      return 'Created Courses';
    }
    return 'Enrolled Courses';
  };

  const courses = user.role === 'instructor' 
    ? user.createdCourses || [] 
    : user.enrolledCourses || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{getCourseTitle()}</CardTitle>
          {user.role === 'instructor' && (
            <Button
              onClick={handleCreateCourse}
              size="sm"
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Course</span>
            </Button>
          )}
          {user.role === 'student' && (
            <Button
              onClick={handleBrowseCourses}
              size="sm"
              variant="outline"
            >
              Browse Courses
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {courses.length > 0 ? (
          <div className="space-y-4">
            {courses.slice(0, 3).map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-5 w-5 text-gray-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{course.title}</h4>
                    <p className="text-sm text-gray-600">{course.description}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {course.duration}
                </div>
              </div>
            ))}
            {courses.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => router.push(user.role === 'instructor' ? '/instructor/courses' : '/student/courses')}
              >
                View all {courses.length} courses
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {user.role === 'instructor' 
                ? 'No courses created yet. Start creating your first course!'
                : 'No courses enrolled yet. Start learning today!'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

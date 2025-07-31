'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/data/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    storage.initializeDemoData();
  }, []);

  const handleGetStarted = () => {
    const currentUser = storage.getCurrentUser();
    if (currentUser) {
      // If user is already logged in, redirect to their dashboard
      switch (currentUser.role) {
        case 'admin':
          router.push('/admin');
          break;
        case 'instructor':
          router.push('/instructor');
          break;
        default:
          router.push('/student');
      }
    } else {
      // If no user is logged in, go to login page
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Tec-Net Solutions QuizKnow
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Empower your learning journey with our comprehensive platform designed for students, instructors, and administrators.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>For Students</CardTitle>
              <CardDescription>Learn at your own pace</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Enroll in courses</li>
                <li>• Track your progress</li>
                <li>• Submit assignments</li>
                <li>• Join discussions</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>For Instructors</CardTitle>
              <CardDescription>Create and manage courses</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Create courses</li>
                <li>• Upload content</li>
                <li>• Grade assignments</li>
                <li>• Track student progress</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>For Admins</CardTitle>
              <CardDescription>Manage the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• User management</li>
                <li>• Course oversight</li>
                <li>• Analytics & reports</li>
                <li>• System settings</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center space-x-4">
          <Button 
            size="lg" 
            onClick={handleGetStarted}
            className="bg-black text-white hover:bg-gray-800"
          >
            Get Started
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => router.push('/register')}
          >
            Create Account
          </Button>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Demo accounts available:</p>
          <p>student@tec-net-solutions.com | instructor@tec-net-solutions.com | admin@tec-net-solutions.com</p>
          <p>Password: any password will work for demo</p>
        </div>
      </div>
    </div>
  );
}

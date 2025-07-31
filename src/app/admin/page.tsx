'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/data/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    const currentUser = storage.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    storage.setCurrentUser(null);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage all users</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">View and manage all users in the system.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Management</CardTitle>
              <CardDescription>Manage all courses</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">View and manage all courses in the system.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>System analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">View system-wide analytics and reports.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

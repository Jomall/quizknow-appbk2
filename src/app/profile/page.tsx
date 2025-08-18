'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/types';
import { authSync } from '@/lib/data/auth-sync';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfileCourses from '@/components/profile/ProfileCourses';
import ProfileConnections from '@/components/profile/ProfileConnections';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit3, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const currentUser = authSync.getUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    
    setUser(currentUser);
    setLoading(false);

    // Subscribe to auth changes
    const unsubscribe = authSync.subscribe((updatedUser) => {
      if (!updatedUser) {
        router.push('/login');
      } else {
        setUser(updatedUser);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = () => {
    authSync.clearUser();
    router.push('/login');
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <div className="flex space-x-4">
              <Button
                onClick={handleEditProfile}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit Profile</span>
              </Button>
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            <ProfileHeader user={user} />
            <ProfileStats user={user} />
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-2 space-y-6">
            <ProfileCourses user={user} />
            <ProfileConnections user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}

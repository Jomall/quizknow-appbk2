"use client";

import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/data/user-storage';
import { User } from '@/lib/types';
import { cn } from '@/lib/utils';

interface UserNameDisplayProps {
  showWelcome?: boolean;
  showRole?: boolean;
  className?: string;
  format?: 'short' | 'full' | 'email';
  prefix?: string;
}

export function UserNameDisplay({ 
  showWelcome = true, 
  showRole = false, 
  className = '',
  format = 'short',
  prefix = 'Welcome'
}: UserNameDisplayProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  if (!user) {
    return null;
  }

  const getDisplayName = () => {
    switch (format) {
      case 'full':
        return user.name || user.email || 'User';
      case 'email':
        return user.email || 'User';
      case 'short':
      default:
        return user.name?.split(' ')[0] || user.email?.split('@')[0] || 'User';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'instructor':
        return 'Instructor';
      case 'student':
        return 'Student';
      default:
        return role;
    }
  };

  return (
    <div className={cn("text-sm font-medium", className)}>
      {showWelcome && <span className="text-gray-600">{prefix}, </span>}
      <span className="text-gray-900">{getDisplayName()}</span>
      {showRole && user.role && (
        <span className="ml-1 text-xs text-gray-500">
          ({getRoleDisplayName(user.role)})
        </span>
      )}
    </div>
  );
}

// Hook for getting current user
export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  return user;
}

// cn utility is imported from @/lib/utils

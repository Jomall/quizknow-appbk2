import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, Settings, LogOut, Bell, MessageSquare, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'student' | 'instructor' | 'admin';
}

interface NavUserMenuProps {
  className?: string;
  user?: User;
}

export const NavUserMenu: React.FC<NavUserMenuProps> = ({ className = '', user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    // Handle logout logic
    console.log('Logging out...');
    setIsOpen(false);
  };

  if (!user) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <button
          onClick={() => router.push('/login')}
          className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Sign In
        </button>
        <button
          onClick={() => router.push('/register')}
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Sign Up
        </button>
      </div>
    );
  }

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 rounded-md p-2 hover:bg-gray-100"
      >
        <div className="h-8 w-8 rounded-full bg-gray-300">
          {user.avatar && (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-full w-full rounded-full object-cover"
            />
          )}
        </div>
        <span className="hidden text-sm font-medium md:block">{user.name}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="p-2">
            <div className="border-b border-gray-200 px-3 py-2">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>

            <div className="py-1">
              <button
                onClick={() => handleNavigation('/profile')}
                className="flex w-full items-center space-x-3 rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </button>

              <button
                onClick={() => handleNavigation('/courses')}
                className="flex w-full items-center space-x-3 rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100"
              >
                <BookOpen className="h-4 w-4" />
                <span>My Courses</span>
              </button>

              <button
                onClick={() => handleNavigation('/messages')}
                className="flex w-full items-center space-x-3 rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Messages</span>
              </button>

              <button
                onClick={() => handleNavigation('/notifications')}
                className="flex w-full items-center space-x-3 rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100"
              >
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </button>

              <button
                onClick={() => handleNavigation('/settings')}
                className="flex w-full items-center space-x-3 rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>

              <div className="border-t border-gray-200 pt-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center space-x-3 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

NavUserMenu.displayName = 'NavUserMenu';

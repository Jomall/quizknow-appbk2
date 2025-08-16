'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, User, LogOut, LayoutDashboard, BookOpen, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/data/user-storage';
import { storage } from '@/lib/data/storage';
import { User as UserType } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUserStatus();
    
    // Listen for storage changes to update navbar when user logs in/out
    const handleStorageChange = () => {
      checkUserStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-tab updates
    const handleAuthChange = () => {
      checkUserStatus();
    };
    
    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  const checkUserStatus = () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  };

  const handleLogout = () => {
    storage.setCurrentUser(null);
    setUser(null);
    setIsOpen(false);
    
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event('auth-change'));
    
    router.push('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'instructor':
        return '/instructor';
      case 'student':
        return '/student';
      default:
        return '/';
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

  if (loading) {
    return (
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="animate-pulse h-8 w-32 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center">
              <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">QuizKnow</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Home
            </Link>
            
            {user && (
              <>
                <Link 
                  href={getDashboardLink()} 
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <LayoutDashboard className="h-4 w-4 mr-1" />
                  Dashboard
                </Link>
                
                {user.role === 'instructor' && (
                  <Link 
                    href="/instructor/courses" 
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    My Courses
                  </Link>
                )}
                
                {user.role === 'student' && (
                  <Link 
                    href="/student/courses" 
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Browse Courses
                  </Link>
                )}
                
                {user.role === 'admin' && (
                  <Link 
                    href="/admin/approvals" 
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Approvals
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff`} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      <p className="text-xs leading-none text-muted-foreground">{getRoleDisplayName(user.role)}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardLink()} className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            
            {user ? (
              <>
                <Link 
                  href={getDashboardLink()} 
                  className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                
                {user.role === 'instructor' && (
                  <Link 
                    href="/instructor/courses" 
                    className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    My Courses
                  </Link>
                )}
                
                {user.role === 'student' && (
                  <Link 
                    href="/student/courses" 
                    className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Browse Courses
                  </Link>
                )}
                
                {user.role === 'admin' && (
                  <Link 
                    href="/admin/approvals" 
                    className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Approvals
                  </Link>
                )}
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center px-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff`} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">{user.name}</div>
                      <div className="text-sm font-medium text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400">{getRoleDisplayName(user.role)}</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <Link 
                      href="/profile" 
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      onClick={() => setIsOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

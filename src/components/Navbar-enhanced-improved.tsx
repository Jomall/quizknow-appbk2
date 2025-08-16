'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, User, LogOut, LayoutDashboard, BookOpen, Users, ChevronRight, Home, Settings, HelpCircle } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { UserNameDisplay } from '@/components/common/UserNameDisplay';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

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

    // Handle scroll for backdrop blur
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const checkUserStatus = () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  };

  const handleLogout = useCallback(() => {
    storage.setCurrentUser(null);
    setUser(null);
    setIsOpen(false);
    
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event('auth-change'));
    
    router.push('/');
  }, [router]);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const isActive = (path: string) => pathname === path;

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

  const getNavigationItems = () => {
    const items = [
      { href: '/', label: 'Home', icon: Home, active: isActive('/') },
    ];

    if (!user) {
      return items;
    }

    items.push({
      href: getDashboardLink(),
      label: 'Dashboard',
      icon: LayoutDashboard,
      active: pathname.startsWith(getDashboardLink()),
    });

    switch (user.role) {
      case 'instructor':
        items.push(
          { href: '/instructor/courses', label: 'My Courses', icon: BookOpen, active: pathname.startsWith('/instructor/courses') },
          { href: '/instructor/students', label: 'Students', icon: Users, active: pathname.startsWith('/instructor/students') }
        );
        break;
      case 'student':
        items.push(
          { href: '/student/courses', label: 'Browse Courses', icon: BookOpen, active: pathname.startsWith('/student/courses') },
          { href: '/student/my-courses', label: 'My Courses', icon: LayoutDashboard, active: pathname.startsWith('/student/my-courses') }
        );
        break;
      case 'admin':
        items.push(
          { href: '/admin/approvals', label: 'Approvals', icon: Users, active: pathname.startsWith('/admin/approvals') },
          { href: '/admin/users', label: 'Users', icon: Users, active: pathname.startsWith('/admin/users') }
        );
        break;
    }

    return items;
  };

  if (loading) {
    return (
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-white shadow-sm"
      )}>
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

  const navigationItems = getNavigationItems();

  return (
    <>
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-white shadow-sm"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center group">
                <BookOpen className="h-8 w-8 text-blue-600 group-hover:text-blue-700 transition-colors" />
                <span className="ml-2 text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">QuizKnow</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center",
                    item.active
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  )}
                >
                  <item.icon className="h-4 w-4 mr-1" />
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex md:items-center md:space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  {/* User Name Display */}
                  <div className="hidden lg:flex items-center space-x-2">
                    <UserNameDisplay 
                      showWelcome={true}
                      prefix="Welcome,"
                      className="text-sm font-semibold text-blue-600"
                    />
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-100 transition-colors">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar || undefined} alt={user.name} />
                          <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                            {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                          <p className="text-xs leading-none text-muted-foreground">{getRoleDisplayName(user.role)}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push('/profile')}>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/settings')}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all"
                aria-expanded={isOpen}
                aria-label="Toggle menu"
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

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-xl">
            <div className="px-4 py-4 space-y-3">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={cn(
                    "block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 flex items-center",
                    item.active
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  )}
                >
                  <item.icon className="h-5 w-5 mr-3 text-blue-500" />
                  {item.label}
                  {item.active && <ChevronRight className="h-4 w-4 ml-auto" />}
                </Link>
              ))}

              {user && (
                <>
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    {/* User info section in mobile menu */}
                    <div className="px-4 py-3 bg-gray-50 rounded-lg mb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar || undefined} alt={user.name} />
                          <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                            {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                  <UserNameDisplay 
                    className="text-sm font-semibold text-gray-900"
                  />
                          <p className="text-xs text-gray-500">{getRoleDisplayName(user.role)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Link
                        href="/profile"
                        onClick={closeMenu}
                        className="flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-all duration-200"
                      >
                        <User className="h-5 w-5 mr-3 text-gray-500" />
                        Profile
                      </Link>
                      
                      <Link
                        href="/settings"
                        onClick={closeMenu}
                        className="flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-all duration-200"
                      >
                        <Settings className="h-5 w-5 mr-3 text-gray-500" />
                        Settings
                      </Link>
                      
                      <Link
                        href="/help"
                        onClick={closeMenu}
                        className="flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-all duration-200"
                      >
                        <HelpCircle className="h-5 w-5 mr-3 text-gray-500" />
                        Help & Support
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                      >
                        <LogOut className="h-5 w-5 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}

              {!user && (
                <>
                  <div className="pt-4 mt-4 border-t border-gray-200 space-y-3">
                    <Link
                      href="/login"
                      onClick={closeMenu}
                      className="block w-full text-center px-4 py-3 rounded-lg text-base font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={closeMenu}
                      className="block w-full text-center px-4 py-3 rounded-lg text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      Sign Up
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer to prevent content from being hidden under fixed navbar */}
      <div className="h-16" />
    </>
  );
}

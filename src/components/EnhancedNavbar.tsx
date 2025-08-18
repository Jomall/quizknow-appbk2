'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  ChevronRight,
  Bell,
  Settings,
  HelpCircle,
  Search,
  MessageSquare,
  Trophy,
  Clock,
  TrendingUp,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authSync } from '@/lib/data/auth-sync';
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
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface Notification {
  id: string;
  type: 'course' | 'achievement' | 'message' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
}

export default function EnhancedNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Mock notifications - replace with real data
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'achievement',
      title: 'Course Completed!',
      message: 'You completed "Introduction to React"',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
      actionUrl: '/student/achievements'
    },
    {
      id: '2',
      type: 'message',
      title: 'New Message',
      message: 'Sarah sent you a message about your course',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false,
      actionUrl: '/messages'
    },
    {
      id: '3',
      type: 'course',
      title: 'New Course Available',
      message: '"Advanced TypeScript" is now available',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      read: true,
      actionUrl: '/student/courses'
    }
  ];

  useEffect(() => {
    // Initial user check
    const currentUser = authSync.getUser();
    setUser(currentUser);
    setLoading(false);

    // Load mock notifications
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);

    // Subscribe to auth changes
    const unsubscribe = authSync.subscribe((newUser) => {
      setUser(newUser);
      setLoading(false);
    });

    // Handle auth change events from other tabs
    const handleAuthChange = () => {
      const updatedUser = authSync.getUser();
      setUser(updatedUser);
    };

    // Handle scroll for backdrop blur
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    // Handle click outside for notifications
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target as Node)) {
        setShowQuickActions(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('auth-change', handleAuthChange);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      unsubscribe();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('auth-change', handleAuthChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const checkUserStatus = () => {
    const currentUser = authSync.getUser();
    setUser(currentUser);
    setLoading(false);
  };

  const handleLogout = useCallback(() => {
    authSync.clearUser();
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

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const quickActions: QuickAction[] = user ? [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-4 w-4" />,
      action: () => router.push(getDashboardLink()),
      color: 'text-blue-600'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="h-4 w-4" />,
      action: () => router.push('/profile'),
      color: 'text-green-600'
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: <MessageSquare className="h-4 w-4" />,
      action: () => router.push('/messages'),
      color: 'text-purple-600'
    },
    {
      id: 'achievements',
      label: 'Achievements',
      icon: <Trophy className="h-4 w-4" />,
      action: () => router.push('/achievements'),
      color: 'text-yellow-600'
    }
  ] : [];

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Trophy className="h-4 w-4 text-yellow-600" />;
      case 'message':
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case 'course':
        return <BookOpen className="h-4 w-4 text-green-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
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
              <Link 
                href="/" 
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  isActive('/') 
                    ? "text-blue-600 bg-blue-50" 
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                )}
              >
                Home
              </Link>
              
              {user && (
                <>
                  <Link 
                    href={getDashboardLink()} 
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center",
                      pathname.startsWith(getDashboardLink())
                        ? "text-blue-600 bg-blue-50" 
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    )}
                  >
                    <LayoutDashboard className="h-4 w-4 mr-1" />
                    Dashboard
                  </Link>
                  
                  {user.role === 'instructor' && (
                    <Link 
                      href="/instructor/courses" 
                      className={cn(
                        "px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                        pathname.startsWith('/instructor/courses')
                          ? "text-blue-600 bg-blue-50" 
                          : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      )}
                    >
                      My Courses
                    </Link>
                  )}
                  
                  {user.role === 'student' && (
                    <Link 
                      href="/student/courses" 
                      className={cn(
                        "px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                        pathname.startsWith('/student/courses')
                          ? "text-blue-600 bg-blue-50" 
                          : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      )}
                    >
                      Browse Courses
                    </Link>
                  )}
                  
                  {user.role === 'admin' && (
                    <Link 
                      href="/admin/approvals" 
                      className={cn(
                        "px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center",
                        pathname.startsWith('/admin/approvals')
                          ? "text-blue-600 bg-blue-50" 
                          : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      )}
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
                <>
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search courses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && searchQuery.trim()) {
                          router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                        }
                      }}
                      className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Notifications */}
                  <div className="relative" ref={notificationRef}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="relative hover:bg-gray-100"
                      onClick={() => setShowNotifications(!showNotifications)}
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs">
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>

                    {showNotifications && (
                      <Card className="absolute right-0 mt-2 w-80 max-h-96 overflow-hidden">
                        <div className="p-4 border-b">
                          <h3 className="font-semibold">Notifications</h3>
                        </div>
                        <div className="overflow-y-auto max-h-80">
                          {notifications.length === 0 ? (
                            <p className="p-4 text-center text-gray-500">No notifications</p>
                          ) : (
                            notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={cn(
                                  "p-4 border-b hover:bg-gray-50 cursor-pointer",
                                  !notification.read && "bg-blue-50"
                                )}
                                onClick={() => {
                                  markNotificationAsRead(notification.id);
                                  if (notification.actionUrl) {
                                    router.push(notification.actionUrl);
                                  }
                                  setShowNotifications(false);
                                }}
                              >
                                <div className="flex items-start">
                                  <div className="flex-shrink-0 mr-3">
                                    {getNotificationIcon(notification.type)}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{notification.title}</p>
                                    <p className="text-sm text-gray-600">{notification.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {formatTimeAgo(notification.timestamp)}
                                    </p>
                                  </div>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </Card>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="relative" ref={quickActionsRef}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-gray-100"
                      onClick={() => setShowQuickActions(!showQuickActions)}
                    >
                      <Zap className="h-5 w-5" />
                    </Button>

                    {showQuickActions && (
                      <Card className="absolute right-0 mt-2 w-48">
                        <div className="p-2">
                          {quickActions.map((action) => (
                            <button
                              key={action.id}
                              onClick={() => {
                                action.action();
                                setShowQuickActions(false);
                              }}
                              className="w-full text-left flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
                            >
                              <span className={action.color}>{action.icon}</span>
                              <span className="ml-2">{action.label}</span>
                            </button>
                          ))}
                        </div>
                      </Card>
                    )}
                  </div>

                  {/* User Profile Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-100 transition-colors">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar || undefined} alt={user.name} />
                          <AvatarFallback className="bg-blue-600 text-white">
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {getRoleDisplayName(user.role)}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push(getDashboardLink())}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/profile')}>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/settings')}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/help')}>
                        <HelpCircle className="mr-2 h-4 w-4" />
                        Help & Support
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/login')}
                    className="text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  >
                    Sign in
                  </Button>
                  <Button
                    onClick={() => router.push('/register')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Sign up
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {/* Mobile Search */}
              <div className="px-3 py-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                        closeMenu();
                      }
                    }}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <Link
                href="/"
                onClick={closeMenu}
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium transition-all duration-200",
                  isActive('/')
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                )}
              >
                Home
              </Link>

              {user && (
                <>
                  <Link
                    href={getDashboardLink()}
                    onClick={closeMenu}
                    className={cn(
                      "block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 flex items-center",
                      pathname.startsWith(getDashboardLink())
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    )}
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>

                  {user.role === 'instructor' && (
                    <Link
                      href="/instructor/courses"
                      onClick={closeMenu}
                      className={cn(
                        "block px-3 py-2 rounded-md text-base font-medium transition-all duration-200",
                        pathname.startsWith('/instructor/courses')
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      )}
                    >
                      My Courses
                    </Link>
                  )}

                  {user.role === 'student' && (
                    <Link
                      href="/student/courses"
                      onClick={closeMenu}
                      className={cn(
                        "block px-3 py-2 rounded-md text-base font-medium transition-all duration-200",
                        pathname.startsWith('/student/courses')
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      )}
                    >
                      Browse Courses
                    </Link>
                  )}

                  {user.role === 'admin' && (
                    <Link
                      href="/admin/approvals"
                      onClick={closeMenu}
                      className={cn(
                        "block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 flex items-center",
                        pathname.startsWith('/admin/approvals')
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      )}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Approvals
                    </Link>
                  )}

                  {/* Mobile Notifications */}
                  <div className="pt-4 pb-3 border-t">
                    <div className="px-3 mb-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Notifications</h4>
                      {notifications.slice(0, 3).map((notification) => (
                        <div
                          key={notification.id}
                          className="py-2 text-sm"
                          onClick={() => {
                            markNotificationAsRead(notification.id);
                            if (notification.actionUrl) {
                              router.push(notification.actionUrl);
                            }
                            closeMenu();
                          }}
                        >
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-gray-600 text-xs">{notification.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 pb-3 border-t">
                    <div className="flex items-center px-3 mb-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar || undefined} alt={user.name} />
                        <AvatarFallback className="bg-blue-600 text-white">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <div className="text-base font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm font-medium text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          router.push(getDashboardLink());
                          closeMenu();
                        }}
                        className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2 inline" />
                        Dashboard
                      </button>
                      <button
                        onClick={() => {
                          router.push('/profile');
                          closeMenu();
                        }}
                        className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      >
                        <User className="h-4 w-4 mr-2 inline" />
                        Profile
                      </button>
                      <button
                        onClick={() => {
                          router.push('/settings');
                          closeMenu();
                        }}
                        className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      >
                        <Settings className="h-4 w-4 mr-2 inline" />
                        Settings
                      </button>
                      <button
                        onClick={() => {
                          handleLogout();
                          closeMenu();
                        }}
                        className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-2 inline" />
                        Log out
                      </button>
                    </div>
                  </div>
                </>
              )}

              {!user && (
                <div className="pt-4 pb-3 border-t">
                  <div className="space-y-2">
                    <Button
                      onClick={() => {
                        router.push('/login');
                        closeMenu();
                      }}
                      className="w-full"
                      variant="outline"
                    >
                      Sign in
                    </Button>
                    <Button
                      onClick={() => {
                        router.push('/register');
                        closeMenu();
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Sign up
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

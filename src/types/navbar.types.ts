// Navigation types for EnhancedNavbar component

export type UserRole = 'admin' | 'instructor' | 'student' | 'guest';

export interface NavUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
}

export interface Notification {
  id: string;
  type: 'course' | 'achievement' | 'message' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  color: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  active?: boolean;
  roles?: UserRole[];
}

export interface NavbarState {
  isMobileMenuOpen: boolean;
  isNotificationsOpen: boolean;
  isQuickActionsOpen: boolean;
  searchQuery: string;
  notifications: Notification[];
  unreadCount: number;
  scrolled: boolean;
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Notification, NavItem, QuickAction } from '@/types/navbar.types';

interface NavbarStore {
  // UI State
  isMobileMenuOpen: boolean;
  isNotificationsOpen: boolean;
  isQuickActionsOpen: boolean;
  isSearchOpen: boolean;
  scrolled: boolean;
  
  // Data State
  notifications: Notification[];
  unreadCount: number;
  searchQuery: string;
  searchResults: any[];
  isSearching: boolean;
  
  // User State
  userRole: string;
  navItems: NavItem[];
  quickActions: QuickAction[];
  
  // Actions
  toggleMobileMenu: () => void;
  toggleNotifications: () => void;
  toggleQuickActions: () => void;
  toggleSearch: () => void;
  setScrolled: (scrolled: boolean) => void;
  
  // Notification Actions
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  removeNotification: (id: string) => void;
  updateUnreadCount: () => void;
  
  // Search Actions
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: any[]) => void;
  setIsSearching: (isSearching: boolean) => void;
  clearSearch: () => void;
  
  // User Actions
  setUserRole: (role: string) => void;
  setNavItems: (items: NavItem[]) => void;
  setQuickActions: (actions: QuickAction[]) => void;
}

export const useNavbarStore = create<NavbarStore>()(
  persist(
    (set, get) => ({
      // Initial State
      isMobileMenuOpen: false,
      isNotificationsOpen: false,
      isQuickActionsOpen: false,
      isSearchOpen: false,
      scrolled: false,
      
      notifications: [],
      unreadCount: 0,
      searchQuery: '',
      searchResults: [],
      isSearching: false,
      
      userRole: 'guest',
      navItems: [],
      quickActions: [],
      
      // UI Actions
      toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      toggleNotifications: () => set((state) => ({ isNotificationsOpen: !state.isNotificationsOpen })),
      toggleQuickActions: () => set((state) => ({ isQuickActionsOpen: !state.isQuickActionsOpen })),
      toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
      setScrolled: (scrolled: boolean) => set({ scrolled }),
      
      // Notification Actions
      addNotification: (notification: Notification) => set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + (notification.read ? 0 : 1)
      })),
      
      markNotificationAsRead: (id: string) => set((state) => ({
        notifications: state.notifications.map((n: Notification) => 
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      })),
      
      markAllNotificationsAsRead: () => set((state) => ({
        notifications: state.notifications.map((n: Notification) => ({ ...n, read: true })),
        unreadCount: 0
      })),
      
      removeNotification: (id: string) => set((state) => ({
        notifications: state.notifications.filter((n: Notification) => n.id !== id),
        unreadCount: Math.max(0, state.unreadCount - (state.notifications.find((n: Notification) => n.id === id)?.read ? 0 : 1))
      })),
      
      updateUnreadCount: () => set((state) => ({
        unreadCount: state.notifications.filter((n: Notification) => !n.read).length
      })),
      
      // Search Actions
      setSearchQuery: (query: string) => set({ searchQuery: query }),
      setSearchResults: (results: any[]) => set({ searchResults: results }),
      setIsSearching: (isSearching: boolean) => set({ isSearching }),
      clearSearch: () => set({ searchQuery: '', searchResults: [], isSearching: false }),
      
      // User Actions
      setUserRole: (role: string) => set({ userRole: role }),
      setNavItems: (items: NavItem[]) => set({ navItems: items }),
      setQuickActions: (actions: QuickAction[]) => set({ quickActions: actions }),
    }),
    {
      name: 'navbar-store',
      partialize: (state) => ({
        userRole: state.userRole,
        quickActions: state.quickActions,
      }),
    }
  )
);

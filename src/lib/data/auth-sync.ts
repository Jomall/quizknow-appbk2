import { User } from '@/lib/types';
import { storage } from './storage';

export class AuthSync {
  private static instance: AuthSync;
  private listeners: Set<(user: User | null) => void> = new Set();

  static getInstance(): AuthSync {
    if (!AuthSync.instance) {
      AuthSync.instance = new AuthSync();
    }
    return AuthSync.instance;
  }

  subscribe(callback: (user: User | null) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(user: User | null) {
    this.listeners.forEach(callback => callback(user));
  }

  setUser(user: User | null) {
    storage.setCurrentUser(user);
    this.notify(user);
    
    // Dispatch events for cross-tab communication
    window.dispatchEvent(new Event('auth-change'));
    
    // Update localStorage for cross-tab sync
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }

  getUser(): User | null {
    return storage.getCurrentUser();
  }

  clearUser() {
    this.setUser(null);
  }
}

// Global auth sync instance
export const authSync = AuthSync.getInstance();

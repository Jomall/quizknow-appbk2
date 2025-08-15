import { User } from '@/lib/types';

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('current_user');
  return user ? JSON.parse(user) : null;
}

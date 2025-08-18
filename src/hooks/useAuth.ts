import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock authentication - in real app, this would check actual auth state
    const mockUser: User = {
      id: 'instructor-1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'instructor'
    };
    
    setUser(mockUser);
    setLoading(false);
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login: (userData: User) => setUser(userData),
    logout: () => setUser(null)
  };
};

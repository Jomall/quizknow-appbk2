'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { storage } from '@/lib/data/storage';
import { User } from '@/lib/types';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'instructor'>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const users = storage.getUsers();

      if (mode === 'login') {
        const user = users.find(u => u.email === email);
        if (!user) {
          setError('Invalid email or password');
          return;
        }
        
        storage.setCurrentUser(user);
        redirectToDashboard(user.role);
      } else {
        if (users.find(u => u.email === email)) {
          setError('Email already exists');
          return;
        }

        const newUser: User = {
          id: Date.now().toString(),
          email,
          name,
          role,
          enrolledCourses: [],
          createdCourses: [],
          createdAt: new Date(),
        };

        users.push(newUser);
        storage.saveUsers(users);
        storage.setCurrentUser(newUser);
        redirectToDashboard(newUser.role);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const redirectToDashboard = (userRole: string) => {
    switch (userRole) {
      case 'admin':
        router.push('/admin');
        break;
      case 'instructor':
        router.push('/instructor');
        break;
      default:
        router.push('/student');
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{mode === 'login' ? 'Welcome back' : 'Create your account'}</CardTitle>
        <CardDescription>
          {mode === 'login' 
            ? 'Enter your email to sign in to your account' 
            : 'Enter your details to create your account'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {mode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {mode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="role">I am a</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as 'student' | 'instructor')}
                className="w-full p-2 border rounded-md"
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
              </select>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

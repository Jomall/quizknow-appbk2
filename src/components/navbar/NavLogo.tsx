import React from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

interface NavLogoProps {
  className?: string;
}

export const NavLogo: React.FC<NavLogoProps> = ({ className = '' }) => {
  return (
    <Link href="/" className={`flex items-center space-x-2 ${className}`}>
      <BookOpen className="h-8 w-8 text-blue-600" />
      <span className="text-xl font-bold text-gray-900">QuizKnow</span>
    </Link>
  );
};

NavLogo.displayName = 'NavLogo';

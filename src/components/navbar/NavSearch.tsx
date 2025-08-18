import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, Book, User, FileText, HelpCircle, UserCheck } from 'lucide-react';
import { useEnhancedSearch } from '@/hooks/useEnhancedSearch';

interface NavSearchProps {
  className?: string;
  onFocusChange?: (focused: boolean) => void;
}

// Icon mapping based on result type
const getIconForType = (type: string) => {
  switch (type) {
    case 'course':
      return Book;
    case 'user':
      return User;
    case 'lesson':
      return FileText;
    case 'quiz':
      return HelpCircle;
    case 'instructor':
      return UserCheck;
    default:
      return Search;
  }
};

export const NavSearch: React.FC<NavSearchProps> = ({ 
  className = '', 
  onFocusChange 
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { performSearch, searchResults, loading } = useEnhancedSearch({});

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (value.trim()) {
      performSearch(value);
    }
  }, [performSearch]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocusChange?.(true);
  }, [onFocusChange]);

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      setIsFocused(false);
      onFocusChange?.(false);
    }, 200);
  }, [onFocusChange]);

  const handleClear = useCallback(() => {
    setQuery('');
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Search courses, users, quizzes..."
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-gray-100"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        )}
      </div>

      {isFocused && query && (
        <div className="absolute top-full z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          {loading && (
            <div className="p-4 text-center text-sm text-gray-500">
              Searching...
            </div>
          )}
          
          {!loading && searchResults.length > 0 && (
            <ul className="max-h-64 overflow-y-auto">
              {searchResults.map((result) => {
                const IconComponent = getIconForType(result.type);
                return (
                  <li key={result.id}>
                    <a
                      href={result.url}
                      className="flex items-center space-x-3 p-3 hover:bg-gray-50"
                    >
                      <IconComponent className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{result.title}</p>
                        {result.description && (
                          <p className="text-xs text-gray-500">{result.description}</p>
                        )}
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
          
          {!loading && searchResults.length === 0 && query && (
            <div className="p-4 text-center text-sm text-gray-500">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

NavSearch.displayName = 'NavSearch';

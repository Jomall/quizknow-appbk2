import { useState, useEffect, useCallback, useMemo } from 'react';

// Simple debounce implementation to avoid lodash dependency
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;
  
  const debounced = (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
  
  debounced.cancel = () => {
    if (timeout) clearTimeout(timeout);
  };
  
  return debounced as T & { cancel: () => void };
}

// Type declarations for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export interface SearchResult {
  id: string;
  type: 'course' | 'user' | 'lesson' | 'quiz' | 'instructor';
  title: string;
  description: string;
  imageUrl?: string;
  url: string;
  tags: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  price?: number;
  rating?: number;
  instructor?: string;
  duration?: string;
  category?: string;
}

interface UseEnhancedSearchProps {
  userId?: string;
  debounceMs?: number;
  maxResults?: number;
}

export function useEnhancedSearch({
  userId,
  debounceMs = 300,
  maxResults = 10,
}: UseEnhancedSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    type: 'all' as 'all' | 'course' | 'user' | 'lesson' | 'quiz' | 'instructor',
    difficulty: 'all' as 'all' | 'beginner' | 'intermediate' | 'advanced',
    priceRange: 'all' as 'all' | 'free' | 'paid' | 'premium',
    category: 'all' as string,
  });

  // Mock search results for demo
  const mockSearchResults: SearchResult[] = [
    {
      id: '1',
      type: 'course',
      title: 'Advanced React Development',
      description: 'Master React with advanced patterns and performance optimization',
      imageUrl: '/api/placeholder/200/120',
      url: '/courses/react-advanced',
      tags: ['react', 'javascript', 'frontend'],
      difficulty: 'advanced',
      price: 99.99,
      rating: 4.8,
      instructor: 'John Doe',
      duration: '12 hours',
      category: 'Web Development',
    },
    {
      id: '2',
      type: 'user',
      title: 'Sarah Johnson',
      description: 'Senior Frontend Developer with 5+ years experience',
      imageUrl: '/api/placeholder/200/120',
      url: '/users/sarah-johnson',
      tags: ['frontend', 'react', 'mentor'],
      category: 'Users',
    },
    {
      id: '3',
      type: 'lesson',
      title: 'Introduction to TypeScript',
      description: 'Learn TypeScript basics and advanced concepts',
      url: '/lessons/typescript-intro',
      tags: ['typescript', 'javascript', 'programming'],
      difficulty: 'beginner',
      duration: '45 minutes',
      category: 'Lessons',
    },
    {
      id: '4',
      type: 'quiz',
      title: 'React Hooks Quiz',
      description: 'Test your knowledge of React Hooks',
      url: '/quizzes/react-hooks',
      tags: ['react', 'hooks', 'quiz'],
      difficulty: 'intermediate',
      category: 'Quizzes',
    },
    {
      id: '5',
      type: 'instructor',
      title: 'Jane Smith',
      description: 'Expert React instructor with 10+ years experience',
      imageUrl: '/api/placeholder/200/120',
      url: '/instructors/jane-smith',
      tags: ['react', 'instructor', 'expert'],
      category: 'Instructors',
    },
  ];

  // Load search history from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('searchHistory');
      if (saved) {
        setSearchHistory(JSON.parse(saved));
      }
    }
  }, []);

  // Save search history to localStorage
  const saveSearchHistory = useCallback((history: string[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('searchHistory', JSON.stringify(history));
    }
  }, []);

  // Add to search history
  const addToSearchHistory = useCallback((query: string) => {
    if (!query.trim()) return;
    
    setSearchHistory(prev => {
      const updated = [query, ...prev.filter(item => item !== query)].slice(0, 10);
      saveSearchHistory(updated);
      return updated;
    });
  }, [saveSearchHistory]);

  // Clear search history
  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    saveSearchHistory([]);
  }, [saveSearchHistory]);

  // Search function
  const performSearch = useCallback(async (query: string, currentFilters = filters) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let results = mockSearchResults.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );

      // Apply filters
      if (currentFilters.type !== 'all') {
        results = results.filter(item => item.type === currentFilters.type);
      }
      
      if (currentFilters.difficulty !== 'all') {
        results = results.filter(item => item.difficulty === currentFilters.difficulty);
      }
      
      if (currentFilters.priceRange !== 'all') {
        results = results.filter(item => {
          if (currentFilters.priceRange === 'free') return !item.price || item.price === 0;
          if (currentFilters.priceRange === 'paid') return item.price && item.price > 0;
          return true;
        });
      }

      setSearchResults(results.slice(0, maxResults));
    } catch (err) {
      setError('Failed to perform search');
    } finally {
      setLoading(false);
    }
  }, [filters, maxResults]);

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce(performSearch, debounceMs),
    [performSearch, debounceMs]
  );

  // Voice search
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const startVoiceSearch = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setVoiceError('Voice search is not supported in your browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceError(null);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      performSearch(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      setVoiceError(`Voice search error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [performSearch]);

  // Search suggestions
  const getSearchSuggestions = useCallback((query: string) => {
    if (!query.trim()) return [];
    
    const suggestions = [
      'react course',
      'javascript tutorial',
      'python beginner',
      'web development',
      'data science',
      'machine learning',
      'frontend development',
      'backend development',
    ];
    
    return suggestions.filter(s => s.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
  }, []);

  // Update search when query changes
  useEffect(() => {
    debouncedSearch(searchQuery, filters);
  }, [searchQuery, filters, debouncedSearch]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    loading,
    error,
    searchHistory,
    filters,
    setFilters,
    addToSearchHistory,
    clearSearchHistory,
    startVoiceSearch,
    isListening,
    voiceError,
    getSearchSuggestions,
    performSearch,
  };
}

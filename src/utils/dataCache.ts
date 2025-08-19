import { QueryClient } from '@tanstack/react-query';

// Create a custom query client with optimized settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

// Cache management utilities
export const cacheUtils = {
  // Clear specific cache entries
  clearDashboardCache: () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-settings'] });
  },

  // Clear all cache
  clearAllCache: () => {
    queryClient.clear();
  },

  // Prefetch data for better performance
  prefetchDashboardData: async (filters?: any) => {
    await queryClient.prefetchQuery({
      queryKey: ['dashboard-metrics', filters],
      queryFn: async () => {
        const response = await fetch('/api/dashboard/metrics');
        return response.json();
      },
      staleTime: 5 * 60 * 1000,
    });
  },

  // Get cache stats
  getCacheStats: () => {
    const queries = queryClient.getQueryCache().getAll();
    return {
      totalQueries: queries.length,
      activeQueries: queries.filter(q => q.state.status === 'success').length,
      staleQueries: queries.filter(q => q.isStale()).length,
      fetchingQueries: queries.filter(q => q.state.status === 'pending').length,
    };
  },

  // Optimize cache based on usage patterns
  optimizeCache: () => {
    const queries = queryClient.getQueryCache().getAll();
    
    // Remove old queries that haven't been used recently
    const now = Date.now();
    queries.forEach(query => {
      const lastUsed = query.state.dataUpdatedAt || 0;
      if (now - lastUsed > 30 * 60 * 1000) { // 30 minutes
        queryClient.removeQueries({ queryKey: query.queryKey });
      }
    });
  },
};

// Background sync utility
export const backgroundSync = {
  syncInterval: null as NodeJS.Timeout | null,

  startBackgroundSync: (intervalMs: number = 30000) => {
    backgroundSync.stopBackgroundSync();
    backgroundSync.syncInterval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    }, intervalMs);
  },

  stopBackgroundSync: () => {
    if (backgroundSync.syncInterval) {
      clearInterval(backgroundSync.syncInterval);
      backgroundSync.syncInterval = null;
    }
  },

  // Sync on visibility change
  setupVisibilitySync: () => {
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
        }
      });
    }
  },
};

// Performance monitoring
export const performanceMonitor = {
  metrics: {
    cacheHitRate: 0,
    averageResponseTime: 0,
    totalRequests: 0,
    cacheHits: 0,
  },

  recordRequest: (cacheHit: boolean, responseTime: number) => {
    performanceMonitor.metrics.totalRequests++;
    if (cacheHit) performanceMonitor.metrics.cacheHits++;
    
    const currentAvg = performanceMonitor.metrics.averageResponseTime;
    const newAvg = (currentAvg * (performanceMonitor.metrics.totalRequests - 1) + responseTime) / performanceMonitor.metrics.totalRequests;
    performanceMonitor.metrics.averageResponseTime = newAvg;
    
    performanceMonitor.metrics.cacheHitRate = performanceMonitor.metrics.cacheHits / performanceMonitor.metrics.totalRequests;
  },

  getMetrics: () => performanceMonitor.metrics,

  resetMetrics: () => {
    performanceMonitor.metrics = {
      cacheHitRate: 0,
      averageResponseTime: 0,
      totalRequests: 0,
      cacheHits: 0,
    };
  },
};

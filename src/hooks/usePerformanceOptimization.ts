import { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface PerformanceMetrics {
  memoryUsage: number;
  loadTime: number;
  apiCalls: number;
  cacheHitRate: number;
}

export const usePerformanceOptimization = () => {
  const queryClient = useQueryClient();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memoryUsage: 0,
    loadTime: 0,
    apiCalls: 0,
    cacheHitRate: 0
  });

  // Monitor performance
  useEffect(() => {
    const measurePerformance = () => {
      // Memory usage (if available)
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / 1024 / 1024 // MB
        }));
      }

      // Measure page load time
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        setMetrics(prev => ({
          ...prev,
          loadTime: navigation.loadEventEnd - navigation.loadEventStart
        }));
      }
    };

    measurePerformance();
    const interval = setInterval(measurePerformance, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Optimize queries
  const optimizeQueries = useCallback(() => {
    // Remove stale queries
    queryClient.removeQueries({
      predicate: (query) => {
        const lastFetch = query.state.dataUpdatedAt;
        const now = Date.now();
        return now - lastFetch > 5 * 60 * 1000; // 5 minutes
      }
    });

    // Prefetch important queries
    queryClient.prefetchQuery({
      queryKey: ['public-services'],
      staleTime: 2 * 60 * 1000, // 2 minutes
    });

    queryClient.prefetchQuery({
      queryKey: ['home-stats'],
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  }, [queryClient]);

  // Debounced search optimization
  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  }, []);

  // Image lazy loading optimization
  const lazyLoadImages = useCallback(() => {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src!;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
    
    return () => imageObserver.disconnect();
  }, []);

  // Bundle size optimization
  const dynamicImport = useCallback(async (modulePath: string) => {
    try {
      const module = await import(modulePath);
      return module;
    } catch (error) {
      console.error('Failed to load module:', modulePath, error);
      return null;
    }
  }, []);

  // Cache management
  const manageCaches = useCallback(() => {
    // Clear old caches
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        const oldCaches = cacheNames.filter(name => 
          name.includes('old') || name.includes('v1')
        );
        return Promise.all(
          oldCaches.map(cacheName => caches.delete(cacheName))
        );
      });
    }

    // Update cache hit rate
    const cacheStats = queryClient.getQueryCache().getAll();
    const totalQueries = cacheStats.length;
    const cachedQueries = cacheStats.filter(query => 
      query.state.status === 'success' && 
      Date.now() - query.state.dataUpdatedAt < 60000 // 1 minute
    ).length;
    
    setMetrics(prev => ({
      ...prev,
      cacheHitRate: totalQueries > 0 ? (cachedQueries / totalQueries) * 100 : 0
    }));
  }, [queryClient]);

  return {
    metrics,
    optimizeQueries,
    debounce,
    lazyLoadImages,
    dynamicImport,
    manageCaches
  };
};
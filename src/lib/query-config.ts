import { type QueryClientConfig } from "@tanstack/react-query";

/**
 * Optimized React Query client configuration
 */
export const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      // How long to keep data in cache before refetching
      staleTime: 1000 * 60 * 5, // 5 minutes
      
      // Number of retry attempts for failed queries
      retry: 1,
      
      // Enable suspense mode (use with React.Suspense)
      // suspense: true,
      
      // Refetch when component refocuses
      refetchOnWindowFocus: true,
      
      // Refetch when reconnected
      refetchOnReconnect: true,
      
      // Cache time (how long to keep inactive data in memory)
      gcTime: 1000 * 60 * 60 * 2, // 2 hours
    },
    mutations: {
      // Retry failed mutations
      retry: 1,
    },
  },
};

/**
 * Different stale times for different types of data
 */
export const staleTimes = {
  user: 1000 * 60 * 60, // 1 hour
  post: 1000 * 60 * 5, // 5 minutes
  comment: 1000 * 60 * 2, // 2 minutes
  notification: 1000 * 30, // 30 seconds
  message: 1000 * 20, // 20 seconds
};

/**
 * Custom key factory for better cache organization
 */
export const createQueryKey = <T extends Record<string, any>>(
  prefix: string,
  params?: T
) => {
  return [prefix, ...(params ? [params] : [])];
};
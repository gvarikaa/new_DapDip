import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const LoadingFallback = () => (
  <div className="flex h-40 w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
);

/**
 * Creates a lazily-loaded component with customizable loading state
 * @param importFn Dynamic import function
 * @param LoadingComponent Optional custom loading component
 */
export function lazyImport<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  LoadingComponent = LoadingFallback,
) {
  return dynamic(importFn, {
    loading: () => <LoadingComponent />,
    // Disable SSR for client-only components
    // ssr: false,
  });
}

// Lazily loaded components
export const LazyPostAnalysisModal = lazyImport(
  () => import('../components/post/PostAnalysisModal')
);

export const LazyEditProfileModal = lazyImport(
  () => import('../components/profile/EditProfileModal')
);

export const LazyCreatePostForm = lazyImport(
  () => import('../components/post/CreatePostForm')
);

export const LazyComments = lazyImport(
  () => import('../components/comment/Comments')
);
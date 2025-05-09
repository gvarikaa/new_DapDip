import { MetadataRoute } from 'next';

/**
 * Dynamic sitemap generation for the application
 * https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base URL of the site
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dapdip.com';
  
  // Static routes
  const staticRoutes = [
    '',
    '/about',
    '/terms',
    '/privacy',
    '/help',
    '/settings',
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));
  
  // Dynamic routes could be fetched from database
  // For example, getting popular user profiles and posts
  try {
    // This is a placeholder for actual database fetching
    // In a real implementation, you would fetch from your database
    
    const dynamicRoutes = [];
    
    // Return combined routes
    return [...staticRoutes, ...dynamicRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticRoutes;
  }
}
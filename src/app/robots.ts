import { MetadataRoute } from 'next';

/**
 * Dynamic robots.txt generation
 * https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  // Base URL of the site
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dapdip.com';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/settings/',
        '/private/',
        '/*.json',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
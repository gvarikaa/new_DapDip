import { Metadata } from 'next';

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  twitterCard?: 'summary' | 'summary_large_image';
  noIndex?: boolean;
}

/**
 * Generate metadata for pages using Next.js Metadata API
 * 
 * @example
 * 
 * // In a page layout or page.tsx file:
 * export const metadata = generateMetadata({
 *   title: 'Home Page',
 *   description: 'Welcome to our platform',
 * });
 */
export function generateMetadata({
  title,
  description,
  canonicalUrl,
  ogImage = 'https://www.dapdip.com/default-og-image.jpg',
  ogType = 'website',
  twitterCard = 'summary_large_image',
  noIndex = false,
}: SEOProps): Metadata {
  // Default site information
  const siteName = 'DapDip';
  const twitterHandle = '@dapdip';
  
  return {
    title: {
      template: `%s | ${siteName}`,
      default: title,
    },
    description,
    
    // Canonical URL
    ...(canonicalUrl && {
      alternates: {
        canonical: canonicalUrl,
      },
    }),
    
    // Robots directives
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
      },
    },
    
    // Open Graph
    openGraph: {
      type: ogType,
      url: canonicalUrl,
      title,
      description,
      siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    
    // Twitter
    twitter: {
      card: twitterCard,
      site: twitterHandle,
      title,
      description,
      images: [ogImage],
    },
    
    // Application info
    applicationName: siteName,
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: siteName,
    },
    formatDetection: {
      telephone: false,
    },
    themeColor: '#ffffff',
  };
}

/**
 * Generate profile page metadata
 */
export function generateProfileMetadata({
  username,
  name,
  bio,
  profileUrl,
  imageUrl,
}: {
  username: string;
  name: string;
  bio?: string;
  profileUrl: string;
  imageUrl?: string;
}): Metadata {
  return generateMetadata({
    title: `${name} (@${username})`,
    description: bio || `Check out ${name}'s profile on DapDip`,
    canonicalUrl: profileUrl,
    ogImage: imageUrl || 'https://www.dapdip.com/default-profile-og.jpg',
    ogType: 'profile',
  });
}

/**
 * Generate post page metadata
 */
export function generatePostMetadata({
  title,
  excerpt,
  authorName,
  postUrl,
  imageUrl,
}: {
  title: string;
  excerpt?: string;
  authorName: string;
  postUrl: string;
  imageUrl?: string;
}): Metadata {
  return generateMetadata({
    title,
    description: excerpt || `Post by ${authorName} on DapDip`,
    canonicalUrl: postUrl,
    ogImage: imageUrl || 'https://www.dapdip.com/default-post-og.jpg',
    ogType: 'article',
    twitterCard: 'summary_large_image',
  });
}
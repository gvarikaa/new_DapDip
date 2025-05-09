'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import JsonLd from './JsonLd';

interface PageSEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string; 
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  noIndex?: boolean;
  schema?: Record<string, any> | Record<string, any>[];
  children?: React.ReactNode;
}

/**
 * Page-level SEO component with JSON-LD schema
 * This is a client component that adds needed metadata to a page
 * Use in conjunction with the Metadata API for server-rendered meta tags
 * 
 * @example
 * <PageSEO
 *   title="User Profile"
 *   description="View and manage your profile"
 *   schema={profileSchema}
 * >
 *   <ProfileContent />
 * </PageSEO>
 */
export function PageSEO({
  title,
  description,
  canonicalUrl,
  ogType = 'website',
  ogImage,
  ogTitle,
  ogDescription,
  twitterCard = 'summary_large_image',
  twitterTitle,
  twitterDescription,
  twitterImage,
  noIndex = false,
  schema,
  children,
}: PageSEOProps): JSX.Element {
  const pathname = usePathname();
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://dapdip.com';
  
  // Defaults
  const defaultTitle = title || 'DapDip';
  const defaultDescription = description || 'Connect with friends and share your moments on DapDip social network';
  const defaultCanonicalUrl = canonicalUrl || `${baseUrl}${pathname}`;
  
  return (
    <>
      {/* This client-side component adds JSON-LD and any other dynamic SEO elements */}
      {schema && <JsonLd schema={schema} />}
      
      {/* Additional client-side metadata (if needed) */}
      {noIndex && (
        <meta name="robots" content="noindex, nofollow" />
      )}
      
      {children}
    </>
  );
}

export default PageSEO;
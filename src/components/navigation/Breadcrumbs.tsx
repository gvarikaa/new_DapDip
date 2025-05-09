'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href: string;
  active?: boolean;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  homeHref?: string;
  homeLabel?: string;
  className?: string;
  separator?: ReactNode;
  showHomeIcon?: boolean;
}

/**
 * Breadcrumbs component for SEO and navigation
 * Automatically generates breadcrumbs from the current path if items are not provided
 * 
 * @example
 * <Breadcrumbs />  // Auto-generate from path
 * 
 * @example
 * <Breadcrumbs 
 *   items={[
 *     { label: 'Profile', href: '/profile' },
 *     { label: 'Settings', href: '/profile/settings', active: true },
 *   ]} 
 * />
 */
export function Breadcrumbs({
  items,
  homeHref = '/',
  homeLabel = 'Home',
  className,
  separator = <ChevronRight className="h-4 w-4 text-muted-foreground" />,
  showHomeIcon = true,
}: BreadcrumbsProps): JSX.Element {
  const pathname = usePathname();
  
  // If items are not provided, generate them from the pathname
  const breadcrumbs = items || generateBreadcrumbs(pathname, homeHref, homeLabel);
  
  return (
    <nav 
      aria-label="Breadcrumb"
      className={cn("flex items-center text-sm", className)}
    >
      {/* Add structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': breadcrumbs.map((item, index) => ({
              '@type': 'ListItem',
              'position': index + 1,
              'item': {
                '@id': new URL(item.href, typeof window !== 'undefined' ? window.location.origin : 'https://dapdip.com').href,
                'name': item.label,
              },
            })),
          }),
        }}
      />
      
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.href} className="flex items-center">
            {index > 0 && <span className="mx-1">{separator}</span>}
            
            {breadcrumb.active ? (
              <span 
                className="text-foreground font-medium" 
                aria-current="page"
              >
                {index === 0 && showHomeIcon && breadcrumb.label === homeLabel ? (
                  <span className="flex items-center">
                    <Home className="h-3.5 w-3.5 mr-1" />
                    <span className="sr-only">{breadcrumb.label}</span>
                  </span>
                ) : (
                  breadcrumb.label
                )}
              </span>
            ) : (
              <Link
                href={breadcrumb.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {index === 0 && showHomeIcon && breadcrumb.label === homeLabel ? (
                  <span className="flex items-center">
                    <Home className="h-3.5 w-3.5 mr-1" />
                    <span className="sr-only">{breadcrumb.label}</span>
                  </span>
                ) : (
                  breadcrumb.label
                )}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Generate breadcrumbs from a URL pathname
 */
function generateBreadcrumbs(
  pathname: string,
  homeHref: string,
  homeLabel: string
): BreadcrumbItem[] {
  const paths = pathname.split('/').filter(Boolean);
  
  // Start with home
  const breadcrumbs: BreadcrumbItem[] = [
    { label: homeLabel, href: homeHref }
  ];
  
  // Add each path segment
  let currentPath = '';
  paths.forEach((path, i) => {
    // Skip dynamic path segments by checking if it's wrapped in [] or begins with [
    if (path.startsWith('[') && path.endsWith(']')) {
      return;
    }
    
    // Build the current path
    currentPath += `/${path}`;
    
    // Format the label (capitalize and replace hyphens with spaces)
    const label = path
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    breadcrumbs.push({
      label,
      href: currentPath,
      active: i === paths.length - 1,
    });
  });
  
  return breadcrumbs;
}

export default Breadcrumbs;
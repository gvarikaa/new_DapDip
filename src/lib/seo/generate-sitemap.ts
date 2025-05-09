import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Sitemap URL entry
 */
interface SitemapURL {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * Generate XML sitemap content
 */
function generateSitemapXML(urls: SitemapURL[]): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  urls.forEach((url) => {
    xml += '  <url>\n';
    xml += `    <loc>${url.loc}</loc>\n`;
    
    if (url.lastmod) {
      xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
    }
    
    if (url.changefreq) {
      xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    }
    
    if (url.priority !== undefined) {
      xml += `    <priority>${url.priority.toFixed(1)}</priority>\n`;
    }
    
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  
  return xml;
}

/**
 * Generate sitemap.xml file based on static routes and dynamic database content
 */
export async function generateSitemap(outputPath = 'public/sitemap.xml'): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dapdip.com';
  const prisma = new PrismaClient();
  
  try {
    // Static routes
    const staticRoutes: SitemapURL[] = [
      { loc: `${baseUrl}/`, lastmod: new Date().toISOString(), changefreq: 'daily', priority: 1.0 },
      { loc: `${baseUrl}/explore`, lastmod: new Date().toISOString(), changefreq: 'hourly', priority: 0.9 },
      { loc: `${baseUrl}/messages`, lastmod: new Date().toISOString(), changefreq: 'daily', priority: 0.8 },
      { loc: `${baseUrl}/settings`, lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.6 },
      { loc: `${baseUrl}/about`, lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.5 },
      { loc: `${baseUrl}/terms`, lastmod: new Date().toISOString(), changefreq: 'yearly', priority: 0.3 },
      { loc: `${baseUrl}/privacy`, lastmod: new Date().toISOString(), changefreq: 'yearly', priority: 0.3 },
      { loc: `${baseUrl}/help`, lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.4 },
    ];
    
    // Dynamic routes from database
    
    // 1. User profiles
    const users = await prisma.user.findMany({
      where: {
        settings: {
          privacyLevel: 'PUBLIC', // Only include public profiles
        },
      },
      select: {
        username: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 10000, // Limit to 10,000 users for performance
    });
    
    const userRoutes: SitemapURL[] = users.map((user) => ({
      loc: `${baseUrl}/profile/${user.username}`,
      lastmod: user.updatedAt.toISOString(),
      changefreq: 'weekly',
      priority: 0.7,
    }));
    
    // 2. Public posts
    const posts = await prisma.post.findMany({
      where: {
        privacyLevel: 'PUBLIC',
      },
      select: {
        id: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 10000, // Limit to 10,000 posts for performance
    });
    
    const postRoutes: SitemapURL[] = posts.map((post) => ({
      loc: `${baseUrl}/post/${post.id}`,
      lastmod: post.updatedAt.toISOString(),
      changefreq: 'monthly',
      priority: 0.6,
    }));
    
    // 3. Topic pages
    const topics = await prisma.topic.findMany({
      select: {
        name: true,
        updatedAt: true,
      },
      orderBy: {
        _count: {
          posts: 'desc',
        },
      },
      take: 1000, // Limit to 1,000 topics
    });
    
    const topicRoutes: SitemapURL[] = topics.map((topic) => ({
      loc: `${baseUrl}/topic/${encodeURIComponent(topic.name.toLowerCase().replace(/\s+/g, '-'))}`,
      lastmod: topic.updatedAt.toISOString(),
      changefreq: 'daily',
      priority: 0.8,
    }));
    
    // Combine all routes
    const allRoutes = [...staticRoutes, ...userRoutes, ...postRoutes, ...topicRoutes];
    
    // Generate XML
    const sitemapXml = generateSitemapXML(allRoutes);
    
    // Write to file
    const filePath = path.resolve(outputPath);
    fs.writeFileSync(filePath, sitemapXml);
    
    console.log(`Sitemap generated at ${filePath} with ${allRoutes.length} URLs`);
    
    // If you have more than 50,000 URLs, create a sitemap index
    if (allRoutes.length > 50000) {
      console.warn('More than 50,000 URLs found. Consider creating a sitemap index file with multiple sitemaps.');
    }
  } catch (error) {
    console.error('Error generating sitemap:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Generate sitemap index file for large sites
 */
export async function generateSitemapIndex(
  sitemapPaths: string[],
  outputPath = 'public/sitemap-index.xml'
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dapdip.com';
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  sitemapPaths.forEach((sitemapPath) => {
    xml += '  <sitemap>\n';
    xml += `    <loc>${baseUrl}/${sitemapPath}</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
    xml += '  </sitemap>\n';
  });
  
  xml += '</sitemapindex>';
  
  // Write to file
  const filePath = path.resolve(outputPath);
  fs.writeFileSync(filePath, xml);
  
  console.log(`Sitemap index generated at ${filePath} with ${sitemapPaths.length} sitemaps`);
}
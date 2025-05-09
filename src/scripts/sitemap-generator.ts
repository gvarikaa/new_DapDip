import { generateSitemap, generateSitemapIndex } from '../lib/seo/generate-sitemap';

/**
 * This is the entry point for the sitemap generation script
 * It will generate the sitemap.xml file based on database content
 */
async function main() {
  try {
    console.log('Generating sitemap...');
    
    // Generate the main sitemap
    await generateSitemap('public/sitemap.xml');
    
    // For large sites, you might want to generate multiple sitemaps and an index
    // Example:
    // await generateSitemap('public/sitemap-posts.xml', 'posts');
    // await generateSitemap('public/sitemap-users.xml', 'users');
    // await generateSitemap('public/sitemap-topics.xml', 'topics');
    // await generateSitemap('public/sitemap-static.xml', 'static');
    // 
    // await generateSitemapIndex([
    //   'sitemap-posts.xml',
    //   'sitemap-users.xml',
    //   'sitemap-topics.xml',
    //   'sitemap-static.xml',
    // ], 'public/sitemap.xml');
    
    console.log('Sitemap generation completed successfully');
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

// Run the main function
main();
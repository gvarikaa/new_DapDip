#!/usr/bin/env node

/**
 * This script generates a sitemap.xml file for the application.
 * It can be run manually or scheduled via cron job.
 * 
 * Usage:
 * npm run generate-sitemap
 * 
 * Make sure to add this script to your package.json:
 * "scripts": {
 *   "generate-sitemap": "node src/scripts/generate-sitemap.js"
 * }
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function main() {
  try {
    console.log('Starting sitemap generation...');
    
    // Run the TypeScript file using ts-node
    const generateProcess = spawn('npx', [
      'ts-node',
      '--transpile-only',
      path.join(__dirname, 'sitemap-generator.ts')
    ]);
    
    // Handle output
    generateProcess.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    
    generateProcess.stderr.on('data', (data) => {
      console.error(data.toString());
    });
    
    // Handle completion
    generateProcess.on('close', (code) => {
      if (code === 0) {
        console.log('Sitemap generated successfully');
        
        // Verify the sitemap file exists
        const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
        if (fs.existsSync(sitemapPath)) {
          console.log(`Sitemap created at ${sitemapPath}`);
          
          // Log sitemap stats
          const stats = fs.statSync(sitemapPath);
          console.log(`Sitemap size: ${(stats.size / 1024).toFixed(2)} KB`);
          console.log(`Last modified: ${stats.mtime}`);
          
          const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
          const urlCount = (sitemapContent.match(/<url>/g) || []).length;
          console.log(`URLs in sitemap: ${urlCount}`);
        } else {
          console.error('Sitemap file not found after generation');
        }
      } else {
        console.error(`Generation process exited with code ${code}`);
      }
    });
  } catch (error) {
    console.error('Error running sitemap generation:', error);
    process.exit(1);
  }
}

main();
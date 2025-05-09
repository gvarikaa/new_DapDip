import { withSentryConfig } from '@sentry/nextjs';
import withBundleAnalyzer from '@next/bundle-analyzer';
import baseConfig from './next.config';

/**
 * Bundle analyzer configuration for debugging bundle sizes
 * Run with: npm run analyze
 */
const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withAnalyzer(baseConfig);
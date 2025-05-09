'use client';

import { useEffect, useState } from 'react';
import { onCLS, onFID, onLCP, onFCP, onTTFB, Metric } from 'web-vitals';

type WebVitalsMetrics = {
  CLS?: number; // Cumulative Layout Shift
  FID?: number; // First Input Delay
  LCP?: number; // Largest Contentful Paint
  FCP?: number; // First Contentful Paint
  TTFB?: number; // Time to First Byte
};

type WebVitalsReportFn = (metrics: WebVitalsMetrics) => void;

/**
 * Hook to measure Core Web Vitals in the client
 * 
 * @param reportFn Optional function to report metrics to analytics
 * @returns Collected web vitals metrics
 */
export function useWebVitals(reportFn?: WebVitalsReportFn): WebVitalsMetrics {
  const [metrics, setMetrics] = useState<WebVitalsMetrics>({});
  
  useEffect(() => {
    // Handler for all metrics
    const handleMetric = (metric: Metric) => {
      // Update state with new metric
      setMetrics((prev) => ({
        ...prev,
        [metric.name]: metric.value,
      }));
      
      // Report to analytics if function provided
      if (reportFn && Object.keys(metrics).length === 4) {
        const updatedMetrics = {
          ...metrics,
          [metric.name]: metric.value,
        };
        reportFn(updatedMetrics);
      }
      
      // Log in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Web Vital: ${metric.name} = ${metric.value}`);
      }
    };
    
    // Register web vitals listeners
    onCLS(handleMetric);
    onFID(handleMetric);
    onLCP(handleMetric);
    onFCP(handleMetric);
    onTTFB(handleMetric);
    
    return () => {
      // No cleanup needed, but this is a placeholder
    };
  }, [reportFn, metrics]);
  
  return metrics;
}

/**
 * Send web vitals data to analytics endpoint
 */
export function reportWebVitals(metrics: WebVitalsMetrics): void {
  // This would send the metrics to your analytics platform
  // Example with a basic fetch call:
  if (process.env.NODE_ENV === 'production') {
    try {
      const body = JSON.stringify({
        metrics,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      });
      
      // Using sendBeacon for non-blocking analytics
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/vitals', body);
      } else {
        // Fallback to fetch
        fetch('/api/analytics/vitals', {
          body,
          method: 'POST',
          keepalive: true,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Failed to report web vitals:', error);
    }
  }
}

/**
 * Get thresholds for Core Web Vitals
 */
export function getWebVitalsThresholds(): Record<string, { good: number; needsImprovement: number }> {
  return {
    CLS: { good: 0.1, needsImprovement: 0.25 }, // Lower is better
    FID: { good: 100, needsImprovement: 300 }, // In milliseconds, lower is better
    LCP: { good: 2500, needsImprovement: 4000 }, // In milliseconds, lower is better
    FCP: { good: 1800, needsImprovement: 3000 }, // In milliseconds, lower is better
    TTFB: { good: 800, needsImprovement: 1800 }, // In milliseconds, lower is better
  };
}
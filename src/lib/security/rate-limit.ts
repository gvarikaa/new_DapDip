/**
 * Rate limiter implementation to protect API endpoints from abuse
 */

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

// Simple in-memory cache for rate limiting
// In production, use Redis or similar for distributed rate limiting
interface RateLimitCache {
  [ip: string]: {
    timestamp: number;
    count: number;
    token: string;
  };
}

const rateLimitCache: RateLimitCache = {};

// Regularly cleanup the cache to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  Object.keys(rateLimitCache).forEach((key) => {
    // Remove entries older than 1 hour
    if (now - rateLimitCache[key].timestamp > 60 * 60 * 1000) {
      delete rateLimitCache[key];
    }
  });
}, 60 * 60 * 1000); // Run cleanup every hour

export interface RateLimitConfig {
  // Number of requests allowed in the time window
  limit: number;
  // Time window in seconds
  windowInSeconds: number;
  // Optional function to extract custom identifiers
  identityFn?: (req: NextRequest) => string;
}

/**
 * Middleware to enforce rate limits on API routes
 * 
 * @param req Next.js request object
 * @param config Rate limiting configuration
 * @returns NextResponse or undefined if limit not reached
 */
export function rateLimit(
  req: NextRequest,
  config: RateLimitConfig
): NextResponse | undefined {
  // Get identifier (IP by default)
  const identifier = 
    config.identityFn?.(req) || 
    req.ip || 
    "anonymous";
  
  const now = Date.now();
  const windowMs = config.windowInSeconds * 1000;
  
  // Initialize or get current state for this identifier
  const currentState = rateLimitCache[identifier] || {
    timestamp: now,
    count: 0,
    token: randomUUID(),
  };
  
  // Reset if window has expired
  if (now - currentState.timestamp > windowMs) {
    currentState.timestamp = now;
    currentState.count = 0;
    currentState.token = randomUUID();
  }
  
  // Increment request count
  currentState.count++;
  
  // Update cache
  rateLimitCache[identifier] = currentState;
  
  // Calculate remaining requests
  const remaining = Math.max(0, config.limit - currentState.count);
  
  // Get time to reset in seconds
  const resetInSeconds = Math.ceil(
    (currentState.timestamp + windowMs - now) / 1000
  );
  
  // Set rate limit headers
  const headers = new Headers({
    "X-RateLimit-Limit": config.limit.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": resetInSeconds.toString(),
  });
  
  // If limit is exceeded, return 429 Too Many Requests
  if (currentState.count > config.limit) {
    return new NextResponse(
      JSON.stringify({
        error: "Too many requests",
        message: `Rate limit exceeded. Please try again in ${resetInSeconds} seconds.`,
      }),
      {
        status: 429,
        headers: {
          ...Object.fromEntries(headers.entries()),
          "Content-Type": "application/json",
          "Retry-After": resetInSeconds.toString(),
        },
      }
    );
  }
  
  // Not rate limited, return headers to be merged with response
  return undefined;
}

// Common configurations for different endpoints
export const rateLimitConfigs = {
  // Strict limits for authentication endpoints to prevent brute force
  auth: {
    limit: 5,
    windowInSeconds: 60, // 5 requests per minute
  },
  
  // Medium limits for posting content
  content: {
    limit: 20,
    windowInSeconds: 60, // 20 requests per minute
  },
  
  // Lenient limits for read operations
  read: {
    limit: 100,
    windowInSeconds: 60, // 100 requests per minute
  },
};
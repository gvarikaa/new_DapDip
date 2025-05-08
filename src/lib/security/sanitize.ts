/**
 * Utilities for sanitizing user input to prevent XSS attacks
 */

import { encode } from "html-entities";

/**
 * Sanitizes HTML to prevent XSS attacks
 * 
 * @param input String potentially containing malicious HTML
 * @returns Sanitized string with HTML entities encoded
 */
export function sanitizeHtml(input: string): string {
  if (!input) return "";

  // Encode HTML entities
  return encode(input, {
    mode: "nonAsciiPrintable",
    level: "all",
  });
}

/**
 * Sanitizes a value to be used in URLs
 * 
 * @param input Potentially unsafe URL value
 * @returns Sanitized value
 */
export function sanitizeUrl(input: string): string {
  if (!input) return "";

  try {
    // Use URL constructor to validate
    const url = new URL(input);
    
    // Only allow specific protocols
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return '';
    }
    
    return url.toString();
  } catch (e) {
    // Not a valid URL
    return '';
  }
}

/**
 * Sanitizes user inputs for use in SQL queries
 * (Note: Prisma handles this automatically, but this is useful for custom queries)
 * 
 * @param input User input for SQL query
 * @returns Sanitized string
 */
export function sanitizeSql(input: string): string {
  if (!input) return "";
  
  // Remove SQL injection characters
  return input
    .replace(/'/g, "''")
    .replace(/\\"/g, '\\"')
    .replace(/;/g, "")
    .replace(/--/g, "")
    .replace(/\\/g, "\\\\");
}

/**
 * Validates and sanitizes an email address
 * 
 * @param email User provided email address
 * @returns Sanitized and validated email or empty string
 */
export function sanitizeEmail(email: string): string {
  if (!email) return "";
  
  // Basic email validation regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  const trimmedEmail = email.trim().toLowerCase();
  
  if (emailRegex.test(trimmedEmail)) {
    return trimmedEmail;
  }
  
  return "";
}

/**
 * Sanitizes a username to only allow safe characters
 * 
 * @param username User provided username
 * @returns Sanitized username
 */
export function sanitizeUsername(username: string): string {
  if (!username) return "";
  
  // Remove any character that isn't alphanumeric or underscore
  return username
    .trim()
    .replace(/[^a-zA-Z0-9_]/g, "")
    .substring(0, 30); // Limit length
}
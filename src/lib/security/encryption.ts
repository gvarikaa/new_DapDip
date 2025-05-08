/**
 * Utilities for encryption and hashing sensitive data
 */

import { randomBytes, createCipheriv, createDecipheriv, createHash, scrypt } from "crypto";
import { promisify } from "util";

// Promisify the scrypt function
const scryptAsync = promisify(scrypt);

// The encryption algorithm to use
const ALGORITHM = "aes-256-gcm";

// Secret key for encryption (stored in environment variables)
const SECRET_KEY = process.env.ENCRYPTION_SECRET || 
  (process.env.NODE_ENV === "production" 
    ? "" // Will throw an error in production if not set
    : "development_key_only_never_use_in_production");

if (process.env.NODE_ENV === "production" && !process.env.ENCRYPTION_SECRET) {
  console.error("ENCRYPTION_SECRET environment variable is not set in production!");
}

/**
 * Encrypts sensitive data using AES-256-GCM
 * 
 * @param text The plain text to encrypt
 * @returns Object containing encrypted data and metadata for decryption
 */
export async function encrypt(text: string): Promise<string> {
  if (!text) return "";
  
  try {
    // Generate a random 16-byte initialization vector
    const iv = randomBytes(16);
    
    // Generate a random salt
    const salt = randomBytes(16);
    
    // Derive a key using the salt
    const key = await scryptAsync(SECRET_KEY, salt, 32) as Buffer;
    
    // Create cipher
    const cipher = createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt the text
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    
    // Get the authentication tag
    const authTag = cipher.getAuthTag().toString("hex");
    
    // Combine all parts into a single string
    // Format: iv:salt:authTag:encryptedText
    return `${iv.toString("hex")}:${salt.toString("hex")}:${authTag}:${encrypted}`;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data");
  }
}

/**
 * Decrypts data that was encrypted with the encrypt function
 * 
 * @param encryptedData The encrypted data string from encrypt()
 * @returns The original plain text
 */
export async function decrypt(encryptedData: string): Promise<string> {
  if (!encryptedData) return "";
  
  try {
    // Split the encrypted data into its components
    const [ivHex, saltHex, authTagHex, encryptedText] = encryptedData.split(":");
    
    // Convert hexadecimal strings back to buffers
    const iv = Buffer.from(ivHex, "hex");
    const salt = Buffer.from(saltHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    
    // Derive the key using the same salt
    const key = await scryptAsync(SECRET_KEY, salt, 32) as Buffer;
    
    // Create decipher
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    
    // Set the authentication tag
    decipher.setAuthTag(authTag);
    
    // Decrypt the text
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data");
  }
}

/**
 * Creates a secure hash of the input, suitable for password storage
 * 
 * @param input Text to hash (like a password)
 * @returns Hashed result with salt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256")
    .update(password + salt)
    .digest("hex");
  
  return `${salt}:${hash}`;
}

/**
 * Verifies a password against a stored hash
 * 
 * @param password Plain text password to verify
 * @param storedHash Hash generated with hashPassword()
 * @returns True if password matches
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const [salt, hash] = storedHash.split(":");
  
  const calculatedHash = createHash("sha256")
    .update(password + salt)
    .digest("hex");
  
  return calculatedHash === hash;
}
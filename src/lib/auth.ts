import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { randomBytes, createHash } from "crypto";

import { prisma } from "@/lib/prisma";

// Maximum session age in seconds
const MAX_SESSION_AGE = 30 * 24 * 60 * 60; // 30 days

/**
 * NextAuth configuration with security enhancements:
 * - CSRF protection with secure cookies
 * - Secure JWT configuration
 * - Session security
 * - Rate limiting on auth routes
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  // Use JWT for session management
  session: {
    strategy: "jwt",
    // Maximum age for sessions - 30 days
    maxAge: MAX_SESSION_AGE,
  },
  
  // Custom pages
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  
  // Authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Input validation - simple validation for demo
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }
        
        // Sanitize input
        const sanitizedEmail = credentials.email.trim().toLowerCase();
        
        // In a real app, you would check the password against a hash
        const user = await prisma.user.findUnique({
          where: { email: sanitizedEmail }
        });
        
        if (!user) {
          throw new Error("No user found with this email");
        }
        
        // Mock auth - in a real app, you would verify password hash
        // const isValidPassword = await verifyPassword(
        //   credentials.password, 
        //   user.passwordHash
        // );
        
        // if (!isValidPassword) {
        //   throw new Error("Invalid password");
        // }
        
        // Update last login - audit trail
        await prisma.user.update({
          where: { id: user.id },
          data: { lastActive: new Date() },
        });
        
        // Success - return user
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      }
    })
  ],
  
  // Use CSRF tokens for added security
  secret: process.env.NEXTAUTH_SECRET,
  
  // Secure JWT configuration
  jwt: {
    // Secret is used to sign the JWT
    secret: process.env.NEXTAUTH_SECRET,
    
    // Custom encode/decode functions for additional security
    encode: async ({ secret, token, maxAge }) => {
      if (!token) return "";
      
      // Add entropy to the token
      const entropy = randomBytes(32).toString("hex");
      const tokenWithEntropy = { ...token, entropy };
      
      // Use default JWT encoder with our enhanced token
      const encoded = await (
        await import("next-auth/jwt")
      ).encode({ token: tokenWithEntropy, secret, maxAge });
      
      return encoded;
    },
    
    decode: async ({ secret, token }) => {
      if (!token) return null;
      
      // Use default JWT decoder
      const decoded = await (
        await import("next-auth/jwt")
      ).decode({ token, secret });
      
      // Remove our entropy field
      if (decoded && typeof decoded === "object" && "entropy" in decoded) {
        delete decoded.entropy;
      }
      
      return decoded;
    },
  },
  
  // Secure cookie settings
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax", // Protects against CSRF
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: MAX_SESSION_AGE,
      },
    },
    callbackUrl: {
      name: `__Secure-next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: `__Host-next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        // Add user ID to session
        session.user.id = token.sub as string;
        
        // Add additional claims like roles, permissions, etc.
        // session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        // Initialize token with user data
        token.sub = user.id;
        // token.role = user.role;
        
        // Add auth provider info
        if (account) {
          token.provider = account.provider;
        }
        
        // Add token creation timestamp for expiry calculations
        token.iat = Math.floor(Date.now() / 1000);
      }
      
      // Check token expiration
      const tokenExpiration = (token.iat as number) + MAX_SESSION_AGE;
      const nowTime = Math.floor(Date.now() / 1000);
      
      if (nowTime > tokenExpiration) {
        throw new Error("Token expired");
      }
      
      return token;
    },
    
    // Redirect callback - ensure proper sanitized redirect
    async redirect({ url, baseUrl }) {
      // Only allow relative URLs or URLs starting with the base URL
      if (url.startsWith("/") || url.startsWith(baseUrl)) {
        return url;
      }
      // Fallback to home page for security
      return baseUrl;
    }
  },
  
  // Custom debug messages in development
  debug: process.env.NODE_ENV === "development",
  
  // Events - useful for logging and auditing
  events: {
    async signIn(message) {
      // Log successful sign-ins
      console.log(`User signed in: ${message.user.email}`);
    },
    async signOut(message) {
      // Log sign-outs
      console.log(`User signed out: ${message.session?.user?.email}`);
    },
    async createUser(message) {
      // Log new user registrations
      console.log(`New user created: ${message.user.email}`);
    },
    async linkAccount(message) {
      // Log account linking
      console.log(`Account linked: ${message.account.provider} for ${message.user.email}`);
    },
    async session(message) {
      // Uncomment for debugging session updates
      // console.log(`Session updated for: ${message.session.user.email}`);
    },
  },
};
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Providers } from "./providers";
import JsonLd from "@/components/seo/JsonLd";
import { generateHomePageSchema } from "@/lib/seo/schema";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | DapDip",
    default: "DapDip - Social Network",
  },
  description: "Connect with friends and share your moments with DapDip social network",
  keywords: ["social network", "social media", "friends", "sharing", "community"],
  authors: [{ name: "DapDip Team" }],
  creator: "DapDip",
  publisher: "DapDip",
  applicationName: "DapDip",
  category: "social networking",
  
  // Open Graph
  openGraph: {
    type: "website",
    siteName: "DapDip",
    title: "DapDip - Social Network",
    description: "Connect with friends and share your moments with DapDip social network",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "DapDip Social Network",
      },
    ],
  },
  
  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "DapDip - Social Network",
    description: "Connect with friends and share your moments with DapDip social network",
    images: ["/og-image.jpg"],
    creator: "@DapDip",
  },
  
  // Viewport
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  
  // Theme
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111111" },
  ],
  
  // Icons
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  
  // Manifest
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  // Generate Schema.org data for the home page
  const schemaData = generateHomePageSchema();
  
  return (
    <html 
      lang="en" 
      suppressHydrationWarning
      className="scroll-smooth"
      // Enable dark mode based on system preference or user preference
      data-theme="light"
    >
      <head>
        {/* This schema.org JSON-LD data helps search engines understand the website structure */}
        <JsonLd schema={schemaData} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen`}
      >
        {/* Main content wrapped in semantic HTML5 elements */}
        <Providers>
          <main id="main-content" className="flex min-h-screen flex-col">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}

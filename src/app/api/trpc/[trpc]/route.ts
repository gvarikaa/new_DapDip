import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { NextRequest } from "next/server";

import { appRouter } from "@/lib/api/trpc/root";
import { createTRPCContext } from "@/lib/api/trpc/trpc";

// Enable Edge Runtime for better performance
export const runtime = "edge";

/**
 * TRPC request handler with optimizations:
 * - Uses Edge Runtime for faster cold starts and lower latency
 * - Implements proper error handling
 * - Sets appropriate headers
 */
const handler = async (request: NextRequest) => {
  // For preflight requests - CORS support
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400", // 24 hours
      },
    });
  }

  try {
    const response = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req: request,
      router: appRouter,
      createContext: () => createTRPCContext({
        req: request,
        res: Response,
      }),
      onError({ error, path }) {
        console.error(`❌ tRPC error on '${path}':`, error);
      },
    });

    // Add CORS headers to the response
    const corsHeaders = new Headers(response.headers);
    corsHeaders.set("Access-Control-Allow-Origin", "*");
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("TRPC Error:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
};

export { handler as GET, handler as POST };
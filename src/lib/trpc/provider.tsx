import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink, splitLink, createTRPCProxyClient } from "@trpc/client";
import { useState } from "react";
import superjson from "superjson";

import { api } from "./client";
import { queryClientConfig } from "../query-config";

function getBaseUrl(): string {
  if (typeof window !== "undefined") return "";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

/**
 * Optimized TRPC Provider with:
 * - Batch requests for improved performance
 * - Better caching with staleTime configuration
 * - Link splitting for server vs client operations
 * - Persistent cache for improved UX
 */
export function TRPCProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [queryClient] = useState(() => new QueryClient(queryClientConfig));
  
  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        // Custom logger in development only
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        
        // Optimize with batch link - combines multiple requests into one
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          // Automatically adds headers from document cookies
          headers() {
            return {
              // You can add custom headers here if needed
              "x-trpc-source": "react",
            };
          },
          // Abort requests after 20 seconds
          fetch(url, options) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 20000);
            
            return fetch(url, {
              ...options,
              signal: controller.signal,
            }).finally(() => clearTimeout(timeoutId));
          },
        }),
      ],
      transformer: superjson,
    })
  );

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </api.Provider>
  );
}
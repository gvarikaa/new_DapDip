'use client';

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { TRPCProvider } from "@/lib/trpc/provider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "sonner";

export function Providers({ children }: { children: ReactNode }): JSX.Element {
  return (
    <SessionProvider>
      <TRPCProvider>
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
          <ThemeProvider>
            <Toaster position="bottom-right" />
            {children}
          </ThemeProvider>
        </NextThemesProvider>
      </TRPCProvider>
    </SessionProvider>
  );
}
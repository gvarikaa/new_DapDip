'use client';

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/lib/api/trpc/root";

export const api = createTRPCReact<AppRouter>();
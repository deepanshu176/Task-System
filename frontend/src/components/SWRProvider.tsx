"use client";

import { SWRConfig } from "swr";
import api from "@/lib/api";

/**
 * GLOBAL SWR CLIENT PROVIDER
 * 
 * Optimized for performance:
 * 1. 10s deduping interval to prevent redundant DB queries.
 * 2. Disabled focus/reconnect revalidation to lower MongoDB connection count.
 * 3. Unified fetcher using the centralized axios instance.
 */
export const SWRProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SWRConfig 
      value={{
        fetcher: (url: string) => api.get(url).then(res => res.data),
        dedupingInterval: 10000,
        revalidateOnFocus: false,
        revalidateOnReconnect: false
      }}
    >
      {children}
    </SWRConfig>
  );
};

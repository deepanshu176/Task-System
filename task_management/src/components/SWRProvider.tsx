"use client";

import { SWRConfig } from "swr";
import api from "@/lib/api";

/**
 * GLOBAL SWR CLIENT PROVIDER
 * 
 * Optimized for responsive dashboard updates.
 * 3. Unified fetcher using the centralized axios instance.
 */
export const SWRProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SWRConfig 
      value={{
        fetcher: (url: string) => api.get(url).then(res => res.data),
        dedupingInterval: 2000,
        revalidateOnFocus: true,
        revalidateOnReconnect: true
      }}
    >
      {children}
    </SWRConfig>
  );
};

"use client";

import { QueryClient, QueryClientProvider, MutationCache } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/lib/toast";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();
  
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000 },
        },
        mutationCache: new MutationCache({
          onError: (error: unknown) => {
            const maybeAxios = error as { response?: { data?: { message?: string } } };
            showToast(maybeAxios?.response?.data?.message ?? "오류가 발생했습니다.", "error");
          },
        }),
      })
  );
  return (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

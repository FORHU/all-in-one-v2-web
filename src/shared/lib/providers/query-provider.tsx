"use client";

import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { toast } from "sonner";
import { routeError } from "@/shared/errors/error-router";
import { getRetryCount } from "@/shared/errors/retry-policy";
import { logError } from "@/shared/errors/use-error-telemetry";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [client] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            logError(error);
            const result = routeError(error);

            if (result.toast && !query.meta?.suppressErrorToast) {
              toast.error(result.toast);
            }

            if (result.action === "logout") {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("auth:unauthorized"));
              }
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            logError(error);
            const result = routeError(error);

            if (result.toast && !mutation.meta?.suppressErrorToast) {
              toast.error(result.toast);
            }

            if (result.action === "logout") {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("auth:unauthorized"));
              }
            }
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
            retry: (count, error) => count < getRetryCount(error),
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

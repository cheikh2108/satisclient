'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useState } from 'react';
import { ToastProvider } from '@/components/ui/toast';

export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient inside component to avoid sharing between requests
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,       // données fraîches pendant 1 minute
            gcTime: 5 * 60 * 1000,      // garder en cache 5 minutes
            retry: 1,                    // 1 retry max
            refetchOnWindowFocus: false, // pas de refetch au focus fenêtre
            refetchOnMount: true,
          },
          mutations: {
            retry: 0, // jamais de retry sur les mutations
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange={false}
        enableColorScheme={false}
        storageKey="satisclient-theme"
      >
        <ToastProvider>
          {children}
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

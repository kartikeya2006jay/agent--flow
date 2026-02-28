'use client'

import { QueryClient, QueryClientProvider as TanStackQueryProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { config } from '@/lib/config'

interface Props {
  children: ReactNode
}

export function QueryProvider({ children }: Props) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: config.features.pollingIntervalMs,
            retry: 1,
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  )

  return (
    <TanStackQueryProvider client={queryClient}>
      {children}
    </TanStackQueryProvider>
  )
}

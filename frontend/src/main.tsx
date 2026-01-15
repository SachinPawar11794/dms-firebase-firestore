import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Don't refetch on mount if data exists
      retry: (failureCount, error: any) => {
        // Don't retry on 404 or 401 errors (user not authenticated)
        if (error?.response?.status === 404 || error?.response?.status === 401) {
          return false;
        }
        // Retry once for other errors
        return failureCount < 1;
      },
      // Don't throw errors for 404/401 when user is not authenticated
      throwOnError: (error: any) => {
        // Only throw if it's not a 404/401 (authentication) error
        return error?.response?.status !== 404 && error?.response?.status !== 401;
      },
      // Cancel queries when component unmounts
      gcTime: 5 * 60 * 1000, // Keep cache for 5 minutes (formerly cacheTime)
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)

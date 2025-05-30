
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { ThemeProvider } from "@/contexts/ThemeContext"
import { AuthProvider } from '@/hooks/useAuth'
import { Toaster } from "@/components/ui/toaster"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a new query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Disable React 18 concurrent mode warning
// @ts-ignore - these methods are present but TypeScript doesn't recognize them
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

// Remove or disable css transitions while the page loads for a smoother first paint
document.getElementById('splash-spinner')?.remove();
document.getElementById('app-loader')?.remove();
document.getElementById('global-spinner')?.remove();
document.getElementById('root-spinner')?.remove();
document.getElementById('splash-screen')?.remove();
document.getElementById('loading-screen')?.remove();
document.getElementById('initial-loader')?.remove();

root.render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="light">
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <App />
            <Toaster />
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);

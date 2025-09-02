// pages/_app.tsx
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "@/contexts/AuthContext";
import { BrandProvider } from "@/contexts/BrandContext";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Elements } from "@stripe/react-stripe-js";
import getStripe from "@/lib/stripe";
import { useState, useEffect } from "react";
import { initializeMobile } from "@/lib/mobile";

export default function App({ Component, pageProps }: AppProps) {
  // Create a new QueryClient instance for each session
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: true, // Enable refetch when app regains focus
            staleTime: 30 * 1000, // 30 seconds for most data
            gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
            retry: 1,
            refetchOnMount: true, // Always refetch on mount
          },
        },
      })
  );

  // Initialize mobile-specific features
  useEffect(() => {
    initializeMobile();
  }, []);

  return (
    <Elements stripe={getStripe()}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrandProvider>
            <Component {...pageProps} />
            <Toaster position="top-center" />
          </BrandProvider>
        </AuthProvider>
        {process.env.NODE_ENV !== "production" && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </Elements>
  );
}

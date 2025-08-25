// components/layouts/MainLayout.tsx
import React, { ReactNode } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import MobileNavigation from "../MobileNavigation";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft } from "lucide-react";
import LoadingSpinner from "../ui/loading-spinner";

import { APP_NAME } from "@/lib/envs";

export type MainLayoutProps = {
  children: ReactNode;
  title?: string;
  description?: string;
  showNavigation?: boolean;
  padBottom?: boolean;
  showBackButton?: boolean;
  headerTitle?: string;
  loading?: boolean;
};

export default function MainLayout({
  children,
  title = APP_NAME,
  description = "Book your fitness classes easily",
  showNavigation = true,
  padBottom = true,
  showBackButton = false,
  headerTitle,
  loading = false,
}: MainLayoutProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </Head>

      <div className="min-h-screen bg-background">
        {/* Page Header */}
        {(showBackButton || headerTitle) && (
          <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
            <div className="flex items-center h-14 px-4">
              {showBackButton && (
                <button
                  className="mr-3 rounded-full w-8 h-8 flex items-center justify-center hover:bg-accent"
                  onClick={() => router.back()}
                >
                  <ChevronLeft size={24} />
                </button>
              )}
              {headerTitle && (
                <h1 className="font-semibold truncate">{headerTitle}</h1>
              )}
            </div>
          </header>
        )}

        <main
          className={`px-4 py-5 ${padBottom && showNavigation ? "pb-24" : ""}`}
        >
          {loading ? (
            <div className="flex justify-center items-center min-h-[50vh]">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            children
          )}
        </main>

        {isAuthenticated && showNavigation && <MobileNavigation />}
      </div>
    </>
  );
}

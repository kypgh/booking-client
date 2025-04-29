// components/layouts/BrandLayout.tsx
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import MainLayout, { MainLayoutProps } from "./MainLayout";
import { useBrand } from "@/contexts/BrandContext";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useAuth } from "@/contexts/AuthContext";

// Extend from MainLayoutProps to ensure compatibility
interface BrandLayoutProps extends Omit<MainLayoutProps, "loading"> {
  requireAuth?: boolean;
  loading?: boolean;
}

export default function BrandLayout({
  children,
  title,
  headerTitle,
  description,
  showNavigation = true,
  padBottom = true,
  showBackButton = false,
  loading = false,
  requireAuth = true,
}: BrandLayoutProps) {
  const { activeBrandId, isLoading: brandLoading } = useBrand();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're not on the login page and auth is required
    const isLoginPage = router.pathname.includes("/login");

    if (!authLoading && requireAuth && !isAuthenticated && !isLoginPage) {
      router.push("/login");
      return;
    }

    // Only redirect if we need a brand and don't have one
    if (!brandLoading && !activeBrandId && requireAuth && !isLoginPage) {
      // If authenticated but no brand, go to main page
      if (isAuthenticated) {
        router.push("/");
      }
    }
  }, [
    activeBrandId,
    brandLoading,
    isAuthenticated,
    authLoading,
    requireAuth,
    router,
  ]);

  const isContentLoading =
    loading ||
    (requireAuth && (authLoading || (brandLoading && !activeBrandId)));

  // Pass all the props properly to MainLayout
  return (
    <MainLayout
      title={title}
      description={description}
      showNavigation={showNavigation}
      padBottom={padBottom}
      showBackButton={showBackButton}
      headerTitle={headerTitle}
      loading={isContentLoading}
    >
      {isContentLoading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        children
      )}
    </MainLayout>
  );
}

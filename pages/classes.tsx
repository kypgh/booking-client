import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layouts/MainLayout";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function ClassesIndexPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeBrandId, setActiveBrandId] = useState<string | null>(null);

  // Get current brand ID from user
  useEffect(() => {
    if (user && user.brands && user.brands.length > 0) {
      // Depending on how your user.brands is structured
      const brandId =
        typeof user.brands[0] === "string"
          ? user.brands[0]
          : (user.brands[0] as any).id;

      setActiveBrandId(brandId);
    }
  }, [user]);

  // Redirect to dynamic page when we have a brandId
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (activeBrandId) {
        router.push(`/classes/${activeBrandId}`);
      }
    }
  }, [isAuthenticated, authLoading, activeBrandId, router]);

  return (
    <MainLayout title="Classes | FitBook" loading={true}>
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    </MainLayout>
  );
}

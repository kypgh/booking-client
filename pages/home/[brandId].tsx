import { useEffect } from "react";
import { useRouter } from "next/router";
import MainLayout from "@/components/layouts/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getBrandInfo } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Package, List, User } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function HomePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Get brand ID from router query parameters
  const { brandId } = router.query;

  // Fetch brand information
  const {
    data: brandData,
    isLoading: brandLoading,
    error: brandError,
  } = getBrandInfo(brandId as string);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // If still loading or not authenticated, show loading
  if (authLoading || !isAuthenticated || brandLoading) {
    return (
      <MainLayout title="Loading" showNavigation={false}>
        <div className="flex items-center justify-center h-screen">
          <LoadingSpinner size="md" />
        </div>
      </MainLayout>
    );
  }

  // If brand not found, show error
  if (brandError || !brandData) {
    return (
      <MainLayout title="Brand Not Found" showNavigation={false}>
        <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
          <h1 className="text-2xl font-bold mb-2">Brand Not Found</h1>
          <p className="text-muted-foreground mb-4">
            We couldn't find the requested brand information.
          </p>
          <Button onClick={() => router.push("/login")}>Return to Login</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`${brandData.name} | FitBook`}>
      {/* Welcome Section */}
      <section className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Welcome to {brandData.name}</h1>

        {brandData.description && (
          <div className="mt-2 text-muted-foreground">
            {brandData.description}
          </div>
        )}
      </section>

      {/* Brand Information */}
      {brandData.address && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Location & Contact</h2>
          <Card>
            <CardContent className="p-4">
              <div className="mb-3">
                <p className="font-medium">Address:</p>
                <p className="text-sm text-muted-foreground">
                  {brandData.address.street}, {brandData.address.city},{" "}
                  {brandData.address.state} {brandData.address.zip}
                </p>
              </div>

              {brandData.contact && (
                <div className="space-y-1 text-sm">
                  {brandData.contact.phone && (
                    <p className="flex items-center">
                      <span className="text-muted-foreground mr-2">Phone:</span>
                      <a
                        href={`tel:${brandData.contact.phone}`}
                        className="text-primary"
                      >
                        {brandData.contact.phone}
                      </a>
                    </p>
                  )}
                  {brandData.contact.email && (
                    <p className="flex items-center">
                      <span className="text-muted-foreground mr-2">Email:</span>
                      <a
                        href={`mailto:${brandData.contact.email}`}
                        className="text-primary"
                      >
                        {brandData.contact.email}
                      </a>
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-20 flex flex-col justify-center"
            onClick={() => router.push("/classes")}
          >
            <List className="h-5 w-5 mb-2" />
            Browse Classes
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col justify-center"
            onClick={() => router.push("/schedule")}
          >
            <Calendar className="h-5 w-5 mb-2" />
            Book Class
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col justify-center"
            onClick={() => router.push("/packages")}
          >
            <Package className="h-5 w-5 mb-2" />
            View Packages
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col justify-center"
            onClick={() => router.push("/profile")}
          >
            <User className="h-5 w-5 mb-2" />
            My Profile
          </Button>
        </div>
      </section>

      {/* Hours of Operation (if available) */}
      {brandData.hours && (
        <section className="mt-8 pt-6 border-t border-border">
          <h2 className="text-lg font-semibold mb-3">Hours of Operation</h2>
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2 text-sm">
                {Object.entries(brandData.hours).map(([day, hours]: any) => (
                  <div key={day} className="flex justify-between">
                    <span className="font-medium">{day}:</span>
                    <span>{hours}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* About Section (if available) */}
      {brandData.about && (
        <section className="mt-8 pt-6 border-t border-border">
          <h2 className="text-lg font-semibold mb-3">About Us</h2>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">
                {brandData.about}
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </MainLayout>
  );
}

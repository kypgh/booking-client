import { useEffect } from "react";
import { useRouter } from "next/router";
import MainLayout from "@/components/layouts/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User } from "lucide-react";

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // If still loading or not authenticated, show loading
  if (isLoading || !isAuthenticated) {
    return (
      <MainLayout title="Loading" showNavigation={false}>
        <div className="flex items-center justify-center h-screen">
          <p>Loading...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Home | FitBook">
      {/* Welcome Section */}
      <section className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          Hello, {user?.name || "there"}!
        </h1>
        <p className="text-muted-foreground">
          Welcome back to your fitness journey
        </p>
      </section>

      {/* Today's Classes Section */}
      <section className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Today's Classes</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/classes")}
          >
            View All
          </Button>
        </div>

        <div className="space-y-3">
          {/* Sample classes - would be replaced with real data */}
          {[1, 2].map((_, i) => (
            <Card
              key={i}
              className="cursor-pointer hover:border-primary/50 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      {i === 0 ? "Yoga Flow" : "HIIT Training"}
                    </h3>
                    <div className="text-sm text-muted-foreground mt-1 flex items-center">
                      <Clock size={14} className="mr-1" />
                      <span>
                        {i === 0 ? "10:00 AM - 11:00 AM" : "6:00 PM - 7:00 PM"}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 flex items-center">
                      <User size={14} className="mr-1" />
                      <span>{i === 0 ? "Sarah Johnson" : "Mike Peters"}</span>
                    </div>
                  </div>
                  <Button size="sm">
                    {i === 0 ? "Book" : "Join Waitlist"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Empty state */}
          {false && (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  No classes scheduled for today
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push("/classes")}
                >
                  Find Classes
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Upcoming Bookings Section */}
      <section className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Bookings</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/bookings")}
          >
            View All
          </Button>
        </div>

        <div className="space-y-3">
          {/* Sample bookings - would be replaced with real data */}
          <Card className="cursor-pointer hover:border-primary/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">Pilates</h3>
                  <div className="text-sm text-muted-foreground mt-1 flex items-center">
                    <Calendar size={14} className="mr-1" />
                    <span>Tomorrow, 9:00 AM</span>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Empty state */}
          {false && (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No upcoming bookings</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push("/classes")}
                >
                  Book a Class
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-20 flex flex-col justify-center"
            onClick={() => router.push("/classes")}
          >
            <Calendar className="h-5 w-5 mb-2" />
            Book Class
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col justify-center"
            onClick={() => router.push("/profile/packages")}
          >
            <User className="h-5 w-5 mb-2" />
            View Packages
          </Button>
        </div>
      </section>
    </MainLayout>
  );
}

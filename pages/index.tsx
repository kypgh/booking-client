// pages/index.tsx
import React from "react";
import { useRouter } from "next/router";
import BrandLayout from "@/components/layouts/BrandLayout";
import { useBrand } from "@/contexts/BrandContext";
import {
  useActiveBookings,
  useAvailableSessions,
  getBrandInfo,
} from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, User, Package, List } from "lucide-react";
import { format, parseISO, isSameDay } from "date-fns";

const today = new Date();
const tomorrow = new Date();

export default function HomePage() {
  const router = useRouter();
  const { activeBrandId, activeBrand } = useBrand();

  // Get today and tomorrow for session filtering

  tomorrow.setDate(today.getDate() + 1);

  // Fetch brand information if needed (may be redundant if activeBrand has all data)
  const { data: brandData, isLoading: brandLoading } =
    getBrandInfo(activeBrandId);

  // Fetch user's active bookings
  const { data: activeBookings, isLoading: bookingsLoading } =
    useActiveBookings();

  // Fetch today's sessions with the active brand ID from context
  const { data: sessionsData, isLoading: sessionsLoading } =
    useAvailableSessions({
      brandId: activeBrandId || undefined,
      startDate: today.toISOString(),
      endDate: tomorrow.toISOString(),
    });

  // Filter sessions for today only
  const todaySessions =
    sessionsData?.sessions?.filter((session) => {
      const sessionDate = parseISO(session.dateTime);
      return isSameDay(sessionDate, today);
    }) || [];

  // Get upcoming bookings (limiting to first few)
  const upcomingBookings =
    activeBookings
      ?.filter(
        (booking) =>
          booking.status === "confirmed" || booking.status === "pending"
      )
      .slice(0, 3) || [];

  return (
    <BrandLayout
      title={brandData ? `${brandData.name} | FitBook` : "Home | FitBook"}
    >
      {/* Welcome Section */}
      <section className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          Hello, {activeBrand?.name ? `${activeBrand.name} member` : "there"}!
        </h1>
        <p className="text-muted-foreground">
          Welcome to {brandData ? brandData.name : "FitBook"}
        </p>

        {brandData?.description && (
          <div className="mt-4 p-4 bg-accent/30 rounded-lg text-sm">
            {brandData.description}
          </div>
        )}
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
          {sessionsLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            </div>
          ) : todaySessions.length > 0 ? (
            todaySessions.map((session) => (
              <Card
                key={session.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => router.push(`/session/${session.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{session.class.name}</h3>
                      <div className="text-sm text-muted-foreground mt-1 flex items-center">
                        <Clock size={14} className="mr-1" />
                        <span>
                          {format(parseISO(session.dateTime), "h:mm a")}
                        </span>
                      </div>

                    </div>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/book/${session.id}`);
                      }}
                    >
                      {session.availableSpots > 0 ? "Book" : "Waitlist"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  No classes scheduled for today
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push("/schedule")}
                >
                  View Schedule
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
          {bookingsLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            </div>
          ) : upcomingBookings.length > 0 ? (
            upcomingBookings.map((booking: any) => (
              <Card
                key={booking._id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => router.push(`/session/${booking.session._id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">
                        {booking.session.class?.name || "Class"}
                      </h3>
                      <div className="text-sm text-muted-foreground mt-1 flex items-center">
                        <Calendar size={14} className="mr-1" />
                        <span>
                          {format(
                            parseISO(booking.session.dateTime),
                            "EEE, MMM d, h:mm a"
                          )}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/bookings`);
                      }}
                    >
                      Manage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No upcoming bookings</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push("/schedule")}
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

      {/* Facility Information (if available) */}
      {brandData?.address && (
        <section className="mt-8 pt-6 border-t border-border">
          <h2 className="text-lg font-semibold mb-3">Location Information</h2>
          <Card>
            <CardContent className="p-4">
              <p className="font-medium">{brandData.name}</p>
              <p className="text-sm text-muted-foreground">
                {brandData.address.street}, {brandData.address.city},{" "}
                {brandData.address.state} {brandData.address.zip}
              </p>
              {brandData.contact && (
                <div className="mt-2 pt-2 border-t border-border text-sm">
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
                  {brandData.email && (
                    <p className="flex items-center">
                      <span className="text-muted-foreground mr-2">Email:</span>

                      <a
                        href={`mailto:${brandData.email}`}
                        className="text-primary"
                      >
                        {brandData.email}
                      </a>
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      )}
    </BrandLayout>
  );
}

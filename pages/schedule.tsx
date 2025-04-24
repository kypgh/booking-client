import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  format,
  addDays,
  startOfWeek,
  parseISO,
  isToday,
  isBefore,
  isEqual,
} from "date-fns";
import { ChevronLeft, ChevronRight, Clock, User } from "lucide-react";
import MainLayout from "@/components/layouts/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useAvailableSessions } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/loading-spinner";
import BookSessionDialog from "@/components/BookSessionDialog";

export default function SchedulePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeBrandId, setActiveBrandId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);

  // Calculate start and end dates for the week view
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Week starts on Monday
  const weekDates = [...Array(7)].map((_, i) => addDays(weekStart, i));

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

  // Fetch available sessions for the current week
  const startDate = weekStart;
  const endDate = addDays(weekStart, 6);

  const {
    data: sessionsData,
    isLoading: sessionsLoading,
    error: sessionsError,
  } = useAvailableSessions({
    brandId: activeBrandId || undefined,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });

  // If not authenticated, redirect to login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Navigate to previous week
  const goToPreviousWeek = () => {
    setCurrentDate((prev) => addDays(prev, -7));
    setSelectedDate(null);
  };

  // Navigate to next week
  const goToNextWeek = () => {
    setCurrentDate((prev) => addDays(prev, 7));
    setSelectedDate(null);
  };

  // Select a date
  const handleDateSelect = (date: Date) => {
    setSelectedDate(selectedDate && isEqual(selectedDate, date) ? null : date);
  };

  // Handle booking a session
  const handleBookSession = (session: any) => {
    setSelectedSession(session);
    setIsBookingDialogOpen(true);
  };

  const handleOpenSession = (sessionId: string) => {
    router.push(`/session/${sessionId}`);
  };

  // Get sessions for selected date
  const getSessionsForDate = (date: Date) => {
    if (!sessionsData || !sessionsData.groupedByDate) return [];

    const dateStr = format(date, "yyyy-MM-dd");
    return sessionsData.groupedByDate[dateStr] || [];
  };

  const isLoading = authLoading || sessionsLoading || !activeBrandId;

  if (isLoading) {
    return (
      <MainLayout title="Schedule | FitBook" loading={true}>
        <LoadingSpinner />
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Weekly Schedule | FitBook" headerTitle="Weekly Schedule">
      <div className="flex flex-col h-full">
        {/* Week Navigation */}
        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-medium">
            {format(weekStart, "MMM d")} -{" "}
            {format(addDays(weekStart, 6), "MMM d, yyyy")}
          </h2>
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Week Days */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {weekDates.map((date) => {
            const dayHasSessions = getSessionsForDate(date).length > 0;
            const isSelected = selectedDate && isEqual(selectedDate, date);
            const isPastDate = isBefore(date, new Date()) && !isToday(date);

            return (
              <Button
                key={date.toISOString()}
                variant={
                  isSelected
                    ? "default"
                    : isToday(date)
                    ? "secondary"
                    : "outline"
                }
                className={`flex flex-col h-16 p-1 ${
                  isPastDate ? "opacity-50" : ""
                }`}
                disabled={isPastDate || !dayHasSessions}
                onClick={() => handleDateSelect(date)}
              >
                <span className="text-xs font-medium">
                  {format(date, "EEE")}
                </span>
                <span className={`text-lg ${isToday(date) ? "font-bold" : ""}`}>
                  {format(date, "d")}
                </span>
                {dayHasSessions && (
                  <div className="mt-1 w-1 h-1 rounded-full bg-primary"></div>
                )}
              </Button>
            );
          })}
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-auto">
          {sessionsError ? (
            <div className="text-center py-10">
              <p className="text-destructive">Error loading sessions</p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => router.reload()}
              >
                Retry
              </Button>
            </div>
          ) : selectedDate ? (
            <div className="space-y-3">
              <h3 className="font-medium">
                {format(selectedDate, "EEEE, MMMM d")}
              </h3>

              {getSessionsForDate(selectedDate).length === 0 ? (
                <p className="text-center py-10 text-muted-foreground">
                  No sessions available for this day
                </p>
              ) : (
                getSessionsForDate(selectedDate).map((session) => (
                  <Card
                    key={session.id}
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => handleOpenSession(session.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{session.class.name}</h4>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <Clock size={14} className="mr-1" />
                            <span>
                              {format(parseISO(session.dateTime), "h:mm a")} •{" "}
                              {session.duration}min
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <User size={14} className="mr-1" />
                            <span>{session.class.instructor.name}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <Badge
                            variant={
                              session.availableSpots > 3
                                ? "outline"
                                : "secondary"
                            }
                          >
                            {session.availableSpots} spots
                          </Badge>
                          <Button
                            size="sm"
                            className="mt-2"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card click
                              handleBookSession(session);
                            }}
                          >
                            Book
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-60">
              <p className="text-muted-foreground">
                Select a day to view available sessions
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Dialog */}
      {selectedSession && (
        <BookSessionDialog
          isOpen={isBookingDialogOpen}
          onClose={() => setIsBookingDialogOpen(false)}
          session={selectedSession}
        />
      )}
    </MainLayout>
  );
}

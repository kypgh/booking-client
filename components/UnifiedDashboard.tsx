// components/UnifiedDashboard.tsx
import React, { useState } from "react";
import { useRouter } from "next/router";
import {
  format,
  addDays,
  startOfWeek,
  parseISO,
  isToday,
  isBefore,
  isEqual,
  isPast,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  Calendar,
  CheckCircle,
} from "lucide-react";

// Hooks and Context
import { useBrand } from "@/contexts/BrandContext";
import {
  useClassList,
  useAvailableSessions,
  getBrandInfo,
  ClassData,
  Session,
} from "@/hooks/useApi";
import { useScheduleState } from "@/hooks/useScheduleState";
import { useSessionBookingStatus } from "@/hooks/useSessionBookingStatus";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/loading-spinner";
import BookSessionDialog from "@/components/BookSessionDialog";

// Types
interface UnifiedDashboardProps {
  className?: string;
}

export default function UnifiedDashboard({ className = "" }: UnifiedDashboardProps) {
  const router = useRouter();
  const { activeBrandId, activeBrand } = useBrand();
  
  // State for selected class and booking dialog
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  // Use our custom hook to persist state between navigations
  const { currentDate, selectedDate, setCurrentDate, setSelectedDate } =
    useScheduleState(activeBrandId);

  const { isSessionBooked, isLoading: bookingsLoading } =
    useSessionBookingStatus();

  // Fetch brand information
  const { data: brandData, isLoading: brandLoading } = getBrandInfo(activeBrandId);

  // Fetch classes
  const { data: classes, isLoading: classesLoading } = useClassList();

  // Calculate dates for week view
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Week starts on Monday
  const weekDates = [...Array(7)].map((_, i) => addDays(weekStart, i));

  // Fetch available sessions for the current week, filtered by selected class
  const startDate = weekStart;
  const endDate = addDays(weekStart, 6);

  const {
    data: sessionsData,
    isLoading: sessionsLoading,
    error: sessionsError,
  } = useAvailableSessions({
    brandId: activeBrandId as string,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    classId: selectedClassId || undefined, // Filter by selected class
  });

  // Navigate to previous/next week
  const goToPreviousWeek = () => {
    setCurrentDate(addDays(currentDate, -7));
  };

  const goToNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  // Select a date
  const handleDateSelect = (date: Date) => {
    setSelectedDate(selectedDate && isEqual(selectedDate, date) ? null : date);
  };

  // Handle class selection
  const handleClassSelect = (classId: string) => {
    // Handle "All Classes" selection (empty string) or toggle selection
    const newSelectedId = classId === "" ? null : (classId === selectedClassId ? null : classId);
    setSelectedClassId(newSelectedId);
    
    // Always auto-select today and navigate to current week to show sessions immediately
    const today = new Date();
    setCurrentDate(today); // Navigate to week containing today
    setSelectedDate(today); // Select today to show sessions immediately
  };

  // Handle booking a session
  const handleBookSession = (session: Session) => {
    setSelectedSession(session);
    setIsBookingDialogOpen(true);
  };

  // Get selected class details
  const selectedClass = classes?.find(c => c._id === selectedClassId);

  // Get systematic color based on class index (modular approach)
  const getClassColor = (index: number) => {
    const colorNumbers = [1, 2, 3, 4, 5, 6];
    const colorIndex = colorNumbers[index % colorNumbers.length];
    
    return {
      bg: `bg-color-${colorIndex}`,
      text: `text-color-${colorIndex}-foreground`,
      border: `border-color-${colorIndex}`,
      accent: `bg-color-${colorIndex}/10`,
      light: `bg-color-${colorIndex}-light/20`,
    };
  };

  // Get sessions for selected date
  const getSessionsForDate = (date: Date) => {
    if (!sessionsData || !sessionsData.groupedByDate) return [];

    const dateStr = format(date, "yyyy-MM-dd");
    const sessions = sessionsData.groupedByDate[dateStr] || [];

    // Filter out past sessions if the selected date is today
    if (isToday(date)) {
      const now = new Date();
      return sessions.filter((session) => {
        const sessionDateTime = parseISO(session.dateTime);
        return !isPast(sessionDateTime);
      });
    }

    return sessions;
  };

  // Count future sessions for a date (for the dots in the day selector)
  const countFutureSessionsForDate = (date: Date) => {
    if (!sessionsData || !sessionsData.groupedByDate) return 0;

    const dateStr = format(date, "yyyy-MM-dd");
    const sessions = sessionsData.groupedByDate[dateStr] || [];

    // If today, only count future sessions
    if (isToday(date)) {
      const now = new Date();
      return sessions.filter((session) => {
        const sessionDateTime = parseISO(session.dateTime);
        return !isPast(sessionDateTime);
      }).length;
    }

    return sessions.length;
  };

  if (brandLoading || classesLoading) {
    return (
      <div className={`flex justify-center items-center min-h-[50vh] ${className}`}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Brand Header with Gradient */}
      <section className="relative overflow-hidden rounded-xl gradient-primary p-6 text-white text-center">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-2">
            {brandData?.name || activeBrand?.name || "Welcome"}
          </h1>
          {brandData?.description && (
            <p className="text-white/90 text-sm">
              {brandData.description}
            </p>
          )}
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
      </section>

      {/* Class Selection Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {selectedClass ? `Schedule for ${selectedClass.name}` : "Select a Class"}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/classes")}
          >
            View Details
          </Button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
          {/* All Classes Option */}
          <Button
            key="all"
            variant={selectedClassId === null ? "default" : "outline"}
            size="sm"
            className="flex-shrink-0 whitespace-nowrap"
            onClick={() => handleClassSelect("")}
          >
            All Classes
          </Button>

          {/* Individual Classes */}
          {classes && classes.length > 0 ? (
            classes.map((classItem: ClassData, index: number) => {
              const colors = getClassColor(index);
              const isSelected = selectedClassId === classItem._id;
              
              return (
                <Button
                  key={classItem._id}
                  variant="outline"
                  size="sm"
                  className={`flex-shrink-0 whitespace-nowrap transition-all duration-200 ${
                    isSelected 
                      ? `${colors.bg} ${colors.text} border-transparent shadow-lg` 
                      : `${colors.light} ${colors.border} hover:${colors.bg} hover:${colors.text}`
                  }`}
                  onClick={() => handleClassSelect(classItem._id)}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{classItem.name}</span>
                    <div className={`flex items-center gap-1 text-xs ${isSelected ? 'text-white/80' : 'opacity-60'}`}>
                      <Clock size={10} />
                      {classItem.duration}min
                    </div>
                  </div>
                </Button>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground flex-1">
              <p>No classes available</p>
            </div>
          )}
        </div>

        {/* Selected Class Info - Always rendered to prevent height shifts */}
        <div className={`mt-4 p-4 rounded-lg min-h-[80px] flex items-center transition-all duration-300 ${
          selectedClass 
            ? `${getClassColor(classes?.findIndex(c => c._id === selectedClassId) || 0).light} border ${getClassColor(classes?.findIndex(c => c._id === selectedClassId) || 0).border}` 
            : 'bg-accent/20'
        }`}>
          {selectedClass ? (
            <div className="flex items-start justify-between w-full">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{selectedClass.name}</h3>
                  <div className={`w-3 h-3 rounded-full ${getClassColor(classes?.findIndex(c => c._id === selectedClassId) || 0).bg}`}></div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {selectedClass.description || "No description available."}
                </p>
                <div className="flex items-center gap-4 text-xs">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${getClassColor(classes?.findIndex(c => c._id === selectedClassId) || 0).light}`}>
                    <Clock size={12} />
                    <span className="font-medium">{selectedClass.duration} minutes</span>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${getClassColor(classes?.findIndex(c => c._id === selectedClassId) || 0).light}`}>
                    <Users size={12} />
                    <span className="font-medium">Max {selectedClass.capacity} people</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center w-full">
              <p className="text-sm text-muted-foreground">
                Select a specific class above to see details and available times
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Schedule Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {selectedClass 
              ? `Available Times - ${selectedClass.name}` 
              : selectedClassId === null 
                ? "All Class Schedules"
                : "Schedule"
            }
          </h2>
          {selectedClass && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedClassId(null)}
              className="text-muted-foreground"
            >
              Show All Classes
            </Button>
          )}
        </div>

        {/* Week Navigation */}
        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-base font-medium">
            {format(weekStart, "MMM d")} -{" "}
            {format(addDays(weekStart, 6), "MMM d, yyyy")}
          </h3>
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Week Days */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {weekDates.map((date) => {
            const futureSessions = countFutureSessionsForDate(date);
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
                disabled={isPastDate || futureSessions === 0}
                onClick={() => handleDateSelect(date)}
              >
                <span className="text-xs font-medium">
                  {format(date, "EEE")}
                </span>
                <span className={`text-lg ${isToday(date) ? "font-bold" : ""}`}>
                  {format(date, "d")}
                </span>
                {futureSessions > 0 && (
                  <div className="mt-1 w-1 h-1 rounded-full bg-primary"></div>
                )}
              </Button>
            );
          })}
        </div>

        {/* Sessions List */}
        <div className="min-h-[200px]">
          {sessionsError ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-2">Error loading sessions</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          ) : selectedDate ? (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">
                {format(selectedDate, "EEEE, MMMM d")}
              </h4>

              {sessionsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : getSessionsForDate(selectedDate).length === 0 ? (
                <p className="text-center py-8 text-muted-foreground text-sm">
                  {selectedClass 
                    ? `No ${selectedClass.name} sessions ${isToday(selectedDate) ? "available for today" : "on this day"}`
                    : isToday(selectedDate)
                      ? "No more sessions available for today"
                      : "No sessions available for this day"
                  }
                </p>
              ) : (
                getSessionsForDate(selectedDate).map((session) => {
                  const isBooked = isSessionBooked(session.id);

                  return (
                    <Card
                      key={session.id}
                      className={`cursor-pointer hover:border-primary/50 transition-colors ${
                        isBooked
                          ? "border-green-200 bg-green-50/30 dark:bg-green-950/10"
                          : ""
                      }`}
                      onClick={() => router.push(`/session/${session.id}`)}
                    >
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">
                              {session.class.name}
                            </h5>
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <Clock size={12} className="mr-1" />
                              <span>
                                {format(parseISO(session.dateTime), "h:mm a")} •{" "}
                                {session.duration}min
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge
                              variant={
                                session.availableSpots > 3
                                  ? "outline"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {session.availableSpots} spots
                            </Badge>

                            {isBooked ? (
                              <Badge
                                variant="default"
                                className="text-xs bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Booked
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                className="text-xs h-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBookSession(session);
                                }}
                              >
                                Book
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          ) : !selectedClassId && !selectedClass ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm mb-2">
                Select a class above to see its schedule
              </p>
              <p className="text-xs text-muted-foreground">
                Choose "All Classes" to see all available sessions
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">
                Select a day to view available sessions
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Booking Dialog */}
      {selectedSession && (
        <BookSessionDialog
          isOpen={isBookingDialogOpen}
          onClose={() => setIsBookingDialogOpen(false)}
          session={selectedSession}
          brandId={activeBrandId as string}
        />
      )}
    </div>
  );
}

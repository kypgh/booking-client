import React, { useState } from "react";
import { useRouter } from "next/router";
import { format, parseISO, isPast, isFuture, isToday, startOfMonth } from "date-fns";
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Filter,
  TrendingUp,
  Activity,
  BookOpen,
} from "lucide-react";
import MainLayout from "@/components/layouts/MainLayout";
import { useActiveBookings, useBookingHistory } from "@/hooks/useApi";
import {
  useCancelBooking,
  useCancelPackageBooking,
} from "@/hooks/useMutations";
import { toast } from "react-hot-toast";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import BookingsCalendar from "@/components/BookingsCalendar";
import LoadingSpinner from "@/components/ui/loading-spinner";

// Status badge component to maintain consistent styling
const StatusBadge = ({ status }: { status: string }) => {
  let className = "";
  let icon = null;

  switch (status) {
    case "confirmed":
      className = "bg-success text-success-foreground";
      icon = <CheckCircle className="mr-1 h-3 w-3" />;
      break;
    case "pending":
      className = "bg-warning text-warning-foreground";
      icon = <Clock className="mr-1 h-3 w-3" />;
      break;
    case "cancelled":
      className = "bg-destructive text-destructive-foreground";
      icon = <XCircle className="mr-1 h-3 w-3" />;
      break;
    case "completed":
      className = "bg-info text-info-foreground";
      icon = <CheckCircle className="mr-1 h-3 w-3" />;
      break;
    default:
      className = "bg-muted text-muted-foreground";
  }

  return (
    <Badge className={`flex items-center ml-2 ${className}`}>
      {icon}
      <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
    </Badge>
  );
};

export default function BookingsPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "confirmed" | "cancelled">("all");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [bookingType, setBookingType] = useState<"regular" | "package">("regular");

  // Fetch booking data
  const {
    data: activeBookings,
    isLoading: activeLoading,
    error: activeError,
  } = useActiveBookings();

  const {
    data: bookingHistory,
    isLoading: historyLoading,
    error: historyError,
  } = useBookingHistory();

  // Mutation hooks for cancellation
  const { mutate: cancelBooking, isPending: isCancelling } = useCancelBooking();
  const { mutate: cancelPackageBooking, isPending: isCancellingPackage } =
    useCancelPackageBooking();

  // Filter bookings based on status and date
  const pendingBookings =
    activeBookings?.filter((booking) => booking.status === "pending") || [];

  const upcomingBookings =
    activeBookings?.filter(
      (booking) =>
        booking.status === "confirmed" &&
        isFuture(parseISO(booking.session.dateTime))
    ) || [];

  const pastBookings =
    bookingHistory?.filter(
      (booking) =>
        isPast(parseISO(booking.session.dateTime)) ||
        booking.status === "cancelled" ||
        booking.status === "completed"
    ) || [];

  // Handle booking cancellation
  const handleOpenCancelDialog = (
    bookingId: string,
    type: "regular" | "package"
  ) => {
    setBookingToCancel(bookingId);
    setBookingType(type);
    setCancelDialogOpen(true);
  };

  const handleCancelBooking = () => {
    if (!bookingToCancel) return;

    if (bookingType === "regular") {
      cancelBooking(bookingToCancel, {
        onSuccess: () => {
          toast.success("Booking cancelled successfully");
          setCancelDialogOpen(false);
          setBookingToCancel(null);
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to cancel booking");
          setCancelDialogOpen(false);
        },
      });
    } else {
      cancelPackageBooking(
        { bookingId: bookingToCancel },
        {
          onSuccess: () => {
            toast.success("Booking cancelled successfully");
            setCancelDialogOpen(false);
            setBookingToCancel(null);
          },
          onError: (error: any) => {
            toast.error(error.message || "Failed to cancel booking");
            setCancelDialogOpen(false);
          },
        }
      );
    }
  };

  // Navigate to session details
  const viewSessionDetails = (sessionId: string) => {
    router.push(`/session/${sessionId}`);
  };

  // Render helper functions
  const renderBookingCard = (
    booking: any,
    showCancelButton: boolean = false
  ) => {
    const sessionDate = parseISO(booking.session.dateTime);
    const isPastSession = isPast(sessionDate);
    const isPackageBooking = booking.bookingType === "monthly";

    return (
      <Card
        key={booking._id}
        className={`${
          isPastSession ? "opacity-75" : ""
        } cursor-pointer hover:border-primary/30 transition-colors mb-4`}
        onClick={() => viewSessionDetails(booking.session._id)}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center">
                <h3 className="font-medium">
                  {booking.session.class?.name || "Class"}
                </h3>
                <StatusBadge status={booking.status} />
              </div>

              <div className="flex items-center text-sm text-muted-foreground mt-2">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{format(sessionDate, "EEEE, MMMM d, yyyy")}</span>
              </div>

              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Clock className="h-4 w-4 mr-1" />
                <span>
                  {format(sessionDate, "h:mm a")} • {booking.session.duration}{" "}
                  minutes
                </span>
              </div>



              {isPackageBooking && (
                <div className="mt-2 text-xs inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary">
                  <span>Package credit</span>
                </div>
              )}
            </div>

            {showCancelButton &&
              !isPastSession &&
              (booking.status === "confirmed" ||
                booking.status === "pending") && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenCancelDialog(
                      booking._id,
                      isPackageBooking ? "package" : "regular"
                    );
                  }}
                >
                  Cancel
                </Button>
              )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Helper functions
  const getFilteredBookings = () => {
    const activeBookingsArray = activeBookings || [];
    const historyBookingsArray = bookingHistory || [];
    
    // Combine and deduplicate bookings by _id
    const combinedBookings = [...activeBookingsArray];
    
    // Only add history bookings that aren't already in active bookings
    historyBookingsArray.forEach(historyBooking => {
      const isAlreadyInActive = activeBookingsArray.some(
        activeBooking => activeBooking._id === historyBooking._id
      );
      if (!isAlreadyInActive) {
        combinedBookings.push(historyBooking);
      }
    });
    
    if (filterStatus === "all") return combinedBookings;
    return combinedBookings.filter((booking) => booking.status === filterStatus);
  };

  const getBookingsForDate = (date: Date) => {
    return getFilteredBookings().filter((booking) =>
      format(parseISO(booking.session.dateTime), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );
  };

  if (activeLoading || historyLoading) {
    return (
      <MainLayout title="My Bookings | FitBook" headerTitle="Bookings">
        <div className="flex justify-center items-center min-h-[50vh]">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  if (activeError || historyError) {
    return (
      <MainLayout title="My Bookings | FitBook" headerTitle="Bookings">
        <div className="text-center py-20">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to load bookings</h2>
          <p className="text-muted-foreground mb-6">Please try again or contact support if the problem persists</p>
          <Button onClick={() => router.reload()}>
            Retry
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="My Bookings | FitBook" headerTitle="Bookings">
      <div className="max-w-6xl mx-auto space-y-6">
                {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-warning bg-gradient-to-r from-warning/5 to-background hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-warning/20 rounded-xl flex items-center justify-center">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-warning">{pendingBookings.length}</p>
                  <p className="text-xs text-muted-foreground font-medium">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-success bg-gradient-to-r from-success/5 to-background hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-success/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-success">{upcomingBookings.length}</p>
                  <p className="text-xs text-muted-foreground font-medium">Upcoming</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-info bg-gradient-to-r from-info/5 to-background hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-info/20 rounded-xl flex items-center justify-center">
                  <Activity className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-info">{pastBookings.length}</p>
                  <p className="text-xs text-muted-foreground font-medium">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-background hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{getFilteredBookings().length}</p>
                  <p className="text-xs text-muted-foreground font-medium">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Calendar Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <BookingsCalendar
                  bookings={getFilteredBookings()}
                  onDateSelect={setSelectedDate}
                  selectedDate={selectedDate}
                />
              </CardContent>
            </Card>
          </div>

          {/* Selected Date Details */}
          <div className="space-y-4">
            {/* Filter Controls */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filter by status</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "all", label: "All", count: getFilteredBookings().length },
                    { key: "pending", label: "Pending", count: pendingBookings.length },
                    { key: "confirmed", label: "Confirmed", count: upcomingBookings.length },
                    { key: "cancelled", label: "Past", count: pastBookings.length },
                  ].map((filter) => (
                    <Button
                      key={filter.key}
                      variant={filterStatus === filter.key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus(filter.key as typeof filterStatus)}
                      className="text-xs"
                    >
                      {filter.label}
                      {filter.count > 0 && (
                        <Badge variant="secondary" className="ml-1 text-xs px-1">
                          {filter.count}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Selected Date Sessions */}
            {selectedDate && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-medium">
                      {isToday(selectedDate) ? "Today" : format(selectedDate, "EEE, MMM d")}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {getBookingsForDate(selectedDate).length > 0 ? (
                      getBookingsForDate(selectedDate).map((booking) => (
                        <div
                          key={booking._id}
                          className="p-3 border border-border rounded-lg hover:bg-accent/30 transition-colors cursor-pointer"
                          onClick={() => router.push(`/session/${booking.session._id}`)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">
                                {booking.session.class?.name || "Class"}
                              </h4>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {format(parseISO(booking.session.dateTime), "h:mm a")}
                                </div>
                                <div>{booking.session.duration} min</div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <StatusBadge status={booking.status} />
                              {(booking.status === "confirmed" || booking.status === "pending") && 
                               !isPast(parseISO(booking.session.dateTime)) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenCancelDialog(
                                      booking._id,
                                      booking.bookingType === "monthly" ? "package" : "regular"
                                    );
                                  }}
                                  className="text-xs h-6 px-2 text-destructive hover:bg-destructive/10"
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No bookings for this date</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        {getFilteredBookings().length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-6">Start your fitness journey by booking your first class</p>
              <Button onClick={() => router.push("/")}>
                Browse Classes
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Cancel Booking Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
              {bookingType === "package" && (
                <p className="mt-2 text-primary">Your package credit will be returned to your account.</p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling || isCancellingPackage}>
              Keep Booking
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelBooking}
              disabled={isCancelling || isCancellingPackage}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling || isCancellingPackage ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Cancelling...
                </>
              ) : (
                "Yes, cancel booking"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}

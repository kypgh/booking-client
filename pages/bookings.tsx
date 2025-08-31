import React, { useState, useMemo } from "react";
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
  Search,
  List,
  CalendarDays,
  SortAsc,
  SortDesc,
  Eye,
  X,
  RefreshCcw,
} from "lucide-react";
import MainLayout from "@/components/layouts/MainLayout";
import { useActiveBookings, useBookingHistory } from "@/hooks/useApi";
import { useAutoRefresh, REFRESH_CONFIGS } from "@/hooks/useAutoRefresh";

import {
  useCancelBooking,
  useCancelPackageBooking,
} from "@/hooks/useMutations";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "@/lib/errorUtils";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BookingsCalendar from "@/components/BookingsCalendar";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { BookingSkeleton } from "@/components/ui/skeleton";

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
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "confirmed" | "cancelled" | "completed">("all");
  const [sortBy, setSortBy] = useState<"date" | "status" | "class">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
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

  // Auto-refresh bookings data
  const { refresh: refreshBookingsData } = useAutoRefresh({
    ...REFRESH_CONFIGS.BOOKINGS,
    enabled: true,
  });


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
          toast.error(getErrorMessage(error) || "Failed to cancel booking");
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
            toast.error(getErrorMessage(error) || "Failed to cancel booking");
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
  const getAllBookings = () => {
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
    
    return combinedBookings;
  };

  // Filtered and sorted bookings
  const filteredAndSortedBookings = useMemo(() => {
    let bookings = getAllBookings();
    
    // Apply status filter
    if (filterStatus !== "all") {
      bookings = bookings.filter((booking) => booking.status === filterStatus);
    }
    
    // Apply sorting
    bookings.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "date":
          comparison = parseISO(a.session.dateTime).getTime() - parseISO(b.session.dateTime).getTime();
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "class":
          comparison = (a.session.class?.name || "").localeCompare(b.session.class?.name || "");
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === "desc" ? -comparison : comparison;
    });
    
    return bookings;
  }, [getAllBookings, filterStatus, sortBy, sortOrder]);

  const getFilteredBookings = () => {
    return filteredAndSortedBookings;
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

        {/* Controls Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refreshBookingsData();
                toast.success('Bookings refreshed');
              }}
              className="h-8 w-8 p-0"
            >
              <RefreshCcw className="h-3 w-3" />
            </Button>

            {/* Sort Controls */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Sort:</span>
              <Select value={sortBy} onValueChange={(value: typeof sortBy) => setSortBy(value)}>
                <SelectTrigger className="w-20 h-8 text-xs border-muted">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="class">Class</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="h-8 w-8 p-0 hover:bg-muted"
              >
                {sortOrder === "asc" ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />}
              </Button>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex border rounded-md bg-muted/30">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-r-none h-8 w-8 p-0"
            >
              <List className="h-3 w-3" />
            </Button>
            <Button
              variant={viewMode === "calendar" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
              className="rounded-l-none h-8 w-8 p-0"
            >
              <CalendarDays className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Quick Stats & Filter Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div 
            className={`border-l-3 border-l-warning cursor-pointer transition-all hover:bg-warning/5 rounded-md p-2 ${
              filterStatus === "pending" ? "bg-warning/5" : "bg-card"
            }`}
            onClick={() => setFilterStatus(filterStatus === "pending" ? "all" : "pending")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-warning">{pendingBookings.length}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <Clock className="h-4 w-4 text-warning/50" />
            </div>
          </div>

          <div 
            className={`border-l-3 border-l-success cursor-pointer transition-all hover:bg-success/5 rounded-md p-2 ${
              filterStatus === "confirmed" ? "bg-success/5" : "bg-card"
            }`}
            onClick={() => setFilterStatus(filterStatus === "confirmed" ? "all" : "confirmed")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-success">{upcomingBookings.length}</p>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
              <CheckCircle className="h-4 w-4 text-success/50" />
            </div>
          </div>

          <div 
            className={`border-l-3 border-l-info cursor-pointer transition-all hover:bg-info/5 rounded-md p-2 ${
              filterStatus === "completed" ? "bg-info/5" : "bg-card"
            }`}
            onClick={() => setFilterStatus(filterStatus === "completed" ? "all" : "completed")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-info">{pastBookings.length}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <Activity className="h-4 w-4 text-info/50" />
            </div>
          </div>

          <div 
            className={`border-l-3 border-l-primary cursor-pointer transition-all hover:bg-primary/5 rounded-md p-2 ${
              filterStatus === "all" ? "bg-primary/5" : "bg-card"
            }`}
            onClick={() => setFilterStatus("all")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-primary">{getAllBookings().length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <TrendingUp className="h-4 w-4 text-primary/50" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        {viewMode === "list" ? (
          /* List View */
          <div className="space-y-4">
            {activeLoading || historyLoading ? (
              // Show skeleton loaders while loading
              Array.from({ length: 3 }).map((_, i) => (
                <BookingSkeleton key={i} />
              ))
            ) : getFilteredBookings().length > 0 ? (
              getFilteredBookings().map((booking) => {
                const sessionDate = parseISO(booking.session.dateTime);
                const isPastSession = isPast(sessionDate);
                const isPackageBooking = booking.bookingType === "monthly";

                return (
                  <Card
                    key={booking._id}
                    className={`${
                      isPastSession ? "opacity-75" : ""
                    } hover:shadow-md transition-all duration-200 cursor-pointer`}
                    onClick={() => router.push(`/session/${booking.session._id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">
                              {booking.session.class?.name || "Class"}
                            </h3>
                            <StatusBadge status={booking.status} />
                            {isPackageBooking && (
                              <Badge variant="outline" className="text-xs">
                                Package Credit
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{format(sessionDate, "EEEE, MMMM d, yyyy")}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>
                                {format(sessionDate, "h:mm a")} • {booking.session.duration} minutes
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 min-w-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/session/${booking.session._id}`);
                            }}
                            className="whitespace-nowrap"
                          >
                            <Eye className="h-4 w-4 sm:mr-1" />
                            <span className="hidden sm:inline">View</span>
                          </Button>

                          {!isPastSession &&
                            (booking.status === "confirmed" || booking.status === "pending") && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenCancelDialog(
                                    booking._id,
                                    isPackageBooking ? "package" : "regular"
                                  );
                                }}
                                className="text-destructive hover:bg-destructive/10 whitespace-nowrap"
                              >
                                <X className="h-4 w-4 sm:mr-1" />
                                <span className="hidden sm:inline">Cancel</span>
                              </Button>
                            )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
                              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {filterStatus !== "all" ? "No bookings match your filter" : "No bookings yet"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {filterStatus !== "all" 
                      ? "Try selecting a different status filter or click 'Total' to see all bookings" 
                      : "Start your fitness journey by booking your first class"
                    }
                  </p>
                  {filterStatus === "all" && (
                    <Button onClick={() => router.push("/")}>
                      Browse Classes
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          /* Calendar View */
          <div className="grid lg:grid-cols-3 gap-6">
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

            <div className="space-y-4">
              {selectedDate && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Calendar className="h-4 w-4 text-primary" />
                      {isToday(selectedDate) ? "Today" : format(selectedDate, "EEE, MMM d")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
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

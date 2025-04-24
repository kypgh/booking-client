import React, { useState } from "react";
import { useRouter } from "next/router";
import { format, parseISO, isPast, isFuture } from "date-fns";
import {
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import LoadingSpinner from "@/components/ui/loading-spinner";

// Status badge component to maintain consistent styling
const StatusBadge = ({ status }: { status: string }) => {
  let variant: "default" | "outline" | "secondary" | "destructive" = "default";
  let icon = null;

  switch (status) {
    case "confirmed":
      variant = "default";
      icon = <CheckCircle className="mr-1 h-3 w-3" />;
      break;
    case "pending":
      variant = "secondary";
      icon = <Clock className="mr-1 h-3 w-3" />;
      break;
    case "cancelled":
      variant = "destructive";
      icon = <XCircle className="mr-1 h-3 w-3" />;
      break;
    case "completed":
      variant = "outline";
      icon = <CheckCircle className="mr-1 h-3 w-3" />;
      break;
    default:
      variant = "outline";
  }

  return (
    <Badge variant={variant} className="flex items-center ml-2">
      {icon}
      <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
    </Badge>
  );
};

export default function BookingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("pending");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [bookingType, setBookingType] = useState<"regular" | "package">(
    "regular"
  );

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

              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <User className="h-4 w-4 mr-1" />
                <span>
                  Instructor: {booking.session.class?.instructor?.name || "TBD"}
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

  // Loading and error states
  const isLoading =
    ((activeTab === "pending" || activeTab === "upcoming") && activeLoading) ||
    (activeTab === "history" && historyLoading);

  const hasError =
    ((activeTab === "pending" || activeTab === "upcoming") && activeError) ||
    (activeTab === "history" && historyError);

  return (
    <MainLayout title="My Bookings | FitBook" headerTitle="My Bookings">
      <Tabs
        defaultValue="pending"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="pending">
            Pending
            {pendingBookings.length > 0 && (
              <span className="ml-2 text-xs bg-primary text-primary-foreground rounded-full w-5 h-5 inline-flex items-center justify-center">
                {pendingBookings.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Pending Bookings Tab */}
        <TabsContent value="pending">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner size="md" />
            </div>
          ) : hasError ? (
            <div className="text-center py-10">
              <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
              <p className="text-destructive">Failed to load bookings</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.reload()}
              >
                Retry
              </Button>
            </div>
          ) : pendingBookings.length > 0 ? (
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                These bookings are awaiting confirmation from the instructor or
                staff.
              </p>
              <div>
                {pendingBookings.map((booking) =>
                  renderBookingCard(booking, true)
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">
                You have no pending bookings
              </p>
              <Button onClick={() => router.push("/schedule")}>
                Book a Session
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Upcoming Bookings Tab */}
        <TabsContent value="upcoming">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner size="md" />
            </div>
          ) : hasError ? (
            <div className="text-center py-10">
              <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
              <p className="text-destructive">Failed to load bookings</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.reload()}
              >
                Retry
              </Button>
            </div>
          ) : upcomingBookings.length > 0 ? (
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Your confirmed upcoming sessions.
              </p>
              <div>
                {upcomingBookings.map((booking) =>
                  renderBookingCard(booking, true)
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">
                You have no upcoming bookings
              </p>
              <Button onClick={() => router.push("/schedule")}>
                Book a Session
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Booking History Tab */}
        <TabsContent value="history">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner size="md" />
            </div>
          ) : hasError ? (
            <div className="text-center py-10">
              <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
              <p className="text-destructive">Failed to load booking history</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.reload()}
              >
                Retry
              </Button>
            </div>
          ) : pastBookings.length > 0 ? (
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Your past sessions and cancelled bookings.
              </p>
              <div>
                {pastBookings.map((booking) =>
                  renderBookingCard(booking, false)
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No booking history found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Cancellation Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot
              be undone.
              {bookingType === "package" && (
                <p className="mt-2 text-primary">
                  Your package credit will be returned to your account.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling || isCancellingPackage}>
              Cancel
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

// pages/session/[id].tsx
import React, { useState } from "react";
import { useRouter } from "next/router";
import { format, parseISO, isAfter, addMinutes } from "date-fns";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Info,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";
import BrandLayout from "@/components/layouts/BrandLayout";
import { useSessionDetailsByBrand } from "@/hooks/useApi";
import { useCreateBookingWithBrand } from "@/hooks/useMutations";
import { toast } from "react-hot-toast";
import { useBrand } from "@/contexts/BrandContext";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import BookSessionDialog from "@/components/BookSessionDialog";
import { useAuth } from "@/contexts/AuthContext";

export default function SessionDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { activeBrandId } = useBrand();
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);

  // Use the session details hook with the active brand ID
  const {
    data: session,
    isLoading,
    error,
  } = useSessionDetailsByBrand(id as string, activeBrandId as string);

  // Format time function
  const formatTime = (dateString: string) => {
    if (!dateString) return "";

    try {
      const date = parseISO(dateString);
      return format(date, "h:mm a");
    } catch (e) {
      return dateString;
    }
  };

  // Format date function
  const formatDate = (dateString: string) => {
    if (!dateString) return "";

    try {
      const date = parseISO(dateString);
      return format(date, "EEEE, MMMM d, yyyy");
    } catch (e) {
      return dateString;
    }
  };

  // Check if session is in the future
  const isSessionFuture = (dateString: string) => {
    if (!dateString) return false;

    try {
      const sessionDate = parseISO(dateString);
      return isAfter(sessionDate, new Date());
    } catch (e) {
      return false;
    }
  };

  // Calculate end time
  const getEndTime = (startTimeString: string, durationMinutes: number) => {
    if (!startTimeString) return "";

    try {
      const startTime = parseISO(startTimeString);
      const endTime = addMinutes(startTime, durationMinutes);
      return format(endTime, "h:mm a");
    } catch (e) {
      return "";
    }
  };

  // Function to handle booking
  const handleBookSession = () => {
    setIsBookDialogOpen(true);
  };

  // Handle going back to classes or schedule
  const handleBack = () => {
    router.back();
  };

  return (
    <BrandLayout
      title={
        session ? `Session Details | ${session.class.name}` : "Session Details"
      }
      showBackButton={true}
      headerTitle="Session Details"
    >
      {error ? (
        <div className="text-center py-10">
          <p className="text-destructive">Failed to load session details</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.back()}
          >
            Go Back
          </Button>
        </div>
      ) : session ? (
        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex justify-between items-center">
            <Badge
              variant={
                session.status === "scheduled"
                  ? "outline"
                  : session.status === "completed"
                  ? "secondary"
                  : "destructive"
              }
              className="mb-2"
            >
              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
            </Badge>

            {/* Show booking button if session is in future and has available spots */}
            {isSessionFuture(session.dateTime) &&
              session.availableSpots > 0 && (
                <Button onClick={handleBookSession}>Book Session</Button>
              )}
          </div>

          {/* Session Info Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>{session.class.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Date and Time */}
                <div className="flex items-start">
                  <Calendar className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                  <div>
                    <span className="font-medium">
                      {formatDate(session.dateTime)}
                    </span>
                    <p className="text-muted-foreground text-sm">
                      {formatTime(session.dateTime)} -{" "}
                      {getEndTime(session.dateTime, session.duration)}
                    </p>
                  </div>
                </div>

                {/* Duration */}
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{session.duration} minutes</span>
                </div>

                {/* Capacity */}
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    {session.capacity - session.availableSpots}/
                    {session.capacity} spots filled
                    {session.availableSpots === 0 && " (Class Full)"}
                  </span>
                </div>
              </div>

              {/* Class Description */}
              {session.class.description && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    {session.class.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructor Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Instructor</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-3">
                  {session.class.instructor?.name?.charAt(0) || "I"}
                </div>
                <div>
                  <div className="font-medium">
                    {session.class.instructor?.name}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cancellation Policy */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Info size={16} className="mr-2" />
                Session Policies
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-start">
                <AlertCircle
                  size={16}
                  className="mr-2 text-muted-foreground mt-0.5 shrink-0"
                />
                <p className="text-sm">
                  Cancellations must be made at least{" "}
                  <span className="font-semibold">
                    {session.class.cancellationPolicy?.hours || 24} hours
                  </span>{" "}
                  before the session starts.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Session Notes (if any - usually for staff) */}
          {session.notes && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm">{session.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Attendees - Only show if user is staff or instructor */}
          {session.attendees && user?.roles?.isInstructor && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Attendees ({session.attendees.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {session.attendees.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No attendees yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {session.attendees.map((attendee, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <div>
                          <span className="font-medium">
                            {attendee.user.name}
                          </span>
                          <div className="text-xs text-muted-foreground">
                            {attendee.user.email}
                          </div>
                        </div>
                        <Badge
                          variant={
                            attendee.status === "confirmed"
                              ? "outline"
                              : attendee.status === "attended"
                              ? "default"
                              : attendee.status === "no-show"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {attendee.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      ) : null}

      {/* Booking Dialog */}
      {session && (
        <BookSessionDialog
          isOpen={isBookDialogOpen}
          onClose={() => setIsBookDialogOpen(false)}
          session={{
            id: session._id,
            dateTime: session.dateTime,
            duration: session.duration,
            class: {
              id: session.class._id,
              name: session.class.name,
              instructor: {
                id: session.class.instructor?._id,
                name: session.class.instructor?.name,
              },
            },
          }}
          brandId={activeBrandId as string}
        />
      )}
    </BrandLayout>
  );
}

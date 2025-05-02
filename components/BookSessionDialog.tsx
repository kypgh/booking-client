import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useActivePackages, useSubscriptions } from "@/hooks/useApi";
import { useCreateBookingWithBrand } from "@/hooks/useMutations";
import { toast } from "react-hot-toast";

// UI Components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Clock,
  Calendar,
  User,
  CreditCard,
  CheckCircle,
  Package,
} from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface BookSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  session: {
    id: string;
    dateTime: string;
    duration: number;
    class: {
      id: string;
      name: string;
      instructor: {
        id: string;
        name: string;
      };
    };
  };
  brandId?: string;
}

type BookingMethod = "individual" | "monthly" | "subscription";

const BookSessionDialog: React.FC<BookSessionDialogProps> = ({
  isOpen,
  onClose,
  session,
  brandId,
}) => {
  const [bookingMethod, setBookingMethod] =
    useState<BookingMethod>("individual");
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [isBooking, setIsBooking] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Get active packages for the user
  const { data: packages, isLoading: packagesLoading } = useActivePackages();

  // Get active subscriptions for the user
  const { data: subscriptions, isLoading: subscriptionsLoading } =
    useSubscriptions();

  // Use the enhanced booking mutation that supports brandId
  const { mutate: createBooking } = useCreateBookingWithBrand();

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setBookingMethod("individual");
      setSelectedPackage("");
      setIsBooking(false);
    }
  }, [isOpen]);

  // Handle package selection when booking method changes
  useEffect(() => {
    if (bookingMethod === "monthly" && packages && packages.length > 0) {
      setSelectedPackage(packages[0]._id);
    } else {
      setSelectedPackage("");
    }
  }, [bookingMethod, packages]);

  const handleBookSession = () => {
    setIsBooking(true);

    const bookingData = {
      sessionId: session.id,
      bookingType: bookingMethod as BookingMethod,
      packageBookingId:
        bookingMethod === "monthly" ? selectedPackage : undefined,
      brandId, // Include brandId in the booking data
    };

    createBooking(bookingData, {
      onSuccess: () => {
        toast.success("Session booked successfully!");
        setIsBooking(false);
        onClose();
        // Redirect to bookings page
        router.push("/bookings");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to book session");
        setIsBooking(false);
      },
    });
  };

  // Format session time for display
  const sessionDate = new Date(session.dateTime);
  const formattedDate = format(sessionDate, "EEEE, MMMM d, yyyy");
  const formattedTime = format(sessionDate, "h:mm a");

  // Check if user has an active subscription
  const hasSubscription = subscriptions && subscriptions.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book Session</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Session Info */}
          <div className="border-b pb-4">
            <h3 className="font-semibold">{session.class.name}</h3>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>
                  {formattedTime} • {session.duration} minutes
                </span>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Instructor: {session.class.instructor.name}</span>
              </div>
            </div>
          </div>

          {/* Booking Method Selection */}
          <div>
            <h3 className="font-medium mb-3">Select booking method:</h3>
            <RadioGroup
              value={bookingMethod}
              onValueChange={(value) =>
                setBookingMethod(value as BookingMethod)
              }
              className="space-y-3"
            >
              <label className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer">
                <RadioGroupItem value="individual" id="individual" />
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Individual Booking
                </div>
              </label>

              {packagesLoading ? (
                <div className="flex justify-center p-3">
                  <LoadingSpinner size="sm" />
                </div>
              ) : packages && packages.length > 0 ? (
                <label className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <div className="flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    Use Package Credits
                  </div>
                </label>
              ) : null}

              {/* Subscription option */}
              {subscriptionsLoading ? (
                <div className="flex justify-center p-3">
                  <LoadingSpinner size="sm" />
                </div>
              ) : hasSubscription ? (
                <label className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer">
                  <RadioGroupItem value="subscription" id="subscription" />
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Use Subscription
                  </div>
                </label>
              ) : null}
            </RadioGroup>
          </div>

          {/* Package Selection (if monthly) */}
          {bookingMethod === "monthly" && packages && packages.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Select package:</h3>
              <RadioGroup
                value={selectedPackage}
                onValueChange={setSelectedPackage}
                className="space-y-3"
              >
                {packages.map((pkg) => (
                  <label
                    key={pkg._id}
                    className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer"
                  >
                    <RadioGroupItem value={pkg._id} id={pkg._id} />
                    <div>
                      <span className="font-medium">{pkg.package.name}</span>
                      <div className="text-sm text-muted-foreground">
                        {pkg.remainingCredits} credits remaining
                      </div>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Subscription Info (if subscription) */}
          {bookingMethod === "subscription" &&
            subscriptions &&
            subscriptions.length > 0 && (
              <div className="p-3 border rounded-md bg-accent/10">
                <div className="flex items-center mb-2">
                  <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                  <span className="font-medium">Active Subscription</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  You'll be booking this session using your active subscription.
                </p>
              </div>
            )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isBooking}>
            Cancel
          </Button>
          <Button onClick={handleBookSession} disabled={isBooking}>
            {isBooking ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Booking...
              </>
            ) : (
              "Book Session"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookSessionDialog;

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useActivePackages, useSubscriptions, useAvailablePackages, useSubscriptionPlans } from "@/hooks/useApi";
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
  Crown,
  Zap,
  Star,
} from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBrand } from "@/contexts/BrandContext";

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
    };
  };
  brandId?: string;
}

type BookingMethod = "monthly" | "subscription";

const BookSessionDialog: React.FC<BookSessionDialogProps> = ({
  isOpen,
  onClose,
  session,
  brandId,
}) => {
  const [bookingMethod, setBookingMethod] = useState<BookingMethod>("monthly");
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [isBooking, setIsBooking] = useState(false);
  const { user } = useAuth();
  const { activeBrandId } = useBrand();
  const router = useRouter();

  // Get active packages for the user
  const { data: packages, isLoading: packagesLoading } = useActivePackages();

  // Get active subscriptions for the user
  const { data: subscriptions, isLoading: subscriptionsLoading } = useSubscriptions();

  // Get available packages for purchase
  const { data: availablePackages, isLoading: availablePackagesLoading } = useAvailablePackages(activeBrandId as string);

  // Get available subscription plans for purchase
  const { data: subscriptionPlans, isLoading: subscriptionPlansLoading } = useSubscriptionPlans(activeBrandId as string);

  // Use the enhanced booking mutation that supports brandId
  const { mutate: createBooking } = useCreateBookingWithBrand();

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setBookingMethod("monthly");
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

  const handlePurchasePlan = () => {
    onClose();
    router.push("/packages");
  };

  // Format session time for display
  const sessionDate = new Date(session.dateTime);
  const formattedDate = format(sessionDate, "EEEE, MMMM d, yyyy");
  const formattedTime = format(sessionDate, "h:mm a");

  // Check if user has an active subscription
  const hasSubscription = subscriptions && subscriptions.length > 0;
  const hasActivePlan = (packages && packages.length > 0) || hasSubscription;

  // Loading state
  const isLoading = packagesLoading || subscriptionsLoading || availablePackagesLoading || subscriptionPlansLoading;

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book Session</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
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
            </div>
          </div>

          {hasActivePlan ? (
            // User has an active plan - show booking options
            <div>
              <h3 className="font-medium mb-3">Select booking method:</h3>
              <RadioGroup
                value={bookingMethod}
                onValueChange={(value) =>
                  setBookingMethod(value as BookingMethod)
                }
                className="space-y-3"
              >
                {packages && packages.length > 0 && (
                  <label className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <div className="flex items-center">
                      <Package className="h-4 w-4 mr-2" />
                      Use Package Credits
                    </div>
                  </label>
                )}

                {hasSubscription && (
                  <label className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer">
                    <RadioGroupItem value="subscription" id="subscription" />
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Use Subscription
                    </div>
                  </label>
                )}
              </RadioGroup>

              {/* Package Selection (if monthly) */}
              {bookingMethod === "monthly" && packages && packages.length > 0 && (
                <div className="mt-4">
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
              {bookingMethod === "subscription" && subscriptions && subscriptions.length > 0 && (
                <div className="mt-4 p-3 border rounded-md bg-accent/10">
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
          ) : (
            // User doesn't have an active plan - show plan options
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Crown className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-2">No Active Plan</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose a plan to book this session
                </p>
              </div>

              {/* Available Plans */}
              <div className="space-y-4">
                {/* Credit Plans */}
                {availablePackages && availablePackages.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground">Credit Plans</h4>
                    <div className="grid gap-3">
                      {availablePackages.slice(0, 2).map((pkg) => (
                        <Card key={pkg._id} className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium">{pkg.name}</h5>
                              <p className="text-sm text-muted-foreground">
                                {pkg.credits} credits • ${pkg.price}
                              </p>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              ${(pkg.price / pkg.credits).toFixed(2)}/credit
                            </Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subscription Plans */}
                {subscriptionPlans && subscriptionPlans.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground">Monthly Plans</h4>
                    <div className="grid gap-3">
                      {subscriptionPlans.slice(0, 2).map((plan) => (
                        <Card key={plan.id} className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium">{plan.name}</h5>
                              <p className="text-sm text-muted-foreground">
                                ${plan.price}/month
                              </p>
                            </div>
                            <Badge variant="default" className="text-xs">
                              {plan.allowAllClasses ? "All Classes" : "Selected Classes"}
                            </Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <Button onClick={handlePurchasePlan} className="w-full" size="lg">
                  <Crown className="h-4 w-4 mr-2" />
                  View All Plans & Purchase
                </Button>
              </div>
            </div>
          )}
        </div>

        {hasActivePlan && (
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
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookSessionDialog;

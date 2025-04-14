import { useMutation, useQueryClient } from "@tanstack/react-query";
import BookingsApi from "@/api/bookingsApi";
import PackagesApi from "@/api/packagesApi";

// Types
export interface BookingRequest {
  sessionId: string;
  bookingType: "monthly" | "individual" | "subscription";
  packageBookingId?: string;
}

export interface PackagePurchaseRequest {
  packageId: string;
  paymentData: {
    amount: number;
    transactionId?: string;
  };
}

// Booking Mutations
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BookingRequest) => {
      let response;

      if (data.bookingType === "subscription") {
        // Handle subscription booking
        response = await BookingsApi.createSubscriptionBooking(data.sessionId);
      } else if (data.bookingType === "monthly" && data.packageBookingId) {
        // Handle package credits booking
        response = await BookingsApi.createPackageBooking(
          data.packageBookingId,
          data.sessionId
        );
      } else {
        // Handle regular booking
        response = await BookingsApi.createBooking({
          session: data.sessionId,
          bookingType: data.bookingType,
          packageBookingId: data.packageBookingId,
        });
      }

      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["bookings", "active"] });
      queryClient.invalidateQueries({ queryKey: ["sessions", "available"] });

      // If it's a package booking, invalidate package data
      queryClient.invalidateQueries({ queryKey: ["packages", "active"] });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await BookingsApi.cancelBooking(bookingId);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["sessions", "available"] });
    },
  });
};

export const useCancelPackageBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookingId,
      reason,
    }: {
      bookingId: string;
      reason?: string;
    }) => {
      const response = await BookingsApi.cancelPackageBooking(
        bookingId,
        reason
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      queryClient.invalidateQueries({ queryKey: ["sessions", "available"] });
    },
  });
};

// Package Mutations
export const usePurchasePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ packageId, paymentData }: PackagePurchaseRequest) => {
      const response = await PackagesApi.purchasePackage(
        packageId,
        paymentData
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages", "active"] });
    },
  });
};

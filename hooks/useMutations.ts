import { useMutation, useQueryClient } from "@tanstack/react-query";
import BookingsApi from "@/api/bookingsApi";
import PackagesApi from "@/api/packagesApi";
import InvitationApi from "@/api/invitationApi";
import { useAuth } from "@/contexts/AuthContext";

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
// Enhanced booking request type to support all booking types
export interface BookingRequest {
  sessionId: string;
  bookingType: "monthly" | "individual" | "subscription";
  packageBookingId?: string;
  client?: string; // Make client optional
}

// Booking Mutations

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

export const useCheckInvitations = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await InvitationApi.checkInvitationsByEmail(email);
      return response.data.invitations;
    },
  });
};

export const useAcceptInvitation = () => {
  return useMutation({
    mutationFn: async ({
      token,
      userData,
    }: {
      token: string;
      userData: any;
    }) => {
      const response = await InvitationApi.acceptInvitation(token, userData);
      return response.data;
    },
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth(); // Get current user context

  return useMutation({
    mutationFn: async (data: BookingRequest) => {
      let response;

      switch (data.bookingType) {
        case "subscription":
          response = await BookingsApi.createSubscriptionBooking(
            data.sessionId
          );
          break;
        case "monthly":
          if (!data.packageBookingId) {
            throw new Error(
              "Package booking ID is required for monthly bookings"
            );
          }
          response = await BookingsApi.createPackageBooking(
            data.packageBookingId,
            data.sessionId
          );
          break;
        case "individual":
          response = await BookingsApi.createBooking({
            session: data.sessionId,
            bookingType: data.bookingType,
            client: user?.id, // Include the client ID from auth context
          });
          break;
      }

      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["bookings", "active"] });
      queryClient.invalidateQueries({ queryKey: ["sessions", "available"] });
      queryClient.invalidateQueries({ queryKey: ["packages", "active"] });
    },
  });
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import BookingsApi from "@/api/bookingsApi";
import PackagesApi from "@/api/packagesApi";
import InvitationApi from "@/api/invitationApi";
import PaymentApi, { CreatePaymentIntentRequest } from "@/api/paymentApi";
import { useAuth } from "@/contexts/AuthContext";
import ProfileApi, { ProfileUpdateData } from "@/api/profileApi";
import { useBrand } from "@/contexts/BrandContext";

// Types
export interface BookingRequest {
  sessionId: string;
  bookingType: "credits" | "subscription";
  packageBookingId?: string; // Required for credits bookings
  subscriptionId?: string; // Required for subscription bookings
}

export interface PackagePurchaseRequest {
  packageId: string;
  paymentData: {
    amount: number;
    transactionId?: string;
  };
}
// Enhanced booking request type to support all booking types
export interface EnhancedBookingRequest {
  sessionId: string;
  bookingType: "credits" | "subscription";
  packageBookingId?: string; // Required for credits bookings
  subscriptionId?: string; // Required for subscription bookings
  client?: string; // Make client optional
  brandId?: string; // Brand context
}

export interface SubscriptionPurchaseRequest {
  planId: string;
  brandId: string;
  paymentMethod?: string;
  transactionId?: string;
}

// Booking Mutations

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  const { activeBrandId } = useBrand();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await BookingsApi.cancelBooking(bookingId);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", activeBrandId] });
      queryClient.invalidateQueries({ queryKey: ["sessions", "available"] });
    },
  });
};

export const useCancelPackageBooking = () => {
  const queryClient = useQueryClient();
  const { activeBrandId } = useBrand();

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
      queryClient.invalidateQueries({ queryKey: ["bookings", activeBrandId] });
      queryClient.invalidateQueries({ queryKey: ["packages", activeBrandId] });
      queryClient.invalidateQueries({ queryKey: ["sessions", "available"] });
    },
  });
};

// Package Mutations
export const usePurchasePackage = () => {
  const queryClient = useQueryClient();
  const { activeBrandId } = useBrand();

  return useMutation({
    mutationFn: async ({ packageId, paymentData }: PackagePurchaseRequest) => {
      const response = await PackagesApi.purchasePackage(
        packageId,
        paymentData
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["packages", "active", activeBrandId],
      });
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
  const { user } = useAuth();
  const { activeBrandId } = useBrand();

  return useMutation({
    mutationFn: async (data: BookingRequest) => {
      let response;

      switch (data.bookingType) {
        case "subscription":
          if (!data.subscriptionId) {
            throw new Error(
              "Subscription booking ID is required for subscription bookings"
            );
          }
          response = await BookingsApi.createSubscriptionBooking(
            data.sessionId,
            data.subscriptionId
          );
          break;
        case "credits":
          if (!data.packageBookingId) {
            throw new Error(
              "Package booking ID is required for credits bookings"
            );
          }
          response = await BookingsApi.createPackageBooking(
            data.packageBookingId,
            data.sessionId
          );
          break;
      }

      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["bookings", "active", activeBrandId],
      });
      queryClient.invalidateQueries({ queryKey: ["sessions", "available"] });
      queryClient.invalidateQueries({
        queryKey: ["packages", "active", activeBrandId],
      });
    },
  });
};

export const usePurchaseSubscription = () => {
  const queryClient = useQueryClient();
  const { activeBrandId } = useBrand();

  return useMutation({
    mutationFn: async ({
      planId,
      brandId,
      paymentMethod,
      transactionId,
    }: SubscriptionPurchaseRequest) => {
      // Use provided brandId or fall back to active brandId
      const effectiveBrandId = brandId || activeBrandId;

      const response = await PackagesApi.purchaseSubscription(
        planId,
        effectiveBrandId,
        paymentMethod,
        transactionId
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subscriptions", "active", activeBrandId],
      });
      queryClient.invalidateQueries({
        queryKey: ["subscriptions", "owned", activeBrandId],
      });
    },
  });
};

// Profile Mutations
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { refreshUserData } = useAuth();

  return useMutation({
    mutationFn: async (profileData: ProfileUpdateData) => {
      const response = await ProfileApi.updateProfile(profileData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
      // Refresh user data in auth context to update name if changed
      refreshUserData();
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: async (passwordData: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }) => {
      const response = await ProfileApi.updatePassword(passwordData);
      return response;
    },
  });
};

// Booking a session with brandId context
export const useCreateBookingWithBrand = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { activeBrandId } = useBrand();

  return useMutation({
    mutationFn: async ({
      sessionId,
      bookingType,
      packageBookingId,
      subscriptionId,
      brandId,
    }: EnhancedBookingRequest) => {
      let response;
      // Use provided brandId or fallback to active brandId
      const effectiveBrandId = brandId || activeBrandId;

      switch (bookingType) {
        case "subscription":
          if (!subscriptionId) {
            throw new Error(
              "Subscription booking ID is required for subscription bookings"
            );
          }
          response = await BookingsApi.createSubscriptionBooking(
            sessionId,
            subscriptionId
          );
          break;
        case "credits":
          if (!packageBookingId) {
            throw new Error(
              "Package booking ID is required for credits bookings"
            );
          }
          response = await BookingsApi.createPackageBooking(
            packageBookingId,
            sessionId
          );
          break;
      }

      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["bookings", "active"] });
      queryClient.invalidateQueries({ queryKey: ["sessions", "available"] });
      queryClient.invalidateQueries({ queryKey: ["packages", "active"] });

      // Also invalidate the specific session query if brandId is provided
      if (variables.brandId) {
        queryClient.invalidateQueries({
          queryKey: ["sessions", variables.brandId, variables.sessionId],
        });
      }
    },
  });
};

// Payment Mutations
export const useCreatePaymentIntent = () => {
  return useMutation({
    mutationFn: async (data: CreatePaymentIntentRequest) => {
      const response = await PaymentApi.createPaymentIntent(data);
      return response.data;
    },
  });
};

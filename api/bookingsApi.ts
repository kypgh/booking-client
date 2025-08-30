import agent from "./agent";
import { BookingData } from "@/hooks/useApi";

// Define return types for API responses
interface ApiResponse<T> {
  data: T;
  [key: string]: any;
}

// Define request types
interface BookingRequest {
  session: string;
  bookingType: "credits" | "subscription";
  packageBookingId?: string; // Required for credits bookings
  subscriptionId?: string; // Required for subscription bookings
  client?: string;
  brandId?: string | null;
}

// Bookings-related API endpoints
const BookingsApi = {
  // Get user's active bookings
  getActiveBookings: async (): Promise<ApiResponse<BookingData[]>> => {
    try {
      const response = await agent.get("/booking");
      return response;
    } catch (error) {
      console.error("Get active bookings error:", error);
      throw error;
    }
  },

  // Get user's booking history
  getBookingHistory: async (): Promise<ApiResponse<BookingData[]>> => {
    try {
      const response = await agent.get("/booking?type=history");
      return response;
    } catch (error) {
      console.error("Get booking history error:", error);
      throw error;
    }
  },

  // Create a new booking
  createBooking: async (
    bookingData: BookingRequest
  ): Promise<ApiResponse<BookingData>> => {
    try {
      const response = await agent.post("/booking", {
        ...bookingData,
        client: bookingData.client || "auto", // Include client ID or let backend use current auth user
      });
      return response;
    } catch (error) {
      console.error("Create booking error:", error);
      throw error;
    }
  },

  // Create a booking with a subscription (updated for Subscription)
  createSubscriptionBooking: async (
    sessionId: string,
    subscriptionId: string
  ): Promise<ApiResponse<BookingData>> => {
    try {
      const response = await agent.post("/booking/subscription", {
        sessionId,
        subscriptionId,
      });
      return response;
    } catch (error) {
      console.error("Create subscription booking error:", error);
      throw error;
    }
  },

  // Create a booking with package credits
  createPackageBooking: async (
    packageBookingId: string,
    sessionId: string
  ): Promise<ApiResponse<BookingData>> => {
    try {
      const response = await agent.post("/booking/package", {
        packageBookingId,
        sessionId,
      });
      return response;
    } catch (error) {
      console.error("Create package booking error:", error);
      throw error;
    }
  },

  // Cancel a booking
  cancelBooking: async (bookingId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await agent.delete(`/booking/${bookingId}`);
      return response;
    } catch (error) {
      console.error("Cancel booking error:", error);
      throw error;
    }
  },

  // Cancel a package booking
  cancelPackageBooking: async (
    bookingId: string,
    reason: string = "Client cancelled"
  ): Promise<ApiResponse<BookingData>> => {
    try {
      const response = await agent.post("/booking/cancel-package", {
        bookingId,
        reason,
      });
      return response;
    } catch (error) {
      console.error("Cancel package booking error:", error);
      throw error;
    }
  },
};

export default BookingsApi;

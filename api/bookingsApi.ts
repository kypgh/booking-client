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
  bookingType: "monthly" | "individual" | "subscription";
  packageBookingId?: string;
  client?: string;
}

// Bookings-related API endpoints
const BookingsApi = {
  // Get user's active bookings
  getActiveBookings: async (): Promise<ApiResponse<BookingData[]>> => {
    try {
      const response = await agent.get("/api/booking");
      return response;
    } catch (error) {
      console.error("Get active bookings error:", error);
      throw error;
    }
  },

  // Get user's booking history
  getBookingHistory: async (): Promise<ApiResponse<BookingData[]>> => {
    try {
      const response = await agent.get("/api/booking?type=history");
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
      const response = await agent.post("/api/booking", bookingData);
      return response;
    } catch (error) {
      console.error("Create booking error:", error);
      throw error;
    }
  },

  // Create a booking with a subscription
  createSubscriptionBooking: async (
    sessionId: string
  ): Promise<ApiResponse<BookingData>> => {
    try {
      const response = await agent.post("/api/booking/subscription", {
        sessionId,
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
      const response = await agent.post("/api/booking/package", {
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
      const response = await agent.delete(`/api/booking/${bookingId}`);
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
      const response = await agent.post("/api/booking/cancel-package", {
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

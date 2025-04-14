import agent from "./agent";

// Bookings-related API endpoints
const BookingsApi = {
  // Get user's active bookings
  getActiveBookings: async () => {
    try {
      const response = await agent.get("/api/booking");
      return response.data;
    } catch (error) {
      console.error("Get active bookings error:", error);
      throw error;
    }
  },

  // Get user's booking history
  getBookingHistory: async () => {
    try {
      const response = await agent.get("/api/booking?type=history");
      return response.data;
    } catch (error) {
      console.error("Get booking history error:", error);
      throw error;
    }
  },

  // Create a new booking
  createBooking: async (bookingData) => {
    try {
      const response = await agent.post("/api/booking", bookingData);
      return response.data;
    } catch (error) {
      console.error("Create booking error:", error);
      throw error;
    }
  },

  // Create a booking with a subscription
  createSubscriptionBooking: async (sessionId) => {
    try {
      const response = await agent.post("/api/booking/subscription", {
        sessionId,
      });
      return response.data;
    } catch (error) {
      console.error("Create subscription booking error:", error);
      throw error;
    }
  },

  // Create a booking with package credits
  createPackageBooking: async (packageBookingId, sessionId) => {
    try {
      const response = await agent.post("/api/booking/package", {
        packageBookingId,
        sessionId,
      });
      return response.data;
    } catch (error) {
      console.error("Create package booking error:", error);
      throw error;
    }
  },

  // Cancel a booking
  cancelBooking: async (bookingId) => {
    try {
      const response = await agent.delete(`/api/booking/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error("Cancel booking error:", error);
      throw error;
    }
  },

  // Cancel a package booking
  cancelPackageBooking: async (bookingId, reason = "Client cancelled") => {
    try {
      const response = await agent.post("/api/booking/cancel-package", {
        bookingId,
        reason,
      });
      return response.data;
    } catch (error) {
      console.error("Cancel package booking error:", error);
      throw error;
    }
  },
};

export default BookingsApi;

import agent from "./agent";

// Packages and subscriptions related API endpoints
const PackagesApi = {
  // Get active packages for client
  getActivePackages: async () => {
    try {
      const response = await agent.get("/api/package/client");
      return response.data;
    } catch (error) {
      console.error("Get active packages error:", error);
      throw error;
    }
  },

  // Get package history for client
  getPackageHistory: async () => {
    try {
      const response = await agent.get("/api/package/client?history=true");
      return response.data;
    } catch (error) {
      console.error("Get package history error:", error);
      throw error;
    }
  },

  // Get package details by ID
  getPackageById: async (packageId) => {
    try {
      const response = await agent.get(`/api/package/${packageId}`);
      return response.data;
    } catch (error) {
      console.error("Get package details error:", error);
      throw error;
    }
  },

  // Purchase a package
  purchasePackage: async (packageId, paymentData) => {
    try {
      const response = await agent.post("/api/package/purchase", {
        package: packageId,
        payment: paymentData,
      });
      return response.data;
    } catch (error) {
      console.error("Purchase package error:", error);
      throw error;
    }
  },

  // Get bookings for a package
  getPackageBookings: async (packageBookingId) => {
    try {
      const response = await agent.get(
        `/api/package/bookings/${packageBookingId}`
      );
      return response.data;
    } catch (error) {
      console.error("Get package bookings error:", error);
      throw error;
    }
  },

  // Get client's subscriptions
  getSubscriptions: async () => {
    try {
      const response = await agent.get("/api/subscription");
      return response.data;
    } catch (error) {
      console.error("Get subscriptions error:", error);
      throw error;
    }
  },
};

export default PackagesApi;

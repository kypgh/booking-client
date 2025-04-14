import agent from "./agent";
import { PackageData, BookingData } from "@/hooks/useApi";

// Define return types for API responses
interface ApiResponse<T> {
  data: T;
  [key: string]: any;
}

// Define request types
interface PaymentData {
  amount: number;
  transactionId?: string;
}

interface SubscriptionData {
  id: string;
  client: {
    id: string;
    name: string;
    email: string;
  };
  startDate: string;
  endDate: string;
  status: string;
  brand: string;
  includedClasses: Array<{
    id: string;
    name: string;
  }>;
  allowAllClasses: boolean;
  frequencyLimit?: {
    count: number;
    period: "day" | "week" | "month";
  };
}

interface PackageBookingData {
  _id: string;
  client: string;
  package: PackageData;
  brand: string;
  initialCredits: number;
  remainingCredits: number;
  startDate: string;
  expiryDate: string;
  status: string;
  payment: {
    amount: number;
    transactionId?: string;
    status: string;
    date: string;
  };
  sessionBookings: string[];
}

// Packages and subscriptions related API endpoints
const PackagesApi = {
  // Get active packages for client
  getActivePackages: async (): Promise<ApiResponse<PackageBookingData[]>> => {
    try {
      const response = await agent.get("/api/package/client");
      return response;
    } catch (error) {
      console.error("Get active packages error:", error);
      throw error;
    }
  },

  // Get package history for client
  getPackageHistory: async (): Promise<ApiResponse<PackageBookingData[]>> => {
    try {
      const response = await agent.get("/api/package/client?history=true");
      return response;
    } catch (error) {
      console.error("Get package history error:", error);
      throw error;
    }
  },

  // Get package details by ID
  getPackageById: async (
    packageId: string
  ): Promise<ApiResponse<PackageData>> => {
    try {
      const response = await agent.get(`/api/package/${packageId}`);
      return response;
    } catch (error) {
      console.error("Get package details error:", error);
      throw error;
    }
  },

  // Purchase a package
  purchasePackage: async (
    packageId: string,
    paymentData: PaymentData
  ): Promise<ApiResponse<PackageBookingData>> => {
    try {
      const response = await agent.post("/api/package/purchase", {
        package: packageId,
        payment: paymentData,
      });
      return response;
    } catch (error) {
      console.error("Purchase package error:", error);
      throw error;
    }
  },

  // Get bookings for a package
  getPackageBookings: async (
    packageBookingId: string
  ): Promise<ApiResponse<BookingData[]>> => {
    try {
      const response = await agent.get(
        `/api/package/bookings/${packageBookingId}`
      );
      return response;
    } catch (error) {
      console.error("Get package bookings error:", error);
      throw error;
    }
  },

  // Get client's subscriptions
  getSubscriptions: async (): Promise<ApiResponse<SubscriptionData[]>> => {
    try {
      const response = await agent.get("/api/subscription");
      return response;
    } catch (error) {
      console.error("Get subscriptions error:", error);
      throw error;
    }
  },
};

export default PackagesApi;

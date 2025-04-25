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
  client?: {
    id: string;
    name: string;
    email: string;
  };
  startDate?: string;
  endDate?: string;
  status?: string;
  brand?: string;
  name: string;
  description?: string;
  price: number;
  includedClasses: Array<{
    id: string;
    name: string;
  }>;
  allowAllClasses: boolean;
  frequencyLimit?: {
    count: number;
    period: "day" | "week" | "month";
  };
  durationDays: number;
  isActive: boolean;
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
  // Get all available packages (not just client's active ones)
  getAvailablePackages: async (
    brandId: string
  ): Promise<ApiResponse<PackageData[]>> => {
    try {
      const response = await agent.get(`/package?brandId=${brandId}`);
      return response;
    } catch (error) {
      console.error("Get available packages error:", error);
      throw error;
    }
  },

  // Get active packages for client
  getActivePackages: async (): Promise<ApiResponse<PackageBookingData[]>> => {
    try {
      const response = await agent.get("/package/client");
      return response;
    } catch (error) {
      console.error("Get active packages error:", error);
      throw error;
    }
  },

  // Get package history for client
  getPackageHistory: async (): Promise<ApiResponse<PackageBookingData[]>> => {
    try {
      const response = await agent.get("/package/client?history=true");
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
      const response = await agent.get(`/package/${packageId}`);
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
      const response = await agent.post("/package/purchase", {
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
      const response = await agent.get(`/package/bookings/${packageBookingId}`);
      return response;
    } catch (error) {
      console.error("Get package bookings error:", error);
      throw error;
    }
  },

  // Get client's subscriptions
  getSubscriptions: async (): Promise<ApiResponse<SubscriptionData[]>> => {
    try {
      const response = await agent.get("/subscription");
      return response;
    } catch (error) {
      console.error("Get subscriptions error:", error);
      throw error;
    }
  },

  // Get subscription plans for a brand
  getSubscriptionPlans: async (
    brandId: string
  ): Promise<ApiResponse<SubscriptionData[]>> => {
    try {
      const response = await agent.get(
        `/subscription/plans?brandId=${brandId}`
      );
      return response;
    } catch (error) {
      console.error("Get subscription plans error:", error);
      throw error;
    }
  },

  // Purchase a subscription
  purchaseSubscription: async (
    planId: string,
    brandId: string,
    paymentMethod: string = "credit_card",
    transactionId?: string
  ): Promise<ApiResponse<any>> => {
    try {
      const response = await agent.post("/subscription/purchase", {
        planId,
        brandId,
        payment: {
          method: paymentMethod,
          transactionId,
        },
      });
      return response;
    } catch (error) {
      console.error("Purchase subscription error:", error);
      throw error;
    }
  },
};

export default PackagesApi;

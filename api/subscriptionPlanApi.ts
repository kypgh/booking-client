import agent from "./agent";

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

// Updated SubscriptionPlan interface to match server structure
export interface SubscriptionPlan {
  _id: string;
  name: string;
  description?: string;
  brand: string;
  price: number;
  status: "active" | "inactive";
  durationDays: number;
  frequencyLimit: {
    count: number;
    period: "day" | "week" | "month";
  };
  allowAllClasses: boolean;
  restrictions?: {
    classes: string[];
  };
  includedClasses: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

// SubscriptionBooking interface to match server structure
export interface SubscriptionBooking {
  _id: string;
  client: string;
  subscriptionPlan: SubscriptionPlan | string;
  brand: string;
  startDate: string;
  endDate: string;
  status: "active" | "expired" | "cancelled";
  payment: {
    amount: number;
    transactionId?: string;
    status: string;
    date: string;
  };
  frequencyTracking: {
    [period: string]: {
      count: number;
      resetDate: string;
    };
  };
  createdAt?: string;
  updatedAt?: string;
}

// Updated Subscription interface (now references SubscriptionPlan)
export interface Subscription {
  _id: string;
  client: string;
  subscriptionPlan: SubscriptionPlan | string;
  brand: string;
  status: "active" | "expired" | "cancelled";
  createdAt?: string;
  updatedAt?: string;
}

// Subscription Plan related API endpoints
const SubscriptionPlanApi = {
  // Get all available subscription plans for a brand
  getAvailableSubscriptionPlans: async (
    brandId: string
  ): Promise<ApiResponse<SubscriptionPlan[]>> => {
    try {
      const response = await agent.get(`/subscription-plan?brandId=${brandId}`);
      return response;
    } catch (error) {
      console.error("Get available subscription plans error:", error);
      throw error;
    }
  },

  // Get subscription plan details by ID
  getSubscriptionPlanById: async (
    planId: string
  ): Promise<ApiResponse<SubscriptionPlan>> => {
    try {
      const response = await agent.get(`/subscription-plan/${planId}`);
      return response;
    } catch (error) {
      console.error("Get subscription plan details error:", error);
      throw error;
    }
  },

  // Purchase a subscription plan
  purchaseSubscriptionPlan: async (
    planId: string,
    paymentData: PaymentData
  ): Promise<ApiResponse<SubscriptionBooking>> => {
    try {
      const response = await agent.post("/subscription-plan/purchase", {
        subscriptionPlan: planId,
        payment: paymentData,
      });
      return response;
    } catch (error) {
      console.error("Purchase subscription plan error:", error);
      throw error;
    }
  },

  // Get client's active subscription bookings
  getActiveSubscriptionBookings: async (): Promise<ApiResponse<SubscriptionBooking[]>> => {
    try {
      const response = await agent.get("/subscription-plan/client");
      return response;
    } catch (error) {
      console.error("Get active subscription bookings error:", error);
      throw error;
    }
  },

  // Get subscription booking history for client
  getSubscriptionBookingHistory: async (): Promise<ApiResponse<SubscriptionBooking[]>> => {
    try {
      const response = await agent.get("/subscription-plan/client?history=true");
      return response;
    } catch (error) {
      console.error("Get subscription booking history error:", error);
      throw error;
    }
  },

  // Cancel a subscription booking
  cancelSubscriptionBooking: async (
    subscriptionBookingId: string
  ): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await agent.post(`/subscription-plan/cancel/${subscriptionBookingId}`);
      return response;
    } catch (error) {
      console.error("Cancel subscription booking error:", error);
      throw error;
    }
  },

  // Check subscription plan ownership
  checkSubscriptionPlanOwnership: async (
    planId: string
  ): Promise<ApiResponse<{ hasActivePlan: boolean }>> => {
    try {
      const response = await agent.post("/subscription-plan/check-ownership", {
        planId,
      });
      return response;
    } catch (error) {
      console.error("Check subscription plan ownership error:", error);
      throw error;
    }
  },
};

export default SubscriptionPlanApi;

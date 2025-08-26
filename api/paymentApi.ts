import agent from "./agent";

// Define return types for API responses
interface ApiResponse<T> {
  data: T;
  [key: string]: any;
}

// Define request types
interface CreatePaymentIntentRequest {
  type: "package" | "subscription";
  itemId: string;
  brandId?: string; // Add brandId for server compatibility
}

// More specific request types for different item types
interface CreatePackagePaymentRequest {
  type: "package";
  itemId: string;
}

interface CreateSubscriptionPaymentRequest {
  type: "subscription"; 
  planId: string;
  brandId?: string;
}

interface CreatePaymentIntentResponse {
  clientSecret: string;
  amount: number;
  itemName: string;
}

// Payment related API endpoints
const PaymentApi = {
  // Create payment intent for Stripe
  createPaymentIntent: async (
    paymentData: CreatePaymentIntentRequest
  ): Promise<ApiResponse<CreatePaymentIntentResponse>> => {
    try {
      let requestBody: any;
      
      if (paymentData.type === "subscription") {
        // For subscriptions, use planId and brandId
        requestBody = {
          type: "subscription",
          planId: paymentData.itemId,
          brandId: paymentData.brandId
        };
      } else {
        // For packages, use the original structure
        requestBody = {
          type: "package", 
          itemId: paymentData.itemId
        };
      }
      
      console.log("Sending payment request:", requestBody);
      const response = await agent.post("/payment/create-intent", requestBody);
      return response;
    } catch (error) {
      console.error("Create payment intent error:", error);
      throw error;
    }
  },

  // Confirm payment (if needed for additional verification)
  confirmPayment: async (
    paymentIntentId: string
  ): Promise<ApiResponse<{ status: string }>> => {
    try {
      const response = await agent.post("/payment/confirm", {
        paymentIntentId,
      });
      return response;
    } catch (error) {
      console.error("Confirm payment error:", error);
      throw error;
    }
  },
};

export default PaymentApi;
export type { 
  CreatePaymentIntentRequest, 
  CreatePaymentIntentResponse,
  CreatePackagePaymentRequest,
  CreateSubscriptionPaymentRequest 
};

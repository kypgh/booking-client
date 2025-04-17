import agent from "./agent";

// Define return types for API responses
interface ApiResponse<T> {
  data: T;
  [key: string]: any;
}

// Types for invitation data
export interface InvitationData {
  email: string;
  brand: {
    id: string;
    name: string;
    logo?: string;
  };
  clientData?: {
    name?: string;
    phone?: string;
    notes?: string;
  };
  expires: string;
  token?: string;
}

// Invitation-related API endpoints
const InvitationApi = {
  // Verify an invitation token
  verifyInvitation: async (
    token: string
  ): Promise<ApiResponse<InvitationData>> => {
    try {
      const response = await agent.post(`/invitation/verify`, {
        token,
      });
      return response;
    } catch (error) {
      console.error("Verify invitation error:", error);
      throw error;
    }
  },

  // Check for invitations by email
  checkInvitationsByEmail: async (
    email: string
  ): Promise<ApiResponse<{ invitations: InvitationData[] }>> => {
    try {
      const response = await agent.post("/invitation/check", { email });
      return response;
    } catch (error) {
      console.error("Check invitations error:", error);
      throw error;
    }
  },

  // Accept an invitation and register
  acceptInvitation: async (
    token: string,
    userData: any
  ): Promise<ApiResponse<any>> => {
    try {
      const response = await agent.post(`/invitation/accept`, {
        token,
        ...userData,
      });

      // Store token and user data in localStorage if provided
      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.client));
      }

      return response;
    } catch (error) {
      console.error("Accept invitation error:", error);
      throw error;
    }
  },
};

export default InvitationApi;

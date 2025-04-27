import agent from "./agent";

// Define return types for API responses
interface ApiResponse<T> {
  data: T;
  [key: string]: any;
}

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  dateOfBirth?: string;
  status?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  healthInfo?: {
    medicalConditions?: string[];
    allergies?: string[];
    medications?: string[];
  };
  preferences?: {
    notificationPreferences?: {
      email?: boolean;
      sms?: boolean;
    };
  };
  brands?: string[];
}

export interface ProfileUpdateData {
  name?: string;
  dateOfBirth?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  healthInfo?: {
    medicalConditions?: string[];
    allergies?: string[];
    medications?: string[];
  };
  preferences?: {
    notificationPreferences?: {
      email?: boolean;
      sms?: boolean;
    };
  };
}

// Profile-related API endpoints
const ProfileApi = {
  // Get current user's profile
  getProfile: async (): Promise<ApiResponse<ProfileData>> => {
    try {
      const response = await agent.get("/client/me");
      return response;
    } catch (error) {
      console.error("Get profile error:", error);
      throw error;
    }
  },

  // Update user's profile
  updateProfile: async (
    profileData: ProfileUpdateData
  ): Promise<ApiResponse<ProfileData>> => {
    try {
      const response = await agent.put("/client/me", profileData);
      return response;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  },

  // Update user's password
  updatePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<any> => {
    try {
      const response = await agent.post(
        "/client/change-password",
        passwordData
      );
      return response;
    } catch (error) {
      console.error("Update password error:", error);
      throw error;
    }
  },
};

export default ProfileApi;

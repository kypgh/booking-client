import agent from "./agent";
import { User } from "../contexts/AuthContext";

interface LoginResponse {
  data: {
    client: User;
    token: string;
  };
}

interface RegisterResponse {
  data: {
    client: User;
    token: string;
  };
}

interface UserResponse {
  data: User;
}

// Auth-related API endpoints
const AuthApi = {
  // Login with email and password
  login: async (
    email: string,
    password: string,
    brandId?: string
  ): Promise<LoginResponse> => {
    try {
      const response = await agent.post(
        `/client/login`,
        {
          email,
          password,
        },
        {
          params: brandId && {
            brandId,
          },
        }
      );

      // Store token and user data in localStorage
      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.client));
      }

      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // Register a new client account
  register: async (
    userData: any,
    brandId?: string
  ): Promise<RegisterResponse> => {
    try {
      const response = await agent.post(
        `/client/register?brandId=${brandId}`,
        userData
      );

      // Auto-login after successful registration
      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.client));
      }

      return response;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  // Log out user
  logout: (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Optional: can perform additional cleanup here
  },

  // Get current user's profile data
  getCurrentUser: async (): Promise<UserResponse> => {
    try {
      const response = await agent.get("/client/me");
      return response;
    } catch (error) {
      console.error("Get current user error:", error);
      throw error;
    }
  },

  // Check if user is logged in
  isAuthenticated: (): boolean => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("token");
  },

  // Get current user from localStorage
  getCurrentUserFromStorage: (): User | null => {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },
};

export default AuthApi;

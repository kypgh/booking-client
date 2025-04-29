import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/router";
import AuthApi from "../api/authApi";

// Brand interface to define the structure of brand objects
export interface Brand {
  id?: string;
  _id?: string;
  name: string;
  logo?: string;
  description?: string;
  status?: string;
  [key: string]: any;
}

// Updated User interface to handle brand objects
export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  status?: string;
  brands?: Brand[]; // Updated to array of Brand objects
  primaryBrand?: Brand | string; // Can be either a Brand object or a brand ID string
  [key: string]: any; // For any additional properties
}

// Context interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, brandId?: string) => Promise<any>;
  register: (userData: any, brandId: string) => Promise<any>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
}

// Default context value
const defaultContextValue: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ data: {} }),
  register: async () => ({ data: {} }),
  logout: () => {},
  refreshUserData: async () => {},
};

// Create auth context
const AuthContext = createContext<AuthContextType>(defaultContextValue);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Check for existing login on initial load
  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      const storedUser = AuthApi.getCurrentUserFromStorage();
      if (storedUser) {
        setUser(storedUser);
      }
      setIsLoading(false);
    }
  }, []);

  console.log("u", user);

  // Login function with optional brandId parameter
  const login = async (email: string, password: string, brandId?: string) => {
    setIsLoading(true);
    try {
      const response = await AuthApi.login(email, password, brandId);
      if (response?.data?.client) {
        setUser(response.data.client);
      }
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: any, brandId?: string) => {
    setIsLoading(true);
    try {
      const response = await AuthApi.register(userData, brandId);
      if (response?.data?.client) {
        setUser(response.data.client);
      }
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    AuthApi.logout();
    setUser(null);
    router.push("/login");
  };

  // Refresh user data
  const refreshUserData = async () => {
    if (!AuthApi.isAuthenticated()) return;

    try {
      const userData = await AuthApi.getCurrentUser();
      if (userData?.data) {
        setUser(userData.data);
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

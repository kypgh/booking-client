import React, { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/router";
import AuthApi from "../api/authApi";

// Create auth context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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

  // Login function
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await AuthApi.login(email, password);
      setUser(response.data.client);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setIsLoading(true);
    try {
      const response = await AuthApi.register(userData);
      setUser(response.data.client);
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
      setUser(userData);
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  const contextValue = {
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
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

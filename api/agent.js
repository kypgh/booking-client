import axios from "axios";

// Create base axios instance
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to inject authentication token
axiosInstance.interceptors.request.use(
  (config) => {
    // Add authorization header with JWT token if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
axiosInstance.interceptors.response.use(
  (response) => {
    // Return the response data directly for easier use
    return response.data;
  },
  (error) => {
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login if needed
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Only redirect if we're in a browser environment and not already on login page
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        window.location.href = "/login";
      }
    }

    // Enhance error object with additional info
    const enhancedError = {
      message: error.response?.data?.error || error.message || "Unknown error",
      status: error.response?.status,
      data: error.response?.data,
      originalError: error,
    };

    return Promise.reject(enhancedError);
  }
);

// Export the agent instance
export default axiosInstance;

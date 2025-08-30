import { API_URL } from "@/lib/envs";
import axios, {
  AxiosInstance,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

// Create base axios instance

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to inject authentication token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add authorization header with JWT token if available
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Define API response error structure
interface ApiErrorResponse {
  error?: string;
  message?: string;
  [key: string]: any;
}

// Define the enhanced error type
interface EnhancedError {
  message: string;
  status?: number;
  data?: any;
  originalError: AxiosError | Error;
}

// Add a response interceptor to handle common errors
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Check if the response indicates an error (success: false)
    if (response.data && response.data.success === false) {
      // Extract error information from the response
      const errorData = response.data.error || {};
      const errorMessage = errorData.message || "An error occurred";
      
      // Create an enhanced error object
      const enhancedError: EnhancedError = {
        message: errorMessage,
        status: response.status,
        data: response.data,
        originalError: new Error(errorMessage),
      };

      return Promise.reject(enhancedError);
    }

    // Return the response data directly for easier use
    return response.data;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login if needed
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Only redirect if we're in a browser environment and not already on login page
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    }

    // Get error message from response or fallback to default
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Unknown error";

    // Enhance error object with additional info
    const enhancedError: EnhancedError = {
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
      originalError: error,
    };

    return Promise.reject(enhancedError);
  }
);

// Export the agent instance
export default axiosInstance;

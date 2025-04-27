import agent from "./agent";
import { ClassData, Session } from "@/hooks/useApi";

// Define return types for API responses
interface ApiResponse<T> {
  data: T;
  [key: string]: any;
}

// Classes-related API endpoints
const ClassesApi = {
  // Get all classes
  getAllClasses: async (
    businessType?: "fixed" | "hourly",
    status: string = "active", // Default to active classes
    brandId?: string // Optional brandId parameter
  ): Promise<ApiResponse<ClassData[]>> => {
    try {
      const brandIdParam = brandId;
      let url = `/class?brandId=${brandIdParam}`;

      // Add businessType as a query parameter if provided
      if (businessType) {
        url += `&businessType=${businessType}`;
      }

      // Add status filter
      url += `&status=${status}`;

      const response = await agent.get(url);
      return response;
    } catch (error) {
      console.error("Get classes error:", error);
      throw error;
    }
  },
  // Get class by ID
  getClassById: async (classId: string): Promise<ApiResponse<ClassData>> => {
    try {
      const response = await agent.get(`/class/${classId}`);
      return response;
    } catch (error) {
      console.error("Get class error:", error);
      throw error;
    }
  },

  // Get available sessions for a class
  getClassSessions: async (
    classId: string,
    filters: {
      startDate?: string;
      endDate?: string;
      status?: string;
      includeFullyBooked?: boolean;
    } = {}
  ): Promise<ApiResponse<Session[]>> => {
    try {
      // Convert filters to query params
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });

      const url = `/session/${classId}${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = await agent.get(url);
      return response;
    } catch (error) {
      console.error("Get class sessions error:", error);
      throw error;
    }
  },

  // Get available sessions
  getAvailableSessions: async (
    filters: {
      startDate?: string;
      endDate?: string;
      brandId?: string;
      classId?: string;
      instructorId?: string;
    } = {}
  ): Promise<
    ApiResponse<{
      sessions: Session[];
      groupedByDate: Record<string, Session[]>;
    }>
  > => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });

      const url = `/session/availability${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = await agent.get(url);
      return response;
    } catch (error) {
      console.error("Get available sessions error:", error);
      throw error;
    }
  },
};

export default ClassesApi;

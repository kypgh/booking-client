import agent from "./agent";

// Classes-related API endpoints
const ClassesApi = {
  // Get all classes
  getAllClasses: async () => {
    try {
      const response = await agent.get("/api/class");
      return response.data;
    } catch (error) {
      console.error("Get classes error:", error);
      throw error;
    }
  },

  // Get class by ID
  getClassById: async (classId) => {
    try {
      const response = await agent.get(`/api/class/${classId}`);
      return response.data;
    } catch (error) {
      console.error("Get class error:", error);
      throw error;
    }
  },

  // Get available sessions for a class
  getClassSessions: async (classId, filters = {}) => {
    try {
      // Convert filters to query params
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });

      const url = `/api/session/${classId}${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = await agent.get(url);
      return response.data;
    } catch (error) {
      console.error("Get class sessions error:", error);
      throw error;
    }
  },

  // Get available sessions
  getAvailableSessions: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });

      const url = `/api/session/availability${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = await agent.get(url);
      return response.data;
    } catch (error) {
      console.error("Get available sessions error:", error);
      throw error;
    }
  },
};

export default ClassesApi;

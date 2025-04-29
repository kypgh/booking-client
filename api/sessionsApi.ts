import agent from "./agent";

// Define return types for API responses
interface ApiResponse<T> {
  data: T;
  [key: string]: any;
}

// Define types for session data
export interface SessionDetail {
  _id: string;
  class: {
    _id: string;
    name: string;
    description: string;
    instructor: {
      _id: string;
      name: string;
    };
    duration: number;
    capacity: number;
    cancellationPolicy: {
      hours: number;
    };
  };
  dateTime: string;
  duration: number;
  capacity: number;
  availableSpots: number;
  status: string;
  attendees?: Array<{
    user: {
      _id: string;
      name: string;
      email: string;
    };
    bookingType: string;
    status: string;
    bookingDate: string;
  }>;
  notes?: string;
}

// Define interface for session attendance update
interface AttendanceUpdate {
  clientId: string;
  status: "attended" | "no-show";
}

// Define interface for notes update
interface NotesUpdate {
  notes: string;
}

// Sessions-related API endpoints
const SessionsApi = {
  // Get session details by ID
  getSessionById: async (
    sessionId: string,
    brandId?: string | null // Added brandId parameter
  ): Promise<ApiResponse<SessionDetail>> => {
    try {
      // Use brandId in the URL if provided
      const url = brandId
        ? `/session/${sessionId}/details`
        : `/session/${sessionId}/details`;

      const response = await agent.get(url);
      return response;
    } catch (error) {
      console.error("Get session details error:", error);
      throw error;
    }
  },

  // Update session attendance (for instructors/staff)
  updateAttendance: async (
    sessionId: string,
    data: AttendanceUpdate,
    brandId?: string
  ): Promise<ApiResponse<any>> => {
    try {
      const url = brandId
        ? `/session/${sessionId}/attendance`
        : `/session/${sessionId}/attendance`;

      const response = await agent.post(url, data);
      return response;
    } catch (error) {
      console.error("Update attendance error:", error);
      throw error;
    }
  },

  // Update session notes (for instructors/staff)
  updateNotes: async (
    sessionId: string,
    data: NotesUpdate,
    brandId?: string
  ): Promise<ApiResponse<any>> => {
    try {
      const url = brandId
        ? `/session/${sessionId}/notes`
        : `/session/${sessionId}/notes`;

      const response = await agent.post(url, data);
      return response;
    } catch (error) {
      console.error("Update notes error:", error);
      throw error;
    }
  },

  // Get session attendees (for instructors/staff)
  getSessionAttendees: async (
    sessionId: string,
    brandId?: string
  ): Promise<ApiResponse<any>> => {
    try {
      const url = brandId
        ? `/session/${sessionId}/attendees`
        : `/session/${sessionId}/attendees`;

      const response = await agent.get(url);
      return response;
    } catch (error) {
      console.error("Get session attendees error:", error);
      throw error;
    }
  },
};

// Add to your app's API exports
export default SessionsApi;

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
    sessionId: string
  ): Promise<ApiResponse<SessionDetail>> => {
    try {
      const response = await agent.get(`/session/${sessionId}/details`);
      return response;
    } catch (error) {
      console.error("Get session details error:", error);
      throw error;
    }
  },

  // Update session attendance (for instructors/staff)
  updateAttendance: async (
    sessionId: string,
    data: AttendanceUpdate
  ): Promise<ApiResponse<any>> => {
    try {
      const response = await agent.post(
        `/session/${sessionId}/attendance`,
        data
      );
      return response;
    } catch (error) {
      console.error("Update attendance error:", error);
      throw error;
    }
  },

  // Update session notes (for instructors/staff)
  updateNotes: async (
    sessionId: string,
    data: NotesUpdate
  ): Promise<ApiResponse<any>> => {
    try {
      const response = await agent.post(`/session/${sessionId}/notes`, data);
      return response;
    } catch (error) {
      console.error("Update notes error:", error);
      throw error;
    }
  },

  // Get session attendees (for instructors/staff)
  getSessionAttendees: async (sessionId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await agent.get(`/session/${sessionId}/attendees`);
      return response;
    } catch (error) {
      console.error("Get session attendees error:", error);
      throw error;
    }
  },
};

// Add to your app's API exports
export default SessionsApi;

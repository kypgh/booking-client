import agent from "./agent";

// Auth-related API endpoints
const AuthApi = {
  // Login with email and password
  login: async (email, password) => {
    try {
      const response = await agent.post("/client/login", { email, password });

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
  register: async (userData) => {
    try {
      const response = await agent.post("/client/register", userData);

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
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Optional: can perform additional cleanup here
  },

  // Get current user's profile data
  getCurrentUser: async () => {
    try {
      const response = await agent.get("/client/me");
      return response;
    } catch (error) {
      console.error("Get current user error:", error);
      throw error;
    }
  },

  // Check if user is logged in
  isAuthenticated: () => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("token");
  },

  // Get current user from localStorage
  getCurrentUserFromStorage: () => {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};

export default AuthApi;

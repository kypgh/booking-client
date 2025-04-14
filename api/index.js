import agent from "./agent";
import AuthApi from "./authApi";
import ClassesApi from "./classesApi";
import BookingsApi from "./bookingsApi";
import PackagesApi from "./packagesApi";

// Export all APIs
export { agent, AuthApi, ClassesApi, BookingsApi, PackagesApi };

// Default export for convenience
export default {
  agent,
  auth: AuthApi,
  classes: ClassesApi,
  bookings: BookingsApi,
  packages: PackagesApi,
};

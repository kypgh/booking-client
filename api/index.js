import agent from "./agent";
import AuthApi from "./authApi";
import ClassesApi from "./classesApi";
import BookingsApi from "./bookingsApi";
import PackagesApi from "./packagesApi";
import InvitationApi from "./invitationApi";
import SessionsApi from "./sessionsApi";
import BrandApi from "./brandApi";
import ProfileApi from "./profileApi";

// Export all APIs
export {
  agent,
  AuthApi,
  ClassesApi,
  BookingsApi,
  PackagesApi,
  InvitationApi,
  SessionsApi,
  BrandApi,
  ProfileApi,
};

// Default export for convenience
export default {
  agent,
  auth: AuthApi,
  classes: ClassesApi,
  bookings: BookingsApi,
  packages: PackagesApi,
  invitation: InvitationApi,
  sessions: SessionsApi,
  brand: BrandApi,
  profile: ProfileApi,
};

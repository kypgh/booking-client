import agent from "./agent";
import AuthApi from "./authApi";
import ClassesApi from "./classesApi";
import BookingsApi from "./bookingsApi";
import PackagesApi from "./packagesApi";
import SubscriptionPlanApi from "./subscriptionPlanApi";
import InvitationApi from "./invitationApi";
import SessionsApi from "./sessionsApi";
import BrandApi from "./brandApi";
import ProfileApi from "./profileApi";
import PaymentApi from "./paymentApi";

// Export all APIs
export {
  agent,
  AuthApi,
  ClassesApi,
  BookingsApi,
  PackagesApi,
  SubscriptionPlanApi,
  InvitationApi,
  SessionsApi,
  BrandApi,
  ProfileApi,
  PaymentApi,
};

// Default export for convenience
export default {
  agent,
  auth: AuthApi,
  classes: ClassesApi,
  bookings: BookingsApi,
  packages: PackagesApi,
  subscriptionPlan: SubscriptionPlanApi,
  invitation: InvitationApi,
  sessions: SessionsApi,
  brand: BrandApi,
  profile: ProfileApi,
  payment: PaymentApi,
};

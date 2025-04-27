import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import ClassesApi from "@/api/classesApi";
import BookingsApi from "@/api/bookingsApi";
import PackagesApi from "@/api/packagesApi";
import { useAuth } from "@/contexts/AuthContext";
import InvitationApi, { InvitationData } from "@/api/invitationApi";
import SessionsApi, { SessionDetail } from "@/api/sessionsApi";
import AuthApi from "@/api/authApi";
import BrandApi from "@/api/brandApi";
import ProfileApi from "@/api/profileApi";

// Types
export interface Session {
  id: string;
  dateTime: string;
  formattedDate?: string;
  formattedTime?: string;
  duration: number;
  class: {
    id: string;
    name: string;
    instructor: {
      id: string;
      name: string;
    };
  };
  capacity: number;
  availableSpots: number;
  status?: string;
}

export interface ClassData {
  _id: string;
  name: string;
  description: string;
  duration: number;
  instructor: {
    _id: string;
    name: string;
    roles?: {
      isAdmin?: boolean;
      isInstructor?: boolean;
    };
  };
  businessType: "fixed" | "hourly";
  capacity: number;
  status: string;
  schedule?: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  operatingHours?: {
    days: string[];
    timeBlocks: Array<{
      startTime: string;
      endTime: string;
      interval: number;
      capacity: number;
    }>;
  };
  cancellationPolicy?: {
    hours: number;
  };
  brand?: string;
}

export interface PackageData {
  _id: string;
  id: string;
  name: string;
  description: string;
  credits: number;
  validityDays: number;
  price: number;
  status: string;
}

export interface BookingData {
  _id: string;
  client: {
    _id: string;
    name: string;
    email: string;
  };
  session: {
    _id: string;
    dateTime: string;
    duration: number;
    capacity: number;
    availableSpots: number;
    status: string;
  };
  status: string;
  bookingType: string;
  createdAt: string;
}

export interface SubscriptionPlan {
  _id: string;
  id: string;
  name: string;
  description?: string;
  price: number;
  frequencyLimit?: {
    count: number;
    period: "day" | "week" | "month";
  };
  allowAllClasses: boolean;
  includedClasses: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
  durationDays: number;
  isActive: boolean;
}

// Helper function to check authentication
const useAuthCheck = () => {
  const { isAuthenticated } = useAuth();
  return { enabled: isAuthenticated };
};

// Classes Queries
export const useClassList = (
  businessType?: "fixed" | "hourly",
  brandId?: string
) => {
  const authCheck = useAuthCheck();

  return useQuery({
    queryKey: ["classes", { businessType, brandId }],
    queryFn: async () => {
      const response = await ClassesApi.getAllClasses(
        businessType,
        undefined,
        brandId
      );
      // Filter to only show active classes
      const activeClasses = response.data.filter(
        (classItem: ClassData) => classItem.status === "active"
      );
      return activeClasses as ClassData[];
    },
    ...authCheck,
  });
};
export const useClassDetails = (classId: string) => {
  const authCheck = useAuthCheck();

  return useQuery({
    queryKey: ["classes", classId],
    queryFn: async () => {
      const response = await ClassesApi.getClassById(classId);
      return response.data as ClassData;
    },
    enabled: !!classId && authCheck.enabled,
  });
};

export const useClassSessions = (
  classId: string,
  filters?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    includeFullyBooked?: boolean;
  }
) => {
  const authCheck = useAuthCheck();

  return useQuery({
    queryKey: ["classes", classId, "sessions", filters],
    queryFn: async () => {
      const response = await ClassesApi.getClassSessions(classId, filters);
      return response.data;
    },
    enabled: !!classId && authCheck.enabled,
  });
};

export const useAvailableSessions = (filters?: {
  startDate?: string;
  endDate?: string;
  brandId?: string;
  classId?: string;
  instructorId?: string;
}) => {
  const authCheck = useAuthCheck();

  return useQuery({
    queryKey: ["sessions", "available", filters],
    queryFn: async () => {
      const response = await ClassesApi.getAvailableSessions(filters);
      return response.data as {
        sessions: Session[];
        groupedByDate: Record<string, Session[]>;
      };
    },
    ...authCheck,
  });
};

// Booking Queries
export const useActiveBookings = () => {
  const authCheck = useAuthCheck();

  return useQuery({
    queryKey: ["bookings", "active"],
    queryFn: async () => {
      const response = await BookingsApi.getActiveBookings();
      return response.data as BookingData[];
    },
    ...authCheck,
  });
};

export const useBookingHistory = () => {
  const authCheck = useAuthCheck();

  return useQuery({
    queryKey: ["bookings", "history"],
    queryFn: async () => {
      const response = await BookingsApi.getBookingHistory();
      return response.data as BookingData[];
    },
    ...authCheck,
  });
};

// Package Queries
export const useActivePackages = () => {
  const authCheck = useAuthCheck();

  return useQuery({
    queryKey: ["packages", "active"],
    queryFn: async () => {
      const response = await PackagesApi.getActivePackages();
      return response.data;
    },
    ...authCheck,
  });
};

export const usePackageHistory = () => {
  const authCheck = useAuthCheck();

  return useQuery({
    queryKey: ["packages", "history"],
    queryFn: async () => {
      const response = await PackagesApi.getPackageHistory();
      return response.data;
    },
    ...authCheck,
  });
};

export const usePackageDetails = (packageId: string) => {
  const authCheck = useAuthCheck();

  return useQuery({
    queryKey: ["packages", packageId],
    queryFn: async () => {
      const response = await PackagesApi.getPackageById(packageId);
      return response.data;
    },
    enabled: !!packageId && authCheck.enabled,
  });
};

export const usePackageBookings = (packageBookingId: string) => {
  const authCheck = useAuthCheck();

  return useQuery({
    queryKey: ["packages", packageBookingId, "bookings"],
    queryFn: async () => {
      const response = await PackagesApi.getPackageBookings(packageBookingId);
      return response.data;
    },
    enabled: !!packageBookingId && authCheck.enabled,
  });
};

export const useSubscriptions = () => {
  const authCheck = useAuthCheck();

  return useQuery({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      const response = await PackagesApi.getSubscriptions();
      return response.data;
    },
    ...authCheck,
  });
};

export const useVerifyInvitation = (token: string, enabled = true) => {
  return useQuery({
    queryKey: ["invitation", token],
    queryFn: async () => {
      const response = await InvitationApi.verifyInvitation(token);
      return response.data as InvitationData;
    },
    enabled: !!token && enabled,
  });
};

export const useSessionDetails = (sessionId: string) => {
  const authCheck = useAuthCheck();

  return useQuery({
    queryKey: ["sessions", sessionId],
    queryFn: async () => {
      const response = await SessionsApi.getSessionById(sessionId);
      return response.data as SessionDetail;
    },
    enabled: !!sessionId && authCheck.enabled,
  });
};

// Add a useSession hook for getting single session details
export const useSession = (sessionId: string) => {
  const authCheck = useAuthCheck();

  return useQuery({
    queryKey: ["session", sessionId],
    queryFn: async () => {
      const response = await SessionsApi.getSessionById(sessionId);
      return response.data;
    },
    enabled: !!sessionId && authCheck.enabled,
  });
};

// Hook to get all available packages for a brand
export const useAvailablePackages = (brandId: string) => {
  const authCheck = useAuthCheck();

  return useQuery({
    queryKey: ["packages", "available", brandId],
    queryFn: async () => {
      const response = await PackagesApi.getAvailablePackages(brandId);
      return response.data as PackageData[];
    },
    enabled: !!brandId && authCheck.enabled,
  });
};

// Hook to get subscription plans for a brand
export const useSubscriptionPlans = (brandId: string) => {
  const authCheck = useAuthCheck();

  return useQuery({
    queryKey: ["subscriptions", "plans", brandId],
    queryFn: async () => {
      const response = await PackagesApi.getSubscriptionPlans(brandId);
      return response.data as SubscriptionPlan[];
    },
    enabled: !!brandId && authCheck.enabled,
  });
};

// export const useUserProfile = () => {
//   const authCheck = useAuthCheck();

//   return useQuery({
//     queryKey: ["user", "profile"],
//     queryFn: async () => {
//       const response = await AuthApi.getCurrentUser();
//       return response.data;
//     },
//     ...authCheck,
//   });
// };

export const getBrandInfo = (brandId: string) => {
  return useQuery({
    queryKey: ["brand", "info"],
    queryFn: async () => {
      const response = await BrandApi.getInfoById(brandId);
      return response.data;
    },
  });
};

export const useUserProfile = () => {
  const authCheck = useAuthCheck();

  return useQuery({
    queryKey: ["user", "profile"],
    queryFn: async () => {
      try {
        const response = await ProfileApi.getProfile();
        return response.data;
      } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
      }
    },
    ...authCheck,
  });
};

// Add these hooks to your useApi.ts file

// Session hook for getting session details with brandId
export const useSessionDetailsByBrand = (
  sessionId: string,
  brandId: string
) => {
  const authCheck = useAuthCheck();

  return useQuery({
    queryKey: ["sessions", brandId, sessionId],
    queryFn: async () => {
      const response = await SessionsApi.getSessionById(sessionId, brandId);
      return response.data as SessionDetail;
    },
    enabled: !!sessionId && !!brandId && authCheck.enabled,
  });
};

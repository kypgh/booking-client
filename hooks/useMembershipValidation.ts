import { useActivePackages, useActiveSubscriptions } from './useApi';

export interface MembershipStatus {
  hasActiveCredits: boolean;
  hasActiveSubscription: boolean;
  hasAnyActiveMembership: boolean;
  activeCreditsCount: number;
  activeSubscriptionsCount: number;
  totalCreditsRemaining: number;
}

/**
 * Hook to validate user's membership status for booking sessions
 */
export const useMembershipValidation = (): {
  membershipStatus: MembershipStatus | null;
  isLoading: boolean;
  canBookSession: boolean;
} => {
  const { data: activePackages, isLoading: packagesLoading } = useActivePackages();
  const { data: subscriptionBookings, isLoading: subscriptionsLoading } = useActiveSubscriptions();

  const isLoading = packagesLoading || subscriptionsLoading;

  if (isLoading || !activePackages || !subscriptionBookings) {
    return {
      membershipStatus: null,
      isLoading,
      canBookSession: false,
    };
  }

  // Calculate membership status
  const hasActiveCredits = activePackages.length > 0 && 
    activePackages.some(pkg => pkg.remainingCredits > 0);
  
  const hasActiveSubscription = subscriptionBookings.length > 0 &&
    subscriptionBookings.some(sub => {
      // Handle old subscription format until server is updated
      if (!sub.endDate) return sub.status === 'active'; // No end date means active
      return sub.status === 'active' && new Date(sub.endDate) > new Date();
    });

  const totalCreditsRemaining = activePackages.reduce(
    (total, pkg) => total + pkg.remainingCredits, 
    0
  );

  const membershipStatus: MembershipStatus = {
    hasActiveCredits,
    hasActiveSubscription,
    hasAnyActiveMembership: hasActiveCredits || hasActiveSubscription,
    activeCreditsCount: activePackages.filter(pkg => pkg.remainingCredits > 0).length,
    activeSubscriptionsCount: subscriptionBookings.filter(sub => {
      // Handle old subscription format until server is updated
      if (!sub.endDate) return sub.status === 'active';
      return sub.status === 'active' && new Date(sub.endDate) > new Date();
    }).length,
    totalCreditsRemaining,
  };

  return {
    membershipStatus,
    isLoading: false,
    canBookSession: membershipStatus.hasAnyActiveMembership,
  };
};

/**
 * Hook to get available membership options for booking
 */
export const useAvailableMemberships = () => {
  const { data: activePackages, isLoading: packagesLoading } = useActivePackages();
  const { data: subscriptionBookings, isLoading: subscriptionsLoading } = useActiveSubscriptions();

  const isLoading = packagesLoading || subscriptionsLoading;

  if (isLoading || !activePackages || !subscriptionBookings) {
    return {
      availableCredits: [],
      availableSubscriptions: [],
      isLoading,
    };
  }

  // Filter to only active/usable memberships
  const availableCredits = activePackages.filter(pkg => pkg.remainingCredits > 0);
  
  const availableSubscriptions = subscriptionBookings.filter(sub => {
    // Handle old subscription format until server is updated
    if (!sub.endDate) return sub.status === 'active'; // No end date means active
    return sub.status === 'active' && new Date(sub.endDate) > new Date();
  });

  return {
    availableCredits,
    availableSubscriptions,
    isLoading: false,
  };
};

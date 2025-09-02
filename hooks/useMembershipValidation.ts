import { useClientMemberships } from './useApi';
import { useBrand } from '@/contexts/BrandContext';

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
  const { activeBrandId } = useBrand();
  const { data: memberships, isLoading } = useClientMemberships();

  if (isLoading || !memberships || !activeBrandId) {
    return {
      membershipStatus: null,
      isLoading,
      canBookSession: false,
    };
  }

  // Find membership for current brand
  const currentBrandMembership = memberships.memberships?.find(m => m.brandId === activeBrandId);
  
  if (!currentBrandMembership) {
    return {
      membershipStatus: {
        hasActiveCredits: false,
        hasActiveSubscription: false,
        hasAnyActiveMembership: false,
        activeCreditsCount: 0,
        activeSubscriptionsCount: 0,
        totalCreditsRemaining: 0,
      },
      isLoading: false,
      canBookSession: false,
    };
  }

  const membershipStatus: MembershipStatus = {
    hasActiveCredits: currentBrandMembership.hasActivePackage,
    hasActiveSubscription: currentBrandMembership.hasActiveSubscription,
    hasAnyActiveMembership: currentBrandMembership.hasActiveMembership,
    activeCreditsCount: currentBrandMembership.activeCreditPackages?.length || 0,
    activeSubscriptionsCount: currentBrandMembership.activeSubscription ? 1 : 0,
    totalCreditsRemaining: currentBrandMembership.activeCreditPackages?.reduce(
      (total, pkg) => total + pkg.remainingCredits, 0
    ) || 0,
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
  const { activeBrandId } = useBrand();
  const { data: memberships, isLoading } = useClientMemberships();

  if (isLoading || !memberships || !activeBrandId) {
    return {
      availableCredits: [],
      availableSubscriptions: [],
      isLoading,
    };
  }

  // Find membership for current brand
  const currentBrandMembership = memberships.memberships?.find(m => m.brandId === activeBrandId);
  
  if (!currentBrandMembership) {
    return {
      availableCredits: [],
      availableSubscriptions: [],
      isLoading: false,
    };
  }

  // Return the actual detailed package and subscription data
  const availableCredits = currentBrandMembership.activeCreditPackages?.filter(pkg => 
    pkg.remainingCredits > 0 && pkg.status === 'active'
  ) || [];
  const availableSubscriptions = currentBrandMembership.activeSubscription && 
    currentBrandMembership.activeSubscription.status === 'active' ? 
    [currentBrandMembership.activeSubscription] : [];

  return {
    availableCredits,
    availableSubscriptions,
    isLoading: false,
  };
};

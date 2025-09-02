// pages/plans.tsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import BrandLayout from "@/components/layouts/BrandLayout";
import { useBrand } from "@/contexts/BrandContext";
import {
  useAvailablePackages,
  useSubscriptionPlans,
  useClientMemberships,
  useRefreshPlans,
  PackageData,
  SubscriptionPlan,
} from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";

// Components
import CurrentPlanCard from "@/components/CurrentPlanCard";
import ModernPlanCard from "@/components/ModernPlanCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Crown,
  Package,
  Zap,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { PlanCardSkeleton, CardSkeleton } from "@/components/ui/skeleton";
import { toast } from "react-hot-toast";

export default function PlansPage() {
  const router = useRouter();
  const { activeBrandId } = useBrand();
  const queryClient = useQueryClient();
  const { refreshAllPlans } = useRefreshPlans();
  const [isMyPlansExpanded, setIsMyPlansExpanded] = useState(false);

  // Fetch data with consolidated loading state
  const { data: packages, isLoading: packagesLoading } = useAvailablePackages(activeBrandId as string);
  const { data: subscriptionPlans, isLoading: subscriptionPlansLoading } = useSubscriptionPlans(activeBrandId as string);
  const { data: memberships, isLoading: membershipsLoading } = useClientMemberships();

  // Consolidated loading state
  const isLoading = packagesLoading || subscriptionPlansLoading || membershipsLoading;





  // Check if user just completed a purchase
  useEffect(() => {
    const justPurchased = sessionStorage.getItem('justPurchased');
    if (justPurchased === 'true') {
      // Clear the flag
      sessionStorage.removeItem('justPurchased');
      
      // Use the consolidated refresh function
      refreshAllPlans();
      
      toast.success('Your purchase has been processed! Your plan is now active.');
    }
  }, [refreshAllPlans]);

  // Manual refresh function - single coordinated refresh
  const handleRefresh = async () => {
    try {
      // Use the consolidated refresh function from useRefreshPlans
      refreshAllPlans();
      toast.success('Plans refreshed successfully!');
    } catch (error) {
      toast.error('Failed to refresh plans. Please try again.');
    }
  };

  const hasActiveMemberships = () => {
    if (!memberships || !activeBrandId) return false;
    
    // Find membership for the current brand
    const currentBrandMembership = memberships.memberships?.find(m => m.brandId === activeBrandId);
    
    return currentBrandMembership?.hasActiveMembership || false;
  };

  if (isLoading) {
    return (
      <BrandLayout title="Plans | FitBook" headerTitle="Plans">
        <div className="flex justify-center items-center min-h-[50vh]">
          <LoadingSpinner size="lg" />
        </div>
      </BrandLayout>
    );
  }

  return (
    <BrandLayout title="Plans | FitBook" headerTitle="Plans">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* My Plans - Collapsible */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div 
            className="flex items-center justify-between p-4 bg-card/50 hover:bg-card/70 transition-colors cursor-pointer border-b border-border"
            onClick={() => setIsMyPlansExpanded(!isMyPlansExpanded)}
          >
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">My Plans</h2>
              <span className="text-sm text-muted-foreground">
                ({(() => {
                  if (!hasActiveMemberships()) return 'No active plans';
                  
                  const currentBrandMembership = memberships?.memberships?.find(m => m.brandId === activeBrandId);
                  if (!currentBrandMembership) return 'No active plans';
                  
                  const subscriptionCount = currentBrandMembership.activeSubscription ? 1 : 0;
                  const packageCount = currentBrandMembership.activeCreditPackages?.length || 0;
                  const totalCount = subscriptionCount + packageCount;
                  
                  return `${totalCount} active plan${totalCount !== 1 ? 's' : ''}`;
                })()})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRefresh();
                }}
                disabled={isLoading}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <div className={`transform transition-transform duration-200 ${isMyPlansExpanded ? 'rotate-180' : ''}`}>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
          
          <div className={`transition-all duration-300 ease-in-out ${
            isMyPlansExpanded 
              ? 'max-h-[800px] opacity-100' 
              : 'max-h-0 opacity-0'
          } overflow-hidden`}>
            <div className="p-4 space-y-4 max-h-[800px] overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <CardSkeleton />
              ) : hasActiveMemberships() ? (
                <>
                  {(() => {
                    const currentBrandMembership = memberships?.memberships?.find(m => m.brandId === activeBrandId);
                    if (!currentBrandMembership) return null;
                    
                    return (
                      <div className="space-y-4">
                        {/* Show active subscription */}
                        {currentBrandMembership.activeSubscription && (
                          <CurrentPlanCard 
                            key={currentBrandMembership.activeSubscription.id}
                            plan={{
                              _id: currentBrandMembership.activeSubscription.id,
                              subscriptionPlan: currentBrandMembership.activeSubscription.plan,
                              startDate: currentBrandMembership.activeSubscription.startDate,
                              endDate: currentBrandMembership.activeSubscription.endDate,
                              status: currentBrandMembership.activeSubscription.status,
                            }}
                            type="subscription" 
                          />
                        )}
                        
                        {/* Show active credit packages */}
                        {currentBrandMembership.activeCreditPackages?.map((creditPackage) => (
                          <CurrentPlanCard 
                            key={creditPackage.id}
                            plan={{
                              _id: creditPackage.id,
                              package: creditPackage.plan,
                              initialCredits: creditPackage.initialCredits,
                              remainingCredits: creditPackage.remainingCredits,
                              startDate: creditPackage.startDate,
                              expiryDate: creditPackage.endDate,
                              status: creditPackage.status,
                            }}
                            type="package" 
                          />
                        ))}
                      </div>
                    );
                  })()}
                </>
              ) : (
                <div className="p-6 border border-dashed border-border rounded-lg text-center">
                  <div className="w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-2">No Active Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a plan below to get started with your fitness journey
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Available Plans Section */}
        <div className="space-y-8">
          <div className={`${hasActiveMemberships() ? 'pt-8 border-t border-border' : ''}`}>

            {/* Credit Plans */}
            {packagesLoading ? (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Credit Plans</h3>
                  <Badge variant="secondary" className="text-xs">Pay per use</Badge>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <PlanCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            ) : packages && packages.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Credit Plans</h3>
                  <Badge variant="secondary" className="text-xs">Pay per use</Badge>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
                  {packages.map((pkg) => {
                    // Check if user owns this specific package
                    const currentBrandMembership = memberships?.memberships?.find(m => m.brandId === activeBrandId);
                    const isOwned = currentBrandMembership?.activeCreditPackages?.some(
                      creditPkg => creditPkg.plan.id === pkg._id
                    ) || false;
                    
                    return (
                      <ModernPlanCard
                        key={pkg._id}
                        title={pkg.name}
                        description={pkg.description}
                        price={pkg.price}
                        credits={pkg.credits}
                        validityDays={pkg.validityDays}
                        popular={pkg.credits >= 20}
                        type="credit"
                        itemId={pkg._id}
                        isOwned={isOwned}
                        cancellationPolicyHours={24} // Default to 24 hours, should be fetched from backend
                        onSuccess={() => {
                          // Query invalidation is now handled in the payment success page
                          // No need to reload the page
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Subscription Plans */}
            {subscriptionPlans && subscriptionPlans.length > 0 && (
              <div className="space-y-6 mt-12">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Subscription Plans</h3>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
                  {subscriptionPlans.map((plan) => {
                    const planId = plan._id;
                    // Check if user owns this specific subscription plan
                    const currentBrandMembership = memberships?.memberships?.find(m => m.brandId === activeBrandId);
                    const isOwned = currentBrandMembership?.activeSubscription?.plan.id === planId || false;
                    
                    return (
                      <ModernPlanCard
                        key={planId || plan.name}
                        title={plan.name}
                        description={plan.description}
                        price={plan.price}
                        allowAllClasses={plan.allowAllClasses}
                        frequencyLimit={plan.frequencyLimit}
                        includedClasses={plan.includedClasses}
                        popular={false}
                        type="subscription"
                        itemId={planId}
                        isOwned={isOwned}
                        cancellationPolicyHours={24} // Default to 24 hours, should be fetched from backend
                        onSuccess={() => {
                          // Query invalidation is now handled in the payment success page
                          // No need to reload the page
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </BrandLayout>
  );
}

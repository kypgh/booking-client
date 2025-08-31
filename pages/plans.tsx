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
  const { data: memberships, isLoading: membershipsLoading } = useClientMemberships(activeBrandId as string);

  // Consolidated loading state
  const isLoading = packagesLoading || subscriptionPlansLoading || membershipsLoading;

  // Debug logging to understand data structure
  useEffect(() => {
    console.log("=== PLANS PAGE DEBUG ===");
    console.log("memberships:", memberships);
    console.log("packages:", packages);
    console.log("subscriptionPlans:", subscriptionPlans);
    console.log("hasActiveMemberships():", hasActiveMemberships());
    
    if (memberships) {
      console.log("Active packages:", memberships.packages?.filter(p => p.status === 'active'));
      console.log("Active subscriptions:", memberships.subscriptions?.filter(s => s.status === 'active'));
    }
    
    console.log("===========================");
  }, [memberships, packages, subscriptionPlans]);

  // Disable auto-refresh to prevent excessive requests - user can manually refresh
  // const { refresh: refreshPlansData } = useAutoRefresh({
  //   ...REFRESH_CONFIGS.PLANS,
  //   enabled: false, // Disabled to prevent excessive requests
  // });

  // Check if user just completed a purchase
  useEffect(() => {
    const justPurchased = sessionStorage.getItem('justPurchased');
    if (justPurchased === 'true') {
      console.log("=== PURCHASE DETECTED ===");
      console.log("Refreshing all plan data...");
      
      // Clear the flag
      sessionStorage.removeItem('justPurchased');
      
      // Use the consolidated refresh function
      refreshAllPlans();
      
      toast.success('Your purchase has been processed! Your plan is now active.');
      console.log("=========================");
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

  // Purchase logic removed - using Stripe payment flow directly

  const hasActiveMemberships = () => {
    if (!memberships) return false;
    const activePackages = memberships.packages?.filter(p => p.status === 'active') || [];
    const activeSubscriptions = memberships.subscriptions?.filter(s => s.status === 'active') || [];
    return activePackages.length > 0 || activeSubscriptions.length > 0;
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
                ({hasActiveMemberships() ? 
                  `${(memberships?.packages?.filter(p => p.status === 'active')?.length || 0) + (memberships?.subscriptions?.filter(s => s.status === 'active')?.length || 0)} active` : 
                  'No active plans'
                })
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
              ? 'max-h-[1000px] opacity-100' 
              : 'max-h-0 opacity-0'
          } overflow-hidden`}>
            <div className="p-4 space-y-4">
              {isLoading ? (
                <CardSkeleton />
              ) : hasActiveMemberships() ? (
                <>
                  {/* Show active packages */}
                  {memberships?.packages?.filter(p => p.status === 'active').map((pkg, index) => (
                    <CurrentPlanCard 
                      key={pkg._id}
                      plan={pkg} 
                      type="package" 
                    />
                  ))}
                  
                  {/* Show active subscriptions */}
                  {memberships?.subscriptions?.filter(s => s.status === 'active').map((sub, index) => (
                    <CurrentPlanCard 
                      key={sub._id}
                      plan={sub} 
                      type="subscription" 
                    />
                  ))}
                  
                  {/* Debug: Show raw data if no plans are displayed */}
                  {!hasActiveMemberships() && memberships && (
                    <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                      <h4 className="font-medium text-yellow-800 mb-2">Debug: Data Found but Not Displayed</h4>
                      <div className="text-sm text-yellow-700 space-y-1">
                        <div>Memberships: {JSON.stringify(memberships)}</div>
                      </div>
                    </div>
                  )}
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
                    const isOwned = memberships?.packages?.some(mp => 
                      mp.package._id === pkg._id && mp.status === 'active'
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
                    const isOwned = memberships?.subscriptions?.some(ms => {
                      const subPlan = typeof ms.subscriptionPlan === 'string' 
                        ? ms.subscriptionPlan 
                        : ms.subscriptionPlan?._id;
                      return subPlan === planId && ms.status === 'active';
                    }) || false;
                    
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

      {/* Purchase dialog removed - using Stripe payment flow */}
    </BrandLayout>
  );
}

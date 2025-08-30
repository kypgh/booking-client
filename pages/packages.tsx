// pages/packages.tsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import BrandLayout from "@/components/layouts/BrandLayout";
import { useBrand } from "@/contexts/BrandContext";
import {
  useAvailablePackages,
  useSubscriptionPlans,
  useActivePackages,
  useActiveSubscriptions,
  useRefreshPlans,
  useOwnedPackages,
  useSubscriptionOwnership,
  PackageData,
  SubscriptionPlan,
} from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";
// Removed unused imports - using Stripe payment flow directly

// Components
import CurrentPlanCard from "@/components/CurrentPlanCard";
import ModernPlanCard from "@/components/ModernPlanCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Crown,
  Package,
  Zap,
  RefreshCw
} from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { toast } from "react-hot-toast";

export default function PlansPage() {
  const router = useRouter();
  const { activeBrandId } = useBrand();
  const queryClient = useQueryClient();
  const { refreshAllPlans } = useRefreshPlans();

  // State removed - using Stripe payment flow directly

  // Fetch data
  const { data: packages, isLoading: packagesLoading } = useAvailablePackages(activeBrandId as string);
  const { data: subscriptionPlans, isLoading: subscriptionPlansLoading } = useSubscriptionPlans(activeBrandId as string);
  const { data: activePackages, isLoading: activePackagesLoading, refetch: refetchActivePackages } = useActivePackages();
  const { data: activeSubscriptions, isLoading: activeSubscriptionsLoading, refetch: refetchActiveSubscriptions } = useActiveSubscriptions();
  const { data: ownedPackageIds } = useOwnedPackages();

  // Check if user just completed a purchase
  useEffect(() => {
    const justPurchased = sessionStorage.getItem('justPurchased');
    if (justPurchased === 'true') {
      // Clear the flag
      sessionStorage.removeItem('justPurchased');
      // Refetch active plans
      refetchActivePackages();
      refetchActiveSubscriptions();
      toast.success('Your purchase has been processed! Your plan is now active.');
    }
  }, [refetchActivePackages, refetchActiveSubscriptions]);

  // Manual refresh function
  const handleRefresh = async () => {
    try {
      refreshAllPlans();
      await Promise.all([
        refetchActivePackages(),
        refetchActiveSubscriptions()
      ]);
      toast.success('Plans refreshed successfully!');
    } catch (error) {
      toast.error('Failed to refresh plans. Please try again.');
    }
  };

  // Purchase logic removed - using Stripe payment flow directly

  const hasActiveMemberships = () => {
    return (activePackages?.length || 0) > 0 || (activeSubscriptions?.length || 0) > 0;
  };

  if (packagesLoading || subscriptionPlansLoading || activePackagesLoading || activeSubscriptionsLoading) {
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

        {/* Current Active Plan */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Your Current Plan</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={activePackagesLoading || activeSubscriptionsLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${(activePackagesLoading || activeSubscriptionsLoading) ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          {hasActiveMemberships() ? (
            <>
              {/* Show first active package or subscription */}
              {activePackages && activePackages.length > 0 && (
                <CurrentPlanCard 
                  plan={activePackages[0]} 
                  type="package" 
                />
              )}
              
              {activeSubscriptions && activeSubscriptions.length > 0 && (
                <CurrentPlanCard 
                  plan={activeSubscriptions[0]} 
                  type="subscription" 
                />
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

        {/* Available Plans Section */}
        <div className="space-y-8">
          <div className={`${hasActiveMemberships() ? 'pt-8 border-t border-border' : ''}`}>

            {/* Credit Plans */}
            {packages && packages.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Credit Plans</h3>
                  <Badge variant="secondary" className="text-xs">Pay per use</Badge>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
                  {packages.map((pkg) => (
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
                      isOwned={ownedPackageIds?.includes(pkg._id) || false}
                      cancellationPolicyHours={24} // Default to 24 hours, should be fetched from backend
                      onSuccess={() => {
                        // Query invalidation is now handled in the payment success page
                        // No need to reload the page
                      }}
                    />
                  ))}
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
                    // Check if user owns this subscription plan by comparing subscriptionPlan._id
                    const isOwned = activeSubscriptions?.some(sub => (sub as any).subscriptionPlan?._id === plan._id) || false;
                    return (
                      <ModernPlanCard
                        key={plan._id}
                        title={plan.name}
                        description={plan.description}
                        price={plan.price}
                        allowAllClasses={plan.allowAllClasses}
                        frequencyLimit={plan.frequencyLimit}
                        includedClasses={plan.includedClasses}
                        popular={false}
                        type="subscription"
                        itemId={plan._id}
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

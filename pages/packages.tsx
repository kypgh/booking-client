// pages/packages.tsx
import React, { useState } from "react";
import { useRouter } from "next/router";
import BrandLayout from "@/components/layouts/BrandLayout";
import { useBrand } from "@/contexts/BrandContext";
import {
  useAvailablePackages,
  useSubscriptionPlans,
  useActivePackages,
  useActiveSubscriptions,
  PackageData,
  SubscriptionPlan,
} from "@/hooks/useApi";
import {
  usePurchasePackage,
  usePurchaseSubscription,
} from "@/hooks/useMutations";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

// Components
import PurchaseConfirmDialog from "@/components/PurchaseConfirmDialog";
import CurrentPlanCard from "@/components/CurrentPlanCard";
import ModernPlanCard from "@/components/ModernPlanCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Crown,
  Package,
  Zap
} from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function PlansPage() {
  const router = useRouter();
  const { activeBrandId } = useBrand();

  // Purchase confirmation state
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PackageData | SubscriptionPlan | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<"package" | "subscription">("package");

  // Fetch data
  const { data: packages, isLoading: packagesLoading } = useAvailablePackages(activeBrandId as string);
  const { data: subscriptionPlans, isLoading: subscriptionPlansLoading } = useSubscriptionPlans(activeBrandId as string);
  const { data: activePackages, isLoading: activePackagesLoading } = useActivePackages();
  const { data: activeSubscriptions, isLoading: activeSubscriptionsLoading } = useActiveSubscriptions();

  // Purchase mutations
  const { mutate: purchasePackage, isPending: isPurchasingPackage } = usePurchasePackage();
  const { mutate: purchaseSubscription, isPending: isPurchasingSubscription } = usePurchaseSubscription();

  // Helper functions
  const handleOpenPurchaseDialog = (item: PackageData | SubscriptionPlan, type: "package" | "subscription") => {
    setSelectedItem(item);
    setSelectedItemType(type);
    setIsPurchaseDialogOpen(true);
  };

  const handleConfirmPurchase = () => {
    if (!selectedItem || !activeBrandId) return;

    if (selectedItemType === "package") {
      purchasePackage(
        {
          packageId: (selectedItem as PackageData)._id,
          paymentData: { amount: selectedItem.price, transactionId: `pkg_${Date.now()}` },
        },
        {
          onSuccess: () => {
            toast.success("Plan purchased successfully!");
            setIsPurchaseDialogOpen(false);
          },
          onError: (error: any) => {
            toast.error(error.message || "Failed to purchase plan");
          },
        }
      );
    } else {
      purchaseSubscription(
        {
          planId: selectedItem.id,
          brandId: activeBrandId,
          paymentMethod: "credit_card",
          transactionId: `sub_${Date.now()}`,
        },
        {
          onSuccess: () => {
            toast.success("Plan purchased successfully!");
            setIsPurchaseDialogOpen(false);
          },
          onError: (error: any) => {
            toast.error(error.message || "Failed to purchase plan");
          },
        }
      );
    }
  };

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
          <div className="flex items-center gap-2 mb-4">
            <Crown className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Your Current Plan</h2>
          </div>
          
          {hasActiveMemberships() ? (
            <>
              {/* Show first active package or subscription */}
              {activePackages && activePackages.length > 0 && (
                <CurrentPlanCard 
                  plan={activePackages[0]} 
                  type="package" 
                  onManage={() => router.push(`/packages/${activePackages[0]._id}`)}
                />
              )}
              
              {activeSubscriptions && activeSubscriptions.length > 0 && (
                <CurrentPlanCard 
                  plan={activeSubscriptions[0]} 
                  type="subscription" 
                  onManage={() => router.push(`/subscriptions/${activeSubscriptions[0]._id}`)}
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
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                      onSelect={() => handleOpenPurchaseDialog(pkg, "package")}
                      isLoading={isPurchasingPackage && selectedItem?._id === pkg._id}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Monthly Plans */}
            {subscriptionPlans && subscriptionPlans.length > 0 && (
              <div className="space-y-6 mt-12">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Monthly Plans</h3>
                  <Badge variant="secondary" className="text-xs">Unlimited access</Badge>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {subscriptionPlans.map((plan) => (
                    <ModernPlanCard
                      key={plan.id}
                      title={plan.name}
                      description={plan.description}
                      price={plan.price}
                      allowAllClasses={plan.allowAllClasses}
                      frequencyLimit={plan.frequencyLimit}
                      popular={plan.allowAllClasses}
                      type="subscription"
                      onSelect={() => handleOpenPurchaseDialog(plan, "subscription")}
                      isLoading={isPurchasingSubscription && selectedItem?.id === plan.id}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>


      </div>

      {/* Purchase Dialog */}
      {selectedItem && (
        <PurchaseConfirmDialog
          isOpen={isPurchaseDialogOpen}
          onClose={() => setIsPurchaseDialogOpen(false)}
          onConfirm={handleConfirmPurchase}
          isLoading={isPurchasingPackage || isPurchasingSubscription}
          item={selectedItem}
          itemType={selectedItemType}
        />
      )}
    </BrandLayout>
  );
}

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import MainLayout from "@/components/layouts/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  useAvailablePackages,
  useSubscriptionPlans,
  PackageData,
  SubscriptionPlan,
} from "@/hooks/useApi";
import {
  usePurchasePackage,
  usePurchaseSubscription,
} from "@/hooks/useMutations";
import { toast } from "react-hot-toast";

// Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PricingCard from "@/components/PricingCard";
import PurchaseConfirmDialog from "@/components/PurchaseConfirmDialog";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function PackagesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeBrandId, setActiveBrandId] = useState<string | null>(null);

  // Purchase confirmation state
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] =
    useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<
    PackageData | SubscriptionPlan | null
  >(null);
  const [selectedItemType, setSelectedItemType] = useState<
    "package" | "subscription"
  >("package");

  // Get current brand ID from user
  useEffect(() => {
    if (user && user.brands && user.brands.length > 0) {
      // Depending on how your user.brands is structured
      const brandId =
        typeof user.brands[0] === "string"
          ? user.brands[0]
          : (user.brands[0] as any).id;

      setActiveBrandId(brandId);
    }
  }, [user]);

  // Fetch packages and subscription plans
  const {
    data: packages,
    isLoading: packagesLoading,
    error: packagesError,
  } = useAvailablePackages(activeBrandId || "");

  const {
    data: subscriptionPlans,
    isLoading: subscriptionPlansLoading,
    error: subscriptionPlansError,
  } = useSubscriptionPlans(activeBrandId || "");

  // Purchase mutations
  const { mutate: purchasePackage, isPending: isPurchasingPackage } =
    usePurchasePackage();
  const { mutate: purchaseSubscription, isPending: isPurchasingSubscription } =
    usePurchaseSubscription();

  // If not authenticated, redirect to login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleOpenPurchaseDialog = (
    item: PackageData | SubscriptionPlan,
    type: "package" | "subscription"
  ) => {
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
          paymentData: {
            amount: selectedItem.price,
            transactionId: `pkg_${Date.now()}`,
          },
        },
        {
          onSuccess: () => {
            toast.success("Package purchased successfully!");
            setIsPurchaseDialogOpen(false);
          },
          onError: (error: any) => {
            toast.error(error.message || "Failed to purchase package");
          },
        }
      );
    } else {
      // Subscription purchase
      purchaseSubscription(
        {
          planId: selectedItem.id,
          brandId: activeBrandId,
          paymentMethod: "credit_card",
          transactionId: `sub_${Date.now()}`,
        },
        {
          onSuccess: () => {
            toast.success("Subscription purchased successfully!");
            setIsPurchaseDialogOpen(false);
          },
          onError: (error: any) => {
            toast.error(error.message || "Failed to purchase subscription");
          },
        }
      );
    }
  };

  // Generate features list for package display
  const getPackageFeatures = (pkg: PackageData) => {
    return [
      { included: true, text: `${pkg.credits} credits` },
      { included: true, text: `Valid for ${pkg.validityDays} days` },
      { included: true, text: `Book any class (subject to availability)` },
      {
        included: pkg.validityDays >= 60,
        text: "Extended validity period",
      },
      {
        included: pkg.credits >= 20,
        text: "Priority booking",
      },
    ];
  };

  // Generate features list for subscription display
  const getSubscriptionFeatures = (sub: SubscriptionPlan) => {
    const features = [
      {
        included: true,
        text: `${sub.durationDays}-day subscription`,
      },
      {
        included: sub.allowAllClasses,
        text: "Access to all classes",
      },
    ];

    // Add frequency limit feature if present
    if (sub.frequencyLimit) {
      features.push({
        included: true,
        text: `Up to ${sub.frequencyLimit.count} classes per ${sub.frequencyLimit.period}`,
      });
    } else {
      features.push({
        included: true,
        text: "Unlimited class attendance",
      });
    }

    // Add specific classes info if not allowing all classes
    if (!sub.allowAllClasses && sub.includedClasses.length > 0) {
      features.push({
        included: true,
        text: `Access to ${sub.includedClasses.length} specific classes`,
      });
    }

    // Additional features based on price
    features.push({
      included: sub.price >= 100,
      text: "Premium member benefits",
    });

    return features;
  };

  const isLoading = authLoading || !activeBrandId;

  if (isLoading) {
    return (
      <MainLayout title="Packages & Subscriptions | FitBook" loading={true}>
        <LoadingSpinner />
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Packages & Subscriptions | FitBook"
      headerTitle="Packages & Subscriptions"
    >
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Choose Your Plan</h1>
          <p className="text-muted-foreground mt-2">
            Select a package or subscription that best fits your fitness needs
          </p>
        </div>

        <Tabs defaultValue="packages">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="packages" className="flex-1">
              Credit Packages
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex-1">
              Subscriptions
            </TabsTrigger>
          </TabsList>

          {/* Packages Tab */}
          <TabsContent value="packages">
            {packagesLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : packagesError ? (
              <div className="text-center py-8 text-destructive">
                <p>Error loading packages. Please try again.</p>
              </div>
            ) : packages && packages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <PricingCard
                    key={pkg._id}
                    title={pkg.name}
                    description={pkg.description}
                    price={pkg.price}
                    features={getPackageFeatures(pkg)}
                    badge={pkg.credits >= 20 ? "Popular" : undefined}
                    onPurchase={() => handleOpenPurchaseDialog(pkg, "package")}
                    isLoading={
                      isPurchasingPackage && selectedItem?._id === pkg._id
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No packages available at this time.</p>
              </div>
            )}
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions">
            {subscriptionPlansLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : subscriptionPlansError ? (
              <div className="text-center py-8 text-destructive">
                <p>Error loading subscription plans. Please try again.</p>
              </div>
            ) : subscriptionPlans && subscriptionPlans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subscriptionPlans.map((plan) => (
                  <PricingCard
                    key={plan.id}
                    title={plan.name}
                    description={plan.description}
                    price={plan.price}
                    features={getSubscriptionFeatures(plan)}
                    badge={plan.allowAllClasses ? "Unlimited" : undefined}
                    onPurchase={() =>
                      handleOpenPurchaseDialog(plan, "subscription")
                    }
                    isLoading={
                      isPurchasingSubscription && selectedItem?.id === plan.id
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No subscription plans available at this time.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Info Section */}
        <div className="border-t pt-6 mt-12">
          <h2 className="text-lg font-semibold mb-4">
            About Our Membership Options
          </h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium">Credit Packages</h3>
              <p className="text-muted-foreground">
                Purchase credit packages to book individual classes. Credits are
                valid for a specific period and can be used for any available
                class.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Subscriptions</h3>
              <p className="text-muted-foreground">
                Subscribe for regular access to classes with our monthly
                membership plans. Choose between plans with different class
                access and frequency limits.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Confirmation Dialog */}
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
    </MainLayout>
  );
}

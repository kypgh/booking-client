// pages/packages.tsx
import React, { useState } from "react";
import { useRouter } from "next/router";
import BrandLayout from "@/components/layouts/BrandLayout";
import { useBrand } from "@/contexts/BrandContext";
import {
  useAvailablePackages,
  useSubscriptionPlans,
  useActivePackages,
  useOwnedPackages,
  useActiveSubscriptions,
  useOwnedSubscriptions,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { Package, CreditCard, CalendarClock } from "lucide-react";
import PackageCard from "@/components/PackageCard";
import SubscriptionCard from "@/components/SubscriptionCard";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function PackagesPage() {
  const router = useRouter();
  const { activeBrandId } = useBrand();

  // Purchase confirmation state
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] =
    useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<
    PackageData | SubscriptionPlan | null
  >(null);
  const [selectedItemType, setSelectedItemType] = useState<
    "package" | "subscription"
  >("package");

  // Fetch packages and subscription plans using activeBrandId
  const {
    data: packages,
    isLoading: packagesLoading,
    error: packagesError,
  } = useAvailablePackages(activeBrandId as string);

  const {
    data: subscriptionPlans,
    isLoading: subscriptionPlansLoading,
    error: subscriptionPlansError,
  } = useSubscriptionPlans(activeBrandId as string);

  // Fetch active packages for the client
  const {
    data: activePackages,
    isLoading: activePackagesLoading,
    error: activePackagesError,
  } = useActivePackages();

  // Fetch active subscriptions for the client
  const {
    data: activeSubscriptions,
    isLoading: activeSubscriptionsLoading,
    error: activeSubscriptionsError,
  } = useActiveSubscriptions();

  // Get a list of owned package IDs
  const { data: ownedPackageIds, isLoading: ownedPackagesLoading } =
    useOwnedPackages();

  // Get a list of owned subscription plan IDs
  const { data: ownedSubscriptionIds, isLoading: ownedSubscriptionsLoading } =
    useOwnedSubscriptions();

  console.log(subscriptionPlans, ownedSubscriptionIds);

  // Purchase mutations
  const { mutate: purchasePackage, isPending: isPurchasingPackage } =
    usePurchasePackage();
  const { mutate: purchaseSubscription, isPending: isPurchasingSubscription } =
    usePurchaseSubscription();

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

    if (!sub.allowAllClasses && sub.includedClasses.length > 0) {
      features.push({
        included: true,
        text: `Access to ${sub.includedClasses.length} specific classes`,
      });
    }

    features.push({
      included: sub.price >= 100,
      text: "Premium member benefits",
    });

    return features;
  };

  // Check if a package is already owned
  const isPackageOwned = (packageId: string): boolean => {
    if (!ownedPackageIds) return false;
    return ownedPackageIds.includes(packageId);
  };

  // Check if a subscription plan is already owned
  const isSubscriptionOwned = (planId: string): boolean => {
    if (!ownedSubscriptionIds) return false;
    return ownedSubscriptionIds.includes(planId);
  };

  // Check if the user has any active memberships (packages or subscriptions)
  const hasActiveMemberships = (): boolean => {
    const hasPackages = activePackages ? activePackages.length > 0 : false;
    const hasSubscriptions = activeSubscriptions
      ? activeSubscriptions.length > 0
      : false;
    return hasPackages || hasSubscriptions;
  };

  return (
    <BrandLayout
      title="Membership Options | FitBook"
      headerTitle="Membership Options"
    >
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Choose Your Plan</h1>
          <p className="text-muted-foreground mt-2">
            Select a membership option that best fits your fitness needs
          </p>
        </div>

        <Tabs defaultValue="credits">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="credits" className="flex-1">
              <Package className="h-4 w-4 mr-2" />
              Credit Packages
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex-1">
              <CalendarClock className="h-4 w-4 mr-2" />
              Subscriptions
            </TabsTrigger>
            <TabsTrigger value="myplans" className="flex-1">
              <CreditCard className="h-4 w-4 mr-2" />
              My Plans
            </TabsTrigger>
          </TabsList>

          {/* Credit Packages Tab */}
          <TabsContent value="credits">
            {packagesLoading || ownedPackagesLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : packagesError ? (
              <div className="text-center py-8 text-destructive">
                <p>Error loading packages. Please try again.</p>
              </div>
            ) : packages && packages.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {packages.map((pkg) => (
                    <PricingCard
                      key={pkg._id}
                      title={pkg.name}
                      description={pkg.description}
                      price={pkg.price}
                      features={getPackageFeatures(pkg)}
                      badge={pkg.credits >= 20 ? "Popular" : undefined}
                      onPurchase={() =>
                        handleOpenPurchaseDialog(pkg, "package")
                      }
                      isLoading={
                        isPurchasingPackage && selectedItem?._id === pkg._id
                      }
                      alreadyOwned={isPackageOwned(pkg._id)}
                    />
                  ))}
                </div>

                <div className="mt-8 p-4 bg-accent/30 rounded-lg">
                  <h3 className="font-medium mb-2">How Credit Packages Work</h3>
                  <p className="text-sm text-muted-foreground">
                    Purchase credit packages to book individual classes. Each
                    package contains a set number of credits that can be used to
                    book classes. Credits are valid for a specific period and
                    can be used for any available class.
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No packages available at this time.</p>
              </div>
            )}
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions">
            {subscriptionPlansLoading || ownedSubscriptionsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : subscriptionPlansError ? (
              <div className="text-center py-8 text-destructive">
                <p>Error loading subscription plans. Please try again.</p>
              </div>
            ) : subscriptionPlans && subscriptionPlans.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subscriptionPlans.map((plan) => {
                    const planId = plan.id; // Get the plan ID
                    const isOwned = isSubscriptionOwned(planId);

                    // Debug log for troubleshooting
                    console.log(
                      `Plan ${plan.name} (${planId}): ${
                        isOwned ? "Already owned" : "Not owned"
                      }`
                    );

                    return (
                      <PricingCard
                        key={planId}
                        title={plan.name}
                        description={plan.description}
                        price={plan.price}
                        features={getSubscriptionFeatures(plan)}
                        badge={plan.allowAllClasses ? "Unlimited" : undefined}
                        onPurchase={() =>
                          handleOpenPurchaseDialog(plan, "subscription")
                        }
                        isLoading={
                          isPurchasingSubscription &&
                          selectedItem?.id === planId
                        }
                        alreadyOwned={isOwned}
                      />
                    );
                  })}
                </div>

                <div className="mt-8 p-4 bg-accent/30 rounded-lg">
                  <h3 className="font-medium mb-2">How Subscriptions Work</h3>
                  <p className="text-sm text-muted-foreground">
                    Subscribe for regular access to classes with our monthly
                    membership plans. Choose between plans with different class
                    access and frequency limits. Subscriptions automatically
                    renew until cancelled.
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No subscription plans available at this time.</p>
              </div>
            )}
          </TabsContent>

          {/* My Plans Tab */}
          <TabsContent value="myplans">
            {activePackagesLoading || activeSubscriptionsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : activePackagesError || activeSubscriptionsError ? (
              <div className="text-center py-8 text-destructive">
                <p>Error loading your memberships. Please try again.</p>
              </div>
            ) : hasActiveMemberships() ? (
              <div className="space-y-6">
                {/* Active Packages Section */}
                {activePackages && activePackages.length > 0 && (
                  <>
                    <h3 className="text-lg font-medium mb-2">
                      Your Active Packages
                    </h3>
                    <div className="grid gap-6 md:grid-cols-2">
                      {activePackages.map((pkg) => (
                        <PackageCard
                          key={pkg._id}
                          packageData={pkg}
                          onViewDetails={() =>
                            router.push(`/packages/${pkg._id}`)
                          }
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Active Subscriptions Section */}
                {activeSubscriptions && activeSubscriptions.length > 0 && (
                  <>
                    <h3 className="text-lg font-medium mt-8 mb-2">
                      Your Active Subscriptions
                    </h3>
                    <div className="grid gap-6 md:grid-cols-2">
                      {activeSubscriptions.map((subscription: any) => (
                        <SubscriptionCard
                          key={subscription._id}
                          subscriptionData={subscription}
                          onViewDetails={() =>
                            router.push(`/subscriptions/${subscription._id}`)
                          }
                        />
                      ))}
                    </div>
                  </>
                )}

                <Card className="mt-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Package & Subscription Usage Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                          1
                        </span>
                        <span>
                          When booking a class, select the appropriate plan to
                          use.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                          2
                        </span>
                        <span>
                          Remember to use your credits before they expire.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                          3
                        </span>
                        <span>
                          View your bookings in the "Bookings" tab to track your
                          usage.
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="mx-auto w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">
                  No Active Memberships
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  You don't have any active packages or subscriptions. Purchase
                  a package or subscription to start booking classes.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const element = document.querySelector(
                        '[data-value="credits"]'
                      );
                      if (element instanceof HTMLElement) {
                        element.click();
                      }
                    }}
                  >
                    View Credit Packages
                  </Button>
                  <Button
                    onClick={() => {
                      const element = document.querySelector(
                        '[data-value="subscriptions"]'
                      );
                      if (element instanceof HTMLElement) {
                        element.click();
                      }
                    }}
                  >
                    View Subscriptions
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
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
    </BrandLayout>
  );
}

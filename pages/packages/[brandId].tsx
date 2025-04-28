import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import MainLayout from "@/components/layouts/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  useAvailablePackages,
  useSubscriptionPlans,
  useActivePackages,
  useOwnedPackages,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { Package, CreditCard, CalendarClock } from "lucide-react";

export default function PackagesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { brandId } = router.query;

  // Purchase confirmation state
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] =
    useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<
    PackageData | SubscriptionPlan | null
  >(null);
  const [selectedItemType, setSelectedItemType] = useState<
    "package" | "subscription"
  >("package");

  // Fetch packages and subscription plans using brandId from URL
  const {
    data: packages,
    isLoading: packagesLoading,
    error: packagesError,
  } = useAvailablePackages(brandId as string);

  const {
    data: subscriptionPlans,
    isLoading: subscriptionPlansLoading,
    error: subscriptionPlansError,
  } = useSubscriptionPlans(brandId as string);

  // Fetch active packages for the client
  const {
    data: activePackages,
    isLoading: activePackagesLoading,
    error: activePackagesError,
  } = useActivePackages();

  // Get a list of owned package IDs
  const { data: ownedPackageIds, isLoading: ownedPackagesLoading } =
    useOwnedPackages();

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
    if (!selectedItem || !brandId) return;

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
          brandId: brandId as string,
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

  const isLoading = authLoading || !brandId;

  if (isLoading) {
    return (
      <MainLayout title="Membership Options | FitBook" loading={true}>
        <LoadingSpinner />
      </MainLayout>
    );
  }

  return (
    <MainLayout
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
                <LoadingSpinner size="lg" />
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
            {subscriptionPlansLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : subscriptionPlansError ? (
              <div className="text-center py-8 text-destructive">
                <p>Error loading subscription plans. Please try again.</p>
              </div>
            ) : subscriptionPlans && subscriptionPlans.length > 0 ? (
              <>
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
            {activePackagesLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : activePackagesError ? (
              <div className="text-center py-8 text-destructive">
                <p>Error loading your packages. Please try again.</p>
              </div>
            ) : activePackages && activePackages.length > 0 ? (
              <div className="space-y-6">
                <h3 className="text-lg font-medium mb-2">
                  Your Active Packages
                </h3>
                <div className="grid gap-6 md:grid-cols-2">
                  {activePackages.map((pkg) => (
                    <Card key={pkg._id} className="overflow-hidden">
                      <CardHeader className="pb-2 bg-accent/20">
                        <CardTitle className="flex justify-between items-center">
                          <span>{pkg.package.name}</span>
                          <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {pkg.remainingCredits} / {pkg.initialCredits}{" "}
                            credits
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-muted-foreground">
                                Credits Remaining
                              </span>
                              <span>
                                {Math.round(
                                  (pkg.remainingCredits / pkg.initialCredits) *
                                    100
                                )}
                                %
                              </span>
                            </div>
                            <Progress
                              value={
                                (pkg.remainingCredits / pkg.initialCredits) *
                                100
                              }
                              className="h-2"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Purchased</p>
                              <p>
                                {format(new Date(pkg.startDate), "MMM d, yyyy")}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Expires</p>
                              <p className="font-medium">
                                {format(
                                  new Date(pkg.expiryDate),
                                  "MMM d, yyyy"
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="mt-2 flex justify-center">
                            <Button
                              onClick={() => router.push("/schedule")}
                              className="w-full"
                              size="sm"
                            >
                              Book a Class
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="mt-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Package Usage Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                          1
                        </span>
                        <span>
                          When booking a class, select "Use Package Credits" to
                          use your package.
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
                          package usage.
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
                <h3 className="text-lg font-medium mb-2">No Active Packages</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  You don't have any active packages or subscriptions. Purchase
                  a package to start booking classes.
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
    </MainLayout>
  );
}

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import BrandLayout from '@/components/layouts/BrandLayout';
import { CheckCircle, Package, Crown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useQueryClient } from '@tanstack/react-query';
import { useBrand } from '@/contexts/BrandContext';
import { useRefreshPlans } from '@/hooks/useApi';

interface PaymentSuccessParams {
  session_id?: string;
  membership_type?: 'credits' | 'subscription';
  plan_id?: string;
  // Legacy support
  payment?: string;
  type?: string;
  item_id?: string;
}

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState<PaymentSuccessParams>({});
  const queryClient = useQueryClient();
  const { activeBrandId } = useBrand();
  const { refreshAllPlans } = useRefreshPlans();

  useEffect(() => {
    // Parse URL parameters
    if (router.isReady) {
      const query = router.query as PaymentSuccessParams;
      setParams(query);
      setLoading(false);
      
      // Set a flag to indicate a purchase was just completed
      // This will be detected by the packages page to auto-refresh
      sessionStorage.setItem('justPurchased', 'true');
      
      // Refresh all plan-related data to ensure the user sees their new plan immediately
      refreshAllPlans();
      
      // Also invalidate ownership queries for the specific plan if available
      if (query.plan_id) {
        queryClient.invalidateQueries({ queryKey: ["packages", "ownership", query.plan_id] });
        queryClient.invalidateQueries({ queryKey: ["subscriptions", "ownership", query.plan_id] });
      }
    }
  }, [router.isReady, router.query, queryClient, activeBrandId]);

  const getMembershipTypeInfo = () => {
    // Handle new parameter structure
    if (params.membership_type === 'credits') {
      return {
        icon: Package,
        title: 'Credits Package Purchased!',
        description: 'Your credits have been added to your account and you can now book sessions.',
        actionText: 'Start Booking Sessions',
        actionUrl: '/schedule'
      };
    }

    if (params.membership_type === 'subscription') {
      return {
        icon: Crown,
        title: 'Subscription Activated!',
        description: 'Your monthly subscription is now active and you can book unlimited sessions.',
        actionText: 'Start Booking Sessions', 
        actionUrl: '/schedule'
      };
    }

    // Handle legacy parameters
    if (params.type === 'package' || params.payment === 'success') {
      return {
        icon: Package,
        title: 'Purchase Completed!',
        description: 'Your purchase was successful and your account has been updated.',
        actionText: 'View Your Plans',
        actionUrl: '/packages'
      };
    }

    // Default fallback
    return {
      icon: CheckCircle,
      title: 'Payment Successful!',
      description: 'Your payment has been processed successfully.',
      actionText: 'Continue',
      actionUrl: '/packages'
    };
  };

  const handleContinue = () => {
    const info = getMembershipTypeInfo();
    router.push(info.actionUrl);
  };

  if (loading) {
    return (
      <BrandLayout title="Payment Processing | FitBook" headerTitle="Payment">
        <div className="flex justify-center items-center min-h-[50vh]">
          <LoadingSpinner size="lg" />
        </div>
      </BrandLayout>
    );
  }

  const info = getMembershipTypeInfo();
  const IconComponent = info.icon;

  return (
    <BrandLayout title="Payment Success | FitBook" headerTitle="Payment Success">
      <div className="max-w-md mx-auto mt-8">
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconComponent className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-green-600">{info.title}</h1>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              {info.description}
            </p>

            {/* Success details */}
            {params.session_id && (
              <div className="p-3 bg-accent/10 rounded-lg text-left">
                <div className="text-sm space-y-1">
                  <div>
                    <span className="font-medium">Transaction ID:</span>
                    <span className="ml-2 text-muted-foreground font-mono text-xs">
                      {params.session_id.slice(-8)}
                    </span>
                  </div>
                  {params.plan_id && (
                    <div>
                      <span className="font-medium">Plan ID:</span>
                      <span className="ml-2 text-muted-foreground font-mono text-xs">
                        {params.plan_id.slice(-8)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button onClick={handleContinue} className="w-full" size="lg">
                {info.actionText}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => router.push('/packages')} 
                className="w-full"
              >
                View My Plans
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                A confirmation email has been sent to your registered email address.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </BrandLayout>
  );
}

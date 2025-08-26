import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import getStripe from '@/lib/stripe';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import CheckoutForm from './CheckoutForm';
import { useCreatePaymentIntent } from '@/hooks/useMutations';
import { X, CreditCard, Package, Crown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getErrorMessage, ensureNumber, ensureString } from '@/lib/errorUtils';
import { useBrand } from '@/contexts/BrandContext';

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  itemType: 'package' | 'subscription';
  itemId: string;
  itemName: string;
  itemPrice: number;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  itemType,
  itemId,
  itemName,
  itemPrice,
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const { mutate: createPaymentIntent, isPending: isCreatingIntent } = useCreatePaymentIntent();
  const { activeBrandId } = useBrand();

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setClientSecret(null);
      setPaymentInitiated(false);
    }
  }, [isOpen]);

  const handleInitiatePayment = () => {
    setPaymentInitiated(true);
    createPaymentIntent(
      {
        type: itemType,
        itemId: itemId,
        brandId: activeBrandId || undefined,
      },
      {
        onSuccess: (data) => {
          setClientSecret(data.clientSecret);
        },
        onError: (error: any) => {
          console.error('Payment intent creation error:', error);
          const errorMessage = getErrorMessage(error) || 'Failed to initiate payment';
          toast.error(errorMessage);
          setPaymentInitiated(false);
        },
      }
    );
  };

  const handlePaymentSuccess = () => {
    toast.success('Payment completed successfully!');
    onSuccess?.();
    onClose();
  };

  const handlePaymentError = (error: string) => {
    toast.error(error);
  };

  const getItemIcon = () => {
    return itemType === 'package' ? Package : Crown;
  };

  const ItemIcon = getItemIcon();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center">
              <ItemIcon className="h-5 w-5 mr-2" />
              Purchase {itemType === 'package' ? 'Package' : 'Plan'}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="py-4">
          {!paymentInitiated ? (
            // Initial purchase confirmation
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ItemIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-2">{ensureString(itemName)}</h3>
                <p className="text-2xl font-bold text-primary">
                  ${ensureNumber(itemPrice).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {itemType === 'package' 
                    ? 'One-time purchase for class credits'
                    : 'Monthly subscription plan'
                  }
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleInitiatePayment}
                  disabled={isCreatingIntent}
                  className="w-full"
                  size="lg"
                >
                  {isCreatingIntent ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Setting up payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Proceed to Payment
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="w-full"
                  disabled={isCreatingIntent}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : clientSecret ? (
            // Stripe checkout form
            <Elements
              stripe={getStripe()}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: 'hsl(var(--primary))',
                  },
                },
              }}
            >
              <CheckoutForm
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                itemName={itemName}
                amount={itemPrice}
              />
            </Elements>
          ) : (
            // Loading state while creating payment intent
            <div className="flex flex-col items-center justify-center py-8">
              <LoadingSpinner size="lg" className="mb-4" />
              <p className="text-sm text-muted-foreground">
                Setting up secure payment...
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;

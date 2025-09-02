import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useCreateCheckout } from '@/hooks/useMutations';
import { CreditCard, Package, Crown } from 'lucide-react';
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
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const { mutate: createCheckout, isPending: isCreatingCheckout } = useCreateCheckout();
  const { activeBrandId } = useBrand();

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setPaymentInitiated(false);
    }
  }, [isOpen]);

  const handleInitiatePayment = () => {
    setPaymentInitiated(true);
    createCheckout(
      {
        type: itemType,
        itemId: itemId,
        brandId: activeBrandId || undefined,
      },
      {
        onSuccess: (data) => {
          // Redirect to Stripe Checkout
          window.location.href = data.checkoutUrl;
        },
        onError: (error: any) => {
          console.error('Checkout creation error:', error);
          const errorMessage = getErrorMessage(error) || 'Failed to initiate checkout';
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
          <DialogTitle className="flex items-center">
            <ItemIcon className="h-5 w-5 mr-2" />
            Purchase {itemType === 'package' ? 'Package' : 'Plan'}
          </DialogTitle>
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
                  disabled={isCreatingCheckout}
                  className="w-full"
                  size="lg"
                >
                  {isCreatingCheckout ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Setting up checkout...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Proceed to Checkout
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="w-full"
                  disabled={isCreatingCheckout}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            // Loading state while redirecting to checkout
            <div className="flex flex-col items-center justify-center py-8">
              <LoadingSpinner size="lg" className="mb-4" />
              <p className="text-sm text-muted-foreground">
                Redirecting to secure checkout...
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;

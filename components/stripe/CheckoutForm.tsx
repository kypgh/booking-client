import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { CreditCard, CheckCircle } from 'lucide-react';
import { getErrorMessage, ensureNumber, ensureString } from '@/lib/errorUtils';

interface CheckoutFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  itemName?: string;
  amount?: number;
  loading?: boolean;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  onSuccess,
  onError,
  itemName,
  amount,
  loading: externalLoading = false,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setPaymentError(getErrorMessage(error) || 'An error occurred during payment');
        onError?.(getErrorMessage(error) || 'Payment failed');
      } else {
        // Payment succeeded
        onSuccess?.();
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err) || 'Payment failed';
      setPaymentError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoading = isProcessing || externalLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Payment summary */}
      {itemName && amount && (
        <div className="p-4 bg-accent/10 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{ensureString(itemName)}</h3>
              <p className="text-sm text-muted-foreground">One-time payment</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">${ensureNumber(amount).toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Element */}
      <div className="p-4 border rounded-lg">
        <PaymentElement
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card'],
          }}
        />
      </div>

      {/* Error message */}
      {paymentError && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{paymentError}</p>
        </div>
      )}

      {/* Submit button */}
      <Button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Complete Payment
            {amount && ` - $${ensureNumber(amount).toFixed(2)}`}
          </>
        )}
      </Button>

      {/* Security info */}
      <div className="flex items-center justify-center text-xs text-muted-foreground mt-2">
        <CheckCircle className="h-3 w-3 mr-1" />
        Secured by Stripe
      </div>
    </form>
  );
};

export default CheckoutForm;

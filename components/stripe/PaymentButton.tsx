import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import PaymentDialog from './PaymentDialog';
import SubscriptionWarningDialog from '@/components/SubscriptionWarningDialog';
import { CreditCard, Package, Crown } from 'lucide-react';
import { ensureNumber, ensureString } from '@/lib/errorUtils';
import { useActiveSubscriptions } from '@/hooks/useApi';

interface PaymentButtonProps {
  itemType: 'package' | 'subscription';
  itemId: string;
  itemName: string;
  itemPrice: number;
  onSuccess?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  itemType,
  itemId,
  itemName,
  itemPrice,
  onSuccess,
  disabled = false,
  variant = 'default',
  size = 'default',
  className = '',
  children,
}) => {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false);
  
  // Get active subscriptions to check if user already has one
  const { data: activeSubscriptions } = useActiveSubscriptions();

  const handlePaymentSuccess = () => {
    setIsPaymentDialogOpen(false);
    onSuccess?.();
  };

  const handleButtonClick = () => {
    // Check if this is a subscription purchase and user already has an active subscription
    if (itemType === 'subscription' && activeSubscriptions && activeSubscriptions.length > 0) {
      setIsWarningDialogOpen(true);
    } else {
      setIsPaymentDialogOpen(true);
    }
  };

  const handleWarningConfirm = () => {
    setIsWarningDialogOpen(false);
    setIsPaymentDialogOpen(true);
  };

  const handleWarningCancel = () => {
    setIsWarningDialogOpen(false);
  };

  const getDefaultButtonContent = () => {
    const Icon = itemType === 'package' ? Package : Crown;
    const price = ensureNumber(itemPrice);
    return (
      <>
        <Icon className="h-4 w-4 mr-2" />
        Purchase ${price.toFixed(2)}
      </>
    );
  };

  // Get current subscription name for warning dialog
  const currentSubscriptionName = activeSubscriptions?.[0]?.subscriptionPlan?.name || 
                                 (activeSubscriptions?.[0] as any)?.name;

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled={disabled}
        onClick={handleButtonClick}
      >
        {children || getDefaultButtonContent()}
      </Button>

      <SubscriptionWarningDialog
        isOpen={isWarningDialogOpen}
        onClose={handleWarningCancel}
        onConfirm={handleWarningConfirm}
        currentPlanName={currentSubscriptionName}
        newPlanName={itemName}
      />

      <PaymentDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        onSuccess={handlePaymentSuccess}
        itemType={itemType}
        itemId={ensureString(itemId)}
        itemName={ensureString(itemName)}
        itemPrice={ensureNumber(itemPrice)}
      />
    </>
  );
};

export default PaymentButton;

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import PaymentDialog from './PaymentDialog';
import SubscriptionWarningDialog from '@/components/SubscriptionWarningDialog';
import { CreditCard, Package, Crown } from 'lucide-react';
import { ensureNumber, ensureString } from '@/lib/errorUtils';
import { useClientMemberships } from '@/hooks/useApi';
import { useBrand } from '@/contexts/BrandContext';

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
  const { activeBrandId } = useBrand();
  
  // Get unified membership data to check if user already has active subscription
  const { data: memberships } = useClientMemberships();

  const handlePaymentSuccess = () => {
    setIsPaymentDialogOpen(false);
    onSuccess?.();
  };

  const handleButtonClick = () => {
    // Check if this is a subscription purchase and user already has an active subscription
    const currentBrandMembership = memberships?.memberships?.find(m => m.brandId === activeBrandId);
    const hasActiveSubscription = currentBrandMembership?.hasActiveSubscription || false;
    
    if (itemType === 'subscription' && hasActiveSubscription) {
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
  const currentBrandMembership = memberships?.memberships?.find(m => m.brandId === activeBrandId);
  const currentSubscriptionName = currentBrandMembership?.activeSubscription?.plan.name || 'Current Subscription';

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

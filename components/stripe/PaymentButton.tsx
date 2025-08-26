import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import PaymentDialog from './PaymentDialog';
import { CreditCard, Package, Crown } from 'lucide-react';
import { ensureNumber, ensureString } from '@/lib/errorUtils';

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

  const handlePaymentSuccess = () => {
    setIsPaymentDialogOpen(false);
    onSuccess?.();
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

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled={disabled}
        onClick={() => setIsPaymentDialogOpen(true)}
      >
        {children || getDefaultButtonContent()}
      </Button>

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

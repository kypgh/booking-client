import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Crown } from 'lucide-react';

interface SubscriptionWarningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentPlanName?: string;
  newPlanName: string;
  isLoading?: boolean;
}

const SubscriptionWarningDialog: React.FC<SubscriptionWarningDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentPlanName,
  newPlanName,
  isLoading = false,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Subscription Change Warning
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                You already have an active subscription
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {currentPlanName 
                  ? `Your current "${currentPlanName}" subscription will be cancelled and replaced with the new "${newPlanName}" plan.`
                  : `Your current subscription will be cancelled and replaced with the new "${newPlanName}" plan.`
                }
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Crown className="h-4 w-4" />
              <span>You will be charged for the new plan immediately</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              <span>Any unused benefits from your current plan will be lost</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Processing...
                </div>
              ) : (
                'Yes, Replace My Subscription'
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
              size="lg"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionWarningDialog;

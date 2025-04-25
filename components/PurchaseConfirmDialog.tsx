import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PackageData } from "@/hooks/useApi";
import { SubscriptionPlan } from "@/hooks/useApi";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface PurchaseConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  item: PackageData | SubscriptionPlan;
  itemType: "package" | "subscription";
}

const PurchaseConfirmDialog: React.FC<PurchaseConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  item,
  itemType,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Purchase</DialogTitle>
          <DialogDescription>
            You are about to purchase the following {itemType}:
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
          {item.description && (
            <p className="text-sm text-muted-foreground mb-3">
              {item.description}
            </p>
          )}

          <div className="flex justify-between items-center border-t pt-3 mt-3">
            <span className="font-medium">Price:</span>
            <span className="text-lg">${item.price.toFixed(2)}</span>
          </div>

          {itemType === "package" && (
            <div className="flex justify-between items-center mt-2">
              <span className="font-medium">Credits:</span>
              <span>{(item as PackageData).credits} credits</span>
            </div>
          )}

          {itemType === "subscription" && (
            <div className="flex justify-between items-center mt-2">
              <span className="font-medium">Duration:</span>
              <span>{(item as SubscriptionPlan).durationDays} days</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Processing...
              </>
            ) : (
              "Confirm Purchase"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseConfirmDialog;

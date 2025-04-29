// components/SubscriptionCard.tsx
import React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarClock, Check } from "lucide-react";

interface SubscriptionCardProps {
  subscriptionData: any;
  onViewDetails?: (id: string) => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscriptionData,
  onViewDetails,
}) => {
  // Calculate days remaining until expiry
  const endDate = new Date(subscriptionData.endDate);
  const today = new Date();
  const daysRemaining = Math.max(
    0,
    Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  );

  // Format frequency limit text if present
  const getFrequencyLimitText = () => {
    if (!subscriptionData.frequencyLimit) return "Unlimited usage";

    return `${subscriptionData.frequencyLimit.count} classes per ${subscriptionData.frequencyLimit.period}`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2 bg-primary/10">
        <CardTitle className="text-lg">
          {subscriptionData.name || "Monthly Subscription"}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CalendarClock className="w-4 h-4 mr-2 text-primary" />
              <span className="text-sm font-medium">
                {subscriptionData.allowAllClasses
                  ? "All classes included"
                  : `${
                      subscriptionData.includedClasses?.length || 0
                    } classes included`}
              </span>
            </div>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              {getFrequencyLimitText()}
            </span>
          </div>

          <div className="text-sm">
            <div className="flex justify-between mb-1">
              <span className="text-muted-foreground">Expires</span>
              <span>{format(endDate, "MMM d, yyyy")}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {daysRemaining} days remaining
            </div>
          </div>

          {onViewDetails && (
            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={() => onViewDetails(subscriptionData._id)}
            >
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionCard;

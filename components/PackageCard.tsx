// components/PackageCard.tsx
import React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface PackageCardProps {
  packageData: any;
  onViewDetails?: (id: string) => void;
}

const PackageCard: React.FC<PackageCardProps> = ({
  packageData,
  onViewDetails,
}) => {
  const formatDate = (date: string | null | undefined) => {
    if (!date) return "Not set";
    
    try {
      const dateObj = new Date(date);
      
      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        return "Invalid date";
      }
      
      return format(dateObj, "MMM d, yyyy");
    } catch (error) {
      console.error("Date formatting error:", error, "Date value:", date);
      return "Invalid date";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{packageData.package.name}</CardTitle>
          <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
            {packageData.remainingCredits} / {packageData.initialCredits}{" "}
            credits
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Credits Remaining</span>
              <span className="font-medium">
                {packageData.percentRemaining.toFixed(0)}%
              </span>
            </div>
            <Progress value={packageData.percentRemaining} />
          </div>

          <div className="text-sm">
            <div className="flex justify-between mb-1">
              <span className="text-muted-foreground">Expires</span>
              <span>
                {formatDate(packageData.expiryDate)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {packageData.daysUntilExpiry} days remaining
            </div>
          </div>

          {onViewDetails && (
            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={() => onViewDetails(packageData._id)}
            >
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PackageCard;

// components/ActivePlanCard.tsx
import React from "react";
import { format } from "date-fns";
import { Crown, Calendar, CreditCard, Users, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ActivePlanCardProps {
  plan: any;
  type: "package" | "subscription";
  onManage: () => void;
  onChangePlan: () => void;
}

export default function ActivePlanCard({ 
  plan, 
  type, 
  onManage, 
  onChangePlan 
}: ActivePlanCardProps) {
  
  // Calculate progress for packages
  const calculateProgress = () => {
    if (type === "package" && plan.package) {
      const used = plan.package.credits - plan.remainingCredits;
      const total = plan.package.credits;
      return Math.round((used / total) * 100);
    }
    return 0;
  };

  const formatExpiryDate = (date: string | null | undefined) => {
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
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
      {/* Premium indicator */}
      <div className="absolute top-3 right-3">
        <Crown className="h-5 w-5 text-primary" />
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="default" className="text-xs">
                Active Plan
              </Badge>
            </div>
            <h3 className="text-lg font-semibold">
              {type === "package" ? plan.package?.name : plan.plan?.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {type === "package" ? plan.package?.description : plan.plan?.description}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {type === "package" ? (
          // Package details
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Credits remaining</span>
                <span className="font-medium">
                  {plan.remainingCredits} of {plan.package.credits}
                </span>
              </div>
              <Progress 
                value={100 - calculateProgress()} 
                className="h-2" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-muted-foreground">Expires</div>
                  <div className="font-medium">
                    {formatExpiryDate(plan.expiryDate)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-muted-foreground">Purchase date</div>
                  <div className="font-medium">
                    {formatExpiryDate(plan.purchaseDate)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Subscription details
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-muted-foreground">Access</div>
                  <div className="font-medium">
                    {plan.plan?.allowAllClasses ? "All Classes" : "Selected Classes"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-muted-foreground">Next billing</div>
                  <div className="font-medium">
                    {formatExpiryDate(plan.nextBillingDate)}
                  </div>
                </div>
              </div>
            </div>

            {plan.plan?.frequencyLimit && (
              <div className="p-3 bg-background rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">
                  Usage limit
                </div>
                <div className="font-medium text-sm">
                  {plan.plan.frequencyLimit.count} classes per {plan.plan.frequencyLimit.period}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onManage}
            className="flex-1"
          >
            Manage Plan
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={onChangePlan}
            className="flex-1"
          >
            Change Plan
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

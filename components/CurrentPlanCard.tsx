// components/CurrentPlanCard.tsx
import React from "react";
import { format } from "date-fns";
import { Crown, Calendar, CreditCard, Users, Settings, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useClassList } from "@/hooks/useApi";

interface CurrentPlanCardProps {
  plan: any;
  type: "package" | "subscription";
  onManage?: () => void;
}

export default function CurrentPlanCard({ plan, type, onManage }: CurrentPlanCardProps) {
  // Fetch all classes to resolve class IDs to names
  const { data: allClasses } = useClassList();

  // Helper function to get class name by ID
  const getClassNameById = (classId: string) => {
    if (!allClasses) {
      return `Loading...`;
    }
    
    const classData = allClasses.find(cls => cls._id === classId);
    if (!classData) {
      // Class not found - likely deleted or inactive
      return `Class (Unavailable)`;
    }
    
    return classData.name;
  };

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

  const calculateProgress = () => {
    if (type === "package" && plan.package) {
      const used = plan.package.credits - plan.remainingCredits;
      const total = plan.package.credits;
      return Math.round((used / total) * 100);
    }
    return 0;
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border-primary/20">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -translate-y-16 translate-x-16" />
      
      {/* Crown icon */}
      <div className="absolute top-4 right-4">
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
          <Crown className="h-4 w-4 text-primary" />
        </div>
      </div>

      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs font-medium">
                Active Plan
              </Badge>
              <Badge variant="outline" className="text-xs">
                {type === "package" ? "Credit Plan" : "Subscription Plan"}
              </Badge>
            </div>
            
            <h3 className="text-xl font-bold">
              {type === "package" ? plan.package?.name : plan.subscriptionPlan?.name}
            </h3>
            
            <p className="text-muted-foreground text-sm">
              {type === "package" ? plan.package?.description : plan.subscriptionPlan?.description}
            </p>
          </div>

          {type === "package" ? (
            // Package details
            <div className="space-y-4">
              {/* Credits progress */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Credits remaining</span>
                  <span className="text-sm font-bold text-primary">
                    {plan.remainingCredits} of {plan.package.credits}
                  </span>
                </div>
                <Progress 
                  value={100 - calculateProgress()} 
                  className="h-2" 
                />
                <p className="text-xs text-muted-foreground">
                  {plan.package.credits - plan.remainingCredits} credits used
                </p>
              </div>

              {/* Plan details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Valid until</span>
                  </div>
                  <p className="text-sm font-medium">{formatDate(plan.expiryDate)}</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    <span>Purchased</span>
                  </div>
                  <p className="text-sm font-medium">{formatDate(plan.purchaseDate || plan.createdAt)}</p>
                </div>
              </div>
            </div>
          ) : (
            // Subscription details
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Access level</span>
                  </div>
                  <div className="text-sm font-medium">
                    {plan.subscriptionPlan?.allowAllClasses ? (
                      "All Classes"
                    ) : (
                      <div className="space-y-1">
                        <div>Selected Classes</div>
                        {plan.subscriptionPlan?.includedClasses && 
                         Array.isArray(plan.subscriptionPlan.includedClasses) && 
                         plan.subscriptionPlan.includedClasses.length > 0 ? (
                          <div className="text-xs text-muted-foreground">
                            {plan.subscriptionPlan.includedClasses.map((classId, index) => (
                              <div key={classId || index}>
                                • {getClassNameById(classId)}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">
                            No specific classes defined
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="h-4 w-4" />
                    <span>Usage limit</span>
                  </div>
                  <p className="text-sm font-medium">
                    {plan.subscriptionPlan?.frequencyLimit 
                      ? `${plan.subscriptionPlan.frequencyLimit.count}/${plan.subscriptionPlan.frequencyLimit.period}` 
                      : "Unlimited"
                    }
                  </p>
                </div>
              </div>

              {/* Subscription validity and billing info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Valid until</span>
                  </div>
                  <p className="text-sm font-medium">{formatDate(plan.endDate)}</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    <span>Started</span>
                  </div>
                  <p className="text-sm font-medium">{formatDate(plan.startDate)}</p>
                </div>
              </div>

              {plan.nextBillingDate && (
                <div className="p-3 bg-background/50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" />
                    <span>Next billing date</span>
                  </div>
                  <p className="text-sm font-medium">{formatDate(plan.nextBillingDate)}</p>
                </div>
              )}
            </div>
          )}

          {/* Action button - only show if onManage is provided */}
          {onManage && (
            <Button 
              onClick={onManage} 
              className="w-full"
              variant="outline"
            >
              <Settings className="h-4 w-4 mr-2" />
              Manage Plan
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// components/ModernPlanCard.tsx
import React from "react";
import { Star, Check, Package, Calendar, Zap, Clock } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PaymentButton from "@/components/stripe/PaymentButton";

interface ModernPlanCardProps {
  title: string;
  description?: string;
  price: number;
  // For credit plans
  credits?: number;
  validityDays?: number;
  // For subscription plans
  allowAllClasses?: boolean;
  frequencyLimit?: {
    count: number;
    period: "day" | "week" | "month";
  };
  popular?: boolean;
  type: "credit" | "subscription";
  onSelect?: () => void; // Made optional for backward compatibility
  isLoading?: boolean;
  // For Stripe integration
  itemId?: string;
  onSuccess?: () => void;
}

export default function ModernPlanCard({
  title,
  description,
  price,
  credits,
  validityDays,
  allowAllClasses,
  frequencyLimit,
  popular,
  type,
  onSelect,
  isLoading,
  itemId,
  onSuccess,
}: ModernPlanCardProps) {
  const features = type === "credit" 
    ? [
        { icon: Package, text: `${credits} credits included`, highlight: true },
        { icon: Calendar, text: `Valid for ${validityDays} days` },
        { icon: Check, text: "Book any available class" },
        { icon: Check, text: "Cancel up to 2 hours before" },
        ...(credits && credits >= 20 ? [{ icon: Star, text: "Priority booking support" }] : []),
      ]
    : [
        { icon: allowAllClasses ? Zap : Package, text: allowAllClasses ? "All classes included" : "Selected classes", highlight: true },
        { icon: Calendar, text: "Monthly billing cycle" },
        ...(frequencyLimit ? [{ icon: Clock, text: `Up to ${frequencyLimit.count} classes per ${frequencyLimit.period}` }] : [{ icon: Zap, text: "Unlimited class bookings" }]),
        { icon: Check, text: "Cancel up to 2 hours before" },
        { icon: Star, text: "Priority customer support" },
      ];

  return (
    <Card 
      className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
        popular ? 'border-primary shadow-lg ring-1 ring-primary/20' : ''
      }`}
    >
      {/* Popular badge */}
      {popular && (
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            Popular
          </div>
        </div>
      )}

      {/* Background decoration */}
      {popular && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -translate-y-12 translate-x-12" />
      )}

      <CardHeader className="pb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant={type === "credit" ? "secondary" : "default"} className="text-xs">
              {type === "credit" ? "Credit Plan" : "Monthly Plan"}
            </Badge>
          </div>
          
          <h3 className="text-lg font-semibold">{title}</h3>
          
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-6">
          {/* Pricing */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">${price}</span>
              {type === "subscription" && (
                <span className="text-muted-foreground text-sm">/month</span>
              )}
            </div>
            {type === "credit" && credits && (
              <p className="text-sm text-muted-foreground">
                ${(price / credits).toFixed(2)} per credit
              </p>
            )}
          </div>

          {/* Features */}
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                  feature.highlight 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <feature.icon className="h-3 w-3" />
                </div>
                <span className={`text-sm ${feature.highlight ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          {itemId ? (
            <PaymentButton
              itemType={type === "credit" ? "package" : "subscription"}
              itemId={itemId}
              itemName={title}
              itemPrice={price}
              onSuccess={onSuccess}
              variant={popular ? "default" : "outline"}
              size="lg"
              className="w-full"
            >
              {type === "credit" ? "Purchase Credits" : "Subscribe Now"}
            </PaymentButton>
          ) : (
            <Button 
              onClick={onSelect} 
              className="w-full" 
              size="lg"
              disabled={isLoading}
              variant={popular ? "default" : "outline"}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Processing...
                </div>
              ) : (
                `Choose ${type === "credit" ? "Credits" : "Plan"}`
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

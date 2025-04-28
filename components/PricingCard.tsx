// components/PricingCard.tsx
import React from "react";
import { Check, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Feature {
  included: boolean;
  text: string;
}

interface PricingCardProps {
  title: string;
  description?: string;
  price: number;
  features: Feature[];
  badge?: string;
  onPurchase: () => void;
  isLoading?: boolean;
  alreadyOwned?: boolean; // New prop
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  description,
  price,
  features,
  badge,
  onPurchase,
  isLoading = false,
  alreadyOwned = false,
}) => {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        {badge && (
          <Badge variant="secondary" className="mb-2 w-fit">
            {badge}
          </Badge>
        )}
        <CardTitle className="text-xl">{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        <div className="mb-4">
          <span className="text-3xl font-bold">${price.toFixed(2)}</span>
        </div>
        <ul className="space-y-2 text-sm">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              {feature.included ? (
                <Check className="mr-2 h-4 w-4 text-primary" />
              ) : (
                <X className="mr-2 h-4 w-4 text-muted-foreground" />
              )}
              <span
                className={
                  feature.included ? "text-foreground" : "text-muted-foreground"
                }
              >
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-2 mt-auto">
        {alreadyOwned ? (
          <Button
            variant="outline"
            className="w-full text-primary border-primary/30"
            disabled
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Already Purchased
          </Button>
        ) : (
          <Button onClick={onPurchase} disabled={isLoading} className="w-full">
            {isLoading ? "Processing..." : "Purchase"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PricingCard;

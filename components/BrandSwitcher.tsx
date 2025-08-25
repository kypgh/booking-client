// components/BrandSwitcher.tsx
import React, { useState } from "react";
import { ChevronDown, Building, Check } from "lucide-react";
import { useBrand, Brand } from "@/contexts/BrandContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";

// UI Components
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface BrandSwitcherProps {
  className?: string;
}

export default function BrandSwitcher({ className = "" }: BrandSwitcherProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { activeBrandId, activeBrand, setActiveBrandId } = useBrand();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Get available brands from user context
  const availableBrands = user?.brands || [];

  // Handle brand switching
  const handleBrandSwitch = async (brandId: string) => {
    if (brandId === activeBrandId) return;

    setIsLoading(brandId);

    try {
      // Update the brand context
      setActiveBrandId(brandId);
      
      // Navigate to home page to refresh all brand-specific data
      await router.push("/");
      
      // Small delay to ensure context is updated
      setTimeout(() => {
        setIsLoading(null);
      }, 500);
    } catch (error) {
      console.error("Error switching brand:", error);
      setIsLoading(null);
    }
  };

  // Get brand display name
  const getBrandDisplayName = (brand: any) => {
    if (typeof brand === "string") return brand;
    return brand?.name || brand?.id || "Unknown Brand";
  };

  // Get brand initials for avatar
  const getBrandInitials = (brandName: string) => {
    return brandName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Don't render if user has no brands
  if (!availableBrands || availableBrands.length === 0) {
    return null;
  }

  // If user has only one brand, show it but make dropdown disabled
  if (availableBrands.length === 1) {
    // Use activeBrand name if available, otherwise show loading or fallback
    const brandName = activeBrand?.name || (activeBrandId ? "Loading..." : "Single Brand");
    
    return (
      <Button variant="outline" className={`justify-between ${className}`} disabled>
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={activeBrand?.logo} />
            <AvatarFallback className="text-xs">
              {getBrandInitials(brandName)}
            </AvatarFallback>
          </Avatar>
          <span className="truncate max-w-[120px]">{brandName}</span>
        </div>

      </Button>
    );
  }

  const currentBrandName = activeBrand?.name || (activeBrandId ? "Loading..." : "Select Brand");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`justify-between ${className}`}
          disabled={isLoading !== null}
        >
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={activeBrand?.logo} />
              <AvatarFallback className="text-xs">
                {getBrandInitials(currentBrandName)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate max-w-[120px]">{currentBrandName}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Switch Brand</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {availableBrands.map((brand: any) => {
          const brandId = typeof brand === "string" ? brand : brand._id || brand.id;
          const brandName = getBrandDisplayName(brand);
          const isActive = brandId === activeBrandId;
          const isSwitching = isLoading === brandId;

          return (
            <DropdownMenuItem
              key={brandId}
              className={`flex items-center gap-2 cursor-pointer ${
                isActive ? "bg-accent" : ""
              }`}
              onClick={() => handleBrandSwitch(brandId)}
              disabled={isSwitching}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={brand?.logo} />
                <AvatarFallback className="text-xs">
                  {getBrandInitials(brandName)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="font-medium text-sm">{brandName}</div>
                {brand?.description && (
                  <div className="text-xs text-muted-foreground truncate">
                    {brand.description}
                  </div>
                )}
              </div>

              {isActive && <Check className="h-4 w-4 text-primary" />}
              {isSwitching && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

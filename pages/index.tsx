// pages/index.tsx
import React from "react";
import BrandLayout from "@/components/layouts/BrandLayout";
import { useBrand } from "@/contexts/BrandContext";
import { getBrandInfo } from "@/hooks/useApi";
import UnifiedDashboard from "@/components/UnifiedDashboard";

export default function HomePage() {
  const { activeBrandId } = useBrand();

  // Fetch brand information for page title
  const { data: brandData } = getBrandInfo(activeBrandId);

  return (
    <BrandLayout
      title={brandData ? `${brandData.name} | FitBook` : "Home | FitBook"}
    >
      <UnifiedDashboard />
    </BrandLayout>
  );
}

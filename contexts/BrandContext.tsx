// contexts/BrandContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/router";
import { useAuth, Brand as AuthBrand } from "./AuthContext";

// Define the Brand interface to be compatible with AuthContext.Brand
export interface Brand {
  _id?: string; // Make _id optional to accommodate both types
  id?: string;
  name: string;
  description?: string;
  logo?: string;
  status?: string;
  [key: string]: any; // Allow for additional properties
}

interface BrandContextType {
  activeBrandId: string | null;
  activeBrand: Brand | null;
  setActiveBrandId: (brandId: string) => void;
  isLoading: boolean;
}

const defaultContext: BrandContextType = {
  activeBrandId: null,
  activeBrand: null,
  setActiveBrandId: () => {},
  isLoading: true,
};

const BrandContext = createContext<BrandContextType>(defaultContext);

export const BrandProvider = ({ children }: { children: ReactNode }) => {
  const [activeBrandId, setActiveBrandId] = useState<string | null>(null);
  const [activeBrand, setActiveBrand] = useState<Brand | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Update active brand when brandId changes
  useEffect(() => {
    if (!activeBrandId || !user?.brands || user.brands.length === 0) {
      setActiveBrand(null);
      return;
    }

    // Find the matching brand in user's brands
    const foundBrand = user.brands.find((brand: any) => {
      // Handle both string IDs and object IDs
      const brandId = typeof brand === "string" ? brand : brand._id || brand.id;
      return brandId === activeBrandId;
    });

    if (foundBrand && typeof foundBrand !== "string") {
      // Convert AuthBrand to BrandContext.Brand explicitly
      const brandData: Brand = {
        _id: foundBrand._id,
        id: foundBrand.id,
        name: foundBrand.name,
        description: foundBrand.description,
        logo: foundBrand.logo,
        status: foundBrand.status,
      };
      setActiveBrand(brandData);
    } else {
      setActiveBrand(null);
    }
  }, [activeBrandId, user]);

  // Set active brand ID based on priority
  useEffect(() => {
    if (authLoading) return;

    // Priority 1: Get from URL if available
    if (router.query.brandId && typeof router.query.brandId === "string") {
      setActiveBrandId(router.query.brandId);
      setIsLoading(false);
      return;
    }

    // Priority 2: Get from user's brands if authenticated
    if (isAuthenticated && user?.brands && user.brands.length > 0) {
      // Handle both string IDs and object IDs
      const firstBrand = user.brands[0];
      const firstBrandId =
        typeof firstBrand === "string"
          ? firstBrand
          : firstBrand._id || firstBrand.id;

      if (firstBrandId) {
        setActiveBrandId(firstBrandId);
      }
      setIsLoading(false);
      return;
    }

    // If neither is available but we're done loading
    if (!authLoading) {
      setIsLoading(false);
    }
  }, [
    router.query.brandId,
    user,
    isAuthenticated,
    authLoading,
    router.isReady,
  ]);

  // Handle manual brand selection
  const handleSetActiveBrandId = (brandId: string) => {
    setActiveBrandId(brandId);

    // Optionally store in localStorage for persistence
    if (typeof window !== "undefined") {
      localStorage.setItem("activeBrandId", brandId);
    }
  };

  return (
    <BrandContext.Provider
      value={{
        activeBrandId,
        activeBrand,
        setActiveBrandId: handleSetActiveBrandId,
        isLoading,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => useContext(BrandContext);

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
import BrandApi from "../api/brandApi";

// Define the Brand interface to be compatible with AuthContext.Brand
export interface Brand {
  _id?: string; // Make _id optional to accommodate both types
  id?: string;
  name: string;
  description?: string;
  logo?: string;
  status?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  contact?: {
    phone?: string;
    website?: string;
  };
  email?: string;
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
        email: foundBrand.eamil,
      };
      setActiveBrand(brandData);
    } else {
      // If we have an activeBrandId but no brand details, fetch from API
      if (activeBrandId) {
        BrandApi.getInfoById(activeBrandId)
          .then((response) => {
            const brandData = response.data || response; // Handle both nested and direct response
            
            if (brandData && brandData.name) {
              const apiBrandData: Brand = {
                _id: brandData._id || brandData.id,
                id: brandData.id || brandData._id,
                name: brandData.name,
                description: brandData.description,
                logo: brandData.logo,
                status: brandData.status,
                address: brandData.address,
                contact: brandData.contact,
                email: brandData.email,
              };
              setActiveBrand(apiBrandData);
            } else {
              setActiveBrand(null);
            }
          })
          .catch((error) => {
            console.error("Error fetching brand details:", error);
            setActiveBrand(null);
          });
      } else {
        setActiveBrand(null);
      }
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

    // Priority 2: Get from localStorage if available and user has that brand
    if (typeof window !== "undefined") {
      const savedBrandId = localStorage.getItem("activeBrandId");
      if (savedBrandId && isAuthenticated && user?.brands) {
        const hasThisBrand = user.brands.some((brand: any) => {
          const brandId = typeof brand === "string" ? brand : brand._id || brand.id;
          return brandId === savedBrandId;
        });
        
        if (hasThisBrand) {
          setActiveBrandId(savedBrandId);
          setIsLoading(false);
          return;
        } else {
          // Remove invalid saved brand ID
          localStorage.removeItem("activeBrandId");
        }
      }
    }

    // Priority 3: Get from user's brands if authenticated
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

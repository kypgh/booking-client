// api/apiContext.ts
import agent from "./agent";
import { useBrand } from "@/contexts/BrandContext";

export const useApiWithBrand = () => {
  const { activeBrandId } = useBrand();

  const getWithBrand = async (endpoint: string, params: object = {}) => {
    const queryParams = new URLSearchParams(params as Record<string, string>);

    // Always include brandId if available
    if (activeBrandId) {
      queryParams.append("brandId", activeBrandId);
    }

    const url = `${endpoint}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return agent.get(url);
  };

  const postWithBrand = async (endpoint: string, data: object = {}) => {
    // Include brandId in the payload if available
    const payload = activeBrandId ? { ...data, brandId: activeBrandId } : data;

    return agent.post(endpoint, payload);
  };

  return {
    getWithBrand,
    postWithBrand,
    activeBrandId,
  };
};

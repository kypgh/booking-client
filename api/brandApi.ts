import agent from "./agent";

// Define return types for API responses
interface ApiResponse<T> {
  data: T;
  [key: string]: any;
}

const BrandApi = {
  getInfoById: async (brandId: string | null): Promise<ApiResponse<any>> => {
    try {
      const response = await agent.get(`/brand/${brandId}`);
      return response;
    } catch (error) {
      console.error("Get brand info error:", error);
      throw error;
    }
  },
};

export default BrandApi;

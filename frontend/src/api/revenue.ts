import appAxios from "@/services/AxiosClient";
import type { RevenueForecast } from "@/types/revenue";

export const getAllForecasts = async (): Promise<RevenueForecast[]> => {
  const response = await appAxios.get<RevenueForecast[]>('/revenue/');
  if (!response.data) {
    throw new Error("Failed to fetch revenue forecasts");
  }
  return response.data;
};

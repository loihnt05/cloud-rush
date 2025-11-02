import appAxios from "@/services/AxiosClient";
import type { Airport } from "@/types/airport";

export const getAirports = async (): Promise<Airport[]> => {
  const response = await appAxios.get<Airport[]>('/airports/all');
  if (!response.data) {
    throw new Error("Failed to fetch airports");
  }
  return response.data;
};

export const getAirportById = async (id: number): Promise<Airport> => {
  const response = await appAxios.get<Airport>(`/airports/${id}`);
  if (!response.data) {
    throw new Error("Failed to fetch airport");
  }
  return response.data;
};
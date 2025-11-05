import appAxios from "@/services/AxiosClient";

// Define Place types based on backend schema
export interface Place {
  place_id: number;
  name: string;
  country: string | null;
  city: string | null;
  description: string | null;
}

export interface CreatePlaceDto {
  name: string;
  country?: string;
  city?: string;
  description?: string;
}

export interface UpdatePlaceDto {
  name?: string;
  country?: string;
  city?: string;
  description?: string;
}

// API functions for places
export const placesApi = {
  // GET request - fetch all places
  getPlaces: async (): Promise<Place[]> => {
    const response = await appAxios.get<Place[]>("/places");
    return response.data;
  },

  // GET request - fetch single place
  getPlaceById: async (id: number): Promise<Place> => {
    const response = await appAxios.get<Place>(`/places/${id}`);
    return response.data;
  },

  // POST request - create place
  createPlace: async (data: CreatePlaceDto): Promise<Place> => {
    const response = await appAxios.post<Place>("/places", data);
    return response.data;
  },

  // PUT request - update place
  updatePlace: async (id: number, data: UpdatePlaceDto): Promise<Place> => {
    const response = await appAxios.put<Place>(`/places/${id}`, data);
    return response.data;
  },
};

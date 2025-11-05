import appAxios from "@/services/AxiosClient";

// Define Hotel types based on backend schema
export interface Hotel {
  hotel_id: number;
  service_id: number;
  location: string | null;
  stars: number | null;
  description: string | null;
}

export interface CreateHotelDto {
  service_id: number;
  location?: string;
  stars: number;
  description?: string;
}

export interface UpdateHotelDto {
  service_id?: number;
  location?: string;
  stars?: number;
  description?: string;
}

// API functions for hotels
export const hotelsApi = {
  // GET request - fetch all hotels
  getHotels: async (): Promise<Hotel[]> => {
    const response = await appAxios.get<Hotel[]>("/hotels/");
    return response.data;
  },

  // GET request - fetch hotels by star rating
  getHotelsByStars: async (stars: number): Promise<Hotel[]> => {
    const response = await appAxios.get<Hotel[]>(`/hotels/stars/${stars}`);
    return response.data;
  },

  // GET request - fetch single hotel
  getHotelById: async (id: number): Promise<Hotel> => {
    const response = await appAxios.get<Hotel>(`/hotels/${id}`);
    return response.data;
  },

  // POST request - create hotel
  createHotel: async (data: CreateHotelDto): Promise<Hotel> => {
    const response = await appAxios.post<Hotel>("/hotels/", data);
    return response.data;
  },

  // PUT request - update hotel
  updateHotel: async (id: number, data: UpdateHotelDto): Promise<Hotel> => {
    const response = await appAxios.put<Hotel>(`/hotels/${id}`, data);
    return response.data;
  },

  // DELETE request - delete hotel
  deleteHotel: async (id: number): Promise<void> => {
    await appAxios.delete(`/hotels/${id}`);
  },
};

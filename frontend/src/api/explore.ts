import appAxios from "@/services/AxiosClient";

// Define Explore types based on backend schema
export interface Explore {
  explore_id: number;
  user_id: string;
  place_id: number | null;
  title: string;
  content: string | null;
  created_at: string | null;
}

export interface CreateExploreDto {
  user_id: string;
  place_id?: number | null;
  title: string;
  content?: string | null;
}

export interface UpdateExploreDto {
  place_id?: number | null;
  title?: string;
  content?: string | null;
}

// API functions for explores
export const exploreApi = {
  // GET request - fetch all explores
  getAllExplores: async (): Promise<Explore[]> => {
    const response = await appAxios.get<Explore[]>("/explores");
    return response.data;
  },

  // GET request - fetch random explores
  getRandomExplores: async (limit: number = 10): Promise<Explore[]> => {
    const response = await appAxios.get<Explore[]>(`/explores/random?limit=${limit}`);
    return response.data;
  },

  // GET request - fetch explores by place
  getExploresByPlace: async (placeId: number): Promise<Explore> => {
    const response = await appAxios.get<Explore>(`/explores/place/${placeId}`);
    return response.data;
  },

  // POST request - create explore
  createExplore: async (data: CreateExploreDto): Promise<Explore> => {
    const response = await appAxios.post<Explore>("/explores", data);
    return response.data;
  },

  // PUT request - update explore
  updateExplore: async (id: number, data: UpdateExploreDto): Promise<Explore> => {
    const response = await appAxios.put<Explore>(`/explores/${id}`, data);
    return response.data;
  },

  // DELETE request - delete explore
  deleteExplore: async (id: number): Promise<void> => {
    await appAxios.delete(`/explores/${id}`);
  },
};

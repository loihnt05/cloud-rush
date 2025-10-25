import appAxios from "@/services/AxiosClient";

// Define your data types based on backend schema
export interface Airplane {
  airplane_id: number;
  model: string;
  manufacturer: string | null;
  seat_capacity: number;
  created_at?: string;
}

export type CreateAirplaneDto = {
  model: string;
  manufacturer?: string;
  seat_capacity: number;
}

// API functions using appAxios
export const airplaneApi = {
  // GET request - fetch all airplanes
  getAirplanes: async (): Promise<Airplane[]> => {
    const response = await appAxios.get<Airplane[]>("/airplanes/all");
    return response.data;
  },

  // GET request - fetch single airplane
  getAirplaneById: async (id: number): Promise<Airplane> => {
    const response = await appAxios.get<Airplane>(`/airplanes/${id}`);
    return response.data;
  },

  // POST request - create airplane
  createAirplane: async (data: CreateAirplaneDto): Promise<Airplane> => {
    const response = await appAxios.post<Airplane>("/airplanes/", data);
    return response.data;
  },

  // PUT request - update airplane
  updateAirplane: async (id: number, data: Partial<CreateAirplaneDto>): Promise<Airplane> => {
    const response = await appAxios.put<Airplane>(`/airplanes/${id}`, data);
    return response.data;
  },

  // DELETE request - delete airplane
  deleteAirplane: async (id: number): Promise<void> => {
    await appAxios.delete(`/airplanes/${id}`);
  },
};

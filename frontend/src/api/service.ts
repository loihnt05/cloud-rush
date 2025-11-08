import appAxios from "@/services/AxiosClient";

// Define Service types based on backend schema
export interface Service {
  service_id: number;
  name: string;
  type: "rental_car" | "hotel" | "package";
  price: number;
}

export interface ServiceCreate {
  name: string;
  type: "rental_car" | "hotel" | "package";
  price: number;
}

export interface ServiceUpdate {
  name?: string;
  type?: "rental_car" | "hotel" | "package";
  price?: number;
}

// API functions for services
export const serviceApi = {
  // GET request - get all services
  getAllServices: async (): Promise<Service[]> => {
    const response = await appAxios.get<Service[]>("/services/");
    return response.data;
  },

  // GET request - get service by ID
  getServiceById: async (serviceId: number): Promise<Service> => {
    const response = await appAxios.get<Service>(`/services/${serviceId}`);
    return response.data;
  },

  // GET request - get services by type
  getServicesByType: async (type: string): Promise<Service[]> => {
    const response = await appAxios.get<Service[]>(`/services/type/${type}`);
    return response.data;
  },

  // POST request - create service
  createService: async (data: ServiceCreate): Promise<Service> => {
    const response = await appAxios.post<Service>("/services/", data);
    return response.data;
  },

  // PUT request - update service
  updateService: async (serviceId: number, data: ServiceUpdate): Promise<Service> => {
    const response = await appAxios.put<Service>(`/services/${serviceId}`, data);
    return response.data;
  },

  // DELETE request - delete service
  deleteService: async (serviceId: number): Promise<void> => {
    await appAxios.delete(`/services/${serviceId}`);
  },
};

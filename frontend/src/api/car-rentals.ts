import appAxios from "@/services/AxiosClient";

// Define CarRental types based on backend schema
export interface CarRental {
  car_rental_id: number;
  service_id: number;
  car_model: string | null;
  brand: string | null;
  daily_rate: number | null;
  available: boolean;
}

export interface CreateCarRentalDto {
  service_id: number;
  car_model?: string;
  brand?: string;
  daily_rate?: number;
  available?: boolean;
}

export interface UpdateCarRentalDto {
  service_id?: number;
  car_model?: string;
  brand?: string;
  daily_rate?: number;
  available?: boolean;
}

// API functions for car rentals
export const carRentalsApi = {
  // GET request - fetch all car rentals
  getCarRentals: async (): Promise<CarRental[]> => {
    const response = await appAxios.get<CarRental[]>("/car-rentals/");
    return response.data;
  },

  // GET request - fetch available car rentals
  getAvailableCarRentals: async (): Promise<CarRental[]> => {
    const response = await appAxios.get<CarRental[]>("/car-rentals/available");
    return response.data;
  },

  // GET request - fetch car rentals by brand
  getCarRentalsByBrand: async (brand: string): Promise<CarRental[]> => {
    const response = await appAxios.get<CarRental[]>(`/car-rentals/brand/${brand}`);
    return response.data;
  },

  // GET request - fetch single car rental
  getCarRentalById: async (id: number): Promise<CarRental> => {
    const response = await appAxios.get<CarRental>(`/car-rentals/${id}`);
    return response.data;
  },

  // POST request - create car rental
  createCarRental: async (data: CreateCarRentalDto): Promise<CarRental> => {
    const response = await appAxios.post<CarRental>("/car-rentals/", data);
    return response.data;
  },

  // PUT request - update car rental
  updateCarRental: async (id: number, data: UpdateCarRentalDto): Promise<CarRental> => {
    const response = await appAxios.put<CarRental>(`/car-rentals/${id}`, data);
    return response.data;
  },

  // DELETE request - delete car rental
  deleteCarRental: async (id: number): Promise<void> => {
    await appAxios.delete(`/car-rentals/${id}`);
  },
};

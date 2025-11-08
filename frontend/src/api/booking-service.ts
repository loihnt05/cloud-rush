import appAxios from "@/services/AxiosClient";

// Define BookingService types based on backend schema
export interface BookingService {
  booking_service_id: number;
  booking_id: number;
  service_id: number;
  quantity: number;
}

export interface BookingServiceCreate {
  booking_id: number;
  service_id: number;
  quantity?: number;
}

export interface BookingServiceUpdate {
  quantity?: number;
}

// API functions for booking services
export const bookingServiceApi = {
  // POST request - add service to booking
  addServiceToBooking: async (data: BookingServiceCreate): Promise<BookingService> => {
    const response = await appAxios.post<BookingService>("/booking-services/", data);
    return response.data;
  },

  // GET request - get all services for a booking
  getBookingServices: async (bookingId: number): Promise<BookingService[]> => {
    const response = await appAxios.get<BookingService[]>(`/booking-services/booking/${bookingId}`);
    return response.data;
  },

  // GET request - get all booking services
  getAllBookingServices: async (): Promise<BookingService[]> => {
    const response = await appAxios.get<BookingService[]>("/booking-services/");
    return response.data;
  },

  // PUT request - update booking service
  updateBookingService: async (
    bookingServiceId: number,
    data: BookingServiceUpdate
  ): Promise<BookingService> => {
    const response = await appAxios.put<BookingService>(
      `/booking-services/${bookingServiceId}`,
      data
    );
    return response.data;
  },

  // DELETE request - remove service from booking
  removeServiceFromBooking: async (bookingServiceId: number): Promise<void> => {
    await appAxios.delete(`/booking-services/${bookingServiceId}`);
  },
};

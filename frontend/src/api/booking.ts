import appAxios from "@/services/AxiosClient";
import type { 
  Booking, 
  BookingCreate, 
  Passenger, 
  PassengerCreate,
  EmergencyContact,
  EmergencyContactCreate 
} from "@/types/booking";

// Booking APIs
export const createBooking = async (booking: BookingCreate): Promise<Booking> => {
  const response = await appAxios.post<Booking>('/bookings/', booking);
  if (!response.data) {
    throw new Error("Failed to create booking");
  }
  return response.data;
};

export const getBooking = async (bookingId: number): Promise<Booking> => {
  const response = await appAxios.get<Booking>(`/bookings/${bookingId}`);
  if (!response.data) {
    throw new Error("Failed to fetch booking");
  }
  return response.data;
};

export const getBookingByReference = async (bookingReference: string): Promise<Booking> => {
  const response = await appAxios.get<Booking>(`/bookings/reference/${bookingReference}`);
  if (!response.data) {
    throw new Error("Failed to fetch booking");
  }
  return response.data;
};

export const getUserBookings = async (userId: string): Promise<Booking[]> => {
  const response = await appAxios.get<Booking[]>(`/bookings/user/${userId}`);
  if (!response.data) {
    throw new Error("Failed to fetch user bookings");
  }
  return response.data;
};

// Get booking with flight information (by getting passengers and extracting flight from flight_seat)
export const getBookingFlightId = async (bookingId: number): Promise<number | null> => {
  try {
    const passengers = await getPassengersByBooking(bookingId);
    if (passengers.length > 0 && passengers[0].flight_seat_id) {
      // We have a flight seat ID, but we need to get the flight ID from the backend
      // For now, return null and handle this in the component
      return null;
    }
    return null;
  } catch (err) {
    console.error("Error getting flight ID for booking:", err);
    return null;
  }
};

export const confirmBooking = async (bookingId: number): Promise<Booking> => {
  const response = await appAxios.post<Booking>(`/bookings/${bookingId}/confirm`);
  if (!response.data) {
    throw new Error("Failed to confirm booking");
  }
  return response.data;
};

export const calculateBookingTotal = async (bookingId: number): Promise<Booking> => {
  const response = await appAxios.post<Booking>(`/bookings/${bookingId}/calculate-total`);
  if (!response.data) {
    throw new Error("Failed to calculate booking total");
  }
  return response.data;
};

// Passenger APIs
export const createPassenger = async (passenger: PassengerCreate): Promise<Passenger> => {
  const response = await appAxios.post<Passenger>('/passengers/', passenger);
  if (!response.data) {
    throw new Error("Failed to create passenger");
  }
  return response.data;
};

export const getPassenger = async (passengerId: number): Promise<Passenger> => {
  const response = await appAxios.get<Passenger>(`/passengers/${passengerId}`);
  if (!response.data) {
    throw new Error("Failed to fetch passenger");
  }
  return response.data;
};

export const getPassengersByBooking = async (bookingId: number): Promise<Passenger[]> => {
  const response = await appAxios.get<Passenger[]>(`/passengers/booking/${bookingId}`);
  if (!response.data) {
    throw new Error("Failed to fetch passengers");
  }
  return response.data;
};

export const updatePassenger = async (passengerId: number, passenger: Partial<PassengerCreate>): Promise<Passenger> => {
  const response = await appAxios.put<Passenger>(`/passengers/${passengerId}`, passenger);
  if (!response.data) {
    throw new Error("Failed to update passenger");
  }
  return response.data;
};

export const deletePassenger = async (passengerId: number): Promise<void> => {
  await appAxios.delete(`/passengers/${passengerId}`);
};

// Emergency Contact APIs
export const createEmergencyContact = async (contact: EmergencyContactCreate): Promise<EmergencyContact> => {
  const response = await appAxios.post<EmergencyContact>('/emergency-contacts/', contact);
  if (!response.data) {
    throw new Error("Failed to create emergency contact");
  }
  return response.data;
};

export const getEmergencyContactsByPassenger = async (passengerId: number): Promise<EmergencyContact[]> => {
  const response = await appAxios.get<EmergencyContact[]>(`/emergency-contacts/passenger/${passengerId}`);
  if (!response.data) {
    throw new Error("Failed to fetch emergency contacts");
  }
  return response.data;
};

export const updateEmergencyContact = async (contactId: number, contact: Partial<EmergencyContactCreate>): Promise<EmergencyContact> => {
  const response = await appAxios.put<EmergencyContact>(`/emergency-contacts/${contactId}`, contact);
  if (!response.data) {
    throw new Error("Failed to update emergency contact");
  }
  return response.data;
};

export const deleteEmergencyContact = async (contactId: number): Promise<void> => {
  await appAxios.delete(`/emergency-contacts/${contactId}`);
};

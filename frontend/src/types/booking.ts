// Booking types
export interface Booking {
  booking_id: number;
  user_id: string;
  booking_reference: string;
  booking_date?: string;
  status: string;
  total_amount?: number | string;
  notes?: string;
}

export interface BookingCreate {
  user_id: string;
  notes?: string;
  status?: string;
}

export interface BookingUpdate {
  status?: string;
  total_amount?: number | string;
  notes?: string;
}

// Passenger types
export type PassengerType = 'adult' | 'child' | 'infant';

export interface Passenger {
  passenger_id: number;
  booking_id: number;
  passenger_type: PassengerType;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  date_of_birth: string;
  email?: string;
  phone_number?: string;
  redress_number?: string;
  known_traveler_number?: string;
  flight_seat_id?: number;
  special_requests?: string;
  created_at?: string;
}

export interface PassengerCreate {
  booking_id: number;
  passenger_type: PassengerType;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  date_of_birth: string;
  email?: string;
  phone_number?: string;
  redress_number?: string;
  known_traveler_number?: string;
  flight_seat_id?: number;
  special_requests?: string;
}

export interface PassengerUpdate {
  passenger_type?: PassengerType;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  suffix?: string;
  date_of_birth?: string;
  email?: string;
  phone_number?: string;
  redress_number?: string;
  known_traveler_number?: string;
  flight_seat_id?: number;
  special_requests?: string;
}

// Emergency Contact types
export interface EmergencyContact {
  contact_id: number;
  passenger_id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number: string;
  relationship_type?: string;
  created_at?: string;
}

export interface EmergencyContactCreate {
  passenger_id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number: string;
  relationship_type?: string;
}

export interface EmergencyContactUpdate {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  relationship_type?: string;
}

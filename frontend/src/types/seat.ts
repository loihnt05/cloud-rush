export interface Seat {
  seat_id: number;
  airplane_id: number;
  seat_number: string;
  seat_class: "economy" | "business" | "first";
}

export interface FlightSeat {
  flight_seat_id: number;
  flight_id: number;
  seat_id: number;
  status: "available" | "reserved" | "booked";
  price_multiplier: number | string; // Backend returns Decimal as string
}

export interface FlightSeatDetail extends FlightSeat {
  seat_number?: string;
  seat_class?: "economy" | "business" | "first";
}

export interface SeatWithStatus extends Seat {
  flight_seat_id: number;
  status: "available" | "reserved" | "booked";
  price_multiplier: number;
  price: number; // Calculated price
}

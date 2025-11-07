import appAxios from "@/services/AxiosClient";
import { type Seat, type FlightSeat, type SeatWithStatus } from "@/types/seat";
import { type Flight } from "@/types/flight";

export const getFlightSeats = async (flightId: number): Promise<FlightSeat[]> => {
  const response = await appAxios.get<FlightSeat[]>(`/flight-seats/flight/${flightId}`);
  if (!response.data) {
    throw new Error("Failed to fetch flight seats");
  }
  return response.data;
};

export const getAvailableSeats = async (flightId: number): Promise<FlightSeat[]> => {
  const response = await appAxios.get<FlightSeat[]>(`/flight-seats/flight/${flightId}/available`);
  if (!response.data) {
    throw new Error("Failed to fetch available seats");
  }
  return response.data;
};

export const getSeatsByClass = async (
  flightId: number,
  seatClass: string
): Promise<FlightSeat[]> => {
  const response = await appAxios.get<FlightSeat[]>(
    `/flight-seats/flight/${flightId}/class/${seatClass}`
  );
  if (!response.data) {
    throw new Error("Failed to fetch seats by class");
  }
  return response.data;
};

export const getSeatDetails = async (seatId: number): Promise<Seat> => {
  const response = await appAxios.get<Seat>(`/seats/${seatId}`);
  if (!response.data) {
    throw new Error("Failed to fetch seat details");
  }
  return response.data;
};

export const getSeatsForFlight = async (
  airplaneId: number
): Promise<Seat[]> => {
  const response = await appAxios.get<Seat[]>(`/seats/airplane/${airplaneId}`);
  if (!response.data) {
    throw new Error("Failed to fetch airplane seats");
  }
  return response.data;
};

// Combined function to get seats with their status and pricing
export const getFlightSeatsWithDetails = async (
  flightId: number,
  flight: Flight
): Promise<SeatWithStatus[]> => {
  if (!flight.airplane_id) {
    throw new Error("Flight does not have an airplane assigned");
  }

  const [flightSeats, airplaneSeats] = await Promise.all([
    getFlightSeats(flightId),
    getSeatsForFlight(flight.airplane_id),
  ]);

  // Create a map of seat_id to flight seat info
  const flightSeatMap = new Map(
    flightSeats.map((fs) => [fs.seat_id, fs])
  );

  // Combine airplane seats with flight seat status and pricing
  const seatsWithStatus: SeatWithStatus[] = airplaneSeats.map((seat) => {
    const flightSeat = flightSeatMap.get(seat.seat_id);
    if (!flightSeat) {
      // This seat is not assigned to this flight
      return null;
    }
    
    const priceMultiplier = typeof flightSeat.price_multiplier === 'string'
      ? parseFloat(flightSeat.price_multiplier)
      : flightSeat.price_multiplier;

    const basePrice = typeof flight.base_price === 'string'
      ? parseFloat(flight.base_price)
      : flight.base_price;

    // Calculate upgrade price: base_price * (price_multiplier - 1)
    // This gives us the ADDITIONAL cost above the base fare
    // Economy seats (multiplier 1.0): upgrade = 0
    // Business seats (multiplier 1.5): upgrade = base * 0.5
    // First class (multiplier 2.0): upgrade = base * 1.0
    const upgradePrice = basePrice * (priceMultiplier - 1);

    return {
      ...seat,
      flight_seat_id: flightSeat.flight_seat_id,
      status: flightSeat.status,
      price_multiplier: priceMultiplier,
      price: Math.max(0, upgradePrice), // Ensure non-negative
    };
  }).filter((seat): seat is SeatWithStatus => seat !== null);

  return seatsWithStatus;
};

import appAxios from "@/services/AxiosClient";
import { type Flight } from "@/types/flight";
import { getAirports } from "./airport";

export const getFlights = async (): Promise<Flight[]> => {
  const [flightResponse, airportsResponse] = await Promise.all([
    appAxios.get<Flight[]>('/flights/all'),
    getAirports(),
  ]);

  if (!flightResponse.data) {
    throw new Error("Failed to fetch flights");
  }

  const airports = airportsResponse;
  const airportMap = new Map(airports.map(airport => [airport.airport_id, airport.name]));

  const flights = flightResponse.data.map(flight => ({
    ...flight,
    origin: airportMap.get(flight.origin_airport_id) || `Airport ${flight.origin_airport_id}`,
    destination: airportMap.get(flight.destination_airport_id) || `Airport ${flight.destination_airport_id}`,
  }));

  return flights;
};

export const searchFlights = async (
  origin: string,
  destination: string
): Promise<Flight[]> => {
  const [flightResponse, airportsResponse] = await Promise.all([
    appAxios.get<Flight[]>(
      `/flights/search?origin=${origin}&destination=${destination}`
    ),
    getAirports(),
  ]);

  if (!flightResponse.data) {
    throw new Error("Failed to search flights");
  }

  const airports = airportsResponse;
  const airportMap = new Map(airports.map(airport => [airport.airport_id, airport.name]));

  const flights = flightResponse.data.map(flight => ({
    ...flight,
    origin: airportMap.get(flight.origin_airport_id) || `Airport ${flight.origin_airport_id}`,
    destination: airportMap.get(flight.destination_airport_id) || `Airport ${flight.destination_airport_id}`,
  }));

  return flights;
};

export const getFlight = async (id: number): Promise<Flight> => {
  const response = await appAxios.get<Flight>(`/flights/${id}`);
  if (!response.data) {
    throw new Error("Failed to fetch flight");
  }
  return response.data;
};

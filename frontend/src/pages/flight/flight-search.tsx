"use client";
import { getFlights } from "@/api/flight";
import { getAirports } from "@/api/airport";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useSettingStore from "@/stores/setting-store";
import type { Flight } from "@/types/flight";
import type { Airport } from "@/types/airport";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import {
  FlightFilterToolbar,
  type FlightFilters,
} from "./flight-filter-toolbar";

export default function FlightSearch() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [filters, setFilters] = useState<FlightFilters>({});
  const [loading, setLoading] = useState(true);
  const { accessToken } = useSettingStore();
  const { isAuthenticated, isLoading } = useAuth0();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchData = async () => {
      // Wait for Auth0 to finish loading
      if (isLoading) {
        return;
      }

      // If user is authenticated, wait for access token
      if (isAuthenticated && !accessToken) {
        return;
      }

      try {
        setLoading(true);
        const [flightsResult, airportsResult] = await Promise.all([
          getFlights(),
          getAirports(),
        ]);
        setFlights(flightsResult);
        setAirports(airportsResult);

        // Initialize filters from URL parameters
        const initialFilters: FlightFilters = {};
        
        // Get origin and destination from URL params (they are airport IDs)
        const fromAirportId = searchParams.get("from");
        const toAirportId = searchParams.get("to");
        const date = searchParams.get("date");
        
        if (fromAirportId) {
          const originAirport = airportsResult.find(
            (a) => a.airport_id.toString() === fromAirportId
          );
          if (originAirport) {
            initialFilters.origin = originAirport.name;
          }
        }
        
        if (toAirportId) {
          const destAirport = airportsResult.find(
            (a) => a.airport_id.toString() === toAirportId
          );
          if (destAirport) {
            initialFilters.destination = destAirport.name;
          }
        }
        
        if (date) {
          initialFilters.departureDate = new Date(date);
        }
        
        // Set the filters if any URL params were found
        if (Object.keys(initialFilters).length > 0) {
          setFilters(initialFilters);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, isLoading, accessToken, searchParams]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      {loading ? (
        <Card>
          <CardContent className="p-6">
            <p>Loading flights...</p>
          </CardContent>
        </Card>
      ) : flights.length > 0 ? (
        <>
          <FlightFilterToolbar
            filters={filters}
            onFiltersChange={setFilters}
            airports={airports}
          />
          <Card>
            <CardHeader>
              <CardTitle>
                Search Results
                {Object.keys(filters).length > 0 && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    (
                    {
                      flights.filter((flight) => {
                        // Apply the same filter logic to count filtered results
                        if (
                          filters.flightNumber &&
                          !flight.flight_number
                            .toLowerCase()
                            .includes(filters.flightNumber.toLowerCase())
                        )
                          return false;
                        if (
                          filters.origin &&
                          flight.origin &&
                          !flight.origin
                            .toLowerCase()
                            .includes(filters.origin.toLowerCase())
                        )
                          return false;
                        if (
                          filters.destination &&
                          flight.destination &&
                          !flight.destination
                            .toLowerCase()
                            .includes(filters.destination.toLowerCase())
                        )
                          return false;
                        if (
                          filters.status &&
                          flight.status &&
                          flight.status.toLowerCase() !==
                            filters.status.toLowerCase()
                        )
                          return false;
                        if (filters.departureDate) {
                          const departureDate = new Date(flight.departure_time);
                          const filterDate = new Date(filters.departureDate);
                          filterDate.setHours(0, 0, 0, 0);
                          departureDate.setHours(0, 0, 0, 0);
                          if (departureDate.getTime() !== filterDate.getTime())
                            return false;
                        }
                        if (filters.arrivalDate) {
                          const arrivalDate = new Date(flight.arrival_time);
                          const filterDate = new Date(filters.arrivalDate);
                          filterDate.setHours(0, 0, 0, 0);
                          arrivalDate.setHours(0, 0, 0, 0);
                          if (arrivalDate.getTime() !== filterDate.getTime())
                            return false;
                        }
                        const price =
                          typeof flight.base_price === "string"
                            ? parseFloat(flight.base_price)
                            : flight.base_price;
                        if (
                          filters.minPrice !== undefined &&
                          price < filters.minPrice
                        )
                          return false;
                        if (
                          filters.maxPrice !== undefined &&
                          price > filters.maxPrice
                        )
                          return false;
                        return true;
                      }).length
                    }{" "}
                    filtered)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={flights} filters={filters} />
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="rounded-full bg-muted p-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-foreground">
                No Flights Available
              </h3>
              <p className="text-muted-foreground max-w-md">
                We couldn't find any flights for the selected route. This could be because:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>No flights operate on this route</li>
                <li>All flights are fully booked</li>
                <li>The selected date has no scheduled flights</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                Try adjusting your search criteria or selecting a different route.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

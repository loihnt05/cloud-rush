"use client";
import { getFlights } from "@/api/flight";
import { getAirports } from "@/api/airport";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useSettingStore from "@/stores/setting-store";
import type { Flight } from "@/types/flight";
import type { Airport } from "@/types/airport";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
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
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, isLoading, accessToken]);

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
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              No flights found.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

"use client";
import { getFlights } from "@/api/flight";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import useSettingStore from "@/stores/setting-store";
import type { Flight } from "@/types/flight";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";



export default function FlightSearch() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useSettingStore();
  const { isAuthenticated, isLoading } = useAuth0();

  useEffect(() => {
    const fetchFlights = async () => {
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
        const result = await getFlights();
        setFlights(result);
        console.log(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [isAuthenticated, isLoading, accessToken]);

  return (
    <div className="container mx-auto p-4">
      {loading ? (
        <Card>
          <CardContent className="p-6">
            <p>Loading flights...</p>
          </CardContent>
        </Card>
      ) : flights.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={flights} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

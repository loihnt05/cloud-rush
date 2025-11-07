"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Flight } from "@/types/flight";
import type { Row } from "@tanstack/react-table";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";

interface DataTableRowActionsProps {
  row: Row<Flight>;
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const flight = row.original;
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get passenger count from URL params and set as initial state
  const initialAdults = Number.parseInt(searchParams.get("adults") || "1", 10);
  const initialChildren = Number.parseInt(searchParams.get("children") || "0", 10);
  
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);
  const totalPassengers = adults + children;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">View Details</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Flight {flight.flight_number}</DialogTitle>
          <DialogDescription>
            From {flight.origin} to {flight.destination}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-between">
            <span className="font-semibold">Origin</span>
            <span>{flight.origin}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Destination</span>
            <span>{flight.destination}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="font-semibold">Departure Time</span>
            <span>{new Date(flight.departure_time).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Arrival Time</span>
            <span>{new Date(flight.arrival_time).toLocaleString()}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="font-semibold">Price</span>
            <Badge variant="secondary">
              $
              {typeof flight.base_price === "string"
                ? parseFloat(flight.base_price).toFixed(2)
                : flight.base_price.toFixed(2)}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">Status</span>
            <Badge
              variant="outline"
              className={
                flight.status === "delayed"
                  ? "text-yellow-400 font-bold"
                  : flight.status === "scheduled"
                  ? "text-green-400 font-bold"
                  : "text-red-400 font-bold"
              }
            >
              {flight.status}
            </Badge>
          </div>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Passengers</span>
              <Badge variant="secondary">
                {totalPassengers} {totalPassengers === 1 ? "Passenger" : "Passengers"}
              </Badge>
            </div>
            
            {/* Adults Counter */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Adults</span>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.preventDefault();
                    setAdults(Math.max(1, adults - 1));
                  }}
                  disabled={adults <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium">{adults}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.preventDefault();
                    setAdults(adults + 1);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Children Counter */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Children</span>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.preventDefault();
                    setChildren(Math.max(0, children - 1));
                  }}
                  disabled={children <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium">{children}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.preventDefault();
                    setChildren(children + 1);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        <Button
          className="hover:cursor-pointer"
          // onClick={() => nav(`/passenger-information?flightId=${row.id}&adults=${adults}&children=${children}`)}
          onClick={() => nav(`/flights/seat-selection?flightId=${flight.flight_id}&adults=${adults}&children=${children}`)}
        >
          Select seats
        </Button>
      </DialogContent>
    </Dialog>
  );
}

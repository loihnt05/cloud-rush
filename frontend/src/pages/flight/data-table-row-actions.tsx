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

interface DataTableRowActionsProps {
  row: Row<Flight>;
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const flight = row.original;

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
        </div>
        <Button>Book Now</Button>
      </DialogContent>
    </Dialog>
  );
}

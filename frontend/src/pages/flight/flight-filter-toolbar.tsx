"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon, Filter, X } from "lucide-react";
import { format } from "date-fns";
import type { Airport } from "@/types/airport";

export interface FlightFilters {
  origin?: string;
  destination?: string;
  departureDate?: Date;
  arrivalDate?: Date;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  flightNumber?: string;
}

interface FlightFilterToolbarProps {
  filters: FlightFilters;
  onFiltersChange: (filters: FlightFilters) => void;
  airports: Airport[];
}

export function FlightFilterToolbar({
  filters,
  onFiltersChange,
  airports,
}: FlightFilterToolbarProps) {
  const updateFilter = <K extends keyof FlightFilters>(
    key: K,
    value: FlightFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== ""
  );

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Filters</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 px-2 lg:px-3 hover:cursor-pointer"
          >
            Clear filters
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Flight Number Filter */}
        <div className="space-y-2">
          <Label htmlFor="flight-number">Flight Number</Label>
          <Input
            id="flight-number"
            placeholder="e.g., AA123"
            value={filters.flightNumber || ""}
            onChange={(e) => updateFilter("flightNumber", e.target.value)}
          />
        </div>

        {/* Origin Filter */}
        <div className="space-y-2">
          <Label htmlFor="origin">Origin Airport</Label>
          <Select
            value={filters.origin || "all"}
            onValueChange={(value: string) => updateFilter("origin", value === "all" ? undefined : value)}
          >
            <SelectTrigger id="origin">
              <SelectValue placeholder="Select origin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All airports</SelectItem>
              {airports.map((airport) => (
                <SelectItem key={airport.airport_id} value={airport.name}>
                  {airport.name} ({airport.iata_code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Destination Filter */}
        <div className="space-y-2">
          <Label htmlFor="destination">Destination Airport</Label>
          <Select
            value={filters.destination || "all"}
            onValueChange={(value: string) =>
              updateFilter("destination", value === "all" ? undefined : value)
            }
          >
            <SelectTrigger id="destination">
              <SelectValue placeholder="Select destination" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All airports</SelectItem>
              {airports.map((airport) => (
                <SelectItem key={airport.airport_id} value={airport.name}>
                  {airport.name} ({airport.iata_code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Departure Date Filter */}
        <div className="space-y-2">
          <Label>Departure Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.departureDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.departureDate ? (
                  format(filters.departureDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.departureDate}
                onSelect={(date) => updateFilter("departureDate", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Arrival Date Filter */}
        <div className="space-y-2">
          <Label>Arrival Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.arrivalDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.arrivalDate ? (
                  format(filters.arrivalDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.arrivalDate}
                onSelect={(date) => updateFilter("arrivalDate", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status">Flight Status</Label>
          <Select
            value={filters.status || "all"}
            onValueChange={(value: string) => updateFilter("status", value === "all" ? undefined : value)}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="delayed">Delayed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Min Price Filter */}
        <div className="space-y-2">
          <Label htmlFor="min-price">Min Price ($)</Label>
          <Input
            id="min-price"
            type="number"
            placeholder="0"
            value={filters.minPrice || ""}
            onChange={(e) =>
              updateFilter(
                "minPrice",
                e.target.value ? parseFloat(e.target.value) : undefined
              )
            }
          />
        </div>

        {/* Max Price Filter */}
        <div className="space-y-2">
          <Label htmlFor="max-price">Max Price ($)</Label>
          <Input
            id="max-price"
            type="number"
            placeholder="1000"
            value={filters.maxPrice || ""}
            onChange={(e) =>
              updateFilter(
                "maxPrice",
                e.target.value ? parseFloat(e.target.value) : undefined
              )
            }
          />
        </div>
      </div>
    </div>
  );
}

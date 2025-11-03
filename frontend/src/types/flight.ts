export interface Flight {
  flight_id: number;
  flight_number: string;
  origin_airport_id: number;
  destination_airport_id: number;
  origin?: string; // Mapped airport name
  destination?: string; // Mapped airport name
  departure_time: string;
  arrival_time: string;
  status: string;
  base_price: number | string; // Backend returns Decimal as string
  tax_rate: number | string; // Backend returns Decimal as string
  airplane_id: number | null;
}


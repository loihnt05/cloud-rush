export interface SeatDisplay {
    id: string;
    row: number;
    column: string;
    type: "economy" | "business" | "first";
    status: "available" | "occupied" | "selected";
    price: number;
    flight_seat_id: number;
    seat_id: number;
}

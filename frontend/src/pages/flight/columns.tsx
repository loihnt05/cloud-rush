"use client";
import type { ColumnDef } from "@tanstack/react-table";
import type { Flight } from "@/types/flight";
import { DataTableRowActions } from "./data-table-row-actions";

export const columns: ColumnDef<Flight>[] = [
  {
    accessorKey: "flight_number",
    header: "Flight Number",
  },
  {
    accessorKey: "origin",
    header: "Origin",
  },
  {
    accessorKey: "destination",
    header: "Destination",
  },
  {
    accessorKey: "departure_time",
    header: "Departure",
    cell: ({ row }) => new Date(row.getValue("departure_time")).toLocaleString(),
  },
  {
    accessorKey: "arrival_time",
    header: "Arrival",
    cell: ({ row }) => new Date(row.getValue("arrival_time")).toLocaleString(),
  },
  {
    accessorKey: "base_price",
    header: "Price",
    cell: ({ row }) => {
      const price = row.getValue("base_price") as number | string;
      const numPrice = typeof price === 'string' ? parseFloat(price) : price;
      return `$${numPrice.toFixed(2)}`;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />
  },
];

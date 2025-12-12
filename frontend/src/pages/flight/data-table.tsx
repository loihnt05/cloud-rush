"use client";

import { useState, useMemo } from "react";
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import { 
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { Flight } from "@/types/flight";
import type { FlightFilters } from "./flight-filter-toolbar";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filters?: FlightFilters;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filters = {},
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Apply custom filters to the data
  const filteredData = useMemo(() => {
    if (Object.keys(filters).length === 0) {
      return data;
    }

    return data.filter((row) => {
      const flight = row as unknown as Flight;

      // Flight number filter
      if (
        filters.flightNumber &&
        !flight.flight_number
          .toLowerCase()
          .includes(filters.flightNumber.toLowerCase())
      ) {
        return false;
      }

      // Origin filter
      if (
        filters.origin &&
        flight.origin &&
        !flight.origin.toLowerCase().includes(filters.origin.toLowerCase())
      ) {
        return false;
      }

      // Destination filter
      if (
        filters.destination &&
        flight.destination &&
        !flight.destination
          .toLowerCase()
          .includes(filters.destination.toLowerCase())
      ) {
        return false;
      }

      // Status filter
      if (
        filters.status &&
        flight.status &&
        flight.status.toLowerCase() !== filters.status.toLowerCase()
      ) {
        return false;
      }

      // Departure date filter
      if (filters.departureDate) {
        const departureDate = new Date(flight.departure_time);
        const filterDate = new Date(filters.departureDate);
        filterDate.setHours(0, 0, 0, 0);
        departureDate.setHours(0, 0, 0, 0);
        if (departureDate.getTime() !== filterDate.getTime()) {
          return false;
        }
      }

      // Arrival date filter
      if (filters.arrivalDate) {
        const arrivalDate = new Date(flight.arrival_time);
        const filterDate = new Date(filters.arrivalDate);
        filterDate.setHours(0, 0, 0, 0);
        arrivalDate.setHours(0, 0, 0, 0);
        if (arrivalDate.getTime() !== filterDate.getTime()) {
          return false;
        }
      }

      // Price range filter
      const price =
        typeof flight.base_price === "string"
          ? parseFloat(flight.base_price)
          : flight.base_price;

      if (filters.minPrice !== undefined && price < filters.minPrice) {
        return false;
      }

      if (filters.maxPrice !== undefined && price > filters.maxPrice) {
        return false;
      }

      return true;
    });
  }, [data, filters]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                    <p className="text-lg font-medium">No flights found</p>
                    <p className="text-sm">
                      No flights match your current filter criteria. Try adjusting your filters.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

import { useState } from "react";
import {
  useAirplanes,
  useAirplane,
  useCreateAirplane,
  useUpdateAirplane,
  useDeleteAirplane,
} from "@/hooks/use-users";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";

export const AirplaneExample = () => {
  const [selectedAirplaneId, setSelectedAirplaneId] = useState<number | null>(null);
  const [model, setModel] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [seatCapacity, setSeatCapacity] = useState("");

  // Query hooks
  const { data: airplanes, isLoading, error } = useAirplanes();
  const { data: selectedAirplane } = useAirplane(selectedAirplaneId || 0);

  // Mutation hooks
  const createAirplaneMutation = useCreateAirplane();
  const updateAirplaneMutation = useUpdateAirplane();
  const deleteAirplaneMutation = useDeleteAirplane();

  const handleCreateAirplane = () => {
    createAirplaneMutation.mutate(
      {
        model,
        manufacturer: manufacturer || undefined,
        seat_capacity: parseInt(seatCapacity),
      },
      {
        onSuccess: () => {
          setModel("");
          setManufacturer("");
          setSeatCapacity("");
        },
      }
    );
  };

  const handleUpdateAirplane = (id: number) => {
    updateAirplaneMutation.mutate({
      id,
      data: {
        model: "Updated Model",
      },
    });
  };

  const handleDeleteAirplane = (id: number) => {
    deleteAirplaneMutation.mutate(id);
  };

  if (isLoading) return <div>Loading airplanes...</div>;
  if (error) return <div>Error loading airplanes: {String(error)}</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">React Query + appAxios Example - Airplanes</h1>

      {/* Create Airplane Form */}
      <div className="p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">Create New Airplane</h2>
        <div className="space-y-2">
          <Input
            placeholder="Model (e.g., Boeing 737)"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
          <Input
            placeholder="Manufacturer (optional)"
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
          />
          <Input
            placeholder="Seat Capacity"
            type="number"
            value={seatCapacity}
            onChange={(e) => setSeatCapacity(e.target.value)}
          />
          <Button
            onClick={handleCreateAirplane}
            disabled={createAirplaneMutation.isPending}
          >
            {createAirplaneMutation.isPending ? "Creating..." : "Create Airplane"}
          </Button>
        </div>
      </div>

      {/* Airplanes List */}
      <div className="p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">Airplanes List</h2>
        <div className="space-y-2">
          {airplanes?.map((airplane) => (
            <div
              key={airplane.airplane_id}
              className="flex items-center justify-between p-3 border rounded"
            >
              <div>
                <p className="font-medium">{airplane.model}</p>
                <p className="text-sm text-gray-600">
                  Manufacturer: {airplane.manufacturer || "N/A"} | Seats: {airplane.seat_capacity}
                </p>
              </div>
              <div className="space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedAirplaneId(airplane.airplane_id)}
                >
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateAirplane(airplane.airplane_id)}
                  disabled={updateAirplaneMutation.isPending}
                >
                  Update
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteAirplane(airplane.airplane_id)}
                  disabled={deleteAirplaneMutation.isPending}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Airplane Details */}
      {selectedAirplane && (
        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-4">Selected Airplane Details</h2>
          <div>
            <p>
              <strong>ID:</strong> {selectedAirplane.airplane_id}
            </p>
            <p>
              <strong>Model:</strong> {selectedAirplane.model}
            </p>
            <p>
              <strong>Manufacturer:</strong> {selectedAirplane.manufacturer || "N/A"}
            </p>
            <p>
              <strong>Seat Capacity:</strong> {selectedAirplane.seat_capacity}
            </p>
            {selectedAirplane.created_at && (
              <p>
                <strong>Created:</strong> {new Date(selectedAirplane.created_at).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

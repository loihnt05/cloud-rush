import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { airplaneApi, type CreateAirplaneDto } from "@/api/example-api";

// Query Keys - centralized for consistency
export const airplaneKeys = {
  all: ["airplanes"] as const,
  lists: () => [...airplaneKeys.all, "list"] as const,
  list: (filters: string) => [...airplaneKeys.lists(), { filters }] as const,
  details: () => [...airplaneKeys.all, "detail"] as const,
  detail: (id: number) => [...airplaneKeys.details(), id] as const,
};

// Custom hook for fetching all airplanes
export const useAirplanes = () => {
  return useQuery({
    queryKey: airplaneKeys.lists(),
    queryFn: airplaneApi.getAirplanes,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Custom hook for fetching a single airplane
export const useAirplane = (id: number) => {
  return useQuery({
    queryKey: airplaneKeys.detail(id),
    queryFn: () => airplaneApi.getAirplaneById(id),
    enabled: !!id, // Only fetch if id is provided
  });
};

// Custom hook for creating an airplane
export const useCreateAirplane = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: airplaneApi.createAirplane,
    onSuccess: () => {
      // Invalidate and refetch airplanes list
      queryClient.invalidateQueries({ queryKey: airplaneKeys.lists() });
    },
    onError: (error: unknown) => {
      console.error("Failed to create airplane:", error);
    },
  });
};

// Custom hook for updating an airplane
export const useUpdateAirplane = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateAirplaneDto> }) =>
      airplaneApi.updateAirplane(id, data),
    onSuccess: (_data, variables) => {
      // Invalidate both the list and the specific airplane detail
      queryClient.invalidateQueries({ queryKey: airplaneKeys.lists() });
      queryClient.invalidateQueries({ queryKey: airplaneKeys.detail(variables.id) });
    },
    onError: (error: unknown) => {
      console.error("Failed to update airplane:", error);
    },
  });
};

// Custom hook for deleting an airplane
export const useDeleteAirplane = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: airplaneApi.deleteAirplane,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: airplaneKeys.lists() });
    },
    onError: (error: unknown) => {
      console.error("Failed to delete airplane:", error);
    },
  });
};

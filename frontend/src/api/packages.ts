import appAxios from "@/services/AxiosClient";

// Define Package types based on backend schema
export interface PackagePlace {
  package_place_id: number;
  package_id: number;
  place_id: number;
  day_number: number | null;
}

export interface Package {
  package_id: number;
  service_id: number;
  hotel_id: number | null;
  car_rental_id: number | null;
  name: string | null;
  total_price: number | null;
  package_places?: PackagePlace[];
}

export interface CreatePackagePlaceDto {
  place_id: number;
  day_number?: number;
}

export interface CreatePackageDto {
  service_id: number;
  hotel_id?: number;
  car_rental_id?: number;
  name?: string;
  total_price?: number;
  places?: CreatePackagePlaceDto[];
}

export interface UpdatePackageDto {
  service_id?: number;
  hotel_id?: number;
  car_rental_id?: number;
  name?: string;
  total_price?: number;
}

// API functions for packages
export const packagesApi = {
  // GET request - fetch all packages
  getPackages: async (): Promise<Package[]> => {
    const response = await appAxios.get<Package[]>("/packages/");
    return response.data;
  },

  // GET request - fetch single package
  getPackageById: async (id: number): Promise<Package> => {
    const response = await appAxios.get<Package>(`/packages/${id}`);
    return response.data;
  },

  // GET request - fetch package places
  getPackagePlaces: async (packageId: number): Promise<PackagePlace[]> => {
    const response = await appAxios.get<PackagePlace[]>(`/packages/${packageId}/places`);
    return response.data;
  },

  // POST request - create package
  createPackage: async (data: CreatePackageDto): Promise<Package> => {
    const response = await appAxios.post<Package>("/packages/", data);
    return response.data;
  },

  // POST request - add place to package
  addPlaceToPackage: async (
    packageId: number,
    data: CreatePackagePlaceDto
  ): Promise<PackagePlace> => {
    const response = await appAxios.post<PackagePlace>(
      `/packages/${packageId}/places`,
      data
    );
    return response.data;
  },

  // PUT request - update package
  updatePackage: async (id: number, data: UpdatePackageDto): Promise<Package> => {
    const response = await appAxios.put<Package>(`/packages/${id}`, data);
    return response.data;
  },

  // DELETE request - delete package
  deletePackage: async (id: number): Promise<void> => {
    await appAxios.delete(`/packages/${id}`);
  },

  // DELETE request - remove place from package
  removePlaceFromPackage: async (packagePlaceId: number): Promise<void> => {
    await appAxios.delete(`/packages/places/${packagePlaceId}`);
  },
};

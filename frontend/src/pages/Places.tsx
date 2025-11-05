import { useEffect, useState } from "react";
import { FaMapMarkerAlt, FaParking, FaWifi } from "react-icons/fa";
import { MdRestaurant } from "react-icons/md";
import { placesApi, type Place as ApiPlace } from "@/api/places";
import { getRandomPlaceImage } from "@/lib/image-utils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type PlaceDisplay = {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  rating?: number;
  location?: string;
  amenities?: string[];
};

export default function Places() {
  const [places, setPlaces] = useState<PlaceDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setLoading(true);
        const data = await placesApi.getPlaces();

        // Transform backend data to display format with random images
        const transformedPlaces: PlaceDisplay[] = data.map(
          (place: ApiPlace) => ({
            id: place.place_id,
            name: place.name,
            price: Math.floor(Math.random() * 300) + 100, // Random price between 100-400
            description:
              place.description || "Discover this amazing destination",
            imageUrl: getRandomPlaceImage(place.place_id, 1470, 800),
            rating: Number((Math.random() * 1 + 4).toFixed(1)), // Random rating between 4.0-5.0
            location:
              [place.city, place.country].filter(Boolean).join(", ") ||
              "Unknown Location",
            amenities: ["WiFi", "Restaurant", "Parking"], // Default amenities
          })
        );

        setPlaces(transformedPlaces);
        setError(null);
      } catch (err) {
        console.error("Error fetching places:", err);
        setError("Failed to load places. Please try again later.");
        // Set empty array on error
        setPlaces([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, []);

  // Pagination calculations
  const totalPages = Math.ceil(places.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPlaces = places.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="mt-10 text-center bg-linear-to-r from-[#07401F] to-[#148C56] h-64">
        <p className="pt-10 text-5xl text-white font-bold">
          Every place has a story. <br></br>
          <span className="text-[#148C56]">Live it !</span>
        </p>
        <p className="text-xl text-white/90 max-w-2xl mx-auto mt-5">
          Discover unforgettable stays at the world's most remarkable
          destinations
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="animate-pulse">
            <p className="text-2xl text-[#148C56] font-semibold">
              Loading amazing places...
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-600 font-semibold">{error}</p>
          </div>
        </div>
      )}
      {/* card */}
      {!loading && !error && places.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-12 space-y-6 ">
          {currentPlaces.map((place) => (
            <div
              className="group flex flex-col 
                    md:flex-row bg-white border shadow-xl rounded-2xl overflow-hidden m-10"
            >
              <div className="md:w-2/5 md:h-full h-auto overflow-hidden">
                <img
                  src={place.imageUrl}
                  alt={place.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                ></img>
              </div>

              {/* content */}
              <div className="flex flex-col md:w-3/5 p-5 gap-3 justify-between">
                <div className="items-center flex gap-2">
                  <FaMapMarkerAlt></FaMapMarkerAlt>
                  <span className="text-s font-normal text-[#148C56]">
                    {place.location}
                  </span>
                </div>
                <div className="mt-1">
                  <p className="text-2xl font-bold duration-500 group-hover:text-[#357D52] line-clamp-2">
                    {" "}
                    {place.name}
                  </p>
                </div>
                <p className="text-l font-light line-clamp-2">
                  {place.description}
                </p>
                {place.amenities && (
                  <div className="flex flex-wrap gap-3 mb-4">
                    {place.amenities.includes("WiFi") && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-[#148C56]/10 rounded-full text-[#224A33] text-sm">
                        <FaWifi className="text-[#148C56]" />
                        <span>Free WiFi</span>
                      </div>
                    )}
                    {place.amenities.includes("Restaurant") && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-[#148C56]/10 rounded-full text-[#224A33] text-sm">
                        <MdRestaurant className="text-[#148C56]" />
                        <span>Restaurant</span>
                      </div>
                    )}
                    {place.amenities.includes("Parking") && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-[#148C56]/10 rounded-full text-[#224A33] text-sm">
                        <FaParking className="text-[#148C56]" />
                        <span>Parking</span>
                      </div>
                    )}
                  </div>
                )}
                {/* button */}
                <div className="flex flex-row border-t-2">
                  <div className="mt-2">
                    <p className="font-light text-l">Starting from</p>
                    <div className="flex">
                      <p className="text-2xl text-[#148C56] font-bold">
                        {place.price}$
                      </p>
                      <span className="text-s font-light text-black mt-2">
                        /night
                      </span>
                    </div>
                  </div>
                  <button
                    className="ml-auto bg-linear-to-r from-[#07401F] to-[#148C56] text-white
                                font-bold hover:from-[#148C56] hover:to-[#148C11] transition-all duration-300
                                hover:scale-105 rounded-full px-10 py-2 mt-2"
                  >
                    View now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && places.length > 0 && totalPages > 1 && (
        <div className="pb-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current
                const showPage =
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1);

                const showEllipsisBefore = page === currentPage - 2 && currentPage > 3;
                const showEllipsisAfter = page === currentPage + 2 && currentPage < totalPages - 2;

                if (showEllipsisBefore || showEllipsisAfter) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }

                if (!showPage) return null;

                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && places.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-xl text-gray-600">
            No places available at the moment.
          </p>
        </div>
      )}
    </div>
  );
}

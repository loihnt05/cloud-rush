import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { FaCar, FaGasPump, FaUsers } from "react-icons/fa";
import { MdAirlineSeatReclineNormal } from "react-icons/md";
import { carRentalsApi, type CarRental as ApiCarRental } from "@/api/car-rentals";
import { createBooking } from "@/api/booking";
import { bookingServiceApi } from "@/api/booking-service";
import { getRandomCarImage } from "@/lib/image-utils";
import useSettingStore from "@/stores/setting-store";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type CarRentalDisplay = {
  id: number;
  serviceId: number; // Add service_id
  name: string;
  brand: string;
  model: string;
  price: number;
  description: string;
  imageUrl: string;
  rating?: number;
  features?: string[];
  available: boolean;
};

// Lazy Loading Image Component
function LazyImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "50px",
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={className}>
      {isInView && (
        <>
          {!isLoaded && (
            <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
              <span className="text-gray-400">Loading...</span>
            </div>
          )}
          <img
            src={src}
            alt={alt}
            onLoad={() => setIsLoaded(true)}
            className={`${className} ${!isLoaded ? "hidden" : ""}`}
          />
        </>
      )}
      {!isInView && (
        <div className="w-full h-full bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}

export default function CarRentals() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth0();
  const { accessToken } = useSettingStore();
  const [bookingInProgress, setBookingInProgress] = useState<number | null>(null);

  // Fetch car rentals using useQuery with caching
  const {
    data: carRentals = [],
    isLoading: loading,
    error,
    isError,
  } = useQuery({
    queryKey: ["carRentals"],
    queryFn: async () => {
      const data = await carRentalsApi.getCarRentals();

      // Transform backend data to display format with random images
      const transformedCarRentals: CarRentalDisplay[] = data.map(
        (car: ApiCarRental) => ({
          id: car.car_rental_id,
          serviceId: car.service_id, // Include service_id
          name: `${car.brand || 'Premium'} ${car.car_model || 'Vehicle'}`,
          brand: car.brand || "Premium Brand",
          model: car.car_model || "Luxury Model",
          price: car.daily_rate || Math.floor(Math.random() * 150) + 50,
          description: "Experience comfort and style with this premium vehicle, perfect for your travel needs",
          imageUrl: getRandomCarImage(car.car_rental_id + 3000, 1470, 1000),
          rating: Number((Math.random() * 0.5 + 4.5).toFixed(1)),
          features: ["Automatic", "AC", "4 Seats", "Fuel Efficient"],
          available: car.available,
        })
      );

      return transformedCarRentals;
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Pagination calculations - using useMemo for optimization
  const totalPages = useMemo(
    () => Math.ceil(carRentals.length / itemsPerPage),
    [carRentals.length]
  );
  
  const currentCarRentals = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return carRentals.slice(startIndex, endIndex);
  }, [carRentals, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRentCar = async (car: CarRentalDisplay) => {
    // Check if user is authenticated
    if (!isAuthenticated || !user?.sub) {
      alert("Please log in to rent a car");
      return;
    }

    // Check if car is available
    if (!car.available) {
      alert("This car is not currently available");
      return;
    }

    try {
      setBookingInProgress(car.id);

      // Create a booking
      const booking = await createBooking({
        user_id: user.sub,
        status: "pending",
        notes: `Car rental booking for ${car.name}`,
      });

      // Add car rental service to booking
      await bookingServiceApi.addServiceToBooking({
        booking_id: booking.booking_id,
        service_id: car.serviceId, // Use the car rental's service_id
        quantity: 1,
      });

      // Navigate to payment page with booking ID and service type
      navigate(`/payment?bookingId=${booking.booking_id}&serviceType=car_rental&serviceId=${car.id}`);
    } catch (error) {
      console.error("Error renting car:", error);
      alert("Failed to create booking. Please try again.");
    } finally {
      setBookingInProgress(null);
    }
  };

  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="mt-10 text-center bg-linear-to-r from-[#07401F] to-[#148C56] h-64">
        <p className="pt-10 text-5xl text-white font-bold">
          Drive Your Adventure<br />
          <span className="text-[#148C56]">Your Way!</span>
        </p>
        <p className="text-xl text-white/90 max-w-2xl mx-auto mt-5">
          Choose from our premium fleet of vehicles for the ultimate road trip experience
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="animate-pulse">
            <p className="text-2xl text-[#148C56] font-semibold">
              Loading amazing vehicles...
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {isError && !loading && (
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-600 font-semibold">
              {error instanceof Error ? error.message : "Failed to load car rentals. Please try again later."}
            </p>
          </div>
        </div>
      )}

      {/* Cards */}
      {!loading && !isError && carRentals.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
          {currentCarRentals.map((car) => (
            <div
              key={car.id}
              className="group flex flex-col md:flex-row bg-white border shadow-xl rounded-2xl overflow-hidden m-10"
            >
              <div className="md:w-2/5 md:h-full h-auto overflow-hidden">
                <LazyImage
                  src={car.imageUrl}
                  alt={car.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* Content */}
              <div className="flex flex-col md:w-3/5 p-5 gap-3 justify-between">
                <div className="items-center flex gap-2">
                  <FaCar className="text-[#148C56]" />
                  <span className="text-s font-normal text-[#148C56]">
                    {car.brand}
                  </span>
                  {car.available && (
                    <span className="ml-auto px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      Available
                    </span>
                  )}
                  {!car.available && (
                    <span className="ml-auto px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                      Not Available
                    </span>
                  )}
                </div>

                <div className="mt-1">
                  <p className="text-2xl font-bold duration-500 group-hover:text-[#357D52] line-clamp-2">
                    {car.name}
                  </p>
                  <p className="text-sm text-gray-600">{car.model}</p>
                </div>

                <p className="text-l font-light line-clamp-2">
                  {car.description}
                </p>

                {car.features && (
                  <div className="flex flex-wrap gap-3 mb-4">
                    {car.features.includes("Automatic") && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-[#148C56]/10 rounded-full text-[#224A33] text-sm">
                        <FaCar className="text-[#148C56]" />
                        <span>Automatic</span>
                      </div>
                    )}
                    {car.features.includes("AC") && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-[#148C56]/10 rounded-full text-[#224A33] text-sm">
                        <MdAirlineSeatReclineNormal className="text-[#148C56]" />
                        <span>Air Conditioning</span>
                      </div>
                    )}
                    {car.features.includes("4 Seats") && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-[#148C56]/10 rounded-full text-[#224A33] text-sm">
                        <FaUsers className="text-[#148C56]" />
                        <span>4 Seats</span>
                      </div>
                    )}
                    {car.features.includes("Fuel Efficient") && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-[#148C56]/10 rounded-full text-[#224A33] text-sm">
                        <FaGasPump className="text-[#148C56]" />
                        <span>Fuel Efficient</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Button */}
                <div className="flex flex-row border-t-2">
                  <div className="mt-2">
                    <p className="font-light text-l">Daily Rate</p>
                    <div className="flex">
                      <p className="text-2xl text-[#148C56] font-bold">
                        ${car.price}
                      </p>
                      <span className="text-s font-light text-black mt-2">
                        /day
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRentCar(car)}
                    disabled={!car.available || bookingInProgress === car.id}
                    className={`ml-auto text-white font-bold transition-all duration-300
                      hover:scale-105 rounded-full px-10 py-2 mt-2 ${
                        car.available && bookingInProgress !== car.id
                          ? "bg-linear-to-r from-[#07401F] to-[#148C56] hover:from-[#148C56] hover:to-[#148C11]"
                          : "bg-gray-400 cursor-not-allowed"
                      }`}
                  >
                    {bookingInProgress === car.id 
                      ? "Booking..." 
                      : car.available 
                        ? "Rent Now" 
                        : "Not Available"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && !isError && carRentals.length > 0 && totalPages > 1 && (
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
      {!loading && !isError && carRentals.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-xl text-gray-600">
            No car rentals available at the moment.
          </p>
        </div>
      )}
    </div>
  );
}

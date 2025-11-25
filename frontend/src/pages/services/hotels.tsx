import { createBooking, getUserBookings } from "@/api/booking";
import { bookingServiceApi } from "@/api/booking-service";
import { hotelsApi, type Hotel as ApiHotel } from "@/api/hotels";
import { getPaymentByBooking } from "@/api/payment";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getRandomHotelImage } from "@/lib/image-utils";
import { useAuth0 } from "@auth0/auth0-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaMapMarkerAlt, FaParking, FaStar, FaWifi } from "react-icons/fa";
import { MdPool, MdRestaurant } from "react-icons/md";
import { useNavigate } from "react-router-dom";

type HotelDisplay = {
  id: number;
  serviceId: number; // Add service_id
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  rating?: number;
  location?: string;
  stars?: number;
  amenities?: string[];
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
        rootMargin: "50px", // Start loading 50px before image enters viewport
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

export default function Hotels() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth0();
  const [bookingInProgress, setBookingInProgress] = useState<number | null>(null);

  // Fetch hotels using useQuery with caching and automatic refetching
  const {
    data: hotels = [],
    isLoading: loading,
    error,
    isError,
  } = useQuery({
    queryKey: ["hotels"],
    queryFn: async () => {
      const data = await hotelsApi.getHotels();
      
      // Transform backend data to display format with random images
      const transformedHotels: HotelDisplay[] = data.map(
        (hotel: ApiHotel) => ({
          id: hotel.hotel_id,
          serviceId: hotel.service_id, // Include service_id
          name: `Hotel ${hotel.hotel_id}`, // You might want to get actual name from service
          price: Math.floor(Math.random() * 400) + 150, // Random price between 150-550
          description:
            hotel.description || "Experience luxury and comfort in this amazing hotel",
          imageUrl: getRandomHotelImage(hotel.hotel_id, 1470, 1000),
          rating: Number((Math.random() * 0.5 + 4.5).toFixed(1)), // Random rating between 4.5-5.0
          location: hotel.location || "Unknown Location",
          stars: hotel.stars || 5,
          amenities: ["WiFi", "Restaurant", "Parking", "Pool"], // Default amenities
        })
      );
      
      return transformedHotels;
    },
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  // Pagination calculations - using useMemo for optimization
  const totalPages = useMemo(
    () => Math.ceil(hotels.length / itemsPerPage),
    [hotels.length]
  );
  
  const currentHotels = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return hotels.slice(startIndex, endIndex);
  }, [hotels, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookHotel = async (hotel: HotelDisplay) => {
    // Check if user is authenticated
    if (!isAuthenticated || !user?.sub) {
      alert("Please log in to book a hotel");
      return;
    }

    // Check for existing pending service bookings
    try {
      const userBookings = await getUserBookings(user.sub);
      
      // Check if any booking has pending service bookings
      for (const booking of userBookings) {
        try {
          // Get booking services for this booking
          const bookingServices = await bookingServiceApi.getBookingServices(booking.booking_id);
          
          if (bookingServices.length > 0) {
            // This is a service booking, check if it's pending
            const isPending = booking.status !== "confirmed";
            
            // Also check payment status
            let hasUnpaidPayment = false;
            try {
              const payment = await getPaymentByBooking(booking.booking_id);
              hasUnpaidPayment = payment.status !== "success";
            } catch {
              // No payment found, so it's unpaid
              hasUnpaidPayment = true;
            }

            if (isPending || hasUnpaidPayment) {
              const goToBookings = confirm(
                "You have pending service bookings that need payment. Please complete payment before booking another service.\n\n" +
                "Click OK to view your pending bookings, or Cancel to stay here."
              );
              if (goToBookings) {
                navigate("/my-service-bookings");
              }
              return;
            }
          }
        } catch {
          // No booking services found, skip
        }
      }
    } catch (error) {
      console.error("Error checking for pending bookings:", error);
      // Continue with booking if check fails
    }

    try {
      setBookingInProgress(hotel.id);

      // Create a booking
      const booking = await createBooking({
        user_id: user.sub,
        status: "pending",
        notes: `Hotel booking for ${hotel.name}`,
      });

      // Add hotel service to booking
      await bookingServiceApi.addServiceToBooking({
        booking_id: booking.booking_id,
        service_id: hotel.serviceId, // Use the hotel's service_id
        quantity: 1,
      });

      // Navigate to payment page with booking ID and service type
      navigate(`/payment?bookingId=${booking.booking_id}&serviceType=hotel&serviceId=${hotel.id}`);
    } catch (error) {
      console.error("Error booking hotel:", error);
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
          Find Your Perfect Stay<br />
          <span className="text-[#148C56]">Luxury Awaits!</span>
        </p>
        <p className="text-xl text-white/90 max-w-2xl mx-auto mt-5">
          Discover exceptional hotels offering world-class amenities and unforgettable experiences
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="animate-pulse">
            <p className="text-2xl text-[#148C56] font-semibold">
              Loading amazing hotels...
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {isError && !loading && (
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-600 font-semibold">
              {error instanceof Error ? error.message : "Failed to load hotels. Please try again later."}
            </p>
          </div>
        </div>
      )}

      {/* Cards */}
      {!loading && !isError && hotels.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
          {currentHotels.map((hotel) => (
            <div
              key={hotel.id}
              className="group flex flex-col md:flex-row bg-white border shadow-xl rounded-2xl overflow-hidden m-10"
            >
              <div className="md:w-2/5 md:h-full h-auto overflow-hidden">
                <LazyImage
                  src={hotel.imageUrl}
                  alt={hotel.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* Content */}
              <div className="flex flex-col md:w-3/5 p-5 gap-3 justify-between">
                <div className="items-center flex gap-2">
                  <FaMapMarkerAlt className="text-[#148C56]" />
                  <span className="text-s font-normal text-[#148C56]">
                    {hotel.location}
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between">
                  <p className="text-2xl font-bold duration-500 group-hover:text-[#357D52] line-clamp-2">
                    {hotel.name}
                  </p>
                  {hotel.stars && (
                    <div className="flex items-center gap-1">
                      {Array.from({ length: hotel.stars }).map((_, i) => (
                        <FaStar key={i} className="text-yellow-500" />
                      ))}
                    </div>
                  )}
                </div>

                <p className="text-l font-light line-clamp-2">
                  {hotel.description}
                </p>

                {hotel.amenities && (
                  <div className="flex flex-wrap gap-3 mb-4">
                    {hotel.amenities.includes("WiFi") && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-[#148C56]/10 rounded-full text-[#224A33] text-sm">
                        <FaWifi className="text-[#148C56]" />
                        <span>Free WiFi</span>
                      </div>
                    )}
                    {hotel.amenities.includes("Restaurant") && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-[#148C56]/10 rounded-full text-[#224A33] text-sm">
                        <MdRestaurant className="text-[#148C56]" />
                        <span>Restaurant</span>
                      </div>
                    )}
                    {hotel.amenities.includes("Parking") && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-[#148C56]/10 rounded-full text-[#224A33] text-sm">
                        <FaParking className="text-[#148C56]" />
                        <span>Parking</span>
                      </div>
                    )}
                    {hotel.amenities.includes("Pool") && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-[#148C56]/10 rounded-full text-[#224A33] text-sm">
                        <MdPool className="text-[#148C56]" />
                        <span>Pool</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Button */}
                <div className="flex flex-row border-t-2">
                  <div className="mt-2">
                    <p className="font-light text-l">Starting from</p>
                    <div className="flex">
                      <p className="text-2xl text-[#148C56] font-bold">
                        ${hotel.price}
                      </p>
                      <span className="text-s font-light text-black mt-2">
                        /night
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBookHotel(hotel)}
                    disabled={bookingInProgress === hotel.id}
                    className="ml-auto bg-linear-to-r from-[#07401F] to-[#148C56] text-white
                      font-bold hover:from-[#148C56] hover:to-[#148C11] transition-all duration-300
                      hover:scale-105 rounded-full px-10 py-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bookingInProgress === hotel.id ? "Booking..." : "Book Now"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && !isError && hotels.length > 0 && totalPages > 1 && (
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
      {!loading && !isError && hotels.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-xl text-gray-600">
            No hotels available at the moment.
          </p>
        </div>
      )}
    </div>
  );
}

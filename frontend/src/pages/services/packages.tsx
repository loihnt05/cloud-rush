import { createBooking, getUserBookings } from "@/api/booking";
import { bookingServiceApi } from "@/api/booking-service";
import { packagesApi, type Package as ApiPackage } from "@/api/packages";
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
import { getRandomPackageImage } from "@/lib/image-utils";
import { useAuth0 } from "@auth0/auth0-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaCar, FaHotel, FaMapMarkerAlt, FaParking, FaWifi } from "react-icons/fa";
import { MdRestaurant } from "react-icons/md";
import { useNavigate } from "react-router-dom";

type PackageDisplay = {
  id: number;
  serviceId: number; // Add service_id
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  rating?: number;
  duration?: string;
  includes?: string[];
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

export default function Packages() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth0();
  const [bookingInProgress, setBookingInProgress] = useState<number | null>(null);

  // Fetch packages using useQuery with caching
  const {
    data: packages = [],
    isLoading: loading,
    error,
    isError,
  } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const data = await packagesApi.getPackages();

      // Transform backend data to display format with random images
      const transformedPackages: PackageDisplay[] = data.map(
        (pkg: ApiPackage) => {
          const includes = [];
          if (pkg.hotel_id) includes.push("Hotel");
          if (pkg.car_rental_id) includes.push("Car Rental");
          
          return {
            id: pkg.package_id,
            serviceId: pkg.service_id, // Include service_id
            name: pkg.name || `Adventure Package ${pkg.package_id}`,
            price: pkg.total_price || Math.floor(Math.random() * 1500) + 500,
            description: "A complete travel package with all-inclusive amenities for the perfect vacation experience",
            imageUrl: getRandomPackageImage(pkg.package_id, 1470, 1180),
            rating: Number((Math.random() * 0.5 + 4.5).toFixed(1)),
            duration: `${Math.floor(Math.random() * 7) + 3} Days / ${Math.floor(Math.random() * 6) + 2} Nights`,
            includes: includes.length > 0 ? includes : ["Hotel", "Activities"],
            amenities: ["WiFi", "Restaurant", "Parking"],
          };
        }
      );

      return transformedPackages;
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Pagination calculations - using useMemo for optimization
  const totalPages = useMemo(
    () => Math.ceil(packages.length / itemsPerPage),
    [packages.length]
  );
  
  const currentPackages = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return packages.slice(startIndex, endIndex);
  }, [packages, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookPackage = async (pkg: PackageDisplay) => {
    // Check if user is authenticated
    if (!isAuthenticated || !user?.sub) {
      alert("Please log in to book a package");
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
      setBookingInProgress(pkg.id);

      // Create a booking
      const booking = await createBooking({
        user_id: user.sub,
        status: "pending",
        notes: `Package booking for ${pkg.name}`,
      });

      // Add package service to booking
      await bookingServiceApi.addServiceToBooking({
        booking_id: booking.booking_id,
        service_id: pkg.serviceId, // Use the package's service_id
        quantity: 1,
      });

      // Navigate to payment page with booking ID and service type
      navigate(`/payment?bookingId=${booking.booking_id}&serviceType=package&serviceId=${pkg.id}`);
    } catch (error) {
      console.error("Error booking package:", error);
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
          All-Inclusive Travel Packages<br />
          <span className="text-[#148C56]">Everything You Need!</span>
        </p>
        <p className="text-xl text-white/90 max-w-2xl mx-auto mt-5">
          Discover carefully curated packages combining accommodations, transport, and unforgettable experiences
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="animate-pulse">
            <p className="text-2xl text-[#148C56] font-semibold">
              Loading amazing packages...
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {isError && !loading && (
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-600 font-semibold">
              {error instanceof Error ? error.message : "Failed to load packages. Please try again later."}
            </p>
          </div>
        </div>
      )}

      {/* Cards */}
      {!loading && !isError && packages.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
          {currentPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="group flex flex-col md:flex-row bg-white border shadow-xl rounded-2xl overflow-hidden m-10"
            >
              <div className="md:w-2/5 md:h-full h-auto overflow-hidden">
                <LazyImage
                  src={pkg.imageUrl}
                  alt={pkg.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* Content */}
              <div className="flex flex-col md:w-3/5 p-5 gap-3 justify-between">
                <div className="items-center flex gap-2">
                  <FaMapMarkerAlt className="text-[#148C56]" />
                  <span className="text-s font-normal text-[#148C56]">
                    {pkg.duration}
                  </span>
                </div>

                <div className="mt-1">
                  <p className="text-2xl font-bold duration-500 group-hover:text-[#357D52] line-clamp-2">
                    {pkg.name}
                  </p>
                </div>

                <p className="text-l font-light line-clamp-2">
                  {pkg.description}
                </p>

                {/* Package Includes */}
                {pkg.includes && pkg.includes.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-2">
                    {pkg.includes.includes("Hotel") && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full text-blue-700 text-sm font-medium">
                        <FaHotel className="text-blue-600" />
                        <span>Hotel Included</span>
                      </div>
                    )}
                    {pkg.includes.includes("Car Rental") && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 rounded-full text-purple-700 text-sm font-medium">
                        <FaCar className="text-purple-600" />
                        <span>Car Rental Included</span>
                      </div>
                    )}
                    {pkg.includes.includes("Activities") && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 rounded-full text-orange-700 text-sm font-medium">
                        <FaMapMarkerAlt className="text-orange-600" />
                        <span>Activities Included</span>
                      </div>
                    )}
                  </div>
                )}

                {pkg.amenities && (
                  <div className="flex flex-wrap gap-3 mb-4">
                    {pkg.amenities.includes("WiFi") && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-[#148C56]/10 rounded-full text-[#224A33] text-sm">
                        <FaWifi className="text-[#148C56]" />
                        <span>Free WiFi</span>
                      </div>
                    )}
                    {pkg.amenities.includes("Restaurant") && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-[#148C56]/10 rounded-full text-[#224A33] text-sm">
                        <MdRestaurant className="text-[#148C56]" />
                        <span>Meals Included</span>
                      </div>
                    )}
                    {pkg.amenities.includes("Parking") && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-[#148C56]/10 rounded-full text-[#224A33] text-sm">
                        <FaParking className="text-[#148C56]" />
                        <span>Free Parking</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Button */}
                <div className="flex flex-row border-t-2">
                  <div className="mt-2">
                    <p className="font-light text-l">Total Package Price</p>
                    <div className="flex">
                      <p className="text-2xl text-[#148C56] font-bold">
                        ${pkg.price}
                      </p>
                      <span className="text-s font-light text-black mt-2">
                        /package
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBookPackage(pkg)}
                    disabled={bookingInProgress === pkg.id}
                    className="ml-auto bg-linear-to-r from-[#07401F] to-[#148C56] text-white
                      font-bold hover:from-[#148C56] hover:to-[#148C11] transition-all duration-300
                      hover:scale-105 rounded-full px-10 py-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bookingInProgress === pkg.id ? "Booking..." : "Book Package"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && !isError && packages.length > 0 && totalPages > 1 && (
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
      {!loading && !isError && packages.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-xl text-gray-600">
            No packages available at the moment.
          </p>
        </div>
      )}
    </div>
  );
}
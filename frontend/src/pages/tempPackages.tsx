import { FaBed, FaMapMarkerAlt, FaParking, FaStar, FaWifi } from "react-icons/fa";
import { MdRestaurant } from "react-icons/md";
type Place = {
    id: number;
    name: string;
    price: number;
    description: string;
    imageUrl: string;
    rating?: number;
    location?: string;
    amenities?: string[];
};
export default function TempPackages() {
    const places: Place[] = [
        {
            id: 1,
            name: "Sofitel Legend Metropole Hanoi",
            description: "Historic luxuristoric luxury hotel in the heart of Hanoi since 1901istoric luxury hotel in the heart of Hanoi since 1901istoric luxury hotel in the heart of Hanoi since 1901y hotel in the heart of Hanoi since 1901",
            price: 250,
            imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1470&q=80",
            rating: 4.8,
            location: "Hanoi, Vietnam",
            amenities: ["WiFi", "Restaurant", "Parking"]
        },
        {
            id: 2,
            name: "Sofitel Legend Metropole Hanoi",
            description: "Historic luxury hotel in the heart of Hanoi since 1901",
            price: 250,
            imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1470&q=80",
            rating: 4.8,
            location: "Hanoi, Vietnam",
            amenities: ["WiFi", "Restaurant", "Parking"]
        },
        {
            id: 3,
            name: "Sofitel Legend Metropole Hanoi",
            description: "Historic luxury hotel in the heart of Hanoi since 1901",
            price: 250,
            imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1470&q=80",
            rating: 4.8,
            location: "Hanoi, Vietnam",
            amenities: ["WiFi", "Restaurant", "Parking"]
        },
        {
            id: 4,
            name: "Sofitel Legend Metropole Hanoi",
            description: "Historic luxury hotel in the heart of Hanoi since 1901",
            price: 250,
            imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1470&q=80",
            rating: 4.8,
            location: "Hanoi, Vietnam",
            amenities: ["WiFi", "Restaurant", "Parking"]
        },
        {
            id: 5,
            name: "Sofitel Legend Metropole Hanoi",
            description: "Historic luxury hotel in the heart of Hanoi since 1901",
            price: 250,
            imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1470&q=80",
            rating: 4.8,
            location: "Hanoi, Vietnam",
            amenities: ["WiFi", "Restaurant", "Parking"]
        },
        {
            id: 6,
            name: "Sofitel Legend Metropole Hanoi",
            description: "Historic luxury hotel in the heart of Hanoi since 1901",
            price: 250,
            imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1470&q=80",
            rating: 4.8,
            location: "Hanoi, Vietnam",
            amenities: ["WiFi", "Restaurant", "Parking"]
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section with Different Style */}
            <div className="relative bg-linear-to-r from-[#224A33] to-[#357D52] py-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
                        Every place has a story.
                    </h1>
                    <p className="text-3xl text-[#148C56] font-bold mb-4">Live it!</p>
                    <p className="text-xl text-white/90 max-w-2xl mx-auto">
                        Discover unforgettable stays at the world's most remarkable destinations
                    </p>
                </div>
                {/* Decorative wave */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-white" style={{
                    clipPath: "polygon(0 50%, 100% 0, 100% 100%, 0 100%)"
                }}></div>
            </div>

            {/* Places Grid - Horizontal Card Layout */}
            <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
                {places.map((place) => (
                    <div
                        key={place.id}
                        className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100"
                    >
                        <div className="flex flex-col md:flex-row md:h-80">
                            {/* Image Section - Left Side */}
                            <div className="md:w-2/5 relative overflow-hidden h-64 md:h-full">
                                <img
                                    src={place.imageUrl}
                                    alt={place.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                {/* Rating Badge */}
                                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
                                    <FaStar className="text-[#148C56]" />
                                    <span className="font-bold text-[#07401F]">{place.rating}</span>
                                </div>
                            </div>

                            {/* Content Section - Right Side */}
                            <div className="md:w-3/5 p-6 md:p-8 flex flex-col justify-between">
                                <div>
                                    {/* Location */}
                                    <div className="flex items-center gap-2 text-[#357D52] mb-3">
                                        <FaMapMarkerAlt />
                                        <span className="text-sm font-medium">{place.location}</span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-2xl md:text-3xl font-bold text-[#07401F] mb-3 group-hover:text-[#148C56] transition-colors">
                                        {place.name}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-gray-600 mb-4 line-clamp-2">
                                        {place.description}
                                    </p>

                                    {/* Amenities */}
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
                                </div>

                                {/* Bottom Section with Price and Button */}
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                                    <div>
                                        <p className="text-gray-500 text-sm">Starting from</p>
                                        <p className="text-3xl font-bold text-[#148C56]">
                                            ${place.price}
                                            <span className="text-sm text-gray-500 font-normal">/night</span>
                                        </p>
                                    </div>
                                    <button className="px-8 py-3 bg-linear-to-r from-[#224A33] to-[#148C56] text-white font-semibold rounded-lg hover:from-[#148C56] hover:to-[#357D52] transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* CTA Section */}
            <div className="bg-[#07401F]/5 py-16 text-center">
                <button className="px-12 py-4 bg-[#07401F] text-white text-lg font-bold rounded-full hover:bg-[#148C56] transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105">
                    <FaBed className="inline mr-2" />
                    Explore All Places
                </button>
            </div>
        </div>
    );
}
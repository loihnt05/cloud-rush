import { FaPlane, FaStar, FaMapMarkerAlt } from "react-icons/fa";
import { MdFlightTakeoff } from "react-icons/md";

type Package = {
    id: number;
    name: string;
    price: number;
    description: string;
    imageUrl: string;
    rating?: number;
    location?: string;
};

export default function TempPackages() {
    // call api to take data from here
    const packages: Package[] = [
        {
            id: 1,
            name: "Sofitel Legend Metropole Hanoi",
            description: "Historic luxury hotel in the heart of Hanoi since 1901",
            price: 250,
            imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1470&q=80",
            rating: 4.8,
            location: "Hanoi, Vietnam"
        },
        {
            id: 2,
            name: "Sofitel Legend Metropole Hanoi",
            description: "Historic luxury hotel in the heart of Hanoi since 1901",
            price: 250,
            imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1470&q=80",
            rating: 4.8,
            location: "Hanoi, Vietnam"
        },
        {
            id: 3,
            name: "Sofitel Legend Metropole Hanoi",
            description: "Historic luxury hotel in the heart of Hanoi since 1901",
            price: 250,
            imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1470&q=80",
            rating: 4.8,
            location: "Hanoi, Vietnam"
        },
        {
            id: 4,
            name: "Sofitel Legend Metropole Hanoi",
            description: "Historic luxury hotel in the heart of Hanoi since 1901",
            price: 250,
            imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1470&q=80",
            rating: 4.8,
            location: "Hanoi, Vietnam"
        },
                {
            id: 5,
            name: "Sofitel Legend Metropole Hanoi",
            description: "Historic luxury hotel in the heart of Hanoi since 1901",
            price: 250,
            imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1470&q=80",
            rating: 4.8,
            location: "Hanoi, Vietnam"
        },
                {
            id: 6,
            name: "Sofitel Legend Metropole Hanoi",
            description: "Historic luxury hotel in the heart of Hanoi since 1901",
            price: 250,
            imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1470&q=80",
            rating: 4.8,
            location: "Hanoi, Vietnam"
        }
    ];

    return (
        <div className="min-h-screen bg-linear-to-br from-[#07401F] via-[#224A33] to-[#357D52] py-12 px-4 sm:px-6 lg:px-8">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 space-y-6">
                    <div className="flex justify-center items-center gap-4 mb-4">
                        <MdFlightTakeoff className="text-white text-5xl animate-pulse" />
                        <FaPlane className="text-[#148C56] text-4xl" />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                        We plan.
                        <span className="block text-[#148C56] mt-2">You live the adventure</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
                        Find your next adventure with these{" "}
                        <span className="text-[#148C56] font-semibold">exclusive flight deals</span>
                    </p>
                </div>

                {/* Packages Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                    {packages.map((pack) => (
                        <div
                            key={pack.id}
                            className="group relative bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                        >
                            {/* Image Container */}
                            <div className="relative h-56 overflow-hidden">
                                <img
                                    src={pack.imageUrl}
                                    alt={pack.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-linear-to-t from-[#07401F]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                
                                {/* Price Badge */}
                                <div className="absolute top-4 right-4 bg-[#148C56] text-white px-4 py-2 rounded-full shadow-lg font-bold text-lg">
                                    ${pack.price}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4">
                                {/* Location */}
                                {pack.location && (
                                    <div className="flex items-center gap-2 text-[#224A33]">
                                        <FaMapMarkerAlt className="text-[#148C56]" />
                                        <span className="text-sm font-medium">{pack.location}</span>
                                    </div>
                                )}

                                {/* Title */}
                                <h3 className="text-xl font-bold text-[#07401F] line-clamp-2 group-hover:text-[#148C56] transition-colors">
                                    {pack.name}
                                </h3>

                                {/* Description */}
                                <p className="text-gray-600 text-sm line-clamp-2">
                                    {pack.description}
                                </p>

                                {/* Rating */}
                                {pack.rating && (
                                    <div className="flex items-center gap-2">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar
                                                key={i}
                                                className={`text-sm ${
                                                    i < Math.floor(pack.rating!)
                                                        ? "text-[#148C56]"
                                                        : "text-gray-300"
                                                }`}
                                            />
                                        ))}
                                        <span className="text-sm font-semibold text-[#224A33] ml-1">
                                            {pack.rating}
                                        </span>
                                    </div>
                                )}

                                {/* Book Now Button */}
                                <button className="w-full bg-linear-to-r from-[#224A33] to-[#148C56] text-white font-semibold py-3 rounded-lg hover:from-[#148C56] hover:to-[#357D52] transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105">
                                    Book Now
                                </button>
                            </div>

                            {/* Decorative Corner */}
                            <div className="absolute top-0 left-0 w-20 h-20 bg-[#148C56]/10 rounded-br-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                    ))}
                </div>

                {/* Footer CTA */}
                <div className="mt-16 text-center">
                    <button className="bg-white text-[#07401F] px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:bg-[#148C56] hover:text-white transition-all duration-300 transform hover:scale-105">  
                        View All Packages
                    </button>
                </div>
            </div>
        </div>
    );
}
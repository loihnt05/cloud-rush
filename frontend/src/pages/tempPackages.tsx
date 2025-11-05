import { FaBed, FaMapMarkerAlt, FaParking, FaStar, FaWifi, FaPalette } from "react-icons/fa";
import { MdRestaurant } from "react-icons/md";
import { useState } from "react";

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
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Handle theme toggle
    const toggleTheme = () => {
        document.documentElement.classList.toggle('dark');
        setIsDarkMode(!isDarkMode);
    };

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
        <div className="min-h-screen bg-background relative">
            {/* Theme Toggle Button - Fixed Position */}
            <button
                onClick={toggleTheme}
                className="fixed top-20 right-6 z-50 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center gap-3 font-semibold"
            >
                <FaPalette className="text-xl" />
                <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
            </button>

            {/* Hero Section with Different Style */}
            <div className="relative bg-secondary py-20 px-4 transition-all duration-500">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-6xl md:text-7xl font-bold text-secondary-foreground mb-6">
                        Every place has a story.
                    </h1>
                    <p className="text-3xl text-primary font-bold mb-4 transition-colors duration-500">
                        Live it!
                    </p>
                    <p className="text-xl text-secondary-foreground/90 max-w-2xl mx-auto">
                        Discover unforgettable stays at the world's most remarkable destinations
                    </p>
                </div>
                {/* Decorative wave */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-background" style={{
                    clipPath: "polygon(0 50%, 100% 0, 100% 100%, 0 100%)"
                }}></div>
            </div>

            {/* Places Grid - Horizontal Card Layout */}
            <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
                {places.map((place) => (
                    <div
                        key={place.id}
                        className="group bg-card rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-border"
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
                                <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 border border-border">
                                    <FaStar className="text-primary transition-colors duration-500" />
                                    <span className="font-bold text-foreground transition-colors duration-500">{place.rating}</span>
                                </div>
                            </div>

                            {/* Content Section - Right Side */}
                            <div className="md:w-3/5 p-6 md:p-8 flex flex-col justify-between">
                                <div>
                                    {/* Location */}
                                    <div className="flex items-center gap-2 text-accent mb-3 transition-colors duration-500">
                                        <FaMapMarkerAlt />
                                        <span className="text-sm font-medium">{place.location}</span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-500">
                                        {place.name}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-muted-foreground mb-4 line-clamp-2">
                                        {place.description}
                                    </p>

                                    {/* Amenities */}
                                    {place.amenities && (
                                        <div className="flex flex-wrap gap-3 mb-4">
                                            {place.amenities.includes("WiFi") && (
                                                <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-secondary text-sm transition-colors duration-500">
                                                    <FaWifi className="text-primary" />
                                                    <span>Free WiFi</span>
                                                </div>
                                            )}
                                            {place.amenities.includes("Restaurant") && (
                                                <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-secondary text-sm transition-colors duration-500">
                                                    <MdRestaurant className="text-primary" />
                                                    <span>Restaurant</span>
                                                </div>
                                            )}
                                            {place.amenities.includes("Parking") && (
                                                <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-secondary text-sm transition-colors duration-500">
                                                    <FaParking className="text-primary" />
                                                    <span>Parking</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Bottom Section with Price and Button */}
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                                    <div>
                                        <p className="text-muted-foreground text-sm">Starting from</p>
                                        <p className="text-3xl font-bold text-primary transition-colors duration-500">
                                            ${place.price}
                                            <span className="text-sm text-muted-foreground font-normal">/night</span>
                                        </p>
                                    </div>
                                    <button className="px-8 py-3 bg-primary hover:bg-accent text-primary-foreground font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* CTA Section */}
            <div className="bg-muted py-16 text-center transition-colors duration-500">
                <button className="px-12 py-4 bg-foreground hover:bg-primary text-background text-lg font-bold rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105">
                    <FaBed className="inline mr-2" />
                    Explore All Places
                </button>
            </div>
        </div>
    );
}
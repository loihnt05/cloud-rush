import { Palette } from "lucide-react"
import { FaBed, FaMapMarkerAlt, FaParking, FaWifi } from "react-icons/fa";
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
export default function Places() {
    const places: Place[] = [
        {
            id: 1,
            name: "Sofitel Legend Metropole Hanoi",
            description: "Historic luxury hotel in the heart of Hanoi since 1901",
            price: 250,
            imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1470&q=80",
            rating: 4.8,
            location: "Hanoi, Vietnam",
            amenities: ["WiFi", "Restaurant", "Parking"]
        },
        {
            id: 2,
            name: "Sofitel Legend Metropole Hanoi",
            description: "Historic luxury hotel in the heart of Hanoi since 1901 istoric luxury hotel in istoric luxury hotel in the heart of Hanoi since 1901the heart of Hanoi since 1901",
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
        <div className="bg-white">
            {/* Hero */}
            <div className="mt-10 text-center bg-[#07401F] ">
                <p className="text-5xl text-white font-bold">Every place has a story. <br></br>
                    <span className="text-[#148C56]">Live it !</span>
                </p>
            </div>
            {/* card */}
            <div className="max-w-7xl mx-auto px-4 py-12 space-y-6 ">
                {places.slice(0,4).map(place => (
                    <div className="group flex flex-col 
                    md:flex-row bg-white border shadow-xl rounded-2xl overflow-hidden m-10">
                        <div className="md:w-2/5 md:h-full h-auto overflow-hidden">
                            <img src={place.imageUrl}
                                alt={place.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"></img>
                        </div>

                        {/* content */}
                        <div className="flex flex-col md:w-3/5 p-5 gap-3 justify-between">
                            <div className="items-center flex gap-2">
                                <FaMapMarkerAlt></FaMapMarkerAlt>
                                <span className="text-s font-normal text-[#148C56]">{place.location}</span>
                            </div>
                            <div className="mt-1">
                                <p className="text-2xl font-bold duration-500 group-hover:text-[#357D52] line-clamp-2"> {place.name}</p>
                            </div>
                            <p className="text-l font-light line-clamp-2">{place.description}</p>
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
                                        <p className="text-2xl text-[#148C56] font-bold">{place.price}$
                                        </p>
                                        <span className="text-s font-light text-black mt-2">/night</span>
                                    </div>
                                </div>
                                <button className="ml-auto bg-linear-to-r from-[#07401F] to-[#148C56] text-white
                                font-bold hover:from-[#148C56] hover:to-[#148C11] transition-all duration-300
                                hover:scale-105 rounded-full px-10 py-2 mt-2">View now</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {/* view more */}
            <div className="text-center">
                <button className="text-white bg-linear-to-r from-[#07401F] to-[#148C56] text-l font-bold
                px-15 py-4 rounded-full hover:text-[#148C56] hover:from-white hover:to-white hover:border-2 
                duration-150 hover:scale-110" > <FaBed className="inline mr-2" />View all </button>
            </div>
        </div>
    )
}
import { FaStar } from "react-icons/fa";

type Package = {
    id: number;
    name: string;
    price: number;
    description: string;
    imageUrl: string;
    rating?: number;
    location?: string;
};
export default function Packages() {

    // // call api to take data from here
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
        <div className="bg-[#07401F]">
            {/* {hero section} */}
            <div className="justify-center items-center">
                <p className="text-5xl text-white font-bold text-center">We plan. <br></br>
                    <span className="text-[#148C56] font-bold"> You live the adventure</span>
                </p>
                <p className="text-2xl text-white font-normal text-center mt-5">Find your next adventure with these
                    <span className="text-[#148C56]"> exclusive flight deals </span>
                </p>
            </div>
            {/* Package */}
            <div className=" grid grid-cols-4 gap-10 m-15 ">
                {packages.slice(0, 4).map(pack => (
                    <div key={pack.id}
                        className=" group bg-white hover:shadow-xl rounded-2xl overflow-hidden">
                        {/* img */}
                        <div className="overflow-hidden relative h-56">
                            <img
                                src={pack.imageUrl}
                                alt={pack.name}
                                className="w-full h-full transition-transform duration-700 group-hover:scale-110"></img>

                            <div className="absolute top-4 right-4 rounded-full bg-[#148C56] py-1 px-3 text-white">
                                ${pack.price}
                            </div>
                        </div>
                        {/* content */}
                        <div className="overflow-hidden p-6 space-y-2">
                            {/* name */}
                            <p className="text-xl font-bold text-black group-hover:text-[#357D52] transition-all duration-500">{pack.name}</p>
                            {/* description */}
                            <p className=" text-gray-600 text-s font-normal">{pack.description}</p>
                            {pack.rating && (
                                <div className="flex items-center gap-2">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar
                                            key={i}
                                            className={`text-sm ${i < Math.floor(pack.rating!)
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
                            <div className="pt-2">
                                <button className="w-full h-14 bg-linear-to-r from-[#224A33] to-[#148C56] rounded-2xl text-white font-bold 
                                     transform shadow-2xl hover:shadow2xl hover:from-[#148C56] hover:to-[#357D52] transition-all duration-500 hover:scale-105">
                                    Book Now
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {/* View all pages */}
            <div className="text-center">
                <button className=" h-full mb-5 px-10 py-4 text-xl font-bold bg-white rounded-full hover:bg-[#148C56] hover:text-white text-[#07401F]
                    transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105">
                    View all pages
                </button>
            </div>
        </div>
    )
}
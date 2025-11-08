import { FaQuoteLeft, FaStar } from "react-icons/fa";

type Testimonial = {
    id: number;
    name: string;
    avatar: string;
    comment: string;
    rating: number;
};
export function UserTestimonials() {
    
        const testimonials: Testimonial[] = [
            {
                id: 1,
                name: "Sarah Johnson",
                avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
                comment: "Amazing experience! The booking process was seamless and the flight was incredible. Highly recommend CloudRush!",
                rating: 5
            },
            {
                id: 2,
                name: "Michael Chen",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
                comment: "Best travel platform I've used. Great deals and excellent customer service throughout my journey.",
                rating: 5
            },
            {
                id: 3,
                name: "Emma Wilson",
                avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80",
                comment: "CloudRush made my vacation planning so easy. Found amazing deals and the hotels were perfect!",
                rating: 5
            }
        ];
    return(
                    <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-[#07401F] mb-4">
                        What CloudRush Users Are Saying
                    </h2>
                    <p className="text-gray-600 text-lg">Real experiences from our travelers</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
                        >
                            {/* Quote Icon */}
                            <FaQuoteLeft className="text-[#148C56] text-3xl mb-4 opacity-50" />

                            {/* Comment */}
                            <p className="text-gray-700 mb-6 italic">{testimonial.comment}</p>

                            {/* Rating */}
                            <div className="flex items-center gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <FaStar key={i} className="text-[#148C56]" />
                                ))}
                            </div>

                            {/* User Info */}
                            <div className="flex items-center gap-4">
                                <img
                                    src={testimonial.avatar}
                                    alt={testimonial.name}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-[#148C56]"
                                />
                                <div>
                                    <p className="font-bold text-[#07401F]">{testimonial.name}</p>
                                    <p className="text-sm text-gray-500">Verified Traveler</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
    )
}
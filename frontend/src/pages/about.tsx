import { FaPlane, FaHotel, FaCar, FaGlobe, FaUsers, FaAward, FaHeart, FaShieldAlt } from "react-icons/fa";

export default function About() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-linear-to-r from-[#07401F] to-[#148C56] text-white py-24 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            About Cloud Rush
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-white/90">
            Your trusted partner in creating unforgettable travel experiences around the world
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-[#07401F] mb-6">Our Mission</h2>
            <p className="text-lg text-gray-700 mb-4">
              At Cloud Rush, we believe that travel is more than just visiting new places—it's about creating lasting memories, discovering new cultures, and connecting with the world around us.
            </p>
            <p className="text-lg text-gray-700 mb-4">
              We're dedicated to making travel accessible, affordable, and enjoyable for everyone. Our platform combines cutting-edge technology with personalized service to help you plan, book, and experience the journey of a lifetime.
            </p>
            <p className="text-lg text-gray-700">
              Whether you're planning a quick weekend getaway or an extended adventure across continents, Cloud Rush is here to make your travel dreams a reality.
            </p>
          </div>
          <div className="bg-linear-to-br from-[#148C56]/10 to-[#07401F]/10 rounded-2xl p-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-[#148C56] p-3 rounded-lg">
                  <FaGlobe className="text-white text-2xl" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-[#07401F] mb-2">Global Reach</h3>
                  <p className="text-gray-600">Access to destinations worldwide with local expertise</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-[#148C56] p-3 rounded-lg">
                  <FaHeart className="text-white text-2xl" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-[#07401F] mb-2">Personalized Service</h3>
                  <p className="text-gray-600">Tailored recommendations based on your preferences</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-[#148C56] p-3 rounded-lg">
                  <FaShieldAlt className="text-white text-2xl" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-[#07401F] mb-2">Secure & Reliable</h3>
                  <p className="text-gray-600">Safe booking with 24/7 customer support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What We Offer */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-[#07401F] mb-12">
            What We Offer
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-[#148C56] w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <FaPlane className="text-white text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-[#07401F] mb-3">Flights</h3>
              <p className="text-gray-600">
                Book flights to destinations worldwide with competitive prices and flexible options
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-[#148C56] w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <FaHotel className="text-white text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-[#07401F] mb-3">Hotels</h3>
              <p className="text-gray-600">
                Find the perfect accommodation from budget-friendly to luxury hotels
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-[#148C56] w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <FaCar className="text-white text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-[#07401F] mb-3">Car Rentals</h3>
              <p className="text-gray-600">
                Rent a car for your journey with convenient pickup and drop-off locations
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-[#148C56] w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <FaGlobe className="text-white text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-[#07401F] mb-3">Packages</h3>
              <p className="text-gray-600">
                All-inclusive travel packages designed to give you the best experience
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="p-8">
            <div className="text-5xl font-bold text-[#148C56] mb-2">10K+</div>
            <p className="text-xl text-gray-600">Happy Travelers</p>
          </div>
          <div className="p-8">
            <div className="text-5xl font-bold text-[#148C56] mb-2">150+</div>
            <p className="text-xl text-gray-600">Destinations</p>
          </div>
          <div className="p-8">
            <div className="text-5xl font-bold text-[#148C56] mb-2">98%</div>
            <p className="text-xl text-gray-600">Satisfaction Rate</p>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="bg-linear-to-r from-[#07401F] to-[#148C56] text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Why Choose Cloud Rush?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <FaUsers className="text-5xl mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3">Expert Team</h3>
              <p className="text-white/90">
                Our experienced travel specialists are ready to help you plan the perfect trip
              </p>
            </div>
            <div className="text-center">
              <FaAward className="text-5xl mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3">Best Prices</h3>
              <p className="text-white/90">
                We guarantee competitive rates and exclusive deals for our customers
              </p>
            </div>
            <div className="text-center">
              <FaShieldAlt className="text-5xl mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3">24/7 Support</h3>
              <p className="text-white/90">
                Round-the-clock customer service to assist you before, during, and after your trip
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl font-bold text-[#07401F] mb-6">
          Ready to Start Your Journey?
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Join thousands of satisfied travelers who trust Cloud Rush for their travel needs
        </p>
        <button
          onClick={() => window.location.href = '/flight'}
          className="bg-linear-to-r from-[#07401F] to-[#148C56] text-white font-bold text-lg px-10 py-4 rounded-full hover:from-[#148C56] hover:to-[#148C11] transition-all duration-300 hover:scale-105 shadow-lg"
        >
          Start Booking Now
        </button>
      </div>
    </div>
  );
}

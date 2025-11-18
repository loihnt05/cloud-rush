import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { Plane, Hotel, Car, Package, MapPin, Calendar, Shield, Clock } from "lucide-react";

export default function Home() {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-50 to-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Plane className="h-8 w-8 text-sky-600" />
              <span className="text-2xl font-bold bg-linear-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                CloudRush
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => loginWithRedirect()}
              >
                Sign In
              </Button>
              <Button
                onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: "signup" } })}
                className="bg-linear-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              Your Journey Begins with{" "}
              <span className="bg-linear-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                CloudRush
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Plan, book, and manage your entire travel experience in one place. 
              From flights to hotels, car rentals to complete packages—we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: "signup" } })}
                className="bg-linear-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-lg px-8 py-6"
              >
                Start Your Adventure
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => loginWithRedirect()}
                className="text-lg px-8 py-6 border-2 border-sky-600 text-sky-600 hover:bg-sky-50"
              >
                Explore Services
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative background */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-sky-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Your Perfect Trip
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive travel services designed to make your journey seamless and memorable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Flight Bookings */}
            <div className="group p-6 rounded-2xl border-2 border-gray-100 hover:border-sky-200 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-linear-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plane className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Flight Bookings</h3>
              <p className="text-gray-600">
                Search and book flights to destinations worldwide with real-time availability and best prices
              </p>
            </div>

            {/* Hotels */}
            <div className="group p-6 rounded-2xl border-2 border-gray-100 hover:border-sky-200 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Hotel className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Hotels</h3>
              <p className="text-gray-600">
                Discover comfortable accommodations from budget-friendly to luxury options
              </p>
            </div>

            {/* Car Rentals */}
            <div className="group p-6 rounded-2xl border-2 border-gray-100 hover:border-sky-200 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-linear-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Car className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Car Rentals</h3>
              <p className="text-gray-600">
                Rent the perfect vehicle for your journey with flexible pickup and drop-off options
              </p>
            </div>

            {/* Travel Packages */}
            <div className="group p-6 rounded-2xl border-2 border-gray-100 hover:border-sky-200 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-linear-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Package className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Travel Packages</h3>
              <p className="text-gray-600">
                Complete vacation packages bundling flights, hotels, and experiences for the best value
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-linear-to-b from-sky-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Why Choose CloudRush?
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-sky-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Explore Destinations</h3>
                    <p className="text-gray-600">
                      Discover amazing places with detailed guides and local insights from fellow travelers
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-sky-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Trip Planning Made Easy</h3>
                    <p className="text-gray-600">
                      Create detailed itineraries, manage bookings, and keep all your travel info in one place
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-sky-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Secure & Reliable</h3>
                    <p className="text-gray-600">
                      Your data is protected with enterprise-grade security and your bookings are guaranteed
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-sky-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">24/7 Support</h3>
                    <p className="text-gray-600">
                      Our dedicated team is always ready to help you with any questions or concerns
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl bg-linear-to-br from-sky-400 via-blue-500 to-purple-600 p-8 shadow-2xl">
                <div className="w-full h-full bg-white rounded-xl p-8 flex items-center justify-center">
                  <div className="text-center">
                    <Plane className="h-32 w-32 text-sky-600 mx-auto mb-4 animate-pulse" />
                    <p className="text-2xl font-bold text-gray-900">
                      Ready to take off?
                    </p>
                    <p className="text-gray-600 mt-2">
                      Join thousands of happy travelers
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-r from-sky-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Start Your Journey Today
          </h2>
          <p className="text-xl text-sky-100 mb-8">
            Create your account now and unlock exclusive deals and personalized travel recommendations
          </p>
          <Button
            size="lg"
            onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: "signup" } })}
            className="bg-white text-sky-600 hover:bg-gray-100 text-lg px-8 py-6"
          >
            Sign Up for Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Plane className="h-6 w-6 text-sky-400" />
                <span className="text-xl font-bold text-white">CloudRush</span>
              </div>
              <p className="text-sm text-gray-400">
                Making travel planning simple, secure, and enjoyable for everyone.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-sky-400 transition-colors">Flights</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Hotels</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Car Rentals</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Packages</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-sky-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-sky-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 CloudRush. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
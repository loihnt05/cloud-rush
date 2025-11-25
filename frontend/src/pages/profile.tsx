import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import { FaUser, FaEnvelope, FaCalendar, FaPlane, FaHotel, FaCar, FaEdit, FaSave, FaTimes, FaShieldAlt, FaGlobe, FaBell } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { getUserBookings } from "@/api/booking";
import type { Booking } from "@/types/booking";

export default function Profile() {
  const { user, isLoading: authLoading } = useAuth0();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || "");
  
  // Fetch user's bookings
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["user-bookings", user?.sub],
    queryFn: () => getUserBookings(user?.sub || ""),
    enabled: !!user?.sub,
  });

  const handleSave = () => {
    // Here you would typically call an API to update the user profile
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedName(user?.name || "");
    setIsEditing(false);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-2xl text-[#148C56] font-semibold">Loading profile...</div>
      </div>
    );
  }

  const totalBookings = bookings.length;
  const upcomingBookings = bookings.filter((b: Booking) => b.booking_date && new Date(b.booking_date) > new Date()).length;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section with User Info */}
      <div className="bg-linear-to-r from-[#07401F] to-[#148C56] text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Profile Picture */}
            <div className="relative">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || "User"}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-2xl object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-2xl flex items-center justify-center text-4xl font-bold text-[#148C56]">
                  {user?.name ? user.name.split(" ").map(n => n[0]).slice(0, 2).join("") : "U"}
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                <FaShieldAlt className="text-[#148C56] text-xl" />
              </div>
            </div>

            {/* User Details */}
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="text-3xl font-bold bg-white/10 border-2 border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:border-white"
                  />
                  <button
                    onClick={handleSave}
                    className="bg-white text-[#148C56] p-3 rounded-full hover:bg-gray-100 transition-all"
                  >
                    <FaSave className="text-xl" />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-all"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 mb-3 justify-center md:justify-start">
                  <h1 className="text-4xl font-bold">{user?.name || "Guest User"}</h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
                  >
                    <FaEdit className="text-xl" />
                  </button>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4 text-white/90">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <FaEnvelope />
                  <span>{user?.email || "No email"}</span>
                </div>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <FaCalendar />
                  <span>Member since {new Date().getFullYear()}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                <div className="text-3xl font-bold">{totalBookings}</div>
                <div className="text-sm text-white/80">Total Trips</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                <div className="text-3xl font-bold">{upcomingBookings}</div>
                <div className="text-sm text-white/80">Upcoming</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Account Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-[#07401F] mb-6 flex items-center gap-3">
                <FaUser className="text-[#148C56]" />
                Personal Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-2 block">Full Name</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-800">
                    {user?.name || "Not provided"}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-2 block">Email Address</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-800">
                    {user?.email || "Not provided"}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-2 block">Phone Number</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-400">
                    Not provided
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-2 block">Date of Birth</label>
                  <div className="bg-gray-50 rounded-lg p-3 text-gray-400">
                    Not provided
                  </div>
                </div>
              </div>
            </div>

            {/* Travel Preferences */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-[#07401F] mb-6 flex items-center gap-3">
                <FaGlobe className="text-[#148C56]" />
                Travel Preferences
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaPlane className="text-[#148C56] text-xl" />
                    <div>
                      <p className="font-semibold">Preferred Seat</p>
                      <p className="text-sm text-gray-600">Window seat</p>
                    </div>
                  </div>
                  <button className="text-[#148C56] hover:text-[#07401F] font-semibold">
                    Edit
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaHotel className="text-[#148C56] text-xl" />
                    <div>
                      <p className="font-semibold">Hotel Preferences</p>
                      <p className="text-sm text-gray-600">4-5 star hotels</p>
                    </div>
                  </div>
                  <button className="text-[#148C56] hover:text-[#07401F] font-semibold">
                    Edit
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaCar className="text-[#148C56] text-xl" />
                    <div>
                      <p className="font-semibold">Car Type</p>
                      <p className="text-sm text-gray-600">SUV or Sedan</p>
                    </div>
                  </div>
                  <button className="text-[#148C56] hover:text-[#07401F] font-semibold">
                    Edit
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-[#07401F] mb-6 flex items-center gap-3">
                <FaCalendar className="text-[#148C56]" />
                Recent Bookings
              </h2>
              {bookingsLoading ? (
                <div className="text-center py-8 text-gray-500">Loading bookings...</div>
              ) : bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.slice(0, 3).map((booking: Booking) => (
                    <div
                      key={booking.booking_id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                      onClick={() => window.location.href = `/my-bookings/${booking.booking_id}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-[#148C56] text-white p-3 rounded-lg">
                          <FaPlane className="text-xl" />
                        </div>
                        <div>
                          <p className="font-semibold">Booking #{booking.booking_id}</p>
                          <p className="text-sm text-gray-600">
                            {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#148C56]">${booking.total_amount || 0}</p>
                        <p className="text-sm text-gray-600 capitalize">{booking.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No bookings yet</p>
                  <button
                    onClick={() => window.location.href = '/flight'}
                    className="bg-linear-to-r from-[#07401F] to-[#148C56] text-white px-6 py-2 rounded-full hover:from-[#148C56] hover:to-[#148C11] transition-all"
                  >
                    Book Your First Trip
                  </button>
                </div>
              )}
              {bookings.length > 3 && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => window.location.href = '/my-bookings'}
                    className="text-[#148C56] hover:text-[#07401F] font-semibold"
                  >
                    View All Bookings →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Quick Actions & Settings */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#07401F] mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = '/my-bookings'}
                  className="w-full flex items-center gap-3 p-3 bg-[#148C56]/10 hover:bg-[#148C56]/20 rounded-lg transition-all text-left"
                >
                  <FaPlane className="text-[#148C56]" />
                  <span className="font-semibold">My Bookings</span>
                </button>
                <button
                  onClick={() => window.location.href = '/my-service-bookings'}
                  className="w-full flex items-center gap-3 p-3 bg-[#148C56]/10 hover:bg-[#148C56]/20 rounded-lg transition-all text-left"
                >
                  <FaHotel className="text-[#148C56]" />
                  <span className="font-semibold">Service Bookings</span>
                </button>
                <button
                  onClick={() => window.location.href = '/flight'}
                  className="w-full flex items-center gap-3 p-3 bg-[#148C56]/10 hover:bg-[#148C56]/20 rounded-lg transition-all text-left"
                >
                  <FaGlobe className="text-[#148C56]" />
                  <span className="font-semibold">Book a Trip</span>
                </button>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#07401F] mb-4">Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaBell className="text-gray-600" />
                    <span className="font-medium">Notifications</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#148C56]"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaEnvelope className="text-gray-600" />
                    <span className="font-medium">Email Updates</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#148C56]"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaShieldAlt className="text-gray-600" />
                    <span className="font-medium">Two-Factor Auth</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#148C56]"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Membership Card */}
            <div className="bg-linear-to-br from-[#07401F] to-[#148C56] text-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Membership Status</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Tier</span>
                  <span className="font-bold text-xl">Silver</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Points</span>
                  <span className="font-bold text-xl">{totalBookings * 100}</span>
                </div>
                <div className="mt-4">
                  <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-white h-full transition-all"
                      style={{ width: `${Math.min((totalBookings * 100) / 500 * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-white/80 mt-2">
                    {500 - (totalBookings * 100)} points to Gold tier
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function PassengerInformation() {
    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Complete Your Booking</h1>
                    <p className="text-gray-600 mb-8">We're just a few details away from your next adventure</p>
                    
                    <div className="grid grid-cols-3 gap-6">
                        {/* Main Form Section */}
                        <div className="col-span-2 space-y-6">
                            {/* Passenger Information Card */}
                            <Card className="shadow-lg">
                                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                                    <CardTitle className="text-2xl">Passenger Information</CardTitle>
                                    <CardDescription className="text-blue-100">
                                        Enter the required information for each traveler and be sure that it exactly matches the government-issued ID presented at the airport.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                                                <Input placeholder="John" className="w-full" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Middle Name</label>
                                                <Input placeholder="Michael" className="w-full" />
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                                                <Input placeholder="Doe" className="w-full" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Suffix</label>
                                                <Input placeholder="Jr., Sr., etc." className="w-full" />
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                                                <Input type="date" className="w-full" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                                                <select className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                                                    <option>Male</option>
                                                    <option>Female</option>
                                                    <option>Other</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Nationality</label>
                                                <Input placeholder="Vietnam" className="w-full" />
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                                <Input type="email" placeholder="john.doe@example.com" className="w-full" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                                                <Input type="tel" placeholder="+84 123 456 789" className="w-full" />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Baggage Information Card */}
                            <Card className="shadow-lg">
                                <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-lg">
                                    <CardTitle className="text-2xl">Baggage Information</CardTitle>
                                    <CardDescription className="text-green-100">
                                        Review your baggage allowance and add extra bags if needed
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                        <h4 className="font-semibold text-green-800 mb-2">✓ Included in your fare:</h4>
                                        <ul className="space-y-1 text-sm text-green-700">
                                            <li>• 1 carry-on bag (up to 7kg)</li>
                                            <li>• 1 personal item (purse, laptop bag)</li>
                                            <li>• 1 checked bag (up to 23kg)</li>
                                        </ul>
                                    </div>
                                    <p className="text-gray-600 text-sm">
                                        Second bag check fees are waived for loyalty program members. 
                                        <a href="#" className="text-blue-600 hover:underline ml-1">See the full bag policy</a>
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar - Booking Summary */}
                        <div className="col-span-1">
                            <Card className="shadow-lg sticky top-8">
                                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
                                    <CardTitle className="text-xl">Booking Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Route</p>
                                            <p className="font-semibold text-gray-800">Hanoi → Ho Chi Minh City</p>
                                        </div>
                                        <div className="border-t pt-4">
                                            <p className="text-sm text-gray-500">Date</p>
                                            <p className="font-semibold text-gray-800">October 25, 2025</p>
                                        </div>
                                        <div className="border-t pt-4">
                                            <p className="text-sm text-gray-500">Passengers</p>
                                            <p className="font-semibold text-gray-800">1 Adult</p>
                                        </div>
                                        <div className="border-t pt-4">
                                            <p className="text-sm text-gray-500">Class</p>
                                            <p className="font-semibold text-gray-800">Economy</p>
                                        </div>
                                        <div className="border-t pt-4">
                                            <div className="flex justify-between items-center">
                                                <p className="text-lg font-bold text-gray-800">Total</p>
                                                <p className="text-2xl font-bold text-purple-600">$180</p>
                                            </div>
                                        </div>
                                        <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md">
                                            Continue to Payment
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
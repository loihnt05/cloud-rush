import LoginButton from "@/components/login-button";
import Button from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";

type Package = 
{
    id: number,
    name: string,
    price: number,
    description: string
    imageUrl: string
}
type Place =
    {
        id: number,
        description: string,
        name: string,
        imgUrl: string,
    }

function Flight() {
    const places: Place[] =
        [
            {
                id: 1,
                name: "Sofitel Legend Metropole Hanoi",
                description: "Historic luxury hotel in the heart of Hanoi since 1901",
                imgUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1470&q=80"
            },
                        {
                id: 2,
                name: "Sofitel Legend Metropole Hanoi",
                description: "Historic luxury hotel in the heart of Hanoi since 1901Historic luxury hotel in the heart of Hanoi since 1901Historic luxury hotel in the heart of Hanoi since 1901",
                imgUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1470&q=80"
            },
            {
                id: 3,
                name: "Sofitel Legend Metropole Hanoi",
                description: "Historic luxury hotel in the heart of Hanoi since 1901Historic luxury hotel in the heart of Hanoi since 1901Historic luxury hotel in the heart of Hanoi since 1901",
                imgUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1470&q=80"
            }
            ,
            {
                id: 4,
                name: "Sofitel Legend Metropole Hanoi",
                description: "Historic luxury hotel in the heart of Hanoi since 1901Historic luxury hotel in the heart of Hanoi since 1901Historic luxury hotel in the heart of Hanoi since 1901",
                imgUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1470&q=80"
            }
            ,
            {
                id: 5,
                name: "Sofitel Legend Metropole Hanoi",
                description: "Historic luxury hotel in the heart of Hanoi since 1901Historic luxury hotel in the heart of Hanoi since 1901Historic luxury hotel in the heart of Hanoi since 1901",
                imgUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1470&q=80"
            }
        ]
    const packages: Package[] = [
        {
            id: 1,
            name: "Sofitel Legend Metropole Hanoi",
            description: "Historic luxury hotel in the heart of Hanoi since 1901",
            price: 250,
            imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1470&q=80"
        }
        ,{
            id: 2,
            name: "Sofitel Legend Metropole Hanoi",
            description: "Historic luxury hotel in the heart of Hanoi since 1901",
            price: 250,
            imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1470&q=80"
        }
                        ,{
            id: 4,
            name: "Sofitel Legend Metropole Hanoi",
            description: "Historic luxury hotel in the heart of Hanoi since 1901",
            price: 250,
            imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1470&q=80"
        }
                                ,{
            id: 3,
            name: "Sofitel Legend Metropole Hanoi",
            description: "Historic luxury hotel in the heart of Hanoi since 1901",
            price: 250,
            imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1470&q=80"
        }
    ] 
    return (
        <>
            <div>
                <div className="flex justify-center items-center my-6">
                    <h1 className="text-6xl font-bold text-center">It is more than just a trip </h1>
                </div>

                <div className="flex justify-center items-center">
                    <div className="w-1/5 p-4">
                        <Input placeholder="From where?"></Input>
                    </div>
                    <div className="w-1/5 p-4">
                        <Input placeholder="To where?"></Input>
                    </div>
                    <div className="w-1/5 p-4">
                        <Popover>
                            <PopoverTrigger asChild>
                                <button className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-left text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                                    When?
                                </button>
                            </PopoverTrigger>
                            <PopoverContent>
                                <Input type="date" />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="w-1/5 p-4">
                        <Popover>
                            <PopoverTrigger asChild>
                                <button className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-left text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                                    How many pp?
                                </button>
                            </PopoverTrigger>
                            <PopoverContent>
                                <div className="flex flex-col gap-2 p-2">
                                    <div className="flex items-center justify-between">
                                        <span className="w-24 px-1">Adults</span>
                                        <div className="flex items-center gap-2">
                                            <Button>-</Button>
                                            <span>1</span>
                                            <Button>+</Button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="w-24 px-1">Children</span>
                                        <div className="flex items-center gap-2">
                                            <Button>-</Button>
                                            <span>1</span>
                                            <Button>+</Button>
                                        </div>
                                    </div>
                                </div>

                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="w-1/5 p-4">
                        <button className="bg-blue-500 text-white w-full px-4 py-2 rounded hover:bg-blue-600">Search</button>
                    </div>
                </div>
            </div>
            {/* {Featured flight deals} */}
            <div className="flex flex-col">
                <div className="flex flex-row">
                    <p className="mx-1 mt-1">Find your next adventure with these 
                        <span className="text-blue-200"> exciting flight deals
                        </span>
                    </p>
                    <Button className="ml-auto mr-2">All</Button>
                </div>
                <div className="grid grid-cols-4 gap-5 justify-start mt-2">
                {
                    packages.slice(0, 4).map(pack => (
                    <Card key={pack.id}>
                        <CardHeader>
                            <CardTitle>{pack.name}</CardTitle>
                            <CardDescription>{pack.description}</CardDescription>
                            <CardAction>{pack.price} $</CardAction>
                        </CardHeader>
                        <CardContent>
                            <img 
                                src={pack.imageUrl} 
                                className="w-full h-48 object-cover rounded-md mb-4" 
                            />
                        </CardContent>
                    </Card>
                    ))
                }
                </div>
            </div>
            {/* {Featured places to stay} */}
            <div className="flex flex-col mt-5">
                <div className="flex flex-row">
                    <p className="ml-2 mt-1">Explore unique <span className="text-blue-200"> places to stay</span></p>
                    <Button className="ml-auto mr-2">All</Button>
                </div>
                <div className="grid grid-cols-4 gap-5 mt-2">
                    {places.slice(0, 4).map(place => (
                        <Card key={place.id}>
                            <CardContent>
                                <img
                                    src={place.imgUrl}
                                    className="w-full h-48 object-cover rounded-md mb-4"
                                />
                            </CardContent>
                            <CardHeader>
                                <CardTitle className="text-emerald-400 text-xl" >{place.name}</CardTitle>
                                <CardDescription className="text-s">{place.description}</CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>

            {/* {User testimonials} */}
            <div className="flex flex-col my-10 bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-6 rounded-2xl">
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold text-gray-800 mb-2">What Our Travelers Say</h2>
                    <p className="text-gray-600">Real experiences from real customers</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
                    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-t-blue-500">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <img 
                                    className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-200" 
                                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80" 
                                    alt="Sarah Johnson" 
                                />
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800">Sarah Johnson</h3>
                                    <p className="text-sm text-gray-500">Hanoi, Vietnam</p>
                                    <div className="flex gap-1 mt-1">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className="text-yellow-400">★</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-700 italic leading-relaxed">
                                "CloudRush made booking my trip to Ha Long Bay incredibly easy! The interface is intuitive and I found amazing deals. Highly recommend for anyone planning a Vietnam adventure."
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-t-green-500">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <img 
                                    className="w-16 h-16 rounded-full object-cover ring-2 ring-green-200" 
                                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80" 
                                    alt="Michael Chen" 
                                />
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800">Michael Chen</h3>
                                    <p className="text-sm text-gray-500">Singapore</p>
                                    <div className="flex gap-1 mt-1">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className="text-yellow-400">★</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-700 italic leading-relaxed">
                                "Best travel platform I've used! Booked flights and hotels for my family vacation. Everything was seamless from start to finish. The customer support team was also super helpful!"
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-t-purple-500">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <img 
                                    className="w-16 h-16 rounded-full object-cover ring-2 ring-purple-200" 
                                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80" 
                                    alt="Emma Rodriguez" 
                                />
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800">Emma Rodriguez</h3>
                                    <p className="text-sm text-gray-500">Barcelona, Spain</p>
                                    <div className="flex gap-1 mt-1">
                                        {[...Array(4)].map((_, i) => (
                                            <span key={i} className="text-yellow-400">★</span>
                                        ))}
                                        <span className="text-gray-300">★</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-700 italic leading-relaxed">
                                "Found incredible prices for my Hoi An trip! The booking process was quick and I appreciated the detailed information about each hotel. Will definitely use again for my next journey."
                            </p>
                        </CardContent>
                    </Card> 
                </div>
            </div>
        </>
    )
}
export default Flight;

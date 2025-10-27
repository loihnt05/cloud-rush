import LoginButton from "@/components/login-button";
import Button from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";

// type Student = {
//     name: string;
//     age: number;
// }

function Flight() {
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
                    <p>Find your next adventure with these <span className="text-blue-200">exciting flight deals</span></p>
                    <Button className="ml-auto mr-2">All</Button>
                </div>
                <div className="flex flex-row justify-between p-1 my-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ha Long Bay</CardTitle>
                            <CardDescription>UNESCO World Heritage Site with stunning limestone karsts</CardDescription>
                            <CardAction>$180</CardAction>
                        </CardHeader>
                        <CardContent>
                            <img src="https://images.unsplash.com/photo-1528127269322-539801943592?w=1470&q=80" alt="Ha Long Bay" className="w-full h-48 object-cover rounded-md mb-4" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Hoi An Ancient Town</CardTitle>
                            <CardDescription>Charming historic town with lantern-lit streets</CardDescription>
                            <CardAction>$150</CardAction>
                        </CardHeader>
                        <CardContent>
                            <img src="https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1470&q=80" alt="Hoi An" className="w-full h-48 object-cover rounded-md mb-4" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Sapa Rice Terraces</CardTitle>
                            <CardDescription>Breathtaking mountain landscapes and ethnic villages</CardDescription>
                            <CardAction>$165</CardAction>
                        </CardHeader>
                        <CardContent>
                            <img src="https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1470&q=80" alt="Sapa" className="w-full h-48 object-cover rounded-md mb-4" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Phong Nha-Ke Bang</CardTitle>
                            <CardDescription>World's largest caves and pristine national park</CardDescription>
                            <CardAction>$170</CardAction>
                        </CardHeader>
                        <CardContent>
                            <img src="https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1470&q=80" alt="Phong Nha" className="w-full h-48 object-cover rounded-md mb-4" />
                        </CardContent>
                    </Card>
                </div>
            </div>
            {/* {Featured places to stay} */}
            <div className="flex flex-col">
                <div className="flex flex-row">
                    <p className="ml-2">Explore unique <span className="text-blue-200"> places to stay</span></p>
                    <Button className="ml-auto mr-2">All</Button>
                </div>
                <div className="flex flex-row justify-between p-1 my-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sofitel Legend Metropole Hanoi</CardTitle>
                            <CardDescription>Historic luxury hotel in the heart of Hanoi since 1901</CardDescription>
                            <CardAction>$250/night</CardAction>
                        </CardHeader>
                        <CardContent>
                            <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1470&q=80" alt="Luxury Hotel" className="w-full h-48 object-cover rounded-md mb-4" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>InterContinental Danang</CardTitle>
                            <CardDescription>Beachfront resort with stunning ocean views</CardDescription>
                            <CardAction>$200/night</CardAction>
                        </CardHeader>
                        <CardContent>
                            <img src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1470&q=80" alt="Beach Resort" className="w-full h-48 object-cover rounded-md mb-4" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Azerai La Residence Hue</CardTitle>
                            <CardDescription>Colonial elegance along the Perfume River</CardDescription>
                            <CardAction>$180/night</CardAction>
                        </CardHeader>
                        <CardContent>
                            <img src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1470&q=80" alt="Heritage Hotel" className="w-full h-48 object-cover rounded-md mb-4" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Six Senses Ninh Van Bay</CardTitle>
                            <CardDescription>Exclusive island retreat with private villas</CardDescription>
                            <CardAction>$350/night</CardAction>
                        </CardHeader>
                        <CardContent>
                            <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1470&q=80" alt="Island Resort" className="w-full h-48 object-cover rounded-md mb-4" />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* {User testimonials} */}
            <div className="flex flex-col my-5">
                <div className="flex flex-row justify-center">
                    <h1 className="text-lg font-bold">What Cloudrush users are saying</h1>
                </div>
                <div className="flex flex-row gap-3 my-5">
                    <Card className="w-1/3">
                        <div className="flex flex-row gap-5">
                            <CardContent>
                                <img className="w-10 h-10 rounded-full mb-4" src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" alt="User Avatar" />
                            </CardContent>
                            <div className="flex flex-col">
                                <CardTitle>Card Name</CardTitle>
                                <CardDescription>Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora dolores esse accusamus eius pariatur sequi, qui quos doloremque? Eaque ea ipsa corrupti fugit consequatur aperiam quia porro dolorem qui iste.</CardDescription>
                                <CardAction>Card Action</CardAction>
                            </div>
                        </div>
                    </Card>
                    <Card className="w-1/3">
                        <div className="flex flex-row gap-5">
                            <CardContent>
                                <img className="w-10 h-10 rounded-full mb-4" src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" alt="User Avatar" />
                            </CardContent>
                            <div className="flex flex-col">
                                <CardTitle>Card Name</CardTitle>
                                <CardDescription>Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora dolores esse accusamus eius pariatur sequi, qui quos doloremque? Eaque ea ipsa corrupti fugit consequatur aperiam quia porro dolorem qui iste.</CardDescription>
                                <CardAction>Card Action</CardAction>
                            </div>
                        </div>
                    </Card>
                    <Card className="w-1/3">
                        <div className="flex flex-row gap-5">
                            <CardContent>
                                <img className="w-10 h-10 rounded-full mb-4" src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" alt="User Avatar" />
                            </CardContent>
                            <div className="flex flex-col">
                                <CardTitle>Card Name</CardTitle>
                                <CardDescription>Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora dolores esse accusamus eius pariatur sequi, qui quos doloremque? Eaque ea ipsa corrupti fugit consequatur aperiam quia porro dolorem qui iste.</CardDescription>
                                <CardAction>Card Action</CardAction>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </>
    )
}
export default Flight;
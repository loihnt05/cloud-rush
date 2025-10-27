import Button from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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

import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
type Package = 
{
    id: number,
    name: string,
    price: number,
    description: string
    imageUrl: string
}
export default function Packages() {

    // call api to take data from here
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
            <p className="ml-1 text-3xl mb-5">Find your next adventure with these 
                <span className="text-emerald-800"> flight deals </span>
            </p>
            <div className="grid grid-rows-2 grid-cols-3  gap-4 ">
                {
                    packages.map(pack => (
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
        </>
    )
}
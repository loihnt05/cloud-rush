import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Place =
    {
        id: number,
        description: string,
        name: string,
        imgUrl: string,
    }
export default function Places() {
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
        ]
    return (
        <>
                        <div className="flex justify-center items-center my-6">
                    <h1 className="text-6xl font-bold text-center">Every place has a story. Live it.</h1>
                </div>
            <p className="ml-1 text-3xl mb-5">Find best
                <span className="text-emerald-800"> places to stay</span>
            </p>

            <div className="grid grid-cols-3 grid-rows-2 gap-10">
                {
                    places.map(place => (
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
                    ))
                }
            </div>
        </>
    )
}
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { exploreApi, type CreateExploreDto } from "@/api/explore";
import { placesApi } from "@/api/places";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FaMapMarkerAlt, FaCalendar, FaPlus, FaQuoteLeft } from "react-icons/fa";
import { MdExplore } from "react-icons/md";

export default function ExplorePage() {
  const { user, isAuthenticated } = useAuth0();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateExploreDto>({
    user_id: "",
    title: "",
    content: "",
    place_id: null,
  });

  // Fetch random explores
  const {
    data: explores = [],
    isLoading: exploresLoading,
    error: exploresError,
  } = useQuery({
    queryKey: ["explores", "random"],
    queryFn: () => exploreApi.getRandomExplores(12),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Fetch places for the dropdown
  const { data: places = [] } = useQuery({
    queryKey: ["places"],
    queryFn: placesApi.getPlaces,
    staleTime: 5 * 60 * 1000,
  });

  // Create explore mutation
  const createExploreMutation = useMutation({
    mutationFn: (data: CreateExploreDto) => exploreApi.createExplore(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["explores"] });
      setIsDialogOpen(false);
      setFormData({
        user_id: "",
        title: "",
        content: "",
        place_id: null,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.sub) {
      alert("You must be logged in to create an explore entry");
      return;
    }

    const dataToSubmit = {
      ...formData,
      user_id: user.sub,
      place_id: formData.place_id || null,
    };

    createExploreMutation.mutate(dataToSubmit);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-linear-to-b from-white to-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-linear-to-r from-[#07401F] to-[#148C56] text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center mb-6">
            <MdExplore className="text-6xl" />
          </div>
          <h1 className="text-5xl font-bold text-center mb-4">
            Explore the World
          </h1>
          <p className="text-xl text-center text-white/90 max-w-2xl mx-auto mb-8">
            Discover amazing journeys from travelers around the globe and share your own adventures
          </p>
          
          {/* Create Explore Button */}
          {isAuthenticated && (
            <div className="flex justify-center">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    className="bg-white text-[#148C56] hover:bg-gray-100 font-semibold px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
                  >
                    <FaPlus className="mr-2" />
                    Share Your Journey
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl text-[#148C56]">Share Your Explore Story</DialogTitle>
                    <DialogDescription>
                      Tell us about your amazing journey. Share your experiences with the community!
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title" className="text-base font-semibold">
                          Title <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="title"
                          placeholder="My Amazing Adventure in..."
                          value={formData.title}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                          required
                          maxLength={200}
                          className="text-base"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="place" className="text-base font-semibold">
                          Place (Optional)
                        </Label>
                        <Select
                          value={formData.place_id?.toString() || "none"}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              place_id: value === "none" ? null : parseInt(value),
                            })
                          }
                        >
                          <SelectTrigger className="text-base">
                            <SelectValue placeholder="Select a place" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No specific place</SelectItem>
                            {places.map((place) => (
                              <SelectItem
                                key={place.place_id}
                                value={place.place_id.toString()}
                              >
                                {place.name} {place.city && place.country && `(${place.city}, ${place.country})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="content" className="text-base font-semibold">
                          Your Story
                        </Label>
                        <textarea
                          id="content"
                          placeholder="Share the details of your journey, what made it special, and any tips for future travelers..."
                          value={formData.content || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, content: e.target.value })
                          }
                          rows={6}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#148C56] text-base"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-[#148C56] hover:bg-[#0F6B42]"
                        disabled={createExploreMutation.isPending}
                      >
                        {createExploreMutation.isPending ? "Posting..." : "Post Journey"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>

      {/* Explores Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#07401F] mb-4">
            Real Experiences from Our Travelers
          </h2>
          <p className="text-gray-600 text-lg">
            Discover authentic stories and adventures from explorers around the world
          </p>
        </div>

        {exploresLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {([0, 1, 2, 3, 4, 5] as const).map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg">
                <Skeleton className="h-8 w-8 mb-4 rounded" />
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-20 w-full mb-6" />
                <Skeleton className="h-4 w-1/3 mb-4" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-2/3 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Explores Grid */}
        {!exploresLoading && !exploresError && explores.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {explores.map((explore) => {
              const place = places.find((p) => p.place_id === explore.place_id);
              // Generate random avatar for visual appeal
              const avatarSeed = explore.explore_id;
              const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;
              
              return (
                <div
                  key={explore.explore_id}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
                >
                  {/* Quote Icon */}
                  <FaQuoteLeft className="text-[#148C56] text-3xl mb-4 opacity-50" />

                  {/* Title */}
                  <h3 className="text-xl font-bold text-[#07401F] mb-3 line-clamp-2">
                    {explore.title}
                  </h3>

                  {/* Place Info */}
                  {place && (
                    <div className="flex items-center gap-2 mb-4 text-[#357D52]">
                      <FaMapMarkerAlt className="text-[#148C56]" />
                      <span className="text-sm font-medium">
                        {place.name}
                        {place.city && place.country && (
                          <span className="text-gray-500 ml-1">
                            • {place.city}, {place.country}
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                  {/* Comment */}
                  <p className="text-gray-700 mb-6 italic line-clamp-4">
                    "{explore.content || "An amazing journey worth sharing!"}"
                  </p>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-200">
                    <FaCalendar className="text-[#148C56]" />
                    <span>{formatDate(explore.created_at)}</span>
                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-4">
                    <img
                      src={avatarUrl}
                      alt="Traveler"
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#148C56]"
                    />
                    <div>
                      <p className="font-bold text-[#07401F]">
                        {explore.user_id.substring(0, 15)}...
                      </p>
                      <p className="text-sm text-gray-500">Verified Explorer</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!exploresLoading && !exploresError && explores.length === 0 && (
          <div className="text-center py-16">
            <MdExplore className="text-8xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">
              No Explores Yet
            </h3>
            <p className="text-gray-500 mb-6">
              Be the first to share your journey!
            </p>
            {isAuthenticated && (
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-[#148C56] hover:bg-[#0F6B42]"
              >
                <FaPlus className="mr-2" />
                Share Your Journey
              </Button>
            )}
          </div>
        )}

        {/* Refresh Button */}
        {!exploresLoading && explores.length > 0 && (
          <div className="flex justify-center mt-12">
            <Button
              onClick={() => queryClient.invalidateQueries({ queryKey: ["explores", "random"] })}
              variant="outline"
              size="lg"
              className="border-[#148C56] text-[#148C56] hover:bg-[#148C56] hover:text-white"
            >
              <MdExplore className="mr-2" />
              Load More Random Explores
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

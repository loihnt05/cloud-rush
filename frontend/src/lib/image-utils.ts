/**
 * Utility functions for generating random place images
 */

// Collection of curated Unsplash image URLs for places (using direct photo IDs)
const placeImageIds = [
  'photo-1566073771259-6a8506099945', // luxury hotel
  'photo-1542314831-068cd1dbfeeb', // hotel exterior
  'photo-1571896349842-33c89424de2d', // hotel room
  'photo-1455587734955-081b22074882', // hotel interior
  'photo-1520250497591-112f2f40a3f4', // beach resort
  'photo-1551882547-ff40c63fe5fa', // resort pool
  'photo-1540541338287-41700207dee6', // tropical resort
  'photo-1584132967334-10e028bd69f7', // mountain resort
  'photo-1582719478250-c89cae4dc85b', // boutique hotel
  'photo-1564501049412-61c2a3083791', // city hotel
  'photo-1445019980597-93fa8acb246c', // restaurant hotel
  'photo-1618773928121-c32242e63f39', // luxury villa
  'photo-1615460549969-36fa19521a4f', // hotel lobby
  'photo-1578683010236-d716f9a3f461', // vacation rental
  'photo-1568084680786-a84f91d1153c', // modern hotel
  'photo-1590381105924-c72589b9ef3f', // hotel suite
  'photo-1506929562872-bb421503ef21', // beach destination
  'photo-1559827260-dc66d52bef19', // tourist destination
  'photo-1529290130-4ca3753253ae', // tropical paradise
  'photo-1499793983690-e29da59ef1c2', // beach hotel
];

/**
 * Generates a random Unsplash image URL for a place
 * @param placeId - The place ID to ensure consistent images for the same place
 * @param width - Image width (default: 1200)
 * @param height - Image height (default: 800)
 * @returns Unsplash image URL
 */
export function getRandomPlaceImage(
  placeId: number,
  width: number = 1200,
  height: number = 800
): string {
  // Use place ID to consistently select an image
  const imageIndex = placeId % placeImageIds.length;
  const imageId = placeImageIds[imageIndex];
  
  // Generate image URL using Unsplash Images API with specific photo ID
  return `https://images.unsplash.com/${imageId}?w=${width}&h=${height}&fit=crop&q=80`;
}

/**
 * Generates a random Unsplash image URL with a specific index
 * @param index - The index to select from the image collection
 * @param width - Image width (default: 1200)
 * @param height - Image height (default: 800)
 * @returns Unsplash image URL
 */
export function getPlaceImageByIndex(
  index: number,
  width: number = 1200,
  height: number = 800
): string {
  const safeIndex = index % placeImageIds.length;
  const imageId = placeImageIds[safeIndex];
  return `https://images.unsplash.com/${imageId}?w=${width}&h=${height}&fit=crop&q=80`;
}

/**
 * Get a fallback image URL (luxury hotel)
 */
export function getFallbackPlaceImage(
  width: number = 1200,
  height: number = 800
): string {
  return `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=${width}&h=${height}&fit=crop&q=80`;
}

/**
 * Get all available place images count
 */
export function getPlaceImagesCount(): number {
  return placeImageIds.length;
}

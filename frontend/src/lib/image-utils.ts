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

const carImageIds = [
  "photo-1568844293986-8d0400bd4745", // sport car - BMW
  "photo-1583121274602-3e2820c69888", // classic car - vintage red
  "photo-1549317661-bd32c8ce0db2", // modern car in city - Tesla
  "photo-1519641471654-76ce0107ad1b", // offroad car - SUV
  "photo-1553440569-bcc63803a83d", // race car - Ferrari
  "photo-1492144534655-ae79c964c9d7", // luxury car - Audi
  "photo-1605559424843-9e4c228bf1c2", // modern sedan
  "photo-1614200187524-dc4b892acf16", // car interior luxury
  "photo-1606664515524-ed2f786a0bd6", // electric car
  "photo-1552519507-da3b142c6e3d", // vintage car classic
];

const packageImageIds = [
  "photo-1476514525535-07fb3b4ae5f1", // travel package - tropical beach
  "photo-1530789253388-582c481c54b0", // vacation package - mountain resort
  "photo-1507525428034-b723cf961d3e", // beach vacation package
  "photo-1469854523086-cc02fe5d8800", // adventure package - mountain
  "photo-1488646953014-85cb44e25828", // city tour package
  "photo-1506905925346-21bda4d32df4", // nature package - mountain lake
  "photo-1500835556837-99ac94a94552", // romantic package - paris
  "photo-1502920917128-1aa500764cbd", // island hopping package
  "photo-1527631746610-bca00a040d60", // cruise package - yacht
  "photo-1501594907352-04cda38ebc29", // safari package - africa
  "photo-1504150558240-0b4fd8946624", // ski resort package
  "photo-1513407030348-c983a97b98d8", // cultural tour package
  "photo-1533105079780-92b9be482077", // beach resort package
  "photo-1510414842594-a61c69b5ae57", // wellness package - spa
  "photo-1528127269322-539801943592", // luxury travel package
];

const hotelImageIds = [
  "photo-1566073771259-6a8506099945", // luxury hotel exterior
  "photo-1542314831-068cd1dbfeeb", // modern hotel building
  "photo-1571896349842-33c89424de2d", // elegant hotel room
  "photo-1455587734955-081b22074882", // hotel lobby luxury
  "photo-1520250497591-112f2f40a3f4", // beach resort hotel
  "photo-1551882547-ff40c63fe5fa", // hotel pool area
  "photo-1540541338287-41700207dee6", // tropical resort hotel
  "photo-1584132967334-10e028bd69f7", // mountain hotel resort
  "photo-1582719478250-c89cae4dc85b", // boutique hotel exterior
  "photo-1564501049412-61c2a3083791", // city hotel night
  "photo-1445019980597-93fa8acb246c", // hotel restaurant
  "photo-1618773928121-c32242e63f39", // luxury villa hotel
  "photo-1615460549969-36fa19521a4f", // grand hotel lobby
  "photo-1578683010236-d716f9a3f461", // boutique hotel room
  "photo-1568084680786-a84f91d1153c", // modern hotel design
  "photo-1590381105924-c72589b9ef3f", // luxury hotel suite
  "photo-1549294413-26f195200c16", // hotel with pool view
  "photo-1496417263034-38ec4f0b665a", // seaside hotel
  "photo-1512918728675-ed5a9ecdebfd", // resort hotel aerial
  "photo-1517840901100-8179e982acb7", // hotel spa wellness
];

/**
 * Generates a random Unsplash image URL for a place
 * @param placeId - The place ID to ensure consistent images for the same place
 * @param width - Image width (default: 800)
 * @param height - Image height (default: 600)
 * @returns Unsplash image URL
 */
export function getRandomPlaceImage(
  placeId: number,
  width: number = 800,
  height: number = 600
): string {
  // Use place ID to consistently select an image
  const imageIndex = placeId % placeImageIds.length;
  const imageId = placeImageIds[imageIndex];
  
  // Generate optimized image URL with correct Unsplash format
  return `https://images.unsplash.com/${imageId}?w=${width}&h=${height}&fit=crop&q=75&auto=format`;
}


export function getRandomCarImage(
  carId?: number,
  width: number = 1200,
  height: number = 800
): string {
  // If carId is given, use it to pick a deterministic image
  const imageIndex = carId !== undefined
    ? carId % carImageIds.length
    : Math.floor(Math.random() * carImageIds.length);

  const imageId = carImageIds[imageIndex];
  return `https://images.unsplash.com/${imageId}?w=${width}&h=${height}&fit=crop&q=80`;
}

/**
 * Generates a random Unsplash image URL for a package
 * @param packageId - The package ID to ensure consistent images for the same package
 * @param width - Image width (default: 1200)
 * @param height - Image height (default: 800)
 * @returns Unsplash image URL
 */
export function getRandomPackageImage(
  packageId?: number,
  width: number = 1200,
  height: number = 800
): string {
  // If packageId is given, use it to pick a deterministic image
  const imageIndex = packageId !== undefined
    ? packageId % packageImageIds.length
    : Math.floor(Math.random() * packageImageIds.length);

  const imageId = packageImageIds[imageIndex];
  return `https://images.unsplash.com/${imageId}?w=${width}&h=${height}&fit=crop&q=80`;
}

/**
 * Generates a random Unsplash image URL for a hotel
 * @param hotelId - The hotel ID to ensure consistent images for the same hotel
 * @param width - Image width (default: 1200)
 * @param height - Image height (default: 800)
 * @returns Unsplash image URL
 */
export function getRandomHotelImage(
  hotelId?: number,
  width: number = 1200,
  height: number = 800
): string {
  // If hotelId is given, use it to pick a deterministic image
  const imageIndex = hotelId !== undefined
    ? hotelId % hotelImageIds.length
    : Math.floor(Math.random() * hotelImageIds.length);

  const imageId = hotelImageIds[imageIndex];
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

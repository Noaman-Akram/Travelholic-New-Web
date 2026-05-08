// Travelholic data shapes — match the brief exactly.

export type Locale = "en" | "ar";
export type Bilingual = { en: string; ar: string };
export type BilingualArr = { en: string[]; ar: string[] };

export type Destination = {
  slug: string;
  name: Bilingual;
  shortPitch: Bilingual;
  longDescription: Bilingual;
  heroImage: string;
  thumbnail: string;
  homeCount: number;
  startingNightlyEGP: number;
  coordinates: { lat: number; lng: number };
  category: "urban" | "suburban" | "beach" | "desert";
};

export type ReviewSource = "direct" | "airbnb" | "booking";

export type Review = {
  guestName: string;
  guestCountry: string;
  rating: number; // 0–5
  date: string; // ISO
  text: Bilingual;
  source: ReviewSource;
};

export type HomeType = "studio" | "1br" | "2br" | "3br" | "penthouse";
export type HomeStatus = "available" | "limited" | "unavailable";

export type AmenityKey =
  | "wifi"
  | "smartLock"
  | "workspace"
  | "kitchen"
  | "ac"
  | "tv"
  | "washer"
  | "dryer"
  | "pool"
  | "gym"
  | "parking"
  | "balcony"
  | "seaView"
  | "petFriendly"
  | "elevator"
  | "security"
  | "cleaningService"
  | "linens"
  | "coffee"
  | "iron";

export type Home = {
  slug: string;
  title: Bilingual;
  destinationSlug: string;
  type: HomeType;
  capacity: { guests: number; bedrooms: number; beds: number; baths: number };
  pricing: {
    nightlyEGP: number;
    weeklyDiscountPct: number;
    monthlyDiscountPct: number;
    cleaningFeeEGP: number;
    otaPriceEGP?: number;
  };
  amenities: AmenityKey[];
  highlights: BilingualArr;
  description: Bilingual;
  gallery: { src: string; alt: string }[];
  floorPlan?: string;
  houseRules: BilingualArr;
  nearbyPlaces: {
    name: string;
    distanceKm: number;
    category: "cafe" | "restaurant" | "metro" | "beach" | "mall" | "hospital";
  }[];
  reviews: Review[];
  rating: number;
  reviewCount: number;
  smartCheckIn: boolean;
  instantBook: boolean;
  coordinates: { lat: number; lng: number };
  status: HomeStatus;
};

export type ExperienceCategory =
  | "concierge"
  | "transport"
  | "wellness"
  | "culture"
  | "corporate"
  | "long-stay";

export type Experience = {
  slug: string;
  title: Bilingual;
  category: ExperienceCategory;
  icon: string; // lucide icon key
  description: Bilingual;
  image: string;
};

export type StoryCategory =
  | "neighborhood"
  | "local-culture"
  | "travel-tips"
  | "inside-travelholic";

export type Story = {
  slug: string;
  title: Bilingual;
  excerpt: Bilingual;
  body: Bilingual;
  cover: string;
  category: StoryCategory;
  publishedAt: string;
  readMinutes: number;
};

/**
 * Subset of Hostify API types we actually consume.
 * Source: https://api-rms.hostify.com/ (docs: go.hostify.com/docs)
 *
 * The full Hostify Listing object has 100+ fields. We only model what we
 * surface on the marketing site. Unmodelled fields are accessed via
 * `Record<string, unknown>` extension where useful.
 */

export type HostifyEnvelope<T> = {
  success: boolean;
  total?: number;
  page?: number;
  next_page?: number | null;
} & T;

export type HostifyListingSummary = {
  id: number;
  channel_listing_id?: number;
  name: string;
  nickname?: string | null;
  currency: string;
  default_daily_price: number | null;
  weekend_price: number | null;
  weekly_price_factor: number | null;
  monthly_price_factor: number | null;
  cleaning_fee: number | null;
  security_deposit: number | null;
  pets_fee: number | null;
  extra_person: number | null;
  guests_included: number | null;
  min_nights: number | null;
  max_nights: number | null;
  bedrooms: number | null;
  beds: number | null;
  bathrooms: number | null;
  person_capacity: number | null;
  area: number | null;
  cancel_policy: number | null;
  property_type: string | null;
  property_type_id?: number | null;
  room_type: number | null;
  listing_type: number | null;
  instant_booking: string | null;
  thumbnail_file: string | null;
  is_listed: number | null;
  country: string | null;
  countrycode: string | null;
  state: string | null;
  city: string | null;
  city_id: number | null;
  zipcode: string | number | null;
  street: string | null;
  neighbourhood: string | null;
  lat: number | null;
  lng: number | null;
  tags: string | null;
  parent_listing_id: number | null;
  integration_id?: number | null;
  symbol?: string;
  price?: number;
  price_monthly?: number;
};

export type HostifyPhoto = {
  id: number;
  thumbnail_file: string | null;
  original_file: string | null;
  description: string | null;
  img_type?: string | null;
};

export type HostifyAmenity = {
  id: number;
  name: string;
  description?: string | null;
};

export type HostifyRoom = {
  id: number;
  name: string;
  room_type: string | null;
  person_capacity: string | number | null;
  shared?: number;
};

export type HostifyDescription = {
  name?: string | null;
  summary?: string | null;
  space?: string | null;
  interaction?: string | null;
  notes?: string | null;
  neighborhood_overview?: string | null;
  house_rules?: string | null;
  house_manual?: string | null;
  description?: string | null;
  access?: string | null;
  transit?: string | null;
};

export type HostifyRating = {
  reviews?: number | null;
  rating?: number | null;
  accuracy_rating?: number | null;
  checkin_rating?: number | null;
  clean_rating?: number | null;
  communication_rating?: number | null;
  location_rating?: number | null;
  value_rating?: number | null;
};

export type HostifyReview = {
  id: number;
  comments?: string | null;
  rating?: number | null;
  created?: string | null;
  guest_id?: number | null;
};

export type HostifyListingFull = HostifyListingSummary & {
  photos?: HostifyPhoto[];
  amenities?: HostifyAmenity[];
  rooms?: HostifyRoom[];
  description?: HostifyDescription;
  rating?: HostifyRating;
  reviews?: HostifyReview[];
};

export type HostifyListingsResponse = HostifyEnvelope<{
  listings: HostifyListingSummary[];
}>;

export type HostifyListingResponse = HostifyEnvelope<{
  listing: HostifyListingSummary;
  photos?: HostifyPhoto[];
  amenities?: HostifyAmenity[];
  rooms?: HostifyRoom[];
  description?: HostifyDescription;
  rating?: HostifyRating;
  reviews?: HostifyReview[];
}>;

export type HostifyPriceQuote = {
  available?: boolean;
  nights?: number;
  price?: number;
  base_price?: number;
  cleaning_fee?: number;
  total?: number;
  iso_code?: string;
  symbol?: string;
  is_listed?: number;
  channel_listing_id?: number;
  person_capacity?: number;
  guests_included?: number;
};

export type HostifyPriceResponse = HostifyEnvelope<{
  price: HostifyPriceQuote;
}>;

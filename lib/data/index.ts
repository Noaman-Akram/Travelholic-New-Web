import { destinations } from "./destinations";
import { homes } from "./homes";
import { experiences } from "./experiences";
import { stories } from "./stories";

export { destinations, homes, experiences, stories };
export type {
  Destination,
  Home,
  Review,
  Experience,
  Story,
  Bilingual,
  BilingualArr,
  AmenityKey,
  HomeType,
  HomeStatus,
  ReviewSource,
  ExperienceCategory,
  StoryCategory,
  Locale,
} from "./types";

export function getDestinationBySlug(slug: string) {
  return destinations.find((d) => d.slug === slug);
}

export function getHomeBySlug(slug: string) {
  return homes.find((h) => h.slug === slug);
}

export function getStoryBySlug(slug: string) {
  return stories.find((s) => s.slug === slug);
}

export function getHomesByDestination(destinationSlug: string) {
  return homes.filter((h) => h.destinationSlug === destinationSlug);
}

export function getFeaturedHomes(limit = 8) {
  return [...homes]
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, limit);
}

export function getFeaturedDestinations() {
  return destinations;
}

export function getRecentStories(limit = 4) {
  return [...stories]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, limit);
}

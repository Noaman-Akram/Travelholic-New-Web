/**
 * Client-safe data exports. For server-only async helpers (getAllHomes,
 * getHomeBySlug, etc.) import from `@/lib/data/server`.
 */

import { destinations } from "./destinations";
import { homes } from "./homes";
import { experiences } from "./experiences";
import { stories } from "./stories";

export { destinations, experiences, stories, homes };
export type {
  Destination,
  Area,
  AreaSlug,
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

// ---- Sync helpers (no live data) -------------------------------------------

export function getDestinationBySlug(slug: string) {
  return destinations.find((d) => d.slug === slug);
}

export function getStoryBySlug(slug: string) {
  return stories.find((s) => s.slug === slug);
}

export function getFeaturedDestinations() {
  return destinations;
}

export function getRecentStories(limit = 4) {
  return [...stories]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, limit);
}

// ---- Hostify metadata accessors (safe in client + server) ------------------

import type { Home } from "./types";

export function homeHostifyPrimaryId(home: Home): number | undefined {
  return (home as Home & { hostifyPrimaryId?: number }).hostifyPrimaryId;
}

export function homeHostifyIds(home: Home): number[] {
  return (home as Home & { hostifyIds?: number[] }).hostifyIds ?? [];
}

export function homeHostifyUnitCount(home: Home): number {
  return (home as Home & { hostifyUnitCount?: number }).hostifyUnitCount ?? 1;
}

import "server-only";

import { unstable_cache } from "next/cache";
import {
  createGitHubClient,
  createGitHubDataBoundary,
  GITHUB_USERNAME,
  REVALIDATE,
  type GitHubData,
  type GitHubFetch,
} from "./github-core";

export { REVALIDATE } from "./github-core";
export type {
  ContributionLevel,
  FeaturedRepositoryName,
  GitHubCommit,
  GitHubContributionDay,
  GitHubContributions,
  GitHubData,
  GitHubLanguage,
  GitHubLanguages,
  GitHubPushEvent,
  GitHubRepository,
} from "./github-core";

function client() {
  return createGitHubClient({
    fetch: ((url, init) => fetch(url, init)) satisfies GitHubFetch,
    token: process.env.GITHUB_TOKEN,
  });
}

// Throwing cache loaders preserve the last successful entry during failed revalidation.
const cacheOptions = { revalidate: REVALIDATE };
const source = process.env.GITHUB_TOKEN?.trim() ? "auth" : "public";
const contributions = unstable_cache(
  () => client().getContributions(), ["github-v2", GITHUB_USERNAME, "contributions", source], cacheOptions,
);
const pins = unstable_cache(
  () => client().getPinnedRepositories(), ["github-v2", GITHUB_USERNAME, "pins", source], cacheOptions,
);
const pushes = unstable_cache(
  () => client().getRecentPushes(), ["github-v2", GITHUB_USERNAME, "pushes"], cacheOptions,
);
const languages = unstable_cache(
  () => client().getLanguages(), ["github-v2", GITHUB_USERNAME, "languages", source], cacheOptions,
);
const featured = {
  SkillVector: unstable_cache(
    () => client().getFeaturedRepository("SkillVector"),
    ["github-v2", GITHUB_USERNAME, "featured", "SkillVector"], cacheOptions,
  ),
  "flash-resume": unstable_cache(
    () => client().getFeaturedRepository("flash-resume"),
    ["github-v2", GITHUB_USERNAME, "featured", "flash-resume"], cacheOptions,
  ),
  CodeAtlas: unstable_cache(
    () => client().getFeaturedRepository("CodeAtlas"),
    ["github-v2", GITHUB_USERNAME, "featured", "CodeAtlas"], cacheOptions,
  ),
};

// Keep error fallbacks outside the cache so unavailable data never replaces a successful entry.
const renderData = createGitHubDataBoundary({
  getContributions: contributions,
  getPinnedRepositories: pins,
  getRecentPushes: pushes,
  getLanguages: languages,
  getFeaturedRepository: (name) => featured[name](),
}, () => Boolean(process.env.GITHUB_TOKEN?.trim()));

export async function getGitHubData(): Promise<GitHubData> {
  return renderData();
}

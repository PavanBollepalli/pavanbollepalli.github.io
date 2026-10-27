export const REVALIDATE = 21_600;
export const GITHUB_USERNAME = "PavanBollepalli";
export const FEATURED_REPOSITORIES = ["SkillVector", "flash-resume", "CodeAtlas"] as const;

export type FeaturedRepositoryName = (typeof FEATURED_REPOSITORIES)[number];
export type ContributionLevel =
  | "NONE"
  | "FIRST_QUARTILE"
  | "SECOND_QUARTILE"
  | "THIRD_QUARTILE"
  | "FOURTH_QUARTILE";

export interface GitHubContributionDay {
  date: string;
  count: number;
  level: ContributionLevel;
}

export interface GitHubContributions {
  from: string;
  to: string;
  total: number;
  days: GitHubContributionDay[];
}

export interface GitHubRepository {
  name: string;
  fullName: string;
  htmlUrl: string;
  description: string | null;
  stars: number;
  forks: number;
  primaryLanguage: string | null;
  updatedAt: string;
  topics: string[];
}

export interface GitHubCommit {
  sha: string;
  message: string | null;
  htmlUrl: string;
}

export interface GitHubPushEvent {
  id: string;
  repository: string;
  repositoryUrl: string;
  branch: string | null;
  createdAt: string;
  head: string | null;
  // Only GitHub's explicit payload size; never inferred from sampled commits.
  commitCount: number | null;
  commits: GitHubCommit[];
  // Branch-window commits are observed candidates, not a verified push manifest.
  commitSource: "event" | "head" | "branch-window" | "unavailable";
}

export interface GitHubLanguage {
  name: string;
  value: number;
  percentage: number;
}

export interface GitHubLanguages {
  basis: "bytes" | "repositories";
  repositoryCount: number;
  items: GitHubLanguage[];
}

/** null means unavailable, while an empty items array means a successful, genuinely empty response. */
export interface GitHubData {
  username: typeof GITHUB_USERNAME;
  contributions: GitHubContributions | null;
  pinnedRepositories: GitHubRepository[] | null;
  recentPushes: GitHubPushEvent[] | null;
  featuredRepositories: Record<FeaturedRepositoryName, GitHubRepository | null>;
  languages: GitHubLanguages | null;
}

export interface GitHubRequestInit extends RequestInit {
  next: { revalidate: number };
}

export interface GitHubResponse {
  ok: boolean;
  status: number;
  headers: { get(name: string): string | null };
  json(): Promise<unknown>;
  text(): Promise<string>;
}

export type GitHubFetch = (url: string, init: GitHubRequestInit) => Promise<GitHubResponse>;

export interface GitHubClientOptions {
  fetch: GitHubFetch;
  // Injected by the server adapter only; the core never reads environment variables.
  token?: string;
  now?: () => Date;
}

export interface GitHubClient {
  getContributions(): Promise<GitHubContributions>;
  getPinnedRepositories(): Promise<GitHubRepository[]>;
  getRecentPushes(): Promise<GitHubPushEvent[]>;
  getFeaturedRepository(name: FeaturedRepositoryName): Promise<GitHubRepository>;
  getLanguages(): Promise<GitHubLanguages>;
}

export type GitHubErrorCode = "http" | "transport" | "invalid-response" | "graphql" | "token-missing";

/** Deliberately excludes response bodies, headers, URLs, tokens, and nested causes. */
export class GitHubDataError extends Error {
  readonly code: GitHubErrorCode;
  readonly status?: number;

  constructor(code: GitHubErrorCode, status?: number) {
    super(`GitHub data unavailable (${code}).`);
    this.name = "GitHubDataError";
    this.code = code;
    this.status = status;
  }
}

const API = "https://api.github.com";
const WEB = "https://github.com";
const LEVELS: readonly ContributionLevel[] = ["NONE", "FIRST_QUARTILE", "SECOND_QUARTILE", "THIRD_QUARTILE", "FOURTH_QUARTILE"];
const SEGMENT = /^[a-zA-Z0-9_.-]+$/;
const SHA = /^[a-f0-9]{7,64}$/i;

type JsonObject = Record<string, unknown>;

function invalid(): never {
  throw new GitHubDataError("invalid-response");
}

function object(value: unknown): JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) invalid();
  return value as JsonObject;
}

function array(value: unknown): unknown[] {
  if (!Array.isArray(value)) invalid();
  return value;
}

function text(value: unknown): string {
  if (typeof value !== "string") invalid();
  return value;
}

function nonempty(value: unknown): string {
  const result = text(value);
  if (!result.trim()) invalid();
  return result;
}

function nullableText(value: unknown): string | null {
  return value === null ? null : text(value);
}

function count(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) invalid();
  return value;
}

function timestamp(value: unknown): string {
  const result = text(value);
  if (!/^\d{4}-\d{2}-\d{2}T/.test(result) || !Number.isFinite(Date.parse(result))) invalid();
  return result;
}

function calendarDate(value: unknown): string {
  const result = text(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result)) invalid();
  const date = new Date(`${result}T00:00:00.000Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== result) invalid();
  return result;
}

function repositoryName(value: unknown): string {
  const result = nonempty(value);
  const parts = result.split("/");
  if (parts.length !== 2 || parts.some((part) => !SEGMENT.test(part) || part === "." || part === "..")) invalid();
  return result;
}

function githubUrl(value: unknown, path: string): string {
  const result = text(value);
  let url: URL;
  try {
    url = new URL(result);
  } catch {
    return invalid();
  }
  if (url.protocol !== "https:" || url.hostname !== "github.com" || url.port || url.username || url.password ||
      url.search || url.hash || url.pathname.toLowerCase() !== path.toLowerCase()) invalid();
  return result;
}

function sha(value: unknown): string {
  const result = text(value);
  if (!SHA.test(result)) invalid();
  return result;
}

function restRepositoryByFullName(value: unknown, expectedFullName: string): GitHubRepository {
  const repo = object(value);
  const fullName = repositoryName(repo.full_name);
  const expected = repositoryName(expectedFullName);
  const name = nonempty(repo.name);
  if (fullName.toLowerCase() !== expected.toLowerCase() ||
      name.toLowerCase() !== expected.split("/")[1].toLowerCase() || repo.private !== false) invalid();
  return {
    name,
    fullName,
    htmlUrl: githubUrl(repo.html_url, `/${fullName}`),
    description: nullableText(repo.description),
    stars: count(repo.stargazers_count),
    forks: count(repo.forks_count),
    primaryLanguage: nullableText(repo.language),
    updatedAt: timestamp(repo.updated_at),
    topics: array(repo.topics).map(nonempty),
  };
}

function restRepository(value: unknown, expectedName: string): GitHubRepository {
  return restRepositoryByFullName(value, `${GITHUB_USERNAME}/${expectedName}`);
}

function pinnedRepository(value: unknown): GitHubRepository {
  const repo = object(value);
  const fullName = repositoryName(repo.nameWithOwner);
  const name = nonempty(repo.name);
  if (fullName.split("/")[1] !== name || repo.isPrivate !== false) invalid();
  return {
    name,
    fullName,
    htmlUrl: githubUrl(repo.url, `/${fullName}`),
    description: nullableText(repo.description),
    stars: count(repo.stargazerCount),
    forks: count(repo.forkCount),
    primaryLanguage: repo.primaryLanguage === null ? null : nonempty(object(repo.primaryLanguage).name),
    updatedAt: timestamp(repo.updatedAt),
    topics: array(object(repo.repositoryTopics).nodes).map((node) => nonempty(object(object(node).topic).name)),
  };
}

function attributes(source: string): Record<string, string> {
  const result: Record<string, string> = {};
  const pattern = /([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  for (const match of source.matchAll(pattern)) result[match[1].toLowerCase()] = match[2] ?? match[3];
  return result;
}

function hasClass(attrs: Record<string, string>, name: string): boolean {
  return (attrs.class ?? "").split(/\s+/).includes(name);
}

function formattedCount(value: string): number {
  const normalized = value.trim();
  if (!/^(?:0|[1-9]\d*|[1-9]\d{0,2}(?:,\d{3})+)$/.test(normalized)) invalid();
  return count(Number(normalized.replaceAll(",", "")));
}

function contributionCount(label: string): number {
  const normalized = label.replace(/\s+/g, " ").trim();
  if (/^No contributions on .+\.$/.test(normalized)) return 0;
  const match = normalized.match(/^([\d,]+) (contribution|contributions) on .+\.$/);
  if (!match) invalid();
  const result = formattedCount(match[1]);
  if ((result === 1) !== (match[2] === "contribution")) invalid();
  return result;
}

function publicCalendar(html: string): GitHubContributions {
  const tooltips = new Map<string, number>();
  for (const match of html.matchAll(/<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/gi)) {
    const target = attributes(match[1]).for;
    if (!target) continue;
    if (tooltips.has(target)) invalid();
    tooltips.set(target, contributionCount(match[2].replace(/<[^>]*>/g, "")));
  }

  const seen = new Set<string>();
  const days: GitHubContributionDay[] = [];
  for (const match of html.matchAll(/<td\b([^>]*)>/gi)) {
    const attrs = attributes(match[1]);
    if (!hasClass(attrs, "ContributionCalendar-day") || attrs["data-date"] === undefined) continue;
    const date = calendarDate(attrs["data-date"]);
    const id = nonempty(attrs.id);
    const rawLevel = attrs["data-level"];
    if (!/^[0-4]$/.test(rawLevel ?? "") || seen.has(date) || !tooltips.has(id)) invalid();
    const level = LEVELS[Number(rawLevel)];
    const dayCount = count(tooltips.get(id));
    if ((level === "NONE") !== (dayCount === 0)) invalid();
    seen.add(date);
    days.push({ date, count: dayCount, level });
  }
  if (days.length < 300) invalid();
  days.sort((a, b) => a.date.localeCompare(b.date));

  let total: number | undefined;
  for (const match of html.matchAll(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi)) {
    if (attributes(match[1]).id !== "js-contribution-activity-description") continue;
    if (total !== undefined) invalid();
    const label = match[2].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    const totalMatch = label.match(/^([\d,]+) contributions? in the last year$/);
    if (!totalMatch) invalid();
    total = formattedCount(totalMatch[1]);
  }
  if (total === undefined) invalid();
  return {
    from: `${days[0].date}T00:00:00.000Z`,
    to: `${days[days.length - 1].date}T00:00:00.000Z`,
    total,
    days,
  };
}

function pinnedNames(html: string): string[] {
  const names: string[] = [];
  const seen = new Set<string>();
  for (const item of html.matchAll(/<li\b([^>]*)>([\s\S]*?)<\/li>/gi)) {
    if (!hasClass(attributes(item[1]), "pinned-item-list-item")) continue;
    const matches: string[] = [];
    for (const anchor of item[2].matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
      if (!/<span\b[^>]*class=(?:"[^"]*\brepo\b[^"]*"|'[^']*\brepo\b[^']*')[^>]*>/i.test(anchor[2])) continue;
      const href = attributes(anchor[1]).href;
      const hrefMatch = href?.match(/^\/([^/?#]+)\/([^/?#]+)$/);
      if (!hrefMatch) invalid();
      matches.push(repositoryName(`${hrefMatch[1]}/${hrefMatch[2]}`));
    }
    if (matches.length !== 1 || seen.has(matches[0])) invalid();
    seen.add(matches[0]);
    names.push(matches[0]);
    if (names.length > 6) invalid();
  }
  return names;
}

interface RawPush {
  id: string;
  repository: string;
  branch: string | null;
  createdAt: string;
  head: string | null;
  commitCount: number | null;
  commits: GitHubCommit[] | null;
}

function eventCommit(value: unknown, repository: string): GitHubCommit {
  const commit = object(value);
  const commitSha = sha(commit.sha);
  return {
    sha: commitSha,
    message: commit.message == null ? null : text(commit.message),
    htmlUrl: `https://github.com/${repository}/commit/${commitSha}`,
  };
}

function pushEvent(value: unknown): RawPush | null {
  const event = object(value);
  if (typeof event.type !== "string") invalid();
  if (event.type !== "PushEvent") return null;
  if (event.public !== true) return null;
  const payload = object(event.payload);
  const repository = repositoryName(object(event.repo).name);
  const ref = payload.ref == null ? null : nonempty(payload.ref);
  return {
    id: nonempty(event.id),
    repository,
    branch: ref?.startsWith("refs/heads/") && ref.length > 11 ? ref.slice(11) : null,
    createdAt: timestamp(event.created_at),
    head: payload.head == null ? null : sha(payload.head),
    commitCount: payload.size == null ? null : count(payload.size),
    commits: payload.commits == null ? null : array(payload.commits).map((commit) => eventCommit(commit, repository)),
  };
}

function restCommit(value: unknown, repository: string): { commit: GitHubCommit; committedAt: string } {
  const result = object(value);
  const details = object(result.commit);
  const commitSha = sha(result.sha);
  return {
    commit: {
      sha: commitSha,
      message: text(details.message),
      htmlUrl: githubUrl(result.html_url, `/${repository}/commit/${commitSha}`),
    },
    committedAt: timestamp(object(details.committer).date),
  };
}

export function createGitHubClient(options: GitHubClientOptions): GitHubClient {
  const token = options.token?.trim();

  async function request(path: string, graphql?: { query: string; variables: JsonObject }): Promise<{ data: unknown; response: GitHubResponse }> {
    if (graphql && !token) throw new GitHubDataError("token-missing");
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "PavanBollepalli-Portfolio",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (graphql) headers["Content-Type"] = "application/json";
    let response: GitHubResponse;
    try {
      response = await options.fetch(`${API}${path}`, {
        method: graphql ? "POST" : "GET",
        signal: AbortSignal.timeout(10_000),
        headers,
        ...(graphql ? { body: JSON.stringify(graphql) } : {}),
        next: { revalidate: REVALIDATE },
      });
    } catch {
      throw new GitHubDataError("transport");
    }
    if (!response.ok) throw new GitHubDataError("http", response.status);
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new GitHubDataError("invalid-response");
    }
    return { data, response };
  }

  async function requestHtml(path: string): Promise<string> {
    let response: GitHubResponse;
    try {
      response = await options.fetch(`${WEB}${path}`, {
        method: "GET",
        signal: AbortSignal.timeout(10_000),
        headers: { "User-Agent": "PavanBollepalli-Portfolio" },
        next: { revalidate: REVALIDATE },
      });
    } catch {
      throw new GitHubDataError("transport");
    }
    if (!response.ok) throw new GitHubDataError("http", response.status);
    try {
      return await response.text();
    } catch {
      throw new GitHubDataError("invalid-response");
    }
  }

  async function graph(query: string, variables: JsonObject): Promise<JsonObject> {
    const { data } = await request("/graphql", { query, variables });
    const envelope = object(data);
    if (envelope.errors != null && array(envelope.errors).length > 0) throw new GitHubDataError("graphql");
    const user = object(object(envelope.data).user);
    if (nonempty(user.login).toLowerCase() !== GITHUB_USERNAME.toLowerCase()) invalid();
    return user;
  }

  function hasNext(response: GitHubResponse, length: number, page: number, path: string): boolean {
    const link = response.headers.get("link");
    if (!link) return length === 100;
    const next = link.split(",").find((part) => /;\s*rel="next"/.test(part));
    if (!next) return false;
    const match = next.match(/<([^>]+)>/);
    if (!match) invalid();
    let url: URL;
    try {
      url = new URL(match[1]);
    } catch {
      return invalid();
    }
    if (url.origin !== API || url.username || url.password || url.pathname !== path ||
        url.searchParams.get("page") !== String(page + 1)) invalid();
    // Never follow externally supplied URLs; only request our own next page.
    return true;
  }

  async function getContributions(): Promise<GitHubContributions> {
    if (!token) return publicCalendar(await requestHtml(`/users/${GITHUB_USERNAME}/contributions`));

    const end = new Date((options.now?.() ?? new Date()).getTime());
    if (!Number.isFinite(end.getTime())) invalid();
    const start = new Date(end);
    // Clamp leap day rather than letting Date roll into March.
    const year = end.getUTCFullYear() - 1;
    const month = end.getUTCMonth();
    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    start.setUTCDate(1);
    start.setUTCFullYear(year);
    start.setUTCMonth(month);
    start.setUTCDate(Math.min(end.getUTCDate(), lastDay));
    const from = start.toISOString();
    const to = end.toISOString();
    const user = await graph(`query Contributions($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        login
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks { contributionDays { date contributionCount contributionLevel } }
          }
        }
      }
    }`, { login: GITHUB_USERNAME, from, to });
    const calendar = object(object(user.contributionsCollection).contributionCalendar);
    const seen = new Set<string>();
    const days = array(calendar.weeks).flatMap((week) => array(object(week).contributionDays).map((value) => {
      const day = object(value);
      const date = calendarDate(day.date);
      const level = text(day.contributionLevel);
      if (!LEVELS.includes(level as ContributionLevel) || seen.has(date) || date < from.slice(0, 10) || date > to.slice(0, 10)) invalid();
      seen.add(date);
      return { date, count: count(day.contributionCount), level: level as ContributionLevel };
    })).sort((a, b) => a.date.localeCompare(b.date));
    return { from, to, total: count(calendar.totalContributions), days };
  }

  async function getPinnedRepositories(): Promise<GitHubRepository[]> {
    if (!token) {
      const names = pinnedNames(await requestHtml(`/${GITHUB_USERNAME}`));
      return Promise.all(names.map(async (name) => {
        const { data } = await request(`/repos/${name}`);
        return restRepositoryByFullName(data, name);
      }));
    }
    const user = await graph(`query Pins($login: String!) {
      user(login: $login) {
        login
        pinnedItems(first: 6, types: REPOSITORY) {
          nodes { ... on Repository {
            name nameWithOwner url description stargazerCount forkCount isPrivate updatedAt
            primaryLanguage { name }
            repositoryTopics(first: 10) { nodes { topic { name } } }
          } }
        }
      }
    }`, { login: GITHUB_USERNAME });
    return array(object(user.pinnedItems).nodes).map(pinnedRepository);
  }

  async function enrichPush(push: RawPush, all: RawPush[]): Promise<GitHubPushEvent> {
    let commits = push.commits ?? [];
    let commitSource: GitHubPushEvent["commitSource"] = push.commits?.length ? "event" : "unavailable";
    const base = {
      id: push.id,
      repository: push.repository,
      repositoryUrl: `https://github.com/${push.repository}`,
      branch: push.branch,
      createdAt: push.createdAt,
      head: push.head,
      commitCount: push.commitCount,
    };
    if (push.head && (!commits.length || commits.some((commit) => commit.message === null))) {
      const { data } = await request(`/repos/${push.repository}/commits/${encodeURIComponent(push.head)}`);
      const resolved = restCommit(data, push.repository).commit;
      if (resolved.sha.toLowerCase() !== push.head.toLowerCase()) invalid();
      const existing = commits.findIndex((commit) => commit.sha.toLowerCase() === resolved.sha.toLowerCase());
      if (existing >= 0) commits = commits.map((commit, index) => index === existing ? resolved : commit);
      else commits = [...commits, resolved];
      if (commitSource !== "event") commitSource = "head";
    } else if (!commits.length && !push.head && push.branch) {
      const until = Date.parse(push.createdAt);
      const previous = all.find((other) => other.repository === push.repository && other.branch === push.branch &&
        Date.parse(other.createdAt) < until);
      // A branch-window commit is not a verified push manifest; never infer head or count.
      const since = Math.max(previous ? Date.parse(previous.createdAt) : until - 5 * 60_000, until - 5 * 60_000);
      const params = new URLSearchParams({ sha: push.branch, since: new Date(since).toISOString(),
        until: push.createdAt, per_page: "100" });
      const { data } = await request(`/repos/${push.repository}/commits?${params}`);
      const seen = new Set<string>();
      commits = array(data).map((value) => restCommit(value, push.repository))
        .filter(({ committedAt }) => Date.parse(committedAt) > since && Date.parse(committedAt) <= until)
        .map(({ commit }) => commit).filter((commit) => {
          if (seen.has(commit.sha)) return false;
          seen.add(commit.sha);
          return true;
        });
      if (commits.length) commitSource = "branch-window";
    }
    commits = await Promise.all(commits.map(async (entry) => {
      if (entry.message !== null) return entry;
      const { data } = await request(`/repos/${push.repository}/commits/${encodeURIComponent(entry.sha)}`);
      const resolved = restCommit(data, push.repository).commit;
      if (resolved.sha.toLowerCase() !== entry.sha.toLowerCase()) invalid();
      return resolved;
    }));
    // Failed enrichment rejects the cache loader rather than replacing a complete cached result.
    return { ...base, commits, commitSource };
  }

  async function getRecentPushes(): Promise<GitHubPushEvent[]> {
    const pushes: RawPush[] = [];
    const seen = new Set<string>();
    const path = `/users/${GITHUB_USERNAME}/events/public`;
    // GitHub only exposes up to 300 public events, with a maximum of 100/page.
    for (let page = 1; page <= 3; page++) {
      const { data, response } = await request(`${path}?per_page=100&page=${page}`);
      const events = array(data);
      for (const event of events) {
        const push = pushEvent(event);
        if (push && !seen.has(push.id)) {
          seen.add(push.id);
          pushes.push(push);
        }
      }
      if (pushes.length >= 6 || !hasNext(response, events.length, page, path)) break;
    }
    pushes.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    return Promise.all(pushes.slice(0, 6).map((push) => enrichPush(push, pushes)));
  }

  async function getFeaturedRepository(name: FeaturedRepositoryName): Promise<GitHubRepository> {
    if (!FEATURED_REPOSITORIES.includes(name)) invalid();
    const { data } = await request(`/repos/${GITHUB_USERNAME}/${name}`);
    return restRepository(data, name);
  }

  async function getLanguages(): Promise<GitHubLanguages> {
    const repositories = new Map<string, string | null>();
    const path = `/users/${GITHUB_USERNAME}/repos`;
    for (let page = 1; ; page++) {
      if (page > 1_000) invalid();
      const { data, response } = await request(`${path}?type=owner&sort=full_name&per_page=100&page=${page}`);
      const entries = array(data);
      for (const value of entries) {
        const repo = object(value);
        if (typeof repo.private !== "boolean") invalid();
        if (repo.private) continue;
        const fullName = repositoryName(repo.full_name);
        if (fullName.split("/")[0].toLowerCase() !== GITHUB_USERNAME.toLowerCase()) invalid();
        const language = repo.language === null ? null : nonempty(repo.language);
        if (repositories.has(fullName) && repositories.get(fullName) !== language) invalid();
        repositories.set(fullName, language);
      }
      if (!hasNext(response, entries.length, page, path)) break;
    }

    const totals = new Map<string, number>();
    if (!token) {
      for (const language of repositories.values()) {
        if (language !== null) totals.set(language, count((totals.get(language) ?? 0) + 1));
      }
    } else {
      const names = [...repositories.keys()];
      // Bounded concurrency avoids bursting one request per repository at once.
      for (let offset = 0; offset < names.length; offset += 5) {
        const results = await Promise.all(names.slice(offset, offset + 5).map(async (name) => {
          const { data } = await request(`/repos/${name}/languages`);
          return object(data);
        }));
        for (const languages of results) {
          for (const [name, value] of Object.entries(languages)) {
            nonempty(name);
            totals.set(name, count((totals.get(name) ?? 0) + count(value)));
          }
        }
      }
    }
    const total = count([...totals.values()].reduce((sum, value) => sum + value, 0));
    const items = [...totals].map(([name, value]) => ({ name, value, percentage: total ? (value / total) * 100 : 0 }))
      .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
    return { basis: token ? "bytes" : "repositories", repositoryCount: repositories.size, items };
  }

  return { getContributions, getPinnedRepositories, getRecentPushes, getFeaturedRepository, getLanguages };
}

type Sections = Pick<GitHubData, "contributions" | "pinnedRepositories" | "recentPushes" | "languages"> &
  GitHubData["featuredRepositories"];

// Error fallbacks live outside cache loaders so failed refreshes cannot cache null.
export function createGitHubDataBoundary(
  loaders: GitHubClient,
  _hasToken: () => boolean,
): () => Promise<GitHubData> {
  const lastKnownSuccess: Partial<Sections> = {};

  async function section<K extends keyof Sections>(
    key: K,
    loader: () => Promise<NonNullable<Sections[K]>>,
  ): Promise<Sections[K] | null> {
    try {
      const result = await loader();
      lastKnownSuccess[key] = result;
      return result;
    } catch {
      return lastKnownSuccess[key] ?? null;
    }
  }

  return async () => {
    const [contributions, pinnedRepositories, recentPushes, languages, skillVector, flashResume, codeAtlas] =
      await Promise.all([
        section("contributions", () => loaders.getContributions()),
        section("pinnedRepositories", () => loaders.getPinnedRepositories()),
        section("recentPushes", () => loaders.getRecentPushes()),
        section("languages", () => loaders.getLanguages()),
        section("SkillVector", () => loaders.getFeaturedRepository("SkillVector")),
        section("flash-resume", () => loaders.getFeaturedRepository("flash-resume")),
        section("CodeAtlas", () => loaders.getFeaturedRepository("CodeAtlas")),
      ]);
    return {
      username: GITHUB_USERNAME,
      contributions,
      pinnedRepositories,
      recentPushes,
      featuredRepositories: { SkillVector: skillVector, "flash-resume": flashResume, CodeAtlas: codeAtlas },
      languages,
    };
  };
}

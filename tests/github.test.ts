import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createGitHubClient,
  createGitHubDataBoundary,
  FEATURED_REPOSITORIES,
  GITHUB_USERNAME,
  GitHubDataError,
  REVALIDATE,
  type GitHubFetch,
  type GitHubRequestInit,
  type GitHubResponse,
} from "../lib/github-core";

const API = "https://api.github.com";
const NOW = new Date("2026-10-20T12:00:00.000Z");
const HEAD = "a".repeat(40);
const SECOND = "b".repeat(40);
const THIRD = "c".repeat(40);
const REPO = `${GITHUB_USERNAME}/SkillVector`;

function response(data: unknown, status = 200, link: string | null = null): GitHubResponse {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name) => name.toLowerCase() === "link" ? link : null },
    json: async () => data,
  };
}

function transport(handler: (url: URL, init: GitHubRequestInit) => GitHubResponse | Promise<GitHubResponse>) {
  const requests: { url: URL; init: GitHubRequestInit }[] = [];
  const fetch: GitHubFetch = async (input, init) => {
    const url = new URL(input);
    assert.equal(url.origin, API, "tests only accept mocked GitHub API URLs");
    assert.equal(init.next.revalidate, REVALIDATE);
    const headers = new Headers(init.headers);
    assert.equal(headers.get("Accept"), "application/vnd.github+json");
    assert.equal(headers.get("User-Agent"), "PavanBollepalli-Portfolio");
    assert.equal(headers.get("X-GitHub-Api-Version"), "2022-11-28");
    requests.push({ url, init });
    return handler(url, init);
  };
  return { fetch, requests };
}

function repository(name = "SkillVector", stars = 37) {
  return {
    name,
    full_name: `${GITHUB_USERNAME}/${name}`,
    html_url: `https://github.com/${GITHUB_USERNAME}/${name}`,
    private: false,
    description: "Actual API description",
    stargazers_count: stars,
    forks_count: 2,
    language: "TypeScript",
    updated_at: "2026-10-19T10:00:00Z",
    topics: ["portfolio", "typescript"],
  };
}

function pinned(name = "CodeAtlas") {
  return {
    name,
    nameWithOwner: `${GITHUB_USERNAME}/${name}`,
    url: `https://github.com/${GITHUB_USERNAME}/${name}`,
    isPrivate: false,
    description: null,
    stargazerCount: 0,
    forkCount: 0,
    primaryLanguage: { name: "TypeScript" },
    updatedAt: "2026-10-19T10:00:00Z",
    repositoryTopics: { nodes: [{ topic: { name: "developer-tools" } }] },
  };
}

function contributions() {
  return {
    data: {
      user: {
        login: GITHUB_USERNAME,
        contributionsCollection: {
          contributionCalendar: {
            totalContributions: 3,
            weeks: [{ contributionDays: [
              { date: "2026-10-19", contributionCount: 0, contributionLevel: "NONE" },
              { date: "2026-10-20", contributionCount: 3, contributionLevel: "SECOND_QUARTILE" },
            ] }],
          },
        },
      },
    },
  };
}

function push(id = "1", payload: Record<string, unknown> = {
  ref: "refs/heads/main", head: HEAD, size: 1,
  commits: [{ sha: HEAD, message: "Real push message" }],
}, createdAt = "2026-10-20T12:00:00Z") {
  return { id, type: "PushEvent", public: true, repo: { name: REPO }, payload, created_at: createdAt };
}

function commit(commitSha = HEAD, message = "Message from actual commit endpoint", date = "2026-10-20T11:59:00Z") {
  return {
    sha: commitSha,
    html_url: `https://github.com/${REPO}/commit/${commitSha}`,
    commit: { message, committer: { date } },
  };
}

function nextLink(path: string, page: number) {
  return `<${API}${path}?per_page=100&page=${page}>; rel="next"`;
}

function expectCode(code: GitHubDataError["code"]) {
  return (error: unknown) => {
    assert.ok(error instanceof GitHubDataError);
    assert.equal(error.code, code);
    return true;
  };
}

test("successful real-shaped GraphQL calendar and actual pinnedItems; REST metadata retains real zero stars", async () => {
  const mock = transport((url, init) => {
    if (url.pathname === "/graphql") {
      assert.equal(init.method, "POST");
      assert.equal(new Headers(init.headers).get("Authorization"), "Bearer test-secret");
      const body = JSON.parse(String(init.body)) as { query: string; variables: Record<string, string> };
      assert.equal(body.variables.login, GITHUB_USERNAME);
      if (body.query.includes("contributionsCollection")) {
        assert.equal(body.variables.from, "2025-10-20T12:00:00.000Z");
        assert.equal(body.variables.to, NOW.toISOString());
        assert.match(body.query, /contributionsCollection\(from: \$from, to: \$to\)/);
        return response(contributions());
      }
      assert.match(body.query, /pinnedItems\(first: 6, types: REPOSITORY\)/);
      return response({ data: { user: { login: GITHUB_USERNAME, pinnedItems: { nodes: [pinned()] } } } });
    }
    const name = url.pathname.split("/").at(-1)!;
    assert.ok(FEATURED_REPOSITORIES.includes(name as (typeof FEATURED_REPOSITORIES)[number]));
    return response(repository(name, 0));
  });
  const client = createGitHubClient({ fetch: mock.fetch, token: "test-secret", now: () => NOW });
  const [calendar, pins, featured] = await Promise.all([
    client.getContributions(), client.getPinnedRepositories(),
    Promise.all(FEATURED_REPOSITORIES.map((name) => client.getFeaturedRepository(name))),
  ]);
  assert.equal(calendar.total, 3);
  assert.deepEqual(calendar.days, [
    { date: "2026-10-19", count: 0, level: "NONE" },
    { date: "2026-10-20", count: 3, level: "SECOND_QUARTILE" },
  ]);
  assert.equal(pins.length, 1, "pins are not padded or replaced with featured repositories");
  assert.equal(pins[0].name, "CodeAtlas");
  assert.equal(pins[0].stars, 0);
  assert.equal(featured.length, 3);
  assert.ok(featured.every((repo) => repo.stars === 0 && repo.htmlUrl.startsWith("https://github.com/")));
  assert.ok(!JSON.stringify({ calendar, pins, featured }).includes("test-secret"));
});

test("missing or blank token refuses authenticated graphs without any transport request", async () => {
  const mock = transport(() => { throw new Error("must not be called"); });
  for (const token of [undefined, "", "   "]) {
    const client = createGitHubClient({ fetch: mock.fetch, token });
    await assert.rejects(client.getContributions(), expectCode("token-missing"));
    await assert.rejects(client.getPinnedRepositories(), expectCode("token-missing"));
  }
  assert.equal(mock.requests.length, 0);
});

test("REST remains usable without a token and supplies no authorization header", async () => {
  const mock = transport((_url, init) => {
    assert.equal(new Headers(init.headers).has("Authorization"), false);
    return response(repository());
  });
  const repo = await createGitHubClient({ fetch: mock.fetch }).getFeaturedRepository("SkillVector");
  assert.equal(repo.stars, 37);
});

test("last-twelve-month GraphQL range clamps leap day in UTC", async () => {
  const mock = transport((_url, init) => {
    const body = JSON.parse(String(init.body)) as { variables: { from: string; to: string } };
    assert.equal(body.variables.from, "2023-02-28T08:09:10.000Z");
    assert.equal(body.variables.to, "2024-02-29T08:09:10.000Z");
    return response({ data: { user: { login: GITHUB_USERNAME, contributionsCollection: {
      contributionCalendar: { totalContributions: 0, weeks: [] },
    } } } });
  });
  const result = await createGitHubClient({ fetch: mock.fetch, token: "test-secret",
    now: () => new Date("2024-02-29T08:09:10.000Z") }).getContributions();
  assert.deepEqual(result.days, []);
  assert.equal(result.total, 0);
});

test("HTTP failures reject instead of producing an unavailable snapshot that a cache could accept", async () => {
  for (const status of [401, 403, 404, 429, 500]) {
    const mock = transport(() => response({ message: "secret-from-upstream" }, status));
    const client = createGitHubClient({ fetch: mock.fetch, token: "secret-from-upstream" });
    await assert.rejects(client.getFeaturedRepository("SkillVector"), (error: unknown) => {
      assert.ok(error instanceof GitHubDataError);
      assert.equal(error.code, "http");
      assert.equal(error.status, status);
      assert.ok(!String(error).includes("secret-from-upstream"));
      assert.ok(!JSON.stringify(error).includes("secret-from-upstream"));
      return true;
    });
    await assert.rejects(client.getContributions(), expectCode("http"));
    await assert.rejects(client.getRecentPushes(), expectCode("http"));
    await assert.rejects(client.getLanguages(), expectCode("http"));
  }
});

test("HTTP-200 GraphQL errors reject even when partial data is present and never expose error bodies", async () => {
  const mock = transport(() => response({ ...contributions(), errors: [{ message: "test-secret should not escape" }] }));
  const client = createGitHubClient({ fetch: mock.fetch, token: "test-secret" });
  for (const load of [() => client.getContributions(), () => client.getPinnedRepositories()]) {
    await assert.rejects(load(), (error: unknown) => {
      assert.ok(error instanceof GitHubDataError);
      assert.equal(error.code, "graphql");
      assert.ok(!String(error).includes("test-secret"));
      return true;
    });
  }
});

test("transport and invalid JSON failures are sanitized", async () => {
  const throwing: GitHubFetch = async () => { throw new Error("Authorization: Bearer test-secret"); };
  await assert.rejects(createGitHubClient({ fetch: throwing }).getLanguages(), (error: unknown) => {
    assert.ok(error instanceof GitHubDataError);
    assert.equal(error.code, "transport");
    assert.ok(!String(error).includes("test-secret"));
    assert.equal(error.cause, undefined);
    return true;
  });
  const mock = transport(() => ({ ...response(null), json: async () => { throw new Error("test-secret"); } }));
  await assert.rejects(createGitHubClient({ fetch: mock.fetch }).getFeaturedRepository("CodeAtlas"), expectCode("invalid-response"));
});

test("malformed metadata, unsafe URLs, and invented star values fail boundary validation", async () => {
  for (const fields of [
    { stargazers_count: "37" }, { stargazers_count: -1 }, { stargazers_count: 1.5 },
    { stargazers_count: undefined }, { html_url: "javascript:alert(1)" },
    { html_url: "https://github.com.evil.test/PavanBollepalli/SkillVector" },
    { html_url: "https://user:password@github.com/PavanBollepalli/SkillVector" },
    { html_url: "https://github.com/another-owner/SkillVector" },
    { private: true }, { full_name: "PavanBollepalli/../SkillVector" },
  ]) {
    const mock = transport(() => response({ ...repository(), ...fields }));
    await assert.rejects(createGitHubClient({ fetch: mock.fetch }).getFeaturedRepository("SkillVector"), expectCode("invalid-response"));
  }
});

test("malformed calendar levels, counts, dates, duplicates, and unknown users reject", async () => {
  for (const patch of [
    { contributionLevel: "MADE_UP" }, { contributionCount: -1 },
    { contributionCount: "3" }, { date: "2026-02-30" }, { date: "2027-10-20" },
  ]) {
    const data = contributions();
    Object.assign(data.data.user.contributionsCollection.contributionCalendar.weeks[0].contributionDays[0], patch);
    const mock = transport(() => response(data));
    await assert.rejects(createGitHubClient({ fetch: mock.fetch, token: "test", now: () => NOW }).getContributions(),
      expectCode("invalid-response"));
  }
  const duplicate = contributions();
  const days = duplicate.data.user.contributionsCollection.contributionCalendar.weeks[0].contributionDays;
  days.push({ ...days[0] });
  const mock = transport(() => response(duplicate));
  await assert.rejects(createGitHubClient({ fetch: mock.fetch, token: "test", now: () => NOW }).getContributions(),
    expectCode("invalid-response"));
  const absent = transport(() => response({ data: { user: null } }));
  await assert.rejects(createGitHubClient({ fetch: absent.fetch, token: "test" }).getPinnedRepositories(), expectCode("invalid-response"));
});

test("finds the six most recent public PushEvents across event pages, without using non-push or private events", async () => {
  const path = `/users/${GITHUB_USERNAME}/events/public`;
  const mock = transport((url) => {
    assert.equal(url.pathname, path);
    assert.equal(url.searchParams.get("per_page"), "100");
    const page = Number(url.searchParams.get("page"));
    if (page === 1) return response([
      { type: "WatchEvent" }, { ...push("private"), public: false },
      push("6", undefined, "2026-10-20T12:00:06Z"),
      push("5", undefined, "2026-10-20T12:00:05Z"),
    ], 200, nextLink(path, 2));
    assert.equal(page, 2);
    return response([
      push("5", undefined, "2026-10-20T12:00:05Z"),
      ...[4, 3, 2, 1, 0].map((n) => push(String(n), undefined, `2026-10-20T12:00:0${n}Z`)),
    ], 200, nextLink(path, 3));
  });
  const pushes = await createGitHubClient({ fetch: mock.fetch }).getRecentPushes();
  assert.deepEqual(pushes.map((event) => event.id), ["6", "5", "4", "3", "2", "1"]);
  assert.ok(pushes.every((event) => event.commits[0].message === "Real push message" && event.commitCount === 1));
  assert.equal(mock.requests.length, 2);
});

test("fewer than six pushes stay fewer; genuinely empty public events stay empty", async () => {
  const mock = transport(() => response([push("1"), { type: "CreateEvent" }]));
  const result = await createGitHubClient({ fetch: mock.fetch }).getRecentPushes();
  assert.equal(result.length, 1);
  const empty = transport(() => response([]));
  assert.deepEqual(await createGitHubClient({ fetch: empty.fetch }).getRecentPushes(), []);
});

test("modern PushEvent missing commits retrieves a real message via its head SHA without inferring count", async () => {
  const mock = transport((url) => {
    if (url.pathname.endsWith("/events/public")) return response([push("modern", { ref: "refs/heads/main", head: HEAD })]);
    assert.equal(url.pathname, `/repos/${REPO}/commits/${HEAD}`);
    return response(commit());
  });
  const [result] = await createGitHubClient({ fetch: mock.fetch }).getRecentPushes();
  assert.equal(result.commits[0].message, "Message from actual commit endpoint");
  assert.equal(result.commits[0].sha, HEAD);
  assert.equal(result.commitCount, null);
  assert.equal(result.commitSource, "head");
  assert.equal(mock.requests.length, 2);
});

test("modern PushEvent without head filters actual branch commits inside the event time window", async () => {
  const mock = transport((url) => {
    if (url.pathname.endsWith("/events/public")) return response([push("modern", { ref: "refs/heads/feature/real" })]);
    assert.equal(url.pathname, `/repos/${REPO}/commits`);
    assert.equal(url.searchParams.get("sha"), "feature/real");
    assert.equal(url.searchParams.get("since"), "2026-10-20T11:55:00.000Z");
    assert.equal(url.searchParams.get("until"), "2026-10-20T12:00:00Z");
    return response([
      commit(HEAD, "Real in-window message", "2026-10-20T11:59:00Z"),
      commit(SECOND, "Old unrelated message", "2026-10-20T11:00:00Z"),
      commit(THIRD, "Future message", "2026-10-20T12:01:00Z"),
      commit(HEAD, "Real in-window message", "2026-10-20T11:59:00Z"),
    ]);
  });
  const [result] = await createGitHubClient({ fetch: mock.fetch }).getRecentPushes();
  assert.equal(result.head, null);
  assert.equal(result.commitCount, null);
  assert.equal(result.commitSource, "branch-window");
  assert.equal(result.commits.length, 1);
  assert.equal(result.commits[0].message, "Real in-window message");
});

test("branch window excludes commits at or before the preceding push on the same branch", async () => {
  const mock = transport((url) => {
    if (url.pathname.endsWith("/events/public")) return response([
      push("new", { ref: "refs/heads/main" }),
      push("old", undefined, "2026-10-20T11:58:00Z"),
    ]);
    assert.equal(url.searchParams.get("since"), "2026-10-20T11:58:00.000Z");
    return response([
      commit(HEAD, "Already in preceding push", "2026-10-20T11:58:00Z"),
      commit(SECOND, "New actual commit", "2026-10-20T11:59:00Z"),
    ]);
  });
  const result = await createGitHubClient({ fetch: mock.fetch }).getRecentPushes();
  assert.deepEqual(result[0].commits.map((item) => item.message), ["New actual commit"]);
});

test("failed modern commit enrichment rejects the cache loader instead of caching an error result", async () => {
  for (const payload of [{ ref: "refs/heads/main", head: HEAD }, { ref: "refs/heads/main" }]) {
    const mock = transport((url) => url.pathname.endsWith("/events/public")
      ? response([push("modern", payload)]) : response({ message: "not found" }, 404));
    const client = createGitHubClient({ fetch: mock.fetch });
    await assert.rejects(client.getRecentPushes(), expectCode("http"));
    const boundary = createGitHubDataBoundary(client, () => false);
    assert.equal((await boundary()).recentPushes, null);
  }
});

test("modern event with no head or branch remains a real push with no invented message or count", async () => {
  const mock = transport(() => response([push("modern", {})]));
  const [result] = await createGitHubClient({ fetch: mock.fetch }).getRecentPushes();
  assert.deepEqual(result.commits, []);
  assert.equal(result.commitSource, "unavailable");
  assert.equal(result.commitCount, null);
  assert.equal(result.head, null);
  assert.equal(mock.requests.length, 1);
});

test("event commit with an absent message and no head resolves via its real SHA", async () => {
  const mock = transport((url) => {
    if (url.pathname.endsWith("/events/public")) return response([
      push("legacy", { ref: "refs/heads/main", commits: [{ sha: HEAD }] }),
    ]);
    assert.equal(url.pathname, `/repos/${REPO}/commits/${HEAD}`);
    return response(commit());
  });
  const [result] = await createGitHubClient({ fetch: mock.fetch }).getRecentPushes();
  assert.equal(result.commits[0].message, "Message from actual commit endpoint");
  assert.equal(result.commitCount, null);
  assert.equal(result.head, null);
});

test("commit enrichment rejects mismatched SHA instead of displaying an unrelated head message", async () => {
  const mock = transport((url) => url.pathname.endsWith("/events/public")
    ? response([push("modern", { ref: "refs/heads/main", head: HEAD })]) : response(commit(SECOND)));
  await assert.rejects(createGitHubClient({ fetch: mock.fetch }).getRecentPushes(), expectCode("invalid-response"));
});

test("paginates all public repositories, deduplicates, and aggregates actual language bytes", async () => {
  const path = `/users/${GITHUB_USERNAME}/repos`;
  const mock = transport((url) => {
    if (url.pathname === path) {
      assert.equal(url.searchParams.get("type"), "owner");
      if (url.searchParams.get("page") === "1") return response([
        { full_name: `${GITHUB_USERNAME}/SkillVector`, private: false },
        { full_name: `${GITHUB_USERNAME}/private-project`, private: true },
      ], 200, nextLink(path, 2));
      assert.equal(url.searchParams.get("page"), "2");
      return response([
        { full_name: `${GITHUB_USERNAME}/SkillVector`, private: false },
        { full_name: `${GITHUB_USERNAME}/CodeAtlas`, private: false },
      ]);
    }
    if (url.pathname === `/repos/${GITHUB_USERNAME}/SkillVector/languages`) return response({ TypeScript: 100, CSS: 50 });
    assert.equal(url.pathname, `/repos/${GITHUB_USERNAME}/CodeAtlas/languages`);
    return response({ TypeScript: 50, JavaScript: 100 });
  });
  const languages = await createGitHubClient({ fetch: mock.fetch }).getLanguages();
  assert.deepEqual(languages.map(({ name, bytes }) => ({ name, bytes })), [
    { name: "TypeScript", bytes: 150 },
    { name: "JavaScript", bytes: 100 },
    { name: "CSS", bytes: 50 },
  ]);
  for (const language of languages) {
    assert.ok(Math.abs(language.percentage - language.bytes / 3) < 1e-12);
  }
  assert.equal(mock.requests.length, 4);
  assert.equal(languages.reduce((sum, item) => sum + item.bytes, 0), 300);
});

test("empty repositories and empty language maps do not invent percentages", async () => {
  const none = transport(() => response([]));
  assert.deepEqual(await createGitHubClient({ fetch: none.fetch }).getLanguages(), []);
  const empty = transport((url) => url.pathname.endsWith("/repos")
    ? response([{ full_name: REPO, private: false }]) : response({}));
  assert.deepEqual(await createGitHubClient({ fetch: empty.fetch }).getLanguages(), []);
});

test("language endpoint failure rejects the aggregate rather than returning misleading partial bytes", async () => {
  const mock = transport((url) => {
    if (url.pathname.endsWith("/repos")) return response([
      { full_name: REPO, private: false }, { full_name: `${GITHUB_USERNAME}/CodeAtlas`, private: false },
    ]);
    return url.pathname.includes("SkillVector") ? response({ TypeScript: 100 }) : response(null, 403);
  });
  await assert.rejects(createGitHubClient({ fetch: mock.fetch }).getLanguages(), expectCode("http"));
});

test("invalid language bytes and overflow reject instead of making up an aggregate", async () => {
  for (const languages of [{ TypeScript: "100" }, { TypeScript: -1 }, { TypeScript: 1.5 },
    { TypeScript: Number.MAX_SAFE_INTEGER, CSS: 1 }]) {
    const mock = transport((url) => url.pathname.endsWith("/repos")
      ? response([{ full_name: REPO, private: false }]) : response(languages));
    await assert.rejects(createGitHubClient({ fetch: mock.fetch }).getLanguages(), expectCode("invalid-response"));
  }
});

test("a later pagination failure rejects instead of presenting a truncated section as success", async () => {
  for (const kind of ["events/public", "repos"]) {
    const path = `/users/${GITHUB_USERNAME}/${kind}`;
    const mock = transport((url) => url.searchParams.get("page") === "1"
      ? response(kind === "repos" ? [{ full_name: REPO, private: false }] : [push()], 200, nextLink(path, 2))
      : response(null, 500));
    const client = createGitHubClient({ fetch: mock.fetch });
    await assert.rejects(kind === "repos" ? client.getLanguages() : client.getRecentPushes(), expectCode("http"));
  }
});

test("external pagination links are rejected and never followed", async () => {
  const mock = transport(() => response([], 200, '<https://evil.test/repos?page=2>; rel="next"'));
  await assert.rejects(createGitHubClient({ fetch: mock.fetch }).getLanguages(), expectCode("invalid-response"));
  assert.equal(mock.requests.length, 1);
});

test("one failed section does not prevent another independent loader from succeeding", async () => {
  const mock = transport((url) => url.pathname === "/graphql" ? response({ errors: [{ message: "denied" }] })
    : response(repository(url.pathname.split("/").at(-1)!, 5)));
  const client = createGitHubClient({ fetch: mock.fetch, token: "test" });
  const [graph, repo] = await Promise.allSettled([client.getPinnedRepositories(), client.getFeaturedRepository("CodeAtlas")]);
  assert.equal(graph.status, "rejected");
  assert.equal(repo.status, "fulfilled");
  if (repo.status === "fulfilled") assert.equal(repo.value.stars, 5);
});

test("rendering boundary preserves every last-known success when refresh loaders reject", async () => {
  let failing = false;
  const mock = transport((url, init) => {
    if (failing) return response({ message: "test-secret" }, 500);
    if (url.pathname === "/graphql") {
      const body = JSON.parse(String(init.body)) as { query: string };
      return body.query.includes("contributionsCollection") ? response(contributions())
        : response({ data: { user: { login: GITHUB_USERNAME, pinnedItems: { nodes: [pinned()] } } } });
    }
    if (url.pathname.endsWith("/events/public")) return response([push()]);
    if (url.pathname === `/users/${GITHUB_USERNAME}/repos`) return response([{ full_name: REPO, private: false }]);
    if (url.pathname.endsWith("/languages")) return response({ TypeScript: 100 });
    return response(repository(url.pathname.split("/").at(-1)!, 4));
  });
  const client = createGitHubClient({ fetch: mock.fetch, token: "test-secret", now: () => NOW });
  const render = createGitHubDataBoundary(client, () => true);
  const success = await render();
  assert.equal(success.featuredRepositories.SkillVector?.stars, 4);
  assert.equal(success.recentPushes?.length, 1);
  assert.equal(success.contributions?.total, 3);
  failing = true;
  const stale = await render();
  assert.deepEqual(stale, success);
  assert.ok(!JSON.stringify(stale).includes("test-secret"));
  // Raw loaders continue throwing; the boundary alone performs the fallback.
  await assert.rejects(client.getRecentPushes(), expectCode("http"));
});

test("cold failures produce only null fields and do not prevent a later successful retry", async () => {
  let failing = true;
  let skillVectorFails = false;
  let stars = 0;
  const mock = transport((url) => {
    if (failing || (skillVectorFails && url.pathname.endsWith("/SkillVector"))) return response(null, 403);
    if (url.pathname.endsWith("/events/public") || url.pathname === `/users/${GITHUB_USERNAME}/repos`) return response([]);
    return response(repository(url.pathname.split("/").at(-1)!, stars));
  });
  const render = createGitHubDataBoundary(createGitHubClient({ fetch: mock.fetch }), () => false);
  assert.deepEqual(await render(), {
    username: GITHUB_USERNAME,
    contributions: null,
    pinnedRepositories: null,
    recentPushes: null,
    featuredRepositories: { SkillVector: null, "flash-resume": null, CodeAtlas: null },
    languages: null,
  });
  failing = false;
  const success = await render();
  assert.deepEqual(success.recentPushes, []);
  assert.deepEqual(success.languages, []);
  assert.equal(success.featuredRepositories.SkillVector?.stars, 0);
  skillVectorFails = true;
  stars = 12;
  const independentlyRefreshed = await render();
  assert.equal(independentlyRefreshed.featuredRepositories.SkillVector?.stars, 0);
  assert.equal(independentlyRefreshed.featuredRepositories["flash-resume"]?.stars, 12);
  assert.equal(independentlyRefreshed.featuredRepositories.CodeAtlas?.stars, 12);
});

test("removing the token makes graphs null and performs no GraphQL request, even after prior success", async () => {
  let hasToken = true;
  const mock = transport((url, init) => {
    if (url.pathname === "/graphql") {
      const body = JSON.parse(String(init.body)) as { query: string };
      return body.query.includes("contributionsCollection") ? response(contributions())
        : response({ data: { user: { login: GITHUB_USERNAME, pinnedItems: { nodes: [] } } } });
    }
    if (url.pathname.endsWith("/events/public") || url.pathname === `/users/${GITHUB_USERNAME}/repos`) return response([]);
    return response(repository(url.pathname.split("/").at(-1)!));
  });
  const render = createGitHubDataBoundary(createGitHubClient({ fetch: mock.fetch, token: "test-secret", now: () => NOW }),
    () => hasToken);
  assert.equal((await render()).contributions?.total, 3);
  const graphRequests = mock.requests.filter(({ url }) => url.pathname === "/graphql").length;
  hasToken = false;
  const result = await render();
  assert.equal(result.contributions, null);
  assert.equal(result.pinnedRepositories, null);
  assert.deepEqual(result.recentPushes, []);
  assert.equal(mock.requests.filter(({ url }) => url.pathname === "/graphql").length, graphRequests);
});

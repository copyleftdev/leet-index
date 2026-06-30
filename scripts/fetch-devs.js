import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeScore, getTier, meetsEligibility, MEANINGFUL } from './score.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'public', 'data.json');

const API = 'https://api.github.com';
const SEARCH_DELAY_MS = 2200;
const RETRY_DELAY_MS  = 3000;
const REQUEST_TIMEOUT = 20_000;
const RATE_LIMIT_BUFFER = 150;
const INACTIVE_DAYS = 60;

// 24 US search batches — one per hourly run
// location:"united states" catches devs who set their country
// plus major city aliases for those who set city only
const SEARCH_BATCHES = [
  { label: 'US 2000-Jun2013',    q: 'location:"united states" type:user repos:>3 followers:>1 created:2000-01-01..2013-06-30' },
  { label: 'US Jul2013-Jun2014', q: 'location:"united states" type:user repos:>3 followers:>1 created:2013-07-01..2014-06-30' },
  { label: 'US Jul2014-Feb2015', q: 'location:"united states" type:user repos:>3 followers:>1 created:2014-07-01..2015-02-28' },
  { label: 'US Mar2015-Sep2015', q: 'location:"united states" type:user repos:>3 followers:>1 created:2015-03-01..2015-09-30' },
  { label: 'US Oct2015-Mar2016', q: 'location:"united states" type:user repos:>3 followers:>1 created:2015-10-01..2016-03-31' },
  { label: 'US Apr2016-Sep2016', q: 'location:"united states" type:user repos:>3 followers:>1 created:2016-04-01..2016-09-30' },
  { label: 'US Oct2016-Mar2017', q: 'location:"united states" type:user repos:>3 followers:>1 created:2016-10-01..2017-03-31' },
  { label: 'US Apr2017-Sep2017', q: 'location:"united states" type:user repos:>3 followers:>1 created:2017-04-01..2017-09-30' },
  { label: 'US Oct2017-Mar2018', q: 'location:"united states" type:user repos:>3 followers:>1 created:2017-10-01..2018-03-31' },
  { label: 'US Apr2018-Sep2018', q: 'location:"united states" type:user repos:>3 followers:>1 created:2018-04-01..2018-09-30' },
  { label: 'US Oct2018-Mar2019', q: 'location:"united states" type:user repos:>3 followers:>1 created:2018-10-01..2019-03-31' },
  { label: 'US Apr2019-Sep2019', q: 'location:"united states" type:user repos:>3 followers:>1 created:2019-04-01..2019-09-30' },
  { label: 'US Oct2019-Feb2020', q: 'location:"united states" type:user repos:>3 followers:>1 created:2019-10-01..2020-02-29' },
  { label: 'US Mar2020-Jul2020', q: 'location:"united states" type:user repos:>3 followers:>1 created:2020-03-01..2020-07-31' },
  { label: 'US Aug2020-Dec2020', q: 'location:"united states" type:user repos:>3 followers:>1 created:2020-08-01..2020-12-31' },
  { label: 'US Jan2021-May2021', q: 'location:"united states" type:user repos:>3 followers:>1 created:2021-01-01..2021-05-31' },
  { label: 'US Jun2021-Oct2021', q: 'location:"united states" type:user repos:>3 followers:>1 created:2021-06-01..2021-10-31' },
  { label: 'US Nov2021-Mar2022', q: 'location:"united states" type:user repos:>3 followers:>1 created:2021-11-01..2022-03-31' },
  { label: 'US Apr2022-Aug2022', q: 'location:"united states" type:user repos:>3 followers:>1 created:2022-04-01..2022-08-31' },
  { label: 'US Sep2022-Jan2023', q: 'location:"united states" type:user repos:>3 followers:>1 created:2022-09-01..2023-01-31' },
  { label: 'US Feb2023-Jun2023', q: 'location:"united states" type:user repos:>3 followers:>1 created:2023-02-01..2023-06-30' },
  { label: 'US Jul2023-Nov2023', q: 'location:"united states" type:user repos:>3 followers:>1 created:2023-07-01..2023-11-30' },
  { label: 'US Dec2023-Jun2024', q: 'location:"united states" type:user repos:>3 followers:>1 created:2023-12-01..2024-06-30' },
  {
    label: 'US Jul2024+',
    queries: [
      'location:"united states" type:user repos:>3 followers:>1 created:2024-07-01..2024-12-31',
      'location:"united states" type:user repos:>3 followers:>1 created:2025-01-01..2025-12-31',
      'location:"united states" type:user repos:>3 followers:>1 created:2026-01-01..2099-12-31',
    ],
  },
];

const rateState = { remaining: Infinity, resetAt: 0 };

function apiHeaders() {
  const token = process.env.GITHUB_TOKEN;
  const h = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

async function apiFetch(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  try {
    const res = await fetch(url, { headers: apiHeaders(), signal: controller.signal });
    const remaining = Number(res.headers.get('X-RateLimit-Remaining') ?? Infinity);
    const resetAt   = Number(res.headers.get('X-RateLimit-Reset') ?? 0) * 1000;
    rateState.remaining = remaining;
    rateState.resetAt   = resetAt;
    if (res.status === 429 || (res.status === 403 && remaining === 0)) {
      const wait = Math.max(resetAt - Date.now(), 60_000);
      console.warn(`Rate limited — waiting ${Math.ceil(wait / 1000)}s`);
      await sleep(wait);
      return apiFetch(url);
    }
    if (!res.ok) return null;
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function guardRateLimit() {
  if (rateState.remaining < RATE_LIMIT_BUFFER && rateState.resetAt > Date.now()) {
    const wait = rateState.resetAt - Date.now() + 5_000;
    console.warn(`Low rate limit (${rateState.remaining}) — waiting ${Math.ceil(wait / 1000)}s`);
    await sleep(wait);
  }
}

async function searchPage(q, page) {
  await guardRateLimit();
  const url = `${API}/search/users?q=${encodeURIComponent(q)}&per_page=100&page=${page}`;
  const data = await apiFetch(url);
  await sleep(SEARCH_DELAY_MS);
  return data;
}

async function searchBatch(q) {
  const users = [];
  for (let page = 1; page <= 10; page++) {
    const data = await searchPage(q, page);
    if (!data?.items?.length) break;
    users.push(...data.items.map((u) => u.login));
    if (users.length >= data.total_count || data.items.length < 100) break;
  }
  return users;
}

async function fetchUserData(login) {
  await guardRateLimit();
  const [profile, events, repos] = await Promise.all([
    apiFetch(`${API}/users/${login}`),
    apiFetch(`${API}/users/${login}/events/public?per_page=100`),
    apiFetch(`${API}/users/${login}/repos?per_page=100&type=public&sort=pushed`),
  ]);
  await sleep(Math.random() * 50 + 100);
  return { profile, events: events ?? [], repos: repos ?? [] };
}

function processUser({ profile, events, repos }) {
  const now = Date.now();
  const cutoff60 = now - INACTIVE_DAYS * 24 * 60 * 60 * 1000;
  const cutoff30 = now - 30 * 24 * 60 * 60 * 1000;

  const m60 = events.filter((e) => MEANINGFUL.has(e.type) && new Date(e.created_at).getTime() > cutoff60);
  const m30 = m60.filter((e) => new Date(e.created_at).getTime() > cutoff30);

  const timestamps = m60.map((e) => new Date(e.created_at).getTime()).sort((a, b) => b - a);
  let maxGap = 0;
  if (timestamps.length) {
    const gaps = [now - timestamps[0]];
    for (let i = 0; i < timestamps.length - 1; i++) gaps.push(timestamps[i] - timestamps[i + 1]);
    maxGap = Math.max(...gaps) / (24 * 60 * 60 * 1000);
  }

  const accountAgeDays = (now - new Date(profile.created_at).getTime()) / (24 * 60 * 60 * 1000);
  const totalStars     = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
  const topLangs       = [...new Set(repos.map((r) => r.language).filter(Boolean))].slice(0, 5);

  const devData = {
    username: profile.login,
    name: profile.name,
    avatar_url: profile.avatar_url,
    location: profile.location,
    followers: profile.followers,
    public_repos: profile.public_repos,
    events_30d: m30.length,
    meaningful_60d: m60.length,
    max_inactivity_gap_days: maxGap,
    account_age_days: Math.floor(accountAgeDays),
    total_stars: totalStars,
    top_languages: topLangs,
  };

  if (!meetsEligibility(devData)) return null;

  const { total, breakdown } = computeScore(devData);
  const tier = getTier(total);

  return { ...devData, score: total, tier, score_breakdown: breakdown };
}

export async function runBatch(batchIndex) {
  const batch = SEARCH_BATCHES[batchIndex];
  if (!batch) throw new Error(`Invalid batch index: ${batchIndex}`);

  console.log(`[batch-${batchIndex}] ${batch.label}`);

  const queries = batch.queries ?? [batch.q];
  const allLogins = new Set();
  for (const q of queries) {
    const logins = await searchBatch(q);
    logins.forEach((l) => allLogins.add(l));
    console.log(`  search "${q.slice(0, 60)}..." → ${logins.length} results`);
  }

  console.log(`  fetching ${allLogins.size} profiles…`);
  const batchDevs = [];
  for (const login of allLogins) {
    try {
      const raw = await fetchUserData(login);
      if (!raw.profile) continue;
      const dev = processUser(raw);
      if (dev) batchDevs.push(dev);
    } catch (e) {
      console.warn(`  [skip] ${login}: ${e.message}`);
    }
  }

  console.log(`  ${batchDevs.length} eligible devs in this batch`);
  return { batchIndex, label: batch.label, devs: batchDevs };
}

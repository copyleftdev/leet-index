import { cache, CACHE_KEYS } from './cache.js';
import { computeScore, getTier } from './score.js';
import { computeStreak, inferState, inferTags } from './profile-signals.js';

const BASE = 'https://api.github.com';
const MEANINGFUL = new Set(['PushEvent', 'PullRequestEvent', 'IssuesEvent', 'ReleaseEvent']);

function headers(token) {
  const h = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

async function ghFetch(url, token) {
  const res = await fetch(url, { headers: headers(token) });
  if (!res.ok) {
    if (res.status === 404) throw new Error('GitHub user not found.');
    if (res.status === 403) throw new Error('GitHub API rate limit exceeded. Add a token to continue.');
    throw new Error(`GitHub API error: ${res.status}`);
  }
  return res.json();
}

export async function checkGitHubProfile(username, token) {
  const cacheKey = CACHE_KEYS.PROFILE_PREFIX + username.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // Fetch the public profile, recent events, and public repositories in parallel.
  const [profile, events, repos] = await Promise.all([
    ghFetch(`${BASE}/users/${username}`, token),
    ghFetch(`${BASE}/users/${username}/events/public?per_page=100`, token),
    ghFetch(`${BASE}/users/${username}/repos?per_page=100&type=public&sort=pushed`, token),
  ]);

  const now = Date.now();
  const cutoff60 = now - 60 * 24 * 60 * 60 * 1000;
  const cutoff30 = now - 30 * 24 * 60 * 60 * 1000;

  const events60 = events.filter((e) => new Date(e.created_at).getTime() > cutoff60);
  const meaningful60 = events60.filter((e) => MEANINGFUL.has(e.type));
  const meaningful30 = events60.filter(
    (e) => MEANINGFUL.has(e.type) && new Date(e.created_at).getTime() > cutoff30
  );

  // Inactivity gap
  const timestamps = meaningful60
    .map((e) => new Date(e.created_at).getTime())
    .sort((a, b) => b - a);
  let maxGap = 0;
  if (timestamps.length > 0) {
    const gaps = [now - timestamps[0]];
    for (let i = 0; i < timestamps.length - 1; i++) {
      gaps.push(timestamps[i] - timestamps[i + 1]);
    }
    maxGap = Math.max(...gaps) / (24 * 60 * 60 * 1000);
  }

  const accountAgeDays = (now - new Date(profile.created_at).getTime()) / (24 * 60 * 60 * 1000);
  const totalStars = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
  const topLangs = [...new Set(repos.map((r) => r.language).filter(Boolean))].slice(0, 5);

  // State inference from location string
  const state = inferState(profile.location || '');

  const eligibility = {
    contributions: meaningful60.length >= 30,
    inactivity: maxGap <= 30,
    age: accountAgeDays >= 30,
    repos: profile.public_repos > 3,
    followers: profile.followers > 1,
  };

  const profileData = {
    total_stars: totalStars,
    followers: profile.followers,
    public_repos: profile.public_repos,
    events_30d: meaningful30.length,
    account_age_days: Math.floor(accountAgeDays),
  };

  const { total, breakdown } = computeScore(profileData);
  const tier = getTier(total);

  // Streak: consecutive days with activity
  const activeDays = new Set(
    meaningful60.map((e) => new Date(e.created_at).toISOString().slice(0, 10))
  );
  const streakDays = computeStreak(activeDays);

  const devEntry = {
    username,
    name: profile.name || username,
    avatar_url: profile.avatar_url,
    location: profile.location,
    state,
    score: total,
    tier,
    followers: profile.followers,
    public_repos: profile.public_repos,
    events_30d: meaningful30.length,
    total_stars: totalStars,
    top_languages: topLangs,
    tags: inferTags(repos),
    streak_days: streakDays,
    score_breakdown: breakdown,
    achievements: computeAchievements({ total_stars: totalStars, followers: profile.followers, streakDays, tier }),
  };

  const result = {
    username,
    name: profile.name,
    avatar_url: profile.avatar_url,
    location: profile.location,
    eligibility,
    devEntry,
    cohort: null,
  };

  cache.set(cacheKey, result);
  return result;
}

function computeAchievements({ total_stars, followers, streakDays, tier }) {
  const a = [];
  if (total_stars >= 10000) a.push('STARS_10K');
  else if (total_stars >= 1000) a.push('STARS_1K');
  else if (total_stars >= 100) a.push('STARS_100');
  if (followers >= 1000) a.push('FOLLOWERS_1K');
  else if (followers >= 100) a.push('FOLLOWERS_100');
  if (streakDays >= 100) a.push('STREAK_100');
  else if (streakDays >= 30) a.push('STREAK_30');
  else if (streakDays >= 7) a.push('STREAK_7');
  if (tier === 'LEGEND') a.push('LEGEND_TIER');
  return a;
}

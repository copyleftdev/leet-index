import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getTier } from './score.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.resolve(__dirname, '../public/data.json');

const STREAK_ACHIEVEMENTS = [
  { key: 'STREAK_100', days: 100 },
  { key: 'STREAK_30',  days: 30 },
  { key: 'STREAK_7',   days: 7 },
];
const STAR_ACHIEVEMENTS = [
  { key: 'STARS_10K', count: 10000 },
  { key: 'STARS_1K',  count: 1000 },
  { key: 'STARS_100', count: 100 },
];
const FOLLOWER_ACHIEVEMENTS = [
  { key: 'FOLLOWERS_1K', count: 1000 },
  { key: 'FOLLOWERS_100', count: 100 },
];

function computeAchievements(dev, isStateFirst, streakDays) {
  const a = [];
  for (const { key, count } of STAR_ACHIEVEMENTS) {
    if (dev.total_stars >= count) { a.push(key); break; }
  }
  for (const { key, count } of FOLLOWER_ACHIEVEMENTS) {
    if (dev.followers >= count) { a.push(key); break; }
  }
  for (const { key, days } of STREAK_ACHIEVEMENTS) {
    if ((streakDays || 0) >= days) { a.push(key); break; }
  }
  if (isStateFirst) a.push('STATE_1');
  const tierKey = `${dev.tier}_TIER`;
  a.push(tierKey);
  return a;
}

export async function mergeBatch({ batchIndex, devs }) {
  // Load existing leaderboard
  let existing = { leaderboard: [], total_indexed: 0, batch_coverage: { current: 0, total: 24 } };
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8');
    existing = JSON.parse(raw);
  } catch { /* first run */ }

  const prevLb = Array.isArray(existing.leaderboard) ? existing.leaderboard : [];

  // Build prev rank map for delta
  const prevRankMap = {};
  prevLb.forEach((d) => { prevRankMap[d.username] = d.rank; });

  // Remove old entries from this batch and add new ones
  const otherDevs = prevLb.filter((d) => d._batch !== batchIndex);
  const taggedNew = devs.map((d) => ({ ...d, _batch: batchIndex }));
  const merged = [...otherDevs, ...taggedNew];

  // Sort by score descending
  merged.sort((a, b) => (b.score || 0) - (a.score || 0));

  // Assign ranks + compute deltas + achievements
  const stateSeen = {};
  const final = merged.map((dev, i) => {
    const rank = i + 1;
    const prevRank = prevRankMap[dev.username];
    const rankDelta = prevRank != null ? prevRank - rank : 0;

    const isStateFirst = dev.state && !stateSeen[dev.state];
    if (dev.state) stateSeen[dev.state] = true;

    const achievements = computeAchievements(dev, isStateFirst, dev.streak_days);

    return {
      rank,
      username: dev.username,
      name: dev.name,
      avatar_url: dev.avatar_url,
      location: dev.location,
      state: dev.state,
      score: dev.score,
      tier: dev.tier,
      rank_delta: rankDelta,
      streak_days: dev.streak_days ?? 0,
      followers: dev.followers,
      public_repos: dev.public_repos,
      events_30d: dev.events_30d,
      total_stars: dev.total_stars,
      top_languages: dev.top_languages,
      tags: dev.tags ?? [],
      achievements,
      score_breakdown: dev.score_breakdown,
      account_age_days: dev.account_age_days,
      last_updated: new Date().toISOString(),
      _batch: dev._batch,
    };
  });

  const output = {
    generated_at: new Date().toISOString(),
    total_indexed: final.length,
    batch_coverage: {
      current: batchIndex,
      total: 24,
      next_batch_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    },
    leaderboard: final,
  };

  await fs.writeFile(DATA_PATH, JSON.stringify(output, null, 2), 'utf8');
  console.log(`[write] ${final.length} devs written — batch ${batchIndex} merged`);
  return output;
}

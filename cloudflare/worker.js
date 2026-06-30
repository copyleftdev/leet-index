/**
 * LeetIndex Cloudflare Worker
 * Routes:
 *   GET /badge/:username  → Shields.io redirect with current rank
 *   GET /rank/:username   → JSON { username, rank, score, tier }
 *   GET /summary          → JSON { total_indexed, generated_at }
 */

const DATA_URL = 'https://raw.githubusercontent.com/copyleftdev/leet-index/main/public/data.json';
const CACHE_TTL = 3600; // 1 hour

async function fetchLeaderboard(env) {
  const cacheKey = new Request(DATA_URL);
  const cached = await env.LEET_CACHE?.get('leaderboard', 'json');
  if (cached) return cached;

  const res = await fetch(DATA_URL, { cf: { cacheTtl: CACHE_TTL, cacheEverything: true } });
  if (!res.ok) throw new Error('Failed to fetch leaderboard data');
  const data = await res.json();

  await env.LEET_CACHE?.put('leaderboard', JSON.stringify(data), { expirationTtl: CACHE_TTL });
  return data;
}

function cors(res) {
  const headers = new Headers(res.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  return new Response(res.body, { status: res.status, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const parts = url.pathname.split('/').filter(Boolean);

    try {
      const data = await fetchLeaderboard(env);
      const lb = data.leaderboard || [];

      // GET /rank/:username
      if (parts[0] === 'rank' && parts[1]) {
        const username = parts[1].toLowerCase();
        const dev = lb.find((d) => d.username.toLowerCase() === username);
        if (!dev) {
          return cors(new Response(JSON.stringify({ error: 'not_found', username }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          }));
        }
        return cors(new Response(JSON.stringify({
          username: dev.username,
          rank: dev.rank,
          score: dev.score,
          tier: dev.tier,
          rank_delta: dev.rank_delta,
          streak_days: dev.streak_days,
        }), {
          headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${CACHE_TTL}` },
        }));
      }

      // GET /badge/:username → redirect to shields.io
      if (parts[0] === 'badge' && parts[1]) {
        const username = parts[1].toLowerCase();
        const dev = lb.find((d) => d.username.toLowerCase() === username);
        const rank  = dev ? `%23${dev.rank}` : 'unranked';
        const color = dev ? 'C97D1E' : '555555';
        const label = 'LeetIndex';
        const badgeUrl = `https://img.shields.io/badge/${label}-${rank}-${color}?style=flat-square&logo=github`;
        return Response.redirect(badgeUrl, 302);
      }

      // GET /summary
      if (parts[0] === 'summary' || url.pathname === '/') {
        return cors(new Response(JSON.stringify({
          total_indexed: data.total_indexed,
          generated_at: data.generated_at,
          batch_coverage: data.batch_coverage,
        }), {
          headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${CACHE_TTL}` },
        }));
      }

      return cors(new Response('Not found', { status: 404 }));
    } catch (e) {
      return cors(new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }));
    }
  },
};

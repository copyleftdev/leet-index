const TTL_MS = 60 * 60 * 1000; // 1 hour

export const CACHE_KEYS = {
  LEADERBOARD: 'li_leaderboard',
  PROFILE_PREFIX: 'li_profile_',
};

export const cache = {
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify({ ts: Date.now(), value }));
    } catch {
      // storage full or unavailable
    }
  },

  get(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const { ts, value } = JSON.parse(raw);
      if (Date.now() - ts > TTL_MS) {
        localStorage.removeItem(key);
        return null;
      }
      return value;
    } catch {
      return null;
    }
  },

  clear(key) {
    try { localStorage.removeItem(key); } catch { /* noop */ }
  },
};

import React, { useEffect, useMemo, useState } from 'react';
import DevRow from '../components/DevRow';
import TierBadge from '../components/TierBadge';
import { cache, CACHE_KEYS } from '../utils/cache';

const SORT_OPTIONS = [
  { key: 'score_desc',    label: 'SCORE ↓',     fn: (a, b) => (b.score || 0) - (a.score || 0) },
  { key: 'score_asc',     label: 'SCORE ↑',     fn: (a, b) => (a.score || 0) - (b.score || 0) },
  { key: 'activity_desc', label: 'ACTIVITY',     fn: (a, b) => (b.events_30d || 0) - (a.events_30d || 0) },
  { key: 'followers_desc', label: 'FOLLOWERS',   fn: (a, b) => (b.followers || 0) - (a.followers || 0) },
  { key: 'stars_desc',    label: 'STARS',        fn: (a, b) => (b.total_stars || 0) - (a.total_stars || 0) },
  { key: 'streak_desc',   label: 'STREAK',       fn: (a, b) => (b.streak_days || 0) - (a.streak_days || 0) },
  { key: 'name_asc',      label: 'NAME A–Z',     fn: (a, b) => (a.name || '').localeCompare(b.name || '') },
];

const TIERS = ['All', 'LEGEND', 'RELEASE', 'MERGE', 'COMMIT', 'INIT'];
const PER_PAGE = 15;

function exportCSV(devs) {
  const cols = ['rank', 'username', 'name', 'state', 'tier', 'score', 'followers', 'public_repos', 'events_30d', 'total_stars', 'streak_days'];
  const rows = devs.map((d) =>
    cols.map((h) => {
      const v = d[h];
      if (Array.isArray(v)) return `"${v.join(', ')}"`;
      if (typeof v === 'string' && (v.includes(',') || v.includes('"'))) return `"${v.replace(/"/g, '""')}"`;
      return v ?? '';
    }).join(',')
  );
  const blob = new Blob([[cols.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `leetindex-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Leaderboard({ searchTerm, onSearchChange, onNavigateToBadge, onChangeTab }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState(null);
  const [sortIndex, setSortIndex] = useState(0);
  const [tierFilter, setTierFilter] = useState('All');
  const [stateFilter, setStateFilter] = useState('All');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      try {
        let payload = null;
        try {
          const res = await fetch('./data.json', { cache: 'no-store' });
          if (res.ok) {
            payload = await res.json();
            cache.set(CACHE_KEYS.LEADERBOARD, payload);
          }
        } catch {
          payload = cache.get(CACHE_KEYS.LEADERBOARD);
        }
        if (!payload) payload = cache.get(CACHE_KEYS.LEADERBOARD);
        if (!payload) throw new Error('Could not load leaderboard data.');
        if (!alive) return;
        setLeaderboard(Array.isArray(payload.leaderboard) ? payload.leaderboard : []);
        setMeta(payload);
      } catch (e) {
        if (alive) setError(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  const states = useMemo(() => {
    const s = new Set(leaderboard.map((d) => d.state).filter(Boolean));
    return ['All', ...Array.from(s).sort()];
  }, [leaderboard]);

  const filtered = useMemo(() => {
    let r = leaderboard;
    if (tierFilter !== 'All') r = r.filter((d) => d.tier === tierFilter);
    if (stateFilter !== 'All') r = r.filter((d) => d.state === stateFilter);
    const q = searchTerm.trim().toLowerCase();
    if (q) {
      r = r.filter((d) =>
        (d.username || '').toLowerCase().includes(q) ||
        (d.name || '').toLowerCase().includes(q) ||
        (d.location || '').toLowerCase().includes(q) ||
        (d.top_languages || []).join(' ').toLowerCase().includes(q) ||
        (d.tags || []).join(' ').toLowerCase().includes(q)
      );
    }
    return [...r].sort(SORT_OPTIONS[sortIndex].fn);
  }, [leaderboard, tierFilter, stateFilter, searchTerm, sortIndex]);

  useEffect(() => { setPage(1); }, [tierFilter, stateFilter, searchTerm, sortIndex]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const totalIndexed = meta?.total_indexed ?? leaderboard.length;
  const generatedAt = meta?.generated_at ? new Date(meta.generated_at).toLocaleString() : null;

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-6 pt-6">

      {/* Stat strip */}
      <div className="flex flex-wrap items-center gap-4 mb-5 text-xs font-body text-ink-3">
        <span className="tabular">
          <span className="text-amber font-medium">{totalIndexed.toLocaleString()}</span> developers indexed
        </span>
        {generatedAt && <span>Last update: {generatedAt}</span>}
        <span className="text-ink-3">·</span>
        <span>24 hourly batches · daily full cycle</span>
        <button
          type="button"
          onClick={() => exportCSV(filtered)}
          className="ml-auto text-2xs font-display tracking-widest text-ink-3 border border-edge-1 px-2 py-1 hover:border-amber hover:text-amber transition-colors"
        >
          EXPORT CSV
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Tier filter */}
        <div className="flex flex-wrap gap-1">
          {TIERS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTierFilter(t)}
              className={[
                'text-2xs font-display tracking-widest px-2 py-1 transition-colors duration-100',
                tierFilter === t
                  ? 'bg-amber-1 text-amber border border-amber'
                  : 'text-ink-3 border border-edge-1 hover:border-edge-2 hover:text-ink-2',
              ].join(' ')}
            >
              {t}
            </button>
          ))}
        </div>

        {/* State filter */}
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="ml-auto font-display text-2xs tracking-wider bg-canvas-2 border border-edge-1 text-ink-2 px-2 py-1 focus:border-amber focus:outline-none"
          style={{ borderRadius: 0 }}
        >
          {states.map((s) => <option key={s} value={s}>{s === 'All' ? 'All States' : s}</option>)}
        </select>

        {/* Sort */}
        <select
          value={sortIndex}
          onChange={(e) => setSortIndex(Number(e.target.value))}
          className="font-display text-2xs tracking-wider bg-canvas-2 border border-edge-1 text-ink-2 px-2 py-1 focus:border-amber focus:outline-none"
          style={{ borderRadius: 0 }}
        >
          {SORT_OPTIONS.map((o, i) => <option key={o.key} value={i}>{o.label}</option>)}
        </select>

        {/* Mobile search */}
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search…"
          className="lg:hidden bg-canvas-2 border border-edge-1 focus:border-amber focus:outline-none text-sm font-body text-ink-1 placeholder:text-ink-3 px-3 py-1 w-full sm:w-48 transition-colors"
          style={{ borderRadius: 0 }}
        />
      </div>

      {/* Table */}
      {loading && (
        <div className="space-y-px">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 bg-canvas-2 animate-pulse" style={{ opacity: 1 - i * 0.08 }} />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-canvas-2 border border-edge-2 p-6 text-center">
          <div className="font-display text-xs tracking-widest text-signal-down mb-2">LOAD FAILED</div>
          <div className="text-sm text-ink-3">{error}</div>
          <button
            type="button"
            onClick={() => onChangeTab('register')}
            className="mt-4 text-2xs font-display tracking-widest text-amber border border-amber px-3 py-1.5 hover:bg-amber-1 transition-colors"
          >
            CHECK YOUR RANK ANYWAY
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {filtered.length === 0 ? (
            <div className="bg-canvas-2 border border-edge-1 p-8 text-center">
              <div className="font-display text-xs tracking-widest text-ink-3 mb-2">NO MATCH</div>
              <div className="text-sm text-ink-3 mb-4">No developers match your filters.</div>
              <button
                type="button"
                onClick={() => onChangeTab('register')}
                className="text-2xs font-display tracking-widest text-amber border border-amber px-3 py-1.5 hover:bg-amber-1 transition-colors"
              >
                REGISTER TO BE INDEXED
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-edge-2">
                    <th className="pb-2 pl-4 pr-2 font-display text-2xs tracking-widest text-ink-3 text-right">#</th>
                    <th className="pb-2 px-2 font-display text-2xs tracking-widest text-ink-3">DEVELOPER</th>
                    <th className="pb-2 px-2 font-display text-2xs tracking-widest text-ink-3 hidden sm:table-cell">TIER</th>
                    <th className="pb-2 px-2 font-display text-2xs tracking-widest text-ink-3 hidden md:table-cell">STATE</th>
                    <th className="pb-2 px-2 font-display text-2xs tracking-widest text-ink-3 text-right">SCORE</th>
                    <th className="pb-2 px-2 font-display text-2xs tracking-widest text-ink-3 text-center hidden sm:table-cell">Δ</th>
                    <th className="pb-2 px-2 font-display text-2xs tracking-widest text-ink-3 text-center hidden lg:table-cell">STREAK</th>
                    <th className="pb-2 px-2 font-display text-2xs tracking-widest text-ink-3 text-right hidden xl:table-cell">30D EVT</th>
                    <th className="pb-2 pl-2 pr-4 font-display text-2xs tracking-widest text-ink-3 text-right hidden xl:table-cell">STARS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-edge-1">
                  {paginated.map((dev) => (
                    <DevRow key={dev.username} dev={dev} onNavigateToBadge={onNavigateToBadge} />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-xs font-body text-ink-3">
              <span>{filtered.length.toLocaleString()} results</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="font-display text-2xs tracking-wider px-2 py-1 border border-edge-1 disabled:opacity-30 hover:border-amber hover:text-amber transition-colors disabled:cursor-not-allowed"
                >
                  ← PREV
                </button>
                <span className="px-3 tabular">{page} / {totalPages}</span>
                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="font-display text-2xs tracking-wider px-2 py-1 border border-edge-1 disabled:opacity-30 hover:border-amber hover:text-amber transition-colors disabled:cursor-not-allowed"
                >
                  NEXT →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Scarcity/social proof strip */}
      {!loading && !error && leaderboard.length > 0 && (
        <div className="mt-8 p-4 bg-canvas-2 border border-edge-1 flex flex-wrap gap-4 text-xs text-ink-3">
          <span>
            <span className="text-amber tabular">
              {leaderboard.filter((d) => d.tier === 'LEGEND').length}
            </span>{' '}
            LEGEND devs in the US
          </span>
          <span className="text-edge-2">·</span>
          <span>
            <span className="text-amber tabular">
              {leaderboard.filter((d) => d.tier === 'RELEASE').length}
            </span>{' '}
            RELEASE devs
          </span>
          <span className="text-edge-2">·</span>
          <button
            type="button"
            onClick={() => onChangeTab('register')}
            className="hover:text-amber transition-colors"
          >
            Not listed? → Register
          </button>
        </div>
      )}
    </main>
  );
}

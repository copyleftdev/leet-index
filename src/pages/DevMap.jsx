import React, { useState, useEffect, useMemo } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { cache, CACHE_KEYS } from '../utils/cache';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

const STATE_FIPS_TO_ABBR = {
  '01':'AL','02':'AK','04':'AZ','05':'AR','06':'CA','08':'CO','09':'CT','10':'DE',
  '11':'DC','12':'FL','13':'GA','15':'HI','16':'ID','17':'IL','18':'IN','19':'IA',
  '20':'KS','21':'KY','22':'LA','23':'ME','24':'MD','25':'MA','26':'MI','27':'MN',
  '28':'MS','29':'MO','30':'MT','31':'NE','32':'NV','33':'NH','34':'NJ','35':'NM',
  '36':'NY','37':'NC','38':'ND','39':'OH','40':'OK','41':'OR','42':'PA','44':'RI',
  '45':'SC','46':'SD','47':'TN','48':'TX','49':'UT','50':'VT','51':'VA','53':'WA',
  '54':'WV','55':'WI','56':'WY',
};

function getAmberForDensity(count, max) {
  if (!count || max === 0) return 'oklch(21% 0.010 55)';
  const t = Math.pow(count / max, 0.5);
  const l = 21 + t * 52;
  const c = 0.010 + t * 0.14;
  return `oklch(${l.toFixed(0)}% ${c.toFixed(3)} 55)`;
}

export default function DevMap({ onChangeTab }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [hoveredState, setHoveredState] = useState(null);

  useEffect(() => {
    const payload = cache.get(CACHE_KEYS.LEADERBOARD);
    if (payload?.leaderboard) {
      setLeaderboard(payload.leaderboard);
    } else {
      fetch('./data.json', { cache: 'no-store' })
        .then((r) => r.json())
        .then((d) => {
          cache.set(CACHE_KEYS.LEADERBOARD, d);
          setLeaderboard(d.leaderboard || []);
        })
        .catch(() => {});
    }
  }, []);

  const stateCounts = useMemo(() => {
    const counts = {};
    leaderboard.forEach((d) => {
      if (d.state) counts[d.state] = (counts[d.state] || 0) + 1;
    });
    return counts;
  }, [leaderboard]);

  const maxCount = useMemo(() => Math.max(1, ...Object.values(stateCounts)), [stateCounts]);

  const selectedDevs = useMemo(() => {
    if (!selectedState) return [];
    return leaderboard.filter((d) => d.state === selectedState);
  }, [selectedState, leaderboard]);

  const activeState = hoveredState || selectedState;

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-6 pt-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-1 tracking-tight mb-1">Dev Map</h1>
          <p className="text-sm text-ink-3">Developer density by state. Click a state to filter.</p>
        </div>
        {activeState && (
          <div className="font-display text-sm text-amber tracking-wide">
            {activeState}
            {' · '}
            <span className="text-ink-1 tabular">{stateCounts[activeState] || 0}</span>
            <span className="text-ink-3"> indexed</span>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="bg-canvas-2 border border-edge-1 overflow-hidden">
        <ComposableMap
          projection="geoAlbersUsa"
          width={975}
          height={610}
          style={{ width: '100%', height: 'auto' }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const fips = geo.id?.toString().padStart(2, '0');
                const abbr = STATE_FIPS_TO_ABBR[fips] || null;
                const count = abbr ? (stateCounts[abbr] || 0) : 0;
                const isSelected = abbr === selectedState;
                const isHovered  = abbr === hoveredState;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={
                      isSelected
                        ? 'var(--amber)'
                        : getAmberForDensity(count, maxCount)
                    }
                    stroke="var(--canvas-1)"
                    strokeWidth={1}
                    style={{
                      default: { outline: 'none', opacity: isHovered && !isSelected ? 0.8 : 1 },
                      hover:   { outline: 'none', cursor: 'pointer' },
                      pressed: { outline: 'none' },
                    }}
                    onMouseEnter={() => setHoveredState(abbr)}
                    onMouseLeave={() => setHoveredState(null)}
                    onClick={() => setSelectedState((s) => s === abbr ? null : abbr)}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 text-xs text-ink-3 font-body">
        <div className="flex items-center gap-1">
          <div className="w-4 h-3" style={{ backgroundColor: 'oklch(21% 0.010 55)' }} />
          <span>0 devs</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-3" style={{ backgroundColor: 'oklch(45% 0.08 55)' }} />
          <span>some</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-3" style={{ backgroundColor: 'var(--amber)' }} />
          <span>most</span>
        </div>
        <span className="ml-4 text-edge-2">·</span>
        {selectedState && (
          <button
            type="button"
            onClick={() => setSelectedState(null)}
            className="text-amber hover:opacity-70 transition-opacity"
          >
            ✕ Clear filter
          </button>
        )}
      </div>

      {/* State dev list */}
      {selectedState && selectedDevs.length > 0 && (
        <div className="mt-6">
          <div className="text-2xs font-display tracking-widest text-ink-3 mb-3">
            DEVELOPERS IN {selectedState} — {selectedDevs.length} INDEXED
          </div>
          <div className="space-y-px">
            {selectedDevs.slice(0, 20).map((dev) => (
              <div
                key={dev.username}
                className="flex items-center gap-3 px-4 py-2.5 bg-canvas-2 border border-edge-1 hover:bg-canvas-3 transition-colors"
              >
                <span className="font-display tabular text-sm text-ink-3 w-8 text-right shrink-0">
                  #{dev.rank}
                </span>
                <span className="font-body text-sm text-ink-1 truncate flex-1">
                  {dev.name || dev.username}
                </span>
                <span className="font-display text-xs text-amber tabular shrink-0">
                  {dev.score.toLocaleString()}
                </span>
              </div>
            ))}
            {selectedDevs.length > 20 && (
              <button
                type="button"
                onClick={() => onChangeTab('leaderboard')}
                className="w-full text-center py-2.5 text-xs font-display tracking-widest text-amber border border-amber-1 hover:bg-amber-1 transition-colors"
              >
                VIEW ALL {selectedDevs.length} IN {selectedState} →
              </button>
            )}
          </div>
        </div>
      )}

      {selectedState && selectedDevs.length === 0 && (
        <div className="mt-6 p-6 bg-canvas-2 border border-edge-1 text-center text-sm text-ink-3">
          No indexed developers in {selectedState} yet.{' '}
          <button
            type="button"
            onClick={() => onChangeTab('register')}
            className="text-amber hover:opacity-80 transition-opacity"
          >
            Register to be first.
          </button>
        </div>
      )}
    </main>
  );
}

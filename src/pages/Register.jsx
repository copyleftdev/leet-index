import React, { useState, useRef } from 'react';
import ScoreBreakdownPanel from '../components/ScoreBreakdownPanel';
import { checkGitHubProfile } from '../utils/github-api';
import { computeScore, getTier } from '../utils/score';

const ELIGIBILITY_RULES = [
  { key: 'contributions', label: '≥ 30 meaningful contributions in 60 days' },
  { key: 'inactivity',    label: 'No gap > 30 days between contributions' },
  { key: 'age',           label: 'Account ≥ 30 days old' },
  { key: 'repos',         label: '> 3 public repositories' },
  { key: 'followers',     label: '> 1 follower' },
];

function RuleStatus({ passes, label }) {
  return (
    <div className="flex items-start gap-2 text-sm font-body">
      <span className={passes ? 'text-tier-merge mt-0.5' : 'text-signal-down mt-0.5'} style={{ lineHeight: 1 }}>
        {passes ? '✓' : '✗'}
      </span>
      <span className={passes ? 'text-ink-2' : 'text-signal-down'}>{label}</span>
    </div>
  );
}

export default function Register({ onChangeTab }) {
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  async function handleCheck(e) {
    e.preventDefault();
    const u = username.trim().replace(/^@/, '');
    if (!u) return;
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const data = await checkGitHubProfile(u, token.trim() || null);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch profile. Check the username and try again.');
    } finally {
      setLoading(false);
    }
  }

  const passed = result ? Object.values(result.eligibility).every(Boolean) : false;

  return (
    <main className="max-w-2xl mx-auto px-4 md:px-6 pt-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-1 tracking-tight mb-1">Register</h1>
        <p className="text-sm text-ink-3 max-w-prose">
          Check whether a GitHub profile meets the indexing criteria and see an estimated score breakdown.
          Profiles that pass are automatically picked up during the next hourly batch.
        </p>
      </div>

      {/* Check form */}
      <form onSubmit={handleCheck} className="space-y-3 mb-6">
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-2xs font-display tracking-widest text-ink-3 mb-1.5">
              GITHUB USERNAME
            </label>
            <div className="flex">
              <span className="flex items-center px-2 bg-canvas-2 border border-r-0 border-edge-2 text-ink-3 text-sm font-body">@</span>
              <input
                ref={inputRef}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                className="flex-1 bg-canvas-2 border border-edge-2 focus:border-amber focus:outline-none text-sm font-body text-ink-1 placeholder:text-ink-3 px-3 py-2 transition-colors"
                style={{ borderRadius: 0 }}
              />
            </div>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="font-display text-xs tracking-widest px-4 py-2 bg-amber text-canvas-1 font-bold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed h-[38px]"
            >
              {loading ? 'CHECKING…' : 'CHECK RANK'}
            </button>
          </div>
        </div>

        {/* Optional token */}
        <div>
          <button
            type="button"
            onClick={() => setShowToken((v) => !v)}
            className="text-2xs font-display tracking-widest text-ink-3 hover:text-amber transition-colors"
          >
            {showToken ? '▲' : '▶'} OPTIONAL: GitHub token for higher rate limits
          </button>
          {showToken && (
            <div className="mt-2">
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-canvas-2 border border-edge-2 focus:border-amber focus:outline-none text-sm font-body text-ink-1 placeholder:text-ink-3 px-3 py-2 transition-colors"
                style={{ borderRadius: 0 }}
              />
              <p className="text-xs text-ink-3 mt-1">
                Read-only public_repo scope only. Token stays in your browser — never sent to any server.
                Anonymous calls are limited to 60/hr per IP.
              </p>
            </div>
          )}
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-canvas-2 border border-signal-down p-4 mb-6">
          <div className="text-xs font-display tracking-widest text-signal-down mb-1">ERROR</div>
          <div className="text-sm text-ink-2">{error}</div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4 count-reveal">
          {/* Profile header */}
          <div className="flex items-center gap-3 p-4 bg-canvas-2 border border-edge-1">
            {result.avatar_url && (
              <img
                src={result.avatar_url}
                alt={result.name}
                width={48}
                height={48}
                className="shrink-0 object-cover"
                style={{ borderRadius: 0 }}
              />
            )}
            <div>
              <div className="font-body font-semibold text-ink-1">{result.name || result.username}</div>
              <div className="text-xs text-ink-3 font-body">@{result.username}</div>
              {result.location && <div className="text-xs text-ink-3 font-body mt-0.5">{result.location}</div>}
            </div>
          </div>

          {/* Eligibility */}
          <div className="bg-canvas-2 border border-edge-1 p-4 space-y-2">
            <div className="flex items-center justify-between mb-3">
              <div className="text-2xs font-display tracking-widest text-ink-3">ELIGIBILITY CHECK</div>
              <span
                className="text-2xs font-display tracking-widest px-2 py-0.5 border"
                style={{
                  color: passed ? 'var(--tier-merge)' : 'var(--signal-down)',
                  borderColor: passed ? 'var(--tier-merge)' : 'var(--signal-down)',
                }}
              >
                {passed ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
              </span>
            </div>
            {ELIGIBILITY_RULES.map((rule) => (
              <RuleStatus
                key={rule.key}
                passes={result.eligibility[rule.key]}
                label={rule.label}
              />
            ))}
            {!passed && (
              <p className="text-xs text-ink-3 mt-3 pt-3 border-t border-edge-1">
                Profiles that don't meet eligibility are not indexed. Continue contributing and check back — criteria are evaluated on each hourly batch.
              </p>
            )}
          </div>

          {/* Score estimate */}
          {passed && (
            <div>
              <div className="text-2xs font-display tracking-widest text-ink-3 mb-2">ESTIMATED SCORE</div>
              <ScoreBreakdownPanel dev={result.devEntry} />
            </div>
          )}

          {/* Cohort stats */}
          {result.cohort && (
            <div className="p-4 bg-canvas-2 border border-edge-1 space-y-1 text-sm text-ink-3">
              {result.cohort.state_rank && (
                <div>State rank: <span className="text-amber tabular">#{result.cohort.state_rank}</span> in {result.devEntry.state}</div>
              )}
              <div>Your tier puts you in the top{' '}
                <span className="text-amber">{result.cohort.percentile}%</span>{' '}
                of indexed US developers
              </div>
            </div>
          )}

          {/* Badge CTA */}
          <button
            type="button"
            onClick={() => onChangeTab('badge')}
            className="w-full font-display text-xs tracking-widest text-amber border border-amber py-2.5 hover:bg-amber-1 transition-colors"
          >
            GET YOUR RANK BADGE →
          </button>
        </div>
      )}

      {/* Rate limit note */}
      <div className="mt-8 text-xs text-ink-3 font-body space-y-1 pb-8">
        <div className="font-display text-2xs tracking-widest mb-1">// RATE LIMITS</div>
        <p>
          Checks use your browser's IP for GitHub API calls — 60 requests/hour anonymously,
          5,000/hour with a personal token. Results are cached locally for 1 hour to avoid re-fetching.
        </p>
        <p>
          The leaderboard pipeline runs server-side in GitHub Actions with a dedicated token and is not
          affected by these limits.
        </p>
      </div>
    </main>
  );
}

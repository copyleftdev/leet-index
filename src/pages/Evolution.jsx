import React from 'react';

const HISTORY = [
  {
    version: 'v1.0',
    date: '2026-06-29',
    title: 'Initial scoring formula',
    changes: [
      'Stars: up to 600 pts (5,000-star cap). Most popular repos prove sustained community trust.',
      'Activity: up to 500 pts via diminishing returns on 30-day event count. Log-decay rewards consistent activity, not burst-and-vanish sprints.',
      'Followers: up to 500 pts (3,000-follower cap). Measures influence within the developer community.',
      'Repos: up to 100 pts (200-repo cap). Small weight — quantity is not quality.',
      'New account multiplier: 0.5× for accounts younger than 180 days. Prevents farm accounts from inflating early.',
    ],
    why: 'The initial formula weights sustained public contribution over raw vanity metrics. A developer with 200 commits and 50 followers can outscore a dormant account with 10K stars.',
  },
];

const CURRENT_FORMULA = `score =
  min(total_stars / 5000, 1) × 600        // max 600 pts
  + 500 × (1 − e^(−events_30d / 60))      // max 500 pts, diminishing
  + min(followers / 3000, 1) × 500        // max 500 pts
  + min(public_repos / 200, 1) × 100      // max 100 pts

new_account_multiplier = 0.5 if account_age < 180 days`;

export default function Evolution() {
  return (
    <main className="max-w-2xl mx-auto px-4 md:px-6 pt-8 pb-16">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-ink-1 tracking-tight mb-1">Evolution</h1>
        <p className="text-sm text-ink-3 max-w-prose">
          How the scoring formula changed over time — and why. Oldest to newest.
        </p>
      </div>

      {/* Current formula */}
      <div className="mb-8 p-4 bg-canvas-2 border border-amber-1">
        <div className="text-2xs font-display tracking-widest text-amber mb-2">CURRENT FORMULA</div>
        <pre className="text-xs font-body text-ink-2 whitespace-pre leading-relaxed overflow-x-auto">{CURRENT_FORMULA}</pre>
      </div>

      {/* Tiers */}
      <div className="mb-8">
        <div className="text-2xs font-display tracking-widest text-ink-3 mb-3">TIER THRESHOLDS</div>
        <div className="space-y-px">
          {[
            { tier: 'INIT',    range: '0–149',    color: 'var(--tier-init)',    desc: 'Just getting started. Exists in the index.' },
            { tier: 'COMMIT',  range: '150–349',  color: 'var(--tier-commit)',  desc: 'Consistently contributing. Above median activity.' },
            { tier: 'MERGE',   range: '350–699',  color: 'var(--tier-merge)',   desc: 'Solid track record. Visible community presence.' },
            { tier: 'RELEASE', range: '700–1199', color: 'var(--tier-release)', desc: 'High output and influence. Top 10% of indexed devs.' },
            { tier: 'LEGEND',  range: '1200+',    color: 'var(--tier-legend)',  desc: 'Exceptional. Maximum across most components.' },
          ].map(({ tier, range, color, desc }) => (
            <div key={tier} className="flex items-start gap-4 p-3 bg-canvas-2 border border-edge-1">
              <span className="font-display text-2xs tracking-widest shrink-0 w-16" style={{ color }}>{tier}</span>
              <span className="font-display tabular text-xs text-ink-3 shrink-0 w-20">{range} pts</span>
              <span className="text-xs text-ink-2 font-body">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="space-y-8">
        {HISTORY.map((entry) => (
          <div key={entry.version} className="space-y-3">
            <div className="flex items-baseline gap-3">
              <span className="font-display text-xs tracking-widest text-amber">{entry.version}</span>
              <span className="text-xs text-ink-3 font-body tabular">{entry.date}</span>
              <span className="text-sm font-body text-ink-2">{entry.title}</span>
            </div>
            <ul className="space-y-1.5 ml-4">
              {entry.changes.map((c, i) => (
                <li key={i} className="text-sm text-ink-3 font-body flex gap-2">
                  <span className="text-amber shrink-0">·</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
            <div className="ml-4 p-3 bg-canvas-2 border border-edge-1 text-xs text-ink-3 font-body">
              <span className="text-ink-3 font-medium">Why: </span>{entry.why}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 p-4 bg-canvas-2 border border-edge-1 text-xs text-ink-3 font-body">
        <p className="font-display text-2xs tracking-widest text-ink-3 mb-2">OPEN FORMULA</p>
        <p>The scoring formula is defined in <code className="text-amber">score-config.json</code> in the repo and versioned with each change. Historical score data is preserved — retroactive rescoring is never applied silently.</p>
      </div>
    </main>
  );
}

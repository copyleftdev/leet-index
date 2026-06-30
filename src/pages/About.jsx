import React from 'react';

function Section({ title, children }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-sm tracking-widest text-amber border-b border-edge-1 pb-2">{title}</h2>
      <div className="space-y-2 text-sm font-body text-ink-3 leading-relaxed">{children}</div>
    </section>
  );
}

function Table({ rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs font-body">
        <tbody className="divide-y divide-edge-1">
          {rows.map(([a, b], i) => (
            <tr key={i}>
              <td className="py-2 pr-4 text-ink-2 font-medium whitespace-nowrap align-top">{a}</td>
              <td className="py-2 text-ink-3">{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function About({ onChangeTab }) {
  return (
    <main className="max-w-2xl mx-auto px-4 md:px-6 pt-8 pb-16 space-y-10">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-1 tracking-tight mb-1">About LeetIndex</h1>
        <p className="text-sm text-ink-3 max-w-prose leading-relaxed">
          LeetIndex is the definitive daily index of active US-based developers on GitHub. It crawls public
          profile data, applies a transparent scoring formula, and publishes a ranked leaderboard — updated
          continuously via 24 rolling hourly batches.
        </p>
      </div>

      <Section title="HOW IT WORKS">
        <p>
          The pipeline runs entirely in GitHub Actions. Each hour, one batch processes a cohort of developer
          accounts grouped by creation date. Over 24 hours, every developer in the index is re-evaluated.
        </p>
        <Table rows={[
          ['Discover',   'Search GitHub for US-located developers in the batch\'s creation-date window'],
          ['Fetch',      'Pull profile, public events (last 60 days), repos, and social links'],
          ['Score',      'Apply the weighted formula — same math as the Register score preview'],
          ['Filter',     'Drop developers who don\'t meet eligibility thresholds'],
          ['Publish',    'Merge batch results into data.json — leaderboard updates live'],
        ]} />
      </Section>

      <Section title="ELIGIBILITY">
        <p>Not all GitHub accounts qualify. A developer must pass every gate to appear in the index:</p>
        <Table rows={[
          ['Contributions', '≥ 30 meaningful events (push, PR, issue, release) in the last 60 days'],
          ['Inactivity gap', 'No gap > 30 days between events'],
          ['Account age',   'Account must be ≥ 30 days old'],
          ['Public repos',  '> 3 public repositories'],
          ['Followers',     '> 1 follower'],
        ]} />
        <p className="mt-2">
          Developers who set their GitHub location to a US city or state are caught by the pipeline.
          If your profile says "San Francisco" without a country, you may not be indexed automatically —{' '}
          <button
            type="button"
            onClick={() => onChangeTab('register')}
            className="text-amber hover:opacity-80 transition-opacity underline underline-offset-2"
          >
            use Register to check
          </button>.
        </p>
      </Section>

      <Section title="SEARCH STRATEGY">
        <p>
          GitHub's user search API caps results at 1,000 per query. LeetIndex splits searches across 24 date
          ranges (by account creation date from 2000 to present), keeping each batch under the cap.
          One batch runs per hour, completing a full US developer sweep every 24 hours.
        </p>
        <p>
          Searches use <code className="text-amber">location:"united states"</code> as the primary filter,
          supplemented by the top 50 US cities and states to catch developers who set their location without
          a country name.
        </p>
      </Section>

      <Section title="RATE LIMITS &amp; CLIENT-SIDE CALLS">
        <p>
          The pipeline itself runs server-side in GitHub Actions using a dedicated token (5,000 req/hr).
          The Register tab makes GitHub API calls directly from your browser using your IP's anonymous
          quota (60 req/hr) — or 5,000/hr if you provide a personal token with read-only public_repo scope.
        </p>
        <p>
          The leaderboard display reads from a static <code className="text-amber">data.json</code> —
          zero API calls for browsing.
        </p>
      </Section>

      <Section title="GAMIFICATION">
        <p>
          Tiers, streaks, rank deltas, and achievement badges are all derived from your score and GitHub data.
          They update on every batch cycle. Loss aversion is real — watching your rank drop hurts more than
          a gain helps. Check back daily.
        </p>
        <Table rows={[
          ['Tiers',        'INIT → COMMIT → MERGE → RELEASE → LEGEND. Named after git operations.'],
          ['Rank delta',   'Position change since yesterday\'s batch. Amber = up, orange-red = down.'],
          ['Streak',       'Consecutive days with meaningful GitHub activity.'],
          ['Achievements', 'Unlocked automatically when thresholds are crossed.'],
        ]} />
      </Section>

      <Section title="DATA PRIVACY">
        <p>
          LeetIndex only uses publicly available GitHub data. No authentication is required to browse.
          No personal data is stored beyond what GitHub makes public through their API.
        </p>
        <p>
          If you want to opt out of the index, set your GitHub profile location to a non-US value or
          make your account private. The pipeline will drop you on the next cycle.
        </p>
      </Section>

      <Section title="BADGES">
        <p>
          Rank badges are generated via Shields.io and embed your rank at the time of generation. For
          live-updating badges that reflect your current rank, deploy the included Cloudflare Worker —
          it serves fresh rank data on each request with a 1-hour TTL cache.
        </p>
      </Section>

      <div className="pt-4 border-t border-edge-1 text-xs text-ink-3 font-body">
        LeetIndex is not affiliated with GitHub, Inc. All data is sourced from GitHub's public API under
        their{' '}
        <a
          href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement"
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber hover:opacity-80 transition-opacity"
        >
          terms of service
        </a>.
      </div>
    </main>
  );
}

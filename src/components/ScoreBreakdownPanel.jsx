import React from 'react';
import TierBadge from './TierBadge';
import { getTier, getNextTier } from '../utils/tier';

const ACHIEVEMENTS = {
  EARLY_ADOPTER:   { label: 'Early Adopter', icon: '◈', desc: 'Indexed in first 500 devs' },
  STARS_100:       { label: '100 Stars',      icon: '✦', desc: '100+ stars across repos' },
  STARS_1K:        { label: '1K Stars',       icon: '✦✦', desc: '1,000+ stars' },
  STARS_10K:       { label: '10K Stars',      icon: '✦✦✦', desc: '10,000+ stars' },
  FOLLOWERS_100:   { label: '100 Followers',  icon: '◎', desc: '100+ followers' },
  FOLLOWERS_1K:    { label: '1K Followers',   icon: '◎◎', desc: '1,000+ followers' },
  STREAK_7:        { label: 'Streak 7',       icon: '▲', desc: '7-day activity streak' },
  STREAK_30:       { label: 'Streak 30',      icon: '▲▲', desc: '30-day activity streak' },
  STREAK_100:      { label: 'Streak 100',     icon: '▲▲▲', desc: '100-day activity streak' },
  STATE_1:         { label: 'State #1',       icon: '◉', desc: 'Ranked #1 in your state' },
  LANGUAGE_LEADER: { label: 'Lang Leader',    icon: '⌘', desc: '#1 in primary language' },
  LEGEND_TIER:     { label: 'Legend',         icon: '◆', desc: 'Reached LEGEND tier' },
};

function ScoreBar({ label, value, max, color }) {
  const pct = Math.min((value / max) * 100, 100);
  const nearCap = pct >= 85;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs font-body">
        <span className="text-ink-2">{label}</span>
        <span className="tabular text-ink-1 font-medium">{value} <span className="text-ink-3">/ {max}</span></span>
      </div>
      <div className="h-1 bg-canvas-1 overflow-hidden">
        <div
          className={nearCap ? 'progress-shimmer h-full' : 'h-full transition-all duration-700'}
          style={{
            width: `${pct}%`,
            backgroundColor: nearCap ? undefined : color,
          }}
        />
      </div>
    </div>
  );
}

export default function ScoreBreakdownPanel({ dev }) {
  const { score_breakdown: bd, score, achievements = [], tier, streak_days } = dev;
  const totalMax = 600 + 500 + 500 + 100;
  const pctOfMax = Math.round((score / totalMax) * 100);
  const nextTier = getNextTier(score);

  return (
    <div className="bg-canvas-2 border border-edge-1 p-4 space-y-4">
      {/* Score summary */}
      <div className="flex items-center justify-between">
        <div>
          <div className="font-display text-2xl text-amber tabular count-reveal">{score.toLocaleString()}</div>
          <div className="text-xs text-ink-3 mt-0.5">pts · top {pctOfMax}% of max</div>
        </div>
        <TierBadge tier={tier} size="lg" animate />
      </div>

      {/* Component bars */}
      <div className="space-y-2.5 pt-1">
        <ScoreBar label="Stars"     value={bd.stars}     max={600} color="var(--amber)" />
        <ScoreBar label="Activity"  value={bd.activity}  max={500} color="var(--amber-2)" />
        <ScoreBar label="Followers" value={bd.followers} max={500} color="var(--tier-commit)" />
        <ScoreBar label="Repos"     value={bd.repos}     max={100} color="var(--tier-merge)" />
      </div>

      {/* Progress to next tier */}
      {nextTier && (
        <div className="pt-1 border-t border-edge-1 text-xs text-ink-3 font-body">
          <span className="text-ink-2">{nextTier.pts_needed.toLocaleString()} pts</span> to{' '}
          <span style={{ color: nextTier.color }} className="font-display tracking-wider">
            {nextTier.label}
          </span>
        </div>
      )}

      {/* Streak */}
      {streak_days > 0 && (
        <div className="flex items-center gap-2 text-xs text-ink-2 pt-1 border-t border-edge-1">
          <span className="flame-breathe inline-block">🔥</span>
          <span className="tabular font-medium text-amber">{streak_days}</span>
          <span>day streak</span>
        </div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="pt-1 border-t border-edge-1">
          <div className="text-2xs font-display tracking-widest text-ink-3 mb-2">ACHIEVEMENTS</div>
          <div className="flex flex-wrap gap-1.5">
            {achievements.map((key) => {
              const a = ACHIEVEMENTS[key];
              if (!a) return null;
              return (
                <span
                  key={key}
                  title={a.desc}
                  className="text-2xs font-display tracking-wide px-1.5 py-0.5 bg-canvas-1 border border-edge-1 text-amber cursor-default"
                >
                  {a.icon} {a.label}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

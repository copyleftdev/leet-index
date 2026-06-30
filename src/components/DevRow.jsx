import React, { useState } from 'react';
import TierBadge from './TierBadge';
import RankDelta from './RankDelta';
import ScoreBreakdownPanel from './ScoreBreakdownPanel';

const RANK_COLORS = {
  1: 'var(--amber)',
  2: 'oklch(80% 0.025 55)',
  3: 'oklch(65% 0.045 50)',
};

function AvatarFallback({ name, size = 32 }) {
  const initials = (name || '?')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div
      className="flex items-center justify-center shrink-0 font-display font-bold text-canvas-1"
      style={{
        width: size,
        height: size,
        backgroundColor: 'var(--amber-2)',
        fontSize: size * 0.35,
      }}
    >
      {initials}
    </div>
  );
}

function Avatar({ src, name, size = 32 }) {
  const [error, setError] = useState(false);
  if (error || !src) return <AvatarFallback name={name} size={size} />;
  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setError(true)}
      className="shrink-0 object-cover"
      style={{ borderRadius: 0 }}
    />
  );
}

function LangTag({ lang }) {
  return (
    <span className="text-2xs font-display tracking-wide text-ink-3 border border-edge-1 px-1 py-px">
      {lang}
    </span>
  );
}

export default function DevRow({ dev, onNavigateToBadge }) {
  const [expanded, setExpanded] = useState(false);
  const rankColor = RANK_COLORS[dev.rank];

  return (
    <>
      <tr
        className="dev-row cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        {/* Rank */}
        <td className="py-2.5 pl-4 pr-2 w-14 text-right">
          <span
            className="font-display font-bold tabular"
            style={{
              color: rankColor || 'var(--ink-3)',
              fontSize: dev.rank <= 3 ? '1.1rem' : dev.rank <= 10 ? '0.9rem' : '0.8rem',
            }}
          >
            {dev.rank}
          </span>
        </td>

        {/* Avatar + name */}
        <td className="py-2.5 px-2">
          <div className="flex items-center gap-2.5">
            <Avatar src={dev.avatar_url} name={dev.name} size={dev.rank <= 3 ? 36 : 28} />
            <div className="min-w-0">
              <div className="font-body font-medium text-sm text-ink-1 truncate leading-tight">
                {dev.name || dev.username}
              </div>
              <div className="font-body text-xs text-ink-3 leading-tight truncate">@{dev.username}</div>
            </div>
          </div>
        </td>

        {/* Tier */}
        <td className="py-2.5 px-2 hidden sm:table-cell">
          <TierBadge tier={dev.tier} />
        </td>

        {/* State */}
        <td className="py-2.5 px-2 hidden md:table-cell">
          <span className="font-display text-xs text-ink-2 tracking-wide">{dev.state || '??'}</span>
        </td>

        {/* Score */}
        <td className="py-2.5 px-2 text-right">
          <span
            className="font-display tabular font-semibold"
            style={{
              color: rankColor || 'var(--ink-1)',
              fontSize: dev.rank <= 3 ? '1rem' : '0.875rem',
            }}
          >
            {(dev.score || 0).toLocaleString()}
          </span>
        </td>

        {/* Delta */}
        <td className="py-2.5 px-2 text-center hidden sm:table-cell w-14">
          <RankDelta delta={dev.rank_delta} />
        </td>

        {/* Streak */}
        <td className="py-2.5 px-2 hidden lg:table-cell text-center w-16">
          {dev.streak_days > 0 && (
            <span className="flex items-center justify-center gap-1 text-xs text-amber tabular">
              <span className="flame-breathe inline-block text-sm">🔥</span>
              {dev.streak_days}
            </span>
          )}
        </td>

        {/* Activity */}
        <td className="py-2.5 px-2 hidden xl:table-cell text-right text-xs text-ink-3 tabular w-16">
          {dev.events_30d}
        </td>

        {/* Stars */}
        <td className="py-2.5 pl-2 pr-4 hidden xl:table-cell text-right text-xs text-ink-3 tabular w-16">
          {(dev.total_stars || 0).toLocaleString()}
        </td>
      </tr>

      {/* Expanded breakdown */}
      {expanded && (
        <tr>
          <td colSpan={9} className="px-4 pb-3 pt-0 bg-canvas-2">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <ScoreBreakdownPanel dev={dev} />
              </div>
              <div className="sm:w-48 flex flex-col gap-2">
                {/* Languages */}
                {dev.top_languages?.length > 0 && (
                  <div>
                    <div className="text-2xs font-display tracking-widest text-ink-3 mb-1.5">LANGUAGES</div>
                    <div className="flex flex-wrap gap-1">
                      {dev.top_languages.map((l) => <LangTag key={l} lang={l} />)}
                    </div>
                  </div>
                )}
                {/* Tags */}
                {dev.tags?.length > 0 && (
                  <div>
                    <div className="text-2xs font-display tracking-widest text-ink-3 mb-1.5">DOMAINS</div>
                    <div className="flex flex-wrap gap-1">
                      {dev.tags.map((t) => (
                        <span key={t} className="text-2xs font-body text-amber-2 border border-amber-2 px-1 py-px opacity-80">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
                {/* Actions */}
                <div className="flex gap-2 mt-auto pt-2">
                  <a
                    href={`https://github.com/${dev.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-2xs font-display tracking-wider text-ink-3 border border-edge-2 px-2 py-1 hover:border-amber hover:text-amber transition-colors"
                  >
                    PROFILE ↗
                  </a>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onNavigateToBadge?.(dev.username); }}
                    className="text-2xs font-display tracking-wider text-ink-3 border border-edge-2 px-2 py-1 hover:border-amber hover:text-amber transition-colors"
                  >
                    GET BADGE
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

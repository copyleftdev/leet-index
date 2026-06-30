import React from 'react';

const TIER_META = {
  INIT:    { color: 'var(--tier-init)',    label: 'INIT' },
  COMMIT:  { color: 'var(--tier-commit)',  label: 'COMMIT' },
  MERGE:   { color: 'var(--tier-merge)',   label: 'MERGE' },
  RELEASE: { color: 'var(--tier-release)', label: 'RELEASE' },
  LEGEND:  { color: 'var(--tier-legend)',  label: 'LEGEND' },
};

export default function TierBadge({ tier, size = 'sm', animate = false }) {
  const meta = TIER_META[tier] || TIER_META.INIT;
  const isLegend = tier === 'LEGEND';

  const baseClasses = [
    'font-display tracking-widest inline-flex items-center justify-center',
    size === 'sm'  ? 'text-2xs px-1.5 py-0.5' : 'text-xs px-2 py-1',
    isLegend && animate ? 'legend-alive' : '',
    animate ? 'tier-unlock' : '',
  ].filter(Boolean).join(' ');

  return (
    <span
      className={baseClasses}
      style={{
        color: meta.color,
        border: `1px solid ${meta.color}`,
        opacity: tier === 'INIT' ? 0.6 : 1,
      }}
    >
      {meta.label}
    </span>
  );
}

import React from 'react';

export default function RankDelta({ delta }) {
  if (delta === 0 || delta == null) {
    return <span className="text-ink-3 tabular text-xs">—</span>;
  }

  const up = delta > 0;

  return (
    <span
      className={[
        'tabular text-xs font-body delta-reveal inline-flex items-center gap-0.5',
        up ? 'text-amber' : 'text-signal-down',
      ].join(' ')}
    >
      {up ? '▲' : '▼'} {Math.abs(delta)}
    </span>
  );
}

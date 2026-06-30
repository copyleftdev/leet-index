const TIERS = [
  { label: 'LEGEND',  min: 1200, color: 'var(--tier-legend)' },
  { label: 'RELEASE', min: 700,  color: 'var(--tier-release)' },
  { label: 'MERGE',   min: 350,  color: 'var(--tier-merge)' },
  { label: 'COMMIT',  min: 150,  color: 'var(--tier-commit)' },
  { label: 'INIT',    min: 0,    color: 'var(--tier-init)' },
];

export function getTier(score) {
  for (const t of TIERS) {
    if (score >= t.min) return t.label;
  }
  return 'INIT';
}

export function getNextTier(score) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (score < TIERS[i].min) {
      return {
        label: TIERS[i].label,
        color: TIERS[i].color,
        pts_needed: TIERS[i].min - score,
      };
    }
  }
  return null;
}

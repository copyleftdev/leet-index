import scoreConfig from '../../score-config.json' with { type: 'json' };

const TIERS = ['LEGEND', 'RELEASE', 'MERGE', 'COMMIT', 'INIT'].map((label) => ({
  label,
  min: scoreConfig.tiers[label].min,
  color: `var(--tier-${label.toLowerCase()})`,
}));

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

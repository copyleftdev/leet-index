import scoreConfig from '../score-config.json' with { type: 'json' };

const { stars: SC, followers: FC, activity: AC, repos: RC } = scoreConfig;
const MEANINGFUL = new Set(['PushEvent', 'PullRequestEvent', 'IssuesEvent', 'ReleaseEvent']);

export function activityScore(events30d) {
  if (!events30d || events30d <= 0) return 0;
  return AC.max_points * (1 - Math.exp(-events30d / AC.decay_constant));
}

export function computeScore(dev) {
  const starsScore     = Math.min(dev.total_stars  / SC.cap, 1) * SC.max_points;
  const followersScore = Math.min(dev.followers     / FC.cap, 1) * FC.max_points;
  const reposScore     = Math.min(dev.public_repos  / RC.cap, 1) * RC.max_points;
  const actScore       = activityScore(dev.events_30d);

  const raw = starsScore + followersScore + reposScore + actScore;
  const accountAgeDays = dev.account_age_days ?? 365;
  const multiplier = accountAgeDays < scoreConfig.new_account_threshold_days
    ? scoreConfig.new_account_multiplier : 1;
  const total = Math.round(raw * multiplier);

  return {
    total,
    breakdown: {
      stars:     Math.round(starsScore),
      followers: Math.round(followersScore),
      repos:     Math.round(reposScore),
      activity:  Math.round(actScore),
    },
    multiplier,
  };
}

export function getTier(score) {
  const tiers = scoreConfig.tiers;
  if (score >= tiers.LEGEND.min)  return 'LEGEND';
  if (score >= tiers.RELEASE.min) return 'RELEASE';
  if (score >= tiers.MERGE.min)   return 'MERGE';
  if (score >= tiers.COMMIT.min)  return 'COMMIT';
  return 'INIT';
}

export function meetsEligibility(dev) {
  const el = scoreConfig.eligibility;
  return (
    dev.meaningful_60d >= el.min_contributions_60d &&
    (dev.max_inactivity_gap_days ?? 0) <= el.max_inactivity_gap_days &&
    (dev.account_age_days ?? 0) >= el.min_account_age_days &&
    dev.public_repos > el.min_public_repos &&
    dev.followers > el.min_followers
  );
}

export { MEANINGFUL };

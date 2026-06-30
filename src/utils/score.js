import { getTier } from './tier.js';

const CFG = {
  stars:     { cap: 5000,  max: 600 },
  followers: { cap: 3000,  max: 500 },
  repos:     { cap: 200,   max: 100 },
  activity:  { decay: 60,  max: 500 },
  new_account_multiplier: 0.5,
  new_account_days: 180,
};

function activityScore(events) {
  if (!events || events <= 0) return 0;
  return CFG.activity.max * (1 - Math.exp(-events / CFG.activity.decay));
}

export function computeScore(profile) {
  const stars    = Math.min(profile.total_stars   / CFG.stars.cap,     1) * CFG.stars.max;
  const followers = Math.min(profile.followers    / CFG.followers.cap,  1) * CFG.followers.max;
  const repos    = Math.min(profile.public_repos  / CFG.repos.cap,     1) * CFG.repos.max;
  const activity = activityScore(profile.events_30d);

  const raw = stars + followers + repos + activity;
  const multiplier = (profile.account_age_days || 365) < CFG.new_account_days
    ? CFG.new_account_multiplier : 1;
  const total = Math.round(raw * multiplier);

  return {
    total,
    tier: getTier(total),
    breakdown: {
      stars:     Math.round(stars),
      followers: Math.round(followers),
      repos:     Math.round(repos),
      activity:  Math.round(activity),
    },
    multiplier,
  };
}

export { getTier };

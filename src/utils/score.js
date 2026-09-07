import { getTier } from './tier.js';
import scoreConfig from '../../score-config.json' with { type: 'json' };

function activityScore(events) {
  if (!events || events <= 0) return 0;
  return scoreConfig.activity.max_points
    * (1 - Math.exp(-events / scoreConfig.activity.decay_constant));
}

export function computeScore(profile) {
  const stars = Math.min(profile.total_stars / scoreConfig.stars.cap, 1)
    * scoreConfig.stars.max_points;
  const followers = Math.min(profile.followers / scoreConfig.followers.cap, 1)
    * scoreConfig.followers.max_points;
  const repos = Math.min(profile.public_repos / scoreConfig.repos.cap, 1)
    * scoreConfig.repos.max_points;
  const activity = activityScore(profile.events_30d);

  const raw = stars + followers + repos + activity;
  const multiplier = (profile.account_age_days ?? 365) < scoreConfig.new_account_threshold_days
    ? scoreConfig.new_account_multiplier : 1;
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

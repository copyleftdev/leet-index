import assert from 'node:assert/strict';
import test from 'node:test';
import { computeScore as computeBrowserScore } from '../src/utils/score.js';
import { computeScore as computePipelineScore, getTier } from '../scripts/score.js';

test('browser preview and batch pipeline use the same scoring contract', () => {
  const profiles = [
    { total_stars: 0, followers: 2, public_repos: 4, events_30d: 30, account_age_days: 365 },
    { total_stars: 2500, followers: 1500, public_repos: 100, events_30d: 60, account_age_days: 90 },
    { total_stars: 10000, followers: 10000, public_repos: 500, events_30d: 200, account_age_days: 2000 },
  ];

  for (const profile of profiles) {
    const browser = computeBrowserScore(profile);
    const pipeline = computePipelineScore(profile);
    assert.deepEqual(
      browser,
      { ...pipeline, tier: getTier(pipeline.total) },
    );
  }
});

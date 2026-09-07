import assert from 'node:assert/strict';
import test from 'node:test';
import { processUser } from '../scripts/fetch-devs.js';

test('processUser emits map, streak, and domain metadata for refreshed profiles', () => {
  const now = Date.parse('2026-09-07T12:00:00Z');
  const events = [];
  for (const day of ['2026-09-07', '2026-09-06', '2026-09-05']) {
    for (let index = 0; index < 10; index += 1) {
      events.push({ type: 'PushEvent', created_at: `${day}T10:${String(index).padStart(2, '0')}:00Z` });
    }
  }

  const dev = processUser({
    profile: {
      login: 'builder',
      name: 'Active Builder',
      avatar_url: 'https://example.com/avatar.png',
      location: 'Austin, TX, USA',
      followers: 12,
      public_repos: 4,
      created_at: '2020-01-01T00:00:00Z',
    },
    events,
    repos: [
      { stargazers_count: 10, language: 'TypeScript', topics: ['developer-tools', 'cli'] },
      { stargazers_count: 5, language: 'Rust', topics: ['cli'] },
      { stargazers_count: 0, language: 'TypeScript', topics: ['github'] },
      { stargazers_count: 1, language: 'JavaScript', topics: [] },
    ],
  }, now);

  assert.equal(dev.state, 'TX');
  assert.equal(dev.streak_days, 3);
  assert.deepEqual(dev.tags, ['CLI', 'Developer Tools']);
  assert.deepEqual(dev.top_languages, ['TypeScript', 'Rust', 'JavaScript']);
  assert.equal(dev.meaningful_60d, 30);
  assert.ok(dev.score > 0);
  assert.ok(dev.tier);
});

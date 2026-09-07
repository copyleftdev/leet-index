import assert from 'node:assert/strict';
import test from 'node:test';
import { computeStreak, inferState, inferTags } from '../src/utils/profile-signals.js';

test('inferState handles abbreviations, state names, city aliases, and country suffixes', () => {
  assert.equal(inferState('Salt Lake City, UT'), 'UT');
  assert.equal(inferState('Austin, TX, USA'), 'TX');
  assert.equal(inferState('New York City'), 'NY');
  assert.equal(inferState('Washington DC'), 'DC');
  assert.equal(inferState('Portland, Maine'), 'ME');
  assert.equal(inferState('Columbus'), null);
  assert.equal(inferState('London, UK'), null);
});

test('computeStreak permits today to be quiet and counts consecutive prior UTC days', () => {
  const days = new Set(['2026-09-06', '2026-09-05', '2026-09-04', '2026-09-02']);
  assert.equal(computeStreak(days, new Date('2026-09-07T12:00:00Z')), 3);
});

test('inferTags ranks repeated repository topics and removes generic topics', () => {
  const repos = [
    { topics: ['github', 'machine-learning', 'api'] },
    { topics: ['machine-learning', 'cli'] },
    { topics: ['cli', 'open-source'] },
  ];

  assert.deepEqual(inferTags(repos), ['CLI', 'Machine Learning', 'API']);
});

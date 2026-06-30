#!/usr/bin/env node
/**
 * Entry point for GitHub Actions.
 * Usage: node scripts/run-all.js <batch_index>
 * If no index given, runs all 24 batches sequentially (for local full-refresh).
 */
import { runBatch } from './fetch-devs.js';
import { mergeBatch } from './write-leaderboard.js';

const arg = process.argv[2];
const single = arg !== undefined ? parseInt(arg, 10) : null;

async function main() {
  if (single !== null) {
    if (isNaN(single) || single < 0 || single > 23) {
      console.error('Batch index must be 0–23');
      process.exit(1);
    }
    const result = await runBatch(single);
    await mergeBatch(result);
    console.log(`Batch ${single} complete.`);
  } else {
    console.log('Running all 24 batches sequentially…');
    for (let i = 0; i < 24; i++) {
      const result = await runBatch(i);
      await mergeBatch(result);
    }
    console.log('Full refresh complete.');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

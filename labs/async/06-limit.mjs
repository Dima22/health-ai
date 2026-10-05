import { task } from './task.mjs';

const jobs = [
  { name: 'A', ms: 1000 },
  { name: 'B', ms: 600 },
  { name: 'C', ms: 300 },
  { name: 'D', ms: 500 },
  { name: 'E', ms: 200 },
];

let nextIndex = 0;
let active = 0;
let maxActive = 0;

const results = new Array(jobs.length);

async function worker() {
  while (nextIndex < jobs.length) {
    const index = nextIndex++;
    console.log(`index: ${index}, nextIndex: ${nextIndex}`);
    const job = jobs[index];

    active++;
    maxActive = Math.max(maxActive, active);

    console.log(`Active: ${active}`);

    try {
      results[index] = await task(job.name, job.ms);
    } finally {
      active--;
    }
  }
}

console.time('limited');

await Promise.all([
  worker(),
  worker(),
]);

console.timeEnd('limited');

console.log('Results:', results);
console.log('Maximum active:', maxActive);

if (maxActive > 2) {
  throw new Error('Concurrency limit exceeded');
}
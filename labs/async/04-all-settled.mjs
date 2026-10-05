import { task } from './task.mjs';

console.time('allSettled');

const results = await Promise.allSettled([
  task('A', 1000),
  task('B', 600, true),
  task('C', 300),
]);

for (const result of results) {
  if (result.status === 'fulfilled') {
    console.log('Success:', result.value);
  } else {
    console.log('Failure:', result.reason.message);
  }
}

console.timeEnd('allSettled');
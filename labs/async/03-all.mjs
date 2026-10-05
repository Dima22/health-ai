import { task } from './task.mjs';

const shouldFail = process.argv.includes('--fail');

console.time('all');

try {
  const results = await Promise.all([
    task('A', 1000),
    task('B', 600, shouldFail),
    task('C', 300),
  ]);

  console.log(results);
} catch (error) {
  console.log('Caught:', error.message);
} finally {
  console.timeEnd('all');
}
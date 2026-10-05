import { task } from './task.mjs';

console.time('sequential');

const first = await task('A', 1000);
const second = await task('B', 600, 1);
const third = await task('C', 300);

console.log([first, second, third]);

console.timeEnd('sequential');
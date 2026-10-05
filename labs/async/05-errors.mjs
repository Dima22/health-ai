import { task } from './task.mjs';

// Вариант 1: await позволяет обработать отказ через try/catch.
try {
  await task('with-await', 300, true);
} catch (error) {
  console.log('Caught by try/catch:', error.message);
}

// Вариант 2: Promise не ожидается, отказ обрабатываем через .catch().
try {
  const pending = task('without-await', 300, true);

  pending.catch((error) => {
    console.log('Caught by .catch():', error.message);
  });

  console.log('Continued without waiting');
} catch (error) {
  console.log('Outer catch:', error.message);
}
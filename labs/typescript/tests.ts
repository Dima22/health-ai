const value: { pmid: string } = { pmid: '1001' };
console.log(value.pmid); 

function cleanText(value: unknown): string {
  if (typeof value !== 'string') {
    throw new Error('Value must be a string');
  }

  return value.trim();
}

const users = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
  { name: 'Charlie', age: 35 },
];

function pluck<T, K extends keyof T>(array: T[], key: K): T[K][] {
  return array.map(item => item[key]);
}

console.log(pluck(users, 'name')); // ['Alice', 'Bob', 'Charlie']
console.log(pluck(users, 'age')); // [30, 25, 35]

function getFirstElement<T>(array: T[]): T | undefined {
  return array[0];
}

const numbers = [1, 2, 3];
const firstNumber = getFirstElement(numbers);
console.log(firstNumber); // 1

const strings = ['a', 'b', 'c'];
const firstString = getFirstElement(strings);
console.log(firstString); // 'a'
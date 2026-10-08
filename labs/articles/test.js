// 1. Генерируем тестовые данные: 100 000 пользователей с повторяющимися id
console.log("Генерация данных...");
const users = [];
for (let i = 0; i < 100000; i++) {
  // id будут повторяться от 0 до 49999 (каждый id встретится дважды)
  const id = i % 50000; 
  users.push({ id: id, name: `User_${id}` });
}
console.log("Данные готовы. Начинаем тесты...\n");

// ==========================================
// ТЕСТ 0: Фильтрация через обычный МАССИВ (.includes)
// ==========================================
console.time("Массив includes");

const uniqueIncludesArray = [];
const seen = [];
for (const user of users) {
  if (seen.includes(user.id)) continue;
    uniqueIncludesArray.push(user);
    seen.push(user.id);
}

console.timeEnd("Массив includes");


// ==========================================
// ТЕСТ объект: без фильтрации, просто создаем объект с ключами по id
// ==========================================
console.time("Объект (O(N))");
const userMap = {};
for (const user of users) {
  userMap[user.id] = user;
}
const uniqueWithObject = Object.values(userMap);
console.timeEnd("Объект (O(N))");


// ==========================================
// ТЕСТ 1: Фильтрация через обычный МАССИВ (.some)
// ==========================================
console.time("Массив (O(N^2))");

const uniqueWithArray = [];
for (const user of users) {
  // .some() перебирает uniqueWithArray на каждом шаге!
  const isDuplicate = uniqueWithArray.some(u => u.id === user.id);
  if (!isDuplicate) {
    uniqueWithArray.push(user);
  }
}

console.timeEnd("Массив (O(N^2))");


// ==========================================
// ТЕСТ 2: Фильтрация через временный SET
// ==========================================
console.time("Set (O(N))");

const seenIds = new Set();
const uniqueWithSet = users.filter(user => {
  if (seenIds.has(user.id)) return false; // Мгновенная проверка O(1)
  seenIds.add(user.id); // Мгновенное добавление O(1)
  return true;
});

console.timeEnd("Set (O(N))");

// Проверка, что оба метода отработали одинаково правильно
console.log(`\nРезультат: Массив нашел ${uniqueWithArray.length} уникальных, Set нашел ${uniqueWithSet.length}, Объект нашел ${uniqueWithObject.length} уникальных.`);
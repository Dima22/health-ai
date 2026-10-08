import assert from 'node:assert/strict';
import { rawArticles } from './data.mjs';

import {
  tryNormalizeArticle,
  uniqueByPmid,
  findArticleByPmid,
  ArticleIndex,
  normalizePmid,
  normalizeDate,
} from './article-utils.mjs';

const originalSnapshot = JSON.stringify(rawArticles);
const processed = rawArticles.map(tryNormalizeArticle);

const validArticles = processed
  .filter((result) => result.ok)
  .map((result) => result.article);

const errors = processed.filter((result) => !result.ok);

const { articles, duplicates } = uniqueByPmid(validArticles);

console.table(articles);
console.table(errors);
console.log('Duplicate PMIDs:', duplicates);

console.log('Function:', findArticleByPmid(articles, '1001'));

const index = new ArticleIndex(articles);

console.log('Class:', index.findByPmid('1001'));
console.log('Index size:', index.size);


// Количество записей на каждом этапе.
assert.equal(rawArticles.length, 10);
assert.equal(validArticles.length, 7);
assert.equal(errors.length, 3);
assert.equal(articles.length, 5);

// Повторы и номера отклонённых записей.
assert.deepEqual(duplicates, ['1001', '1002']);
assert.deepEqual(
  errors.map((error) => error.row),
  [5, 8, 9],
);

// Среди повторов сохраняется первая допустимая запись.
assert.equal(
  index.findByPmid('1001').title,
  'Sleep and health',
);

// Одинаковый заголовок не делает статьи дубликатами.
assert.equal(
  articles.filter(
    (article) => article.title === 'Sleep and health',
  ).length,
  2,
);

// Отсутствующая дата не подменяется.
assert.equal(
  index.findByPmid('1003').publishedAt,
  null,
);

// Разные смещения могут описывать один момент.
assert.equal(
  index.findByPmid('1001').publishedAt,
  index.findByPmid('1002').publishedAt,
);

// Переход к UTC может изменить календарный день.
assert.equal(
  index.findByPmid('1005').publishedAt,
  '2026-09-30T21:30:00.000Z',
);

// Неверные значения должны приводить к ошибке.
assert.throws(() => normalizePmid('   '));
assert.throws(() => normalizePmid('1001abc'));

assert.throws(
  () => normalizeDate('2026-02-30T10:00:00Z'),
);

assert.throws(
  () => normalizeDate('2026-10-01T12:00:00'),
);

assert.throws(() => normalizeDate(''));

// Проверка високосного года.
assert.equal(
  normalizeDate('2024-02-29T10:00:00Z'),
  '2024-02-29T10:00:00.000Z',
);

assert.throws(
  () => normalizeDate('2026-02-29T10:00:00Z'),
);

// Класс и функция находят одну и ту же статью.
assert.equal(
  index.findByPmid('1001'),
  findArticleByPmid(articles, '1001'),
);

assert.equal(index.size, 5);
assert.equal(index.findByPmid('9999'), undefined);

// Исходный массив и его данные не изменились.
assert.equal(
  JSON.stringify(rawArticles),
  originalSnapshot,
);

console.log('All assertions passed');
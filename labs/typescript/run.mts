import assert from 'node:assert/strict';

import { rawArticles } from './data.mjs';
import { parseArticlesResponse } from './api-client.mjs';

import {
  normalizeArticle,
  tryNormalizeArticle,
  uniqueByPmid,
} from './article-utils.mjs';

import type { Article, NormalizeResult } from './types.mjs';

// Имитируем текст внешнего HTTP-ответа.
const responseText = JSON.stringify(rawArticles);

const response = parseArticlesResponse(responseText);

if (!response.ok) {
  throw new Error(
    `${response.error.code}: ${response.error.message}`,
  );
}

// Здесь data — unknown[], а не ArticleInput[].
/*const processed = response.data.map((raw, index) =>
  tryNormalizeArticle(raw as Parameters<typeof tryNormalizeArticle>[0], index),
);*/
const processed = response.data.map(tryNormalizeArticle);


const validArticles: Article[] = [];

const failures: NormalizeResult[] = [];

for (const result of processed) {
  if (result.ok) {
    validArticles.push(result.article);
  } else {
    failures.push(result);
  }
}

const { articles, duplicates } = uniqueByPmid(validArticles);

console.table(articles);
console.dir(failures, { depth: null });
console.log('Duplicates:', duplicates);

assert.equal(response.data.length, 10);
assert.equal(validArticles.length, 7);
assert.equal(failures.length, 3);
assert.equal(articles.length, 5);

assert.deepEqual(duplicates, ['1001', '1002']);

// Сломанный JSON.
const invalidJson = parseArticlesResponse('{broken');

assert.equal(invalidJson.ok, false);

if (!invalidJson.ok) {
  assert.equal(invalidJson.error.code, 'INVALID_JSON');
}

// Валидный JSON, но неверная структура ответа.
const invalidResponse = parseArticlesResponse('{"items": []}');

assert.equal(invalidResponse.ok, false);

if (!invalidResponse.ok) {
  assert.equal(invalidResponse.error.code, 'INVALID_RESPONSE');
}

// Некорректный объект статьи из внешнего источника.
const invalidArticle = tryNormalizeArticle(
  { pmid: 1001, title: 'Example' },
  0,
);

assert.equal(invalidArticle.ok, false);

if (!invalidArticle.ok) {
  assert.equal(invalidArticle.error.code, 'INVALID_ARTICLE');
}

console.log('All TypeScript lab assertions passed');

normalizeArticle({
  pmid: '1001',
  title: 'Example',
  publishedAt: null,
});

// Компиляция разрешена: функция специально принимает unknown.
// Неверный PMID будет обнаружен во время выполнения.
tryNormalizeArticle(
  { pmid: 1001, title: 'Example' },
  0,
);
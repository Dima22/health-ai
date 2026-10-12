import type {
  ArticleInput,
  Article,
  NormalizeResult,
  DeduplicationResult,
} from './types.mjs';

export function normalizeDate(value: string|null|undefined): string|null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== 'string') {
    throw new Error('Date must be a string');
  }

  const pattern =
    /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/;

  const match = pattern.exec(value);

  if (!match) {
    throw new Error('Date must include time and timezone');
  }

  // Проверяем календарную часть отдельно от смещения.
  const localTime = Date.parse(`${match[1]}Z`);

  if (
    !Number.isFinite(localTime) ||
    new Date(localTime).toISOString().slice(0, 19) !== match[1]
  ) {
    throw new Error('Invalid calendar date');
  }

  // Теперь разбираем исходное значение с его смещением.
  const timestamp = Date.parse(value);

  if (!Number.isFinite(timestamp)) {
    throw new Error('Invalid date');
  }

  return new Date(timestamp).toISOString();
}

export function normalizePmid(value: string): string {
  if (typeof value !== 'string') {
    throw new Error('PMID must be a string');
  }

  const pmid = value.trim();

  if (!/^[1-9]\d*$/.test(pmid)) {
    throw new Error('Invalid PMID');
  }

  return pmid;
}

export function normalizeArticle(raw: ArticleInput): Article {
  const pmid = normalizePmid(raw.pmid);

  if (
    typeof raw.title !== 'string' ||
    raw.title.trim() === ''
  ) {
    throw new Error('Title is required');
  }

  return {
    pmid,
    title: raw.title.trim(),
    publishedAt: normalizeDate(raw.publishedAt),
  };
}

export function uniqueByPmid(
  articles: readonly Article[],
): DeduplicationResult {
  const byPmid = new Map<string, Article>();
  const duplicates: string[] = [];

  for (const article of articles) {
    if (byPmid.has(article.pmid)) {
      duplicates.push(article.pmid);
      continue;
    }

    byPmid.set(article.pmid, article);
  }

  return {
    articles: [...byPmid.values()],
    duplicates,
  };
}

export function findArticleByPmid(articles: Article[], pmid: string): Article | undefined {
  return articles.find((article) => article.pmid === pmid);
}

export class ArticleIndex {
  #byPmid: Map<string, Article>;

  constructor(articles: readonly Article[]) {
    this.#byPmid = new Map(
      articles.map((article) => [article.pmid, article]),
    );
  }

  findByPmid(pmid: string): Article | undefined {
    return this.#byPmid.get(pmid);
  }

  get size(): number {
    return this.#byPmid.size;
  }
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

export function readArticleInput(value: unknown): ArticleInput {
  if (!isRecord(value)) {
    throw new Error('Article must be an object');
  }

  const pmid = value.pmid;
  const title = value.title;
  const publishedAt = value.publishedAt;

  if (typeof pmid !== 'string') {
    throw new Error('PMID must be a string');
  }

  if (typeof title !== 'string') {
    throw new Error('Title must be a string');
  }

  if (
    publishedAt !== undefined &&
    publishedAt !== null &&
    typeof publishedAt !== 'string'
  ) {
    throw new Error('Date must be a string, null or absent');
  }

  return {
    pmid,
    title,
    publishedAt,
  };
}

export function tryNormalizeArticle(
  raw: unknown,
  index: number,
): NormalizeResult {
  try {
    const input = readArticleInput(raw);

    return {
      ok: true,
      article: normalizeArticle(input),
    };
  } catch (error: unknown) {
    return {
      ok: false,
      row: index + 1,
      pmid: isRecord(raw) && typeof raw.pmid === 'string' ? raw.pmid : '',
      error: {
        code: 'INVALID_ARTICLE',
        message:
          error instanceof Error
            ? error.message
            : 'Unknown normalization error',
      },
    };
  }
}
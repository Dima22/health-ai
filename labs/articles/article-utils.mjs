export function normalizeDate(value) {
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

export function normalizePmid(value) {
  if (typeof value !== 'string') {
    throw new Error('PMID must be a string');
  }

  const pmid = value.trim();

  if (!/^[1-9]\d*$/.test(pmid)) {
    throw new Error('Invalid PMID');
  }

  return pmid;
}

export function normalizeArticle(raw) {
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

export function tryNormalizeArticle(raw, index) {
  try {
    return {
      ok: true,
      article: normalizeArticle(raw),
    };
  } catch (error) {
    return {
      ok: false,
      row: index + 1,
      pmid: raw.pmid,
      error: error.message,
    };
  }
}

export function uniqueByPmid(articles) {
  const byPmid = new Map();
  const duplicates = [];

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

export function findArticleByPmid(articles, pmid) {
  return articles.find((article) => article.pmid === pmid);
}

export class ArticleIndex {
  #byPmid;

  constructor(articles) {
    this.#byPmid = new Map(
      articles.map((article) => [article.pmid, article]),
    );
  }

  findByPmid(pmid) {
    return this.#byPmid.get(pmid);
  }

  get size() {
    return this.#byPmid.size;
  }
}
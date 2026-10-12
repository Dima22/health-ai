export interface ArticleInput {
  pmid: string;
  title: string;
  publishedAt?: string | null;
}

export interface Article {
  pmid: string;
  title: string;
  publishedAt: string | null;
}

export type ApiErrorCode =
  | 'INVALID_JSON'
  | 'INVALID_RESPONSE'
  | 'INVALID_ARTICLE';

export interface ApiError {
  code: ApiErrorCode;
  message: string;
}

export type NormalizeResult = 
  | {
      ok: true;
      article: Article;
    }
  | {
      ok: false;
      row: number;
      pmid: string;
      error: ApiError;
    };

export interface DeduplicationResult {
  articles: Article[];
  duplicates: string[];
}

export type ApiClientResult =
  | {
      ok: true;
      data: unknown[];
    }
  | {
      ok: false;
      error: ApiError;
    };


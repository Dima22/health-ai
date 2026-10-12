import type { ApiClientResult, ArticleInput } from './types.mjs';

function isUnknownArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function parseArticlesResponse(
  responseText: string,
): ApiClientResult {
  let payload: unknown;

  try {
    payload = JSON.parse(responseText);
  } catch {
    return {
      ok: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Response is not valid JSON',
      },
    };
  }

  if (!isUnknownArray(payload)) {
    return {
      ok: false,
      error: {
        code: 'INVALID_RESPONSE',
        message: 'Expected an array of articles',
      },
    };
  }

  return {
    ok: true,
    data: payload,
  };
}
export type ApiPayload<T> = T | { data?: T; items?: T; value?: T; result?: T } | null | undefined;

export function unwrapApiData<T>(payload: unknown): T | null {
  if (payload == null) {
    return null;
  }

  if (Array.isArray(payload)) {
    return payload as T;
  }

  if (typeof payload !== 'object') {
    return payload as T;
  }

  const maybeObject = payload as Record<string, unknown>;
  const candidate =
    (maybeObject['data'] !== undefined ? maybeObject['data'] : undefined) ??
    (maybeObject['items'] !== undefined ? maybeObject['items'] : undefined) ??
    (maybeObject['value'] !== undefined ? maybeObject['value'] : undefined) ??
    (maybeObject['result'] !== undefined ? maybeObject['result'] : undefined);

  if (candidate !== undefined) {
    return unwrapApiData<T>(candidate);
  }

  return payload as T;
}

export function unwrapArrayData<T>(payload: unknown): T[] {
  const data = unwrapApiData<T | T[]>(payload);

  if (Array.isArray(data)) {
    return data as T[];
  }

  if (data == null) {
    return [];
  }

  return [data as T];
}

export interface CollectionClient<Item, Draft> {
  list: () => Promise<Item[]>;
  create: (draft: Draft) => Promise<Item>;
  update: (id: string, draft: Draft) => Promise<Item>;
  remove: (id: string) => Promise<void>;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!response.ok) {
    const failure = await response.json().catch(() => null) as { error?: string } | null;
    throw Object.assign(new Error(failure?.error ?? `HTTP ${response.status}`), { statusCode: response.status });
  }
  return (response.status === 204 ? undefined : await response.json()) as T;
}

/** REST client for a backend collection built by `createCollectionRoute`. */
export function createCollectionClient<Item, Draft>(endpoint: string): CollectionClient<Item, Draft> {
  const itemPath = (id: string) => `${endpoint}/${encodeURIComponent(id)}`;
  return {
    list: async () => (await requestJson<{ items: Item[] }>(endpoint)).items,
    create: draft => requestJson<Item>(endpoint, { method: 'POST', body: JSON.stringify(draft) }),
    update: (id, draft) => requestJson<Item>(itemPath(id), { method: 'PUT', body: JSON.stringify(draft) }),
    remove: id => requestJson<void>(itemPath(id), { method: 'DELETE' }),
  };
}

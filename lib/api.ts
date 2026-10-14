import type { BaseRecord, Flat, Material, MaterialTransaction, NewRecord, WorkNote } from './types';

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (res.status === 401) {
    // Session expired or access revoked: send the user back to sign in
    window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
    throw new ApiError('Unauthorized', 401);
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(body?.error ?? res.statusText, res.status);
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

export interface Entity<T extends BaseRecord> {
  /** sort: field name, prefixed with '-' for descending (e.g. '-created_date') */
  list: (sort?: string, limit?: number) => Promise<T[]>;
  filter: (query: Partial<Record<keyof T, string>>, sort?: string, limit?: number) => Promise<T[]>;
  get: (id: string) => Promise<T | null>;
  create: (data: NewRecord<T>) => Promise<T>;
  update: (id: string, data: Partial<NewRecord<T>>) => Promise<T>;
  delete: (id: string) => Promise<void>;
}

function entity<T extends BaseRecord>(name: string): Entity<T> {
  const base = `/api/entities/${name}`;

  const query = (params: Record<string, string | number | undefined>) => {
    const search = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v !== undefined) search.set(k, String(v));
    const qs = search.toString();
    return qs ? `${base}?${qs}` : base;
  };

  return {
    list: (sort, limit) => request(query({ sort, limit })),
    filter: (filters, sort, limit) => request(query({ ...filters, sort, limit })),
    get: async (id) => {
      try {
        return await request<T>(`${base}/${encodeURIComponent(id)}`);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }
    },
    create: (data) => request(base, { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`${base}/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => request(`${base}/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  };
}

export const api = {
  entities: {
    Flat: entity<Flat>('Flat'),
    Material: entity<Material>('Material'),
    WorkNote: entity<WorkNote>('WorkNote'),
    MaterialTransaction: entity<MaterialTransaction>('MaterialTransaction'),
  },
};

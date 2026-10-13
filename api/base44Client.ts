/**
 * Base44 API client.
 *
 * Mirrors the Base44 SDK entity API (list / filter / create / update / delete)
 * with a localStorage-backed implementation so the app runs standalone.
 * To use the real backend, replace the `base44` export with the SDK client:
 *
 *   import { createClient } from '@base44/sdk';
 *   export const base44 = createClient({ appId: import.meta.env.VITE_BASE44_APP_ID });
 *
 * Entity schemas live in /Entities.
 */

export interface BaseRecord {
  id: string;
  created_date: string;
  updated_date: string;
}

export type FlatStatus = 'Not Started' | 'In Progress' | 'Near Completion' | 'Completed' | 'Handed Over';

export interface Flat extends BaseRecord {
  flat_number: string;
  floor?: number;
  block?: string;
  status: FlatStatus;
  owner_name?: string;
}

export interface Material extends BaseRecord {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  min_stock_level?: number;
  location?: string;
}

export type TransactionType = 'Usage' | 'Restock' | 'Wastage' | 'Return';

export interface MaterialTransaction extends BaseRecord {
  material_id: string;
  type: TransactionType;
  quantity: number;
  flat_id?: string | null;
  notes?: string;
  date: string;
}

export interface WorkNote extends BaseRecord {
  flat_id: string;
  category: string;
  title: string;
  description?: string;
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Verified';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  image_url?: string;
}

export type NewRecord<T extends BaseRecord> = Omit<T, keyof BaseRecord>;

export interface Base44Entity<T extends BaseRecord> {
  /** sort: field name, prefixed with '-' for descending (e.g. '-created_date') */
  list: (sort?: string, limit?: number) => Promise<T[]>;
  filter: (query: Partial<T>, sort?: string, limit?: number) => Promise<T[]>;
  get: (id: string) => Promise<T | undefined>;
  create: (data: NewRecord<T>) => Promise<T>;
  update: (id: string, data: Partial<NewRecord<T>>) => Promise<T>;
  delete: (id: string) => Promise<void>;
}

const STORAGE_PREFIX = 'sitemanager:';

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;

function sortRecords<T>(records: T[], sort?: string): T[] {
  if (!sort) return records;
  const desc = sort.startsWith('-');
  const field = (desc ? sort.slice(1) : sort) as keyof T;
  return [...records].sort((a, b) => {
    const av = a[field] as unknown as string | number;
    const bv = b[field] as unknown as string | number;
    if (av === bv) return 0;
    const cmp = av > bv ? 1 : -1;
    return desc ? -cmp : cmp;
  });
}

function createLocalEntity<T extends BaseRecord>(name: string, seed: () => NewRecord<T>[]): Base44Entity<T> {
  const key = STORAGE_PREFIX + name;

  const read = (): T[] => {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      const now = new Date().toISOString();
      const seeded = seed().map((r) => ({ ...r, id: newId(), created_date: now, updated_date: now }) as T);
      write(seeded);
      return seeded;
    }
    try {
      return JSON.parse(raw) as T[];
    } catch {
      return [];
    }
  };

  const write = (records: T[]) => localStorage.setItem(key, JSON.stringify(records));

  const applyLimit = (records: T[], limit?: number) => (limit ? records.slice(0, limit) : records);

  return {
    list: async (sort, limit) => applyLimit(sortRecords(read(), sort), limit),

    filter: async (query, sort, limit) => {
      const matches = read().filter((r) =>
        Object.entries(query).every(([k, v]) => r[k as keyof T] === v)
      );
      return applyLimit(sortRecords(matches, sort), limit);
    },

    get: async (id) => read().find((r) => r.id === id),

    create: async (data) => {
      const now = new Date().toISOString();
      const record = { ...data, id: newId(), created_date: now, updated_date: now } as T;
      write([...read(), record]);
      return record;
    },

    update: async (id, data) => {
      const records = read();
      const index = records.findIndex((r) => r.id === id);
      if (index === -1) throw new Error(`${name} ${id} not found`);
      const { id: _id, created_date: _c, ...rest } = data as Partial<T>;
      const updated = { ...records[index], ...rest, updated_date: new Date().toISOString() } as T;
      records[index] = updated;
      write(records);
      return updated;
    },

    delete: async (id) => {
      write(read().filter((r) => r.id !== id));
    },
  };
}

// ---- Seed data (only used the first time the app runs in a browser) ----

const SEED_FLATS: NewRecord<Flat>[] = [
  { flat_number: 'A-101', floor: 1, block: 'A', status: 'Completed', owner_name: 'R. Sharma' },
  { flat_number: 'A-102', floor: 1, block: 'A', status: 'Near Completion' },
  { flat_number: 'A-201', floor: 2, block: 'A', status: 'In Progress', owner_name: 'P. Mehta' },
  { flat_number: 'A-202', floor: 2, block: 'A', status: 'In Progress' },
  { flat_number: 'B-101', floor: 1, block: 'B', status: 'In Progress' },
  { flat_number: 'B-102', floor: 1, block: 'B', status: 'Not Started' },
  { flat_number: 'B-201', floor: 2, block: 'B', status: 'Not Started' },
  { flat_number: 'B-202', floor: 2, block: 'B', status: 'Handed Over', owner_name: 'S. Iyer' },
];

const SEED_MATERIALS: NewRecord<Material>[] = [
  { name: 'UltraTech Cement', category: 'Cement', quantity: 120, unit: 'Bags', min_stock_level: 50, location: 'Shed 1' },
  { name: 'River Sand', category: 'Sand', quantity: 8, unit: 'Ton', min_stock_level: 10, location: 'Yard' },
  { name: 'Red Bricks', category: 'Bricks', quantity: 4500, unit: 'Pieces', min_stock_level: 2000, location: 'Yard' },
  { name: 'TMT Steel 12mm', category: 'Steel', quantity: 900, unit: 'Kg', min_stock_level: 1000, location: 'Shed 2' },
  { name: 'Vitrified Tiles 2x2', category: 'Tiles', quantity: 340, unit: 'Boxes', min_stock_level: 100, location: 'Shed 3' },
  { name: 'Asian Paints Emulsion', category: 'Paint', quantity: 60, unit: 'Liters', min_stock_level: 40, location: 'Store Room' },
  { name: 'CPVC Pipe 1"', category: 'Plumbing', quantity: 25, unit: 'Meters', min_stock_level: 30, location: 'Store Room' },
];

const seedNotes = (): NewRecord<WorkNote>[] => {
  const flats = localStorage.getItem(STORAGE_PREFIX + 'Flat');
  const ids: Record<string, string> = {};
  if (flats) for (const f of JSON.parse(flats) as Flat[]) ids[f.flat_number] = f.id;
  const at = (n: string) => ids[n];
  return [
    { flat_id: at('A-201'), category: 'Plumbing', title: 'Kitchen sink leakage', description: 'Joint under the sink is leaking. Needs re-sealing.', status: 'Pending', priority: 'High' },
    { flat_id: at('A-201'), category: 'Electrical', title: 'Bedroom switchboard', description: 'Switchboard not fixed flush with wall.', status: 'In Progress', priority: 'Medium' },
    { flat_id: at('A-102'), category: 'Painting', title: 'Final coat in living room', description: 'Second coat pending after putty touch-up.', status: 'Pending', priority: 'Low' },
    { flat_id: at('B-101'), category: 'Civil', title: 'Crack in balcony slab', description: 'Hairline crack observed. Inspect before tiling.', status: 'Pending', priority: 'Critical' },
    { flat_id: at('A-101'), category: 'Snag List', title: 'Door alignment', description: 'Main door rubs against the floor.', status: 'Resolved', priority: 'Medium' },
  ].filter((n) => n.flat_id) as NewRecord<WorkNote>[];
};

const Flat = createLocalEntity<Flat>('Flat', () => SEED_FLATS);

export const base44 = {
  entities: {
    Flat,
    Material: createLocalEntity<Material>('Material', () => SEED_MATERIALS),
    // Notes reference flat ids, so make sure flats are seeded first.
    WorkNote: createLocalEntity<WorkNote>('WorkNote', () => {
      void Flat.list();
      return seedNotes();
    }),
    MaterialTransaction: createLocalEntity<MaterialTransaction>('MaterialTransaction', () => []),
  },
};

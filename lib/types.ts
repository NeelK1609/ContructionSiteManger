// Shapes of records returned by /api/entities. Mirrors prisma/schema.prisma.

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

import 'server-only';
import { z } from 'zod';
import { prisma } from './db';
import {
  FLAT_STATUSES,
  MATERIAL_CATEGORIES,
  MATERIAL_UNITS,
  NOTE_CATEGORIES,
  NOTE_PRIORITIES,
  NOTE_STATUSES,
  TRANSACTION_TYPES,
} from './constants';

// Empty strings from forms become null so optional columns stay clean
const optionalText = (max = 2000) =>
  z.string().trim().max(max).nullish().transform((v) => v || null);

const flatSchema = z.object({
  flat_number: z.string().trim().min(1).max(50),
  floor: z.number().int().nullish(),
  block: optionalText(50),
  status: z.enum(FLAT_STATUSES).default('Not Started'),
  owner_name: optionalText(200),
});

const materialSchema = z.object({
  name: z.string().trim().min(1).max(200),
  category: z.enum(MATERIAL_CATEGORIES).default('Other'),
  quantity: z.number().finite(),
  unit: z.enum(MATERIAL_UNITS).default('Pieces'),
  min_stock_level: z.number().finite().min(0).nullish(),
  location: optionalText(200),
});

const transactionSchema = z.object({
  material_id: z.string().min(1),
  type: z.enum(TRANSACTION_TYPES).default('Usage'),
  quantity: z.number().finite().positive(),
  flat_id: z.string().min(1).nullish(),
  notes: optionalText(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD'),
});

const workNoteSchema = z.object({
  flat_id: z.string().min(1),
  category: z.enum(NOTE_CATEGORIES).default('Other'),
  title: z.string().trim().min(1).max(200),
  description: optionalText(5000),
  status: z.enum(NOTE_STATUSES).default('Pending'),
  priority: z.enum(NOTE_PRIORITIES).default('Medium'),
  image_url: optionalText(2000),
});

interface EntityConfig {
  // Prisma delegates don't share a common type, so they're accessed loosely here
  delegate: any;
  schema: z.AnyZodObject;
  /** Query-string fields a list request may filter on */
  filterable: string[];
  sortable: string[];
  /** Records that can't be edited or deleted once created */
  immutable?: boolean;
  create?: (data: Record<string, unknown>) => Promise<unknown>;
}

const common = ['created_date', 'updated_date'];

export const entities: Record<string, EntityConfig> = {
  Flat: {
    delegate: prisma.flat,
    schema: flatSchema,
    filterable: ['status', 'block'],
    sortable: [...common, 'flat_number', 'floor', 'block', 'status'],
  },
  Material: {
    delegate: prisma.material,
    schema: materialSchema,
    filterable: ['category'],
    sortable: [...common, 'name', 'category', 'quantity'],
  },
  WorkNote: {
    delegate: prisma.workNote,
    schema: workNoteSchema,
    filterable: ['flat_id', 'status', 'category', 'priority'],
    sortable: [...common, 'title', 'status', 'priority'],
  },
  MaterialTransaction: {
    delegate: prisma.materialTransaction,
    schema: transactionSchema,
    filterable: ['material_id', 'flat_id', 'type'],
    sortable: [...common, 'date', 'quantity'],
    // Transactions are a stock ledger: editing or deleting one would desync quantities
    immutable: true,
    // Record the transaction and adjust stock atomically
    create: async (data) => {
      const tx = data as z.infer<typeof transactionSchema>;
      const delta = tx.type === 'Usage' || tx.type === 'Wastage' ? -tx.quantity : tx.quantity;
      const [created] = await prisma.$transaction([
        prisma.materialTransaction.create({ data: tx }),
        prisma.material.update({
          where: { id: tx.material_id },
          data: { quantity: { increment: delta } },
        }),
      ]);
      return created;
    },
  },
};

export function getEntity(name: string): EntityConfig | undefined {
  return Object.hasOwn(entities, name) ? entities[name] : undefined;
}

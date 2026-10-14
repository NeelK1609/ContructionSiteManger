// Allowed values for enum-like fields, shared by forms and server validation.
// Keep in sync with the JSON schemas in /Entities.

export const FLAT_STATUSES = ['Not Started', 'In Progress', 'Near Completion', 'Completed', 'Handed Over'] as const;

export const MATERIAL_CATEGORIES = ['Cement', 'Sand', 'Bricks', 'Steel', 'Tiles', 'Paint', 'Hardware', 'Plumbing', 'Electrical', 'Wood', 'Other'] as const;
export const MATERIAL_UNITS = ['Bags', 'Kg', 'Ton', 'Sq.ft', 'Pieces', 'Liters', 'Meters', 'Boxes'] as const;

export const TRANSACTION_TYPES = ['Usage', 'Restock', 'Wastage', 'Return'] as const;

export const NOTE_CATEGORIES = ['Plumbing', 'Flooring', 'Electrical', 'Painting', 'Carpentry', 'Civil', 'Finishing', 'Snag List', 'Other'] as const;
export const NOTE_STATUSES = ['Pending', 'In Progress', 'Resolved', 'Verified'] as const;
export const NOTE_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const;

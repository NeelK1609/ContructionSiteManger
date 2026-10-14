import { NextResponse, type NextRequest } from 'next/server';
import { getEntity } from '@/lib/entities';
import { errorResponse, requireUser } from '@/lib/api-helpers';

type Params = { params: { entity: string } };

const MAX_LIMIT = 1000;

// GET /api/entities/:entity?sort=-created_date&limit=5&<field>=<value>
export async function GET(req: NextRequest, { params }: Params) {
  const denied = await requireUser();
  if (denied) return denied;

  const config = getEntity(params.entity);
  if (!config) return NextResponse.json({ error: 'Unknown entity' }, { status: 404 });

  const search = req.nextUrl.searchParams;
  const where: Record<string, string> = {};
  for (const field of config.filterable) {
    const value = search.get(field);
    if (value !== null) where[field] = value;
  }

  const sort = search.get('sort');
  let orderBy: Record<string, 'asc' | 'desc'> | undefined;
  if (sort) {
    const desc = sort.startsWith('-');
    const field = desc ? sort.slice(1) : sort;
    if (!config.sortable.includes(field)) {
      return NextResponse.json({ error: `Cannot sort by ${field}` }, { status: 400 });
    }
    orderBy = { [field]: desc ? 'desc' : 'asc' };
  }

  const limit = Number(search.get('limit'));
  const take = Number.isInteger(limit) && limit > 0 ? Math.min(limit, MAX_LIMIT) : MAX_LIMIT;

  try {
    const records = await config.delegate.findMany({ where, orderBy, take });
    return NextResponse.json(records);
  } catch (error) {
    return errorResponse(error);
  }
}

// POST /api/entities/:entity
export async function POST(req: NextRequest, { params }: Params) {
  const denied = await requireUser();
  if (denied) return denied;

  const config = getEntity(params.entity);
  if (!config) return NextResponse.json({ error: 'Unknown entity' }, { status: 404 });

  try {
    const data = config.schema.parse(await req.json());
    const record = config.create ? await config.create(data) : await config.delegate.create({ data });
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

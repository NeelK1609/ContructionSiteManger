import { NextResponse, type NextRequest } from 'next/server';
import { getEntity } from '@/lib/entities';
import { errorResponse, requireUser } from '@/lib/api-helpers';

type Params = { params: { entity: string; id: string } };

// GET /api/entities/:entity/:id
export async function GET(_req: NextRequest, { params }: Params) {
  const denied = await requireUser();
  if (denied) return denied;

  const config = getEntity(params.entity);
  if (!config) return NextResponse.json({ error: 'Unknown entity' }, { status: 404 });

  try {
    const record = await config.delegate.findUnique({ where: { id: params.id } });
    if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(record);
  } catch (error) {
    return errorResponse(error);
  }
}

// PATCH /api/entities/:entity/:id
export async function PATCH(req: NextRequest, { params }: Params) {
  const denied = await requireUser();
  if (denied) return denied;

  const config = getEntity(params.entity);
  if (!config) return NextResponse.json({ error: 'Unknown entity' }, { status: 404 });
  if (config.immutable) return NextResponse.json({ error: 'Records of this type cannot be edited' }, { status: 405 });

  try {
    const data = config.schema.partial().parse(await req.json());
    const record = await config.delegate.update({ where: { id: params.id }, data });
    return NextResponse.json(record);
  } catch (error) {
    return errorResponse(error);
  }
}

// DELETE /api/entities/:entity/:id
export async function DELETE(_req: NextRequest, { params }: Params) {
  const denied = await requireUser();
  if (denied) return denied;

  const config = getEntity(params.entity);
  if (!config) return NextResponse.json({ error: 'Unknown entity' }, { status: 404 });
  if (config.immutable) return NextResponse.json({ error: 'Records of this type cannot be deleted' }, { status: 405 });

  try {
    await config.delegate.delete({ where: { id: params.id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}

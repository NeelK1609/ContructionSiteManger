import 'server-only';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { auth } from '@/auth';
import { isAllowedEmail } from '@/lib/access';

/** Returns a 401 response unless the caller is signed in with an allowed email. */
export async function requireUser(): Promise<NextResponse | null> {
  const session = await auth();
  if (!(await isAllowedEmail(session?.user?.email))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export function errorResponse(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    const message = error.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`).join('; ');
    return NextResponse.json({ error: message }, { status: 400 });
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (error.code === 'P2003') return NextResponse.json({ error: 'Referenced record does not exist' }, { status: 400 });
  }
  if (error instanceof SyntaxError) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  console.error(error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}

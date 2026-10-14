'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { isAdminEmail, normalizeEmail } from '@/lib/access';

async function requireAdmin() {
  const session = await auth();
  if (!isAdminEmail(session?.user?.email)) redirect('/');
  return session!.user!.email!;
}

const emailSchema = z.string().trim().toLowerCase().email();

export async function addMember(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = emailSchema.safeParse(formData.get('email'));
  if (!parsed.success) redirect('/team?error=invalid');

  const email = normalizeEmail(parsed.data);
  if (isAdminEmail(email)) redirect('/team?error=admin');

  await prisma.allowedUser.upsert({
    where: { email },
    update: {},
    create: { email, added_by: admin },
  });
  revalidatePath('/team');
  redirect(`/team?added=${encodeURIComponent(email)}`);
}

export async function removeMember(formData: FormData) {
  await requireAdmin();
  const email = normalizeEmail(String(formData.get('email') ?? ''));
  // Admins live in ADMIN_EMAILS and can't be removed here
  if (!email || isAdminEmail(email)) redirect('/team');

  await prisma.allowedUser.deleteMany({ where: { email } });
  // Revoke any unused magic links so they can't sign back in with one
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });
  revalidatePath('/team');
  redirect(`/team?removed=${encodeURIComponent(email)}`);
}

import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { isAdminEmail, isAllowedEmail } from '@/lib/access';
import AppShell from '@/components/AppShell';

// Middleware only ensures a session exists; the allowlist is enforced here
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  // The login page shows this error instead of redirecting back, so this can't loop
  if (!(await isAllowedEmail(session.user.email))) redirect('/login?error=AccessDenied');

  return (
    <AppShell user={session.user} isAdmin={isAdminEmail(session.user.email)}>
      {children}
    </AppShell>
  );
}

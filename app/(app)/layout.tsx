import { redirect } from 'next/navigation';
import { auth, isAllowedEmail } from '@/auth';
import AppShell from '@/components/AppShell';

// Middleware only ensures a session exists; the allowlist is enforced here
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  // The login page shows this error instead of redirecting back, so this can't loop
  if (!isAllowedEmail(session.user.email)) redirect('/login?error=AccessDenied');

  return <AppShell user={session!.user}>{children}</AppShell>;
}

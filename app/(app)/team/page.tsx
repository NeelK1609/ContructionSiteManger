import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import { ShieldCheck, UserPlus, Users } from 'lucide-react';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { getAdminEmails, isAdminEmail } from '@/lib/access';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import RemoveMemberButton from '@/components/team/RemoveMemberButton';
import { addMember } from './actions';

export const metadata = { title: 'Team · SiteManager' };

const ERRORS: Record<string, string> = {
  invalid: 'Enter a valid email address.',
  admin: 'That person is already an admin.',
};

export default async function TeamPage({
  searchParams,
}: {
  searchParams: { error?: string; added?: string; removed?: string };
}) {
  const session = await auth();
  if (!isAdminEmail(session?.user?.email)) redirect('/');

  const admins = getAdminEmails();
  const members = await prisma.allowedUser.findMany({ orderBy: { created_date: 'desc' } });
  const joined = new Set(
    (await prisma.user.findMany({
      where: { email: { in: [...admins, ...members.map((m) => m.email)] } },
      select: { email: true },
    })).map((u) => u.email.toLowerCase())
  );

  const notice = searchParams.error
    ? { tone: 'error', text: ERRORS[searchParams.error] ?? 'Something went wrong.' }
    : searchParams.added
      ? { tone: 'ok', text: `${searchParams.added} can now sign in. Send them the site link.` }
      : searchParams.removed
        ? { tone: 'ok', text: `Access removed for ${searchParams.removed}.` }
        : null;

  const status = (email: string) =>
    joined.has(email) ? (
      <Badge variant="secondary" className="bg-green-50 text-green-700 font-normal">Joined</Badge>
    ) : (
      <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-normal">Invited</Badge>
    );

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Team Access</h1>
        <p className="text-slate-500 mt-1">
          Only people listed here can sign in. Removing someone locks them out immediately.
        </p>
      </div>

      {notice && (
        <div
          role="status"
          className={`text-sm rounded-lg p-3 border ${
            notice.tone === 'error' ? 'text-red-700 bg-red-50 border-red-100' : 'text-green-700 bg-green-50 border-green-100'
          }`}
        >
          {notice.text}
        </div>
      )}

      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="w-5 h-5 text-orange-600" /> Add a person
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Keyed on the last result so the input clears after each add */}
          <form key={searchParams.added ?? searchParams.error ?? ''} action={addMember} className="flex flex-col sm:flex-row gap-2">
            <Input name="email" type="email" required placeholder="name@example.com" aria-label="Email address" />
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white shrink-0">
              Give access
            </Button>
          </form>
          <p className="text-xs text-slate-500 mt-2">
            They can sign in with an email link, or with Google if it&apos;s a Google account.
          </p>
        </CardContent>
      </Card>

      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-orange-600" /> People with access
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((email) => (
                <TableRow key={email}>
                  <TableCell className="font-medium break-all">{email}</TableCell>
                  <TableCell>{status(email)}</TableCell>
                  <TableCell className="hidden sm:table-cell text-slate-500 text-sm">-</TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500" title="Admins are set with ADMIN_EMAILS">
                      <ShieldCheck className="w-4 h-4 text-orange-600" /> Admin
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {members.map((m) => (
                <TableRow key={m.email}>
                  <TableCell className="font-medium break-all">{m.email}</TableCell>
                  <TableCell>{status(m.email)}</TableCell>
                  <TableCell className="hidden sm:table-cell text-slate-500 text-sm">
                    {format(m.created_date, 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <RemoveMemberButton email={m.email} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {members.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-slate-500">
                    No one else has access yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { removeMember } from '@/app/(app)/team/actions';

export default function RemoveMemberButton({ email }: { email: string }) {
  return (
    <form
      action={removeMember}
      onSubmit={(e) => {
        if (!confirm(`Remove access for ${email}? They'll be signed out on their next action.`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="email" value={email} />
      <Button type="submit" variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
        <Trash2 className="w-4 h-4 mr-1" /> Remove
      </Button>
    </form>
  );
}

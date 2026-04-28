'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';

interface Member {
  id: string;
  email: string;
  full_name: string | null;
  role: 'owner' | 'admin' | 'member';
  joined_at: string | null;
}

interface MemberListProps {
  members: Member[];
  currentUserId: string;
}

const roleVariant = {
  owner: 'success',
  admin: 'warning',
  member: 'default',
} as const;

export function MemberList({ members, currentUserId }: MemberListProps) {
  const t = useTranslations('team');

  if (members.length === 0) {
    return (
      <p className="text-sm text-slate-500 py-4 text-center">{t('noMembers')}</p>
    );
  }

  return (
    <ul className="divide-y divide-obsidian-700">
      {members.map((member) => (
        <li key={member.id} className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-obsidian-600 flex items-center justify-center text-sm font-medium text-slate-300">
              {(member.full_name ?? member.email).charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">
                {member.full_name ?? member.email}
                {member.id === currentUserId && (
                  <span className="ml-2 text-xs text-slate-500">({t('you')})</span>
                )}
              </p>
              {member.full_name && (
                <p className="text-xs text-slate-500">{member.email}</p>
              )}
            </div>
          </div>
          <Badge variant={roleVariant[member.role]}>
            {t(member.role as 'owner')}
          </Badge>
        </li>
      ))}
    </ul>
  );
}

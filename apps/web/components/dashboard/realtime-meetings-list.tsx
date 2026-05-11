'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import { MeetingRow } from '@/components/meetings/meeting-row';
import { createClient } from '@/lib/supabase/client';
import type { Meeting } from '@/types/database';

interface Props {
  initialMeetings: Meeting[];
  userId: string;
}

export function RealtimeMeetingsList({ initialMeetings, userId }: Props) {
  const t = useTranslations('dashboard');
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('dashboard-meetings')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'meetings',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setMeetings((prev) => [payload.new as Meeting, ...prev].slice(0, 5));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'meetings',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setMeetings((prev) =>
            prev.map((m) => (m.id === (payload.new as Meeting).id ? (payload.new as Meeting) : m))
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  if (meetings.length === 0) {
    return (
      <div className="rounded-2xl bg-obsidian-800/40 border border-obsidian-700 p-8 text-center">
        <p className="text-slate-500 text-sm">{t('recent.empty')}</p>
        <Link
          href="/meetings/new"
          className="inline-block mt-3 px-4 py-2 rounded-xl bg-phosphor text-obsidian-950 text-sm font-semibold hover:bg-phosphor-glow transition-colors"
        >
          {t('newMeeting')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {meetings.map((meeting) => (
        <MeetingRow key={meeting.id} meeting={meeting} />
      ))}
    </div>
  );
}

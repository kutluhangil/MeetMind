import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Link } from '@/lib/navigation';
import { MeetingsList } from '@/components/meetings/meetings-list';
import type { Meeting } from '@/types/database';

export default async function MeetingsPage() {
  const t = await getTranslations('meeting');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: meetings } = await supabase
    .from('meetings')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(50);

  const list: Meeting[] = meetings ?? [];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-slate-100">{t('list.title')}</h1>
        <Link
          href="/meetings/new"
          className="px-4 py-2 rounded-xl bg-phosphor text-obsidian-950 text-sm font-semibold hover:bg-phosphor-glow transition-colors"
        >
          + {t('list.newButton')}
        </Link>
      </div>

      <MeetingsList initialMeetings={list} />
    </div>
  );
}

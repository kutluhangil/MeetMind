import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { ActionListWrapper } from '@/components/meetings/action-list-wrapper';
import { Link } from '@/lib/navigation';

interface Props {
  params: { id: string; locale: string };
}

export default async function MeetingActionsPage({ params }: Props) {
  const t = await getTranslations('meeting');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: meeting } = await supabase
    .from('meetings')
    .select('id, title, status')
    .eq('id', params.id)
    .single();

  if (!meeting) notFound();

  const { data: actionItems } = await supabase
    .from('action_items')
    .select('*')
    .eq('meeting_id', params.id)
    .order('created_at', { ascending: true });

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/meetings/${params.id}` as '/meetings/[id]'}
          className="text-slate-500 hover:text-slate-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <p className="text-xs text-slate-500">{meeting.title}</p>
          <h1 className="text-xl font-bold text-slate-100">{t('sections.actions')}</h1>
        </div>
      </div>

      <ActionListWrapper
        meetingId={params.id}
        initialItems={actionItems ?? []}
      />
    </div>
  );
}

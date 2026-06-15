import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { IntegrationsForm } from './integrations-form';

export default async function IntegrationsPage() {
  const t = await getTranslations('settings');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('slack_webhook_url, notion_api_key, notion_database_id')
    .eq('id', user?.id ?? '')
    .single();

  return (
    <div className="p-6 max-w-lg space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 mb-6">{t('integrations.title')}</h1>
        <p className="text-slate-400 text-sm mb-6">
          Configure external integrations to share your summaries, transcripts, and key action items automatically or manually.
        </p>
        <IntegrationsForm
          initialSlackWebhook={profile?.slack_webhook_url ?? ''}
          initialNotionKey={profile?.notion_api_key ?? ''}
          initialNotionDb={profile?.notion_database_id ?? ''}
        />
      </div>
    </div>
  );
}

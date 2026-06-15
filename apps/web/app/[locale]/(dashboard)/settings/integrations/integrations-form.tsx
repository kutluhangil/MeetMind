'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUiStore } from '@/stores/ui-store';

interface IntegrationsFormProps {
  initialSlackWebhook: string;
  initialNotionKey: string;
  initialNotionDb: string;
}

export function IntegrationsForm({
  initialSlackWebhook,
  initialNotionKey,
  initialNotionDb,
}: IntegrationsFormProps) {
  const t = useTranslations('settings.integrations');
  const addToast = useUiStore((s: { addToast: (t: { message: string; type: 'success' | 'error' | 'info' }) => void }) => s.addToast);

  const [slackWebhook, setSlackWebhook] = useState(initialSlackWebhook);
  const [notionKey, setNotionKey] = useState(initialNotionKey);
  const [notionDb, setNotionDb] = useState(initialNotionDb);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slack_webhook_url: slackWebhook || null,
          notion_api_key: notionKey || null,
          notion_database_id: notionDb || null,
        }),
      });
      if (!res.ok) throw new Error();
      addToast({ message: t('saved'), type: 'success' });
    } catch {
      addToast({ message: t('error'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Slack Integration */}
      <div className="space-y-2 p-5 rounded-2xl bg-obsidian-800/40 border border-obsidian-600/80">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523 2.528 2.528 0 0 1-2.522-2.523 2.528 2.528 0 0 1 2.522-2.52h2.52v2.52zm1.261 0a2.528 2.528 0 0 1 2.52-2.52h5.043a2.528 2.528 0 0 1 2.522 2.52v5.042a2.528 2.528 0 0 1-2.522 2.52H8.823a2.528 2.528 0 0 1-2.52-2.52v-5.042zM8.823 5.043a2.528 2.528 0 0 1 2.52-2.522 2.528 2.528 0 0 1 2.522 2.522v2.52h-2.522a2.528 2.528 0 0 1-2.52-2.52zm0 1.261a2.528 2.528 0 0 1 2.52 2.52v5.043a2.528 2.528 0 0 1-2.52 2.522H3.78a2.528 2.528 0 0 1-2.522-2.522V8.824a2.528 2.528 0 0 1 2.522-2.52h5.043zm10.135 3.761a2.528 2.528 0 0 1 2.522-2.52 2.528 2.528 0 0 1 2.52 2.52 2.528 2.528 0 0 1-2.52 2.522h-2.522v-2.522zm-1.262 0a2.528 2.528 0 0 1-2.52 2.522h-5.043a2.528 2.528 0 0 1-2.522-2.522V3.78a2.528 2.528 0 0 1 2.522-2.522h5.043a2.528 2.528 0 0 1 2.52 2.522v5.043zM15.166 18.958a2.528 2.528 0 0 1-2.522 2.522 2.528 2.528 0 0 1-2.52-2.522v-2.52h2.52a2.528 2.528 0 0 1 2.522 2.52zm0-1.262a2.528 2.528 0 0 1-2.522-2.52v-5.043a2.528 2.528 0 0 1 2.522-2.52h5.043a2.528 2.528 0 0 1 2.52 2.52v5.043a2.528 2.528 0 0 1-2.52 2.52h-5.043z" />
          </svg>
          Slack Webhook
        </h3>
        <Input
          label={t('slackWebhook')}
          value={slackWebhook}
          onChange={(e) => setSlackWebhook(e.target.value)}
          placeholder={t('slackPlaceholder')}
          className="bg-obsidian-900 border-obsidian-700 focus:border-phosphor/50"
        />
        <p className="text-[11px] text-slate-500">
          Post summaries and action items directly to a Slack channel via incoming webhooks.
        </p>
      </div>

      {/* Notion Integration */}
      <div className="space-y-4 p-5 rounded-2xl bg-obsidian-800/40 border border-obsidian-600/80">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <svg className="w-5 h-5 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4.2 3h15.6c.7 0 1.2.5 1.2 1.2v15.6c0 .7-.5 1.2-1.2 1.2H4.2c-.7 0-1.2-.5-1.2-1.2V4.2c0-.7.5-1.2 1.2-1.2zm2.6 3.6v10.8c0 .3.2.6.5.6h.7c.3 0 .5-.2.5-.5V9.4l5.9 8.2c.2.2.4.4.7.4h.7c.3 0 .5-.3.5-.6V6.6c0-.3-.2-.6-.5-.6h-.7c-.3 0-.5.2-.5.5v7.2l-5.9-8.2c-.2-.2-.4-.4-.7-.4h-.7c-.3 0-.5.3-.5.6z" />
          </svg>
          Notion Database
        </h3>
        <Input
          label={t('notionKey')}
          type="password"
          value={notionKey}
          onChange={(e) => setNotionKey(e.target.value)}
          placeholder={t('notionKeyPlaceholder')}
          className="bg-obsidian-900 border-obsidian-700 focus:border-phosphor/50"
        />
        <Input
          label={t('notionDb')}
          value={notionDb}
          onChange={(e) => setNotionDb(e.target.value)}
          placeholder={t('notionDbPlaceholder')}
          className="bg-obsidian-900 border-obsidian-700 focus:border-phosphor/50"
        />
        <p className="text-[11px] text-slate-500">
          Export meeting minutes directly to your Notion workspace as database pages.
        </p>
      </div>

      <Button type="submit" loading={loading} className="w-full">
        {t('save')}
      </Button>
    </form>
  );
}

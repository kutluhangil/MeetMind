'use client';

import { useState } from 'react';
import { useUiStore } from '@/stores/ui-store';
import { Link } from '@/lib/navigation';

interface IntegrationDispatchProps {
  meetingId: string;
  hasSlack: boolean;
  hasNotion: boolean;
  locale: string;
}

export function IntegrationDispatch({
  meetingId,
  hasSlack,
  hasNotion,
  locale,
}: IntegrationDispatchProps) {
  const addToast = useUiStore((s: { addToast: (t: { message: string; type: 'success' | 'error' | 'info' }) => void }) => s.addToast);
  const [sendingSlack, setSendingSlack] = useState(false);
  const [sendingNotion, setSendingNotion] = useState(false);

  const isTr = locale === 'tr';

  const handleDispatch = async (target: 'slack' | 'notion') => {
    if (target === 'slack') setSendingSlack(true);
    else setSendingNotion(true);

    try {
      const res = await fetch(`/api/meetings/${meetingId}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target }),
      });
      const data = await res.json() as { success: boolean; error?: string };

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch');
      }

      addToast({
        message: target === 'slack'
          ? (isTr ? 'Özet başarıyla Slack\'e gönderildi!' : 'Summary successfully sent to Slack!')
          : (isTr ? 'Özet başarıyla Notion\'a aktarıldı!' : 'Summary successfully exported to Notion!'),
        type: 'success',
      });
    } catch (err) {
      addToast({
        message: err instanceof Error ? err.message : (isTr ? 'İşlem başarısız oldu' : 'Export failed'),
        type: 'error',
      });
    } finally {
      if (target === 'slack') setSendingSlack(false);
      else setSendingNotion(false);
    }
  };

  return (
    <div className="rounded-2xl bg-obsidian-800/60 border border-obsidian-600 p-5 space-y-4">
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {isTr ? 'Dış Entegrasyonlar' : 'External Integrations'}
        </h3>
        <p className="text-slate-500 text-xs mt-1">
          {isTr ? 'Toplantı özetini ve aksiyonları diğer platformlarla paylaşın' : 'Share meeting minutes and tasks with your platforms'}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {/* Slack Button */}
        {hasSlack ? (
          <button
            onClick={() => handleDispatch('slack')}
            disabled={sendingSlack || sendingNotion}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4A154B]/20 border border-[#4A154B]/40 hover:bg-[#4A154B]/30 hover:border-[#4A154B]/60 text-slate-200 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {sendingSlack ? (
              <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4 text-[#E01E5A]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523 2.528 2.528 0 0 1-2.522-2.523 2.528 2.528 0 0 1 2.522-2.52h2.52v2.52zm1.261 0a2.528 2.528 0 0 1 2.52-2.52h5.043a2.528 2.528 0 0 1 2.522 2.52v5.042a2.528 2.528 0 0 1-2.522 2.52H8.823a2.528 2.528 0 0 1-2.52-2.52v-5.042zM8.823 5.043a2.528 2.528 0 0 1 2.52-2.522 2.528 2.528 0 0 1 2.522 2.522v2.52h-2.522a2.528 2.528 0 0 1-2.52-2.52zm0 1.261a2.528 2.528 0 0 1 2.52 2.52v5.043a2.528 2.528 0 0 1-2.52 2.522H3.78a2.528 2.528 0 0 1-2.522-2.522V8.824a2.528 2.528 0 0 1 2.522-2.52h5.043zm10.135 3.761a2.528 2.528 0 0 1 2.522-2.52 2.528 2.528 0 0 1 2.52 2.52 2.528 2.528 0 0 1-2.52 2.522h-2.522v-2.522zm-1.262 0a2.528 2.528 0 0 1-2.52 2.522h-5.043a2.528 2.528 0 0 1-2.522-2.522V3.78a2.528 2.528 0 0 1 2.522-2.522h5.043a2.528 2.528 0 0 1 2.52 2.522v5.043zM15.166 18.958a2.528 2.528 0 0 1-2.522 2.522 2.528 2.528 0 0 1-2.52-2.522v-2.52h2.52a2.528 2.528 0 0 1 2.522 2.52zm0-1.262a2.528 2.528 0 0 1-2.522-2.52v-5.043a2.528 2.528 0 0 1 2.522-2.52h5.043a2.528 2.528 0 0 1 2.52 2.52v5.043a2.528 2.528 0 0 1-2.52 2.52h-5.043z" />
              </svg>
            )}
            {isTr ? 'Slack\'e Gönder' : 'Send to Slack'}
          </button>
        ) : (
          <Link
            href="/settings/integrations"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-obsidian-700/40 border border-obsidian-600/40 hover:border-indigo-500/40 text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            {isTr ? 'Slack Webhook Ayarla' : 'Setup Slack Webhook'}
          </Link>
        )}

        {/* Notion Button */}
        {hasNotion ? (
          <button
            onClick={() => handleDispatch('notion')}
            disabled={sendingSlack || sendingNotion}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100/5 border border-slate-100/10 hover:bg-slate-100/10 hover:border-slate-100/20 text-slate-200 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {sendingNotion ? (
              <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4 text-slate-200" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.2 3h15.6c.7 0 1.2.5 1.2 1.2v15.6c0 .7-.5 1.2-1.2 1.2H4.2c-.7 0-1.2-.5-1.2-1.2V4.2c0-.7.5-1.2 1.2-1.2zm2.6 3.6v10.8c0 .3.2.6.5.6h.7c.3 0 .5-.2.5-.5V9.4l5.9 8.2c.2.2.4.4.7.4h.7c.3 0 .5-.3.5-.6V6.6c0-.3-.2-.6-.5-.6h-.7c-.3 0-.5.2-.5.5v7.2l-5.9-8.2c-.2-.2-.4-.4-.7-.4h-.7c-.3 0-.5.3-.5.6z" />
              </svg>
            )}
            {isTr ? 'Notion\'a Aktar' : 'Export to Notion'}
          </button>
        ) : (
          <Link
            href="/settings/integrations"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-obsidian-700/40 border border-obsidian-600/40 hover:border-slate-500/40 text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            {isTr ? 'Notion Bağlantısı Kur' : 'Connect Notion'}
          </Link>
        )}
      </div>
    </div>
  );
}

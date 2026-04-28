'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ActionItem } from '@/types/database';

interface EmailPreviewProps {
  meetingId: string;
  defaultRecipients?: string[];
  actionItems: ActionItem[];
}

export function EmailPreview({ meetingId, defaultRecipients = [], actionItems }: EmailPreviewProps) {
  const t = useTranslations('meeting.email');
  const [recipients, setRecipients] = useState(defaultRecipients.join(', '));
  const [subject, setSubject] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    const recipientList = recipients.split(',').map((r) => r.trim()).filter(Boolean);
    if (!recipientList.length) return;

    setSending(true);
    setError(null);

    try {
      const res = await fetch(`/api/meetings/${meetingId}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: recipientList,
          subject: subject || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setSent(true);
    } catch {
      setError(t('failed'));
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-2xl bg-phosphor/5 border border-phosphor/20 p-4 text-center">
        <p className="text-phosphor text-sm font-medium">{t('sent')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-obsidian-800/60 border border-obsidian-600 p-5 space-y-4">
      <div className="space-y-2">
        <label className="text-xs text-slate-400 font-medium">Recipients</label>
        <input
          value={recipients}
          onChange={(e) => setRecipients(e.target.value)}
          placeholder="email@example.com, another@example.com"
          className="w-full px-3 py-2 rounded-xl bg-obsidian-900 border border-obsidian-600 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-phosphor/50"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs text-slate-400 font-medium">Subject (optional)</label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder={t('subject')}
          className="w-full px-3 py-2 rounded-xl bg-obsidian-900 border border-obsidian-600 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-phosphor/50"
        />
      </div>
      <p className="text-xs text-slate-500">
        {actionItems.length} action items will be included.
      </p>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        onClick={handleSend}
        disabled={sending || !recipients.trim()}
        className="w-full py-2 rounded-xl bg-phosphor text-obsidian-950 font-semibold text-sm hover:bg-phosphor-glow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {sending ? t('sending') : t('sendButton')}
      </button>
    </div>
  );
}

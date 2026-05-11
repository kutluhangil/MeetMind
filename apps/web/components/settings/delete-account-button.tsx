'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';

export function DeleteAccountButton() {
  const t = useTranslations('settings.danger');
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/profile', { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json() as { error: string };
        throw new Error(body.error);
      }
      // Sign out locally and redirect — account is gone
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      setLoading(false);
    }
  };

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
      >
        {t('deleteAccount')}
      </button>
    );
  }

  return (
    <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4 space-y-3">
      <p className="text-sm text-red-300">{t('deleteAccountDesc')}</p>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          {loading ? t('deleting') : t('deleteAccountConfirm')}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-obsidian-700 border border-obsidian-500 text-slate-300 text-sm font-medium hover:bg-obsidian-600 transition-colors"
        >
          {t('cancel')}
        </button>
      </div>
    </div>
  );
}

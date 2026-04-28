'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUiStore } from '@/stores/ui-store';

export function InviteForm() {
  const t = useTranslations('team');
  const addToast = useUiStore((s: { addToast: (t: { message: string; type: 'success' | 'error' | 'info' }) => void }) => s.addToast);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error(await res.text());
      addToast({ message: t('inviteSent'), type: 'success' });
      setEmail('');
    } catch {
      addToast({ message: t('inviteError'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('emailPlaceholder')}
        className="flex-1"
        required
      />
      <Button type="submit" loading={loading}>
        {t('invite')}
      </Button>
    </form>
  );
}

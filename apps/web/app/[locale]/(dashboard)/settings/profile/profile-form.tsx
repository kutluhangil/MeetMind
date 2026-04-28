'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUiStore } from '@/stores/ui-store';

interface ProfileFormProps {
  initialName: string;
  initialEmail: string;
  initialLocale: 'tr' | 'en';
}

export function ProfileForm({ initialName, initialEmail, initialLocale }: ProfileFormProps) {
  const t = useTranslations('settings');
  const addToast = useUiStore((s: { addToast: (t: { message: string; type: 'success' | 'error' | 'info' }) => void }) => s.addToast);
  const [name, setName] = useState(initialName);
  const [locale, setLocale] = useState<'tr' | 'en'>(initialLocale);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: name, locale }),
      });
      if (!res.ok) throw new Error();
      addToast({ message: t('profile.saved'), type: 'success' });
    } catch {
      addToast({ message: t('profile.saveError'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label={t('profile.name')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full Name"
      />
      <Input
        label={t('profile.email')}
        value={initialEmail}
        disabled
        readOnly
      />
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          {t('profile.language')}
        </label>
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as 'tr' | 'en')}
          className="w-full px-3 py-2 rounded-xl bg-obsidian-800 border border-obsidian-600 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-phosphor/50 focus:border-phosphor/50"
        >
          <option value="tr">Türkçe</option>
          <option value="en">English</option>
        </select>
      </div>
      <Button type="submit" loading={loading} className="w-full">
        {t('profile.save')}
      </Button>
    </form>
  );
}

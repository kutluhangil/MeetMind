import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { ProfileForm } from './profile-form';
import { DeleteAccountButton } from '@/components/settings/delete-account-button';

export default async function ProfilePage() {
  const t = await getTranslations('settings');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, locale')
    .eq('id', user?.id ?? '')
    .single();

  return (
    <div className="px-4 py-6 sm:p-6 max-w-lg space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 mb-6">{t('profile.title')}</h1>
        <ProfileForm
          initialName={profile?.full_name ?? ''}
          initialEmail={profile?.email ?? user?.email ?? ''}
          initialLocale={(profile?.locale as 'tr' | 'en') ?? 'tr'}
        />
      </div>

      {/* Danger zone */}
      <div className="border-t border-obsidian-700 pt-8 space-y-3">
        <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wide">
          {t('danger.deleteAccount')}
        </h2>
        <p className="text-sm text-slate-500">{t('danger.deleteAccountDesc')}</p>
        <DeleteAccountButton />
      </div>
    </div>
  );
}

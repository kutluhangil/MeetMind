import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { ProfileForm } from './profile-form';

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
    <div className="p-6 max-w-lg">
      <h1 className="text-2xl font-bold text-slate-100 mb-6">{t('profile.title')}</h1>
      <ProfileForm
        initialName={profile?.full_name ?? ''}
        initialEmail={profile?.email ?? user?.email ?? ''}
        initialLocale={(profile?.locale as 'tr' | 'en') ?? 'tr'}
      />
    </div>
  );
}

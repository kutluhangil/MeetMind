import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { InviteForm } from '@/components/team/invite-form';

export default async function TeamPage() {
  const t = await getTranslations('team');
  const supabase = await createClient();
  const admin = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: planData } = await admin.rpc('get_user_plan', { p_user_id: user!.id });
  const plan = (planData as string | null) ?? 'free';

  if (plan !== 'team') {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-display font-bold text-slate-100 mb-4">{t('title')}</h1>
        <div className="rounded-2xl bg-obsidian-800/40 border border-obsidian-700 p-8 text-center">
          <p className="text-slate-400 text-sm">{t('planRequired')}</p>
          <a
            href="/settings/billing"
            className="inline-block mt-4 px-4 py-2 rounded-xl bg-phosphor text-obsidian-950 text-sm font-semibold hover:bg-phosphor-glow transition-colors"
          >
            Upgrade to Team
          </a>
        </div>
      </div>
    );
  }

  // Get org membership
  const { data: orgMember } = await supabase
    .from('org_members')
    .select('org_id, role, organizations(name)')
    .eq('user_id', user!.id)
    .limit(1)
    .maybeSingle();

  const orgId = orgMember?.org_id;

  const { data: members } = orgId
    ? await admin
        .from('org_members')
        .select('*, profiles(email, full_name, avatar_url)')
        .eq('org_id', orgId)
        .order('invited_at')
    : { data: [] };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-100">{t('title')}</h1>
        <p className="text-slate-500 text-sm mt-1">{t('subtitle')}</p>
      </div>

      {/* Invite form */}
      <div className="rounded-2xl bg-obsidian-800/60 border border-obsidian-600 p-5 space-y-3">
        <h2 className="text-sm font-medium text-slate-300">{t('invite')}</h2>
        <InviteForm />
      </div>

      {/* Member list */}
      <div className="space-y-2">
        {(!members || members.length === 0) ? (
          <p className="text-slate-500 text-sm text-center py-8">{t('empty')}</p>
        ) : (
          members.map((m) => {
            const profile = m.profiles as { email?: string; full_name?: string; avatar_url?: string } | null;
            return (
              <div
                key={m.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-obsidian-800/60 border border-obsidian-600"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-obsidian-700 border border-obsidian-500 flex items-center justify-center">
                    <span className="text-xs text-slate-400">
                      {(profile?.full_name ?? profile?.email ?? '?')[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-200">{profile?.full_name ?? profile?.email}</p>
                    {profile?.full_name && (
                      <p className="text-xs text-slate-500">{profile.email}</p>
                    )}
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-lg bg-obsidian-700 border border-obsidian-600 text-slate-400">
                  {t(`role.${m.role}`)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

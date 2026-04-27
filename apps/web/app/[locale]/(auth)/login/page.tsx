import Link from 'next/link';
import { AuthForm } from '@/components/auth/auth-form';

export default function LoginPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <div className="min-h-screen bg-obsidian-950 bg-grid bg-noise flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-phosphor/10 border border-phosphor/20 flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-phosphor" />
          </div>
          <span className="font-display text-lg font-semibold text-slate-100">MeetMind</span>
        </div>

        <div className="bg-obsidian-800/60 backdrop-blur-xl border border-white/[0.06] shadow-glass rounded-2xl p-8">
          <h1 className="text-2xl font-display font-bold text-slate-100 mb-1">Tekrar hoş geldin</h1>
          <p className="text-slate-400 text-sm mb-8">Hesabına giriş yap</p>
          <AuthForm mode="login" locale={locale} />
        </div>
      </div>
    </div>
  );
}

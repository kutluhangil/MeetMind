'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type AuthMode = 'login' | 'register';
type AuthMethod = 'password' | 'magic-link';

interface AuthFormProps {
  mode: AuthMode;
  locale: string;
}

export function AuthForm({ mode, locale }: AuthFormProps) {
  const router = useRouter();
  const [method, setMethod] = useState<AuthMethod>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (method === 'magic-link') {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/${locale}/dashboard`,
          },
        });
        if (error) throw error;
        setSuccess('Magic link gönderildi! E-postanı kontrol et.');
        return;
      }

      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/${locale}/dashboard`,
          },
        });
        if (error) throw error;
        setSuccess('Hesabın oluşturuldu! E-postanı doğrulamak için gelen kutuna bak.');
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push(`/${locale}/dashboard`);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/${locale}/dashboard`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Google OAuth */}
      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl
                   bg-obsidian-700 border border-obsidian-500 text-slate-200 text-sm font-medium
                   hover:bg-obsidian-600 hover:border-obsidian-400 transition-all duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <GoogleIcon />
        Google ile devam et
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-obsidian-600" />
        <span className="text-xs text-slate-500">veya</span>
        <div className="flex-1 h-px bg-obsidian-600" />
      </div>

      {/* Method toggle */}
      <div className="flex rounded-xl bg-obsidian-900 border border-obsidian-700 p-1">
        <button
          type="button"
          onClick={() => setMethod('password')}
          className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
            method === 'password'
              ? 'bg-obsidian-700 text-slate-100'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Şifre
        </button>
        <button
          type="button"
          onClick={() => setMethod('magic-link')}
          className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
            method === 'magic-link'
              ? 'bg-obsidian-700 text-slate-100'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Magic Link
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="E-posta"
          type="email"
          placeholder="sen@sirket.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        {method === 'password' && (
          <Input
            label="Şifre"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
          />
        )}

        {error && (
          <div className="px-3 py-2 rounded-lg bg-status-failed/10 border border-status-failed/20 text-status-failed text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="px-3 py-2 rounded-lg bg-status-completed/10 border border-status-completed/20 text-status-completed text-sm">
            {success}
          </div>
        )}

        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
          {method === 'magic-link'
            ? 'Magic Link Gönder'
            : mode === 'register'
            ? 'Hesap Oluştur'
            : 'Giriş Yap'}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500">
        {mode === 'login' ? (
          <>
            Hesabın yok mu?{' '}
            <Link href={`/${locale}/register`} className="text-phosphor hover:text-phosphor-glow transition-colors">
              Ücretsiz Kaydol
            </Link>
          </>
        ) : (
          <>
            Zaten hesabın var mı?{' '}
            <Link href={`/${locale}/login`} className="text-phosphor hover:text-phosphor-glow transition-colors">
              Giriş Yap
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

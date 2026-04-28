'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/navigation';

type Interval = 'monthly' | 'yearly';
type Currency = 'USD' | 'TRY';

const PRICES = {
  free:  { USD: { monthly: '$0',   yearly: '$0'   }, TRY: { monthly: '₺0',   yearly: '₺0'   } },
  pro:   { USD: { monthly: '$24',  yearly: '$230'  }, TRY: { monthly: '₺699', yearly: '₺6,720' } },
  team:  { USD: { monthly: '$9',   yearly: '$86'   }, TRY: { monthly: '₺265', yearly: '₺2,544' } },
};

const FEATURES = {
  free:  ['5 meetings/month', 'Transcription', 'AI Summary', 'Action items', '5 follow-up emails'],
  pro:   ['Unlimited meetings', 'Unlimited emails', 'Priority queue', 'PDF export', 'API access'],
  team:  ['Everything in Pro', 'Shared workspace', 'Team members', 'Admin controls', 'SSO (Enterprise)'],
};

export function PricingTable() {
  const [interval, setInterval] = useState<Interval>('monthly');
  const [currency, setCurrency] = useState<Currency>('USD');
  const t = useTranslations('pricing');
  const router = useRouter();

  const handleUpgrade = (plan: 'pro' | 'team') => {
    router.push(`/settings/billing`);
  };

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {/* Interval toggle */}
        <div className="flex items-center gap-0.5 bg-obsidian-800 rounded-lg border border-obsidian-600 p-0.5">
          {(['monthly', 'yearly'] as Interval[]).map((i) => (
            <button
              key={i}
              onClick={() => setInterval(i)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                interval === i
                  ? 'bg-obsidian-600 text-slate-100'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {i === 'monthly' ? t('monthly') : t('yearly')}
              {i === 'yearly' && (
                <span className="ml-1.5 text-xs text-phosphor">{t('save')}</span>
              )}
            </button>
          ))}
        </div>

        {/* Currency toggle */}
        <div className="flex items-center gap-0.5 bg-obsidian-800 rounded-lg border border-obsidian-600 p-0.5">
          {(['USD', 'TRY'] as Currency[]).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                currency === c
                  ? 'bg-obsidian-600 text-slate-100'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {c === 'USD' ? t('currency.usd') : t('currency.try')}
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Free */}
        <div className="rounded-2xl bg-obsidian-800/60 border border-obsidian-600 p-6 space-y-5">
          <div>
            <p className="text-sm font-semibold text-slate-400">{t('plans.free.name')}</p>
            <p className="text-4xl font-display font-bold text-slate-100 mt-2">
              {PRICES.free[currency][interval]}
            </p>
            <p className="text-sm text-slate-500 mt-1">{t('plans.free.desc')}</p>
          </div>
          <ul className="space-y-2">
            {FEATURES.free.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-slate-400">
                <span className="text-phosphor/60">✓</span> {f}
              </li>
            ))}
          </ul>
          <a
            href="/register"
            className="block w-full py-2.5 rounded-xl text-center text-sm font-semibold bg-obsidian-700 border border-obsidian-500 text-slate-300 hover:border-obsidian-400 hover:text-slate-100 transition-colors"
          >
            {t('cta.free')}
          </a>
        </div>

        {/* Pro */}
        <div className="rounded-2xl bg-obsidian-800/60 border border-phosphor/30 p-6 space-y-5 relative shadow-phosphor">
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-phosphor/10 border border-phosphor/20 text-phosphor text-xs font-medium">
            Popular
          </div>
          <div>
            <p className="text-sm font-semibold text-phosphor">{t('plans.pro.name')}</p>
            <p className="text-4xl font-display font-bold text-slate-100 mt-2">
              {PRICES.pro[currency][interval]}
              <span className="text-base text-slate-500 ml-1">/mo</span>
            </p>
            <p className="text-sm text-slate-500 mt-1">{t('plans.pro.desc')}</p>
          </div>
          <ul className="space-y-2">
            {FEATURES.pro.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                <span className="text-phosphor">✓</span> {f}
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleUpgrade('pro')}
            className="block w-full py-2.5 rounded-xl text-center text-sm font-semibold bg-phosphor text-obsidian-950 hover:bg-phosphor-glow transition-colors"
          >
            {t('cta.upgrade')}
          </button>
        </div>

        {/* Team */}
        <div className="rounded-2xl bg-obsidian-800/60 border border-obsidian-600 p-6 space-y-5">
          <div>
            <p className="text-sm font-semibold text-indigo-400">{t('plans.team.name')}</p>
            <div className="flex items-baseline gap-1 mt-2">
              <p className="text-4xl font-display font-bold text-slate-100">
                {PRICES.team[currency][interval]}
              </p>
              <span className="text-sm text-slate-500">{t('plans.team.unit')}</span>
            </div>
            <p className="text-sm text-slate-500 mt-1">{t('plans.team.desc')}</p>
          </div>
          <ul className="space-y-2">
            {FEATURES.team.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-slate-400">
                <span className="text-indigo-400/60">✓</span> {f}
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleUpgrade('team')}
            className="block w-full py-2.5 rounded-xl text-center text-sm font-semibold bg-obsidian-700 border border-obsidian-500 text-slate-300 hover:border-indigo-500/50 hover:text-slate-100 transition-colors"
          >
            {t('cta.upgrade')}
          </button>
        </div>
      </div>
    </div>
  );
}

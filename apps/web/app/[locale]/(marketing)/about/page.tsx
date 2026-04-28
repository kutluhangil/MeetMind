import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/navigation';

export default async function AboutPage() {
  const t = await getTranslations('landing');

  return (
    <main className="min-h-screen bg-obsidian-950 bg-grid bg-noise">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 mb-10 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('back')}
        </Link>

        <h1 className="text-4xl font-bold text-slate-100 mb-6">MeetMind</h1>

        <div className="prose prose-invert prose-slate max-w-none space-y-6 text-slate-300 leading-relaxed">
          <p>
            MeetMind is an AI-powered meeting assistant that transforms your audio recordings
            into actionable insights. Upload or record your meetings and let AI handle the rest.
          </p>
          <p>
            Built with OpenAI Whisper for transcription and GPT-4o for intelligent summarization,
            MeetMind extracts key decisions and assigns action items automatically — then sends
            follow-up emails to keep your team on track.
          </p>
          <h2 className="text-xl font-semibold text-slate-100 mt-8">Technology</h2>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li>Next.js 14 (App Router) — Frontend</li>
            <li>Supabase — Database, Auth &amp; Realtime</li>
            <li>OpenAI Whisper + GPT-4o — AI Processing</li>
            <li>BullMQ + Redis — Background Jobs</li>
            <li>Resend — Email Delivery</li>
            <li>Lemon Squeezy — Payments</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

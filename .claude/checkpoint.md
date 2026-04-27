# MeetMind — Checkpoint (Phase 1-2-3 Tamamlandı)

## Durum Özeti

| Faz | Kapsam | Durum |
|-----|--------|-------|
| Phase 1 | Monorepo kurulum + tasarım sistemi | ✅ Tamamlandı |
| Phase 2 | Supabase DB şeması + Auth | ✅ Tamamlandı |
| Phase 3 | i18n (next-intl TR/EN) | ✅ Tamamlandı |
| Phase 4 | Worker (BullMQ + Whisper + GPT-4o + Resend) | ⏳ Sonraki |
| Phase 5 | API Routes | ⏳ Bekliyor |
| Phase 6 | Frontend Sayfalar | ⏳ Bekliyor |
| Phase 7 | Realtime & Polish | ⏳ Bekliyor |
| Phase 8 | Lemon Squeezy Ödeme | ⏳ Bekliyor |
| Phase 9 | Docker + Deploy | ⏳ Bekliyor |

Son doğrulama: `npm run type-check` → **0 hata**, 2/2 workspace geçti.

---

## Dosya Ağacı (Mevcut Durum)

```
meetmind/
├── package.json                         ✅ npm workspaces ["apps/*"], packageManager: npm@11.6.2
├── turbo.json                           ✅ tasks: build/dev/lint/type-check (turbo 2.x syntax)
├── tsconfig.base.json                   ✅ strict, moduleResolution: bundler, noEmit: true
├── .env.example                         ✅ 20+ env var
├── apps/
│   ├── web/
│   │   ├── package.json                 ✅ next@14.2.35, react@^18.3.1, next-intl@^3, @supabase/ssr@^0.10
│   │   ├── tailwind.config.ts           ✅ Obsidian Studio tam tasarım sistemi
│   │   ├── next.config.ts               ✅ createNextIntlPlugin('./i18n/request.ts')
│   │   ├── middleware.ts                ✅ Supabase auth + next-intl birleşik
│   │   ├── i18n/request.ts              ✅ next-intl request config
│   │   ├── app/
│   │   │   ├── layout.tsx               ✅ Geist fonts (local woff), dark class
│   │   │   ├── globals.css              ✅ Tailwind directives + dark scrollbar
│   │   │   ├── page.tsx                 ✅ redirect('/tr')
│   │   │   └── [locale]/
│   │   │       ├── layout.tsx           ✅ NextIntlClientProvider + generateStaticParams
│   │   │       ├── (marketing)/page.tsx ✅ getTranslations() + locale-aware Link
│   │   │       ├── (auth)/
│   │   │       │   ├── login/page.tsx   ✅ AuthForm wrapper
│   │   │       │   └── register/page.tsx ✅ AuthForm wrapper
│   │   │       └── (dashboard)/
│   │   │           ├── layout.tsx       ✅ Supabase auth guard + Sidebar + Header
│   │   │           └── page.tsx         ✅ Dashboard placeholder
│   │   ├── app/api/
│   │   │   └── auth/callback/route.ts   ✅ exchangeCodeForSession + redirect
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── button.tsx           ✅ Framer Motion, 4 variant (HTMLMotionProps tip düzeltmesiyle)
│   │   │   │   ├── card.tsx             ✅ glassmorphism, 3 variant
│   │   │   │   ├── badge.tsx            ✅ status renkleri
│   │   │   │   ├── input.tsx            ✅ obsidian bg, phosphor focus ring
│   │   │   │   └── skeleton.tsx         ✅ shimmer animasyonu
│   │   │   ├── auth/
│   │   │   │   └── auth-form.tsx        ✅ Google OAuth + email/password + magic link
│   │   │   └── layout/
│   │   │       ├── sidebar.tsx          ✅ useTranslations('nav') + next-intl Link
│   │   │       ├── header.tsx           ✅ LocaleSwitcher entegre
│   │   │       └── locale-switcher.tsx  ✅ TR/EN toggle
│   │   ├── lib/
│   │   │   ├── navigation.ts            ✅ createNavigation (Link, useRouter, usePathname)
│   │   │   ├── utils.ts                 ✅ cn() helper
│   │   │   └── supabase/
│   │   │       ├── client.ts            ✅ createBrowserClient<Database>
│   │   │       ├── server.ts            ✅ createServerClient<Database> (async cookies)
│   │   │       └── admin.ts             ✅ createClient<Database> (service key, no session)
│   │   ├── messages/
│   │   │   ├── tr.json                  ✅ Tam (metadata/common/nav/auth/landing/dashboard/meeting/action/team/settings/billing/pricing/errors)
│   │   │   └── en.json                  ✅ Tam (aynı yapı İngilizce)
│   │   └── types/
│   │       └── database.ts              ✅ 8 tablo için tam Database interface + convenience types
│   └── worker/
│       ├── package.json                 ✅ bullmq@^5, ioredis@^5, openai@^4, resend@^4, tsx@^4
│       ├── tsconfig.json                ✅ module: NodeNext, noEmit: false, outDir: dist
│       ├── Dockerfile                   ✅ node:20-alpine, ffmpeg, multi-stage, non-root user
│       └── src/
│           └── index.ts                 ✅ BullMQ Worker (transcription/summary/email) + health :3002
├── supabase/migrations/
│   ├── 001_initial_schema.sql           ✅ 8 tablo: profiles, organizations, org_members,
│   │                                       subscriptions, meetings, action_items, email_logs, usage_logs
│   ├── 002_rls_policies.sql             ✅ RLS tüm tablolarda
│   └── 003_functions.sql                ✅ handle_new_user trigger, get_monthly_usage,
│                                           get_user_plan, update_updated_at triggers
├── docker/
│   └── docker-compose.yml               ✅ worker + redis + nginx + certbot + cloudflared
└── scripts/
    └── setup.sh                         ✅ Ubuntu first-run script
```

---

## Kritik Teknik Kararlar & Tuzaklar

### Package Manager / Monorepo
- **npm workspaces** (pnpm yok, ortamda sadece npm var)
- **turbo 2.x** → `"tasks"` kullan, `"pipeline"` değil; root `package.json`'da `"packageManager"` alanı zorunlu
- create-next-app `.mjs` config üretir → `next.config.mjs` silindi, `.ts` olarak yeniden oluşturuldu

### React / Next.js
- **React 18** (19 değil) — Next.js 14 ile resmi uyumluluk; React 19 Next.js 15 gerektirir
- **Geist font** → npm paketi değil, create-next-app'in ürettiği `app/fonts/GeistVF.woff` ve `GeistMonoVF.woff` kullanılıyor

### Framer Motion Tip Sorunu (button.tsx)
```typescript
// Yanlış: React.ButtonHTMLAttributes spread → onDrag çakışması
// Doğru:
type ButtonOwnProps = { variant?: ...; size?: ...; loading?: boolean; children?: React.ReactNode; };
type ButtonProps = ButtonOwnProps & Omit<HTMLMotionProps<'button'>, keyof ButtonOwnProps>;
```

### next-intl 3.x
- Request config: `i18n/request.ts` (eski `i18n.ts` değil)
- Server component: `getTranslations()` (async)
- Client component: `useTranslations()` (hook)
- Locale-aware router: `@/lib/navigation` → `createNavigation({ locales, localePrefix: 'always' })`
- `generateStaticParams` → `[locale]/layout.tsx` içinde tanımlandı

### Supabase SSR
- Middleware'de her zaman `getUser()` kullan, `getSession()` değil (token refresh garantisi)
- Combined middleware sırası: Supabase client oluştur → getUser() → auth redirect → intlMiddleware(request) → Supabase cookie'lerini intl response'a kopyala
- `createServerClient` → async `cookies()` (Next.js 14)
- Admin client → `autoRefreshToken: false, persistSession: false` (service key ile)

### Worker
- `tsx` (ts-node değil) — dev için esbuild tabanlı
- `openai@^4` sabit — v5/v6 breaking API değişiklikleri var
- Worker tsconfig: `allowImportingTsExtensions: false` (bundler yok, dist'e emit eder)
- BullMQ: `maxRetriesPerRequest: null` Redis bağlantısında zorunlu

---

## Phase 4'e Başlarken Yapılacaklar

**Hedef:** `apps/worker/src/` altındaki processor'ları ve service'leri doldur.

### Oluşturulacak Dosyalar

```
apps/worker/src/
├── queues/
│   ├── transcription.queue.ts    # new Queue('transcription', { connection })
│   ├── summary.queue.ts          # new Queue('summary', { connection })
│   └── email.queue.ts            # new Queue('email', { connection })
├── processors/
│   ├── transcription.processor.ts
│   │   # 1. Supabase Storage'dan dosya indir
│   │   # 2. FFmpeg: WAV mono 16kHz normalize
│   │   # 3. >25MB ise chunk'lara böl
│   │   # 4. Whisper API (whisper-1, language param)
│   │   # 5. meetings UPDATE: transcript + status='summarizing'
│   │   # 6. summary-queue'ya job ekle
│   ├── summary.processor.ts
│   │   # 1. transcript al
│   │   # 2. GPT-4o'ya buildSummaryPrompt() ile gönder
│   │   # 3. JSON parse: { summary, key_decisions, action_items[] }
│   │   # 4. meetings UPDATE: summary + key_decisions + status='completed'
│   │   # 5. action_items BULK INSERT
│   └── email.processor.ts
│       # 1. meeting + action_items al
│       # 2. React Email template render
│       # 3. Resend API ile gönder
│       # 4. email_logs INSERT
├── services/
│   ├── openai.service.ts         # OpenAI client singleton, transcribe(), summarize()
│   ├── supabase.service.ts       # Admin Supabase client, getMeeting(), updateMeeting(), insertActions()
│   └── resend.service.ts         # Resend client, sendEmail()
└── utils/
    ├── audio.utils.ts            # FFmpeg: normalize(), splitChunks()
    └── prompt.utils.ts           # buildSummaryPrompt(transcript, language) — CLAUDE.md §5.2'deki tam prompt
```

### GPT-4o Prompt Şeması (CLAUDE.md §5.2'den)
```typescript
// Dönen JSON yapısı:
{
  summary: string,              // 3-5 paragraf
  key_decisions: string[],
  action_items: [{
    title, description, assignee_name, assignee_email,
    due_date, priority, confidence
  }],
  participants: [{ name, role }],
  meeting_duration_estimate: string,
  sentiment: "positive|neutral|negative|mixed"
}
```

### Worker → Frontend Bildirim Akışı
Phase 4'te processor'lar Supabase'deki `meetings.status` kolonunu günceller.
Frontend (Phase 7'de) Supabase Realtime postgres_changes ile dinler — webhook gerekmez.
`WORKER_API_SECRET` header'ı ise `POST /api/webhooks/worker` route için (Phase 5).

### docker-compose.dev.yml
Phase 4 sonunda `docker/docker-compose.dev.yml` oluşturulacak (sadece redis + worker, nginx/certbot yok).

---

## Henüz Yapılmamış / Eksik Olan Her Şey

### Phase 4 (Worker Processors)
- `apps/worker/src/queues/*.ts` — boş
- `apps/worker/src/processors/*.ts` — boş
- `apps/worker/src/services/*.ts` — boş
- `apps/worker/src/utils/*.ts` — boş
- `docker/docker-compose.dev.yml` — yok

### Phase 5 (API Routes)
- `app/api/upload/route.ts` — Supabase Storage pre-signed URL
- `app/api/meetings/route.ts` — GET liste + POST oluştur + queue'ya ekle
- `app/api/meetings/[id]/route.ts` — GET detay, PATCH güncelle
- `app/api/meetings/[id]/actions/route.ts` — POST ekle, PATCH güncelle
- `app/api/meetings/[id]/send-email/route.ts` — email queue'ya ekle
- `app/api/webhooks/lemon-squeezy/route.ts` — HMAC-SHA256 doğrulama
- `app/api/webhooks/worker/route.ts` — WORKER_API_SECRET doğrulama
- `app/api/billing/portal/route.ts`
- `app/api/billing/checkout/route.ts`

### Phase 6 (Frontend Sayfalar)
- `(marketing)/pricing/page.tsx` — USD/TRY toggle
- `(dashboard)/meetings/page.tsx` — liste
- `(dashboard)/meetings/new/page.tsx` — upload/kayıt
- `(dashboard)/meetings/[id]/page.tsx` — transkript + özet + aksiyonlar
- `(dashboard)/settings/billing/page.tsx`
- `(dashboard)/team/page.tsx`
- `components/meetings/upload-zone.tsx`
- `components/meetings/recording-widget.tsx`
- `components/meetings/transcript-view.tsx`
- `components/meetings/summary-card.tsx`
- `components/meetings/action-list.tsx`
- `components/meetings/action-item.tsx`
- `components/meetings/status-badge.tsx`
- `components/meetings/email-preview.tsx`
- `emails/action-summary.tsx` (React Email template)
- `emails/invite.tsx`
- `stores/meeting-store.ts` (Zustand)
- `stores/ui-store.ts`

### Phase 7 (Realtime & Polish)
- `hooks/use-meeting-status.ts` — Supabase Realtime postgres_changes
- `hooks/use-upload.ts` — pre-signed URL upload + progress
- `hooks/use-recording.ts` — MediaRecorder API
- `hooks/use-subscription.ts` — plan kontrolü
- Toast sistemi, error boundary, loading skeleton'lar

### Phase 8 (Ödeme)
- `lib/lemon-squeezy.ts` — createCheckoutUrl()
- Pricing page USD/TRY toggle
- Plan limit enforcement (get_monthly_usage)

### Phase 9 (DevOps)
- `docker/nginx/nginx.conf`
- `docker/nginx/sites/meetmind.conf`
- `docker/cloudflare/config.yml`
- `scripts/deploy-worker.sh`
- `scripts/generate-types.sh`
- `vercel.json` (gerekirse)

---

## Supabase Bağlantı Notu

Migration'lar henüz çalıştırılmadı (Supabase projesi bağlanmamış).
`apps/web/types/database.ts` **manuel yazıldı** — Supabase projesi bağlandıktan sonra:
```bash
npx supabase gen types typescript --linked > apps/web/types/database.ts
```
ile üretilen tipe göre güncelle (büyük ihtimal aynı kalacak).

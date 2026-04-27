# MeetMind — AI Meeting Notes & Action Tracker
### Claude Code Master Blueprint

> **Tek cümle:** Toplantıyı yükle veya kaydet → AI transkript çıkarsın → kararları özetlesin → aksiyon maddelerini kişilere atasın → takip e-postası göndersin.

---

## 📋 İÇİNDEKİLER

1. [Mimari Karar](#1-mimari-karar)
2. [Teknoloji Stack](#2-teknoloji-stack)
3. [Klasör Yapısı](#3-klasör-yapısı)
4. [Veritabanı Şeması (Supabase)](#4-veritabanı-şeması-supabase)
5. [Özellik Listesi & Otomasyon Akışı](#5-özellik-listesi--otomasyon-akışı)
6. [Ödeme Sistemi](#6-ödeme-sistemi)
7. [Tasarım Sistemi](#7-tasarım-sistemi)
8. [Docker & Ubuntu Server Yapısı](#8-docker--ubuntu-server-yapısı)
9. [Environment Variables](#9-environment-variables)
10. [Claude Code Görev Sırası](#10-claude-code-görev-sırası)
11. [API Endpoint Referansı](#11-api-endpoint-referansı)
12. [i18n: TR / EN](#12-i18n-tr--en)
13. [Güvenlik Katmanları](#13-güvenlik-katmanları)
14. [Deploy Pipeline](#14-deploy-pipeline)

---

## 1. MİMARİ KARAR

### Hibrit Yaklaşım (Önerilen)

```
┌─────────────────────────────────────────────────────┐
│                   KULLANICI TARAYICI                │
│              Next.js 14 App Router (SSR)            │
│              Vercel VEYA Ubuntu/Nginx               │
└────────────────────────┬────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼────────────────────────────┐
│              UBUNTU SERVER (Evdeki Sunucu)          │
│   ┌──────────────────────────────────────────────┐  │
│   │  Docker Compose                              │  │
│   │  ┌─────────────┐  ┌──────────────────────┐  │  │
│   │  │  Worker     │  │  Bull Queue (Redis)   │  │  │
│   │  │  Service    │  │  Job Processing       │  │  │
│   │  │  (Node.js)  │  └──────────────────────┘  │  │
│   │  └─────────────┘                             │  │
│   │  ┌─────────────┐  ┌──────────────────────┐  │  │
│   │  │  Redis      │  │  Nginx Reverse Proxy  │  │  │
│   │  │  (Queue)    │  │  + SSL (Let's Encrypt)│  │  │
│   │  └─────────────┘  └──────────────────────┘  │  │
│   └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│                   SUPABASE                          │
│   PostgreSQL + Auth + Storage + Realtime            │
└─────────────────────────────────────────────────────┘
```

**Neden bu yapı?**
- Next.js frontend → Vercel'de bedava, hızlı CDN
- Ağır işler (Whisper transkripsiyon, GPT özet) → evdeki Ubuntu worker'da, API maliyeti düşük
- Supabase → auth + DB + dosya depolama tek yerden
- Bull Queue → işler kuyruğa girer, retry mantığı built-in
- Cloudflare Tunnel → ev sunucusunu dışa açmak için (statik IP gerekmez)

---

## 2. TEKNOLOJİ STACK

| Katman | Teknoloji | Versiyon | Amaç |
|--------|-----------|----------|-------|
| **Frontend** | Next.js | 14.x (App Router) | SSR + API Routes |
| **Dil** | TypeScript | 5.x | Type safety |
| **Stil** | Tailwind CSS | 3.x | Utility-first CSS |
| **Animasyon** | Framer Motion | 11.x | Akıcı geçişler |
| **State** | Zustand | 4.x | Global state |
| **Form** | React Hook Form + Zod | latest | Form validasyon |
| **DB** | Supabase (PostgreSQL) | latest | Veritabanı + Auth |
| **Dosya** | Supabase Storage | — | Ses/video dosyaları |
| **Realtime** | Supabase Realtime | — | İş durumu güncellemeleri |
| **Transkripsiyon** | OpenAI Whisper API | whisper-1 | Ses → Metin |
| **AI Özet** | OpenAI GPT-4o | gpt-4o | Özet + Aksiyon çıkarma |
| **E-posta** | Resend + React Email | latest | Takip e-postaları |
| **Ödeme** | Lemon Squeezy | v1 | Abonelik yönetimi |
| **Queue** | BullMQ + Redis | latest | Async job processing |
| **Worker** | Node.js service | 20.x | Arka plan işlemleri |
| **Container** | Docker + Compose | latest | Ubuntu server deploy |
| **Proxy** | Nginx | latest | Reverse proxy + SSL |
| **Tünel** | Cloudflare Tunnel | latest | Ev sunucusu dışa açma |
| **i18n** | next-intl | 3.x | TR + EN dil desteği |

---

## 3. KLASÖR YAPISI

```
meetmind/
├── apps/
│   ├── web/                          # Next.js 14 frontend
│   │   ├── app/
│   │   │   ├── [locale]/             # /tr veya /en
│   │   │   │   ├── (auth)/
│   │   │   │   │   ├── login/
│   │   │   │   │   └── register/
│   │   │   │   ├── (dashboard)/
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   ├── page.tsx          # Dashboard ana sayfa
│   │   │   │   │   ├── meetings/
│   │   │   │   │   │   ├── page.tsx      # Toplantı listesi
│   │   │   │   │   │   ├── new/
│   │   │   │   │   │   │   └── page.tsx  # Yeni toplantı
│   │   │   │   │   │   └── [id]/
│   │   │   │   │   │       ├── page.tsx  # Toplantı detayı
│   │   │   │   │   │       └── actions/
│   │   │   │   │   │           └── page.tsx
│   │   │   │   │   ├── team/
│   │   │   │   │   │   └── page.tsx      # Takım yönetimi
│   │   │   │   │   └── settings/
│   │   │   │   │       ├── page.tsx
│   │   │   │   │       ├── billing/
│   │   │   │   │       └── profile/
│   │   │   │   ├── (marketing)/
│   │   │   │   │   ├── page.tsx          # Landing page
│   │   │   │   │   ├── pricing/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── about/
│   │   │   │   └── layout.tsx
│   │   │   ├── api/
│   │   │   │   ├── webhooks/
│   │   │   │   │   ├── lemon-squeezy/
│   │   │   │   │   │   └── route.ts      # Ödeme webhook
│   │   │   │   │   └── worker/
│   │   │   │   │       └── route.ts      # Worker → Frontend bildirim
│   │   │   │   ├── meetings/
│   │   │   │   │   ├── route.ts          # GET list, POST create
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── route.ts
│   │   │   │   └── upload/
│   │   │   │       └── route.ts          # Dosya upload pre-sign
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── ui/                       # Temel UI bileşenleri
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── modal.tsx
│   │   │   │   ├── progress.tsx
│   │   │   │   └── skeleton.tsx
│   │   │   ├── layout/
│   │   │   │   ├── sidebar.tsx
│   │   │   │   ├── header.tsx
│   │   │   │   └── nav.tsx
│   │   │   ├── meetings/
│   │   │   │   ├── upload-zone.tsx       # Drag & drop dosya yükleme
│   │   │   │   ├── recording-widget.tsx  # Tarayıcı kayıt
│   │   │   │   ├── transcript-view.tsx   # Transkript görüntüleme
│   │   │   │   ├── summary-card.tsx      # AI özet kartı
│   │   │   │   ├── action-list.tsx       # Aksiyon maddeleri listesi
│   │   │   │   ├── action-item.tsx       # Tek aksiyon maddesi
│   │   │   │   ├── status-badge.tsx      # İşlem durumu
│   │   │   │   └── email-preview.tsx     # E-posta önizleme
│   │   │   ├── team/
│   │   │   │   ├── invite-form.tsx
│   │   │   │   └── member-list.tsx
│   │   │   └── marketing/
│   │   │       ├── hero.tsx
│   │   │       ├── features.tsx
│   │   │       ├── pricing-table.tsx
│   │   │       └── demo-video.tsx
│   │   ├── hooks/
│   │   │   ├── use-meeting-status.ts     # Realtime job tracking
│   │   │   ├── use-upload.ts             # Dosya yükleme hook
│   │   │   ├── use-recording.ts          # Tarayıcı mikrofon
│   │   │   └── use-subscription.ts      # Plan bilgisi
│   │   ├── lib/
│   │   │   ├── supabase/
│   │   │   │   ├── client.ts             # Browser client
│   │   │   │   ├── server.ts             # Server client
│   │   │   │   └── middleware.ts
│   │   │   ├── lemon-squeezy.ts          # Ödeme utils
│   │   │   ├── resend.ts                 # E-posta utils
│   │   │   └── utils.ts
│   │   ├── stores/
│   │   │   ├── meeting-store.ts          # Zustand store
│   │   │   └── ui-store.ts
│   │   ├── types/
│   │   │   ├── database.ts               # Supabase generated types
│   │   │   ├── meeting.ts
│   │   │   └── subscription.ts
│   │   ├── messages/
│   │   │   ├── tr.json                   # Türkçe çeviriler
│   │   │   └── en.json                   # İngilizce çeviriler
│   │   ├── emails/                       # React Email templates
│   │   │   ├── action-summary.tsx
│   │   │   └── invite.tsx
│   │   ├── middleware.ts                 # Auth + i18n middleware
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   └── worker/                           # Ubuntu Docker servisi
│       ├── src/
│       │   ├── index.ts                  # Worker entry point
│       │   ├── queues/
│       │   │   ├── transcription.queue.ts
│       │   │   ├── summary.queue.ts
│       │   │   └── email.queue.ts
│       │   ├── processors/
│       │   │   ├── transcription.processor.ts  # Whisper API
│       │   │   ├── summary.processor.ts        # GPT-4o
│       │   │   └── email.processor.ts          # Resend
│       │   ├── services/
│       │   │   ├── openai.service.ts
│       │   │   ├── supabase.service.ts
│       │   │   └── resend.service.ts
│       │   └── utils/
│       │       ├── audio.utils.ts        # FFmpeg ses işleme
│       │       └── prompt.utils.ts       # GPT prompt builder
│       ├── Dockerfile
│       └── package.json
│
├── docker/
│   ├── docker-compose.yml               # Ubuntu server compose
│   ├── docker-compose.dev.yml           # Geliştirme ortamı
│   ├── nginx/
│   │   ├── nginx.conf
│   │   └── sites/
│   │       └── meetmind.conf
│   └── cloudflare/
│       └── config.yml                   # Cloudflare Tunnel config
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   └── 003_functions.sql
│   └── seed.sql
│
├── scripts/
│   ├── setup.sh                         # İlk kurulum scripti
│   ├── deploy-worker.sh
│   └── generate-types.sh                # Supabase type gen
│
├── .env.example
├── .env.local                           # Git ignore
├── turbo.json                           # Turborepo config
└── package.json
```

---

## 4. VERİTABANI ŞEMASI (SUPABASE)

```sql
-- =============================================
-- 001_initial_schema.sql
-- =============================================

-- USERS (Supabase Auth ile otomatik gelir, sadece profile tablosu)
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  avatar_url    TEXT,
  locale        TEXT DEFAULT 'tr' CHECK (locale IN ('tr', 'en')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ORGANIZATIONS (Takım planı için)
CREATE TABLE organizations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  owner_id      UUID NOT NULL REFERENCES profiles(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ORG MEMBERS
CREATE TABLE org_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role          TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  invited_at    TIMESTAMPTZ DEFAULT NOW(),
  joined_at     TIMESTAMPTZ,
  UNIQUE(org_id, user_id)
);

-- SUBSCRIPTIONS
CREATE TABLE subscriptions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID REFERENCES profiles(id) ON DELETE CASCADE,
  org_id                UUID REFERENCES organizations(id) ON DELETE CASCADE,
  lemon_squeezy_id      TEXT UNIQUE,
  lemon_subscription_id TEXT UNIQUE,
  plan                  TEXT NOT NULL CHECK (plan IN ('free', 'pro', 'team')),
  status                TEXT NOT NULL CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
  currency              TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'TRY')),
  billing_interval      TEXT DEFAULT 'monthly' CHECK (billing_interval IN ('monthly', 'yearly')),
  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  cancel_at_period_end  BOOLEAN DEFAULT FALSE,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- MEETINGS
CREATE TABLE meetings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  org_id            UUID REFERENCES organizations(id) ON DELETE SET NULL,
  title             TEXT NOT NULL,
  description       TEXT,
  language          TEXT DEFAULT 'tr' CHECK (language IN ('tr', 'en', 'auto')),
  
  -- Dosya bilgileri
  audio_file_path   TEXT,          -- Supabase Storage path
  audio_file_size   BIGINT,        -- Bytes
  audio_duration    INTEGER,       -- Saniye
  
  -- İşlem durumu (BullMQ job state)
  status            TEXT DEFAULT 'pending' CHECK (
                      status IN (
                        'pending',          -- Yüklendi, sıraya girmedi
                        'queued',           -- BullMQ kuyruğunda
                        'transcribing',     -- Whisper işliyor
                        'summarizing',      -- GPT işliyor
                        'completed',        -- Tamamlandı
                        'failed'            -- Hata
                      )
                    ),
  job_id            TEXT,           -- BullMQ job ID (polling için)
  error_message     TEXT,
  
  -- AI çıktıları
  transcript        TEXT,          -- Ham transkript
  summary           TEXT,          -- AI özeti (markdown)
  key_decisions     JSONB,         -- ["karar 1", "karar 2"]
  
  -- Metadata
  meeting_date      TIMESTAMPTZ DEFAULT NOW(),
  participants      JSONB,         -- [{"name": "Ali", "email": "ali@..."}]
  tags              TEXT[],
  
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ACTION ITEMS
CREATE TABLE action_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id      UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id),  -- Kimin toplantısı
  
  title           TEXT NOT NULL,
  description     TEXT,
  
  -- Atama
  assignee_name   TEXT,
  assignee_email  TEXT,
  assignee_id     UUID REFERENCES profiles(id),  -- Uygulama içi kullanıcıysa
  
  -- Durum
  status          TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  priority        TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date        DATE,
  completed_at    TIMESTAMPTZ,
  
  -- AI meta
  ai_extracted    BOOLEAN DEFAULT TRUE,   -- AI mi çıkardı, kullanıcı mı ekledi
  confidence      FLOAT,                  -- AI güven skoru
  
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- EMAIL LOGS
CREATE TABLE email_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id      UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id),
  recipients      TEXT[],                 -- Gönderilen e-posta adresleri
  subject         TEXT,
  resend_id       TEXT,                   -- Resend message ID
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at         TIMESTAMPTZ,
  error           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- USAGE TRACKING (Free plan limiti için)
CREATE TABLE usage_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id),
  org_id          UUID REFERENCES organizations(id),
  action          TEXT NOT NULL CHECK (action IN ('meeting_created', 'email_sent')),
  period_year     INTEGER NOT NULL,
  period_month    INTEGER NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 002_rls_policies.sql
-- =============================================

-- Row Level Security
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members     ENABLE ROW LEVEL SECURITY;

-- Kullanıcı sadece kendi profilini görsün
CREATE POLICY "profiles_own" ON profiles
  USING (auth.uid() = id);

-- Kullanıcı kendi toplantılarını görsün + org toplantıları
CREATE POLICY "meetings_access" ON meetings
  USING (
    user_id = auth.uid()
    OR
    org_id IN (
      SELECT org_id FROM org_members WHERE user_id = auth.uid()
    )
  );

-- Action items: toplantıya erişimi olan görsün
CREATE POLICY "actions_access" ON action_items
  USING (
    meeting_id IN (
      SELECT id FROM meetings WHERE user_id = auth.uid()
      OR org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
    )
  );

-- =============================================
-- 003_functions.sql
-- =============================================

-- Aylık kullanım sayacı
CREATE OR REPLACE FUNCTION get_monthly_usage(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM usage_logs
  WHERE user_id = p_user_id
    AND action = 'meeting_created'
    AND period_year = EXTRACT(YEAR FROM NOW())::INTEGER
    AND period_month = EXTRACT(MONTH FROM NOW())::INTEGER;
$$ LANGUAGE sql SECURITY DEFINER;

-- Aktif plan kontrolü
CREATE OR REPLACE FUNCTION get_user_plan(p_user_id UUID)
RETURNS TEXT AS $$
  SELECT COALESCE(
    (SELECT plan FROM subscriptions
     WHERE user_id = p_user_id
       AND status = 'active'
     ORDER BY created_at DESC LIMIT 1),
    'free'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER meetings_updated_at    BEFORE UPDATE ON meetings    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER action_items_updated_at BEFORE UPDATE ON action_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 5. ÖZELLİK LİSTESİ & OTOMASYON AKIŞI

### 5.1 Otomasyon Pipeline (Worker)

```
KULLANICI DOSYA YÜKLER / KAYIT YAPAR
        │
        ▼
[1] Upload API → Supabase Storage'a yükle
    meetings tablosuna INSERT (status: 'pending')
        │
        ▼
[2] BullMQ → transcription-queue'ya JOB ekle
    meetings UPDATE (status: 'queued', job_id: xxx)
        │
        ▼
[3] Worker: transcription.processor
    ├── Supabase Storage'dan dosyayı indir
    ├── FFmpeg ile ses formatını normalize et (WAV, mono, 16kHz)
    ├── Dosya > 25MB ise chunklara böl
    ├── OpenAI Whisper API'ye gönder (language parametresi ile)
    ├── meetings UPDATE (transcript: "...", status: 'summarizing')
    └── summary-queue'ya JOB ekle
        │
        ▼
[4] Worker: summary.processor
    ├── GPT-4o'ya transcript gönder (aşağıdaki prompt ile)
    ├── JSON parse: { summary, key_decisions, action_items[] }
    ├── meetings UPDATE (summary, key_decisions, status: 'completed')
    └── action_items'e BULK INSERT
        │
        ▼
[5] Supabase Realtime → Frontend'e push bildirim
    Frontend: "İşlem tamamlandı!" toast göster
        │
        ▼
[6] Kullanıcı aksiyon maddelerini gözden geçirir, düzenler
        │
        ▼
[7] "Takip E-postası Gönder" butonuna basar
    email-queue'ya JOB ekle
        │
        ▼
[8] Worker: email.processor
    ├── React Email template render
    ├── Resend API ile gönder
    └── email_logs'a INSERT
```

### 5.2 GPT-4o Özet Promptu

```typescript
// apps/worker/src/utils/prompt.utils.ts

export const buildSummaryPrompt = (transcript: string, language: 'tr' | 'en') => {
  const instructions = {
    tr: `Sen bir toplantı asistanısın. Verilen toplantı transkripsiyonunu analiz et.
Yanıtını SADECE geçerli JSON formatında ver, başka hiçbir şey ekleme.`,
    en: `You are a meeting assistant. Analyze the given meeting transcript.
Return ONLY valid JSON, nothing else.`
  };

  const schema = `
{
  "summary": "string (3-5 paragraf, toplantının ana konusu ve kararlar)",
  "key_decisions": ["string", "string"],
  "action_items": [
    {
      "title": "string (kısa görev başlığı)",
      "description": "string (detay, opsiyonel)",
      "assignee_name": "string | null",
      "assignee_email": "string | null",
      "due_date": "YYYY-MM-DD | null",
      "priority": "low | medium | high | urgent",
      "confidence": 0.0-1.0
    }
  ],
  "participants": [
    { "name": "string", "role": "string | null" }
  ],
  "meeting_duration_estimate": "string",
  "sentiment": "positive | neutral | negative | mixed"
}`;

  return `${instructions[language]}

TRANSKRIPT:
${transcript}

BEKLENEN JSON ŞEMASI:
${schema}`;
};
```

### 5.3 Özellik Matrisi

| Özellik | Free | Pro | Team |
|---------|------|-----|------|
| Aylık toplantı | 5 | Sınırsız | Sınırsız |
| Dosya yükleme (MP3, MP4, WAV, M4A, WebM) | ✅ | ✅ | ✅ |
| Tarayıcı kayıt | ✅ | ✅ | ✅ |
| Otomatik transkripsiyon | ✅ | ✅ | ✅ |
| AI özet | ✅ | ✅ | ✅ |
| Aksiyon maddeleri çıkarma | ✅ | ✅ | ✅ |
| Takip e-postası | ✅ (5/ay) | ✅ Sınırsız | ✅ Sınırsız |
| Toplantı geçmişi | 30 gün | Sınırsız | Sınırsız |
| Dışa aktarma (PDF, Notion, Slack) | ❌ | ✅ | ✅ |
| Takım üyesi daveti | ❌ | ❌ | ✅ |
| Paylaşımlı toplantı havuzu | ❌ | ❌ | ✅ |
| Öncelik işleme (hızlı kuyruk) | ❌ | ✅ | ✅ |
| API erişimi | ❌ | ✅ | ✅ |
| Özel e-posta şablonu | ❌ | ✅ | ✅ |
| SSO (SAML) | ❌ | ❌ | ✅ (Enterprise) |

---

## 6. ÖDEME SİSTEMİ

### 6.1 Lemon Squeezy Ürün Yapısı

```
Lemon Squeezy Dashboard'da oluşturulacaklar:

STORE: MeetMind
├── PRODUCT: MeetMind Pro
│   ├── Variant: Monthly USD  → $24/ay   → LEMON_PRO_MONTHLY_USD_ID
│   ├── Variant: Yearly USD   → $230/yıl  → LEMON_PRO_YEARLY_USD_ID
│   ├── Variant: Monthly TRY  → ₺699/ay  → LEMON_PRO_MONTHLY_TRY_ID
│   └── Variant: Yearly TRY   → ₺6,720/yıl → LEMON_PRO_YEARLY_TRY_ID
│
└── PRODUCT: MeetMind Team (per-seat)
    ├── Variant: Monthly USD  → $9/kullanıcı/ay  → LEMON_TEAM_MONTHLY_USD_ID
    ├── Variant: Yearly USD   → $86/kullanıcı/yıl → LEMON_TEAM_YEARLY_USD_ID
    ├── Variant: Monthly TRY  → ₺265/kullanıcı/ay → LEMON_TEAM_MONTHLY_TRY_ID
    └── Variant: Yearly TRY   → ₺2,544/kullanıcı/yıl → LEMON_TEAM_YEARLY_TRY_ID
```

### 6.2 Fiyat Tablosu

| Plan | USD/ay | USD/yıl | TRY/ay | TRY/yıl |
|------|--------|---------|--------|---------|
| Free | $0 | $0 | ₺0 | ₺0 |
| Pro | $24 | $230 (%20 indirim) | ₺699 | ₺6,720 (%20 indirim) |
| Team | $9/kullanıcı | $86/kullanıcı | ₺265/kullanıcı | ₺2,544/kullanıcı |

> **TRY kuru notu:** Fiyatları Lemon Squeezy'de manuel sabit fiyat olarak gir.
> Otomatik kur çevirisi değil. Her 3 ayda bir gözden geçir.

### 6.3 Webhook Handler

```typescript
// apps/web/app/api/webhooks/lemon-squeezy/route.ts

import { createHmac } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-signature');
  
  // İmza doğrulama
  const hmac = createHmac('sha256', process.env.LEMON_WEBHOOK_SECRET!);
  const digest = hmac.update(rawBody).digest('hex');
  if (digest !== signature) return new Response('Unauthorized', { status: 401 });
  
  const event = JSON.parse(rawBody);
  const eventName = event.meta.event_name;
  
  const handlers: Record<string, Function> = {
    'subscription_created':  handleSubscriptionCreated,
    'subscription_updated':  handleSubscriptionUpdated,
    'subscription_cancelled': handleSubscriptionCancelled,
    'subscription_resumed':  handleSubscriptionResumed,
    'subscription_expired':  handleSubscriptionExpired,
  };

  const handler = handlers[eventName];
  if (handler) await handler(event, supabaseAdmin);
  
  return new Response('OK');
}

async function handleSubscriptionCreated(event: any, db: any) {
  const userId = event.meta.custom_data?.user_id;
  const attrs = event.data.attributes;
  
  await db.from('subscriptions').upsert({
    user_id:               userId,
    lemon_squeezy_id:      event.data.id,
    lemon_subscription_id: attrs.subscription_id,
    plan:                  attrs.product_name.toLowerCase().includes('team') ? 'team' : 'pro',
    status:                attrs.status,
    currency:              attrs.currency,
    billing_interval:      attrs.billing_anchor ? 'yearly' : 'monthly',
    current_period_start:  new Date(attrs.renews_at),
    current_period_end:    new Date(attrs.ends_at),
  });
}
```

### 6.4 Checkout URL Oluşturma

```typescript
// apps/web/lib/lemon-squeezy.ts

export async function createCheckoutUrl({
  variantId,
  userId,
  email,
  currency = 'USD',
}: CreateCheckoutParams): Promise<string> {
  const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.LEMON_API_KEY}`,
      'Content-Type': 'application/vnd.api+json',
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            custom: { user_id: userId },
            email,
          },
          product_options: {
            redirect_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?upgraded=true`,
          },
        },
        relationships: {
          store:   { data: { type: 'stores',   id: process.env.LEMON_STORE_ID } },
          variant: { data: { type: 'variants', id: variantId } },
        },
      },
    }),
  });
  
  const data = await response.json();
  return data.data.attributes.url;
}
```

---

## 7. TASARIM SİSTEMİ

### 7.1 Renk Paleti & Tasarım Dili

```
KONSEPT: "Obsidian Studio"
─────────────────────────────────────────────────────
Karanlık, premium, neredeyse siyah tonlar.
İnce gri detaylar. Keskin beyaz tipografi.
Aksan rengi olarak soğuk bir fosfor yeşili (terminal estetiği).
Cam efekti (glassmorphism) kartlar.
Noise texture background.
─────────────────────────────────────────────────────
```

```typescript
// apps/web/tailwind.config.ts

import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Temel siyah tonları
        obsidian: {
          950: '#050506',
          900: '#0a0a0f',
          800: '#111118',
          700: '#1a1a24',
          600: '#242430',
          500: '#2e2e3d',
          400: '#3d3d52',
          300: '#5a5a78',
        },
        // Gri tonlar
        slate: {
          50:  '#f8f8fa',
          100: '#ededf2',
          200: '#d8d8e3',
          300: '#b8b8cc',
          400: '#8a8aa3',
          500: '#636380',
          600: '#4a4a63',
          700: '#363650',
          800: '#252538',
          900: '#181825',
        },
        // Aksan: Fosfor yeşili
        phosphor: {
          DEFAULT: '#4ade80',
          dim:     '#22c55e',
          glow:    '#86efac',
          muted:   '#166534',
        },
        // Durum renkleri
        status: {
          pending:      '#6366f1',
          processing:   '#f59e0b',
          completed:    '#4ade80',
          failed:       '#ef4444',
        },
      },
      fontFamily: {
        // Başlıklar: geometrik, keskin
        display: ['Geist', 'var(--font-geist)', 'system-ui'],
        // Gövde: okunabilir, nötr
        body:    ['Geist Mono', 'var(--font-geist-mono)', 'monospace'],
        // Transkript: mono
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
        'grid':  "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        'glow-phosphor': 'radial-gradient(ellipse at center, rgba(74,222,128,0.15) 0%, transparent 70%)',
      },
      backgroundSize: {
        'grid': '32px 32px',
      },
      boxShadow: {
        'glass':      '0 4px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'phosphor':   '0 0 20px rgba(74,222,128,0.3)',
        'inner-glow': 'inset 0 0 20px rgba(74,222,128,0.05)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer':    'shimmer 2s linear infinite',
        'float':      'float 6s ease-in-out infinite',
        'scan':       'scan 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        scan: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
```

### 7.2 Temel UI Bileşenler

```typescript
// apps/web/components/ui/card.tsx
// Glassmorphism kart

import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'solid' | 'outline';
  glow?: boolean;
}

export function Card({ variant = 'glass', glow, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border transition-all duration-300',
        {
          // Glass: arka planı biraz gösteren şeffaf kart
          'glass': 'bg-obsidian-800/60 backdrop-blur-xl border-white/[0.06] shadow-glass',
          'solid': 'bg-obsidian-800 border-obsidian-600',
          'outline': 'bg-transparent border-obsidian-600 hover:border-obsidian-400',
        }[variant],
        glow && 'shadow-phosphor border-phosphor/20',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

```typescript
// apps/web/components/ui/button.tsx

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({ variant = 'primary', size = 'md', loading, className, children, ...props }: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-phosphor/50',
        {
          sm: 'px-3 py-1.5 text-sm',
          md: 'px-4 py-2 text-sm',
          lg: 'px-6 py-3 text-base',
        }[size],
        {
          primary:   'bg-phosphor text-obsidian-950 hover:bg-phosphor-glow shadow-phosphor/30 shadow-lg',
          secondary: 'bg-obsidian-700 text-slate-200 border border-obsidian-500 hover:border-obsidian-400 hover:bg-obsidian-600',
          ghost:     'text-slate-400 hover:text-slate-100 hover:bg-obsidian-700',
          danger:    'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20',
        }[variant],
        loading && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </span>
      )}
      <span className={loading ? 'opacity-0' : ''}>{children}</span>
    </motion.button>
  );
}
```

### 7.3 Upload Zone Bileşeni

```typescript
// apps/web/components/meetings/upload-zone.tsx

'use client';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';

const ACCEPTED_TYPES = {
  'audio/mpeg': ['.mp3'],
  'audio/mp4':  ['.m4a'],
  'audio/wav':  ['.wav'],
  'audio/webm': ['.webm'],
  'video/mp4':  ['.mp4'],
  'video/webm': ['.webm'],
};

export function UploadZone({ onFileSelect }: { onFileSelect: (file: File) => void }) {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) onFileSelect(acceptedFiles[0]);
  }, [onFileSelect]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    maxSize: 500 * 1024 * 1024, // 500MB
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  return (
    <motion.div
      {...getRootProps()}
      animate={{ borderColor: isDragging ? '#4ade80' : 'rgba(255,255,255,0.06)' }}
      className="relative flex flex-col items-center justify-center w-full h-64 rounded-2xl border-2 border-dashed cursor-pointer overflow-hidden bg-obsidian-800/40 backdrop-blur-xl transition-all group hover:border-phosphor/40"
    >
      <input {...getInputProps()} />
      
      {/* Arka plan grid efekti */}
      <div className="absolute inset-0 bg-grid bg-obsidian-950 opacity-30" />
      
      {/* Hover/drag glow efekti */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-glow-phosphor"
          />
        )}
      </AnimatePresence>
      
      <div className="relative z-10 flex flex-col items-center gap-3 text-center px-6">
        <motion.div
          animate={{ y: isDragging ? -4 : 0 }}
          className="w-12 h-12 rounded-xl bg-phosphor/10 border border-phosphor/20 flex items-center justify-center"
        >
          {/* Upload icon */}
          <svg className="w-6 h-6 text-phosphor" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </motion.div>
        <div>
          <p className="text-slate-200 font-medium">
            Dosyayı sürükle veya tıkla
          </p>
          <p className="text-slate-500 text-sm mt-1">
            MP3, MP4, WAV, M4A, WebM · Maks. 500MB
          </p>
        </div>
      </div>
    </motion.div>
  );
}
```

### 7.4 İşlem Durumu Bileşeni (Realtime)

```typescript
// apps/web/components/meetings/status-badge.tsx
// Supabase Realtime ile anlık güncellenir

'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

const STATUS_CONFIG = {
  pending:       { label: 'Bekliyor',         color: 'text-slate-400',       bg: 'bg-slate-400/10',   pulse: false },
  queued:        { label: 'Sıraya Alındı',    color: 'text-indigo-400',     bg: 'bg-indigo-400/10', pulse: true  },
  transcribing:  { label: 'Transkripsiyon',   color: 'text-amber-400',      bg: 'bg-amber-400/10',  pulse: true  },
  summarizing:   { label: 'AI Analiz Ediyor', color: 'text-phosphor',       bg: 'bg-phosphor/10',   pulse: true  },
  completed:     { label: 'Tamamlandı',       color: 'text-phosphor',       bg: 'bg-phosphor/10',   pulse: false },
  failed:        { label: 'Hata',             color: 'text-red-400',        bg: 'bg-red-400/10',    pulse: false },
};

export function StatusBadge({ meetingId, initialStatus }: { meetingId: string, initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus);
  const supabase = createClient();
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];

  useEffect(() => {
    const channel = supabase
      .channel(`meeting:${meetingId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'meetings',
        filter: `id=eq.${meetingId}`,
      }, (payload) => {
        setStatus(payload.new.status);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [meetingId]);

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.color}`}>
      {config.pulse && (
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-1.5 h-1.5 rounded-full bg-current"
        />
      )}
      {config.label}
    </span>
  );
}
```

---

## 8. DOCKER & UBUNTU SERVER YAPISI

### 8.1 docker-compose.yml

```yaml
# docker/docker-compose.yml
# Ubuntu sunucusunda çalışacak servisler

version: '3.9'

services:
  # ─── Worker Servisi ──────────────────────────────────
  worker:
    build:
      context: ../apps/worker
      dockerfile: Dockerfile
    container_name: meetmind_worker
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
      - RESEND_API_KEY=${RESEND_API_KEY}
      - WORKER_CONCURRENCY=3
      - NEXT_PUBLIC_URL=${NEXT_PUBLIC_URL}
    volumes:
      - worker_tmp:/tmp/meetmind     # Geçici ses dosyaları
    depends_on:
      redis:
        condition: service_healthy
    networks:
      - internal
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.5'

  # ─── Redis (BullMQ Queue Backend) ────────────────────
  redis:
    image: redis:7-alpine
    container_name: meetmind_redis
    restart: unless-stopped
    command: >
      redis-server
        --requirepass ${REDIS_PASSWORD}
        --maxmemory 512mb
        --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', '--pass', '${REDIS_PASSWORD}', 'ping']
      interval: 10s
      timeout: 5s
      retries: 3
    networks:
      - internal

  # ─── Nginx Reverse Proxy ──────────────────────────────
  nginx:
    image: nginx:alpine
    container_name: meetmind_nginx
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/sites:/etc/nginx/sites-enabled:ro
      - certbot_www:/var/www/certbot:ro
      - certbot_certs:/etc/letsencrypt:ro
    depends_on:
      - worker
    networks:
      - internal
      - external

  # ─── Certbot (SSL) ────────────────────────────────────
  certbot:
    image: certbot/certbot
    container_name: meetmind_certbot
    volumes:
      - certbot_www:/var/www/certbot
      - certbot_certs:/etc/letsencrypt
    command: certonly --webroot --webroot-path=/var/www/certbot -d ${DOMAIN} --email ${ADMIN_EMAIL} --agree-tos --no-eff-email
    networks:
      - external

  # ─── Cloudflare Tunnel (Ev sunucusu için) ────────────
  # Statik IP yoksa Cloudflare Tunnel kullan
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: meetmind_cloudflared
    restart: unless-stopped
    command: tunnel run
    environment:
      - TUNNEL_TOKEN=${CLOUDFLARE_TUNNEL_TOKEN}
    networks:
      - internal
      - external

  # ─── Bull Board (Queue Monitor) ───────────────────────
  # Sadece geliştirmede veya VPN arkasında aç
  bull-board:
    build:
      context: ../apps/worker
      dockerfile: Dockerfile.monitor
    container_name: meetmind_bullboard
    restart: unless-stopped
    environment:
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
      - BULL_BOARD_USERNAME=${BULL_BOARD_USERNAME}
      - BULL_BOARD_PASSWORD=${BULL_BOARD_PASSWORD}
    ports:
      - '127.0.0.1:3001:3001'   # Sadece localhost
    depends_on:
      - redis
    networks:
      - internal

volumes:
  redis_data:
  worker_tmp:
  certbot_www:
  certbot_certs:

networks:
  internal:
    driver: bridge
  external:
    driver: bridge
```

### 8.2 Worker Dockerfile

```dockerfile
# apps/worker/Dockerfile
FROM node:20-alpine AS base

# FFmpeg kurulumu (ses işleme için)
RUN apk add --no-cache ffmpeg python3 make g++

WORKDIR /app

# Bağımlılıklar
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production

# Build
FROM base AS builder
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production
FROM base AS runner
ENV NODE_ENV=production

# Non-root kullanıcı
RUN addgroup -g 1001 -S nodejs && adduser -S worker -u 1001

COPY --from=deps    --chown=worker:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=worker:nodejs /app/dist         ./dist
COPY --from=builder --chown=worker:nodejs /app/package.json ./

# Geçici dosyalar için dizin
RUN mkdir -p /tmp/meetmind && chown worker:nodejs /tmp/meetmind

USER worker

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/health', r => process.exit(r.statusCode === 200 ? 0 : 1))"

EXPOSE 3002
CMD ["node", "dist/index.js"]
```

### 8.3 Worker Entry Point

```typescript
// apps/worker/src/index.ts

import { Worker, Queue } from 'bullmq';
import IORedis from 'ioredis';
import { transcriptionProcessor } from './processors/transcription.processor';
import { summaryProcessor } from './processors/summary.processor';
import { emailProcessor } from './processors/email.processor';
import http from 'http';

const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,  // BullMQ gereksinimi
});

// Queue tanımları
export const transcriptionQueue = new Queue('transcription', { connection });
export const summaryQueue       = new Queue('summary',       { connection });
export const emailQueue         = new Queue('email',         { connection });

// Worker'lar
const transcriptionWorker = new Worker('transcription', transcriptionProcessor, {
  connection,
  concurrency: parseInt(process.env.WORKER_CONCURRENCY || '3'),
  limiter: { max: 10, duration: 60_000 }, // Dakikada max 10 iş
});

const summaryWorker = new Worker('summary', summaryProcessor, {
  connection,
  concurrency: 5,
});

const emailWorker = new Worker('email', emailProcessor, {
  connection,
  concurrency: 10,
});

// Health check server
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok', queues: ['transcription', 'summary', 'email'] }));
  }
});
server.listen(3002);

// Hata yakalama
[transcriptionWorker, summaryWorker, emailWorker].forEach(worker => {
  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message);
  });
});

console.log('🚀 MeetMind Worker started');
```

### 8.4 Kurulum Scripti

```bash
#!/bin/bash
# scripts/setup.sh — Ubuntu sunucusunda ilk kurulum

set -e

echo "🔧 MeetMind Worker Kurulumu"

# Docker ve Docker Compose kurulu mu?
if ! command -v docker &> /dev/null; then
  echo "Docker kuruluyor..."
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker $USER
fi

# .env dosyası
if [ ! -f .env ]; then
  cp .env.example .env
  echo "⚠️  .env dosyasını düzenle: nano .env"
  exit 1
fi

# Cloudflare Tunnel kurulumu (opsiyonel)
read -p "Cloudflare Tunnel kullanacak mısın? (y/n) " -n 1 -r
if [[ $REPLY =~ ^[Yy]$ ]]; then
  docker run cloudflare/cloudflared tunnel login
  docker run cloudflare/cloudflared tunnel create meetmind
  echo "CLOUDFLARE_TUNNEL_TOKEN=" >> .env
  echo "Token'ı .env dosyasına ekle"
fi

# Docker image build
docker compose -f docker/docker-compose.yml build

# Servisleri başlat
docker compose -f docker/docker-compose.yml up -d

echo "✅ Kurulum tamamlandı!"
echo "Worker durumu: docker compose logs -f worker"
echo "Queue monitor: http://localhost:3001 (VPN veya SSH tunnel ile)"
```

---

## 9. ENVIRONMENT VARIABLES

```bash
# .env.example

# ─── Uygulama ──────────────────────────────────────────
NEXT_PUBLIC_URL=https://meetmind.io
NODE_ENV=production
DOMAIN=meetmind.io
ADMIN_EMAIL=admin@meetmind.io

# ─── Supabase ──────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...          # Sadece server/worker'da

# ─── OpenAI ────────────────────────────────────────────
OPENAI_API_KEY=sk-...

# ─── Resend (E-posta) ──────────────────────────────────
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@meetmind.io
RESEND_FROM_NAME=MeetMind

# ─── Lemon Squeezy ─────────────────────────────────────
LEMON_API_KEY=eyJ...
LEMON_STORE_ID=12345
LEMON_WEBHOOK_SECRET=abcdef...

# Plan Variant IDs
LEMON_PRO_MONTHLY_USD_ID=111111
LEMON_PRO_YEARLY_USD_ID=111112
LEMON_PRO_MONTHLY_TRY_ID=111113
LEMON_PRO_YEARLY_TRY_ID=111114
LEMON_TEAM_MONTHLY_USD_ID=222221
LEMON_TEAM_YEARLY_USD_ID=222222
LEMON_TEAM_MONTHLY_TRY_ID=222223
LEMON_TEAM_YEARLY_TRY_ID=222224

# ─── Redis ─────────────────────────────────────────────
REDIS_URL=redis://:${REDIS_PASSWORD}@localhost:6379
REDIS_PASSWORD=güçlü_bir_şifre_koy

# ─── Worker ────────────────────────────────────────────
WORKER_CONCURRENCY=3
WORKER_API_SECRET=worker_api_gizli_anahtari  # Worker → Frontend bildirimleri için

# ─── Cloudflare ────────────────────────────────────────
CLOUDFLARE_TUNNEL_TOKEN=eyJ...

# ─── Bull Board ────────────────────────────────────────
BULL_BOARD_USERNAME=admin
BULL_BOARD_PASSWORD=güçlü_şifre
```

---

## 10. CLAUDE CODE GÖREV SIRASI

Claude Code'a VS Code'dan vereceğin görevler, sırasıyla:

```
AŞAMA 1 — Temel Kurulum
────────────────────────
[ ] turbo.json ve monorepo package.json oluştur
[ ] apps/web Next.js 14 projesi oluştur (TypeScript + Tailwind + App Router)
[ ] apps/worker Node.js projesi oluştur (TypeScript + BullMQ)
[ ] Tailwind config'i tasarım sistemine göre ayarla
[ ] Geist font entegrasyonu
[ ] Framer Motion kurulumu

AŞAMA 2 — Supabase & Auth
──────────────────────────
[ ] supabase/migrations klasörü ve tüm SQL dosyalarını oluştur
[ ] Supabase migration'ları çalıştır: npx supabase db push
[ ] TypeScript tipleri üret: npx supabase gen types
[ ] Supabase client/server helper'ları oluştur
[ ] Auth middleware (next-intl + Supabase birlikte)
[ ] Login/Register sayfaları (email + magic link + Google OAuth)

AŞAMA 3 — i18n
───────────────
[ ] next-intl kurulumu ve konfigürasyonu
[ ] messages/tr.json ve messages/en.json oluştur (tüm string'ler)
[ ] Locale routing: /tr/... ve /en/...
[ ] Dil switcher bileşeni

AŞAMA 4 — Worker Altyapısı
────────────────────────────
[ ] apps/worker temel yapısı (queues, processors)
[ ] Redis bağlantısı ve BullMQ queue tanımları
[ ] transcription.processor.ts (Whisper API + FFmpeg)
[ ] summary.processor.ts (GPT-4o + JSON parse)
[ ] email.processor.ts (Resend + React Email)
[ ] Worker health check endpoint
[ ] Dockerfile ve docker-compose.yml

AŞAMA 5 — API Routes
─────────────────────
[ ] POST /api/upload → Supabase Storage pre-signed URL
[ ] POST /api/meetings → Meeting oluştur + queue'ya ekle
[ ] GET  /api/meetings → Liste (sayfalama)
[ ] GET  /api/meetings/[id] → Detay
[ ] PATCH /api/meetings/[id]/actions → Aksiyon güncelle
[ ] POST /api/meetings/[id]/send-email → E-posta gönder
[ ] POST /api/webhooks/lemon-squeezy → Ödeme webhook

AŞAMA 6 — Frontend Sayfalar
────────────────────────────
[ ] Marketing: Landing page (hero + özellikler + fiyatlandırma)
[ ] Dashboard: Ana sayfa (son toplantılar + istatistikler)
[ ] Meetings: Liste sayfası
[ ] Meetings/new: Upload/kayıt sayfası
[ ] Meetings/[id]: Transkript + özet + aksiyonlar
[ ] Settings/billing: Abonelik yönetimi
[ ] Team: Üye yönetimi (sadece Team plan)

AŞAMA 7 — Realtime & Polish
─────────────────────────────
[ ] Supabase Realtime ile iş durumu güncellemeleri
[ ] Tarayıcı ses kaydı (MediaRecorder API)
[ ] PDF/Notion export
[ ] Animasyonlar ve geçişler (Framer Motion)
[ ] Loading skeleton'lar
[ ] Error boundary'ler
[ ] Toast bildirimleri

AŞAMA 8 — Ödeme Entegrasyonu
──────────────────────────────
[ ] Lemon Squeezy ürün/variant ID'lerini ayarla
[ ] Pricing page bileşeni (USD/TRY toggle)
[ ] Checkout URL oluşturma
[ ] Webhook handler (subscription events)
[ ] Plan kontrolü (kullanım limitleri)
[ ] Billing portal sayfası

AŞAMA 9 — Deploy
─────────────────
[ ] Vercel'e web deploy (main branch → production)
[ ] Ubuntu sunucusunda docker compose up
[ ] Cloudflare Tunnel yapılandır
[ ] SSL sertifikası (Let's Encrypt)
[ ] Monitoring: Sentry + Vercel Analytics
```

---

## 11. API ENDPOINT REFERANSI

```
POST   /api/upload
       Body: { filename, contentType, meetingId }
       Returns: { uploadUrl, path }

POST   /api/meetings
       Body: { title, language, audioFilePath, participants[] }
       Returns: { meeting }

GET    /api/meetings?page=1&limit=10
       Returns: { meetings[], total, page }

GET    /api/meetings/:id
       Returns: { meeting, actionItems[], emailLogs[] }

PATCH  /api/meetings/:id
       Body: { title?, summary?, keyDecisions? }
       Returns: { meeting }

POST   /api/meetings/:id/actions
       Body: { title, assigneeEmail, dueDate, priority }
       Returns: { actionItem }

PATCH  /api/meetings/:id/actions/:actionId
       Body: { status?, dueDate?, assigneeEmail? }
       Returns: { actionItem }

POST   /api/meetings/:id/send-email
       Body: { recipients[], subject?, includeTranscript }
       Returns: { emailLogId }

POST   /api/webhooks/lemon-squeezy
       Headers: x-signature
       Body: LemonSqueezy event payload

GET    /api/billing/portal
       Returns: { portalUrl }

GET    /api/billing/checkout?variantId=xxx&currency=TRY
       Returns: { checkoutUrl }
```

---

## 12. i18n: TR / EN

```json
// messages/tr.json
{
  "common": {
    "loading":    "Yükleniyor...",
    "save":       "Kaydet",
    "cancel":     "İptal",
    "delete":     "Sil",
    "edit":       "Düzenle",
    "send":       "Gönder",
    "back":       "Geri",
    "next":       "İleri",
    "search":     "Ara..."
  },
  "nav": {
    "dashboard":  "Ana Sayfa",
    "meetings":   "Toplantılar",
    "team":       "Takım",
    "settings":   "Ayarlar",
    "billing":    "Abonelik",
    "logout":     "Çıkış"
  },
  "meeting": {
    "upload": {
      "title":      "Toplantı Yükle",
      "dropzone":   "Dosyayı buraya sürükle",
      "formats":    "MP3, MP4, WAV, M4A, WebM · Maks. 500MB",
      "or":         "veya",
      "record":     "Tarayıcıdan Kaydet",
      "processing": "İşleniyor..."
    },
    "status": {
      "pending":      "Bekliyor",
      "queued":       "Sıraya Alındı",
      "transcribing": "Transkripsiyon Yapılıyor",
      "summarizing":  "AI Analiz Ediyor",
      "completed":    "Tamamlandı",
      "failed":       "Hata Oluştu"
    },
    "sections": {
      "transcript":   "Transkript",
      "summary":      "AI Özeti",
      "decisions":    "Ana Kararlar",
      "actions":      "Aksiyon Maddeleri",
      "sendEmail":    "Takip E-postası Gönder"
    }
  },
  "pricing": {
    "monthly":  "Aylık",
    "yearly":   "Yıllık",
    "save":     "%20 Tasarruf",
    "currency": {
      "usd": "USD ($)",
      "try": "TRY (₺)"
    },
    "plans": {
      "free": {
        "name":  "Ücretsiz",
        "price": "₺0",
        "desc":  "Denemeye başla"
      },
      "pro": {
        "name":  "Pro",
        "price": "₺699",
        "desc":  "Bireysel profesyoneller için"
      },
      "team": {
        "name":  "Takım",
        "price": "₺265",
        "unit":  "/ kullanıcı / ay",
        "desc":  "Ekipler için"
      }
    },
    "cta": {
      "free":    "Ücretsiz Başla",
      "upgrade": "Yükselt",
      "contact": "İletişime Geç"
    }
  }
}
```

```json
// messages/en.json
{
  "common": {
    "loading":  "Loading...",
    "save":     "Save",
    "cancel":   "Cancel",
    "delete":   "Delete",
    "edit":     "Edit",
    "send":     "Send",
    "back":     "Back",
    "next":     "Next",
    "search":   "Search..."
  },
  "nav": {
    "dashboard": "Dashboard",
    "meetings":  "Meetings",
    "team":      "Team",
    "settings":  "Settings",
    "billing":   "Billing",
    "logout":    "Sign out"
  },
  "meeting": {
    "upload": {
      "title":      "Upload Meeting",
      "dropzone":   "Drop your file here",
      "formats":    "MP3, MP4, WAV, M4A, WebM · Max 500MB",
      "or":         "or",
      "record":     "Record from Browser",
      "processing": "Processing..."
    },
    "status": {
      "pending":      "Pending",
      "queued":       "Queued",
      "transcribing": "Transcribing",
      "summarizing":  "AI Analyzing",
      "completed":    "Completed",
      "failed":       "Failed"
    },
    "sections": {
      "transcript": "Transcript",
      "summary":    "AI Summary",
      "decisions":  "Key Decisions",
      "actions":    "Action Items",
      "sendEmail":  "Send Follow-up Email"
    }
  },
  "pricing": {
    "monthly": "Monthly",
    "yearly":  "Yearly",
    "save":    "Save 20%",
    "currency": {
      "usd": "USD ($)",
      "try": "TRY (₺)"
    },
    "plans": {
      "free": {
        "name":  "Free",
        "price": "$0",
        "desc":  "Get started"
      },
      "pro": {
        "name":  "Pro",
        "price": "$24",
        "desc":  "For individual professionals"
      },
      "team": {
        "name":  "Team",
        "price": "$9",
        "unit":  "/ user / month",
        "desc":  "For teams"
      }
    },
    "cta": {
      "free":    "Start Free",
      "upgrade": "Upgrade",
      "contact": "Contact Us"
    }
  }
}
```

---

## 13. GÜVENLİK KATMANLARI

```
1. AUTH
   └── Supabase Auth (JWT) — tüm API route'larda zorunlu
   └── Middleware ile korunan /dashboard/* sayfaları

2. DATABASE
   └── Row Level Security (RLS) — kullanıcı sadece kendi verisini görür
   └── SUPABASE_SERVICE_KEY → sadece server ve worker'da

3. ÖDEME
   └── Webhook signature doğrulama (HMAC-SHA256)
   └── Idempotency: lemon_subscription_id unique constraint

4. FILE UPLOAD
   └── Supabase Storage pre-signed URL (5 dakika geçerli)
   └── Dosya tipi sunucu tarafında doğrulama
   └── Max size: 500MB

5. WORKER
   └── WORKER_API_SECRET header doğrulama
   └── Redis şifreli (requirepass)
   └── Bull Board sadece localhost:3001

6. RATE LIMITING
   └── Upstash Rate Limiter veya Nginx limit_req
   └── Upload: IP başına dakikada 3 istek
   └── AI endpoint: kullanıcı başına dakikada 10 istek

7. ENVIRONMENT
   └── Tüm secret'lar .env ile (git ignore)
   └── Production'da Vercel env veya Docker secrets
```

---

## 14. DEPLOY PIPELINE

```
GELİŞTİRME ORTAMI
─────────────────
1. git clone && npm install
2. cp .env.example .env.local → değerleri doldur
3. npx supabase start (yerel Supabase)
4. npx supabase db push
5. docker compose -f docker/docker-compose.dev.yml up
6. npm run dev (web)
7. npm run dev:worker (worker — ayrı terminal)

PRODÜKSİYON DEPLOY
────────────────────
WEB (Vercel):
  1. vercel --prod
  2. Env variables → Vercel Dashboard'da ayarla
  3. Domain bağla

WORKER (Ubuntu Server):
  1. git pull origin main
  2. cd docker && docker compose pull
  3. docker compose up -d --build worker
  4. docker compose logs -f worker

VERİTABANI GÜNCELLEMELERİ:
  1. supabase/migrations/ altına yeni .sql ekle
  2. npx supabase db push --linked
  3. ./scripts/generate-types.sh (TypeScript tipleri güncelle)

CI/CD (GitHub Actions — opsiyonel):
  .github/workflows/deploy.yml
  ├── Push to main → Vercel web deploy (otomatik)
  └── Push to main → SSH ile Ubuntu'ya bağlan → docker compose up
```

---

## HIZLI BAŞLANGIÇ

```bash
# 1. Repo kur
git init meetmind && cd meetmind

# 2. Bu dosyayı CLAUDE.md olarak kaydet
# "Claude Code'a verdiğinde tüm yapıyı anlayacak"

# 3. Claude Code'da şunu çalıştır:
# "CLAUDE.md dosyasını oku ve Aşama 1'i başlat"

# 4. Supabase projesi oluştur
# → supabase.com/dashboard → New Project

# 5. .env.local'i doldur

# 6. Lemon Squeezy'de ürünleri oluştur
# → app.lemonsqueezy.com → Store → Products

# 7. Ubuntu sunucusunda:
chmod +x scripts/setup.sh && ./scripts/setup.sh
```

---

*MeetMind — Toplantıların akıllı hale geldiği yer.*
*Built with Claude Code · Powered by GPT-4o · Secured by Supabase*

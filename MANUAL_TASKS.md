# MeetMind — Manuel Kurulum & QA Rehberi

Bu dosya iki bölümden oluşuyor:
- **Bölüm A:** Kurulum — senin yapman gereken servis ve ortam adımları
- **Bölüm B:** QA Raporu — düzeltilen hatalar ve tester için test senaryoları

---

## BÖLÜM A — KURULUM

> Sırayla takip et — her servis bir sonrakine bağımlı.

---

### 1. Supabase Projesi Kur

#### 1.1 Yeni Proje Oluştur
1. https://supabase.com/dashboard → **New project**
2. Proje adı: `meetmind`
3. Database password'ü kaydet (bir kenara yaz)
4. Region: Frankfurt (eu-central-1) ya da en yakın

#### 1.2 Proje Bilgilerini Al
**Settings → API** sayfasından:
```
NEXT_PUBLIC_SUPABASE_URL      = https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...  (anon / public key)
SUPABASE_SERVICE_KEY          = eyJ...  (service_role key — gizli tut)
```

#### 1.3 Migration'ları Çalıştır
```bash
npx supabase login
npx supabase link --project-ref <proje-id-buraya>
npx supabase db push
```
> Proje ID'si Supabase Dashboard URL'inden alınır: `supabase.com/dashboard/project/PROJE-ID`

#### 1.4 TypeScript Tiplerini Üret (opsiyonel — mevcut types/database.ts doğru)
```bash
./scripts/generate-types.sh
```

#### 1.5 Storage Bucket Oluştur
Supabase Dashboard → **Storage** → **New bucket**:
- Bucket name: `meetings`
- Public: **Hayır** (private)
- File size limit: **500 MB**
- Allowed MIME types: `audio/mpeg, audio/mp4, audio/wav, audio/webm, video/mp4, video/webm`

Storage → Bucket Policies → **meetings** bucket için şu politikayı ekle:
```sql
-- Kullanıcı kendi dosyasını yükleyebilir
CREATE POLICY "upload own" ON storage.objects FOR INSERT
  WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

-- Kullanıcı kendi dosyasını okuyabilir
CREATE POLICY "read own" ON storage.objects FOR SELECT
  USING (auth.uid()::text = (storage.foldername(name))[1]);
```

#### 1.6 Google OAuth'u Aktif Et
**Authentication → Providers → Google**:
1. Google Cloud Console'da OAuth 2.0 Client ID oluştur
   - Authorized redirect URIs: `https://xxxx.supabase.co/auth/v1/callback`
2. Client ID ve Secret'ı Supabase'e gir
3. **Save**

#### 1.7 E-posta Template'larını Ayarla
**Authentication → Email Templates**:
- Confirm signup, Magic link, Password reset şablonlarında `{{ .SiteURL }}` URL'ini güncelle

#### 1.8 Realtime'ı Aktif Et
**Database → Replication** (ya da Settings → Replication):
- `meetings` tablosunu Realtime için etkinleştir

---

### 2. Resend (E-posta) Kur

1. https://resend.com → Kayıt ol
2. **Domains** → Add Domain → `meetmind.io` DNS kayıtlarını gir
3. DNS doğrulaması için 24-48 saat bekle
4. **API Keys** → Create API Key
5. Değerleri kaydet:
```
RESEND_API_KEY     = re_...
RESEND_FROM_EMAIL  = noreply@meetmind.io
RESEND_FROM_NAME   = MeetMind
```

---

### 3. Lemon Squeezy (Ödeme) Kur

#### 3.1 Store Oluştur
1. https://app.lemonsqueezy.com → Store oluştur
2. Store adı: `MeetMind`
3. **Store Settings → Webhooks** → Add webhook:
   - URL: `https://meetmind.io/api/webhooks/lemon-squeezy`
   - Events: `subscription_created`, `subscription_updated`, `subscription_cancelled`, `subscription_expired`, `subscription_resumed`
   - Signing secret'ı kaydet → `LEMON_WEBHOOK_SECRET`
4. Store ID'yi kaydet: **Settings → Store** → ID → `LEMON_STORE_ID`

#### 3.2 Pro Ürününü Oluştur
**Products → Add product → "MeetMind Pro"**

4 varyant oluştur:
| Variant Adı | Fiyat | Billing | Para Birimi | ENV |
|---|---|---|---|---|
| Pro Monthly USD | $24/ay | Monthly | USD | `LEMON_PRO_MONTHLY_USD_ID` |
| Pro Yearly USD | $230/yıl | Yearly | USD | `LEMON_PRO_YEARLY_USD_ID` |
| Pro Monthly TRY | ₺699/ay | Monthly | TRY | `LEMON_PRO_MONTHLY_TRY_ID` |
| Pro Yearly TRY | ₺6720/yıl | Yearly | TRY | `LEMON_PRO_YEARLY_TRY_ID` |

> Her varyantın ID'si URL'de görünür: `app.lemonsqueezy.com/products/.../variants/VARIANT-ID`

#### 3.3 Team Ürününü Oluştur
**Products → Add product → "MeetMind Team"**

4 varyant:
| Variant Adı | Fiyat | ENV |
|---|---|---|
| Team Monthly USD | $9/kullanıcı/ay | `LEMON_TEAM_MONTHLY_USD_ID` |
| Team Yearly USD | $86/kullanıcı/yıl | `LEMON_TEAM_YEARLY_USD_ID` |
| Team Monthly TRY | ₺265/kullanıcı/ay | `LEMON_TEAM_MONTHLY_TRY_ID` |
| Team Yearly TRY | ₺2544/kullanıcı/yıl | `LEMON_TEAM_YEARLY_TRY_ID` |

---

### 4. OpenAI API Key Al

1. https://platform.openai.com → API Keys → Create new secret key
2. Kaydet: `OPENAI_API_KEY = sk-...`
3. Billing sayfasında kredi yükle (Whisper + GPT-4o kullanımı ücretli)

> Whisper-1: ~$0.006/dakika  
> GPT-4o: ~$2.50/1M input token, $10/1M output token

---

### 5. Vercel Deploy

#### 5.1 GitHub'a Push Et
```bash
cd /Volumes/ProjectVault/MeetMind
git add .
git commit -m "initial: full MeetMind implementation"
git remote add origin https://github.com/KULLANICI_ADIN/meetmind.git
git push -u origin main
```

#### 5.2 Vercel'e Bağla
1. https://vercel.com → **Add New Project** → GitHub repoyu seç
2. **Root Directory**: bırak boş (vercel.json root'ta)
3. **Framework Preset**: Next.js (otomatik algılanır)
4. **Build & Output Settings**: vercel.json'dan otomatik gelir — değiştirme

#### 5.3 Environment Variables Ekle
Vercel Dashboard → Project Settings → **Environment Variables**

Her birini ekle (isimlerin **tam olarak** bu şekilde girilmesi gerekiyor):

| Variable Name | Örnek Değer | Ortam |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Production, Preview |
| `NEXT_PUBLIC_URL` | `https://meetmind.io` | Production |
| `SUPABASE_SERVICE_KEY` | `eyJ...` | Production |
| `LEMON_API_KEY` | `eyJ...` | Production |
| `LEMON_STORE_ID` | `12345` | Production |
| `LEMON_WEBHOOK_SECRET` | `abcdef...` | Production |
| `LEMON_PRO_MONTHLY_USD_ID` | `111111` | Production |
| `LEMON_PRO_YEARLY_USD_ID` | `111112` | Production |
| `LEMON_PRO_MONTHLY_TRY_ID` | `111113` | Production |
| `LEMON_PRO_YEARLY_TRY_ID` | `111114` | Production |
| `LEMON_TEAM_MONTHLY_USD_ID` | `222221` | Production |
| `LEMON_TEAM_YEARLY_USD_ID` | `222222` | Production |
| `LEMON_TEAM_MONTHLY_TRY_ID` | `222223` | Production |
| `LEMON_TEAM_YEARLY_TRY_ID` | `222224` | Production |
| `WORKER_API_SECRET` | `gizli-anahtar-uret` | Production |
| `WORKER_INTERNAL_URL` | `https://worker.meetmind.io` | Production |
| `RESEND_API_KEY` | `re_...` | Production |
| `RESEND_FROM_EMAIL` | `noreply@meetmind.io` | Production |
| `RESEND_FROM_NAME` | `MeetMind` | Production |

> **Önemli:** Vercel ortam değişkenlerini büyük harfli girmen gerekiyor (NEXT_PUBLIC_SUPABASE_URL gibi). vercel.json'daki `@reference` formatıyla eşleşmeli.

#### 5.4 Custom Domain Ekle
Vercel Dashboard → Project → **Domains** → `meetmind.io` ekle
DNS kayıtlarını domain sağlayıcında güncelle.

#### 5.5 Supabase Auth Callback URL'ini Güncelle
Supabase Dashboard → **Authentication → URL Configuration**:
- Site URL: `https://meetmind.io`
- Redirect URLs: `https://meetmind.io/api/auth/callback`

---

### 6. Ubuntu Worker Sunucusu Kur

#### 6.1 Sunucu Gereksinimleri
- Ubuntu 22.04 LTS
- En az 2 CPU, 4 GB RAM (Whisper + FFmpeg için)
- En az 20 GB disk

#### 6.2 İlk Kurulum
```bash
git clone https://github.com/KULLANICI_ADIN/meetmind.git
cd meetmind
cp .env.example .env
nano .env  # değerleri doldur
chmod +x scripts/setup.sh
./scripts/setup.sh
```

#### 6.3 .env Değerleri (Sunucuda)
```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
OPENAI_API_KEY=sk-...
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@meetmind.io
RESEND_FROM_NAME=MeetMind
REDIS_PASSWORD=guclu-bir-sifre-yaz
REDIS_URL=redis://:REDIS_PASSWORD@redis:6379
WORKER_CONCURRENCY=3
WORKER_API_SECRET=vercel-ile-ayni-secret-gir
NEXT_PUBLIC_URL=https://meetmind.io
DOMAIN=worker.meetmind.io
ADMIN_EMAIL=admin@meetmind.io
BULL_BOARD_USERNAME=admin
BULL_BOARD_PASSWORD=guclu-bir-sifre
```

#### 6.4 Cloudflare Tunnel Kur (statik IP yoksa)
```bash
# Cloudflare Zero Trust → Tunnels → Create tunnel: "meetmind"
# Token'ı kopyala
echo "CLOUDFLARE_TUNNEL_TOKEN=eyJ..." >> .env
nano docker/cloudflare/config.yml  # TUNNEL_ID'yi güncelle
```
Tunnel'da şu route'u tanımla:
- `worker.meetmind.io` → `http://worker:3002`

#### 6.5 Servisleri Başlat
```bash
docker compose -f docker/docker-compose.yml up -d
docker compose -f docker/docker-compose.yml logs -f worker
```

#### 6.6 Worker Sağlığını Kontrol Et
```bash
curl http://localhost:3002/health
# Dönen: {"status":"ok","queues":["transcription","summary","email"]}
```

---

## BÖLÜM B — QA RAPORU

### Düzeltilen Hatalar

Kod incelemesinde bulunan ve düzeltilen hatalar:

---

#### HATA-1 (KRİTİK): Billing Portal JSON Dönüyordu, Redirect Etmiyordu
- **Dosya:** `apps/web/app/api/billing/portal/route.ts`
- **Sorun:** `/api/billing/portal` endpoint'i `{ portalUrl }` JSON döndürüyordu. `ManageButton` bileşeni bunu `href` ile açtığı için tarayıcı ham JSON gösteriyordu — kullanıcı aboneliğini yönetemiyordu.
- **Düzeltme:** `NextResponse.json({ portalUrl })` → `NextResponse.redirect(portalUrl)` — artık Lemon Squeezy portala doğrudan yönlendiriyor.

---

#### HATA-2 (KRİTİK): Yeni Toplantıda Çift POST — Mükerrer Kayıt Oluşturuyordu
- **Dosya:** `apps/web/app/[locale]/(dashboard)/meetings/new/page.tsx`
- **Sorun:** Dosya yükleme akışında aynı toplantı için iki kez `POST /api/meetings` çağrılıyordu. İkinci çağrıda `_enqueueOnly` parametresi gönderiliyordu ama API bu parametreyi tanımıyordu — ikinci bir toplantı kaydı oluşturuyordu.
- **Düzeltme:** İkinci POST kaldırıldı. Transkripsiyon sıraya alma işlemi artık `PATCH /api/meetings/:id` çağrısına taşındı.

---

#### HATA-3 (KRİTİK): PATCH Route Ses Dosyası Yolunu Güncellemiyor, Worker'ı Tetiklemiyordu
- **Dosya:** `apps/web/app/api/meetings/[id]/route.ts`
- **Sorun:** `PATCH /api/meetings/:id` endpoint'i `audioFilePath` alanını işlemiyordu. Dosya yüklendikten sonra toplantı kaydı `__pending__` yoluyla kalıyordu ve worker hiç tetiklenmiyordu — toplantılar sonsuza kadar "Bekliyor" statüsünde kalıyordu.
- **Düzeltme:** PATCH route'a `audioFilePath` desteği eklendi. Gerçek bir dosya yolu gönderildiğinde `audio_file_path` alanı güncelleniyor ve worker `transcription` kuyruğuna iş ekleniyor.

---

#### HATA-4 (KRİTİK): İlk POST `__pending__` Yoluyla Worker'a İş Gönderiyordu
- **Dosya:** `apps/web/app/api/meetings/route.ts`
- **Sorun:** Toplantı ilk oluşturulurken `audioFilePath: '__pending__'` ile POST yapılıyor, ardından API hemen worker'a bu geçersiz yolu gönderiyordu. Worker var olmayan bir dosyayı indirmeye çalışıp hata veriyordu.
- **Düzeltme:** `audioFilePath === '__pending__'` ise worker çağrısı atlanıyor, erken return yapılıyor.

---

#### HATA-5 (ORTA): Pricing Table Upgrade Butonu Checkout Başlatmıyordu
- **Dosya:** `apps/web/components/marketing/pricing-table.tsx`
- **Sorun:** "Yükselt" butonuna tıklandığında sadece `/settings/billing` sayfasına yönlendiriyordu, Lemon Squeezy checkout'u başlatmıyordu.
- **Düzeltme:** `handleUpgrade` fonksiyonu artık `/api/billing/checkout?plan=X&interval=Y&currency=Z` endpoint'ini çağırıyor ve dönen `checkoutUrl`'e yönlendiriyor. Yükleme sırasında buton devre dışı bırakılıyor.

---

#### HATA-6 (ORTA): Checkout API Sadece `variantId` Kabul Ediyordu
- **Dosya:** `apps/web/app/api/billing/checkout/route.ts`
- **Sorun:** Checkout endpoint'i yalnızca direkt `variantId` ile çalışıyordu. Frontend `plan+interval+currency` kombinasyonu gönderdiğinde 400 hatası veriyordu.
- **Düzeltme:** `plan`, `interval`, `currency` parametrelerinden server-side `variantId` çözümlemesi eklendi. Geriye dönük uyumluluk için `variantId` hâlâ kabul ediliyor.

---

#### HATA-7 (ORTA): Webhook Handler'da Kullanılmayan `parseEvent` Fonksiyonu
- **Dosya:** `apps/web/app/api/webhooks/lemon-squeezy/route.ts`
- **Sorun:** Handler fonksiyonları `ReturnType<typeof parseEvent>` tipini kullanıyordu ama `parseEvent` hiçbir zaman çağrılmıyordu. Tip sistemi `parseEvent`'in return tipinden circular bir şekilde türetiliyordu.
- **Düzeltme:** `parseEvent` fonksiyonu kaldırıldı. `LemonEvent` ve `AdminClient` isimleriyle açık tip tanımları eklendi.

---

#### HATA-8 (DÜŞÜK): Middleware API Route'larında i18n İşlemi Çalıştırıyordu
- **Dosya:** `apps/web/middleware.ts`
- **Sorun:** `intlMiddleware` API route'larında da çalıştırılıyordu. `next-intl` bu route'larda locale yönlendirmesi yapmasa da gereksiz overhead yaratıyordu.
- **Düzeltme:** `/api` ile başlayan istekler için `intlMiddleware` atlanıyor; yalnızca auth cookie yenileme yapılıyor.

---

#### HATA-9 (DÜŞÜK): TypeScript Tip Dönüşümü Belirsizliği
- **Dosya:** `apps/web/app/api/meetings/route.ts`
- **Sorun:** `planData as string ?? 'free'` ifadesi null durumunda operator önceliği nedeniyle kafa karıştırıcıydı.
- **Düzeltme:** `(planData as string | null) ?? 'free'` olarak düzeltildi.

---

### QA Test Senaryoları

Aşağıdaki testler env değişkenleri ve servisler kurulduktan sonra yapılmalı.

#### Temel Akış
- [ ] https://meetmind.io açılıyor, Obsidian tasarımı görünüyor
- [ ] `/tr/login` ve `/en/login` sayfaları açılıyor
- [ ] E-posta + şifre ile kayıt — doğrulama e-postası geliyor
- [ ] Magic link ile giriş çalışıyor
- [ ] Google OAuth ile giriş çalışıyor
- [ ] Giriş sonrası `/tr/dashboard` ya da `/en/dashboard`'a yönlendiriyor

#### Toplantı Yükleme (En Kritik Akış)
- [ ] Yeni toplantı sayfası açılıyor (`/tr/meetings/new`)
- [ ] MP3 dosyası drag & drop ile yükleniyor
- [ ] Başlık otomatik dosya adından dolduruluyor
- [ ] "Start Processing" tıklandığında status badge "Sıraya Alındı" oluyor
- [ ] 30-60 saniye içinde status "Transkripsiyon Yapılıyor" → "AI Analiz Ediyor" → "Tamamlandı" sırası
- [ ] Toplantı detay sayfasında transkript görünüyor
- [ ] AI özeti ve kararlar görünüyor
- [ ] Aksiyon maddeleri listesi doluyor
- [ ] Tarayıcı kayıt modunda kayıt yapılabiliyor

#### Aksiyon Yönetimi
- [ ] Aksiyon maddesinin durumu değiştirilebiliyor (Açık → Tamamlandı)
- [ ] Yeni aksiyon el ile eklenebiliyor
- [ ] Aksiyona kişi atanabiliyor

#### E-posta Gönderimi
- [ ] "Takip E-postası Gönder" butonuna tıklandığında alıcı adresi girilebiliyor
- [ ] E-posta gönderiliyor ve email_logs tablosuna kaydediliyor
- [ ] Resend Dashboard'da e-posta görünüyor

#### Ödeme Akışı
- [ ] Pricing sayfasında plan kartları görünüyor (`/tr/pricing`)
- [ ] USD/TRY ve Aylık/Yıllık toggle'ları çalışıyor
- [ ] "Yükselt" butonuna tıklandığında Lemon Squeezy checkout sayfası açılıyor (JSON göstermiyor)
- [ ] Test ödeme yapıldıktan sonra Billing sayfasında plan "Pro" olarak görünüyor
- [ ] Pro kullanıcı için "Aboneliği Yönet" butonu Lemon Squeezy portala yönlendiriyor (JSON göstermiyor)

#### Free Plan Limit
- [ ] Free kullanıcı 5 toplantıdan sonra 403 hatası alıyor
- [ ] Hata mesajı görünüyor: "Monthly meeting limit reached"

#### i18n
- [ ] `/tr/...` Türkçe içerik gösteriyor
- [ ] `/en/...` İngilizce içerik gösteriyor
- [ ] Locale switcher çalışıyor
- [ ] Dashboard içindeyken dil değiştirince aynı sayfada kalıyor

#### Takım Özellikleri (Team Plan)
- [ ] Free/Pro kullanıcı için "Takım özelliği için Team planına geçmen gerekiyor" mesajı görünüyor
- [ ] Team kullanıcısı davet e-postası gönderebiliyor
- [ ] Davet edilen kullanıcı takıma katılabiliyor

---

### Bilinen Eksikler (Sonraki Aşamada Yapılacak)

Bu özellikler kodda yer almıyor veya yer tutucu olarak var:

| Özellik | Durum | Not |
|---------|-------|-----|
| PDF Export | Yok | Pro plan özelliği — sonraki sprint |
| Notion Export | Yok | Pro plan özelliği — sonraki sprint |
| Slack Export | Yok | Pro plan özelliği — sonraki sprint |
| API Erişimi (Pro) | Yok | Endpoint'ler var ama API key sistemi yok |
| SSO / SAML | Yok | Enterprise özelliği |
| Hesap silme | UI var | API route yok — buton şu an işlevsiz |
| Worker Bull Board | Docker'da var | Sadece localhost:3001 — VPN/SSH tunnel gerekiyor |
| Sentry entegrasyonu | Yok | Opsiyonel — vercel.json'a eklenebilir |

---

### Ortam Değişkeni Özeti

Tüm env değişkenleri `.env.example` dosyasında listeleniyor. En kritikler:

| Değişken | Nerede | Açıklama |
|----------|--------|----------|
| `WORKER_INTERNAL_URL` | Vercel + Worker | Worker'ın Vercel'den ulaşılabilir adresi — **worker çalışmazsa toplantılar işlenmez** |
| `WORKER_API_SECRET` | Vercel + Worker | Her iki tarafta **aynı** olmalı — farklıysa worker iş almaz |
| `LEMON_WEBHOOK_SECRET` | Vercel | Yanlışsa ödeme webhook'ları reddedilir — abonelik aktivasyonu çalışmaz |
| `SUPABASE_SERVICE_KEY` | Vercel + Worker | Admin işlemler için — asla frontend'e verme |

---

*Bu dosya Manuel kurulum ve QA sürecini kapsar — kod değişiklikleri Claude Code ile yapılır.*

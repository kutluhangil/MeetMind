# MeetMind — Kurulum El Kitabı

Kodu deploy etmeden önce bu adımları **sırasıyla** tamamla.
Her servis bir sonrakine bağımlı; atlama.

---

## 1. Supabase — Veritabanı ve Auth

### 1.1 Proje Oluştur

1. https://supabase.com/dashboard → **New project** tıkla
2. Proje adı: `meetmind`
3. Database password seç (güçlü bir şifre, bir yere yaz — bir daha göremezsin)
4. Region: **Frankfurt (eu-central-1)** — ya da sana en yakın Avrupa bölgesi
5. **Create new project** tıkla, proje oluşana kadar (1-2 dk) bekle

### 1.2 API Anahtarlarını Al

Proje oluştuktan sonra **Settings → API** sayfasına git:

| Değişken Adı | Nereden Alacaksın |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL alanı (örn: `https://abcxyz.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` anahtarı |
| `SUPABASE_SERVICE_KEY` | `service_role` `secret` anahtarı — **hiçbir zaman frontend'e verme** |

Bunları bir kenara kaydet, ileride kullanacaksın.

### 1.3 Veritabanı Migration'larını Çalıştır

Terminali açıp projenin kök dizinine gir:

```bash
cd /Volumes/ProjectVault/MeetMind
```

Supabase CLI'ı kur (yüklü değilse):
```bash
npm install -g supabase
```

Hesabına giriş yap:
```bash
supabase login
# Tarayıcı açılır, giriş yap
```

Projeyi bağla (Proje ID'si Dashboard URL'inden: `supabase.com/dashboard/project/PROJE-ID`):
```bash
supabase link --project-ref PROJE-ID-BURAYA
```

Migration'ları çalıştır:
```bash
supabase db push
```

> Başarılı çıktı: "Applying migration 001_initial_schema... 002_rls_policies... 003_functions..." şeklinde olacak.

### 1.4 Storage Bucket Oluştur

Dashboard → **Storage** → **New bucket** tıkla:

- **Name:** `meetings`
- **Public bucket:** KAPALI (private kalmalı)
- **File size limit:** 500 MB

Bucket oluştuktan sonra **Policies** sekmesine tıkla → **New policy → For full customization** seç ve şunları ekle:

**Policy 1 — Upload:**
```sql
CREATE POLICY "upload own" ON storage.objects
  FOR INSERT WITH CHECK (
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

**Policy 2 — Read:**
```sql
CREATE POLICY "read own" ON storage.objects
  FOR SELECT USING (
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

### 1.5 Realtime'ı Aktif Et

Dashboard → **Database → Replication** → `meetings` tablosunu bul → toggle'ı aç (Source tipi: `realtime`)

### 1.6 Google OAuth Kur (Opsiyonel ama önerilen)

**Google Cloud Console'da:**
1. https://console.cloud.google.com → yeni proje oluştur (ya da mevcut kullan)
2. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Authorized redirect URIs ekle:
   ```
   https://PROJE-ID.supabase.co/auth/v1/callback
   ```
5. **Client ID** ve **Client Secret**'ı kopyala

**Supabase'de:**
1. Dashboard → **Authentication → Providers → Google**
2. Enable Google toggle'ı aç
3. Client ID ve Client Secret'ı gir → **Save**

### 1.7 E-posta Şablonlarını Güncelle

Dashboard → **Authentication → Email Templates**

Her template için `{{ .SiteURL }}` değerini kendi domain'inle güncelle:
- **Confirm signup** → Site URL: `https://meetmind.io`
- **Magic Link** → Site URL: `https://meetmind.io`
- **Reset Password** → Site URL: `https://meetmind.io`

### 1.8 Site URL ve Callback URL Ayarla

Dashboard → **Authentication → URL Configuration**:

- **Site URL:** `https://meetmind.io`
- **Redirect URLs** (+ Add URL tıkla): `https://meetmind.io/api/auth/callback`

---

## 2. Resend — E-posta Gönderimi

### 2.1 Hesap Oluştur

1. https://resend.com → **Sign Up**
2. Hesabını onayla (e-posta gelir)

### 2.2 Domain Ekle ve Doğrula

1. Dashboard → **Domains → Add Domain**
2. Domain: `meetmind.io` (ya da ne kullanıyorsan)
3. Sana DNS kayıtları verecek — bunları domain sağlayıcında (Namecheap, Cloudflare, vb.) ekle
4. **Verify DNS Records** tıkla — DNS yayılması 5 dk ile 48 saat sürebilir

### 2.3 API Key Al

1. Dashboard → **API Keys → Create API Key**
2. Name: `meetmind-production`
3. Permission: **Full access** (ya da Sending access yeterli)
4. Key'i kopyala — bir daha göremezsin

Kaydedeceklerin:
```
RESEND_API_KEY    = re_xxxxxxxxxxxx
RESEND_FROM_EMAIL = noreply@meetmind.io
RESEND_FROM_NAME  = MeetMind
```

---

## 3. Lemon Squeezy — Ödeme Sistemi

### 3.1 Store Kur

1. https://app.lemonsqueezy.com → **Stores → Create Store**
2. Store name: `MeetMind`
3. Currency: USD (birden fazla para birimi için sonra variant ekleyeceksin)
4. **Store ID**'yi kaydet: Settings → Store → kopyala → `LEMON_STORE_ID`

### 3.2 API Key Al

1. Dashboard → **Settings → API → Create API Key**
2. Name: `meetmind-production`
3. Key'i kopyala → `LEMON_API_KEY`

### 3.3 Pro Ürünü Oluştur

**Products → Add product:**
- Product name: `MeetMind Pro`
- Pricing model: **Subscription**

4 variant oluştur (her biri için Add variant tıkla):

| Variant Name | Price | Billing | Env Değişkeni |
|---|---|---|---|
| Pro Monthly USD | $24.00 | Monthly | `LEMON_PRO_MONTHLY_USD_ID` |
| Pro Yearly USD | $230.00 | Yearly | `LEMON_PRO_YEARLY_USD_ID` |
| Pro Monthly TRY | ₺699.00 | Monthly | `LEMON_PRO_MONTHLY_TRY_ID` |
| Pro Yearly TRY | ₺6720.00 | Yearly | `LEMON_PRO_YEARLY_TRY_ID` |

> Her variant'ın ID'si URL'de görünür: `app.lemonsqueezy.com/products/.../variants/**12345**`

### 3.4 Team Ürünü Oluştur

**Products → Add product:**
- Product name: `MeetMind Team`
- Pricing model: **Subscription**

4 variant:

| Variant Name | Price | Billing | Env Değişkeni |
|---|---|---|---|
| Team Monthly USD | $9.00 | Monthly | `LEMON_TEAM_MONTHLY_USD_ID` |
| Team Yearly USD | $86.00 | Yearly | `LEMON_TEAM_YEARLY_USD_ID` |
| Team Monthly TRY | ₺265.00 | Monthly | `LEMON_TEAM_MONTHLY_TRY_ID` |
| Team Yearly TRY | ₺2544.00 | Yearly | `LEMON_TEAM_YEARLY_TRY_ID` |

### 3.5 Webhook Kur

1. Dashboard → **Store Settings → Webhooks → Add webhook**
2. **URL:** `https://meetmind.io/api/webhooks/lemon-squeezy`
3. **Events** — şunları seç:
   - `subscription_created`
   - `subscription_updated`
   - `subscription_cancelled`
   - `subscription_expired`
   - `subscription_resumed`
4. **Save** → **Signing secret**'ı kopyala → `LEMON_WEBHOOK_SECRET`

---

## 4. OpenAI — Transkripsiyon ve AI Özet

### 4.1 API Key Al

1. https://platform.openai.com/api-keys → **Create new secret key**
2. Name: `meetmind`
3. Key'i kopyala (bir daha göremezsin) → `OPENAI_API_KEY`

### 4.2 Bakiye Yükle

**Settings → Billing → Add payment method** → kredi kartı ekle

Başlangıç için $20-50 yeterli:
- Whisper-1 (transkripsiyon): ~$0.006 / dakika
- GPT-4o (özet): ~$0.005 / toplantı (ortalama)

---

## 5. GitHub — Kod Deposu

### 5.1 Repo Oluştur

1. https://github.com/new
2. Repository name: `meetmind`
3. **Private** seç
4. **Create repository**

### 5.2 Kodu Push Et

```bash
cd /Volumes/ProjectVault/MeetMind
git add .
git commit -m "feat: initial MeetMind implementation"
git remote add origin https://github.com/KULLANICI_ADIN/meetmind.git
git push -u origin main
```

---

## 6. Vercel — Frontend Deploy

### 6.1 Projeyi Bağla

1. https://vercel.com → **Add New Project**
2. **Import Git Repository** → GitHub'ı bağla → `meetmind` repoyu seç
3. Ayarlar:
   - **Root Directory:** boş bırak (vercel.json root'ta)
   - **Framework Preset:** Next.js (otomatik algılanır)
   - **Build Command:** `cd apps/web && npm run build` (vercel.json'dan gelir, değiştirme)
4. Şimdilik **Deploy** tıklama, önce env var'ları ekle

### 6.2 Environment Variables Ekle

**Project → Settings → Environment Variables**

> **Önemli:** Vercel Dashboard'a girerken **küçük harfli** isimleri kullan (vercel.json `@reference` formatı küçük harf ister).

Aşağıdaki tüm satırları tek tek ekle:

| Dashboard'a Girilecek İsim | Değer | Environment |
|---|---|---|
| `next_public_supabase_url` | `https://xxx.supabase.co` | Production + Preview |
| `next_public_supabase_anon_key` | `eyJ...` (anon key) | Production + Preview |
| `next_public_url` | `https://meetmind.io` | Production |
| `supabase_service_key` | `eyJ...` (service_role key) | Production |
| `lemon_api_key` | `eyJ...` | Production |
| `lemon_store_id` | `12345` | Production |
| `lemon_webhook_secret` | `abcdef...` | Production |
| `lemon_pro_monthly_usd_id` | Variant ID | Production |
| `lemon_pro_yearly_usd_id` | Variant ID | Production |
| `lemon_pro_monthly_try_id` | Variant ID | Production |
| `lemon_pro_yearly_try_id` | Variant ID | Production |
| `lemon_team_monthly_usd_id` | Variant ID | Production |
| `lemon_team_yearly_usd_id` | Variant ID | Production |
| `lemon_team_monthly_try_id` | Variant ID | Production |
| `lemon_team_yearly_try_id` | Variant ID | Production |
| `worker_api_secret` | Rastgele güçlü string (aşağıya bak) | Production |
| `worker_internal_url` | `https://worker.meetmind.io` | Production |
| `resend_api_key` | `re_...` | Production |
| `resend_from_email` | `noreply@meetmind.io` | Production |
| `resend_from_name` | `MeetMind` | Production |

**`worker_api_secret` nasıl üretilir:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Çıktıyı kopyala, hem buraya hem ubuntu sunucusuna aynı değeri gir
```

### 6.3 Deploy Et

1. **Project → Deployments → Redeploy** (ya da ilk deploy için **Deploy** butonuna bas)
2. Build loglarını izle, hata yoksa yeşil tik görürsün

### 6.4 Domain Ekle

1. **Project → Settings → Domains → Add**
2. `meetmind.io` gir
3. Sana verilen DNS kayıtlarını (A veya CNAME) domain sağlayıcında güncelle
4. Vercel otomatik SSL sertifikası oluşturur (1-5 dk)

---

## 7. Ubuntu Sunucu — Worker Servisi

### 7.1 Sunucu Gereksinimleri

- Ubuntu 22.04 LTS
- **Minimum:** 2 CPU çekirdek, 4 GB RAM
- **Önerilen:** 4 CPU, 8 GB RAM (Whisper CPU'yu çok yer)
- Disk: 20 GB+
- Docker ve Docker Compose kurulu olmalı

### 7.2 Docker Kur (kurulu değilse)

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Çıkıp tekrar giriş yap veya: newgrp docker
```

### 7.3 Projeyi Klonla

```bash
git clone https://github.com/KULLANICI_ADIN/meetmind.git
cd meetmind
```

### 7.4 .env Dosyasını Oluştur

```bash
cp .env.example .env
nano .env
```

Şu değerleri doldur:

```bash
# Supabase
SUPABASE_URL=https://PROJE-ID.supabase.co
SUPABASE_SERVICE_KEY=eyJ...  # service_role key

# OpenAI
OPENAI_API_KEY=sk-...

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@meetmind.io
RESEND_FROM_NAME=MeetMind

# Redis (container içi iletişim için)
REDIS_PASSWORD=güçlü-bir-şifre-yaz-buraya
REDIS_URL=redis://:güçlü-bir-şifre-yaz-buraya@redis:6379

# Worker — Vercel'deki worker_api_secret ile AYNI olmalı
WORKER_CONCURRENCY=3
WORKER_API_SECRET=vercel-de-ayni-degeri-girdigin-secret

# Domain ve SSL
NEXT_PUBLIC_URL=https://meetmind.io
DOMAIN=worker.meetmind.io
ADMIN_EMAIL=admin@meetmind.io

# Bull Board (queue monitoring — sadece localhost'tan erişilir)
BULL_BOARD_USERNAME=admin
BULL_BOARD_PASSWORD=güçlü-bir-şifre
```

> **Redis şifresi:** Aynı güçlü şifreyi hem `REDIS_PASSWORD` hem `REDIS_URL` içinde kullan.

### 7.5 Cloudflare Tunnel Kur (Statik IP Yoksa)

Ev sunucusu veya statik IP olmayan ortam için:

1. https://one.dash.cloudflare.com → **Access → Tunnels → Create a tunnel**
2. Tunnel name: `meetmind`
3. **Save tunnel** → token'ı kopyala

```bash
echo "CLOUDFLARE_TUNNEL_TOKEN=eyJ..." >> .env
```

4. Tunnel'a route ekle:
   - **Public hostname:** `worker.meetmind.io`
   - **Service:** `http://worker:3002`

5. DNS otomatik oluşur (Cloudflare'e bağlı domain gerekir)

### 7.6 Docker Servislerini Başlat

```bash
docker compose -f docker/docker-compose.yml build
docker compose -f docker/docker-compose.yml up -d
```

Durumu kontrol et:
```bash
docker compose -f docker/docker-compose.yml ps
# worker, redis, cloudflared: "Up" görünmeli
```

Worker loglarını izle:
```bash
docker compose -f docker/docker-compose.yml logs -f worker
# "🚀 MeetMind Worker started" görünmeli
```

### 7.7 Worker Sağlığını Test Et

```bash
# Sunucunun kendisinden:
curl http://localhost:3002/health
# Dönen: {"status":"ok","queues":["transcription","summary","email"]}

# Dışarıdan (Cloudflare tunnel aktifse):
curl https://worker.meetmind.io/health
```

### 7.8 Vercel'e Worker URL'ini Gir

Worker çalışır hale gelince Vercel'deki `worker_internal_url` değerini güncelle:

```
worker_internal_url = https://worker.meetmind.io
```

**Project Settings → Environment Variables → `worker_internal_url` → Edit**

Değeri güncelledikten sonra **Redeploy** yap.

---

## 8. Son Kontroller — Uçtan Uca Test

Her adımı sırasıyla test et. Bir önceki geçmeden sonrakine geçme.

### 8.1 Frontend Açılıyor mu?

- [ ] `https://meetmind.io` → Obsidian tasarımlı landing page görünüyor
- [ ] `https://meetmind.io/tr/login` → Giriş sayfası açılıyor
- [ ] `https://meetmind.io/en/login` → İngilizce giriş sayfası açılıyor
- [ ] Pricing sayfası: `https://meetmind.io/tr/pricing` → Plan kartları görünüyor

### 8.2 Auth Çalışıyor mu?

- [ ] E-posta + şifre ile kayıt → doğrulama e-postası geliyor
- [ ] E-postayı onayla → dashboard'a yönlendiriyor
- [ ] Magic link ile giriş çalışıyor
- [ ] Google ile giriş çalışıyor (OAuth kurulduysa)
- [ ] Çıkış yapınca `/tr/login`'e atıyor

### 8.3 Toplantı Yükleme (Ana Akış — En Kritik)

- [ ] `/tr/meetings/new` açılıyor
- [ ] Bir MP3 dosyası sürükle-bırak → dosya adı başlığa otomatik dolmuyor mu?
- [ ] **Start Processing** tıkla
- [ ] Status badge "Sıraya Alındı" oluyor
- [ ] Worker loglarında `transcription` job görünüyor:
  ```bash
  docker compose -f docker/docker-compose.yml logs -f worker
  ```
- [ ] 30-60 saniye içinde status sırası: "Transkripsiyon" → "AI Analiz" → "Tamamlandı"
- [ ] Toplantı detay sayfasında transkript görünüyor
- [ ] AI özeti ve kararlar görünüyor
- [ ] Aksiyon maddeleri listesi dolmuyor mu? (toplantıda konuşulan görevler)

### 8.4 E-posta Gönderimi

- [ ] Tamamlanmış bir toplantıda "Takip E-postası Gönder" bölümü görünüyor
- [ ] Kendi e-posta adresini gir → **Gönder** tıkla
- [ ] E-postayı aldın mı?
- [ ] Resend Dashboard'da gönderim görünüyor mu?

### 8.5 Ödeme Akışı

- [ ] Pricing sayfasında "Yükselt" butonuna tıkla
- [ ] Lemon Squeezy checkout sayfası açılıyor (JSON değil!)
- [ ] **Test card:** `4242 4242 4242 4242` exp: 12/25 CVV: 123
- [ ] Ödeme sonrası `/dashboard?upgraded=true` sayfasına dönüyor
- [ ] Billing sayfasında plan "Pro" gösteriyor
- [ ] "Aboneliği Yönet" tıklayınca Lemon Squeezy portala gidiyor (JSON değil!)

### 8.6 Hata Senaryoları

- [ ] Bozuk bir dosya yükle (örn. .txt'yi .mp3 yaparak) → "Hata" status çıkıyor
- [ ] "Tekrar Dene" butonu görünüyor → tıklayınca yeniden deniyor
- [ ] Free plan ile 6. toplantıyı yüklemeye çalış → "Limit reached" hatası görünüyor

### 8.7 Realtime Test

- [ ] Dashboard açıkken yeni bir sekmede toplantı yükle
- [ ] Dashboard sekmesine dön — yeni toplantı otomatik listenin başına geliyor mu? (sayfa yenilemeden)

---

## 9. Güncelleme Prosedürü

### Frontend Güncelleme (Vercel — Otomatik)

`main` branch'e push edince Vercel otomatik deploy yapar:

```bash
git add .
git commit -m "feat: yeni özellik"
git push origin main
# Vercel 1-2 dakikada deploy eder
```

### Worker Güncelleme (Ubuntu Sunucu)

```bash
cd meetmind
git pull origin main
docker compose -f docker/docker-compose.yml build worker
docker compose -f docker/docker-compose.yml up -d worker
docker compose -f docker/docker-compose.yml logs -f worker
# "🚀 MeetMind Worker started" görünmeli
```

### Veritabanı Güncelleme

Yeni migration eklenince:

```bash
# Yerel makineden:
supabase db push
```

---

## 10. Periyodik Bakım

| Ne Zaman | Ne Yapılacak |
|---|---|
| Her 3 ayda | Lemon Squeezy TRY fiyatlarını kur değişimine göre güncelle |
| Her ay | Supabase Dashboard → **Reports** → kullanım kontrol et (free tier: 500 MB DB, 1 GB storage) |
| Her ay | OpenAI kullanım ve maliyeti kontrol et |
| Güvenlik güncellemesi gelince | `cd meetmind && git pull && docker compose up -d --build` |

---

## Sorun Giderme

### "Worker bağlantısı yok, toplantı 'Bekliyor' kalıyor"

```bash
# Worker ayakta mı?
docker compose -f docker/docker-compose.yml ps

# Health check:
curl http://localhost:3002/health

# Loglar:
docker compose -f docker/docker-compose.yml logs --tail=50 worker

# Vercel'deki WORKER_INTERNAL_URL doğru mu?
# → Project Settings → Environment Variables → worker_internal_url
```

### "Checkout butonu JSON gösteriyor"

`LEMON_*_ID` değişkenlerinden biri eksik. Vercel Dashboard'da tüm variant ID'lerini kontrol et.

### "Supabase Migration hatası"

```bash
supabase db reset  # DİKKAT: tüm veriyi siler, sadece geliştirmede kullan
supabase db push
```

### "Redis bağlantı hatası"

`.env` dosyasındaki `REDIS_PASSWORD` ve `REDIS_URL` içindeki şifreyi karşılaştır, aynı olmalı.

---

*Bu dosya deployment ve QA sürecini kapsar. Kod değişiklikleri için Claude Code'u kullan.*

# MeetMind — Manuel Kurulum Rehberi

Bu dosya, kod tarafından otomatik yapılamayan, **senin yapman gereken** adımları içeriyor.
Sırayla takip et — her servis bir sonrakine bağımlı.

---

## 1. Supabase Projesi Kur

### 1.1 Yeni Proje Oluştur
1. https://supabase.com/dashboard → **New project**
2. Proje adı: `meetmind`
3. Database password'ü kaydet (bir kenara yaz)
4. Region: Frankfurt (en_EU) ya da en yakın

### 1.2 Proje Bilgilerini Al
**Settings → API** sayfasından:
```
NEXT_PUBLIC_SUPABASE_URL      = https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...  (anon / public key)
SUPABASE_SERVICE_KEY          = eyJ...  (service_role key — gizli tut)
```

### 1.3 Migration'ları Çalıştır
```bash
# Terminalde, proje klasöründe:
npx supabase login
npx supabase link --project-ref <proje-id-buraya>
npx supabase db push
```
> Proje ID'si Supabase Dashboard URL'inden alınır: `supabase.com/dashboard/project/PROJE-ID`

### 1.4 TypeScript Tiplerini Üret (opsiyonel — mevcut types/database.ts zaten doğru)
```bash
./scripts/generate-types.sh
```

### 1.5 Storage Bucket Oluştur
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

### 1.6 Google OAuth'u Aktif Et
**Authentication → Providers → Google**:
1. Google Cloud Console'da OAuth 2.0 Client ID oluştur
   - Authorized redirect URIs: `https://xxxx.supabase.co/auth/v1/callback`
2. Client ID ve Secret'ı Supabase'e gir
3. **Save**

### 1.7 E-posta Template'larını Ayarla
**Authentication → Email Templates**:
- Confirm signup, Magic link, Password reset şablonlarında `{{ .SiteURL }}` URL'ini güncelle

### 1.8 Realtime'ı Aktif Et
**Database → Replication** (ya da Settings → Replication):
- `meetings` tablosunu Realtime için etkinleştir

---

## 2. Resend (E-posta) Kur

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

## 3. Lemon Squeezy (Ödeme) Kur

### 3.1 Store Oluştur
1. https://app.lemonsqueezy.com → Store oluştur
2. Store adı: `MeetMind`
3. **Store Settings → Webhooks** → Add webhook:
   - URL: `https://meetmind.io/api/webhooks/lemon-squeezy`
   - Events: `subscription_created`, `subscription_updated`, `subscription_cancelled`, `subscription_expired`, `subscription_resumed`
   - Signing secret'ı kaydet → `LEMON_WEBHOOK_SECRET`

4. Store ID'yi kaydet: **Settings → Store** → ID → `LEMON_STORE_ID`

### 3.2 Pro Ürününü Oluştur
**Products → Add product → "MeetMind Pro"**

4 varyant oluştur:
| Variant Adı | Fiyat | Billing | Para Birimi | ENV |
|---|---|---|---|---|
| Pro Monthly USD | $24/ay | Monthly | USD | `LEMON_PRO_MONTHLY_USD_ID` |
| Pro Yearly USD | $230/yıl | Yearly | USD | `LEMON_PRO_YEARLY_USD_ID` |
| Pro Monthly TRY | ₺699/ay | Monthly | TRY | `LEMON_PRO_MONTHLY_TRY_ID` |
| Pro Yearly TRY | ₺6720/yıl | Yearly | TRY | `LEMON_PRO_YEARLY_TRY_ID` |

> Her varyantın ID'si URL'de görünür: `app.lemonsqueezy.com/products/.../variants/VARIANT-ID`

### 3.3 Team Ürününü Oluştur
**Products → Add product → "MeetMind Team"**

4 varyant:
| Variant Adı | Fiyat | ENV |
|---|---|---|
| Team Monthly USD | $9/kullanıcı/ay | `LEMON_TEAM_MONTHLY_USD_ID` |
| Team Yearly USD | $86/kullanıcı/yıl | `LEMON_TEAM_YEARLY_USD_ID` |
| Team Monthly TRY | ₺265/kullanıcı/ay | `LEMON_TEAM_MONTHLY_TRY_ID` |
| Team Yearly TRY | ₺2544/kullanıcı/yıl | `LEMON_TEAM_YEARLY_TRY_ID` |

---

## 4. OpenAI API Key Al

1. https://platform.openai.com → API Keys → Create new secret key
2. Kaydet: `OPENAI_API_KEY = sk-...`
3. Billing sayfasında kredi yükle (Whisper + GPT-4o kullanımı ücretli)

> Whisper-1: ~$0.006/dakika
> GPT-4o: ~$2.50/1M input token, $10/1M output token

---

## 5. Vercel Deploy

### 5.1 GitHub'a Push Et
```bash
cd /Volumes/ProjectVault/MeetMind
git add .
git commit -m "initial: full MeetMind implementation"
git remote add origin https://github.com/KULLANICI_ADIN/meetmind.git
git push -u origin main
```

### 5.2 Vercel'e Bağla
1. https://vercel.com → **Add New Project** → GitHub repoyu seç
2. **Root Directory**: bırak boş (vercel.json root'ta)
3. **Framework Preset**: Next.js (otomatik algılanır)
4. **Build & Output Settings**: vercel.json'dan otomatik gelir — değiştirme

### 5.3 Environment Variables Ekle
Vercel Dashboard → Project Settings → **Environment Variables**

Her birini ekle (aşağıdaki isimlerin **tam olarak** bu şekilde girilmesi gerekiyor — vercel.json `@reference` formatıyla eşleşmeli):

| Variable Name | Örnek Değer | Ortam |
|---|---|---|
| `next_public_supabase_url` | `https://xxx.supabase.co` | Production, Preview |
| `next_public_supabase_anon_key` | `eyJ...` | Production, Preview |
| `next_public_url` | `https://meetmind.io` | Production |
| `supabase_service_key` | `eyJ...` | Production |
| `lemon_api_key` | `eyJ...` | Production |
| `lemon_store_id` | `12345` | Production |
| `lemon_webhook_secret` | `abcdef...` | Production |
| `lemon_pro_monthly_usd_id` | `111111` | Production |
| `lemon_pro_yearly_usd_id` | `111112` | Production |
| `lemon_pro_monthly_try_id` | `111113` | Production |
| `lemon_pro_yearly_try_id` | `111114` | Production |
| `lemon_team_monthly_usd_id` | `222221` | Production |
| `lemon_team_yearly_usd_id` | `222222` | Production |
| `lemon_team_monthly_try_id` | `222223` | Production |
| `lemon_team_yearly_try_id` | `222224` | Production |
| `worker_api_secret` | `gizli-anahtar-uret` | Production |
| `worker_internal_url` | `https://worker.meetmind.io` | Production |
| `resend_api_key` | `re_...` | Production |
| `resend_from_email` | `noreply@meetmind.io` | Production |
| `resend_from_name` | `MeetMind` | Production |

> **Önemli:** Vercel Dashboard'daki variable isimlerinin küçük harfli olması gerekiyor (vercel.json `@next_public_supabase_url` → variable adı `next_public_supabase_url`).

### 5.4 Custom Domain Ekle
Vercel Dashboard → Project → **Domains** → `meetmind.io` ekle
DNS kayıtlarını domain sağlayıcında güncelle.

### 5.5 İlk Deploy
```bash
# Vercel CLI ile (opsiyonel):
npx vercel --prod

# Veya Vercel Dashboard'da "Deploy" butonuna bas
```

### 5.6 Supabase Auth Callback URL'ini Güncelle
Supabase Dashboard → **Authentication → URL Configuration**:
- Site URL: `https://meetmind.io`
- Redirect URLs: `https://meetmind.io/api/auth/callback`

---

## 6. Ubuntu Worker Sunucusu Kur

### 6.1 Sunucu Gereksinimleri
- Ubuntu 22.04 LTS
- En az 2 CPU, 4 GB RAM (Whisper + FFmpeg için)
- En az 20 GB disk

### 6.2 İlk Kurulum
```bash
# Projeyi klonla
git clone https://github.com/KULLANICI_ADIN/meetmind.git
cd meetmind

# .env dosyasını oluştur
cp .env.example .env
nano .env  # değerleri doldur

# Kurulum scriptini çalıştır
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 6.3 .env Değerleri (Sunucuda)
```bash
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...

# OpenAI
OPENAI_API_KEY=sk-...

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@meetmind.io
RESEND_FROM_NAME=MeetMind

# Redis
REDIS_PASSWORD=guclu-bir-sifre-yaz
REDIS_URL=redis://:REDIS_PASSWORD@redis:6379

# Worker
WORKER_CONCURRENCY=3
WORKER_API_SECRET=vercel-ile-ayni-secret-gir

# Domain
NEXT_PUBLIC_URL=https://meetmind.io
DOMAIN=meetmind.io (veya worker.meetmind.io)
ADMIN_EMAIL=admin@meetmind.io

# Bull Board
BULL_BOARD_USERNAME=admin
BULL_BOARD_PASSWORD=guclu-bir-sifre
```

### 6.4 Cloudflare Tunnel Kur (statik IP yoksa)
```bash
# Cloudflare Zero Trust → Tunnels → Create tunnel: "meetmind"
# Token'ı kopyala
echo "CLOUDFLARE_TUNNEL_TOKEN=eyJ..." >> .env

# docker/cloudflare/config.yml içindeki TUNNEL_ID'yi güncelle
nano docker/cloudflare/config.yml
```
Tunnel'da şu route'u tanımla:
- `worker.meetmind.io` → `http://worker:3002`

### 6.5 SSL Sertifikası (Nginx varsa)
```bash
docker compose -f docker/docker-compose.yml up certbot
```

### 6.6 Servisleri Başlat
```bash
docker compose -f docker/docker-compose.yml up -d
docker compose -f docker/docker-compose.yml logs -f worker
```

### 6.7 Worker Sağlığını Kontrol Et
```bash
curl http://localhost:3002/health
# Dönen: {"status":"ok","queues":["transcription","summary","email"]}
```

---

## 7. Doğrulama Checklist

### Supabase
- [ ] Migration'lar başarıyla push edildi
- [ ] `meetings`, `profiles`, `subscriptions` tabloları Supabase Dashboard'da görünüyor
- [ ] Kayıt ol → e-posta doğrulama maili geliyor
- [ ] Google ile giriş çalışıyor
- [ ] Storage `meetings` bucket var

### Vercel
- [ ] https://meetmind.io ana sayfası açılıyor (dark Obsidian tasarımı)
- [ ] https://meetmind.io/tr/login sayfası açılıyor
- [ ] Kayıt ol → dashboard'a yönlendiriyor
- [ ] https://meetmind.io/tr/pricing fiyatlandırma tablosu görünüyor

### Worker
- [ ] `docker compose ps` → worker, redis, cloudflared `Up` statüsünde
- [ ] `curl https://worker.meetmind.io/health` → `{"status":"ok",...}`
- [ ] Vercel'den worker'a test isteği: Meetings sayfasında yeni toplantı yükle

### Uçtan Uca Test
- [ ] MP3 dosyası yükle → status "Sıraya Alındı" görünüyor
- [ ] 30-60 saniye sonra status "Tamamlandı" oluyor
- [ ] Transkript ve AI özeti sayfada görünüyor
- [ ] "Takip E-postası Gönder" butonu çalışıyor
- [ ] Lemon Squeezy checkout linki açılıyor

---

## 8. Periyodik Bakım

- **Her 3 ayda**: Lemon Squeezy TRY fiyatlarını kur değişimine göre güncelle
- **Her ay**: Supabase usage dashboard'u kontrol et (free tier limitleri)
- **Her commit**: `git push` → Vercel otomatik deploy
- **Worker güncellemesi**: `./scripts/deploy-worker.sh` çalıştır

---

*Bu dosya sadece manuel adımları içerir — kod değişiklikleri Claude Code ile yapılır.*

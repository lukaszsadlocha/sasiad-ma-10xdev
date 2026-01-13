# Przewodnik Deployment - Sąsiad-Ma

Przewodnik wdrożenia aplikacji Sąsiad-Ma na Azure App Service (backend) i Vercel (frontend).

---

## 📋 Spis treści

1. [Wymagania wstępne](#wymagania-wstępne)
2. [Konfiguracja Supabase](#konfiguracja-supabase)
3. [Konfiguracja SendGrid](#konfiguracja-sendgrid)
4. [Deployment Backendu na Azure](#deployment-backendu-na-azure)
5. [Deployment Frontendu na Vercel](#deployment-frontendu-na-vercel)
6. [Konfiguracja GitHub Actions](#konfiguracja-github-actions)
7. [Weryfikacja Deployment](#weryfikacja-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Wymagania wstępne

Przed rozpoczęciem upewnij się, że posiadasz:

- [x] Konto GitHub (repozytorium `sasiad-ma-10xdev`)
- [x] Konto Azure (Free Tier wystarczy)
- [x] Konto Vercel
- [x] Konto Supabase (Free Tier)
- [x] Konto SendGrid (Free Tier)
- [x] Zainstalowany Git
- [x] Zainstalowany .NET 8 SDK (opcjonalnie, do testów lokalnych)
- [x] Zainstalowany Node.js 20+ (opcjonalnie, do testów lokalnych)

---

## Konfiguracja Supabase

### 1. Utworzenie projektu

1. Zaloguj się na [supabase.com](https://supabase.com/)
2. Kliknij **New Project**
3. Wypełnij:
   - **Name**: `sasiad-ma-production`
   - **Database Password**: Wygeneruj silne hasło (zapisz je!)
   - **Region**: Wybierz najbliższy (np. `eu-central-1`)
4. Kliknij **Create new project**

### 2. Skopiowanie kluczy

Po utworzeniu projektu, przejdź do **Project Settings → API**:

- `SUPABASE_URL`: `https://[projekt-id].supabase.co`
- `SUPABASE_ANON_KEY`: `eyJhbGc...` (Anon public)
- `SUPABASE_SERVICE_KEY`: `eyJhbGc...` (Service role secret)

**UWAGA:** Service Key jest tajny! Nie commituj go do repozytorium.

### 3. Connection String

Przejdź do **Project Settings → Database → Connection String**:

- Skopiuj **URI** (format: `postgresql://postgres:[password]@...`)
- Zamień `[password]` na hasło ustawione przy tworzeniu projektu

Przykład:
```
postgresql://postgres.abcdefghijklmnopqrstu:MySecurePassword123@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

### 4. Utworzenie buckets dla zdjęć

Przejdź do **Storage → Create bucket**:

1. **Bucket name**: `items-photos`
   - **Public**: ✅ Tak
   - Kliknij **Create bucket**

2. **Bucket name**: `avatars`
   - **Public**: ✅ Tak
   - Kliknij **Create bucket**

### 5. Konfiguracja Row Level Security (RLS)

Dla bezpieczeństwa, ustaw polityki RLS:

1. Przejdź do **Storage → Policies**
2. Dla `items-photos`:
   - **SELECT**: Public (anyone can view)
   - **INSERT**: Authenticated users only
   - **UPDATE/DELETE**: Owner only

3. Dla `avatars`:
   - **SELECT**: Public (anyone can view)
   - **INSERT**: Authenticated users only
   - **UPDATE/DELETE**: Owner only

---

## Konfiguracja SendGrid

### 1. Utworzenie konta

1. Zaloguj się na [sendgrid.com](https://sendgrid.com/)
2. Kliknij **Sign Up** (Free Plan: 100 emails/day)

### 2. Utworzenie API Key

1. Przejdź do **Settings → API Keys**
2. Kliknij **Create API Key**
3. **Name**: `Sasiad-Ma Production`
4. **Permissions**: **Full Access**
5. Kliknij **Create & View**
6. **Skopiuj klucz** (pokazuje się tylko raz!)

Format: `SG.abcdefghijklmnopqrstuvwxyz...`

### 3. Weryfikacja Sender Identity

1. Przejdź do **Settings → Sender Authentication**
2. Kliknij **Verify a Single Sender**
3. Wypełnij:
   - **From Name**: `Sąsiad-Ma`
   - **From Email Address**: `noreply@twoja-domena.pl` (lub Gmail do testów)
   - **Reply To**: Twój email
   - **Address/City/State/Zip**: Wypełnij dane
4. Kliknij **Create**
5. **Potwierdź email** (sprawdź skrzynkę pocztową)

**UWAGA:** Bez weryfikacji nie możesz wysyłać emaili!

---

## Deployment Backendu na Azure

### Opcja A: Azure App Service (Free Tier F1)

#### 1. Utworzenie App Service

1. Zaloguj się do [portal.azure.com](https://portal.azure.com/)
2. Kliknij **Create a resource → Web App**
3. Wypełnij:
   - **Subscription**: Twoja subskrypcja
   - **Resource Group**: Utwórz nową: `rg-sasiad-ma`
   - **Name**: `sasiad-ma-api` (unikalna nazwa globalnie)
   - **Publish**: **Docker Container**
   - **Operating System**: **Linux**
   - **Region**: `West Europe`
   - **Pricing Plan**: **Free F1** (60 CPU minutes/day)
4. Kliknij **Next: Docker**
5. Wypełnij:
   - **Options**: **Single Container**
   - **Image Source**: **GitHub Container Registry** (ghcr.io)
   - **Image and tag**: `ghcr.io/twoj-user/sasiad-ma-10xdev/sasiad-ma-api:latest`
6. Kliknij **Review + Create → Create**

#### 2. Konfiguracja Environment Variables

Po utworzeniu App Service:

1. Przejdź do **Configuration → Application settings**
2. Kliknij **New application setting** i dodaj:

| Name | Value |
|------|-------|
| `ConnectionStrings__DefaultConnection` | `[Supabase PostgreSQL Connection String]` |
| `Jwt__Secret` | `[Wygeneruj silny klucz, min. 32 znaków]` |
| `Jwt__Issuer` | `sasiad-ma-api` |
| `Jwt__Audience` | `sasiad-ma-client` |
| `Jwt__AccessTokenExpirationMinutes` | `60` |
| `Jwt__RefreshTokenExpirationMinutes` | `43200` |
| `Supabase__Url` | `[SUPABASE_URL]` |
| `Supabase__AnonKey` | `[SUPABASE_ANON_KEY]` |
| `Supabase__ServiceKey` | `[SUPABASE_SERVICE_KEY]` |
| `SendGrid__ApiKey` | `[SENDGRID_API_KEY]` |
| `SendGrid__FromEmail` | `noreply@twoja-domena.pl` |
| `SendGrid__FromName` | `Sąsiad-Ma` |
| `FrontendUrl` | `https://sasiad-ma.vercel.app` |

3. Kliknij **Save**

**Generowanie JWT Secret:**
```bash
openssl rand -base64 32
```

Lub w PowerShell:
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

#### 3. Pobranie Publish Profile

1. W Azure Portal, przejdź do App Service
2. Kliknij **Get publish profile**
3. Zapisz plik `.PublishSettings`
4. Skopiuj **całą zawartość XML**

---

## Deployment Frontendu na Vercel

### 1. Importowanie projektu

1. Zaloguj się na [vercel.com](https://vercel.com/)
2. Kliknij **Add New → Project**
3. Wybierz repozytorium **GitHub: `sasiad-ma-10xdev`**
4. Wypełnij:
   - **Framework Preset**: **Vite**
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Kliknij **Deploy** (wstrzymaj deployment, najpierw dodaj env vars)

### 2. Konfiguracja Environment Variables

1. Przejdź do **Settings → Environment Variables**
2. Dodaj:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_API_BASE_URL` | `https://sasiad-ma-api.azurewebsites.net/api` | Production |
| `VITE_SUPABASE_URL` | `[SUPABASE_URL]` | Production |
| `VITE_SUPABASE_ANON_KEY` | `[SUPABASE_ANON_KEY]` | Production |

3. Kliknij **Save**
4. Kliknij **Redeploy**

### 3. Pobranie tokenów do GitHub Actions

1. Przejdź do **Settings → Tokens**
2. Skopiuj:
   - **Vercel Token**: Utwórz nowy token
   - Przejdź do **Account Settings → Tokens → Create**
   - Zapisz token (pokazuje się tylko raz!)

3. Znajdź **Project ID** i **Org ID**:
   - Przejdź do **Settings → General**
   - **Project ID**: `prj_abcdefghijklmnopqrstu`
   - **Org ID**: Zobacz w URL lub w settings

---

## Konfiguracja GitHub Actions

### 1. Dodanie GitHub Secrets

1. Przejdź do repozytorium GitHub
2. **Settings → Secrets and variables → Actions**
3. Kliknij **New repository secret** i dodaj:

#### Backend Secrets:
- `AZURE_WEBAPP_PUBLISH_PROFILE`: Zawartość pliku `.PublishSettings` z Azure

#### Frontend Secrets:
- `VERCEL_TOKEN`: Token z Vercel
- `VERCEL_ORG_ID`: Org ID z Vercel
- `VERCEL_PROJECT_ID`: Project ID z Vercel
- `VITE_API_BASE_URL`: `https://sasiad-ma-api.azurewebsites.net/api`
- `VITE_SUPABASE_URL`: URL Supabase
- `VITE_SUPABASE_ANON_KEY`: Anon Key Supabase

### 2. Aktywacja Deployment w workflows

Edytuj pliki:

**`.github/workflows/backend-ci-cd.yml`:**
```yaml
- name: Deploy to Azure App Service
  if: true  # Zmień z false na true
```

**`.github/workflows/frontend-ci-cd.yml`:**
```yaml
- name: Deploy to Vercel
  if: true  # Zmień z false na true
```

### 3. Pierwszy Deployment

1. Commit zmian:
```bash
git add .github/workflows/
git commit -m "Enable automatic deployment"
git push origin main
```

2. Sprawdź **Actions** w GitHub - powinny uruchomić się automatycznie

---

## Weryfikacja Deployment

### Backend (Azure)

1. Sprawdź health endpoint:
```bash
curl https://sasiad-ma-api.azurewebsites.net/api/health
```

Oczekiwana odpowiedź:
```json
{
  "status": "healthy",
  "message": "Sąsiad-Ma API is running! 🚀",
  "timestamp": "2026-01-11T...",
  "environment": "Production"
}
```

2. Sprawdź logi w Azure Portal:
   - **Monitoring → Log stream**

### Frontend (Vercel)

1. Otwórz: `https://sasiad-ma.vercel.app`
2. Sprawdź czy strona się ładuje
3. Spróbuj się zarejestrować i zalogować

### Full Flow Test

1. Zarejestruj konto
2. Utwórz społeczność
3. Wygeneruj link zaproszeniowy
4. Dodaj przedmiot
5. Sprawdź powiadomienia email

---

## Troubleshooting

### Backend nie startuje na Azure

**Problem:** `Application Error` lub `502 Bad Gateway`

**Rozwiązanie:**
1. Sprawdź logi: **Azure Portal → Log stream**
2. Zweryfikuj Environment Variables (szczególnie Connection String)
3. Sprawdź czy port 80/443 są exposed w Dockerfile
4. Sprawdź czy obraz Docker jest poprawnie zbudowany (GitHub Packages)

### Frontend - błędy CORS

**Problem:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Rozwiązanie:**
1. W Azure App Service, dodaj Frontend URL do listy allowed origins
2. Sprawdź `CORS` w `backend/SasiadMa.Api/Program.cs`
3. Upewnij się, że `FrontendUrl` w Azure App Service jest poprawny

### SendGrid - nie wysyła emaili

**Problem:** Emaile nie docierają

**Rozwiązanie:**
1. Sprawdź czy Sender Identity jest zweryfikowany (email confirmation)
2. Sprawdź logi SendGrid: **Activity Feed**
3. Sprawdź API Key (czy nie wygasł)
4. Sprawdź limity Free Tier (100 emails/day)

### Supabase - błędy połączenia

**Problem:** `Connection refused` lub `Authentication failed`

**Rozwiązanie:**
1. Sprawdź Connection String (czy zawiera poprawne hasło)
2. Sprawdź czy projekt Supabase jest aktywny
3. Upewnij się, że używasz **Pooler** connection string (port 5432)
4. Sprawdź IPv4/IPv6 - Azure może wymagać IPv4

### GitHub Actions - build failed

**Problem:** Pipeline nie działa

**Rozwiązanie:**
1. Sprawdź logi w **Actions** tab
2. Sprawdź czy wszystkie secrets są dodane
3. Dla backendu: upewnij się że Docker build działa lokalnie
4. Dla frontendu: sprawdź czy `npm run build` działa lokalnie

---

## Koszty (Free Tier)

| Usługa | Plan | Limit | Koszt |
|--------|------|-------|-------|
| Azure App Service | F1 Free | 60 CPU min/day, 1GB RAM | **0 zł** |
| GitHub Container Registry | Free | Unlimited private repos | **0 zł** |
| Vercel | Hobby | Unlimited bandwidth | **0 zł** |
| Supabase | Free | 500MB DB, 1GB storage | **0 zł** |
| SendGrid | Free | 100 emails/day | **0 zł** |
| GitHub Actions | Free | 2000 min/month | **0 zł** |
| **TOTAL** | | | **0 zł/miesiąc** 🎉 |

---

## Aktualizacja Aplikacji

Po wprowadzeniu zmian w kodzie:

1. Commit i push do `main`:
```bash
git add .
git commit -m "feat: new feature"
git push origin main
```

2. GitHub Actions automatycznie:
   - Uruchomi testy
   - Zbuduje Docker image (backend)
   - Wdroży na Azure (backend)
   - Zbuduje i wdroży na Vercel (frontend)

3. Sprawdź status w **GitHub Actions**

---

## Kontakt i Wsparcie

W przypadku problemów:

1. Sprawdź **[GitHub Issues](https://github.com/twoj-user/sasiad-ma-10xdev/issues)**
2. Sprawdź dokumentację:
   - [Azure App Service](https://learn.microsoft.com/en-us/azure/app-service/)
   - [Vercel](https://vercel.com/docs)
   - [Supabase](https://supabase.com/docs)
   - [SendGrid](https://docs.sendgrid.com/)

---

**Wersja:** 1.0
**Data:** 2026-01-11
**Status:** ✅ Gotowy do użycia

# TODO - Sąsiad-Ma

Lista rzeczy do zrobienia manualnie, aby aplikacja była w pełni skonfigurowana i gotowa do deploymentu produkcyjnego.

---

## ✅ JUŻ SKONFIGUROWANE

- [x] Supabase - klucze i connection string w plikach config
- [x] SendGrid - API key skonfigurowany
- [x] JWT Secret - wygenerowany
- [x] Frontend `.env` - wypełniony
- [x] Backend `appsettings.Development.json` - wypełniony
- [x] GitHub workflows CI/CD - utworzone
- [x] Docker configuration - gotowy
- [x] E2E testy - zaimplementowane (38 testów)
- [x] Dokumentacja - kompletna

---

## 🔧 LOKALNE ŚRODOWISKO - DO ZROBIENIA

### 1. ⚠️ Migracja bazy danych (KRYTYCZNE)

**Status:** ❌ TODO
**Priorytet:** WYSOKI

```bash
cd backend/SasiadMa.Api
dotnet ef migrations add AddEmailNotificationsEnabled
dotnet ef database update
```

**Dlaczego:**
Dodaje pole `EmailNotificationsEnabled` do tabeli Users (wymóg z Fazy 6).

**Źródło:** README.md linia 176-182

---

### 2. ⚠️ Supabase Storage - utworzenie buckets

**Status:** ❌ TODO
**Priorytet:** WYSOKI

**Kroki:**
1. Zaloguj się na [supabase.com](https://supabase.com/)
2. Otwórz projekt: `sasiad-ma-dev`
3. Przejdź do **Storage** → **Create bucket**
4. Utwórz pierwszy bucket:
   - **Name:** `items-photos`
   - **Public bucket:** ✅ TAK
   - Kliknij **Create bucket**
5. Utwórz drugi bucket:
   - **Name:** `avatars`
   - **Public bucket:** ✅ TAK
   - Kliknij **Create bucket**

**Dlaczego:**
Aplikacja przesyła zdjęcia przedmiotów i avatary użytkowników do Supabase Storage.

**Źródło:** SETUP_GUIDE.md linia 50-62

---

### 3. Obrazek testowy dla E2E (opcjonalne)

**Status:** ❌ TODO
**Priorytet:** NISKI (tylko jeśli chcesz uruchamiać testy E2E)

**Kroki:**
```bash
# Opcja 1: Pobierz placeholder
curl -o frontend/e2e/fixtures/test-image.jpg https://via.placeholder.com/400.jpg

# Opcja 2: Skopiuj dowolny JPG/PNG i nazwij test-image.jpg
# cp path/to/your/image.jpg frontend/e2e/fixtures/test-image.jpg
```

**Dlaczego:**
Testy E2E (`06-full-flow.spec.ts`) testują upload zdjęć przedmiotów i wymagają testowego obrazka.

**Źródło:** E2E_TESTING.md linia 65-75

---

## 🚀 DEPLOYMENT PRODUKCYJNY (opcjonalne)

### 4. Azure App Service - Backend

**Status:** ❌ TODO
**Priorytet:** ŚREDNI (jeśli chcesz wdrożyć produkcyjnie)

#### Krok 4.1: Utworzenie App Service

1. Zaloguj się do [portal.azure.com](https://portal.azure.com/)
2. Kliknij **Create a resource** → **Web App**
3. Wypełnij formularz:
   - **Subscription:** Twoja subskrypcja Azure
   - **Resource Group:** Utwórz nową: `rg-sasiad-ma`
   - **Name:** `sasiad-ma-api` (nazwa musi być unikalna globalnie)
   - **Publish:** **Docker Container**
   - **Operating System:** **Linux**
   - **Region:** `West Europe` (lub najbliższy)
   - **Pricing Plan:** **Free F1** (60 CPU min/day, 1GB RAM)
4. Przejdź do zakładki **Docker**:
   - **Options:** Single Container
   - **Image Source:** GitHub Container Registry
   - **Image and tag:** `ghcr.io/twoj-github-user/sasiad-ma-10xdev/sasiad-ma-api:latest`
   - (Zamień `twoj-github-user` na swoją nazwę użytkownika GitHub)
5. Kliknij **Review + Create** → **Create**
6. Poczekaj ~2-3 minuty na deployment

#### Krok 4.2: Konfiguracja Environment Variables

1. W Azure Portal, przejdź do utworzonego App Service
2. **Configuration** → **Application settings**
3. Kliknij **New application setting** i dodaj wszystkie poniższe:

| Name | Value | Uwagi |
|------|-------|-------|
| `ConnectionStrings__DefaultConnection` | `Host=aws-1-eu-west-1.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.inxqvhumibbmerkrfurb;Password=9BAbi4xDJz4C2Z0o;SSL Mode=Require;Trust Server Certificate=true` | Z appsettings.Development.json |
| `Jwt__Secret` | **WYGENERUJ NOWY!** | ⚠️ NIE używaj dev secret w produkcji! |
| `Jwt__Issuer` | `sasiad-ma-api` | |
| `Jwt__Audience` | `sasiad-ma-client` | |
| `Jwt__AccessTokenExpirationMinutes` | `60` | |
| `Jwt__RefreshTokenExpirationMinutes` | `43200` | |
| `Supabase__Url` | `https://inxqvhumibbmerkrfurb.supabase.co` | Z appsettings.Development.json |
| `Supabase__AnonKey` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Anon key z Supabase |
| `Supabase__ServiceKey` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Service key z Supabase |
| `SendGrid__ApiKey` | `SG.js7T_dNNTI61seQzeVq4Wg...` | Z appsettings.Development.json |
| `SendGrid__FromEmail` | `lukaszsadlocha@gmail.com` | Email zweryfikowany w SendGrid |
| `SendGrid__FromName` | `Sąsiad-Ma` | |
| `FrontendUrl` | `http://localhost:5173` | ⚠️ Zaktualizuj po deployment Vercel! |

**Generowanie nowego JWT Secret dla produkcji:**
```bash
# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Lub online: https://randomkeygen.com/
```

4. Kliknij **Save**
5. Restart App Service (opcjonalnie)

#### Krok 4.3: Pobranie Publish Profile

1. W Azure Portal, przejdź do App Service
2. Kliknij **Get publish profile** (w górnym menu)
3. Zapisz plik `.PublishSettings`
4. Otwórz plik w edytorze tekstu
5. **Skopiuj całą zawartość XML** (od `<?xml...` do końca)

#### Krok 4.4: Dodanie secret do GitHub

1. Przejdź do repozytorium GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Kliknij **New repository secret**
4. Dodaj:
   - **Name:** `AZURE_WEBAPP_PUBLISH_PROFILE`
   - **Value:** Wklej całą zawartość XML z publish profile
5. Kliknij **Add secret**

#### Krok 4.5: Aktywacja deployment w workflow

1. Edytuj plik `.github/workflows/backend-ci-cd.yml`
2. Znajdź linię 86:
```yaml
- name: Deploy to Azure App Service
  if: false  # Disabled until Azure is configured
```
3. Zmień na:
```yaml
- name: Deploy to Azure App Service
  if: true  # ✅ ENABLED
```
4. Commit i push:
```bash
git add .github/workflows/backend-ci-cd.yml
git commit -m "Enable Azure deployment"
git push origin main
```

**Źródło:** DEPLOYMENT.md linia 133-197

---

### 5. Vercel - Frontend

**Status:** ❌ TODO
**Priorytet:** ŚREDNI (jeśli chcesz wdrożyć produkcyjnie)

#### Krok 5.1: Import projektu do Vercel

1. Zaloguj się na [vercel.com](https://vercel.com/)
2. Kliknij **Add New** → **Project**
3. Wybierz repozytorium: `sasiad-ma-10xdev`
4. Kliknij **Import**
5. Wypełnij konfigurację:
   - **Framework Preset:** **Vite**
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. **NIE klikaj Deploy jeszcze!** (najpierw dodaj environment variables)

#### Krok 5.2: Dodanie Environment Variables

1. Kliknij **Environment Variables** (przed deploymentem)
2. Dodaj 3 zmienne (Environment: **Production**):

| Name | Value | Uwagi |
|------|-------|-------|
| `VITE_API_BASE_URL` | `https://sasiad-ma-api.azurewebsites.net/api` | URL Azure App Service |
| `VITE_SUPABASE_URL` | `https://inxqvhumibbmerkrfurb.supabase.co` | Z .env |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Anon key (public, OK) |

⚠️ **UWAGA:** NIE dodawaj `SUPABASE_SERVICE_KEY` do frontendu! To tajny klucz tylko dla backendu.

3. Kliknij **Deploy**
4. Poczekaj ~1-2 minuty
5. Po deployment skopiuj URL Vercel (np. `https://sasiad-ma.vercel.app`)

#### Krok 5.3: Aktualizacja FrontendUrl w Azure

1. Wróć do Azure Portal → App Service
2. **Configuration** → **Application settings**
3. Znajdź `FrontendUrl`
4. Zmień wartość na URL Vercel: `https://sasiad-ma.vercel.app`
5. Kliknij **Save**
6. Restart App Service

#### Krok 5.4: Pobranie tokenów Vercel

1. W Vercel, przejdź do **Account Settings** (avatar → Settings)
2. Kliknij **Tokens** → **Create**
3. Wypełnij:
   - **Token Name:** `GitHub Actions`
   - **Scope:** Full Account
4. Kliknij **Create**
5. **Skopiuj token** (pokazuje się tylko raz!)

6. Znajdź **Project ID** i **Org ID**:
   - Wróć do projektu w Vercel
   - **Settings** → **General**
   - Skopiuj:
     - **Project ID:** `prj_abc...`
     - **Team ID** (lub **Org ID**): Zobacz w URL lub w settings

#### Krok 5.5: Dodanie secrets do GitHub

1. GitHub → Repository → **Settings** → **Secrets and variables** → **Actions**
2. Kliknij **New repository secret** i dodaj:

| Name | Value | Źródło |
|------|-------|--------|
| `VERCEL_TOKEN` | `abc123...` | Token z kroku 5.4 |
| `VERCEL_ORG_ID` | `team_abc...` | Org ID z Vercel Settings |
| `VERCEL_PROJECT_ID` | `prj_abc...` | Project ID z Vercel Settings |
| `VITE_API_BASE_URL` | `https://sasiad-ma-api.azurewebsites.net/api` | URL Azure |
| `VITE_SUPABASE_URL` | `https://inxqvhumibbmerkrfurb.supabase.co` | Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` | Anon key |

#### Krok 5.6: Aktywacja deployment w workflow

1. Edytuj plik `.github/workflows/frontend-ci-cd.yml`
2. Znajdź linię 61:
```yaml
- name: Deploy to Vercel
  if: false  # Disabled until Vercel is configured
```
3. Zmień na:
```yaml
- name: Deploy to Vercel
  if: true  # ✅ ENABLED
```
4. Commit i push:
```bash
git add .github/workflows/frontend-ci-cd.yml
git commit -m "Enable Vercel deployment"
git push origin main
```

**Źródło:** DEPLOYMENT.md linia 199-276

---

## 📊 Weryfikacja

### Po skonfigurowaniu lokalnym (kroki 1-3)

```bash
# Terminal 1: Backend
cd backend/SasiadMa.Api
dotnet run

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: E2E testy (opcjonalnie)
cd frontend
npm run test:e2e:ui
```

**Sprawdź:**
- [ ] Backend działa: `http://localhost:5000/api/health`
- [ ] Frontend działa: `http://localhost:5173`
- [ ] Możesz się zarejestrować i zalogować
- [ ] Możesz utworzyć społeczność
- [ ] Możesz dodać przedmiot ze zdjęciem (→ Supabase Storage)
- [ ] Otrzymujesz emaile (→ SendGrid)
- [ ] E2E testy przechodzą (jeśli dodałeś test-image.jpg)

### Po deployment produkcyjnym (kroki 4-5)

**Backend (Azure):**
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

**Frontend (Vercel):**
1. Otwórz: `https://sasiad-ma.vercel.app`
2. Sprawdź czy strona się ładuje
3. Zarejestruj testowe konto
4. Utwórz społeczność
5. Dodaj przedmiot

**Full Flow Test:**
- [ ] Rejestracja użytkownika A → Utworzenie społeczności → Generowanie linku
- [ ] Rejestracja użytkownika B przez link → Dodanie przedmiotu
- [ ] Rezerwacja → Akceptacja → Wymiana wiadomości → Przekazanie → Zwrot

---

## 📝 Troubleshooting

### Backend nie startuje na Azure
- Sprawdź logi: Azure Portal → App Service → **Log stream**
- Zweryfikuj Environment Variables (szczególnie Connection String)
- Sprawdź czy obraz Docker jest dostępny w ghcr.io

### Frontend - błędy CORS
- Sprawdź `FrontendUrl` w Azure App Service
- Upewnij się że zawiera prawidłowy URL Vercel

### SendGrid nie wysyła emaili
- Sprawdź czy Sender Identity jest zweryfikowany (email confirmation)
- Sprawdź logi SendGrid: **Activity Feed**
- Sprawdź limity Free Tier (100 emails/day)

### Supabase Storage - błędy upload
- Sprawdź czy buckety są utworzone: `items-photos`, `avatars`
- Sprawdź czy buckety są **Public**
- Sprawdź Row Level Security policies

**Pełny troubleshooting:** Zobacz `DEPLOYMENT.md` linia 327-378

---

## 🎯 Priorytety

### KRYTYCZNE (aby działało lokalnie):
1. ⚠️ Migracja bazy danych
2. ⚠️ Supabase Storage buckets

### OPCJONALNE (deployment produkcyjny):
3. Azure App Service setup
4. Vercel setup
5. GitHub Actions secrets
6. Aktywacja workflows

### NICE TO HAVE:
7. Obrazek testowy E2E
8. Monitoring i alerty
9. Custom domena
10. SSL certificates (auto w Azure/Vercel)

---

## 📚 Źródła dokumentacji

- **SETUP_GUIDE.md** - Konfiguracja lokalna (Faza 0)
- **DEPLOYMENT.md** - Deployment produkcyjny (Azure + Vercel)
- **README.md** - Quick start i overview
- **E2E_TESTING.md** - Testowanie E2E
- **.ai/prd.md** - Product Requirements
- **.ai/tech-stack.md** - Stos technologiczny

---

## 💰 Koszty (Free Tier)

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

**Wersja:** 1.0
**Data:** 2026-01-11
**Status:** ✅ Gotowy do użycia

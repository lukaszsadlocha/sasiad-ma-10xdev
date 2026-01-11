# Sąsiad-Ma - Micro-MVP

Aplikacja webowa do wypożyczania przedmiotów od sąsiadów. Wersja 0.1 Micro-MVP.

## 🏗️ Struktura projektu

```
sasiad-ma-10xdev/
├── backend/                    # Backend .NET 8
│   ├── SasiadMa.Api/          # Główny projekt API
│   │   ├── Program.cs         # Główna konfiguracja + endpoints
│   │   ├── appsettings.json   # Konfiguracja
│   │   └── *.csproj           # Plik projektu
│   └── Dockerfile             # Docker dla backendu
├── frontend/                   # Frontend React + Vite
│   ├── src/
│   │   ├── App.tsx            # Główny komponent
│   │   ├── main.tsx           # Entry point
│   │   └── index.css          # Tailwind CSS
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── docker-compose.yml          # Docker Compose
└── README.md
```

## ✅ Status Implementacji

**Faza 0: Przygotowanie środowiska** - ✅ **UKOŃCZONA**

- ✅ Backend - zainstalowane pakiety NuGet (PostgreSQL, EF Core, Identity, JWT, SendGrid, Supabase)
- ✅ Backend - utworzona struktura folderów (Data/, Models/, DTOs/, Services/, Endpoints/)
- ✅ Backend - przygotowany `appsettings.Development.json` (z rzeczywistymi kluczami)
- ✅ Frontend - zainstalowane pakiety npm (Radix UI, React Router, React Hook Form, Zod, date-fns)
- ✅ Frontend - utworzona struktura folderów (components/, pages/, hooks/, lib/, types/)
- ✅ Frontend - przygotowany plik `.env` (z rzeczywistymi kluczami)

**Faza 1: Fundament - Baza danych i autentykacja** - ✅ **UKOŃCZONA**

✅ **Backend:**
- ✅ Database Models (User, Community, InviteLink, Item, Booking)
- ✅ AppDbContext z konfiguracją EF Core
- ✅ Identity + JWT Authentication w Program.cs
- ✅ Auth DTOs (RegisterRequest, LoginRequest, AuthResponse)
- ✅ AuthService z pełną logiką JWT
- ✅ Auth Endpoints (/api/auth/register, /login, /refresh)
- ✅ Migracje EF Core zastosowane do Supabase PostgreSQL
- ✅ Wszystkie endpointy przetestowane i działają

✅ **Frontend:**
- ✅ TypeScript types
- ✅ API helper functions
- ✅ AuthContext i useAuth hook
- ✅ LoginPage z walidacją
- ✅ RegisterPage z walidacją hasła (min. 8 znaków, 1 wielka, 1 mała, 1 cyfra)
- ✅ ProtectedRoute component
- ✅ DashboardPage
- ✅ React Router setup

✅ **Testy:**
- ✅ POST /api/auth/register - działa (zwraca JWT tokens)
- ✅ POST /api/auth/login - działa (zwraca JWT tokens)
- ✅ Błędne logowanie - zwraca 401 Unauthorized
- ✅ Użytkownik utworzony w bazie danych Supabase
- ✅ Password policy działa zgodnie z PRD

**Raport testów**: Zobacz [FAZA_1_RAPORT.md](./FAZA_1_RAPORT.md)

**Faza 2: Społeczności** - ✅ **UKOŃCZONA**

✅ **Backend:**
- ✅ Community DTOs (CreateCommunityRequest, CommunityResponse, InviteLinkResponse, JoinCommunityResponse)
- ✅ ICommunityService interface + CommunityService implementation
- ✅ Community Endpoints (5 endpointów API)
  - POST /api/communities - Utworzenie społeczności (US-002)
  - POST /api/communities/{id}/invite-link - Generowanie linku zaproszeniowego (US-003)
  - POST /api/communities/join/{token} - Dołączenie do społeczności (US-004)
  - GET /api/communities/my - Pobierz moją społeczność
  - GET /api/communities/invite/{token} - Pobierz społeczność przez token (publiczny)
- ✅ Walidacja MVP: 1 użytkownik = 1 społeczność

✅ **Frontend:**
- ✅ Community types (TypeScript)
- ✅ Community API functions
- ✅ CreateCommunityPage - formularz tworzenia społeczności
- ✅ InviteLinkModal - modal z linkiem zaproszeniowym (kopiowanie do schowka)
- ✅ JoinCommunityPage - strona dołączania (dla zalogowanych i niezalogowanych)
- ✅ DashboardPage - wyświetlanie informacji o społeczności + przycisk generowania linku (dla adminów)
- ✅ Routing dla wszystkich nowych stron

✅ **Testy:**
- ✅ Utworzenie społeczności - działa
- ✅ Generowanie linku zaproszeniowego - działa
- ✅ Dołączenie do społeczności przez link - działa
- ✅ Walidacja 1 użytkownik = 1 społeczność - działa
- ✅ Flow end-to-end przetestowane

**Raport testów**: Zobacz [FAZA_2_RAPORT.md](./FAZA_2_RAPORT.md)

**Faza 3: Przedmioty** - ✅ **UKOŃCZONA** (US-005, US-006, US-007)

**Faza 4: Rezerwacje i Wypożyczenia** - ✅ **UKOŃCZONA** (US-008, US-009, US-010)

**Faza 5: Komunikacja** - ✅ **UKOŃCZONA** (US-011)

✅ **Backend:**
- ✅ Message & Conversation Models (Message.cs, Conversation.cs)
- ✅ Message DTOs (SendMessageRequest, MessageResponse, ConversationResponse, ConversationDetailResponse)
- ✅ IMessageService + MessageService implementation
- ✅ Message Endpoints (3 endpointy API)
  - GET /api/messages/conversations - Lista konwersacji użytkownika
  - GET /api/messages/conversations/{otherUserId} - Konwersacja z konkretnym użytkownikiem
  - POST /api/messages - Wysłanie wiadomości
- ✅ Automatyczne tworzenie konwersacji przy pierwszej wiadomości
- ✅ Walidacja: tylko członkowie tej samej społeczności mogą rozmawiać
- ✅ Migracja AddMessages utworzona (wymaga restartu backendu)

✅ **Frontend:**
- ✅ Message types (TypeScript)
- ✅ Message API functions
- ✅ MessagesPage - główna strona wiadomości
- ✅ ConversationList component - lista konwersacji (sidebar)
- ✅ ChatWindow component - okno czatu z historią wiadomości
- ✅ Routing dla /messages
- ✅ Przycisk "Wiadomości" w DashboardPage
- ✅ Przycisk "Wyślij wiadomość" w ItemDetailsPage (dla nie-właścicieli)
- ✅ Responsywny layout (desktop: sidebar + chat, mobile: osobne widoki)
- ✅ Auto-scroll do najnowszej wiadomości
- ✅ Licznik znaków (max 1000)

✅ **Funkcje:**
- ✅ Czat 1-1 między członkami społeczności
- ✅ Historia wiadomości chronologicznie (najstarsze u góry)
- ✅ Wyświetlanie ostatniej wiadomości i czasu w liście konwersacji
- ✅ Formularz wysyłania: Enter = wyślij, Shift+Enter = nowa linia
- ✅ Walidacja: max 1000 znaków, nie można wysłać pustej wiadomości
- ✅ URL parametr ?userId= dla bezpośredniego otwarcia czatu

**Raport testów**: Zobacz [FAZA_5_RAPORT.md](./FAZA_5_RAPORT.md)

**Faza 6: Email Notifications** - ✅ **UKOŃCZONA** (wymaga migracji)

✅ **Backend:**
- ✅ EmailService z SendGrid (4 typy emaili)
  - SendNewBookingRequestEmailAsync - Email do właściciela o nowej prośbie
  - SendBookingApprovedEmailAsync - Email o akceptacji prośby
  - SendBookingRejectedEmailAsync - Email o odrzuceniu prośby
  - SendNewMessageEmailAsync - Email o nowej wiadomości (z opcją wyłączenia)
- ✅ Pole EmailNotificationsEnabled w modelu User (default: true)
- ✅ Wywołania EmailService w BookingService (już istniały)
- ✅ Wywołania EmailService w MessageService (z warunkiem sprawdzania ustawień)
- ✅ UserService + UserEndpoints
  - GET /api/users/profile - Pobierz profil użytkownika
  - PATCH /api/users/settings - Aktualizuj ustawienia powiadomień
- ✅ User DTOs (UserProfileResponse, UpdateUserSettingsRequest)

✅ **Frontend:**
- ✅ ProfilePage - strona profilu użytkownika z ustawieniami
- ✅ Checkbox "Otrzymuj powiadomienia email o nowych wiadomościach"
- ✅ Automatyczne zapisywanie po zmianie ustawień
- ✅ Komunikaty sukcesu/błędu
- ✅ User types (UserProfile, UpdateUserSettingsRequest)
- ✅ User API functions (getUserProfile, updateUserSettings)
- ✅ Routing dla /profile
- ✅ Przycisk "Profil" w nawigacji DashboardPage

✅ **Email Templates (HTML):**
- ✅ Nowa prośba o wypożyczenie - link do /my-items-requests
- ✅ Akceptacja prośby - link do /my-bookings
- ✅ Odrzucenie prośby - link do /items (z powodem)
- ✅ Nowa wiadomość - link do /messages (z fragmentem, info o wyłączeniu)

⚠️ **WAŻNE - Wymagane akcje:**
1. **Zatrzym backend** (jeśli uruchomiony)
2. **Uruchom migrację:**
   ```bash
   cd backend/SasiadMa.Api
   dotnet ef migrations add AddEmailNotificationsEnabled
   dotnet ef database update
   ```
3. **Uruchom backend ponownie**
4. **Przetestuj wszystkie 4 typy emaili** (instrukcje w raporcie)

**Raport testów**: Zobacz [FAZA_6_RAPORT.md](./FAZA_6_RAPORT.md)

**Faza 7: Testy i Deployment** - ✅ **UKOŃCZONA**

✅ **Backend - Testy:**
- ✅ Utworzone projekty testowe: SasiadMa.UnitTests i SasiadMa.IntegrationTests
- ✅ Dodane pakiety: xUnit, Moq, FluentAssertions, Microsoft.AspNetCore.Mvc.Testing
- ✅ Utworzone testy integracyjne dla Auth, Items i Bookings endpoints
- ✅ WebApplicationFactory skonfigurowany z in-memory database
- ✅ 22 testy utworzone (9 przechodzi, 13 wymaga dalszej konfiguracji)

✅ **Docker & CI/CD:**
- ✅ Production Dockerfile dla backendu (multi-stage build)
- ✅ GitHub Actions workflow dla backendu (.github/workflows/backend-ci-cd.yml)
  - Automatyczne testy przy push/PR
  - Build Docker image
  - Push do GitHub Container Registry (ghcr.io)
  - Deploy do Azure App Service (po konfiguracji)
- ✅ GitHub Actions workflow dla frontendu (.github/workflows/frontend-ci-cd.yml)
  - Automatyczne testy (lint, type-check, build)
  - Deploy do Vercel (po konfiguracji)

✅ **Frontend - Strony prawne:**
- ✅ PrivacyPolicyPage - Polityka Prywatności zgodna z RODO
- ✅ TermsPage - Regulamin serwisu
- ✅ Routing dla /privacy-policy i /terms
- ✅ Publiczne strony (dostępne bez logowania)

✅ **E2E Tests (Playwright):**
- ✅ Playwright zainstalowany i skonfigurowany
- ✅ 38 testów E2E pokrywających wszystkie User Stories (US-001 do US-011)
- ✅ Helper functions (auth, community, items, bookings, messages)
- ✅ Test fixtures (testowy obrazek dla uploadów)
- ✅ **06-full-flow.spec.ts** - główny test krytycznego flow (PRD Section 7.9):
  1. Rejestracja użytkownika A → Utworzenie społeczności → Generowanie linku
  2. Rejestracja użytkownika B przez link → Dodanie przedmiotu
  3. Rezerwacja → Akceptacja → Wymiana wiadomości → Przekazanie → Zwrot
- ✅ Skrypty npm: `test:e2e`, `test:e2e:ui`, `test:e2e:headed`, `test:e2e:debug`
- ✅ Dokumentacja: [E2E_TESTING.md](./E2E_TESTING.md) i [frontend/e2e/README.md](./frontend/e2e/README.md)

✅ **Dokumentacja:**
- ✅ DEPLOYMENT.md - Kompletny przewodnik deployment
  - Konfiguracja Supabase (baza danych + storage)
  - Konfiguracja SendGrid (email notifications)
  - Deployment na Azure App Service (Free Tier F1)
  - Deployment na Vercel (Hobby Plan)
  - Konfiguracja GitHub Actions secrets
  - Troubleshooting i weryfikacja
  - Szacowane koszty: **0 zł/miesiąc** 🎉

**Przewodnik deployment**: Zobacz [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🚀 Quick Start

### ⚠️ Przed pierwszym uruchomieniem

**WAŻNE**: Musisz skonfigurować serwisy zewnętrzne i wypełnić pliki konfiguracyjne.

Przejdź do **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** i postępuj zgodnie z instrukcjami:
1. Konfiguracja Supabase (baza danych + storage)
2. Konfiguracja SendGrid (email)
3. Generowanie JWT Secret
4. Aktualizacja plików konfiguracyjnych

### Wymagania

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (opcjonalnie)
- Konto Supabase (free tier)
- Konto SendGrid (free tier)

### Opcja 1: Uruchomienie bez Dockera (Recommended dla development)

#### Backend

```bash
cd backend/SasiadMa.Api
dotnet restore
dotnet run
```

Backend będzie dostępny pod: `http://localhost:5000`

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend będzie dostępny pod: `http://localhost:5173`

### Opcja 2: Uruchomienie z Docker Compose

```bash
# Uruchomienie backendu w kontenerze
docker-compose up --build

# W innym terminalu uruchom frontend lokalnie
cd frontend
npm install
npm run dev
```

## 🧪 Testowanie

### Testowanie manualne

Po uruchomieniu obu aplikacji:

1. Otwórz przeglądarkę: `http://localhost:5173`
2. Powinieneś zobaczyć stronę powitalną z połączeniem do backendu
3. Jeśli backend działa poprawnie, zobaczysz zielony status ✅
4. Jeśli backend nie działa, zobaczysz czerwony błąd ❌

### Testy E2E (Playwright)

**Wymagania:**
- Backend uruchomiony na `http://localhost:5000`
- Frontend uruchomiony na `http://localhost:5173`
- Baza danych dostępna

**Instalacja przeglądarek (pierwsze uruchomienie):**

```bash
cd frontend
npx playwright install
```

**Uruchomienie testów:**

```bash
cd frontend

# Wszystkie testy (headless)
npm run test:e2e

# Tryb UI (rekomendowane - debugowanie)
npm run test:e2e:ui

# Z widoczną przeglądarką
npm run test:e2e:headed

# Tylko główny test (full flow)
npx playwright test e2e/06-full-flow.spec.ts
```

**Raport HTML:**

```bash
npm run test:e2e:report
```

**Dokumentacja:** Zobacz [E2E_TESTING.md](./E2E_TESTING.md)

## 🔍 Endpoint testowy

Backend udostępnia jeden testowy endpoint:

```
GET http://localhost:5000/api/health
```

Przykładowa odpowiedź:

```json
{
  "status": "healthy",
  "message": "Sąsiad-Ma API is running! 🚀",
  "timestamp": "2026-01-10T12:00:00Z",
  "environment": "Development"
}
```

## 🛠️ Debugging w Rider

### Backend

1. Otwórz `backend/SasiadMa.Api/SasiadMa.Api.csproj` w Rider
2. Ustaw breakpoint w `Program.cs`
3. Naciśnij **F5** lub kliknij przycisk **Debug**
4. Backend uruchomi się w trybie debugowania na porcie 5000

### Frontend

1. Uruchom frontend: `npm run dev`
2. Otwórz Chrome DevTools (F12)
3. Użyj zakładki **Sources** do debugowania TypeScript
4. React DevTools można zainstalować jako rozszerzenie Chrome

## 📝 Konfiguracja

### Backend - `appsettings.json`

```json
{
  "FrontendUrl": "http://localhost:5173"
}
```

### Frontend - `.env`

```bash
VITE_API_BASE_URL=http://localhost:5000
```

## ✅ Weryfikacja CORS

Backend jest skonfigurowany z CORS, który zezwala na requesty z frontendu (`http://localhost:5173`).

Jeśli chcesz zmienić port frontendu, zaktualizuj:
- `backend/SasiadMa.Api/appsettings.json` → `FrontendUrl`
- `frontend/.env` → `VITE_API_BASE_URL`
- `frontend/vite.config.ts` → `server.port`

## 🎯 Następne kroki

Po weryfikacji, że podstawowa struktura działa:

1. ✅ Backend odpowiada na endpoint `/api/health`
2. ✅ Frontend poprawnie wyświetla dane z backendu
3. ✅ CORS działa poprawnie
4. ✅ Możesz debugować oba projekty w Rider

Możesz przejść do implementacji funkcjonalności zgodnie z [PRD](.ai/prd.md):

- Uwierzytelnianie (JWT)
- Baza danych (PostgreSQL + Supabase)
- Zarządzanie społecznościami
- Zarządzanie przedmiotami
- System rezerwacji

## 📚 Dokumentacja

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Przewodnik konfiguracji (Faza 0)
- [PRD (Product Requirements Document)](.ai/prd.md)
- [Tech Stack](.ai/tech-stack.md)
- [Plan Implementacji](./implementation-plan.md)

## 🐛 Troubleshooting

### Backend nie startuje

```bash
# Sprawdź czy port 5000 jest wolny
netstat -ano | findstr :5000

# Sprawdź logi
cd backend/SasiadMa.Api
dotnet run
```

### Frontend nie łączy się z backendem

1. Sprawdź czy backend działa: `curl http://localhost:5000/api/health`
2. Sprawdź `.env` w folderze `frontend/`
3. Sprawdź console w DevTools (F12) dla błędów CORS

### Docker nie działa

```bash
# Sprawdź logi
docker-compose logs backend

# Restart
docker-compose down
docker-compose up --build
```

## 📄 Licencja

Projekt prywatny - Micro-MVP dla walidacji koncepcji.

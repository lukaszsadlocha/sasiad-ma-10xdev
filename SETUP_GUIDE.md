# Przewodnik Konfiguracji - Faza 0

Ten dokument zawiera instrukcje konfiguracji serwisów zewnętrznych dla projektu Sąsiad-Ma.

## Spis treści

1. [Konfiguracja Supabase](#konfiguracja-supabase)
2. [Konfiguracja SendGrid](#konfiguracja-sendgrid)
3. [Generowanie JWT Secret](#generowanie-jwt-secret)
4. [Aktualizacja plików konfiguracyjnych](#aktualizacja-plików-konfiguracyjnych)

---

## Konfiguracja Supabase

Supabase będzie używany jako:
- Hosting bazy danych PostgreSQL
- Storage dla zdjęć przedmiotów i avatarów

### Krok 1: Utworzenie konta i projektu

1. Przejdź na stronę [https://supabase.com](https://supabase.com)
2. Zarejestruj się lub zaloguj (możesz użyć konta GitHub)
3. Kliknij "New Project"
4. Wypełnij dane projektu:
   - **Name**: `sasiad-ma-dev` (lub dowolna nazwa)
   - **Database Password**: Wygeneruj silne hasło (zapisz je!)
   - **Region**: Wybierz najbliższy region (np. Europe - Frankfurt)
   - **Pricing Plan**: Free
5. Kliknij "Create new project" i poczekaj ~2 minuty

### Krok 2: Pobranie danych połączenia

Po utworzeniu projektu:

1. Przejdź do **Settings** → **Database**
2. Znajdź sekcję "Connection string" i skopiuj:
   - **Host**: np. `db.abcdefghijklmnop.supabase.co`
   - **Database**: `postgres`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: Twoje hasło z kroku 1

3. Przejdź do **Settings** → **API**
4. Skopiuj:
   - **Project URL**: `https://abcdefghijklmnop.supabase.co`
   - **anon public key**: Długi token zaczynający się od `eyJ...`
   - **service_role key**: Inny długi token (tylko dla backendu!)

### Krok 3: Utworzenie buckets w Storage

1. Przejdź do **Storage** w menu bocznym
2. Kliknij "Create a new bucket"
3. Utwórz pierwszy bucket:
   - **Name**: `items-photos`
   - **Public bucket**: ✅ (zaznacz)
   - Kliknij "Create bucket"
4. Utwórz drugi bucket:
   - **Name**: `avatars`
   - **Public bucket**: ✅ (zaznacz)
   - Kliknij "Create bucket"

### Krok 4: Konfiguracja Row Level Security (RLS) - opcjonalnie na początek

Na razie możesz pominąć konfigurację RLS - skonfigurujemy ją później podczas implementacji funkcji security.

---

## Konfiguracja SendGrid

SendGrid będzie używany do wysyłania powiadomień email.

### Krok 1: Utworzenie konta

1. Przejdź na stronę [https://sendgrid.com](https://sendgrid.com)
2. Kliknij "Start for Free"
3. Wypełnij formularz rejestracyjny
4. Potwierdź email
5. Wypełnij krótką ankietę (możesz wybrać "Education/Personal Projects")

### Krok 2: Utworzenie API Key

1. Przejdź do **Settings** → **API Keys**
2. Kliknij "Create API Key"
3. Wypełnij:
   - **API Key Name**: `sasiad-ma-dev`
   - **API Key Permissions**: "Full Access" (dla uproszczenia w MVP)
4. Kliknij "Create & View"
5. **WAŻNE**: Skopiuj wygenerowany klucz API (zaczyna się od `SG.`)
   - **Uwaga**: Klucz jest pokazywany tylko raz! Zapisz go w bezpiecznym miejscu

### Krok 3: Weryfikacja Sender Identity

SendGrid wymaga weryfikacji nadawcy emaili:

1. Przejdź do **Settings** → **Sender Authentication**
2. Wybierz **Single Sender Verification** (prostsze dla MVP)
3. Kliknij "Create New Sender"
4. Wypełnij formularz:
   - **From Name**: `Sąsiad-Ma`
   - **From Email Address**: Twój prawdziwy email (np. `twojmail@gmail.com`)
   - **Reply To**: Ten sam email
   - Pozostałe pola: Wypełnij danymi testowymi
5. Kliknij "Create"
6. Sprawdź swoją skrzynkę email i kliknij link weryfikacyjny

**Uwaga**: W pliku `appsettings.Development.json` użyj zweryfikowanego emaila zamiast `noreply@sasiad-ma.pl`:

```json
"SendGrid": {
  "ApiKey": "<TWÓJ_SENDGRID_API_KEY>",
  "FromEmail": "twojmail@gmail.com",
  "FromName": "Sąsiad-Ma"
}
```

---

## Generowanie JWT Secret

JWT Secret jest używany do podpisywania tokenów autoryzacyjnych.

### Wymagania:
- Minimum 32 znaki
- Losowe znaki (litery, cyfry, znaki specjalne)
- Unikalny dla każdego środowiska

### Sposób 1: PowerShell (Windows)

Otwórz PowerShell i uruchom:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Sposób 2: Online Generator

Użyj strony [https://randomkeygen.com/](https://randomkeygen.com/):
- Wybierz "CodeIgniter Encryption Keys" (256-bit)
- Skopiuj wygenerowany klucz

### Sposób 3: Własny string

Możesz utworzyć własny losowy ciąg minimum 32 znaków:
```
Przyklad!JWT$Secret#Key%2024&Sasiad*Ma^Dev@123
```

---

## Aktualizacja plików konfiguracyjnych

Po skonfigurowaniu wszystkich serwisów, zaktualizuj pliki z placeholderami:

### Backend: `backend/SasiadMa.Api/appsettings.Development.json`

Zastąp placeholdery w `<>` rzeczywistymi wartościami:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=db.abcdefghijklmnop.supabase.co;Database=postgres;Username=postgres;Password=TWOJE_HASLO_SUPABASE;Port=5432"
  },
  "Jwt": {
    "Secret": "TWOJ_WYGENEROWANY_JWT_SECRET_MIN_32_ZNAKI",
    "Issuer": "sasiad-ma-api",
    "Audience": "sasiad-ma-client",
    "AccessTokenExpirationMinutes": 60,
    "RefreshTokenExpirationMinutes": 43200
  },
  "Supabase": {
    "Url": "https://abcdefghijklmnop.supabase.co",
    "AnonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "ServiceKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "SendGrid": {
    "ApiKey": "SG.1234567890abcdefg...",
    "FromEmail": "twojmail@gmail.com",
    "FromName": "Sąsiad-Ma"
  },
  "FrontendUrl": "http://localhost:5173"
}
```

### Frontend: `frontend/.env`

Zastąp placeholdery w `<>` rzeczywistymi wartościami:

```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**WAŻNE**:
- Używaj tylko `AnonKey` w frontendzie, **NIGDY** `ServiceKey`!
- Plik `.env` powinien być w `.gitignore` (nie commituj go do repozytorium)

---

## Weryfikacja konfiguracji

Po wypełnieniu wszystkich wartości:

### 1. Sprawdź połączenie z bazą danych

W terminalu w folderze `backend/SasiadMa.Api`:

```bash
dotnet ef database update
```

Jeśli nie ma błędów, połączenie z Supabase działa!

### 2. Uruchom aplikację lokalnie

**Backend**:
```bash
cd backend/SasiadMa.Api
dotnet run
```

**Frontend**:
```bash
cd frontend
npm run dev
```

Otwórz `http://localhost:5173` - jeśli widzisz stronę powitalną i backend status "healthy", wszystko działa!

---

## Troubleshooting

### Błąd: "Password authentication failed for user postgres"
- Sprawdź czy hasło w `ConnectionStrings:DefaultConnection` jest prawidłowe
- Sprawdź czy używasz hasła z Supabase Dashboard → Settings → Database

### Błąd: "The server does not support SSL connections"
- Dodaj `;SSL Mode=Require` do connection stringa

### SendGrid: "The from address does not match a verified sender"
- Sprawdź czy zweryfikowałeś email w SendGrid (sprawdź skrzynkę pocztową)
- Sprawdź czy `FromEmail` w `appsettings.Development.json` zgadza się z zweryfikowanym emailem

### Supabase Storage: "Row Level Security policy violation"
- Upewnij się że buckety są ustawione jako "Public"
- Polityki RLS skonfigurujemy później

---

## ✅ Checklist Fazy 0

Po zakończeniu konfiguracji sprawdź:

- [x] Backend - zainstalowane pakiety NuGet
- [x] Backend - utworzona struktura folderów
- [x] Backend - skonfigurowany `appsettings.Development.json` z rzeczywistymi wartościami
- [x] Frontend - zainstalowane pakiety npm
- [x] Frontend - utworzona struktura folderów
- [x] Frontend - skonfigurowany `.env` z rzeczywistymi wartościami
- [ ] Supabase - utworzony projekt
- [ ] Supabase - utworzone buckety: `items-photos`, `avatars`
- [ ] SendGrid - utworzone konto
- [ ] SendGrid - utworzony i skopiowany API Key
- [ ] SendGrid - zweryfikowany sender email
- [ ] JWT Secret - wygenerowany (min. 32 znaki)
- [ ] Weryfikacja - `dotnet ef database update` działa
- [ ] Weryfikacja - aplikacja uruchamia się lokalnie (backend + frontend)

---

**Koniec przewodnika konfiguracji Fazy 0**

Następny krok: Implementacja Fazy 1 - Baza danych i autentykacja

# E2E Testing - Sąsiad-Ma

Dokumentacja testów End-to-End dla aplikacji Sąsiad-Ma Micro-MVP.

## 📋 Spis treści

1. [Przegląd](#przegląd)
2. [Instalacja](#instalacja)
3. [Uruchamianie testów](#uruchamianie-testów)
4. [Struktura testów](#struktura-testów)
5. [Pokrycie testami](#pokrycie-testami)
6. [Debugging](#debugging)
7. [CI/CD Integration](#cicd-integration)

---

## 📖 Przegląd

E2E testy zostały zaimplementowane przy użyciu **Playwright** zgodnie z planem implementacji (Faza 7) i PRD.

### Cel testów

Walidacja **krytycznego flow** aplikacji (PRD Section 7.9):
1. ✅ Rejestracja użytkownika A
2. ✅ Utworzenie społeczności
3. ✅ Wygenerowanie linku zaproszeniowego
4. ✅ Rejestracja użytkownika B przez link
5. ✅ Użytkownik A dodaje przedmiot ze zdjęciem
6. ✅ Użytkownik B rezerwuje przedmiot
7. ✅ Użytkownik A akceptuje rezerwację
8. ✅ Wymiana wiadomości w czacie
9. ✅ Użytkownik A potwierdza przekazanie
10. ✅ Użytkownik A potwierdza zwrot

### Technologia

- **Framework**: Playwright v1.57+
- **Język**: TypeScript
- **Przeglądarki**: Chromium (domyślnie), Firefox, WebKit
- **Runner**: Playwright Test Runner

---

## 🚀 Instalacja

### 1. Zainstaluj zależności

```bash
cd frontend
npm install
```

To zainstaluje `@playwright/test` już dodany do `package.json`.

### 2. Zainstaluj przeglądarki Playwright

```bash
npx playwright install
```

To pobierze Chromium, Firefox i WebKit (~500MB).

### 3. Dodaj testowy obrazek

Skopiuj dowolny obrazek JPG/PNG do:

```
frontend/e2e/fixtures/test-image.jpg
```

Możesz pobrać placeholder:
```bash
curl -o frontend/e2e/fixtures/test-image.jpg https://via.placeholder.com/400.jpg
```

---

## ▶️ Uruchamianie testów

### Wymagania

Przed uruchomieniem testów **MUSISZ** mieć uruchomione:

1. **Backend** na `http://localhost:5000`
   ```bash
   cd backend/SasiadMa.Api
   dotnet run
   ```

2. **Frontend** na `http://localhost:5173`
   ```bash
   cd frontend
   npm run dev
   ```

3. **Baza danych** (Supabase PostgreSQL) - skonfigurowana i dostępna

### Komendy

#### 1. Uruchom wszystkie testy (headless)

```bash
cd frontend
npm run test:e2e
```

#### 2. Uruchom testy w trybie UI (REKOMENDOWANE dla developmentu)

```bash
npm run test:e2e:ui
```

**Zalety UI mode:**
- Widzisz testy w czasie rzeczywistym
- Możesz debugować nieudane testy
- Inspekcja locatorów
- Podgląd trace'ów
- Play/Pause/Step przez testy

#### 3. Uruchom testy z widoczną przeglądarką

```bash
npm run test:e2e:headed
```

#### 4. Debugowanie testów

```bash
npm run test:e2e:debug
```

Otwiera Playwright Inspector - możesz krokować przez test.

#### 5. Zobacz raport HTML

Po uruchomieniu testów:

```bash
npm run test:e2e:report
```

#### 6. Uruchom konkretny plik testowy

```bash
npx playwright test e2e/06-full-flow.spec.ts
```

#### 7. Uruchom konkretny test

```bash
npx playwright test -g "should complete full borrowing cycle"
```

---

## 📂 Struktura testów

```
frontend/
├── e2e/
│   ├── helpers/                    # Funkcje pomocnicze
│   │   ├── auth.helper.ts         # Autentykacja (register, login, logout)
│   │   ├── community.helper.ts    # Społeczności (create, invite, join)
│   │   ├── item.helper.ts         # Przedmioty (add, find, open details)
│   │   ├── booking.helper.ts      # Rezerwacje (create, approve, handover, return)
│   │   └── message.helper.ts      # Wiadomości (send, receive, verify)
│   │
│   ├── fixtures/                   # Pliki testowe (obrazki, dane)
│   │   ├── test-image.jpg         # Obrazek testowy (DODAJ RĘCZNIE)
│   │   └── README.md
│   │
│   ├── 01-auth.spec.ts            # Testy autentykacji (US-001)
│   ├── 02-community.spec.ts       # Testy społeczności (US-002, US-003, US-004)
│   ├── 03-items.spec.ts           # Testy przedmiotów (US-005, US-006, US-007)
│   ├── 04-bookings.spec.ts        # Testy rezerwacji (US-008, US-009, US-010)
│   ├── 05-messages.spec.ts        # Testy wiadomości (US-011)
│   ├── 06-full-flow.spec.ts       # ⭐ GŁÓWNY TEST - pełny flow
│   └── README.md                   # Dokumentacja E2E
│
├── playwright.config.ts            # Konfiguracja Playwright
└── package.json                    # Skrypty npm
```

---

## ✅ Pokrycie testami

### User Stories pokryte testami

| User Story | Test File | Status |
|------------|-----------|--------|
| **US-001** - Rejestracja i logowanie | `01-auth.spec.ts` | ✅ |
| **US-002** - Założenie społeczności | `02-community.spec.ts` | ✅ |
| **US-003** - Generowanie linku zaproszeniowego | `02-community.spec.ts` | ✅ |
| **US-004** - Dołączenie przez link | `02-community.spec.ts` | ✅ |
| **US-005** - Dodanie przedmiotu | `03-items.spec.ts` | ✅ |
| **US-006** - Przeglądanie przedmiotów | `03-items.spec.ts` | ✅ |
| **US-007** - Szczegóły przedmiotu | `03-items.spec.ts` | ✅ |
| **US-008** - Rezerwacja przedmiotu | `04-bookings.spec.ts` | ✅ |
| **US-009** - Akceptacja/odrzucenie prośby | `04-bookings.spec.ts` | ✅ |
| **US-010** - Przekazanie i zwrot | `04-bookings.spec.ts` | ✅ |
| **US-011** - Czat 1-1 | `05-messages.spec.ts` | ✅ |

### Liczba testów

- **01-auth.spec.ts**: 6 testów
- **02-community.spec.ts**: 5 testów
- **03-items.spec.ts**: 8 testów
- **04-bookings.spec.ts**: 9 testów
- **05-messages.spec.ts**: 8 testów
- **06-full-flow.spec.ts**: 2 testy (GŁÓWNE)

**TOTAL: ~38 testów E2E**

### ⭐ Główny test: Full Borrowing Cycle

Plik: `06-full-flow.spec.ts`

Test `should complete full borrowing cycle` to **najważniejszy test** - waliduje cały flow aplikacji od początku do końca zgodnie z PRD Section 7.9.

**Czas trwania:** ~90-120 sekund

**Sprawdza:**
1. Rejestrację dwóch użytkowników
2. Utworzenie społeczności i dołączenie przez link
3. Dodanie przedmiotu
4. Pełny cykl rezerwacji: utworzenie → akceptacja → przekazanie → zwrot
5. Wymianę wiadomości
6. Zmianę statusów przedmiotu

**Jeśli ten test przechodzi → MVP DZIAŁA! 🎉**

---

## 🐛 Debugging

### 1. Playwright UI Mode (najłatwiejszy)

```bash
npm run test:e2e:ui
```

- Kliknij na test, który Cię interesuje
- Zobacz wykonanie krok po kroku
- Inspekcja elementów
- Time-travel debugging

### 2. Playwright Inspector

```bash
npm run test:e2e:debug
```

- Krokowanie przez test
- Konsola REPL (możesz wpisywać komendy)
- Highlight elementów

### 3. Trace Viewer

Testy automatycznie nagrywają trace przy błędzie:

```bash
npx playwright show-trace test-results/.../trace.zip
```

Pokazuje:
- Timeline akcji
- Screenshots każdego kroku
- Logi konsoli
- Network requests
- DOM snapshots

### 4. Screenshots i Videos

Przy błędzie automatycznie tworzone są:
- Screenshot: `test-results/.../test-failed-1.png`
- Video: `test-results/.../video.webm`

### 5. Logi w teście

W `06-full-flow.spec.ts` dodane są logi konsoli:

```typescript
console.log('✓ User A registered');
console.log('✓ Community created');
// etc.
```

Możesz je zobaczyć w trybie headed lub w logach.

### 6. Pause test

Dodaj w kodzie testu:

```typescript
await page.pause();
```

Test zatrzyma się i otworzysz Inspector.

### 7. Slow Motion

```bash
PWDEBUG=1 npx playwright test --headed --slowmo 1000
```

Każda akcja czeka 1 sekundę.

---

## 🔧 Troubleshooting

### Problem: Testy nie startują

**Rozwiązanie:**
1. Sprawdź czy backend działa: `curl http://localhost:5000/api/health`
2. Sprawdź czy frontend działa: `curl http://localhost:5173`
3. Sprawdź przeglądarki: `npx playwright install`

### Problem: Test timeout

**Rozwiązanie:**
- Zwiększ timeout w `playwright.config.ts`:
  ```typescript
  use: {
    actionTimeout: 30000, // 30 sekund
  }
  ```
- Lub w konkretnym teście:
  ```typescript
  test.setTimeout(180000); // 3 minuty
  ```

### Problem: Element not found

**Rozwiązanie:**
1. Użyj Playwright Inspector: `npm run test:e2e:debug`
2. Zobacz co jest na stronie: `await page.screenshot({ path: 'debug.png' })`
3. Sprawdź lokator: `await page.locator('text=Zaloguj').highlight()`

### Problem: Flaky tests (niestabilne)

**Rozwiązanie:**
- Użyj `expect().toBeVisible()` zamiast `waitForTimeout()`
- Poczekaj na konkretny stan:
  ```typescript
  await page.waitForURL('/dashboard', { timeout: 10000 });
  ```
- Dodaj retry:
  ```typescript
  test.describe.configure({ retries: 2 });
  ```

### Problem: Test image not found

**Rozwiązanie:**
Dodaj obrazek do `e2e/fixtures/test-image.jpg`:
```bash
curl -o frontend/e2e/fixtures/test-image.jpg https://via.placeholder.com/400.jpg
```

Lub skopiuj dowolny JPG/PNG i nazwij `test-image.jpg`.

---

## 🔄 CI/CD Integration

### GitHub Actions

Dodaj do `.github/workflows/frontend-ci-cd.yml`:

```yaml
name: Frontend CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: sasiadma_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20.x'

    - name: Setup .NET
      uses: actions/setup-dotnet@v3
      with:
        dotnet-version: 8.0.x

    # Backend
    - name: Start Backend
      run: |
        cd backend/SasiadMa.Api
        dotnet restore
        dotnet build
        dotnet run &
        sleep 10
      env:
        ASPNETCORE_ENVIRONMENT: Test
        DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

    # Frontend
    - name: Install Frontend Dependencies
      run: |
        cd frontend
        npm ci

    - name: Install Playwright Browsers
      run: |
        cd frontend
        npx playwright install --with-deps

    - name: Start Frontend
      run: |
        cd frontend
        npm run dev &
        sleep 5

    # E2E Tests
    - name: Run E2E Tests
      run: |
        cd frontend
        npm run test:e2e
      env:
        VITE_API_BASE_URL: http://localhost:5000
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

    - name: Upload Playwright Report
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: frontend/playwright-report/
        retention-days: 30

    - name: Upload Test Results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: test-results
        path: frontend/test-results/
        retention-days: 7
```

### Secrets do skonfigurowania

W GitHub Settings → Secrets and variables → Actions:

- `TEST_DATABASE_URL` - URL do testowej bazy danych
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key

---

## 📊 Metryki sukcesu (PRD Section 6.2)

Testy E2E walidują metryki sukcesu Micro-MVP:

| Metryka | Test E2E |
|---------|----------|
| ✅ 5+ zarejestrowanych użytkowników | Każdy test tworzy 1-2 użytkowników |
| ✅ 5+ przedmiotów dodanych | Testy `03-items.spec.ts`, `06-full-flow.spec.ts` |
| ✅ 3+ próśb o wypożyczenie | Testy `04-bookings.spec.ts` |
| ✅ 2+ zaakceptowanych rezerwacji | Test `06-full-flow.spec.ts` |
| ✅ 1+ przekazanie przedmiotu | Test `06-full-flow.spec.ts` |
| ✅ 1+ zwrot przedmiotu | Test `06-full-flow.spec.ts` |

**Jeśli test `06-full-flow.spec.ts` przechodzi → główna hipoteza zwalidowana!**

---

## 📈 Statystyki

Po uruchomieniu `npm run test:e2e`, w konsoli zobaczysz:

```
Running 38 tests using 1 worker

  ✓ 01-auth.spec.ts:7:3 › Authentication › should register a new user successfully (5s)
  ✓ 01-auth.spec.ts:15:3 › Authentication › should login with existing user (7s)
  ...
  ✓ 06-full-flow.spec.ts:15:3 › Full Application Flow › should complete full borrowing cycle (92s)

  38 passed (3m)
```

**Całkowity czas:** ~3-5 minut (zależy od maszyny)

**Najdłuższy test:** `06-full-flow.spec.ts` (~90-120 sekund)

---

## 🎯 Best Practices

### 1. Izolacja testów

Każdy test jest niezależny:
- ✅ Tworzy własnych użytkowników
- ✅ Używa unikalnych nazw (timestamp)
- ✅ Nie polega na danych z innych testów

### 2. Semantyczne locatory

```typescript
// ✅ DOBRZE
await page.getByRole('button', { name: /zaloguj/i });
await page.getByLabel(/email/i);
await page.getByText('Dashboard');

// ❌ ŹLE
await page.locator('#login-button');
await page.locator('.form-input');
```

### 3. Explicit waits

```typescript
// ✅ DOBRZE
await expect(page.getByText('Success')).toBeVisible({ timeout: 5000 });
await page.waitForURL('/dashboard');

// ❌ ŹLE
await page.waitForTimeout(5000);
```

### 4. Helper functions

Używaj funkcji z `helpers/` zamiast duplikować kod:

```typescript
// ✅ DOBRZE
import { registerUser } from './helpers/auth.helper';
await registerUser(page, user);

// ❌ ŹLE
await page.goto('/register');
await page.fill('#email', user.email);
// ... 10 linii kodu
```

---

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Test Generator](https://playwright.dev/docs/codegen): `npx playwright codegen http://localhost:5173`

---

## ✅ Checklist przed merge

Przed zmergowaniem kodu z testami E2E, upewnij się że:

- [ ] Wszystkie testy przechodzą lokalnie
- [ ] Test `06-full-flow.spec.ts` przechodzi (główny test)
- [ ] Dodany obrazek testowy do `e2e/fixtures/test-image.jpg`
- [ ] Zaktualizowany `.gitignore` (artifacts Playwright)
- [ ] Skrypty npm działają (`npm run test:e2e`)
- [ ] Przeglądarki Playwright zainstalowane
- [ ] Dokumentacja E2E utworzona (ten plik)
- [ ] CI/CD workflow skonfigurowany (opcjonalnie)

---

## 🎉 Gratulacje!

Testy E2E dla Sąsiad-Ma Micro-MVP są gotowe! 🚀

Jeśli test `06-full-flow.spec.ts` przechodzi, to znaczy że:
- ✅ Wszystkie 11 User Stories działają
- ✅ Pełny flow wypożyczenia działa end-to-end
- ✅ Aplikacja jest gotowa do beta testingu

---

**Wersja:** 0.1 Micro-MVP
**Data:** 2026-01-11
**Status:** ✅ E2E Tests Implemented

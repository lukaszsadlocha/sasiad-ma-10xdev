# Faza 1 - Instrukcje finalizacji

## Status implementacji

✅ **UKOŃCZONE:**
- Backend: Database models (User, Community, InviteLink, Item, Booking)
- Backend: AppDbContext z konfiguracją EF Core
- Backend: Program.cs z Identity, JWT, i CORS
- Backend: Auth DTOs (RegisterRequest, LoginRequest, AuthResponse)
- Backend: AuthService z pełną logiką JWT
- Backend: AuthEndpoints (/api/auth/register, /login, /refresh)
- Frontend: TypeScript types
- Frontend: API helper functions
- Frontend: AuthContext i useAuth hook
- Frontend: LoginPage z walidacją
- Frontend: RegisterPage z walidacją hasła
- Frontend: ProtectedRoute component
- Frontend: DashboardPage
- Frontend: React Router setup

⏳ **DO ZROBIENIA:**
1. Utworzenie i zastosowanie migracji EF Core
2. Testowanie flow autentykacji end-to-end

---

## Krok 1: Zatrzymaj backend

Aby utworzyć migracje, musisz zatrzymać działający backend:

1. W terminalu gdzie działa backend, naciśnij `Ctrl+C`
2. Lub zamknij proces w Task Manager

---

## Krok 2: Utwórz i zastosuj migracje

### Opcja A: Przez Rider (zalecane)

1. Otwórz `backend/SasiadMa.Api/SasiadMa.Api.csproj` w Rider
2. W menu: **Tools** → **Entity Framework Core** → **Add Migration**
3. Wpisz nazwę: `InitialCreate`
4. Kliknij OK
5. Następnie: **Tools** → **Entity Framework Core** → **Update Database**

### Opcja B: Przez terminal

```bash
cd backend/SasiadMa.Api

# Utwórz migrację
dotnet ef migrations add InitialCreate

# Zastosuj migrację do bazy danych
dotnet ef database update
```

### Weryfikacja

Sprawdź w Supabase Dashboard czy tabele zostały utworzone:
- AspNetUsers (z dodatkowymi kolumnami: PreferredName, AvatarUrl, CommunityId)
- AspNetRoles
- AspNetUserRoles
- Communities
- InviteLinks
- Items
- Bookings

---

## Krok 3: Uruchom backend i frontend

### Backend

```bash
cd backend/SasiadMa.Api
dotnet run
```

Backend powinien wystartować na `http://localhost:5000`

### Frontend

W nowym terminalu:

```bash
cd frontend
npm run dev
```

Frontend powinien wystartować na `http://localhost:5173`

---

## Krok 4: Testowanie autentykacji

### Test 1: Rejestracja nowego użytkownika

1. Otwórz przeglądarkę: `http://localhost:5173`
2. Powinieneś zostać przekierowany do `/login` (nie jesteś zalogowany)
3. Kliknij "Zarejestruj się"
4. Wypełnij formularz:
   - **Email:** test@example.com
   - **Imię:** Jan Kowalski
   - **Hasło:** Test1234
   - **Potwierdź hasło:** Test1234
   - **Checkbox:** Zaakceptuj regulamin ✅
5. Kliknij "Zarejestruj się"

**Oczekiwany rezultat:**
- ✅ Przekierowanie do `/dashboard`
- ✅ Wyświetlenie powitalnej wiadomości: "Witaj, Jan Kowalski"
- ✅ Wyświetlenie ID użytkownika, email, imienia

### Test 2: Wylogowanie

1. Na stronie Dashboard kliknij "Wyloguj"

**Oczekiwany rezultat:**
- ✅ Przekierowanie do `/login`
- ✅ Brak dostępu do `/dashboard` (przekierowanie do loginu)

### Test 3: Logowanie

1. Na stronie logowania wpisz:
   - **Email:** test@example.com
   - **Hasło:** Test1234
2. Kliknij "Zaloguj się"

**Oczekiwany rezultat:**
- ✅ Przekierowanie do `/dashboard`
- ✅ Wyświetlenie danych użytkownika

### Test 4: Walidacja hasła (Rejestracja)

1. Przejdź do `/register`
2. Spróbuj zarejestrować się z hasłem: `test` (za krótkie)

**Oczekiwany rezultat:**
- ❌ Błąd walidacji: "Hasło musi mieć minimum 8 znaków"

3. Spróbuj hasło: `testtest` (brak wielkiej litery i cyfry)

**Oczekiwany rezultat:**
- ❌ Błąd: "Hasło musi zawierać wielką literę"
- ❌ Błąd: "Hasło musi zawierać cyfrę"

### Test 5: Nieprawidłowe logowanie

1. Przejdź do `/login`
2. Wpisz nieprawidłowy email lub hasło

**Oczekiwany rezultat:**
- ❌ Błąd: "Nieprawidłowy email lub hasło"

---

## Krok 5: Weryfikacja w bazie danych

1. Otwórz Supabase Dashboard
2. Przejdź do **Table Editor** → **AspNetUsers**
3. Powinieneś zobaczyć utworzonego użytkownika:
   - Email: test@example.com
   - PreferredName: Jan Kowalski
   - CommunityId: NULL (nie jest jeszcze w żadnej społeczności)

---

## Troubleshooting

### Backend nie startuje

**Problem:** `JWT Secret not configured`

**Rozwiązanie:** Sprawdź `appsettings.Development.json` - pole `Jwt:Secret` powinno mieć wartość.

---

**Problem:** Błędy kompilacji

**Rozwiązanie:**
```bash
cd backend/SasiadMa.Api
dotnet restore
dotnet build
```

---

### Frontend nie łączy się z backendem

**Problem:** CORS error w konsoli przeglądarki

**Rozwiązanie:** Sprawdź czy:
- Backend działa na `http://localhost:5000`
- Frontend działa na `http://localhost:5173`
- W `appsettings.Development.json`: `"FrontendUrl": "http://localhost:5173"`

---

**Problem:** `401 Unauthorized` przy logowaniu

**Rozwiązanie:** Sprawdź logi backendu - prawdopodobnie problem z JWT Secret.

---

### Migracje nie działają

**Problem:** `Build failed`

**Rozwiązanie:** Zatrzymaj backend przed utworzeniem migracji.

---

**Problem:** `Unable to create an object of type 'AppDbContext'`

**Rozwiązanie:** Sprawdź connection string w `appsettings.Development.json`.

---

## Następne kroki

Po pomyślnym ukończeniu testów Fazy 1:

✅ **Faza 1 - Autentykacja: UKOŃCZONA**

Możesz przejść do **Fazy 2: Społeczności** (US-002, US-003, US-004):
- Tworzenie społeczności
- Generowanie linków zaproszeniowych
- Dołączanie przez link

---

## Kryteria akceptacji Fazy 1 (Checklist)

- [ ] Backend: Baza danych PostgreSQL skonfigurowana w Supabase ✅ (już wcześniej)
- [ ] Backend: Migracje EF Core zastosowane poprawnie
- [ ] Backend: POST /api/auth/register działa (zwraca JWT tokens)
- [ ] Backend: POST /api/auth/login działa (zwraca JWT tokens)
- [ ] Frontend: Strona rejestracji działa i waliduje hasło
- [ ] Frontend: Strona logowania działa
- [ ] Frontend: Access token zapisywany w localStorage
- [ ] Frontend: Przekierowanie do dashboard po zalogowaniu
- [ ] Test: Zarejestrowany użytkownik może się zalogować

---

**Data:** 2026-01-11
**Wersja:** 0.1 Micro-MVP

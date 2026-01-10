# Dokument wymagań produktu (PRD) - Sąsiad-Ma
## Micro-MVP

## 1. Przegląd produktu

Sąsiad-Ma to aplikacja webowa zaprojektowana w celu poprawy relacji sąsiedzkich poprzez bezpłatne wypożyczanie i pożyczanie użytecznych przedmiotów w ramach małych społeczności osiedlowych.

**Główna hipoteza do walidacji:**
> "Mieszkańcy osiedli chcą wypożyczać przedmioty od sąsiadów zamiast je kupować i faktycznie będą to robić"

Wersja: 0.1 Micro-MVP
Status: Ready for Implementation

**Cele biznesowe:**
1. Zwalidować koncepcję w **2-3 tygodnie**
2. Przetestować na **5-10 użytkownikach** (1 społeczność)
3. Sprawdzić czy dochodzi do **faktycznych wypożyczeń**
4. Zebrać feedback do dalszego rozwoju
5. Utrzymać zerowe koszty operacyjne

**Stos technologiczny:** Zobacz [@tech-stack.md](.ai/tech-stack.md)

---

## 2. Problem użytkownika

**Główny problem:**
Mieszkańcy osiedli potrzebują przedmiotów używanych sporadycznie (1-2 razy w roku), co prowadzi do niepotrzebnych wydatków i braku więzi z sąsiadami.

**User Personas (uproszczone):**

**Persona 1: Anna - Młoda Mama**
- Potrzebuje czasami wózka spacerowego, fotelika samochodowego
- Nie chce wydawać pieniędzy na rzeczy używane kilka razy

**Persona 2: Marek - Hobbysta**
- Ma narzędzia ogrodnicze, które często są niewykorzystane
- Chce być pomocny dla społeczności

---

## 3. Wymagania funkcjonalne - Micro-MVP

### 3.1 Uwierzytelnianie (UPROSZCZONE)
- Rejestracja: email + hasło + imię
- **BEZ potwierdzenia email** (konto aktywne od razu)
- **BEZ Google OAuth** (tylko email+hasło)
- **BEZ resetowania hasła** (admin może zmienić ręcznie w bazie)
- Walidacja hasła: min. 8 znaków, 1 wielka, 1 mała, 1 cyfra
- JWT: Access token 1h, Refresh token 30 dni
- Checkbox zgody na regulamin (wymagany)

### 3.2 Zarządzanie Społecznością (MINIMUM)
- Tworzenie społeczności: nazwa (wymagana), opis (max 300 znaków)
- Założyciel = administrator (automatycznie)
- **BEZ ról i uprawnień** (wszyscy członkowie równi, założyciel ma dodatkowe opcje)
- Generowanie linku zaproszeniowego (prosty, wielorazowy, **bez wygasania**)
- Dołączanie przez link (automatyczne po rejestracji/logowaniu)
- **Ograniczenie: 1 użytkownik = 1 społeczność**
- **BEZ usuwania członków, BEZ opuszczania społeczności**

### 3.3 Zarządzanie Przedmiotami (MINIMUM)
- Dodawanie przedmiotu:
  - Nazwa (wymagana, max 100 znaków)
  - Kategoria (wymagana, lista: Narzędzia ogrodowe, Narzędzia budowlane, Sprzęt dziecięcy, Sport, Elektronika, Książki, Kuchnia, Inne)
  - Zdjęcie (opcjonalne, max 1, max 5MB)
  - Opis (wymagany, max 300 znaków)
- **BEZ edycji przedmiotu** (można usunąć i dodać nowy)
- **BEZ usuwania przedmiotu** (można oznaczyć jako niedostępny)
- Oznaczanie jako "Niedostępny" (toggle, bez daty powrotu)
- **BEZ historii wypożyczeń** (tylko aktualne)
- **BEZ kalendarza dostępności** (daty wyświetlane jako tekst)

### 3.4 Przeglądanie (PROSTE)
- Lista wszystkich przedmiotów w społeczności (karty)
- Widok: zdjęcie, nazwa, kategoria, imię właściciela, status (Dostępny/Wypożyczony/Niedostępny)
- **BEZ filtrowania**
- **BEZ sortowania** (domyślnie: najnowsze)
- **BEZ stronicowania** (jedna strona, max 50 przedmiotów na start)
- Widok szczegółów: wszystkie dane + przycisk "Rezerwuj"

### 3.5 System Rezerwacji i Wypożyczeń (CORE)

**Rezerwacja:**
- Formularz: data od, data do (max 14 dni), notatka dla właściciela (opcjonalna, max 200 znaków)
- **Brak walidacji kolizji dat** (właściciel sam weryfikuje)
- Status początkowy: "Oczekujące"
- Email do właściciela: "Nowa prośba o wypożyczenie"

**Akceptacja/Odrzucenie (właściciel):**
- Lista próśb w sekcji "Moje przedmioty"
- Przyciski: "Akceptuj" / "Odrzuć"
- Akceptacja → status: "Zatwierdzone", email do wypożyczającego
- Odrzucenie → powód (opcjonalny, max 200 znaków), status: "Odrzucone", email do wypożyczającego

**Potwierdzenie przekazania (właściciel):**
- Przycisk "Potwierdź przekazanie" (dla statusu "Zatwierdzone")
- Po kliknięciu → status: "W trakcie"
- Zapisuje datę przekazania

**Potwierdzenie zwrotu (właściciel):**
- Przycisk "Potwierdź zwrot" (dla statusu "W trakcie")
- Po kliknięciu → status: "Zwrócone"
- Zapisuje datę zwrotu
- Przedmiot znów dostępny do rezerwacji

**Statusy:**
```
Oczekujące → właściciel widzi prośbę
    ↓ (akceptacja)
Zatwierdzone → umówić szczegóły (czat)
    ↓ (potwierdź przekazanie)
W trakcie → przedmiot wypożyczony
    ↓ (potwierdź zwrot)
Zwrócone → zakończone

[Alternatywnie: Oczekujące → Odrzucone]
```

**BEZ:**
- ❌ Powiadomienia o zbliżającym się terminie
- ❌ Automatyczne przypomnienia po terminie
- ❌ Eskalacje do administratora
- ❌ Status "Spóźnione"
- ❌ "Chcę pożyczyć" dla wypożyczonych przedmiotów

### 3.6 Komunikacja (MINIMUM)
- Czat 1-1 między członkami społeczności
- Prosty interfejs: lista konwersacji + okno czatu
- Tylko tekst (max 1000 znaków)
- **BEZ oznaczania jako przeczytane**
- **BEZ tablicy ogłoszeń**
- **BEZ próśb "Szukam..."**
- **BEZ zgłoszeń nieprawidłowości**
- Email przy nowej wiadomości (opcja wyłączenia w profilu)

### 3.7 Profile Użytkownika (MINIMUM)
- Dane: email, imię/preferowana nazwa, awatar (opcjonalnie)
- Publiczny profil: imię, awatar, lista przedmiotów użytkownika
- **BEZ "O mnie"**
- **BEZ lokalizacji w osiedlu**
- **BEZ statystyk**
- **BEZ reputacji i odznak**
- Edycja: zmiana imienia, avatara, hasła
- **BEZ usuwania konta** (na żądanie przez admina)

### 3.8 Powiadomienia (MINIMUM)
**Email (tylko 4 typy):**
1. Nowa prośba o wypożyczenie (→ właściciel)
2. Akceptacja prośby (→ wypożyczający)
3. Odrzucenie prośby (→ wypożyczający)
4. Nowa wiadomość w czacie (→ odbiorca, z opcją wyłączenia)

**BEZ:**
- ❌ Push notifications
- ❌ Powiadomienia o zwrotach
- ❌ Przypomnienia

### 3.9 Dashboard (PROSTE)
- Nagłówek: logo, nazwa społeczności, profil użytkownika
- Sekcja "Moje wypożyczenia" (jako wypożyczający): lista z statusami
- Sekcja "Moje przedmioty" (jako właściciel): lista + prośby oczekujące
- Przycisk "Przeglądaj wszystkie przedmioty"
- Przycisk "+ Dodaj przedmiot"
- **BEZ sidebara z tablicą**
- **BEZ rankingu**
- **BEZ "ostatnio dodane"**

### 3.10 RODO (MINIMUM)
- Checkbox zgody na regulamin i politykę prywatności (przy rejestracji)
- Strona z polityką prywatności (szablon)
- Strona z regulaminem (szablon)
- **BEZ opcji usunięcia konta przez UI** (na żądanie przez admina)

---

## 4. Historyjki użytkowników (10 total)

### Epic 1: Uwierzytelnianie

**US-001: Rejestracja i logowanie**
**Opis:** Jako nowy użytkownik chcę zarejestrować się przez email, aby móc korzystać z aplikacji

**Kryteria akceptacji:**
- Formularz rejestracji: email, hasło, potwierdzenie hasła, imię/preferowana nazwa
- Walidacja hasła: min. 8 znaków, 1 wielka litera, 1 mała litera, 1 cyfra
- Checkbox zgody na regulamin (wymagany)
- Konto aktywne **natychmiast** (bez potwierdzenia email)
- Jeśli email już istnieje, wyświetlany jest komunikat błędu
- Formularz logowania: email + hasło
- Po poprawnym logowaniu: Access Token (1h) + Refresh Token (30 dni)
- Błędne dane → komunikat "Nieprawidłowy email lub hasło"
- Przekierowanie na dashboard lub dołączanie do społeczności (jeśli link zaproszeniowy)

---

### Epic 2: Społeczności

**US-002: Założenie społeczności**
**Opis:** Jako użytkownik chcę założyć społeczność dla mojego osiedla, aby zaprosić sąsiadów

**Kryteria akceptacji:**
- Formularz tworzenia: nazwa osiedla (wymagana, max 100 znaków), opis (opcjonalny, max 300 znaków)
- Po utworzeniu, użytkownik = administrator społeczności
- Społeczność od razu aktywna
- Przekierowanie do dashboardu społeczności

---

**US-003: Generowanie linku zaproszeniowego**
**Opis:** Jako administrator chcę wygenerować link zaproszeniowy, aby zaprosić sąsiadów

**Kryteria akceptacji:**
- Przycisk "Wygeneruj link zaproszeniowy" w panelu społeczności
- System generuje unikalny token
- Link w formacie: `https://sasiad-ma.pl/invite/{token}`
- Można skopiować jednym kliknięciem
- Link wielorazowy, **bez wygasania**
- Wyświetlany aktywny link (tylko 1 na społeczność w MVP)

---

**US-004: Dołączenie do społeczności przez link**
**Opis:** Jako nowy użytkownik chcę dołączyć do społeczności przez link od sąsiada

**Kryteria akceptacji:**
- Po kliknięciu w link → strona rejestracji/logowania
- Nazwa społeczności wyświetlana: "Dołączasz do: [Nazwa Osiedla]"
- Po rejestracji/logowaniu → automatyczne dodanie do społeczności
- Jeśli użytkownik już w innej społeczności → komunikat błędu (MVP limitation: 1 społeczność)
- Rola: Członek
- Przekierowanie na dashboard

---

### Epic 3: Przedmioty

**US-005: Dodanie przedmiotu do wypożyczenia**
**Opis:** Jako użytkownik chcę dodać przedmiot do wypożyczenia, aby pomóc sąsiadom

**Kryteria akceptacji:**
- Formularz zawiera:
  - Nazwa (wymagana, max 100 znaków)
  - Kategoria (wymagana, lista: Narzędzia ogrodowe, Narzędzia budowlane, Sprzęt dziecięcy, Sport, Elektronika, Książki, Kuchnia, Inne)
  - Zdjęcie (opcjonalne, max 1, max 5MB, JPG/PNG)
  - Opis (wymagany, max 300 znaków)
- Zdjęcie przesyłane do Supabase Storage
- Po zapisaniu, przedmiot widoczny w społeczności
- Status domyślny: "Dostępny"

---

**US-006: Przeglądanie przedmiotów**
**Opis:** Jako użytkownik chcę przeglądać dostępne przedmioty w mojej społeczności

**Kryteria akceptacji:**
- Lista wszystkich przedmiotów w społeczności (karty/siatka)
- Każda karta: zdjęcie (lub placeholder), nazwa, kategoria, imię właściciela, status (badge: Dostępny/Wypożyczony/Niedostępny)
- Sortowanie: najnowsze (domyślne, bez opcji zmiany)
- Kliknięcie → widok szczegółów

---

**US-007: Widok szczegółów przedmiotu**
**Opis:** Jako użytkownik chcę zobaczyć szczegóły przedmiotu, aby zadecydować o rezerwacji

**Kryteria akceptacji:**
- Strona zawiera: zdjęcie (pełny rozmiar), nazwa, opis, kategoria, status
- Profil właściciela: awatar, imię (link do profilu)
- Przycisk "Rezerwuj" (jeśli status: Dostępny)
- Jeśli status: Wypożyczony lub Niedostępny → informacja "Obecnie niedostępny"
- Dla właściciela: przyciski "Oznacz jako niedostępny" / "Oznacz jako dostępny"

---

### Epic 4: Rezerwacje i Wypożyczenia

**US-008: Rezerwacja przedmiotu**
**Opis:** Jako użytkownik chcę zarezerwować przedmiot na konkretne daty

**Kryteria akceptacji:**
- Formularz rezerwacji:
  - Data od (kalendarz, min: dzisiaj)
  - Data do (kalendarz, max: data od + 14 dni)
  - Notatka dla właściciela (opcjonalna, max 200 znaków)
- Data "do" musi być późniejsza niż data "od"
- **Brak walidacji kolizji dat** (właściciel sam sprawdzi)
- Po wysłaniu → status: "Oczekujące"
- Właściciel otrzymuje email: "Masz nową prośbę o wypożyczenie: [przedmiot] od [imię]"
- Komunikat dla użytkownika: "Prośba wysłana! Czekamy na odpowiedź [Imię właściciela]"

---

**US-009: Akceptacja lub odrzucenie prośby**
**Opis:** Jako właściciel chcę zaakceptować lub odrzucić prośbę o wypożyczenie

**Kryteria akceptacji:**
- Sekcja "Moje przedmioty" → zakładka "Prośby oczekujące"
- Lista próśb: przedmiot, kto, daty (od-do), notatka, link do profilu wypożyczającego
- Przyciski: "Akceptuj" / "Odrzuć"
- **Akceptacja:**
  - Status → "Zatwierdzone"
  - Email do wypożyczającego: "[Imię] zaakceptował/a Twoją prośbę o [przedmiot]! Umów szczegóły."
  - Przycisk "Wyślij wiadomość" (otwiera czat 1-1)
- **Odrzucenie:**
  - Modal z polem "Powód odrzucenia" (opcjonalny, max 200 znaków)
  - Status → "Odrzucone"
  - Email do wypożyczającego z powodem (jeśli podany)

---

**US-010: Potwierdzenie przekazania i zwrotu przedmiotu**
**Opis:** Jako właściciel chcę potwierdzić przekazanie i zwrot przedmiotu, aby śledzić statusy

**Kryteria akceptacji:**

**Potwierdzenie przekazania:**
- Przycisk "Potwierdź przekazanie" widoczny dla rezerwacji ze statusem "Zatwierdzone"
- Po kliknięciu → modal potwierdzenia
- Po potwierdzeniu:
  - Status → "W trakcie"
  - Zapisuje datę i czas przekazania
  - Przedmiot zmienia status na "Wypożyczony" w liście

**Potwierdzenie zwrotu:**
- Przycisk "Potwierdź zwrot" widoczny dla rezerwacji ze statusem "W trakcie"
- Po kliknięciu → modal potwierdzenia
- Po potwierdzeniu:
  - Status → "Zwrócone"
  - Zapisuje datę i czas zwrotu
  - Przedmiot zmienia status na "Dostępny" w liście
  - Email do wypożyczającego: "Dziękujemy za zwrot [przedmiot]!"

---

### Epic 5: Komunikacja

**US-011 (było US-026): Czat 1-1**
**Opis:** Jako użytkownik chcę napisać prywatną wiadomość do sąsiada

**Kryteria akceptacji:**
- Strona "Wiadomości" z listą konwersacji
- Lista zawiera: awatar, imię, ostatnia wiadomość (fragment), czas
- Po kliknięciu na konwersację → okno czatu
- Historia czatu widoczna (chronologicznie, najstarsze u góry)
- Formularz: pole tekstowe (max 1000 znaków) + przycisk "Wyślij"
- Po wysłaniu → wiadomość natychmiast widoczna
- Odbiorca otrzymuje email: "Masz nową wiadomość od [Imię]" (z opcją wyłączenia w profilu)
- **BEZ oznaczania jako przeczytane**
- **BEZ powiadomień w czasie rzeczywistym** (odświeżanie manualne)

---

## 6. Metryki sukcesu - Micro-MVP

### 6.1 Kryteria uruchomienia (Definition of Done)

**Wymagane (MINIMUM):**
- ✅ Wszystkie 10 user stories zaimplementowane
- ✅ Aplikacja wdrożona na produkcję (Azure + Supabase)
- ✅ Co najmniej **1 działająca społeczność** z **3+ członkami**
- ✅ Co najmniej **3 przedmioty** dodane
- ✅ Co najmniej **1 udana transakcja** (prośba → akceptacja → przekazanie → zwrot)
- ✅ Działające powiadomienia email (4 typy)
- ✅ Responsywny interfejs mobilny (podstawowy)
- ✅ Zgodność z RODO (polityka prywatności, regulamin)

### 6.2 Metryki walidacji (pierwsze 2 tygodnie testów)

**Cel minimalny (SUKCES):**
- 5+ zarejestrowanych użytkowników
- 5+ przedmiotów dodanych
- 3+ próśb o wypożyczenie
- 2+ zaakceptowanych rezerwacji
- 1+ fizyczne przekazanie przedmiotu (status: "W trakcie")
- 1+ zwrot przedmiotu (status: "Zwrócone")

**Pytania walidacyjne:**
1. Czy użytkownicy dodają przedmioty? (min. 1 przedmiot/użytkownik)
2. Czy rezerwują przedmioty innych? (min. 50% użytkowników)
3. Czy właściciele akceptują prośby? (min. 50% próśb)
4. Czy dochodzi do fizycznego wypożyczenia? (min. 1 przekazanie)
5. Czy przedmioty są zwracane? (min. 1 zwrot)

**Jeśli TAK → rozwijamy dalej (dodajemy funkcje z oryginalnego PRD)**
**Jeśli NIE → pivot lub stop**

### 6.3 Metryki jakości

- Czas odpowiedzi API: < 1s (p95)
- Uptime: > 90%
- Błędy krytyczne: 0
- Zgłoszenia użytkowników: < 3

---

## 7. Timeline

**Faza 1: Implementacja (1.5-2 tygodnie)**
- Backend API + Baza danych
- Frontend (11 ekranów)
- Integracja Supabase Storage
- Email notifications
- Deploy na Azure

**Faza 2: Testowanie wewnętrzne (2-3 dni)**
- Testy manualne full flow
- Naprawy bugów krytycznych

**Faza 3: Beta testing (1-2 tygodnie)**
- Rekrutacja 5-10 użytkowników (1 osiedle)
- Monitoring i zbieranie feedbacku
- Naprawy bugów

**Faza 4: Decyzja (1 dzień)**
- Analiza metryk
- GO/NO-GO dla dalszego rozwoju

**TOTAL: ~3-4 tygodnie od startu do decyzji**

---

## 8. Ryzyka i mitygacje

| Ryzyko | Prawdopodobieństwo | Impact | Mitygacja |
|--------|-------------------|--------|-----------|
| Brak zainteresowania użytkowników | Średnie | Wysokie | Rekrutacja z realnego osiedla, nie "znajomych" |
| Problemy z fizycznym przekazaniem | Średnie | Średnie | Czat 1-1 do ustalenia szczegółów |
| Brak zwrotów przedmiotów | Niskie | Wysokie | Start z małą grupą zaufanych osób |
| Techniczne: Azure Free Tier limit | Niskie | Średnie | Monitoring użycia, plan B: Vercel/Netlify |
| Supabase Storage limit (1GB free) | Niskie | Niskie | Max 1 zdjęcie/przedmiot, 5MB limit |

---

**Przyszłe funkcje:** Zobacz [@future-features.md](.ai/future-features.md) - lista funkcji wyrzuconych z MVP i roadmap post-walidacji

---

**Koniec dokumentu**
Wersja: 0.1 Micro-MVP
Data: 2026-01-10
Liczba User Stories: 10
Szacowany czas realizacji: 2-3 tygodnie

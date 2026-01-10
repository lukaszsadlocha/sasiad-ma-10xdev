# Przyszłe Funkcje - Sąsiad-Ma
## Features wyrzucone z Micro-MVP + Roadmap

## 1. Przegląd

Ten dokument zawiera wszystkie funkcje, które zostały **świadomie wyrzucone z Micro-MVP** w celu przyspieszenia walidacji głównej hipotezy.

**Uwaga:** Te funkcje mogą zostać dodane w przyszłości, jeśli Micro-MVP okaże się sukcesem.

---

## 2. Funkcje wyrzucone z MVP

Poniższa lista zawiera wszystkie funkcje z oryginalnego PRD, które zostały usunięte z Micro-MVP.

### 2.1 Uwierzytelnianie

**Wyrzucone:**
- ❌ **Potwierdzenie email przy rejestracji**
  - Oryginalne wymaganie: Email z linkiem weryfikacyjnym, token 24h
  - Dlaczego wyrzucone: Komplikuje proces onboarding, nie krytyczne dla MVP
  - Priorytet dodania: **Wysoki** (bezpieczeństwo)

- ❌ **Google OAuth (Logowanie przez Google)**
  - Oryginalne wymaganie: Integracja z Google Identity
  - Dlaczego wyrzucone: Dodatkowa konfiguracja, nie krytyczne dla 5-10 użytkowników
  - Priorytet dodania: **Średni** (convenience)

- ❌ **Resetowanie hasła przez email**
  - Oryginalne wymaganie: Link resetujący z tokenem 1h
  - Dlaczego wyrzucone: Admin może zmienić hasło ręcznie w bazie dla MVP
  - Priorytet dodania: **Wysoki** (podstawowa funkcja)

### 2.2 Społeczności

**Wyrzucone:**
- ❌ **System ról (Administrator vs Członek)**
  - Oryginalne wymaganie: Różne uprawnienia dla adminów i członków
  - Dlaczego wyrzucone: Założyciel = admin wystarczy dla MVP
  - Priorytet dodania: **Średni**

- ❌ **Zarządzanie członkami (usuwanie użytkowników)**
  - Oryginalne wymaganie: Admin może usunąć członka z uzasadnieniem
  - Dlaczego wyrzucone: Mała grupa zaufanych osób, nie będzie potrzeby
  - Priorytet dodania: **Niski** (dopiero przy większej społeczności)

- ❌ **Opuszczanie społeczności**
  - Oryginalne wymaganie: Użytkownik może opuścić społeczność (jeśli brak aktywnych wypożyczeń)
  - Dlaczego wyrzucone: MVP = 1 społeczność, brak use case
  - Priorytet dodania: **Średni**

- ❌ **Wygasanie linków zaproszeniowych**
  - Oryginalne wymaganie: Opcjonalna data wygaśnięcia linku
  - Dlaczego wyrzucone: Niepotrzebna komplikacja dla małej grupy
  - Priorytet dodania: **Niski**

- ❌ **Lista aktywnych linków zaproszeniowych**
  - Oryginalne wymaganie: Admin widzi wszystkie aktywne linki
  - Dlaczego wyrzucone: MVP = 1 link wystarczy
  - Priorytet dodania: **Niski**

- ❌ **Ostrzeżenie przy przekroczeniu 150 członków**
  - Oryginalne wymaganie: Alert dla admina (liczba Dunbara)
  - Dlaczego wyrzucone: MVP = 5-10 osób, daleko od limitu
  - Priorytet dodania: **Bardzo niski**

### 2.3 Przedmioty

**Wyrzucone:**
- ❌ **Edycja przedmiotu**
  - Oryginalne wymaganie: Formularz edycji (zawsze możliwa)
  - Dlaczego wyrzucone: Można usunąć i dodać nowy, wystarczy dla MVP
  - Priorytet dodania: **Wysoki** (podstawowa funkcja)

- ❌ **Usuwanie przedmiotu**
  - Oryginalne wymaganie: Usunięcie (tylko gdy niewypożyczony)
  - Dlaczego wyrzucone: Oznaczanie jako niedostępny wystarczy
  - Priorytet dodania: **Średni**

- ❌ **Stan przedmiotu (nowy/używany/wymaga uwagi)**
  - Oryginalne wymaganie: Dropdown ze stanem
  - Dlaczego wyrzucone: Można opisać w polu "opis"
  - Priorytet dodania: **Niski** (nice to have)

- ❌ **Lokalizacja w osiedlu**
  - Oryginalne wymaganie: Pole tekstowe z lokalizacją (np. "Blok 3, klatka A")
  - Dlaczego wyrzucone: Można przekazać przez czat
  - Priorytet dodania: **Średni** (pomocne przy większej społeczności)

- ❌ **Instrukcje użycia**
  - Oryginalne wymaganie: Pole tekstowe (max 300 znaków)
  - Dlaczego wyrzucone: Można opisać w polu "opis" lub czat
  - Priorytet dodania: **Niski**

- ❌ **Maksymalny okres wypożyczenia**
  - Oryginalne wymaganie: Pole liczbowe (dni), domyślnie 14
  - Dlaczego wyrzucone: Hardcoded 14 dni wystarczy dla MVP
  - Priorytet dodania: **Średni**

- ❌ **Historia wypożyczeń przedmiotu**
  - Oryginalne wymaganie: Widoczna dla właściciela (kto, kiedy, status)
  - Dlaczego wyrzucone: Niepotrzebne dla walidacji MVP
  - Priorytet dodania: **Średni** (przydatne dla statystyk)

- ❌ **Kalendarz dostępności (wizualny)**
  - Oryginalne wymaganie: Interaktywny kalendarz z zablokowanymi datami
  - Dlaczego wyrzucone: Daty jako tekst wystarczą, właściciel sprawdzi ręcznie
  - Priorytet dodania: **Wysoki** (UX improvement)

- ❌ **Data powrotu przy niedostępności**
  - Oryginalne wymaganie: "Dostępny od: DD.MM.YYYY"
  - Dlaczego wyrzucone: Prosty toggle wystarczy
  - Priorytet dodania: **Niski**

### 2.4 Wyszukiwanie i Przeglądanie

**Wyrzucone:**
- ❌ **Filtrowanie przedmiotów**
  - Oryginalne wymaganie: Filtry po dostępności, kategorii (multi-select), właścicielu
  - Dlaczego wyrzucone: 5-10 przedmiotów = przeglądanie listy wystarczy
  - Priorytet dodania: **Wysoki** (przy >20 przedmiotach konieczne)

- ❌ **Sortowanie przedmiotów**
  - Oryginalne wymaganie: Najnowsze, alfabetycznie, najpopularniejsze
  - Dlaczego wyrzucone: Jedna lista = domyślnie najnowsze wystarczy
  - Priorytet dodania: **Średni**

- ❌ **Stronicowanie**
  - Oryginalne wymaganie: 20 przedmiotów na stronę
  - Dlaczego wyrzucone: MVP = max 50 przedmiotów, jedna strona wystarczy
  - Priorytet dodania: **Średni** (przy >50 przedmiotach)

- ❌ **Wyszukiwanie tekstowe**
  - Oryginalne wymaganie: Pole wyszukiwania po nazwie/opisie
  - Dlaczego wyrzucone: Ctrl+F w przeglądarce wystarczy dla MVP
  - Priorytet dodania: **Wysoki** (przy większej liczbie przedmiotów)

### 2.5 Rezerwacje i Wypożyczenia

**Wyrzucone:**
- ❌ **Walidacja kolizji dat**
  - Oryginalne wymaganie: System blokuje nakładające się rezerwacje
  - Dlaczego wyrzucone: Właściciel sprawdzi ręcznie, prostsza implementacja
  - Priorytet dodania: **Wysoki** (konieczne przy większym ruchu)

- ❌ **"Chcę pożyczyć" (kolejka zainteresowanych)**
  - Oryginalne wymaganie: Lista osób zainteresowanych wypożyczonym przedmiotem + powiadomienia
  - Dlaczego wyrzucone: Użytkownik może sprawdzić później, niepotrzebne dla MVP
  - Priorytet dodania: **Średni**

- ❌ **Powiadomienia o zbliżającym się terminie zwrotu**
  - Oryginalne wymaganie: Email 1 dzień przed końcem
  - Dlaczego wyrzucone: Użytkownicy mogą sami śledzić daty
  - Priorytet dodania: **Wysoki** (bardzo przydatne)

- ❌ **Automatyczne przypomnienia po terminie**
  - Oryginalne wymaganie: Email dzień po terminie, eskalacje po 3 i 7 dniach
  - Dlaczego wyrzucone: Mała grupa zaufanych osób
  - Priorytet dodania: **Średni**

- ❌ **Status "Spóźnione"**
  - Oryginalne wymaganie: Automatyczna zmiana statusu po przekroczeniu terminu
  - Dlaczego wyrzucone: Niepotrzebne bez automatycznych przypomnień
  - Priorytet dodania: **Niski**

- ❌ **Eskalacje do administratora**
  - Oryginalne wymaganie: Powiadomienie admina po 3 dniach, zgłoszenie po 7 dniach
  - Dlaczego wyrzucone: Mała grupa, admin = właściciel
  - Priorytet dodania: **Niski** (dopiero przy większej społeczności)

### 2.6 Komunikacja

**Wyrzucone:**
- ❌ **Tablica ogłoszeń społeczności**
  - Oryginalne wymaganie: Publiczny feed wiadomości (polling co 5s)
  - Dlaczego wyrzucone: Czat 1-1 wystarczy dla małej grupy
  - Priorytet dodania: **Wysoki** (budowanie community)

- ❌ **Prośby "Szukam..." (Request Board)**
  - Oryginalne wymaganie: Formularz prośby o przedmiot + przycisk "Ja mam!"
  - Dlaczego wyrzucone: Użytkownik może napisać na czacie do wszystkich (gdy będzie tablica)
  - Priorytet dodania: **Średni**

- ❌ **Zgłoszenia nieprawidłowości**
  - Oryginalne wymaganie: Przycisk "Zgłoś" przy przedmiotach/wiadomościach/profilach
  - Dlaczego wyrzucone: Mała grupa zaufanych osób
  - Priorytet dodania: **Niski** (dopiero przy >50 użytkownikach)

- ❌ **Oznaczanie wiadomości jako przeczytane**
  - Oryginalne wymaganie: Badge "nieprzeczytane", automatyczne oznaczanie
  - Dlaczego wyrzucone: Niepotrzebna komplikacja dla MVP
  - Priorytet dodania: **Średni** (UX improvement)

- ❌ **Powiadomienia w czasie rzeczywistym (polling/WebSockets)**
  - Oryginalne wymaganie: Automatyczne odświeżanie czatu/tablicy
  - Dlaczego wyrzucone: Manualne odświeżanie wystarczy dla MVP
  - Priorytet dodania: **Średni** (lepsze UX)

### 2.7 System Reputacji

**Wyrzucone CAŁKOWICIE:**
- ❌ **Punkty reputacji**
  - Oryginalne wymaganie: +10 za zwrot na czas, +5 za wypożyczenie, +15 za dodanie przedmiotu
  - Dlaczego wyrzucone: Gamifikacja niepotrzebna do walidacji MVP
  - Priorytet dodania: **Średni** (motywacja użytkowników)

- ❌ **Odznaki (Pomocny/Dobry/Super Sąsiad)**
  - Oryginalne wymaganie: Automatyczne odznaki po osiągnięciu progów
  - Dlaczego wyrzucone: Niepotrzebna komplikacja
  - Priorytet dodania: **Niski**

- ❌ **Ranking użytkowników**
  - Oryginalne wymaganie: Top 3 w sidebarze, pełny ranking na stronie
  - Dlaczego wyrzucone: Gamifikacja niepotrzebna dla MVP
  - Priorytet dodania: **Niski**

- ❌ **Historia punktów**
  - Oryginalne wymaganie: Ostatnie 10 transakcji punktowych
  - Dlaczego wyrzucone: Brak systemu punktów
  - Priorytet dodania: **Bardzo niski**

### 2.8 Profile Użytkownika

**Wyrzucone:**
- ❌ **Opis "O mnie"**
  - Oryginalne wymaganie: Pole tekstowe (max 500 znaków)
  - Dlaczego wyrzucone: Niepotrzebne dla małej grupy (wszyscy się znają)
  - Priorytet dodania: **Niski**

- ❌ **Lokalizacja w osiedlu**
  - Oryginalne wymaganie: "Blok 3, klatka A"
  - Dlaczego wyrzucone: Można przekazać przez czat
  - Priorytet dodania: **Niski**

- ❌ **Statystyki użytkownika**
  - Oryginalne wymaganie: Liczba przedmiotów, wypożyczeń, % zwrotów na czas
  - Dlaczego wyrzucone: Niepotrzebne dla walidacji MVP
  - Priorytet dodania: **Średni** (ciekawe insights)

- ❌ **Procent zwrotów na czas**
  - Oryginalne wymaganie: Badge "95% zwrotów na czas"
  - Dlaczego wyrzucone: Gamifikacja niepotrzebna
  - Priorytet dodania: **Niski**

- ❌ **Usuwanie konta przez UI**
  - Oryginalne wymaganie: Opcja w ustawieniach + anonimizacja danych
  - Dlaczego wyrzucone: Admin może usunąć ręcznie dla MVP
  - Priorytet dodania: **Średni** (RODO compliance)

### 2.9 Dashboard

**Wyrzucone:**
- ❌ **Sidebar z tablicą ogłoszeń**
  - Oryginalne wymaganie: Sidebar z live feed (polling co 5s)
  - Dlaczego wyrzucone: Brak tablicy ogłoszeń
  - Priorytet dodania: **Wysoki** (gdy dodamy tablicę)

- ❌ **Top 3 ranking w sidebarze**
  - Oryginalne wymaganie: Mini-ranking najbardziej pomocnych sąsiadów
  - Dlaczego wyrzucone: Brak systemu reputacji
  - Priorytet dodania: **Niski**

- ❌ **"Ostatnio dodane przedmioty" (5 najnowszych)**
  - Oryginalne wymaganie: Sekcja z kafelkami przedmiotów
  - Dlaczego wyrzucone: Niepotrzebne, jest pełna lista
  - Priorytet dodania: **Niski**

- ❌ **Przycisk "🔍 Szukam czegoś"**
  - Oryginalne wymaganie: Szybka akcja do stworzenia prośby
  - Dlaczego wyrzucone: Brak feature "Szukam..."
  - Priorytet dodania: **Średni**

### 2.10 Powiadomienia

**Wyrzucone:**
- ❌ **Push notifications (PWA)**
  - Oryginalne wymaganie: Service worker + Web Push API
  - Dlaczego wyrzucone: Email wystarczy dla MVP, duża komplikacja
  - Priorytet dodania: **Średni** (lepsze UX)

- ❌ **Powiadomienie o zwrocie przedmiotu**
  - Oryginalne wymaganie: Email do wypożyczającego "Dziękujemy za zwrot"
  - Dlaczego wyrzucone: Niepotrzebne (jest już email w US-010)
  - Priorytet dodania: **Bardzo niski**

- ❌ **Przypomnienia (automatyczne)**
  - Oryginalne wymaganie: Email przed terminem, po terminie
  - Dlaczego wyrzucone: Zobacz sekcja Rezerwacje
  - Priorytet dodania: **Wysoki**

- ❌ **Preferencje powiadomień (wszystkie/ważne/wyłączone)**
  - Oryginalne wymaganie: Panel ustawień powiadomień
  - Dlaczego wyrzucone: Tylko 4 typy emaili, prosta opcja wyłączenia czatu wystarczy
  - Priorytet dodania: **Niski**

### 2.11 Onboarding

**Wyrzucone:**
- ❌ **3-krokowy wizard dla nowego użytkownika**
  - Oryginalne wymaganie: "Witamy" → "Dołącz do społeczności" → "Dodaj przedmiot"
  - Dlaczego wyrzucone: Prosta strona startowa wystarczy
  - Priorytet dodania: **Niski** (nice to have)

- ❌ **Email przewodnik dla administratora**
  - Oryginalne wymaganie: Email z tips & tricks po założeniu społeczności
  - Dlaczego wyrzucone: Niepotrzebne dla MVP
  - Priorytet dodania: **Bardzo niski**

### 2.12 Inne

**Wyrzucone:**
- ❌ **Tryb ciemny (dark mode)**
  - Oryginalne wymaganie: Toggle light/dark theme
  - Dlaczego wyrzucone: Estetyka, niepotrzebna do walidacji
  - Priorytet dodania: **Niski**

- ❌ **Zaawansowany analytics (Google Analytics)**
  - Oryginalne wymaganie: Tracking page views, events
  - Dlaczego wyrzucone: Basic logs wystarczą dla MVP
  - Priorytet dodania: **Średni** (insights do dalszego rozwoju)

- ❌ **Użytkownik w wielu społecznościach**
  - Oryginalne wymaganie: Join multiple communities
  - Dlaczego wyrzucone: MVP = 1 społeczność
  - Priorytet dodania: **Wysoki** (scaling feature)

- ❌ **Eksport danych użytkownika**
  - Oryginalne wymaganie: RODO compliance - download my data
  - Dlaczego wyrzucone: Admin może wyciągnąć z bazy
  - Priorytet dodania: **Niski** (RODO nice to have)

- ❌ **Wersje językowe (i18n)**
  - Oryginalne wymaganie: Tylko polski w MVP
  - Dlaczego wyrzucone: MVP = polska społeczność
  - Priorytet dodania: **Bardzo niski** (jeśli skalowanie międzynarodowe)

- ❌ **SignalR / WebSockets**
  - Oryginalne wymaganie: Real-time communication
  - Dlaczego wyrzucone: Manualne odświeżanie wystarczy
  - Priorytet dodania: **Średni** (dla czatu real-time)

- ❌ **System mediacji konfliktów**
  - Oryginalne wymaganie: Flow rozwiązywania sporów
  - Dlaczego wyrzucone: Mała grupa zaufanych osób
  - Priorytet dodania: **Niski** (dopiero przy większej społeczności)

- ❌ **Ubezpieczenia przedmiotów**
  - Oryginalne wymaganie: Integracja z ubezpieczeniami
  - Dlaczego wyrzucone: Zbyt skomplikowane, out of scope nawet dla full product
  - Priorytet dodania: **Bardzo niski**

- ❌ **Integracja z lokalnymi biznesami**
  - Oryginalne wymaganie: Partnerstwa z sklepami
  - Dlaczego wyrzucone: Out of scope dla MVP
  - Priorytet dodania: **Bardzo niski**

- ❌ **System kaucji/zabezpieczeń finansowych**
  - Oryginalne wymaganie: Płatności online, kaucje
  - Dlaczego wyrzucone: Bezpłatna aplikacja, out of scope
  - Priorytet dodania: **Bardzo niski**

- ❌ **Weryfikacja tożsamości użytkowników**
  - Oryginalne wymaganie: ID verification, KYC
  - Dlaczego wyrzucone: Mała grupa zaufanych osób
  - Priorytet dodania: **Bardzo niski**

---

## 3. Roadmap post-MVP (jeśli walidacja sukces)

Ten roadmap zakłada, że **Micro-MVP osiągnął sukces** (wszystkie metryki z sekcji 6.2 spełnione).

### 3.1 Priorytet 1 - Quick Wins (2-3 tygodnie)

**Cel:** Poprawić UX na podstawie feedbacku z testów MVP

1. **Filtry i sortowanie przedmiotów**
   - Filtr po kategorii (multi-select)
   - Sortowanie: najnowsze, alfabetycznie, najpopularniejsze
   - Szacowany czas: 3 dni

2. **Kalendarz dostępności (wizualny)**
   - Interaktywny kalendarz z zablokowanymi datami
   - Walidacja kolizji dat
   - Szacowany czas: 5 dni

3. **Potwierdzenie email przy rejestracji**
   - Email weryfikacyjny z tokenem 24h
   - Szacowany czas: 2 dni

4. **Reset hasła przez UI**
   - Link resetujący z tokenem 1h
   - Szacowany czas: 2 dni

5. **Powiadomienia o zbliżającym się terminie zwrotu**
   - Email 1 dzień przed końcem
   - Email dzień po terminie
   - Szacowany czas: 2 dni

**Total: ~14 dni (2 tygodnie)**

### 3.2 Priorytet 2 - Community Features (3-4 tygodnie)

**Cel:** Budowanie zaangażowania społeczności

6. **System reputacji i odznaki**
   - Punkty za akcje (+10, +5, +15)
   - 3 odznaki (Pomocny/Dobry/Super Sąsiad)
   - Wyświetlanie w profilu
   - Szacowany czas: 5 dni

7. **Google OAuth**
   - Logowanie przez Google
   - Szacowany czas: 2 dni

8. **Tablica ogłoszeń społeczności**
   - Publiczny feed wiadomości
   - Polling co 5s (lub WebSockets)
   - Szacowany czas: 5 dni

9. **Edycja przedmiotów**
   - Formularz edycji wszystkich pól
   - Szacowany czas: 2 dni

10. **Historia wypożyczeń**
    - Widoczna dla właściciela przedmiotu
    - Statystyki (liczba wypożyczeń, % na czas)
    - Szacowany czas: 3 dni

**Total: ~17 dni (3.5 tygodnia)**

### 3.3 Priorytet 3 - Advanced Features (4-6 tygodni)

**Cel:** Zaawansowane funkcje dla rosnącej społeczności

11. **"Szukam..." (Request Board)**
    - Formularz prośby o przedmiot
    - Przycisk "Ja mam!" → czat 1-1
    - Szacowany czas: 4 dni

12. **Powiadomienia push (PWA)**
    - Service worker + Web Push API
    - Szacowany czas: 5 dni

13. **Ranking użytkowników**
    - Top 3 w sidebarze
    - Pełny ranking na stronie
    - Szacowany czas: 3 dni

14. **Zgłoszenia nieprawidłowości**
    - Przycisk "Zgłoś" + panel administracyjny
    - Szacowany czas: 4 dni

15. **Zaawansowane zarządzanie społecznością**
    - Usuwanie członków
    - Opuszczanie społeczności
    - Role i uprawnienia
    - Szacowany czas: 5 dni

16. **Wyszukiwanie tekstowe**
    - Full-text search po nazwie/opisie
    - Szacowany czas: 3 dni

17. **Statystyki użytkownika w profilu**
    - Liczba przedmiotów, wypożyczeń, % zwrotów na czas
    - Szacowany czas: 2 dni

18. **WebSockets dla czatu real-time**
    - SignalR integration
    - Oznaczanie jako przeczytane
    - Szacowany czas: 5 dni

**Total: ~31 dni (6 tygodni)**

### 3.4 Priorytet 4 - Scaling Features (długoterminowe)

**Cel:** Skalowanie produktu dla wielu społeczności

19. **Użytkownik w wielu społecznościach**
    - Zmiana modelu danych
    - Przełączanie między społecznościami
    - Szacowany czas: 2 tygodnie

20. **Aplikacja mobilna natywna (iOS/Android)**
    - React Native lub osobne native apps
    - Szacowany czas: 3-6 miesięcy

21. **Tryb ciemny**
    - Dark theme + toggle
    - Szacowany czas: 1 tydzień

22. **Google Analytics / Advanced Analytics**
    - Tracking events, funnels
    - Szacowany czas: 3 dni

23. **i18n (wersje językowe)**
    - Angielski, niemiecki (?)
    - Szacowany czas: 2 tygodnie

---

## 4. Nie-cele (Out of scope nawet dla full product)

Te funkcje **NIE będą dodane** nawet jeśli produkt osiągnie sukces, ponieważ:
- Wykraczają poza core value proposition
- Zbyt skomplikowane
- Niski zwrot z inwestycji

### 4.1 Produktowe

**NIE budujemy:**
- ❌ **Produkt gotowy do skalowania na miliony użytkowników**
  - Architektura jest OK dla 1000-10000 użytkowników
  - Skalowanie powyżej wymaga redesign (microservices, etc.)

- ❌ **Platforma z zaawansowaną gamifikacją**
  - Podstawowa reputacja TAK, ale nie leaderboards globalne, achievements, itp.

- ❌ **System z integracjami zewnętrznymi**
  - Brak planów na integrację z Facebook, Instagram, etc.

- ❌ **Marketplace (kupno/sprzedaż przedmiotów)**
  - To jest sharing economy, nie e-commerce
  - Bezpłatna aplikacja pozostaje bezpłatna

### 4.2 Finansowe

**NIE dodajemy:**
- ❌ **System kaucji/zabezpieczeń finansowych**
  - Płatności online, stripe integration
  - Wymagałoby licencji finansowych, compliance

- ❌ **Ubezpieczenia przedmiotów**
  - Integracja z ubezpieczycielami
  - Zbyt skomplikowane prawnie

- ❌ **Monetyzacja (premium features, reklamy)**
  - Aplikacja ma pozostać darmowa dla użytkowników
  - Możliwe: donations, sponsorships w przyszłości

### 4.3 Prawne/Compliance

**NIE dodajemy:**
- ❌ **Weryfikacja tożsamości użytkowników (KYC)**
  - Zbyt drogie dla darmowej aplikacji
  - Użytkownicy mogą weryfikować się sami w ramach społeczności

- ❌ **System mediacji konfliktów (formalny)**
  - Brak zasobów na zespół support
  - Konflikty rozwiązywane przez administratorów społeczności

### 4.4 Techniczne

**NIE budujemy:**
- ❌ **Blockchain/NFT/Web3 features**
  - Niepotrzebna komplikacja, buzzword bingo

- ❌ **AI/ML recommendations**
  - Za drogie dla małej skali
  - Prosty search wystarczy

- ❌ **Voice/video calls w aplikacji**
  - Użytkownicy mogą użyć telefonu/WhatsApp/Zoom
  - Zbyt drogie w utrzymaniu

---

## 5. Criteria for adding features

**Kiedy rozważać dodanie funkcji z tego dokumentu?**

### 5.1 Metryki progowe

Funkcja może być dodana jeśli:

1. **Adoption metrics:**
   - 50+ aktywnych użytkowników w jednej społeczności
   - LUB 3+ aktywne społeczności
   - LUB 100+ przedmiotów w platformie

2. **Engagement metrics:**
   - 50+ wypożyczeń miesięcznie
   - 80%+ retention (monthly active users)
   - 10+ wiadomości/czatów dziennie

3. **User feedback:**
   - 5+ użytkowników prosi o tę funkcję (user research)
   - Feature jest w top 3 most requested
   - Brak workaround (nie da się obejść inaczej)

### 5.2 Decision framework

**Pytania przy decyzji o dodaniu feature:**

1. **Czy rozwiązuje realny problem użytkowników?**
   - Jeśli TAK → rozważ
   - Jeśli NIE → odrzuć

2. **Czy użytkownicy będą z tego korzystać?**
   - Czy mamy dowody (feedback, analytics)?
   - Jeśli niepewne → zrób user research

3. **Jaki jest effort vs impact?**
   - Wysoki impact + niski effort = **DO IT**
   - Niski impact + wysoki effort = **NO**
   - Wysoki impact + wysoki effort = rozważ, podziel na mniejsze kawałki

4. **Czy to pasuje do core value proposition?**
   - Aplikacja do wypożyczania przedmiotów między sąsiadami
   - Jeśli odchodzi od core → nie dodawaj

---

## 6. Summary

**Liczba wyrzuconych funkcji z MVP: ~70 features**

**Roadmap post-MVP:**
- Priorytet 1: 5 funkcji (2 tygodnie)
- Priorytet 2: 5 funkcji (3.5 tygodnia)
- Priorytet 3: 8 funkcji (6 tygodni)
- Priorytet 4: 5 funkcji (długoterminowe)

**Total: ~23 funkcje w roadmap** (z ~70 wyrzuconych)

**Nie-cele: ~15 funkcji permanentnie out of scope**

---

**Końcowa uwaga:**
> "The art of being wise is the art of knowing what to overlook." - William James

MVP to nie okrojona wersja produktu, to najmniejszy produkt, który dostarcza wartość i pozwala się uczyć.

---

**Koniec dokumentu**
Wersja: 0.1 Micro-MVP
Data: 2026-01-10
Status: Ready for Implementation (post-MVP planning)

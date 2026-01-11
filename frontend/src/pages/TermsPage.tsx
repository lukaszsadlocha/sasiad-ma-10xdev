import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-8">
        <div className="mb-8">
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Powrót do strony głównej
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Regulamin Serwisu Sąsiad-Ma
        </h1>

        <p className="text-sm text-gray-600 mb-8">
          Data ostatniej aktualizacji: {new Date().toLocaleDateString('pl-PL')}
        </p>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              § 1. Postanowienia ogólne
            </h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Niniejszy Regulamin określa zasady korzystania z aplikacji
                internetowej Sąsiad-Ma (dalej: „Aplikacja" lub „Serwis").
              </li>
              <li>
                Administratorem Aplikacji jest właściciel Serwisu, zwany dalej
                „Administratorem".
              </li>
              <li>
                Korzystanie z Aplikacji jest równoznaczne z akceptacją
                niniejszego Regulaminu oraz Polityki Prywatności.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              § 2. Definicje
            </h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                <strong>Użytkownik</strong> – osoba korzystająca z Aplikacji po
                dokonaniu rejestracji.
              </li>
              <li>
                <strong>Społeczność</strong> – grupa Użytkowników z tego samego
                osiedla lub okolicy, którzy mogą wymieniać się przedmiotami.
              </li>
              <li>
                <strong>Przedmiot</strong> – rzecz dodana przez Użytkownika w
                celu udostępnienia innym członkom społeczności.
              </li>
              <li>
                <strong>Rezerwacja</strong> – prośba o wypożyczenie przedmiotu
                na określony czas.
              </li>
              <li>
                <strong>Wypożyczenie</strong> – fizyczne przekazanie przedmiotu
                po zaakceptowaniu rezerwacji.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              § 3. Rejestracja i konto użytkownika
            </h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Rejestracja w Aplikacji wymaga podania adresu e-mail, hasła
                oraz imienia lub preferowanej nazwy.
              </li>
              <li>
                Użytkownik zobowiązuje się do podania prawdziwych danych oraz
                zachowania hasła w tajemnicy.
              </li>
              <li>
                Użytkownik może należeć tylko do jednej społeczności w ramach
                wersji Micro-MVP.
              </li>
              <li>
                Użytkownik ponosi odpowiedzialność za wszelkie działania
                wykonane z jego konta.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              § 4. Społeczności
            </h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Każdy Użytkownik może utworzyć społeczność lub dołączyć do
                istniejącej za pomocą linku zaproszeniowego.
              </li>
              <li>
                Twórca społeczności pełni rolę administratora i może generować
                linki zaproszeniowe.
              </li>
              <li>
                Społeczność ma charakter lokalny i powinna skupiać osoby z tego
                samego osiedla lub okolicy.
              </li>
              <li>
                Administrator zastrzega sobie prawo do usunięcia społeczności
                naruszającej Regulamin.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              § 5. Dodawanie przedmiotów
            </h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Użytkownik może dodawać przedmioty, które chce udostępnić innym
                członkom swojej społeczności.
              </li>
              <li>
                Każdy przedmiot musi zawierać: nazwę, kategorię, opis oraz
                opcjonalnie zdjęcie.
              </li>
              <li>
                Użytkownik ponosi pełną odpowiedzialność za stan techniczny i
                bezpieczeństwo udostępnianego przedmiotu.
              </li>
              <li>
                Zabrania się dodawania przedmiotów nielegalnych, niebezpiecznych
                lub naruszających prawa osób trzecich.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              § 6. Rezerwacje i wypożyczenia
            </h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Użytkownik może zarezerwować przedmiot na okres maksymalnie 14
                dni.
              </li>
              <li>
                Właściciel przedmiotu ma prawo zaakceptować lub odrzucić
                rezerwację.
              </li>
              <li>
                Szczegóły wypożyczenia (miejsce, godzina przekazania) ustalane
                są bezpośrednio między użytkownikami przez wiadomości.
              </li>
              <li>
                Właściciel potwierdza przekazanie przedmiotu w Aplikacji, co
                zmienia status na „W trakcie wypożyczenia".
              </li>
              <li>
                Po zwrocie przedmiotu właściciel potwierdza zwrot w Aplikacji.
              </li>
              <li>
                Wypożyczenia odbywają się bezpłatnie. Wszelkie opłaty lub
                kaucje ustalane są prywatnie między użytkownikami.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              § 7. Odpowiedzialność
            </h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Aplikacja pełni wyłącznie rolę platformy łączącej użytkowników.
                Administrator nie ponosi odpowiedzialności za:
                <ul className="list-disc list-inside ml-6 mt-1">
                  <li>Stan techniczny i bezpieczeństwo przedmiotów</li>
                  <li>Szkody powstałe w wyniku korzystania z przedmiotów</li>
                  <li>Niespełnienie zobowiązań przez użytkowników</li>
                  <li>Utratę lub uszkodzenie przedmiotów</li>
                </ul>
              </li>
              <li>
                Użytkownicy ponoszą pełną odpowiedzialność za przedmioty, które
                wypożyczają lub pożyczają.
              </li>
              <li>
                Zaleca się, aby użytkownicy posiadali odpowiednie ubezpieczenie
                OC.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              § 8. Zasady komunikacji
            </h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Użytkownicy zobowiązują się do kultury i szacunku w komunikacji.
              </li>
              <li>
                Zabrania się:
                <ul className="list-disc list-inside ml-6 mt-1">
                  <li>Używania wulgarnego lub obraźliwego języka</li>
                  <li>Nękania innych użytkowników</li>
                  <li>Wysyłania spamu lub niechcianych wiadomości</li>
                  <li>Publikowania treści niezgodnych z prawem</li>
                </ul>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              § 9. Powiadomienia e-mail
            </h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Aplikacja wysyła powiadomienia e-mail o nowych rezerwacjach,
                akceptacjach, odrzuceniach oraz wiadomościach.
              </li>
              <li>
                Użytkownik może wyłączyć powiadomienia o wiadomościach w
                ustawieniach profilu.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              § 10. Usunięcie konta
            </h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Użytkownik może w każdej chwili złożyć wniosek o usunięcie
                konta kontaktując się z Administratorem.
              </li>
              <li>
                Przed usunięciem konta Użytkownik zobowiązany jest do
                zakończenia wszystkich aktywnych wypożyczeń.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              § 11. Zmiany w Regulaminie
            </h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Administrator zastrzega sobie prawo do wprowadzania zmian w
                Regulaminie.
              </li>
              <li>
                O zmianach Użytkownicy zostaną poinformowani z 7-dniowym
                wyprzedzeniem przez powiadomienie w Aplikacji lub e-mailem.
              </li>
              <li>
                Dalsze korzystanie z Aplikacji po wejściu zmian w życie
                oznacza akceptację nowego Regulaminu.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              § 12. Postanowienia końcowe
            </h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                W sprawach nieuregulowanych niniejszym Regulaminem zastosowanie
                mają przepisy prawa polskiego.
              </li>
              <li>
                Wszelkie spory rozstrzygane będą przez sąd właściwy dla siedziby
                Administratora.
              </li>
              <li>
                Niniejszy Regulamin wchodzi w życie z dniem publikacji.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              § 13. Kontakt
            </h2>
            <p>
              W przypadku pytań dotyczących Regulaminu, skontaktuj się z nami
              przez e-mail: contact@sasiad-ma.pl (adres przykładowy).
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Akceptując Regulamin, potwierdzasz, że zapoznałeś się z jego treścią
            oraz{' '}
            <Link
              to="/privacy-policy"
              className="text-blue-600 hover:text-blue-800"
            >
              Polityką Prywatności
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

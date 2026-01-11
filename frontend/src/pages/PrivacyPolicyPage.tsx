import { Link } from 'react-router-dom';

export default function PrivacyPolicyPage() {
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
          Polityka Prywatności
        </h1>

        <p className="text-sm text-gray-600 mb-8">
          Data ostatniej aktualizacji: {new Date().toLocaleDateString('pl-PL')}
        </p>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              1. Informacje ogólne
            </h2>
            <p>
              Niniejsza Polityka Prywatności określa zasady przetwarzania i
              ochrony danych osobowych użytkowników aplikacji Sąsiad-Ma
              (dalej: „Aplikacja"). Administratorem danych osobowych jest
              właściciel Aplikacji.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              2. Jakie dane zbieramy
            </h2>
            <p>W ramach korzystania z Aplikacji zbieramy następujące dane:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Adres e-mail (wymagany do rejestracji)</li>
              <li>Imię lub preferowana nazwa (wymagane)</li>
              <li>Awatar (opcjonalny)</li>
              <li>
                Informacje o przedmiotach dodanych do wypożyczenia (nazwa,
                kategoria, opis, zdjęcie)
              </li>
              <li>
                Dane dotyczące rezerwacji i wypożyczeń (daty, notatki, statusy)
              </li>
              <li>Wiadomości wymieniane z innymi użytkownikami</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              3. Cel przetwarzania danych
            </h2>
            <p>Dane osobowe przetwarzane są w celu:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                Umożliwienia korzystania z funkcjonalności Aplikacji
                (wypożyczanie przedmiotów)
              </li>
              <li>Tworzenia i zarządzania kontem użytkownika</li>
              <li>Komunikacji między użytkownikami w ramach społeczności</li>
              <li>
                Wysyłania powiadomień e-mail związanych z działalnością w
                Aplikacji
              </li>
              <li>
                Zapewnienia bezpieczeństwa i przeciwdziałania nadużyciom
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              4. Podstawa prawna przetwarzania
            </h2>
            <p>
              Przetwarzanie danych osobowych odbywa się na podstawie:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Zgody użytkownika (art. 6 ust. 1 lit. a RODO)</li>
              <li>
                Wykonania umowy (art. 6 ust. 1 lit. b RODO) - świadczenie
                usług Aplikacji
              </li>
              <li>
                Prawnie uzasadnionego interesu administratora (art. 6 ust. 1
                lit. f RODO) - zapewnienie bezpieczeństwa
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              5. Udostępnianie danych
            </h2>
            <p>
              Twoje dane osobowe mogą być udostępniane innym użytkownikom tej
              samej społeczności w zakresie niezbędnym do funkcjonowania
              Aplikacji (imię, awatar, informacje o przedmiotach).
            </p>
            <p className="mt-2">
              Dane nie są przekazywane podmiotom trzecim poza dostawcami usług
              technicznych (hosting, baza danych, e-mail), którzy działają na
              podstawie umów powierzenia przetwarzania danych.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              6. Okres przechowywania danych
            </h2>
            <p>
              Dane osobowe przechowywane są przez okres niezbędny do
              realizacji celów przetwarzania, tj. do momentu usunięcia konta
              użytkownika.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              7. Twoje prawa
            </h2>
            <p>
              Zgodnie z RODO przysługują Ci następujące prawa:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Prawo dostępu do swoich danych osobowych</li>
              <li>Prawo do sprostowania danych</li>
              <li>Prawo do usunięcia danych („prawo do bycia zapomnianym")</li>
              <li>Prawo do ograniczenia przetwarzania</li>
              <li>Prawo do przenoszenia danych</li>
              <li>Prawo do sprzeciwu wobec przetwarzania</li>
              <li>Prawo do cofnięcia zgody w dowolnym momencie</li>
            </ul>
            <p className="mt-3">
              W celu skorzystania z powyższych praw, skontaktuj się z nami
              przez funkcję profilu w Aplikacji lub przez e-mail podany w
              Regulaminie.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              8. Pliki cookies
            </h2>
            <p>
              Aplikacja wykorzystuje pliki cookies do przechowywania tokena
              uwierzytelniającego oraz zapewnienia prawidłowego działania.
              Możesz zarządzać plikami cookies w ustawieniach przeglądarki.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              9. Bezpieczeństwo
            </h2>
            <p>
              Stosujemy odpowiednie środki techniczne i organizacyjne w celu
              ochrony Twoich danych osobowych przed nieuprawnionym dostępem,
              utratą lub zniszczeniem.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              10. Kontakt
            </h2>
            <p>
              W przypadku pytań dotyczących niniejszej Polityki Prywatności
              lub przetwarzania Twoich danych osobowych, skontaktuj się z nami
              przez e-mail: privacy@sasiad-ma.pl (adres przykładowy).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              11. Zmiany w Polityce Prywatności
            </h2>
            <p>
              Zastrzegamy sobie prawo do wprowadzania zmian w niniejszej
              Polityce Prywatności. O wszelkich zmianach użytkownicy zostaną
              poinformowani przez powiadomienie w Aplikacji lub e-mailem.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Niniejsza Polityka Prywatności jest zgodna z wymogami RODO
            (Rozporządzenie Parlamentu Europejskiego i Rady (UE) 2016/679).
          </p>
        </div>
      </div>
    </div>
  );
}

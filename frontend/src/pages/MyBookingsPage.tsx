import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingApi } from '../lib/api';
import { Booking, BookingStatus } from '../types';

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingApi.getMyBookings();
      setBookings(data);
    } catch (err: any) {
      setError(err.message || 'Nie udało się pobrać rezerwacji');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.Pending:
        return 'Oczekujące';
      case BookingStatus.Approved:
        return 'Zatwierdzone';
      case BookingStatus.Rejected:
        return 'Odrzucone';
      case BookingStatus.InProgress:
        return 'W trakcie';
      case BookingStatus.Returned:
        return 'Zwrócone';
      default:
        return 'Nieznane';
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.Pending:
        return 'bg-yellow-100 text-yellow-800';
      case BookingStatus.Approved:
        return 'bg-blue-100 text-blue-800';
      case BookingStatus.Rejected:
        return 'bg-red-100 text-red-800';
      case BookingStatus.InProgress:
        return 'bg-orange-100 text-orange-800';
      case BookingStatus.Returned:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusMessage = (booking: Booking) => {
    switch (booking.status) {
      case BookingStatus.Pending:
        return 'Czekam na odpowiedź właściciela...';
      case BookingStatus.Approved:
        return 'Zatwierdzone! Umów szczegóły z właścicielem.';
      case BookingStatus.Rejected:
        return booking.rejectionReason
          ? `Odrzucone. Powód: ${booking.rejectionReason}`
          : 'Rezerwacja została odrzucona.';
      case BookingStatus.InProgress:
        return `Wypożyczasz od ${new Date(booking.requestedFrom).toLocaleDateString('pl-PL')} do ${new Date(booking.requestedTo).toLocaleDateString('pl-PL')}`;
      case BookingStatus.Returned:
        return '✅ Zwrócone';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-600">Ładowanie rezerwacji...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Moje wypożyczenia</h1>
        <p className="text-gray-600 mt-2">
          {bookings.length === 0
            ? 'Nie masz jeszcze żadnych rezerwacji'
            : `${bookings.length} rezerwacja(e)`}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Brak rezerwacji
          </h3>
          <p className="mt-2 text-gray-600">Przejrzyj dostępne przedmioty</p>
          <button
            onClick={() => navigate('/items')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Przeglądaj przedmioty
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
            >
              <div className="flex gap-4 p-4">
                {/* Item photo */}
                <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                  {booking.itemPhotoUrl ? (
                    <img
                      src={booking.itemPhotoUrl}
                      alt={booking.itemName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Booking info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.itemName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        od {booking.ownerName}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {getStatusLabel(booking.status)}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 mb-2">
                    <p>
                      📅 {new Date(booking.requestedFrom).toLocaleDateString('pl-PL')} -{' '}
                      {new Date(booking.requestedTo).toLocaleDateString('pl-PL')}
                    </p>
                    {booking.borrowerNote && (
                      <p className="mt-1 text-gray-500">
                        Notatka: {booking.borrowerNote}
                      </p>
                    )}
                  </div>

                  <p className="text-sm font-medium text-gray-700">
                    {getStatusMessage(booking)}
                  </p>

                  {/* Action buttons */}
                  {booking.status === BookingStatus.Approved && (
                    <button
                      onClick={() => navigate('/messages')}
                      className="mt-3 text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      💬 Napisz wiadomość
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

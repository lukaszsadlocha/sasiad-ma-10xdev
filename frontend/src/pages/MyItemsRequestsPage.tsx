import { useEffect, useState } from 'react';
import { bookingApi } from '../lib/api';
import { Booking, BookingStatus } from '../types';

interface ModalState {
  type: 'reject' | 'handover' | 'return' | null;
  bookingId: number | null;
  rejectionReason?: string;
}

export default function MyItemsRequestsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({ type: null, bookingId: null });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingApi.getBookingsForMyItems();
      setBookings(data);
    } catch (err: any) {
      setError(err.message || 'Nie udało się pobrać rezerwacji');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId: number) => {
    try {
      setActionLoading(true);
      setError(null);
      await bookingApi.approveBooking(bookingId);
      await loadBookings();
    } catch (err: any) {
      setError(err.message || 'Nie udało się zaakceptować rezerwacji');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (bookingId: number, reason?: string) => {
    try {
      setActionLoading(true);
      setError(null);
      await bookingApi.rejectBooking(bookingId, { reason });
      await loadBookings();
      setModal({ type: null, bookingId: null });
    } catch (err: any) {
      setError(err.message || 'Nie udało się odrzucić rezerwacji');
    } finally {
      setActionLoading(false);
    }
  };

  const handleHandover = async (bookingId: number) => {
    try {
      setActionLoading(true);
      setError(null);
      await bookingApi.confirmHandOver(bookingId);
      await loadBookings();
      setModal({ type: null, bookingId: null });
    } catch (err: any) {
      setError(err.message || 'Nie udało się potwierdzić przekazania');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturn = async (bookingId: number) => {
    try {
      setActionLoading(true);
      setError(null);
      await bookingApi.confirmReturn(bookingId);
      await loadBookings();
      setModal({ type: null, bookingId: null });
    } catch (err: any) {
      setError(err.message || 'Nie udało się potwierdzić zwrotu');
    } finally {
      setActionLoading(false);
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

  const pendingBookings = bookings.filter((b) => b.status === BookingStatus.Pending);
  const approvedBookings = bookings.filter((b) => b.status === BookingStatus.Approved);
  const inProgressBookings = bookings.filter((b) => b.status === BookingStatus.InProgress);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-600">Ładowanie rezerwacji...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Prośby o moje przedmioty</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Pending Requests */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Oczekujące prośby ({pendingBookings.length})
        </h2>
        {pendingBookings.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-600">
            Brak oczekujących próśb
          </div>
        ) : (
          <div className="space-y-4">
            {pendingBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="flex gap-4 p-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    {booking.itemPhotoUrl ? (
                      <img
                        src={booking.itemPhotoUrl}
                        alt={booking.itemName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{booking.itemName}</h3>
                    <p className="text-sm text-gray-600">
                      Prosi: <strong>{booking.borrowerName}</strong>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      📅 {new Date(booking.requestedFrom).toLocaleDateString('pl-PL')} -{' '}
                      {new Date(booking.requestedTo).toLocaleDateString('pl-PL')}
                    </p>
                    {booking.borrowerNote && (
                      <p className="text-sm text-gray-600 mt-2">
                        💬 {booking.borrowerNote}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleApprove(booking.id)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      ✓ Akceptuj
                    </button>
                    <button
                      onClick={() => setModal({ type: 'reject', bookingId: booking.id })}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      ✗ Odrzuć
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approved - Awaiting Handover */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Zatwierdzone - oczekują na przekazanie ({approvedBookings.length})
        </h2>
        {approvedBookings.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-600">
            Brak zatwierdzonych rezerwacji
          </div>
        ) : (
          <div className="space-y-4">
            {approvedBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="flex gap-4 p-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    {booking.itemPhotoUrl ? (
                      <img
                        src={booking.itemPhotoUrl}
                        alt={booking.itemName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{booking.itemName}</h3>
                    <p className="text-sm text-gray-600">
                      Wypożyczający: <strong>{booking.borrowerName}</strong>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      📅 {new Date(booking.requestedFrom).toLocaleDateString('pl-PL')} -{' '}
                      {new Date(booking.requestedTo).toLocaleDateString('pl-PL')}
                    </p>
                  </div>

                  <div className="flex-shrink-0">
                    <button
                      onClick={() => setModal({ type: 'handover', bookingId: booking.id })}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      Potwierdź przekazanie
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* In Progress */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          W trakcie wypożyczenia ({inProgressBookings.length})
        </h2>
        {inProgressBookings.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-600">
            Brak aktywnych wypożyczeń
          </div>
        ) : (
          <div className="space-y-4">
            {inProgressBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="flex gap-4 p-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    {booking.itemPhotoUrl ? (
                      <img
                        src={booking.itemPhotoUrl}
                        alt={booking.itemName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{booking.itemName}</h3>
                    <p className="text-sm text-gray-600">
                      U: <strong>{booking.borrowerName}</strong>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      📅 Od {new Date(booking.requestedFrom).toLocaleDateString('pl-PL')}
                      {booking.handedOverAt && (
                        <span> • Przekazano: {new Date(booking.handedOverAt).toLocaleDateString('pl-PL')}</span>
                      )}
                    </p>
                  </div>

                  <div className="flex-shrink-0">
                    <button
                      onClick={() => setModal({ type: 'return', bookingId: booking.id })}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                    >
                      Potwierdź zwrot
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {modal.type === 'reject' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold mb-4">Czy chcesz odrzucić tę rezerwację?</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Powód odrzucenia (opcjonalny)
              </label>
              <textarea
                id="rejectionReason"
                maxLength={200}
                placeholder="np. Przedmiot już zarezerwowany"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setModal({ type: null, bookingId: null })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={actionLoading}
              >
                Anuluj
              </button>
              <button
                onClick={() => {
                  const reason = (document.getElementById('rejectionReason') as HTMLTextAreaElement)?.value;
                  handleReject(modal.bookingId!, reason);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                disabled={actionLoading}
              >
                {actionLoading ? 'Odrzucam...' : 'Odrzuć'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Handover Confirmation Modal */}
      {modal.type === 'handover' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold mb-4">
              Czy na pewno przekazałeś przedmiot?
            </h3>
            <p className="text-gray-600 mb-6">
              Po potwierdzeniu, przedmiot zostanie oznaczony jako "Wypożyczony".
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setModal({ type: null, bookingId: null })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={actionLoading}
              >
                Anuluj
              </button>
              <button
                onClick={() => handleHandover(modal.bookingId!)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={actionLoading}
              >
                {actionLoading ? 'Potwierdzam...' : 'Potwierdź'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Confirmation Modal */}
      {modal.type === 'return' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold mb-4">
              Czy przedmiot został zwrócony?
            </h3>
            <p className="text-gray-600 mb-6">
              Po potwierdzeniu, przedmiot zostanie ponownie dostępny do rezerwacji.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setModal({ type: null, bookingId: null })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={actionLoading}
              >
                Anuluj
              </button>
              <button
                onClick={() => handleReturn(modal.bookingId!)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                disabled={actionLoading}
              >
                {actionLoading ? 'Potwierdzam...' : 'Potwierdź'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

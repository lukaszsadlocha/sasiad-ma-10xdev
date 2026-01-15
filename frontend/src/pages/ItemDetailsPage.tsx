import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { itemApi } from '../lib/api';
import { Item, ItemStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';
import BookingModal from '../components/bookings/BookingModal';

export default function ItemDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const loadItem = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await itemApi.getItemById(Number(id));
      setItem(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Nie udało się pobrać szczegółów przedmiotu');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadItem();
    }
  }, [id, loadItem]);

  const handleStatusChange = async (newStatus: ItemStatus) => {
    if (!item) return;

    try {
      setUpdatingStatus(true);
      setError(null);
      const updatedItem = await itemApi.updateItemStatus(item.id, newStatus);
      setItem(updatedItem);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Nie udało się zmienić statusu przedmiotu');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusLabel = (status: ItemStatus) => {
    switch (status) {
      case ItemStatus.Available:
        return 'Dostępny';
      case ItemStatus.Borrowed:
        return 'Wypożyczony';
      case ItemStatus.Unavailable:
        return 'Niedostępny';
      default:
        return 'Nieznany';
    }
  };

  const getStatusColor = (status: ItemStatus) => {
    switch (status) {
      case ItemStatus.Available:
        return 'bg-green-100 text-green-800';
      case ItemStatus.Borrowed:
        return 'bg-yellow-100 text-yellow-800';
      case ItemStatus.Unavailable:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isOwner = item && user && item.ownerId === user.id;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-600">Ładowanie...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error || 'Przedmiot nie został znaleziony'}
        </div>
        <button
          onClick={() => navigate('/items')}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Wróć do listy
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => navigate('/items')}
        className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-2"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Wróć do listy
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Photo */}
        <div className="h-96 bg-gray-100 overflow-hidden">
          {item.photoUrl ? (
            <img
              src={item.photoUrl}
              alt={item.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg
                className="w-32 h-32"
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

        {/* Content */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {item.name}
              </h1>
              <p className="text-lg text-gray-600">{item.category}</p>
            </div>
            <span
              className={`text-sm px-3 py-1 rounded-full ${getStatusColor(
                item.status
              )}`}
            >
              {getStatusLabel(item.status)}
            </span>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Opis</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>
          </div>

          {/* Owner info */}
          <div className="border-t border-gray-200 pt-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Właściciel</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {item.ownerAvatarUrl ? (
                  <img
                    src={item.ownerAvatarUrl}
                    alt={item.ownerName}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-lg text-gray-600">
                      {item.ownerName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{item.ownerName}</p>
                  {isOwner && (
                    <p className="text-sm text-gray-500">To Twój przedmiot</p>
                  )}
                </div>
              </div>
              {!isOwner && (
                <button
                  onClick={() => navigate(`/messages?userId=${item.ownerId}`)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                >
                  Wyślij wiadomość
                </button>
              )}
            </div>
          </div>

          {/* Status management for owner */}
          {isOwner && (
            <div className="border-t border-gray-200 pt-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Zarządzaj statusem
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={() => handleStatusChange(ItemStatus.Available)}
                  disabled={
                    updatingStatus || item.status === ItemStatus.Available
                  }
                  className="flex-1 py-2 px-4 border border-green-600 text-green-600 rounded-md hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Dostępny
                </button>
                <button
                  onClick={() => handleStatusChange(ItemStatus.Unavailable)}
                  disabled={
                    updatingStatus || item.status === ItemStatus.Unavailable
                  }
                  className="flex-1 py-2 px-4 border border-red-600 text-red-600 rounded-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Niedostępny
                </button>
              </div>
            </div>
          )}

          {/* Borrow button for non-owners */}
          {!isOwner && item.status === ItemStatus.Available && (
            <div className="border-t border-gray-200 pt-4">
              <button
                onClick={() => setShowBookingModal(true)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700"
              >
                Rezerwuj
              </button>
              {bookingSuccess && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
                  ✅ Rezerwacja wysłana! Czekaj na odpowiedź.
                </div>
              )}
            </div>
          )}

          {/* Unavailable message for non-owners */}
          {!isOwner && item.status !== ItemStatus.Available && (
            <div className="border-t border-gray-200 pt-4">
              <p className="text-center text-gray-600 py-3">
                Ten przedmiot jest obecnie niedostępny
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="border-t border-gray-200 pt-4 mt-6">
            <p className="text-sm text-gray-500">
              Dodano: {new Date(item.createdAt).toLocaleDateString('pl-PL')}
            </p>
            {item.updatedAt !== item.createdAt && (
              <p className="text-sm text-gray-500">
                Zaktualizowano:{' '}
                {new Date(item.updatedAt).toLocaleDateString('pl-PL')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && item && !isOwner && (
        <BookingModal
          itemId={item.id}
          itemName={item.name}
          ownerName={item.ownerName}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => {
            setBookingSuccess(true);
            setTimeout(() => setBookingSuccess(false), 3000);
          }}
        />
      )}
    </div>
  );
}
